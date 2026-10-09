/**
 * Compatibility for Eldamon Legends' two known malformed Scylla UUID arguments.
 * Load as an extra esmodule before setup.
 * Does not modify source prose, UUID labels, module APIs, or game rules.
 */
(() => {
  'use strict';

  const moduleId = 'battlezoo-eldamon-legends-pf2e';
  const bareTarget = 'Compendium.battlezoo-eldamon-legends-pf2e.pf2e-powers.Item.MLVOHkL6fQz73kJ2';
  const englishArgument = bareTarget + '{Scylla}';
  const chineseArgument = bareTarget + '{斯库拉}';
  let installed = false;

  function applicable() {
    const game = globalThis.game;
    const module = game?.modules?.get?.(moduleId);
    return module?.active === true
      && game?.system?.id === 'pf2e'
      && game?.i18n?.lang === 'cn';
  }

  function install() {
    if (installed || !applicable() || typeof globalThis.fromUuid !== 'function') return;
    const previous = globalThis.fromUuid;

    function fromUuidScyllaCompatibility(...args) {
      // All other arguments bypass even the environment lookup unchanged.
      if ((args[0] === englishArgument || args[0] === chineseArgument) && applicable()) {
        args[0] = bareTarget;
      }
      // Deliberately neither async nor awaited: keep return/Promise/error identity.
      return Reflect.apply(previous, this, args);
    }

    globalThis.fromUuid = fromUuidScyllaCompatibility;
    installed = true;
  }

  globalThis.Hooks.once('setup', install);
})();
