import data from './adventures-presentation-data.mjs';
import {createAdventuresPresentation} from './adventures-presentation.mjs';

const KEY = Symbol.for('pf2e-compendium-extra-cn.adventures-display');
Hooks.once('init', () => {
  if (globalThis[KEY]) return;
  const adapter = createAdventuresPresentation({game: globalThis.game, data});
  globalThis[KEY] = adapter;
  const safe = fn => (...args) => {
    try { Promise.resolve(fn(...args)).catch(error => adapter.diagnostics.failures.push(String(error))); }
    catch (error) { adapter.diagnostics.failures.push(String(error)); }
  };
  Hooks.on('renderApplication', safe(adapter.application));
  Hooks.on('renderApplicationV2', safe(adapter.application));
  Hooks.on('renderCombatTracker', safe(adapter.combatTracker));
  Hooks.once('ready', safe(() => {
    const apps = new Set([...Object.values(globalThis.ui?.windows ?? {}),
      ...(globalThis.foundry?.applications?.instances?.values() ?? [])]);
    for (const app of apps) if (app.element) adapter.application(app, app.element);
    if (globalThis.ui?.combat?.element) adapter.combatTracker(globalThis.ui.combat, globalThis.ui.combat.element);
  }));
});
