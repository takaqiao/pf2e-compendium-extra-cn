import {BOB_MORDIMUS_RESET} from './bob-mordimus-reset-binding.mjs';
import {installMordimusResetDisplay} from './bob-mordimus-reset-core.mjs';
import {BOB_CHINESE_LANGS, isBobActive} from './bob-i18n-core.mjs';

let installation;
const supported = () => isBobActive(game) && BOB_CHINESE_LANGS.includes(game.i18n.lang);
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
