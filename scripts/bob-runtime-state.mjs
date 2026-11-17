// Shared only by BoB's identity entry, its explicitly named converter and the
// generic NPC attack-effect lookup. Hook errors do not stop Foundry startup,
// so both states must fail closed.
let enabled = () => false;
let approvedItem = () => false;

export function setBobIdentityReadiness(predicate = () => false) {
  if (typeof predicate !== 'function') throw new TypeError('BoB readiness requires a predicate.');
  enabled = predicate;
}

export function isBobIdentityReady() {
  return enabled() === true;
}

// Set from i18nInit, before world documents prepare; readiness waits for ready.
export function setBobApprovedItem(predicate = () => false) {
  if (typeof predicate !== 'function') throw new TypeError('BoB approved Items require a predicate.');
  approvedItem = predicate;
}

export function isBobApprovedItem(item) {
  return approvedItem(item) === true;
}
