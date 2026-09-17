import {BOB_APPROVED_SPELL_DISPLAYS} from './bob-approved-spell-displays.mjs';
import {BOB_CHINESE_LANGS, isBobActive} from './bob-i18n-core.mjs';
import {installBobSpellDisplay} from './bob-spell-display-core.mjs';

let installation = null;
const supported = () => isBobActive(game) && game.version === '14.368'
  && game.system.version === '8.5.1' && BOB_CHINESE_LANGS.includes(game.i18n.lang)
  && game.modules.get('pf2e-bastion-of-blasphemies')?.version === '1.0.0'
  && game.modules.get('babele')?.active === true && game.modules.get('babele')?.version === '2.9.1'
  && game.modules.get('pf2_cn')?.active === true && game.modules.get('pf2_cn')?.version === '2.5.1';

export function isBobSpellDisplayReady() {
  return installation?.isActive() === true && supported();
}

export function disposeBobSpellDisplay() {
  installation?.();
  installation = null;
}

// Foundry materializes queued native sheet registrations before ready. This
// display-only installer does not mutate prepared data or Babele translations.
Hooks.once('ready', () => {
  if (!supported()) return;
  const nativeClasses = entries => [...new Set(Object.entries(entries ?? {})
    .filter(([key]) => key.startsWith('pf2e.')).map(([, entry]) => entry.cls))];
  const SpellSheetClasses = nativeClasses(CONFIG.Item.sheetClasses.spell);
  const ActorSheetClasses = [...new Set(Object.values(CONFIG.Actor.sheetClasses).flatMap(nativeClasses))];
  if (!SpellSheetClasses.length || !ActorSheetClasses.length) throw new Error('Native PF2e spell display sheets are unavailable.');
  installation = installBobSpellDisplay({
    SpellClass: CONFIG.PF2E.Item.documentClasses.spell, SpellSheetClasses, ActorSheetClasses, Hooks,
    bindings: BOB_APPROVED_SPELL_DISPLAYS, isEnabled: supported,
    localize: key => game.i18n.localize(key), format: (key, values) => game.i18n.format(key, values)
  });
});
