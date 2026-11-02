const EXTRA_ID = 'pf2e-compendium-extra-cn';
const STEALTHY_ID = 'pf2e-stealthy';
const NATIVE_DESCRIPTION = 'Stealth effect which applies hidden/undetected to observer tokens as appropriate';

function enabled() {
  return ['pf2e', 'sf2e'].includes(game.system?.id)
    && ['cn', 'zh-CN', 'zh-Hans'].includes(game.i18n.lang)
    && game.modules.get(EXTRA_ID)?.active && game.modules.get(STEALTHY_ID)?.active;
}

function translateField(object, source, field, original, key) {
  if (source?.[field] !== original || object?.[field] !== original) return;
  const translated = game.i18n.localize(key);
  if (translated !== key) object[field] = translated;
}

function nativeLabels(badge) {
  return badge?.type === 'counter' && badge.labels?.length === 2
    && badge.labels[0] === 'HDN' && badge.labels[1] === 'UDT';
}

Hooks.once('i18nInit', () => {
  if (!enabled() || typeof globalThis.libWrapper?.register !== 'function'
      || typeof CONFIG.PF2E?.Item?.documentClasses?.effect?.prototype.prepareData !== 'function') return;

  // Wrap complete preparation so BoB can still install and restore its base-data identity adapter.
  libWrapper.register(EXTRA_ID, 'CONFIG.PF2E.Item.documentClasses.effect.prototype.prepareData', function(wrapped, ...args) {
    const result = wrapped(...args);
    const source = this._source;
    if (!enabled() || this.type !== 'effect' || source.type !== 'effect'
        || this.system.slug !== 'pf2e-stealthy-stealth' || source.system.slug !== 'pf2e-stealthy-stealth'
        || !Object.hasOwn(this.flags, STEALTHY_ID) || !Object.hasOwn(source.flags, STEALTHY_ID)) return result;

    translateField(this, source, 'name', 'Stealthy', `${STEALTHY_ID}.effects.stealthy.name`);
    translateField(this.system.description, source.system.description, 'value', NATIVE_DESCRIPTION,
      `${STEALTHY_ID}.effects.stealthy.description`);
    const badge = this.system.badge;
    if (nativeLabels(badge) && nativeLabels(source.system.badge)) {
      // The system model has already calculated label from the original labels.
      const originalLabel = badge.labels[badge.value - 1];
      const keys = [`${STEALTHY_ID}.badge.hidden`, `${STEALTHY_ID}.badge.undetected`];
      const labels = keys.map(key => game.i18n.localize(key));
      if (labels.every((label, index) => label !== keys[index])) {
        badge.labels = labels;
        if (badge.label === originalLabel) badge.label = labels[badge.value - 1];
      }
    }
    return result;
  }, 'WRAPPER');
});
