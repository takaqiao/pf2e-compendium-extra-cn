// Explicit QA candidate factory. No registration, lazy creation or persistent state.
import {installBobAdditionalDisplay} from './bob-additional-display-core.mjs';
import {ADDITIONAL_DISPLAY_BINDINGS} from './bob-additional-display-bindings.mjs';
import {SYNTHETIC_DISPLAY_BINDINGS} from './bob-additional-synthetic-bindings.mjs';

export function installBobAdditionalDisplayCandidate({game, CONFIG, bindings = ADDITIONAL_DISPLAY_BINDINGS, syntheticBindings = SYNTHETIC_DISPLAY_BINDINGS}) {
  const enabled = () => game?.version === '14.368' && game.system?.id === 'pf2e' && game.system.version === '8.5.1'
    && ['cn', 'zh-CN', 'zh-Hans'].includes(game.i18n?.lang)
    && game.modules?.get('pf2e-compendium-extra-cn')?.active === true
    && game.modules?.get('pf2e-bastion-of-blasphemies')?.active === true
    && game.modules.get('pf2e-bastion-of-blasphemies').version === '1.0.0'
    && game.modules?.get('babele')?.active === true && game.modules.get('babele').version === '2.9.1'
    && game.modules?.get('pf2_cn')?.active === true && game.modules.get('pf2_cn').version === '2.5.1';
  if (!enabled()) return Object.assign(() => {}, {isActive: () => false});
  return installBobAdditionalDisplay({
    TextEditorClass: game.pf2e.TextEditor, ItemClass: CONFIG.Item.documentClass, ActorClass: CONFIG.Actor.documentClass,
    SceneClass: CONFIG.Scene.documentClass, TokenDocumentClass: CONFIG.Token.documentClass, ActorDeltaClass: CONFIG.ActorDelta.documentClass,
    bindings, syntheticBindings, isEnabled: enabled, getLocale: () => game.i18n.lang, getUser: () => game.user,
    getActors: () => game.actors, getScenes: () => game.scenes,
  });
}
