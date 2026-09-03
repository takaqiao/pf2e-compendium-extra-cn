const MODULE_ID = 'pf2e-compendium-extra-cn';
const CHN_MODULE_ID = 'pf2e_compendium_chn';

// Mirrored from chn 2.9.7's `registerTranslationSources` so we can compensate
// when chn's own babele.init handler skips registration (see comment below).
// Source: https://github.com/AlphaStarguide/pf2e_compendium_chn/blob/main/babele.js
const CHN_LANG_ALIASES = ['cn', 'zh-CN', 'zh_Hans', 'zh-Hans'];
const CHN_DIRS = ['zh-CN', 'compendium'];

/**
 * Registration entry point for extra against the legacy chn on-demand patch
 * (state on `babele.__ondemandPatch`). PR43 chn uses a different state object
 * and is handled in `scripts/chn-pr43-bridge.js`.
 *
 * Two distinct timing problems we have to work around — both in chn 2.9.7:
 *
 * 1) Our own registration races chn's `babele.register` wrapper install.
 *    chn-patch installs the recording wrapper inside its `babele.init`
 *    handler, but hook callbacks fire in registration order. Depending on
 *    module load order our `babele.register` call here can hit the native
 *    method and never get recorded into `state.registeredModules`. Without
 *    that record, the patched `initOnDemand` doesn't know about extra's
 *    `compendium/` directory and our translations silently drop.
 *
 * 2) chn 2.9.7 skips its OWN registration in both modes. Its babele.js
 *    only calls `babele.register` when `game.settings.get('babele',
 *    'loadingMode') === 'full'`, but chn's patch registers that setting
 *    in a `Hooks.once('init', ...)` callback that runs AFTER babele's
 *    init handler fires `Hooks.callAll('babele.init')` (babele loads
 *    before chn, so babele's init handler fires first). The setting
 *    read throws/returns undefined, `currentLoadingMode()` falls back
 *    to ONDEMAND, registerTranslationSources is skipped. Net effect:
 *    chn never lands in `state.registeredModules` or babele's native
 *    sourceRegistry. Full mode → native init has no chn source → chn
 *    translations don't apply at all. Ondemand mode → state.registered-
 *    Modules has no chn dirs → initOnDemand can't fetch chn's labels/
 *    titles/pack jsons either. We can't change chn, so we register chn
 *    on its behalf using its known config.
 *
 * Three hooks, idempotent at every level (state.registeredModules dedupes
 * by JSON, native sourceRegistry dedupes by source name):
 *
 *  - `babele.init`: primary path. chn-patch installs before our handler
 *    runs (chn loads before extra), so `babele.register` is the recording
 *    wrapper by the time we call it. Both extra and the chn-compensation
 *    registrations land in state.registeredModules + sourceRegistry.
 *  - `setup`: safety net. Catches the edge case where chn-patch hadn't
 *    installed yet during our babele.init handler. By setup the patch is
 *    always installed and the patched `babele.init()` (which locks
 *    sourceRegistry in full mode) hasn't run yet — it runs at foundry-
 *    ready, so register is still safe.
 *  - `ready`: final fallback (ondemand only — full mode locks
 *    sourceRegistry after `babele.init()`). If we're still missing,
 *    register and call `babele.applyRuntimeTranslations({rebuildDocument-
 *    IndexNow})` so the late registration actually re-translates every
 *    pack (`applyTitleIndex` alone only updates state; it doesn't
 *    iterate `game.packs`).
 */

function getPatchState(babele) {
  return babele?.__ondemandPatch ?? null;
}

function isInPatchState(babele, moduleId) {
  return !!getPatchState(babele)?.registeredModules?.some?.((m) => m?.module === moduleId);
}

function ensureExtraRegistered(babele) {
  if (typeof Babele === 'undefined' || !babele || typeof babele.register !== 'function') return false;
  if (isInPatchState(babele, MODULE_ID)) return false;
  babele.register({
    module: MODULE_ID,
    lang: 'cn',
    dir: 'compendium',
  });
  return true;
}

function ensureChnRegistered(babele) {
  if (!babele || typeof babele.register !== 'function') return false;
  // No patch state → chn module isn't loaded (or its patch failed to install);
  // either way, this compensation is meaningless and we shouldn't register on
  // chn's behalf into a babele where chn's converters etc. aren't even there.
  if (!getPatchState(babele)) return false;
  if (isInPatchState(babele, CHN_MODULE_ID)) return false;
  for (const lang of CHN_LANG_ALIASES) {
    babele.register({ module: CHN_MODULE_ID, lang, dirs: CHN_DIRS });
  }
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
  // Re-read labels/titleIndex so they include all newly-registered directories,
  // then ask the patched runtime to re-translate every pack and rebuild the
  // document index. `applyTitleIndex` alone only updates state — it doesn't
  // iterate `game.packs`, so titles would stay English without this step.
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
  if (ensureChnRegistered(babele)) {
    console.log(`${MODULE_ID} | 代 chn 注册翻译源 (babele.init) — chn 2.9.7 自身的 loadingMode 时序 bug 跳过了注册`);
  }
  if (ensureExtraRegistered(babele)) {
    console.log(`${MODULE_ID} | 第三方模组中文翻译已加载 (babele.init)`);
  }
});

Hooks.once('setup', () => {
  const babele = game.babele;
  if (!babele || !getPatchState(babele)) return;
  if (ensureChnRegistered(babele)) {
    console.log(`${MODULE_ID} | setup 阶段代 chn 补注册`);
  }
  if (ensureExtraRegistered(babele)) {
    console.log(`${MODULE_ID} | setup 阶段补注册 extra 到 on-demand patch`);
  }
});

Hooks.once('ready', async () => {
  const babele = game.babele;
  if (!babele || !getPatchState(babele)) return;

  // Full mode locks the source registry after `babele.init()` runs (which
  // happens earlier in foundry-ready, before our hook). If chn/extra somehow
  // missed both prior hooks, there's nothing useful we can do in full mode —
  // attempting babele.register would throw `#assertConfigurable`. Only the
  // ondemand path leaves the state mutable here.
  const missingChn = !isInPatchState(babele, CHN_MODULE_ID);
  const missingExtra = !isInPatchState(babele, MODULE_ID);
  if (!missingChn && !missingExtra) {
    if (game.user?.isGM) await persistToWorldSettings(babele);
    return;
  }

  let changed = false;
  try {
    if (ensureChnRegistered(babele)) {
      console.log(`${MODULE_ID} | ready 阶段代 chn 补注册`);
      changed = true;
    }
    if (ensureExtraRegistered(babele)) {
      console.log(`${MODULE_ID} | ready 阶段补注册 extra`);
      changed = true;
    }
  } catch (e) {
    console.warn(`${MODULE_ID} | ready 阶段补注册失败（全量模式下 source registry 已锁定？）`, e);
    return;
  }
  if (changed) await reapplyAfterLateRegistration(babele);
});

/**
 * Guarantee that THIS module wins wherever it shares a collection with another
 * translation source.
 *
 * Why this is needed at all: babele merges the files that target one collection with
 * `CompendiumTranslation.merge()`, which is a **shallow spread of `entries`**. For an
 * Adventure pack that is all-or-nothing - `pf2e-abomination-vaults.av` has exactly one
 * entry key ("Abomination Vaults"), so whichever file loads last replaces the other
 * outright. Measured against the installed 4.1.3 pack: our file binds 100% of 4,534
 * documents, `pf2e_compendium_chn`'s binds 32% (its journals target a different AV
 * release). Losing the race silently swaps the good one for the thin one.
 *
 * Ordering used to be implied by registration order, and the `ensureChnRegistered`
 * compensation above happened to register chn first. chn 3.x registers itself
 * unconditionally, so that no longer holds and the order is now whatever esmodule
 * evaluation gives. Rather than assume, assert.
 *
 * `orderedSourcesFor` (translation-source-discovery.js) sorts UNRANKED sources first and,
 * among ranked ones, by ascending index - so the LAST name in the priority array is the
 * one that wins the merge.
 *
 * Idempotent: if we are already last, nothing is written.
 */
Hooks.once('ready', async () => {
  if (!game.user?.isGM) return;
  const babele = game.babele;
  if (!babele || typeof babele.setSourcePriority !== 'function') return;

  const me = `module:${MODULE_ID}:cn`;
  let overlaps = [];
  try {
    const diagnostics = await babele.sourceDiagnostics?.();
    overlaps = diagnostics?.translation?.overlaps ?? [];
  } catch (e) {
    console.warn(`${MODULE_ID} | 无法读取 babele 源诊断，跳过优先级断言`, e);
    return;
  }

  for (const overlap of overlaps) {
    const names = (overlap?.sources ?? []).map((s) => (typeof s === 'string' ? s : s?.name)).filter(Boolean);
    if (!names.includes(me) || names[names.length - 1] === me) continue;
    const ordered = [...names.filter((n) => n !== me), me];
    try {
      await babele.setSourcePriority(overlap.collection, ordered);
      console.warn(
        `${MODULE_ID} | ${overlap.collection}：本模组原本不是最后加载的翻译源，` +
        `已改为 ${ordered.join(' < ')}（babele 浅合并，最后加载者整包胜出）`,
      );
    } catch (e) {
      console.warn(`${MODULE_ID} | 设置 ${overlap.collection} 的源优先级失败`, e);
    }
  }
});
