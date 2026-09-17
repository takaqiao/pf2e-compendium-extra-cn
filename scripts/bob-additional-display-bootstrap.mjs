import {installBobAdditionalDisplayCandidate} from './bob-additional-display-compat.mjs';

let installation = null;
function initialize() {
  if (installation?.isActive()) return;
  installation?.();
  installation = installBobAdditionalDisplayCandidate({game, CONFIG});
}
export const isBobAdditionalDisplayReady = () => installation?.isActive() === true;
export function disposeBobAdditionalDisplay() {
  installation?.();
  installation = null;
}
Hooks.once('ready', initialize);
if (globalThis.game?.ready === true) initialize();
