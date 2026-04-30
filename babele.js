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

function refreshUI() {
  try {
    ui.sidebar?.render?.(true);
  } catch {}
  try {
    const windows = ui.windows ?? {};
    for (const app of Object.values(windows)) {
      const name = app?.constructor?.name ?? '';
      if (name.includes('Compendium') || name.includes('Sidebar')) {
        app.render?.(true);
      }
    }
  } catch {}
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
  refreshUI();
}

Hooks.once('babele.init', (babele) => {
  if (ensureRegistered(babele)) {
    console.log(`${MODULE_ID} | 第三方模组中文翻译已加载 (babele.init)`);
  }
});

Hooks.once('ready', async () => {
  const babele = game.babele;
  if (!ensureRegistered(babele)) return;
  console.log(`${MODULE_ID} | 已在 ready 阶段补注册`);
  try {
    await refreshTranslations(babele);
    console.log(`${MODULE_ID} | labels/titles 已刷新并触发 UI 重渲染`);
  } catch (e) {
    console.warn(`${MODULE_ID} | 补注册后刷新失败`, e);
  }
});
