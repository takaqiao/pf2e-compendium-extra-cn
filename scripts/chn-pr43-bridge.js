const MODULE_ID = 'pf2e-compendium-extra-cn';
const COMPENDIUM_DIR = `modules/${MODULE_ID}/compendium`;
const BABEL_NAMESPACE = 'babele';
const SETTING_LABELS = 'labels';
const SETTING_TITLE_INDEX = 'titleIndex';
const SETTING_LOADING_MODE = 'loadingMode';

/**
 * Bridge for the rewrite landing in pf2e_compendium_chn PR #43.
 *
 * PR #43 moves the chn on-demand state from `babele.__ondemandPatch` to
 * `babele.__pf2eCompendiumChn28`, drops `shareLabels` / `shareTitleIndex` /
 * `registeredModules`, and in lightweight mode (the new default) bypasses
 * babele's native init entirely. Lightweight init only fetches translations
 * from `modules/pf2e_compendium_chn/{zh-CN,compendium}/` — it ignores every
 * `babele.register({module, dir})` call. Without this bridge, our entire
 * compendium would silently disappear once #43 ships.
 *
 * In full mode, babele's native init still runs and our `babele.register`
 * call works as usual, so this bridge is a no-op there. In old chn (without
 * the new state object) this file also no-ops and `babele.js` /
 * `babele-failsafe.js` remain in charge.
 */

function getNewPatchState(babele = game.babele) {
  return babele?.__pf2eCompendiumChn28 ?? null;
}

function isLightweightMode() {
  try {
    return game.settings.get(BABEL_NAMESPACE, SETTING_LOADING_MODE) === 'ondemand';
  } catch (_) {
    return false;
  }
}

async function fetchJson(url) {
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) return null;
    return await res.json();
  } catch (_) {
    return null;
  }
}

function applyLabelsToPacks(labels) {
  if (!labels) return;
  for (const [collection, label] of Object.entries(labels)) {
    const pack = game.packs?.get?.(collection);
    if (!pack || !label) continue;
    pack.metadata.label = label;
    pack.title = label;
  }
}

function mergeTitleIndex(target, extra) {
  const merged = { ...target };
  for (const [packId, entry] of Object.entries(extra ?? {})) {
    const cur = merged[packId];
    if (!cur) {
      merged[packId] = entry;
      continue;
    }
    merged[packId] = {
      folders: { ...(cur.folders ?? {}), ...(entry.folders ?? {}) },
      titles: { ...(cur.titles ?? {}), ...(entry.titles ?? {}) },
    };
  }
  return merged;
}

async function injectExtraIntoState(babele, state) {
  // chn's loadLabels / loadTitleIndex are idempotent (cached on state) and
  // await internal fetches before resolving, unlike polling
  // `lightweightInitialized` which chn sets before its awaits complete.
  try { await babele.loadLabels?.(); } catch (_) {}
  try { await babele.loadTitleIndex?.(); } catch (_) {}

  const [labels, titles] = await Promise.all([
    fetchJson(`${COMPENDIUM_DIR}/labels.json`),
    fetchJson(`${COMPENDIUM_DIR}/titles.json`),
  ]);

  if (labels) {
    state.labels = { ...(state.labels ?? {}), ...labels };
    applyLabelsToPacks(labels);
    if (game.user?.isGM) {
      try { await game.settings.set(BABEL_NAMESPACE, SETTING_LABELS, state.labels); } catch (_) {}
    }
  }

  if (titles) {
    state.titleIndex = mergeTitleIndex(state.titleIndex ?? {}, titles);
    if (game.user?.isGM) {
      try { await game.settings.set(BABEL_NAMESPACE, SETTING_TITLE_INDEX, state.titleIndex); } catch (_) {}
    }
  }
}

async function loadExtraPackTranslation(packId) {
  const direct = await fetchJson(`${COMPENDIUM_DIR}/${encodeURI(packId)}.json`);
  if (!direct) return null;

  if (Array.isArray(direct.reference)) {
    const refs = await Promise.all(
      direct.reference.map((r) => fetchJson(`${COMPENDIUM_DIR}/${encodeURI(r)}.json`)),
    );
    const merged = { ...direct, entries: {}, folders: {} };
    for (const r of [...refs, direct]) {
      if (!r) continue;
      merged.entries = { ...merged.entries, ...(r.entries ?? {}) };
      merged.folders = { ...merged.folders, ...(r.folders ?? {}) };
      merged.label ??= r.label;
      merged.mapping ??= r.mapping;
    }
    return merged;
  }
  return direct;
}

async function importBabeleClass(path, exportName) {
  try {
    const mod = await import(path);
    return mod?.[exportName] ?? null;
  } catch (_) {
    return null;
  }
}

async function ensureBabeleClasses(state) {
  if (!state.MappedCompendium) {
    state.MappedCompendium = await importBabeleClass(
      '/modules/babele/script/compendium/mapped-compendium.js',
      'MappedCompendium',
    );
  }
  if (!state.CompendiumRuntime) {
    state.CompendiumRuntime = await importBabeleClass(
      '/modules/babele/script/compendium/compendium-runtime.js',
      'CompendiumRuntime',
    );
  }
  return !!(state.MappedCompendium && state.CompendiumRuntime);
}

function mergeTranslations(base, override) {
  return {
    ...base,
    ...override,
    label: override.label ?? base.label,
    mapping: override.mapping ?? base.mapping,
    folders: { ...(base.folders ?? {}), ...(override.folders ?? {}) },
    entries: { ...(base.entries ?? {}), ...(override.entries ?? {}) },
  };
}

function wrapEnsurePackTranslationsLoaded(babele) {
  const orig = babele.ensurePackTranslationsLoaded;
  if (typeof orig !== 'function' || orig.__extraBridged) return;

  // Deep-merge semantics: extra entries override chn entries with the same key,
  // chn-only entries are preserved (e.g. equipment-srd has 553 chn-only items
  // we must not lose when extra overrides 5622 of them). This mirrors what
  // babele does natively in full mode via multiple registered sources.
  const wrapped = async function (packId) {
    const state = getNewPatchState(babele);
    if (!state || !packId) return orig.call(babele, packId);

    const cached = state.mappedCompendiums?.get?.(packId);
    if (cached?.__extraBridgeMerged) return cached;

    const extraTranslation = await loadExtraPackTranslation(packId);
    if (!extraTranslation) return orig.call(babele, packId);

    // Force chn to populate state.packTranslations[packId] if it has anything.
    // chn returns null when no translation file is found in its dirs.
    await orig.call(babele, packId);
    const chnTranslation = state.packTranslations?.get?.(packId) ?? null;

    const merged = chnTranslation
      ? mergeTranslations(chnTranslation, extraTranslation)
      : extraTranslation;

    if (!(await ensureBabeleClasses(state))) return orig.call(babele, packId);

    const metadata = game.packs?.get?.(packId)?.metadata ?? null;
    if (!metadata) return orig.call(babele, packId);

    const documentMappings = babele.documentMappings;
    if (!documentMappings?.supports?.(metadata.type)) return orig.call(babele, packId);

    try {
      const mapped = new state.MappedCompendium(metadata, merged, {
        translationStrategies: babele.translationMatchStrategies?.() ?? [],
        documentMappings,
        language: game.settings?.get?.('core', 'language'),
        runtimeFactory: () => new state.CompendiumRuntime({ globalPacks: state.mappedCompendiums }),
      });
      mapped.__extraBridgeMerged = true;
      state.packTranslations?.set?.(packId, merged);
      state.mappedCompendiums?.set?.(packId, mapped);
      return mapped;
    } catch (e) {
      console.warn(`[${MODULE_ID}] Failed to bridge translation for ${packId}`, e);
      return orig.call(babele, packId);
    }
  };
  wrapped.__extraBridged = true;
  babele.ensurePackTranslationsLoaded = wrapped;
}

Hooks.once('ready', async () => {
  const babele = game.babele;
  const state = getNewPatchState(babele);
  if (!state) return;
  if (!isLightweightMode()) return;

  console.log(`[${MODULE_ID}] PR#43 lightweight bridge active`);
  try {
    await injectExtraIntoState(babele, state);
    wrapEnsurePackTranslationsLoaded(babele);
  } catch (e) {
    console.warn(`[${MODULE_ID}] PR#43 bridge failed`, e);
  }
});
