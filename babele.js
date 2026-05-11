const MODULE_ID = 'pf2e-compendium-extra-cn';

/**
 * Registration entry point for extra against the legacy chn on-demand patch
 * (state on `babele.__ondemandPatch`). The PR43 chn uses a different state
 * object and is handled in `scripts/chn-pr43-bridge.js`.
 *
 * Why three hooks: chn's patch installs its `babele.register` wrapper
 * *during* the `babele.init` hook, but Foundry fires hook callbacks in
 * registration order — so depending on module load order our
 * `babele.register` call here can run *before* chn's wrapper installs,
 * hit the native method, and never get recorded into
 * `state.registeredModules`. Without that record, the patched
 * `initOnDemand` doesn't know about our `compendium/` directory and the
 * whole compendium silently drops in lightweight mode.
 *
 *  - `babele.init`: primary path. Works in full mode and in ondemand mode
 *    when chn's patch installs before our handler runs.
 *  - `setup`: safety net. The patch is definitely installed by here, and
 *    `initOnDemand` hasn't run yet (it runs at foundry-ready), so a
 *    second register call lands in `state.registeredModules` in time.
 *  - `ready`: final fallback. If we're still missing from the patch
 *    state, register now and re-run `applyRuntimeTranslations` so our
 *    titles/folders actually hit every pack (`applyTitleIndex` alone
 *    only updates state, it doesn't iterate `game.packs`).
 *
 * `babele.register` and `recordTranslationModuleRegistration` both dedupe,
 * so calling register multiple times is safe.
 */

function getPatchState(babele) {
  return babele?.__ondemandPatch ?? null;
}

function isInPatchState(babele) {
  return !!getPatchState(babele)?.registeredModules?.some?.((m) => m?.module === MODULE_ID);
}

function ensureRegistered(babele) {
  if (typeof Babele === 'undefined' || !babele || typeof babele.register !== 'function') return false;
  if (isInPatchState(babele)) return false;
  babele.register({
    module: MODULE_ID,
    lang: 'cn',
    dir: 'compendium',
  });
  return true;
}

async function persistToWorldSettings(babele) {
  if (!game.user?.isGM) return;
  try {
    if (typeof babele?.shareLabels === 'function') await babele.shareLabels();
    if (typeof babele?.shareTitleIndex === 'function') await babele.shareTitleIndex();
  } catch (e) {
    console.warn(`${MODULE_ID} | shareLabels/shareTitleIndex 写入失败`, e);
  }
}

async function reapplyAfterLateRegistration(babele) {
  // Re-read labels/titleIndex so they include our directory after the
  // late register, then ask the patched runtime to re-translate every
  // pack and rebuild the document index. `applyTitleIndex` alone only
  // updates state — it doesn't iterate `game.packs`.
  try {
    await babele.loadLabels?.();
    await babele.loadTitleIndex?.();
    await babele.applyRuntimeTranslations?.({
      shareSources: !!game.user?.isGM,
      notify: false,
      rebuildDocumentIndexNow: true,
    });
  } catch (e) {
    console.warn(`${MODULE_ID} | 补注册后刷新翻译失败`, e);
  }
}

Hooks.once('babele.init', (babele) => {
  if (ensureRegistered(babele)) {
    console.log(`${MODULE_ID} | 第三方模组中文翻译已加载 (babele.init)`);
  }
});

Hooks.once('setup', () => {
  const babele = game.babele;
  if (!babele) return;
  // PR43 chn uses a different state object — leave it to chn-pr43-bridge.js.
  if (!getPatchState(babele)) return;
  if (ensureRegistered(babele)) {
    console.log(`${MODULE_ID} | setup 阶段补注册到 on-demand patch`);
  }
});

Hooks.once('ready', async () => {
  const babele = game.babele;
  if (!babele) return;
  if (!getPatchState(babele)) return;

  if (isInPatchState(babele)) {
    if (game.user?.isGM) await persistToWorldSettings(babele);
    return;
  }
  if (!ensureRegistered(babele)) return;
  console.log(`${MODULE_ID} | ready 阶段补注册`);
  await reapplyAfterLateRegistration(babele);
});
