const MODULE_ID = 'pf2e-compendium-extra-cn';
let registered = false;

function isAlreadyRegistered(babele) {
  const state = babele?.__ondemandPatch;
  const inState = state?.registeredModules?.some?.((m) => m?.module === MODULE_ID);
  const inModules = babele?.modules?.some?.((m) => m?.module === MODULE_ID);
  return Boolean(inState || inModules);
}

function registerTranslation(babele) {
  if (registered) return false;
  if (typeof Babele === 'undefined' || !babele || typeof babele.register !== 'function') return false;
  if (isAlreadyRegistered(babele)) {
    registered = true;
    return false;
  }
  babele.register({
    module: MODULE_ID,
    lang: 'cn',
    dir: 'compendium',
  });
  registered = true;
  console.log(`${MODULE_ID} | 第三方模组中文翻译已加载`);
  return true;
}

Hooks.once('babele.init', (babele) => {
  registerTranslation(babele);
});

Hooks.once('ready', async () => {
  const babele = game.babele;
  const wasLate = !registered;
  if (!registerTranslation(babele) && !wasLate) return;
  if (!wasLate) return;
  try {
    if (typeof babele?.loadLabels === 'function') {
      await babele.loadLabels();
      babele.applyLabels?.();
    }
    if (typeof babele?.loadTitleIndex === 'function') {
      await babele.loadTitleIndex();
      babele.applyTitleIndex?.();
    }
    console.log(`${MODULE_ID} | 已在 ready 阶段补注册并刷新标签`);
  } catch (e) {
    console.warn(`${MODULE_ID} | 补注册后刷新失败`, e);
  }
});
