/** Target-only i18n companion for the version/SHA-bound AV display patches. */
Hooks.once('i18nInit', async () => {
  if (game.system?.id !== 'pf2e' || !/^(?:cn|zh(?:[-_]|$))/i.test(game.i18n?.lang ?? '')
      || !game.modules.get('pf2e-compendium-extra-cn')?.active) return;
  const sources = [
    {id:'abomination-vaults-addons', version:'2.1.0', file:'abomination-vaults-addons.json'},
    {id:'abomination-vaults-expanded', version:'3.2.0', file:'abomination-vaults-expanded-display.json'},
  ];
  for (const source of sources) {
    const module = game.modules.get(source.id);
    if (!module?.active || module.version !== source.version) continue;
    const response = await fetch(`modules/pf2e-compendium-extra-cn/lang/external/${source.file}`);
    if (!response.ok) continue;
    const data = await response.json();
    // Merge only the proven producer namespace; never I18N.LANGUAGE or other modules.
    if (data[source.id] && typeof data[source.id] === 'object') {
      foundry.utils.mergeObject(game.i18n.translations, {[source.id]:data[source.id]});
    }
  }
});
