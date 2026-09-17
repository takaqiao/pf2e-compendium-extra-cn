import {createBobMementoDisplay} from './bob-memento-display-compat.mjs';

let installation = null;

function initialize() {
  if (installation) return;
  installation = createBobMementoDisplay({game, CONFIG});
}

export const isBobMementoDisplayReady = () => typeof installation === 'function';
export function disposeBobMementoDisplay() {
  installation?.();
  installation = null;
}

Hooks.once('ready', initialize);

