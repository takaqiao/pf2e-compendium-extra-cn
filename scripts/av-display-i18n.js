/** Target-only i18n companion for the AV display patches. */
Hooks.once('i18nInit', async () => {
  const i18n = game.i18n, dictionary = i18n?.translations;
  const enabled = () => game.system?.id === 'pf2e'
    && i18n && game.i18n === i18n && i18n.translations === dictionary
    && /^(?:cn|zh(?:[-_]|$))/i.test(i18n.lang ?? '')
    && game.modules.get('pf2e-compendium-extra-cn')?.active;
  if (!enabled() || !dictionary || typeof dictionary !== 'object' || Array.isArray(dictionary)
      || typeof foundry.utils?.mergeObject !== 'function') return;
  const sources = [
    {id:'abomination-vaults-addons', file:'abomination-vaults-addons.json'},
    {id:'abomination-vaults-expanded', file:'abomination-vaults-expanded-display.json'},
  ];
  for (const source of sources) {
    const module = game.modules.get(source.id);
    if (!enabled() || !module?.active) continue;
    const response = await fetch(`modules/pf2e-compendium-extra-cn/lang/external/${source.file}`);
    if (!response.ok) continue;
    const data = await response.json();
    // Merge only the proven producer namespace; never I18N.LANGUAGE or other modules.
    if (enabled() && game.modules.get(source.id) === module && module.active
        && data?.[source.id] && typeof data[source.id] === 'object' && !Array.isArray(data[source.id])) {
      foundry.utils.mergeObject(dictionary, {[source.id]:data[source.id]});
    }
  }
});
