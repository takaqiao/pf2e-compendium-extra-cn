const CONVERTER = 'sog-source-text';
const ITEMS_CONVERTER = 'sog-source-items';
const PACKS = ['pf2e.season-of-ghosts-bestiary', 'pf2e.bastion-of-blasphemies-bestiary'];
const PRIORITY_WRAPPER = Symbol('sog-source-priority');

// Kept for the PR43 bridge, whose pack URLs also use the unified directory.
export function sogTranslationDirectory() {
  return 'compendium';
}

/** Select only the changed field; mixed and future documents keep their other translations. */
export function createSogSourceTextConverter(onUnknown) {
  return {
    extract({value}) {
      return typeof value === 'string' ? value : undefined;
    },
    translate(context) {
      const {value, translation} = context;
      if (typeof value !== 'string') return undefined;
      // A later user source can still replace the field with an ordinary string.
      if (typeof translation === 'string') return translation;
      if (!Array.isArray(translation?.sources)) return undefined;
      const match = translation.sources.find(pair => Array.isArray(pair)
        && pair[0] === value && typeof pair[1] === 'string');
      if (!match) onUnknown?.(context);
      return match?.[1];
    },
  };
}

function createSogItemsConverter(documentConverter, unknownDescriptions) {
  return {
    prepare: context => documentConverter.prepare(context),
    extract: context => documentConverter.extract(context),
    translate(context) {
      const {contextPack} = documentConverter.prepare(context);
      const unknown = new Map();
      // EmbeddedCompendium's delegate shares this mapping, not its wrapper identity.
      unknownDescriptions.set(contextPack.mapping, unknown);
      try {
        const translated = documentConverter.translate(context);
        // Restore only fields declined by our converter in this embedded pack.
        // User strings and conditional mappings never enter this collection.
        return translated.map(item => !unknown.has(item._id) ? item : {
          ...item, system: {...item.system, description: {...item.system.description, value: unknown.get(item._id)}},
        });
      } finally {
        unknownDescriptions.delete(contextPack.mapping);
      }
    },
  };
}

/** Old CHN and Published lists bypass Babele's source-priority ordering. */
export function orderSogTranslationFiles(files, babele, game = globalThis.game) {
  if (!Array.isArray(files) || typeof babele?.sourcePriority !== 'function') return files;
  try {
    const language = game.settings.get('core', 'language') ?? game.i18n?.lang;
    if (game.system?.id !== 'pf2e' || !/^(?:cn|zh(?:[-_]|$))/i.test(language ?? '')
      || !game.modules?.get('pf2e-compendium-extra-cn')?.active) return files;
    const config = babele.sourcePriority();
    const directory = game.settings.get('babele', 'directory')?.trim?.().replace(/\/$/, '');
    let result = files;
    for (const pack of PACKS) {
      const order = config?.collections?.[pack] ?? config?.global;
      if (!Array.isArray(order) || !order.length) continue;
      const slots = [], rows = [];
      for (let index = 0; index < result.length; index++) {
        const row = result[index], path = (typeof row === 'string' ? row : row?.file)?.replace(/^\//, '');
        if (!path?.endsWith(`/${pack}.json`)) continue;
        const module = /^modules\/([^/]+)\//.exec(path)?.[1];
        const source = module ? `module:${module}:${language}`
          : directory && path === `${directory}/${language}/${pack}.json` ? 'directory' : null;
        if (!source) return files;
        slots.push(index);
        rows.push({row, index, rank: order.indexOf(source)});
      }
      const sorted = [...rows].sort((a, b) => a.rank - b.rank || a.index - b.index);
      if (sorted.every((row, index) => row === rows[index])) continue;
      result = [...result];
      slots.forEach((slot, index) => {result[slot] = sorted[index].row;});
    }
    return result;
  } catch (error) {
    console.warn('pf2e-compendium-extra-cn | SoG source priority unavailable', error);
    return files;
  }
}

export function refreshOnDemandSogSources(babele) {
  const state = babele?.__ondemandPatch;
  if (!state) return;
  if (Array.isArray(state.translationFilesCache)) {
    state.translationFilesCache = orderSogTranslationFiles(state.translationFilesCache, babele);
  }
  for (const pack of PACKS) {
    const files = state.packTranslationUrls?.get?.(pack);
    if (Array.isArray(files)) state.packTranslationUrls.set(pack, orderSogTranslationFiles(files, babele));
  }
}

export function installOnDemandSogGuard(babele) {
  if (!babele?.__ondemandPatch) return false;
  const descriptor = Object.getOwnPropertyDescriptor(babele, 'ensurePackTranslationsLoaded');
  const original = descriptor?.value;
  if (typeof original !== 'function' || !descriptor.writable || original[PRIORITY_WRAPPER]) return false;
  function ensurePackTranslationsLoaded(...args) {
    refreshOnDemandSogSources(babele);
    return Reflect.apply(original, this, args);
  }
  Object.defineProperty(ensurePackTranslationsLoaded, PRIORITY_WRAPPER, {value: true});
  Object.defineProperty(babele, 'ensurePackTranslationsLoaded', {...descriptor, value: ensurePackTranslationsLoaded});
  return true;
}

export function installPublishedSogGuard(PublishedTranslationSource) {
  const prototype = PublishedTranslationSource?.prototype;
  const descriptor = prototype && Object.getOwnPropertyDescriptor(prototype, 'translationFiles');
  const original = descriptor?.value;
  if (typeof original !== 'function' || !descriptor.writable || original[PRIORITY_WRAPPER]) return false;
  function translationFiles(...args) {
    const result = Reflect.apply(original, this, args);
    const order = files => orderSogTranslationFiles(files, globalThis.game?.babele);
    return typeof result?.then === 'function' ? result.then(order) : order(result);
  }
  Object.defineProperty(translationFiles, PRIORITY_WRAPPER, {value: true});
  Object.defineProperty(prototype, 'translationFiles', {...descriptor, value: translationFiles});
  return true;
}

export function registerSogSourceFields(babele) {
  if (typeof babele?.registerConverters !== 'function'
    || typeof babele.converterRegistry?.named !== 'function') return false;
  const registry = babele.converterRegistry;
  const unknownDescriptions = new WeakMap();
  const converters = {};
  if (!registry.named(CONVERTER)) converters[CONVERTER] = createSogSourceTextConverter(context => {
    if (context.path === 'system.description.value') {
      unknownDescriptions.get(context.contextCompendium?.mapping)?.set(context.source._id, context.value);
    }
  });
  const document = registry?.named('document');
  if (!registry?.named(ITEMS_CONVERTER)
    && ['prepare', 'extract', 'translate'].every(method => typeof document?.[method] === 'function')) {
    converters[ITEMS_CONVERTER] = createSogItemsConverter(document, unknownDescriptions);
  }
  if (!Object.keys(converters).length) return false;
  babele.registerConverters(converters);
  return true;
}
