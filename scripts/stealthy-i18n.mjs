import './stealthy-effect-display.mjs';

const EXTRA_ID = 'pf2e-compendium-extra-cn';
const STEALTHY_ID = 'pf2e-stealthy';
const languagePath = new URL('../lang/external/pf2e-stealthy.json', import.meta.url).href;

// Native localization waits for these files before Stealthy caches setting labels in setup.
Hooks.once('init', () => {
  const system = game.system?.id;
  const extra = game.modules.get(EXTRA_ID);
  if (!['pf2e', 'sf2e'].includes(system) || !extra?.active
      || !game.modules.get(STEALTHY_ID)?.active) return;

  for (const lang of ['cn', 'zh-CN', 'zh-Hans']) {
    if ([...extra.languages].some(entry => entry.lang === lang && entry.path === languagePath
        && entry.module === STEALTHY_ID)) continue;
    extra.languages.add({lang, name: '简体中文', path: languagePath,
      system, module: STEALTHY_ID, flags: {}});
  }
});
