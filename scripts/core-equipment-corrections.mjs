const TRUSTY_HELMET_RULES = [
  {
    domain: 'ac',
    key: 'RollOption',
    label: 'PF2E.SpecificRule.Equipment.TrustyHelmet.HunkerDownLabel',
    option: 'hunker-down',
    toggleable: true,
  },
  {key: 'FlatModifier', predicate: ['hunker-down'], selector: 'ac', value: 1},
];

function supportsCurrentRuntime(game = globalThis.game) {
  return game?.system?.id === 'pf2e' && game.i18n?.lang === 'cn'
    && ['pf2e-compendium-extra-cn', 'babele', 'pf2e_compendium_chn']
      .every(id => game.modules?.get(id)?.active === true);
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function sameData(left, right) {
  if (left === right) return true;
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object'
    || Array.isArray(left) !== Array.isArray(right)) return false;
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length
    && keys.every(key => Object.hasOwn(right, key) && sameData(left[key], right[key]));
}

function matchesItem(source, translated, id, slug) {
  return source?._id === id && source.type === 'equipment' && source.system?.slug === slug
    && (translated._id === undefined || translated._id === id)
    && (translated.type === undefined || translated.type === 'equipment')
    && (translated.system?.slug === undefined || translated.system.slug === slug);
}

export function applyCoreEquipmentCorrections(context) {
  if (!supportsCurrentRuntime() || context?.metadata?.id !== 'pf2e.equipment-srd'
    || context.metadata.type !== 'Item' || !isRecord(context.translated)) return 0;
  const {source, translated} = context;
  if (Object.hasOwn(translated, 'system') && !isRecord(translated.system)) return 0;

  if (matchesItem(source, translated, 'u5f4qM8f0N4lE0Gn', 'trusty-helmet')) {
    if (!sameData(source.system.rules, TRUSTY_HELMET_RULES)) return 0;
    if (Object.hasOwn(translated.system ?? {}, 'rules')
      && !sameData(translated.system.rules, TRUSTY_HELMET_RULES)) return 0;

    // Babele supplies a mapped payload, which normally omits untranslated rule data.
    const corrected = structuredClone(translated);
    corrected.system ??= {};
    corrected.system.rules = structuredClone(source.system.rules);
    corrected.system.rules[1].type = 'circumstance';
    corrected.system.rules[1].predicate.push('item:ranged');
    context.translated = corrected;
    return 1;
  }

  if (matchesItem(source, translated, 'K1sodTXiNV4NumOS', 'name-pendant')) {
    if (source.system.bulk?.value !== 0.1) return 0;
    if (Object.hasOwn(translated.system ?? {}, 'bulk') && !isRecord(translated.system.bulk)) return 0;
    if (Object.hasOwn(translated.system?.bulk ?? {}, 'value')
      && translated.system.bulk.value !== 0.1) return 0;

    const corrected = structuredClone(translated);
    corrected.system ??= {};
    corrected.system.bulk ??= {};
    corrected.system.bulk.value = 0;
    context.translated = corrected;
    return 1;
  }
  return 0;
}

Hooks.on('babele.translateDocumentData', applyCoreEquipmentCorrections);
