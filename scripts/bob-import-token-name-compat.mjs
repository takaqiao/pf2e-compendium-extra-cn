import {BOB_APPROVED_IMPORT_TOKEN_NAMES, BOB_BABELE_IMPORT_CALLBACK_SOURCE, BOB_IMPORT_ADVENTURE} from './bob-approved-import-token-names.mjs';
import {BOB_CHINESE_LANGS, isBobActive} from './bob-i18n-core.mjs';
import {installBobImportTokenNames} from './bob-import-token-name-core.mjs';

let installation = null;
const supported = () => isBobActive(game) && BOB_CHINESE_LANGS.includes(game.i18n.lang)
  && game.modules.get('babele')?.active === true;

export function isBobImportTokenNamesReady() {
  return installation?.isActive() === true && supported();
}

export function disposeBobImportTokenNames() {
  installation?.();
  installation = null;
}

export function installBobImportTokenNameCompatibility() {
  if (!supported()) return;
  if (installation?.isActive()) return;
  // Retire any earlier inner wrapper before examining the exact current slot.
  disposeBobImportTokenNames();
  installation = installBobImportTokenNames({
    Hooks, game, bindings: BOB_APPROVED_IMPORT_TOKEN_NAMES,
    expectedCallbackSource: BOB_BABELE_IMPORT_CALLBACK_SOURCE,
    ...BOB_IMPORT_ADVENTURE, isEnabled: supported
  });
}

// The Babele import callback is synchronously registered at module evaluation.
// Only this ready hook is registered; no document update hooks are installed.
Hooks.once('ready', installBobImportTokenNameCompatibility);
