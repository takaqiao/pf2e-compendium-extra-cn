/** Chinese display overrides for the native PF2e world clock.
 * i18nInit runs after language files load. Keep this synchronous: Foundry does
 * not await hook listeners, and the clock localizes these keys when rendered.
 */
const CHINESE_LANGS = new Set(['cn', 'zh-cn', 'zh-hans']);
const MONTHS = {
  January: '财商月',
  February: '仇欲月',
  March: '生死月',
  April: '风海月',
  May: '星梦月',
  June: '阳愈月',
  July: '农狩月',
  August: '人文月',
  September: '怒灾月',
  October: '狂噩月',
  November: '魔法月',
  December: '苦暗月',
};

Hooks.once('i18nInit', () => {
  const language = (game.i18n?.lang ?? '').toLowerCase().replaceAll('_', '-');
  if (game.system?.id !== 'pf2e' || !CHINESE_LANGS.has(language)
      || !game.modules.get('pf2e-compendium-extra-cn')?.active
      || !game.modules.get('pf2_cn')?.active) return;

  const translations = game.i18n.translations?.PF2E;
  if (!translations?.WorldClock?.AR?.Months) return;

  // A day is already ordinal-formatted by PF2e; there is no separate suffix
  // argument in 8.5.1. Chinese spell-rank labels also need a bare number.
  translations.OrdinalNumber = '{value}';
  translations.WorldClock.Date = '{year} {era}，{month}{day}日，{weekday}';
  Object.assign(translations.WorldClock.AR.Months, MONTHS);
});
