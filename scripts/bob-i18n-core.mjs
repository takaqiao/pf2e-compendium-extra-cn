export const BOB_MODULE_ID = 'pf2e-bastion-of-blasphemies';
export const BOB_EXTRA_ID = 'pf2e-compendium-extra-cn';
// These are valid Intl language tags, as required by Foundry's package schema.
export const BOB_CHINESE_LANGS = Object.freeze(['cn', 'zh-CN', 'zh-Hans']);
const SPECIAL_ITEMS = ['soulhearts', 'artworks', 'gears', 'remnants'];

export function isBobActive(game) {
  return game?.system?.id === 'pf2e'
    && game.modules.get(BOB_MODULE_ID)?.active === true
    && game.modules.get(BOB_EXTRA_ID)?.active === true;
}

/** Register only this module's language resources before native i18n initialization. */
export function registerBobLanguages(game, path) {
  if (!isBobActive(game)) return;
  const languages = game.modules.get(BOB_EXTRA_ID).languages;
  for (const lang of BOB_CHINESE_LANGS) {
    if ([...languages].some(entry => entry.lang === lang && entry.path === path)) continue;
    languages.add({lang, name: '简体中文', path, system: 'pf2e', module: BOB_MODULE_ID, flags: {}});
  }
}

/** Refresh only the eight cached display properties; no campaign data is updated. */
export function refreshBobSchemaLabels(game) {
  if (!isBobActive(game) || !BOB_CHINESE_LANGS.includes(game.i18n.lang)) return;
  const CampaignData = game.settings.settings.get(`${BOB_MODULE_ID}.campaign`)?.type;
  const fields = CampaignData?.schema?.fields?.specialItems?.fields;
  const labels = game.i18n.translations.BASTION?.Manager?.FIELDS?.specialItems;
  if (!fields || !labels) throw new Error('BoB campaign schema or Chinese special-item translations are unavailable.');
  // Validate the complete narrow display surface before making any changes.
  for (const id of SPECIAL_ITEMS) {
    if (!fields[id] || typeof labels[id]?.label !== 'string' || typeof labels[id]?.hint !== 'string') {
      throw new Error(`BoB special-item display metadata is incomplete: ${id}.`);
    }
  }
  for (const id of SPECIAL_ITEMS) {
    fields[id].label = labels[id].label;
    fields[id].hint = labels[id].hint;
  }
}
