// Shared only by BoB's identity entry and its explicitly named converter.
// Hook errors do not stop Foundry startup, so readiness must fail closed.
let enabled = () => false;

export function setBobIdentityReadiness(predicate = () => false) {
  if (typeof predicate !== 'function') throw new TypeError('BoB readiness requires a predicate.');
  enabled = predicate;
}

export function isBobIdentityReady() {
  return enabled() === true;
}
