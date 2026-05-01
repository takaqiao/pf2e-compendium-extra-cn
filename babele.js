const MODULE_ID = 'pf2e-compendium-extra-cn';

function isInPatchState(babele) {
  const state = babele?.__ondemandPatch;
  return state?.registeredModules?.some?.((m) => m?.module === MODULE_ID) ?? false;
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
    console.log(`${MODULE_ID} | 合并后的 labels/titles 已写入世界设置（下次启动 babele.init 即可读到）`);
  } catch (e) {
    console.warn(`${MODULE_ID} | shareLabels/shareTitleIndex 写入失败`, e);
  }
}

async function refreshTranslations(babele) {
  if (typeof babele?.loadLabels === 'function') {
    await babele.loadLabels();
    babele.applyLabels?.();
  }
  if (typeof babele?.loadTitleIndex === 'function') {
    await babele.loadTitleIndex();
    babele.applyTitleIndex?.();
  }
  await persistToWorldSettings(babele);
}

Hooks.once('babele.init', (babele) => {
  if (ensureRegistered(babele)) {
    console.log(`${MODULE_ID} | 第三方模组中文翻译已加载 (babele.init)`);
  }
});

Hooks.once('ready', async () => {
  const babele = game.babele;
  if (!ensureRegistered(babele)) {
    if (game.user?.isGM && isInPatchState(babele)) {
      await persistToWorldSettings(babele);
    }
    return;
  }
  console.log(`${MODULE_ID} | 已在 ready 阶段补注册`);
  try {
    await refreshTranslations(babele);
  } catch (e) {
    console.warn(`${MODULE_ID} | 补注册后刷新失败`, e);
  }
});
