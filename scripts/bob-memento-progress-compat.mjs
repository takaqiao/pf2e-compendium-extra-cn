import {installBobMementoProgress} from './bob-memento-progress-core.mjs';

const MODULE_ID = 'pf2e-bastion-of-blasphemies';
let installation;

export function disposeBobMementoProgress() {
  installation?.();
  installation = null;
}

export async function installBobMementoProgressCompatibility({game = globalThis.game,
  Hooks = globalThis.Hooks, getManager = () => globalThis.bastion.manager,
  loadModule = path => import(path), onError = error => console.error('BoB memento progress:', error)} = {}) {
  if (game.modules.get(MODULE_ID)?.active !== true || installation?.isActive()) return;
  disposeBobMementoProgress();
  try {
    const root = `/modules/${MODULE_ID}/_js/campaign`;
    const [{CampaignManager}, {WorldStateHandlers}, {ARUDORA_FOUNTAIN}] = await Promise.all([
      loadModule(`${root}/manager.mjs`), loadModule(`${root}/state-handlers.mjs`), loadModule(`${root}/constants.mjs`)
    ]);
    if (ARUDORA_FOUNTAIN?.actorId !== 'cHogqC3igqd7t1hM') return;
    installation = installBobMementoProgress({game, Hooks, CampaignManager, WorldStateHandlers, getManager, onError});
  } catch (error) {
    onError(error);
  }
}

Hooks.once('ready', () => installBobMementoProgressCompatibility());
