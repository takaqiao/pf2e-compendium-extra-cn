import {createBobJournalCheckDisplay} from './bob-journal-check-display-compat.mjs';

let installation = null;
export function installBobJournalChecks() {
  if (installation?.isActive()) return installation;
  installation?.();
  installation = createBobJournalCheckDisplay();
  return installation;
}
export function disposeBobJournalChecks() {installation?.(); installation = null;}

if (globalThis.game?.ready) installBobJournalChecks();
else Hooks.once('ready', installBobJournalChecks);
