const EXTRA_ID = 'pf2e-compendium-extra-cn';
const STYLISH_SHOP_ID = 'stylish-shop';
const languagePath = new URL('../lang/external/stylish-shop.json', import.meta.url).href;

// zzz_mod_chn ships most Stylish Shop Chinese strings. Foundry merges module language files
// in game.modules order, so zzz_mod_chn loads after Extra and keeps its own wording;
// this file only carries keys zzz_mod_chn does not have. Rewording a zzz key goes in
// stylish-shop-overrides.json, which inject-lang.js merges at i18nInit.
Hooks.once('init', () => {
  const system = game.system?.id;
  const extra = game.modules.get(EXTRA_ID);
  if (!['pf2e', 'sf2e'].includes(system) || !extra?.active
      || !game.modules.get(STYLISH_SHOP_ID)?.active) return;

  for (const lang of ['cn', 'zh-CN', 'zh-Hans']) {
    if ([...extra.languages].some(entry => entry.lang === lang && entry.path === languagePath
        && entry.module === STYLISH_SHOP_ID)) continue;
    extra.languages.add({lang, name: '简体中文', path: languagePath,
      system, module: STYLISH_SHOP_ID, flags: {}});
  }
});
