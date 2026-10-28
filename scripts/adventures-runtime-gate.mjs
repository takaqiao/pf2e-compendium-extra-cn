export function adventuresEnabled(game) {
  try {
    return ['pf2e', 'sf2e'].includes(game.system?.id)
      && ['cn', 'zh-CN', 'zh_Hans', 'zh-Hans'].includes(game.i18n?.lang)
      && game.modules.get('pf2e-team-plus-adventures')?.active === true
      && game.modules.get('pf2e-compendium-extra-cn')?.active === true
      && ['full', 'ondemand'].includes(game.settings.get('babele', 'loadingMode'));
  } catch { return false; }
}
