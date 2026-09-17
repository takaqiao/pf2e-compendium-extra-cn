import {BOB_MORDIMUS_RESET} from './bob-mordimus-reset-binding.mjs';
import {installMordimusResetDisplay} from './bob-mordimus-reset-core.mjs';
import {BOB_CHINESE_LANGS, isBobActive} from './bob-i18n-core.mjs';

let installation;
const supported = () => isBobActive(game) && game.version === '14.368'
  && game.system.version === '8.5.1' && BOB_CHINESE_LANGS.includes(game.i18n.lang)
  && game.modules.get('pf2e-bastion-of-blasphemies')?.version === '1.0.0';
export function installBobMordimusReset() {
  if (installation?.isActive() || !supported()) return;
  installation?.();
  installation = installMordimusResetDisplay({backend: CONFIG.DatabaseBackend, game,
    binding: BOB_MORDIMUS_RESET,
    classes: {Scene: CONFIG.Scene.documentClass, Actor: CONFIG.Actor.documentClass, Token: CONFIG.Token.documentClass},
    isEnabled: supported});
}
export function disposeBobMordimusReset() {installation?.(); installation = null;}
Hooks.once('ready', installBobMordimusReset);
