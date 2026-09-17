import {installBobRuleDisplayCandidate} from './bob-rule-display-compat.mjs';
import {BOB_APPROVED_IDENTITIES} from './bob-approved-identities.mjs';

let installation = null;
let sheetsInstalled = false;

function initializeRules() {
  if (installation?.active) return;
  installation?.dispose();
  installation = installBobRuleDisplayCandidate({game, CONFIG, legacyWorldIdentities: BOB_APPROVED_IDENTITIES});
}

function initializeSheets() {
  if (!installation?.active || sheetsInstalled) return;
  const classes = new Set();
  for (const registry of Object.values(CONFIG.Actor.sheetClasses)) {
    for (const [id, registration] of Object.entries(registry)) {
      if (id.startsWith('pf2e.') && typeof registration.cls?.prototype?._handleDroppedItem === 'function') {
        classes.add(registration.cls);
      }
    }
  }
  installation.installActorSheets([...classes]);
  sheetsInstalled = true;
}

export const isBobRuleDisplayReady = () => installation?.active === true && sheetsInstalled;
export function disposeBobRuleDisplay() {
  installation?.dispose();
  installation = null;
  sheetsInstalled = false;
}

// Preparation occurs before ready and before a first-created Actor is registered.
Hooks.once('i18nInit', initializeRules);
Hooks.once('ready', initializeSheets);

