const MODULE_ID = 'pf2e-compendium-extra-cn';

/**
 * Two fail-safes against stale Babele state caused by other modules in the chain:
 *
 * 1. `pf2e_compendium_chn` wraps `babele.init` but its wrapper drops arguments,
 *    so `babele.reinitialize()` (which passes `{reload:true}`) silently no-ops
 *    and the session keeps serving the snapshot taken at first init. We re-wrap
 *    `babele.init` to forward args, and route the reload path straight to the
 *    saved original init so neither wrapper can swallow it.
 *
 * 2. After translation files change on disk, browser HTTP cache + Foundry
 *    server ETag may keep returning 304 even after a normal page reload, so
 *    Babele initializes off the stale json. On `ready` we sample-compare a
 *    pack against what Babele actually loaded; on mismatch we prime the cache
 *    with `cache: 'reload'` and rebuild the session.
 */

const SAMPLE_PACKS = [
  'pf2e-secrets-of-grayce.secrets-of-grayce',
  'pf2e.troubles-in-grayce-bestiary',
  'pf2e.menace-under-otari-bestiary',
];

function isPr43Active(babele) {
  return !!babele?.__pf2eCompendiumChn28;
}

Hooks.once('babele.init', (babele) => {
  if (isPr43Active(babele)) return;
  const patchedInit = babele.init;
  const originalInit = babele.__ondemandPatch?.original?.init;
  if (!originalInit || !patchedInit || patchedInit === originalInit) return;

  babele.init = async (opts = {}, ...rest) => {
    if (opts?.reload) return originalInit(opts, ...rest);
    return patchedInit(opts, ...rest);
  };
});

Hooks.once('ready', async () => {
  const babele = game.babele;
  if (!babele) return;
  if (isPr43Active(babele)) return;
  if (!babele.initialized) {
    try { await babele.init(); } catch { return; }
  }

  let stale = false;
  for (const collection of SAMPLE_PACKS) {
    if (await sessionStaleFor(babele, collection)) { stale = true; break; }
  }
  if (!stale) return;

  console.warn(`[${MODULE_ID}] Babele session is stale; rebuilding`);
  await primeFreshCacheForOurDir().catch(() => {});

  const originalInit = babele.__ondemandPatch?.original?.init;
  try {
    if (originalInit) await originalInit({ reload: true });
    else await babele.reinitialize?.();
    console.log(`[${MODULE_ID}] Babele session rebuilt`);
  } catch (err) {
    console.warn(`[${MODULE_ID}] Babele rebuild failed`, err);
  }
});

async function sessionStaleFor(babele, collection) {
  const url = `modules/${MODULE_ID}/compendium/${encodeURI(collection)}.json`;
  let fileEntries;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return false;
    const data = await res.json();
    fileEntries = data?.entries;
  } catch {
    return false;
  }
  if (!fileEntries) return false;

  const mp = babele.translatedCompendiumFor?.(collection);
  const sessionEntries = mp?.translation?.entries;
  if (!sessionEntries) return true;

  return entriesShapeSignature(fileEntries) !== entriesShapeSignature(sessionEntries);
}

function entriesShapeSignature(entries) {
  if (!entries) return '';
  const keys = Array.isArray(entries)
    ? entries.map(e => e?.id ?? e?.name).filter(Boolean).sort()
    : Object.keys(entries).sort();
  if (!keys.length) return '';

  const firstEntry = Array.isArray(entries)
    ? entries.find(e => (e.id ?? e.name) === keys[0])
    : entries[keys[0]];
  const innerKeys = firstEntry && typeof firstEntry === 'object'
    ? Object.keys(firstEntry).sort().join('|')
    : '';
  return `${keys.length}::${keys[0]}::${innerKeys}`;
}

async function primeFreshCacheForOurDir() {
  const dir = `modules/${MODULE_ID}/compendium`;
  const browse = await foundry.applications.apps.FilePicker.browse('data', dir);
  await Promise.all((browse.files ?? [])
    .filter(f => f.endsWith('.json'))
    .map(f => fetch(f, { cache: 'reload' }).catch(() => {})));
}
