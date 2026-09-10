/** Private candidate for Babele 2.9.1. No automatic hooks or registration. */
export const TARGET_PACK = 'battlezoo-bestiary-pf2e.pf2e-battlezoo-bestiary';
export const CONVERTER_NAME = 'battlezoo-basic-scoped-items';
const installations = new WeakMap();
const DISPLAY_PATHS = ['name', 'system.description.value'];

function isTarget(context) {
  const pack = context.contextCompendium ?? context.runtime?.currentCompendium?.();
  return pack?.metadata?.id === TARGET_PACK && pack.metadata.type === 'Actor'
    && ['npc', 'hazard'].includes(context.source?.type)
    && context.path === 'items' && context.params?.path === 'items'
    && context.params.documentType === 'Item' && context.params.cardinality === 'many';
}

function byIdentity(items, label, expected = null) {
  if (!Array.isArray(items)) throw new TypeError(`${label}: item identity collection must be an array`);
  const indexed = new Map();
  for (const item of items) {
    if (typeof item?._id !== 'string' || !item._id || typeof item.type !== 'string' || !item.type
      || indexed.has(item._id)) throw new TypeError(`${label}: missing or duplicate item _id/type identity`);
    if (expected && expected.get(item._id)?.type !== item.type) {
      throw new TypeError(`${label}: unknown item identity or changed type for ${item._id}`);
    }
    indexed.set(item._id, item);
  }
  if (expected && indexed.size !== expected.size) throw new TypeError(`${label}: incomplete item identity set`);
  return indexed;
}

/** Dependencies are existing registered objects, not replacements for either. */
export function createBasicItemsConverter({native, legacy}) {
  return {
    prepare(context) {
      return isTarget(context) ? native.prepare(context) : undefined;
    },
    extract(context) {
      return isTarget(context) ? native.extract(context) : undefined;
    },
    translate(context) {
      if (!isTarget(context)) return context.value;
      const {deepClone: clone, getProperty: get, setProperty: set} = foundry.utils;
      const sourceById = byIdentity(context.value, 'source');
      const nameCounts = new Map();
      for (const source of sourceById.values()) nameCounts.set(source.name, (nameCounts.get(source.name) ?? 0) + 1);

      // Use the actual prepared Item mapping and identity resolution. Never
      // select a local entry by array position, and do not broadcast a name key.
      const localPack = native.prepare(context).contextPack;
      const entries = localPack.translations;
      const candidatesById = new Map();
      const identityOwners = new Map();
      for (const source of sourceById.values()) {
        const candidates = localPack.mapping.matchKeyCandidates(source);
        candidatesById.set(source._id, candidates);
        const sourceId = foundry.utils.parseUuid(source.flags?.core?.sourceId || source._stats?.compendiumSource)?.id;
        // Reserve explicit identities across the whole source collection, even
        // when another item's unique name spells the same key. Include any
        // additional non-name identities resolved by the actual Item mapping.
        for (const key of new Set([source._id, sourceId, ...candidates.filter(key => key !== source.name)])) {
          if (!key) continue;
          if (!identityOwners.has(key)) identityOwners.set(key, new Set());
          identityOwners.get(key).add(source._id);
        }
      }
      const displays = new Map();
      for (const source of sourceById.values()) {
        // Keep Babele's candidate order, but skip unsafe hits instead of losing
        // a later unambiguous sourceId. An explicit key with multiple owners
        // is also ambiguous; an unrelated name never acquires that key.
        const key = candidatesById.get(source._id).find(candidate => {
          if (!Object.hasOwn(entries, candidate) || !entries[candidate]) return false;
          const owners = identityOwners.get(candidate);
          return owners ? owners.size === 1 && owners.has(source._id)
            : candidate === source.name && nameCounts.get(source.name) === 1;
        });
        const entry = key === undefined ? {} : clone(entries[key]);
        const payload = localPack.mapping.map(clone(source), entry, context.runtime);
        const display = new Map();
        for (const path of DISPLAY_PATHS) {
          // FieldMapping skips null/undefined, absent paths and invalid types;
          // empty strings and explicit strings equal to EN remain meaningful.
          const value = get(payload, path);
          if (typeof get(source, path) === 'string' && typeof value === 'string') display.set(path, value);
        }
        displays.set(source._id, display);
      }

      // A fresh per-document scope prevents the prepared inline-entry cache
      // from contaminating the no-inline native source/generic fallback pass.
      const runtime = typeof context.runtime?.runtime === 'function' ? context.runtime.runtime() : context.runtime;
      const nativeOutput = native.translate({...context,
        value: clone(context.value), source: clone(context.source),
        translation: {}, allTranslations: {...clone(context.allTranslations), items: {}}, runtime,
      });
      const nativeById = byIdentity(nativeOutput, 'native result', sourceById);
      const needsFallback = [...sourceById.values()].filter(source => DISPLAY_PATHS.some(path =>
        typeof get(source, path) === 'string' && !displays.get(source._id).has(path)));
      let legacyById = new Map();
      if (needsFallback.length) {
        const legacySource = clone(context.source);
        const legacyValues = clone(needsFallback);
        legacySource.items = legacyValues;
        // No local entries go through legacy's different name/prefix matcher.
        const legacyOutput = legacy.translate({...context, value: legacyValues,
          source: legacySource, translation: {}, allTranslations: {},
        });
        legacyById = byIdentity(legacyOutput, 'legacy result', byIdentity(needsFallback, 'fallback source'));
      }

      return [...sourceById.values()].map(source => {
        const output = clone(nativeById.get(source._id));
        const display = displays.get(source._id);
        const fallback = legacyById.get(source._id);
        for (const path of DISPLAY_PATHS) {
          const original = get(source, path);
          if (typeof original !== 'string') continue;
          const oldDisplay = get(fallback, path);
          if (!display.has(path) && typeof oldDisplay === 'string'
            && (oldDisplay !== original || nameCounts.get(source.name) > 1)) set(output, path, oldDisplay);
          if (display.has(path)) set(output, path, display.get(path));
        }
        return output;
      });
    },
  };
}

/** Call only after core converters are available, before the target is mapped.
 * This registers one unique name; it never changes any default mapping.
 */
export function registerBasicScopedItems(babele, {version} = {}) {
  if (version !== '2.9.1') throw new Error('Basic scoped items requires verified Babele version 2.9.1');
  const registry = babele?.converterRegistry;
  const current = registry?.named(CONVERTER_NAME);
  const installed = installations.get(babele);
  if (installed && current === installed) return installed;
  if (current || installed) throw new Error('Basic scoped items converter collision; existing entry is not replaced');
  const native = registry?.named('document');
  const legacy = registry?.named('npc-item-translation');
  if (!native?.prepare || !native?.extract || !native?.translate || !legacy?.translate || !babele?.registerConverters) {
    throw new Error('Basic scoped items requires ready native document and core NPC converters');
  }
  const converter = createBasicItemsConverter({native, legacy});
  babele.registerConverters({[CONVERTER_NAME]: converter});
  installations.set(babele, converter);
  return converter;
}
