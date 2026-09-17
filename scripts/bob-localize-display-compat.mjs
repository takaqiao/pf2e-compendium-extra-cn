import {BOB_APPROVED_LOCALIZE_DISPLAYS} from './bob-localize-display-bindings.mjs';
import {BOB_CHINESE_LANGS, isBobActive} from './bob-i18n-core.mjs';
import {installBobLocalizeDisplay} from './bob-localize-display-core.mjs';

let installation = null;
const supported = () => isBobActive(game) && game.version === '14.368'
  && game.system.version === '8.5.1' && BOB_CHINESE_LANGS.includes(game.i18n.lang)
  && game.modules.get('pf2e-bastion-of-blasphemies')?.version === '1.0.0'
  && game.modules.get('babele')?.active === true && game.modules.get('babele')?.version === '2.9.1'
  && game.modules.get('pf2_cn')?.active === true && game.modules.get('pf2_cn')?.version === '2.5.1';

export const isBobLocalizeDisplayReady = () => installation?.isActive() === true && supported();
export function disposeBobLocalizeDisplay() {
  installation?.();
  installation = null;
}

// Registration is deliberately independent; the parent integrator controls module.json.
// Only the final enrichment input changes. Existing identity wrappers remain in place.
Hooks.once('ready', () => {
  if (!supported()) return;
  installation = installBobLocalizeDisplay({
    TextEditorClass: game.pf2e.TextEditor, ItemClass: CONFIG.Item.documentClass,
    ActorClass: CONFIG.Actor.documentClass, bindings: BOB_APPROVED_LOCALIZE_DISPLAYS,
    isEnabled: supported, getUser: () => game.user
  });
});
