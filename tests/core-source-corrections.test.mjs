import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import test, {beforeEach} from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const readJson = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const manifest = readJson('module.json');
const hookName = 'babele.translateDocumentData';
const callbacks = new Map();
globalThis.Hooks = {
  on(event, callback) { callbacks.set(event, callback); },
  callAll(event, context) { callbacks.get(event)?.(context); },
};
const script = 'scripts/core-equipment-corrections.mjs';
if (manifest.esmodules.includes(script)) await import(new URL(script, root));

function runtime() {
  return {
    system: {id: 'pf2e', version: '8.6.1'}, i18n: {lang: 'cn'},
    modules: new Map(['pf2e-compendium-extra-cn', 'babele', 'pf2e_compendium_chn']
      .map(id => [id, {active: true}])),
    settings: {get: () => false},
  };
}
beforeEach(() => { globalThis.game = runtime(); });

function helmet() {
  return {
    _id: 'u5f4qM8f0N4lE0Gn', name: 'Trusty Helmet', type: 'equipment',
    system: {
      slug: 'trusty-helmet', description: {value: 'English description'}, bulk: {value: 0.1},
      rules: [
        {domain: 'ac', key: 'RollOption', label: 'PF2E.SpecificRule.Equipment.TrustyHelmet.HunkerDownLabel', option: 'hunker-down', toggleable: true},
        {key: 'FlatModifier', predicate: ['hunker-down'], selector: 'ac', value: 1},
      ],
    },
  };
}
function pendant() {
  return {
    _id: 'K1sodTXiNV4NumOS', name: 'Name Pendant', type: 'equipment',
    system: {
      slug: 'name-pendant', description: {value: 'English description'}, bulk: {value: 0.1},
      rules: [{key: 'FlatModifier', predicate: ['item:magical', 'item:trait:mental'], selector: 'saving-throw', type: 'item', value: 1}],
    },
  };
}
function context(source = helmet(), translated = {name: '自定义中文名称', system: {description: {value: '自定义中文描述'}}}) {
  return {metadata: {id: 'pf2e.equipment-srd', type: 'Item'}, source, translated};
}
function apply(context) {
  Hooks.callAll(hookName, context);
  return context.translated;
}
function unchanged(context) {
  const before = structuredClone(context);
  const translated = context.translated;
  apply(context);
  assert.deepEqual(context, before);
  assert.strictEqual(context.translated, translated);
}

test('the installed hook repairs helmet AC without changing the source or translated text', () => {
  const data = context();
  const source = structuredClone(data.source), originalPayload = structuredClone(data.translated);
  const translated = apply(data);
  assert.deepEqual(translated.system.rules, [
    source.system.rules[0],
    {key: 'FlatModifier', predicate: ['hunker-down', 'item:ranged'], selector: 'ac', type: 'circumstance', value: 1},
  ]);
  assert.deepEqual(data.source, source);
  assert.equal(translated.name, originalPayload.name);
  assert.deepEqual(translated.system.description, originalPayload.system.description);
  unchanged(data);
});

test('the installed hook changes only the pendant bulk value', () => {
  const data = context(pendant());
  data.translated.system.bulk = {capacity: 4};
  const source = structuredClone(data.source), before = structuredClone(data.translated);
  const translated = apply(data);
  assert.deepEqual(translated, {...before, system: {...before.system, bulk: {capacity: 4, value: 0}}});
  assert.deepEqual(data.source, source);
  unchanged(data);
});

test('full translated payloads are copied before correction, including aliased source data', () => {
  for (const makeSource of [helmet, pendant]) {
    const source = makeSource(), before = structuredClone(source);
    const data = context(source, source);
    const translated = apply(data);
    assert.notStrictEqual(translated, source);
    assert.deepEqual(source, before);
    if (source.system.slug === 'trusty-helmet') {
      assert.equal(translated.system.rules[1].type, 'circumstance');
    } else {
      assert.equal(translated.system.bulk.value, 0);
      assert.deepEqual(translated.system.rules, before.system.rules);
    }
  }
});

test('pack, document type and source identity must all match', () => {
  for (const makeSource of [helmet, pendant]) {
    for (const mutate of [
      c => { c.metadata.id = 'world.equipment'; },
      c => { c.metadata.type = 'Actor'; },
      c => { c.source._id = 'different-id'; },
      c => { c.source.type = 'armor'; },
      c => { c.source.system.slug = 'custom-item'; },
      c => { c.translated._id = 'different-id'; },
      c => { c.translated.type = 'armor'; },
      c => { c.translated.system.slug = 'custom-item'; },
    ]) {
      const data = context(makeSource());
      mutate(data);
      unchanged(data);
    }
  }
});

test('unknown or already corrected source rules and bulk values are left alone', () => {
  for (const mutate of [
    c => { c.source.system.rules[1].value = 2; },
    c => { c.source.system.rules[1].type = 'circumstance'; },
    c => { c.source.system.rules[1].predicate.push('item:ranged'); },
    c => { c.source.system.rules[1].priority = 10; },
    c => { c.source.system.rules[0].toggleable = false; },
    c => { c.source.system.rules.push({key: 'RollOption', option: 'custom'}); },
    c => { delete c.source.system.rules; },
  ]) {
    const data = context();
    mutate(data);
    unchanged(data);
  }
  for (const value of [0, 1, '0.1', null, undefined]) {
    const data = context(pendant());
    data.source.system.bulk.value = value;
    unchanged(data);
  }
});

test('explicit user rules and bulk overrides are preserved', () => {
  for (const rules of [
    [], null, undefined,
    [{key: 'FlatModifier', selector: 'ac', value: 3}],
    [...helmet().system.rules, {key: 'RollOption', option: 'custom'}],
    helmet().system.rules.map(rule => ({...rule, label: '自定义规则'})),
  ]) {
    unchanged(context(helmet(), {system: {rules}}));
  }
  for (const bulk of [null, 1, {value: 0}, {value: 2}, {value: '0.1'}, {value: null}, {value: undefined}]) {
    unchanged(context(pendant(), {system: {bulk}}));
  }
  for (const makeSource of [helmet, pendant]) {
    for (const system of [null, [], 'custom']) unchanged(context(makeSource(), {system}));
  }
});

test('unrelated systems, languages and inactive dependencies do not receive corrections', () => {
  for (const mutate of [
    g => { g.system.id = 'dnd5e'; },
    g => { g.i18n.lang = 'en'; },
    ...['pf2e-compendium-extra-cn', 'babele', 'pf2e_compendium_chn'].map(id =>
      g => { g.modules.get(id).active = false; }),
  ]) {
    globalThis.game = runtime();
    mutate(game);
    unchanged(context());
    unchanged(context(pendant()));
  }
});

test('source rule object key order does not change eligibility', () => {
  const data = context();
  data.source.system.rules = data.source.system.rules.map(rule => Object.fromEntries(Object.entries(rule).reverse()));
  assert.equal(apply(data).system.rules[1].type, 'circumstance');
});

test('spell overrides retain the CHN mapping and generated title indices', () => {
  const spells = readJson('compendium/pf2e.spells-srd.json');
  const effects = readJson('compendium/pf2e.spell-effects.json');
  assert.deepEqual(Object.keys(spells.entries), ['Ancestral Memories', 'Light', 'Pest Form']);
  assert.deepEqual(Object.keys(effects.entries), ['Spell Effect: Pest Form']);
  assert.deepEqual(spells.mapping, {
    primarycheck: 'system.primarycheck.value', secondarycheck: 'system.secondarycheck.value',
    cost: 'system.cost.value', target: 'system.target.value', duration: 'system.duration.value',
    secondarycasters: 'system.secondarycasters.value', gmnote: 'system.description.gm',
  });
  assert.equal(spells.entries['Ancestral Memories'].duration, '');
  assert.equal(spells.entries.Light.target, '');
  assert.equal(spells.entries.Light.duration, '直到你下次每日准备');
  assert.match(spells.entries['Pest Form'].description, /<li>速度 20尺。<\/li>/);
  assert.match(effects.entries['Spell Effect: Pest Form'].description, /<li>速度20尺。<\/li>/);
  assert.match(effects.entries['Spell Effect: Pest Form'].description, /特技和隐秘调整值\+10/);
  const labels = readJson('compendium/labels.json'), titles = readJson('compendium/titles.json');
  for (const [packId, translation] of [['pf2e.spells-srd', spells], ['pf2e.spell-effects', effects]]) {
    assert.equal(labels[packId], translation.label);
    assert.deepEqual(titles[packId].titles,
      Object.fromEntries(Object.entries(translation.entries).map(([name, entry]) => [name, entry.name])));
    for (const entry of Object.values(translation.entries)) assert.equal(entry.rules, undefined);
  }
});

// Use an installed Babele release; third-party runtime sources are not vendored into this repository.
test('Babele mapping, hook and on-demand bridge materialize the source corrections', {
  skip: !process.env.BABELE_MODULE_ROOT && 'set BABELE_MODULE_ROOT to a Babele 2.9.1 installation',
}, async () => {
  const babeleRoot = pathToFileURL(`${resolve(process.env.BABELE_MODULE_ROOT)}/`);
  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  function mergeObject(target, source, {inplace = true} = {}) {
    const merged = inplace ? target : structuredClone(target);
    for (const [key, value] of Object.entries(source)) {
      if (isObject(value)) merged[key] = mergeObject(isObject(merged[key]) ? merged[key] : {}, value);
      else merged[key] = structuredClone(value);
    }
    return merged;
  }
  globalThis.foundry = {utils: {
    deepClone: structuredClone, mergeObject, Collection: Map,
    parseUuid: uuid => uuid ? {id: uuid.split('.').at(-1)} : null,
    getProperty: (data, path) => path.split('.').reduce((value, key) => value?.[key], data),
  }};
  const [{MappedCompendium}, {DocumentMappings}, {ConverterRegistry}, {IdentityExtractorRegistry}, {StructuredDataConverter}] = await Promise.all([
    import(new URL('script/compendium/mapped-compendium.js', babeleRoot)),
    import(new URL('script/mapping/document-mappings.js', babeleRoot)),
    import(new URL('script/converter/converter-registry.js', babeleRoot)),
    import(new URL('script/identity/identity-extractor-registry.js', babeleRoot)),
    import(new URL('script/converter/structured-data-converter.js', babeleRoot)),
  ]);
  const documentMappings = new DocumentMappings({Item: {name: 'name', description: 'system.description.value'}}, {
    identityExtractors: new IdentityExtractorRegistry(IdentityExtractorRegistry.defaultExtractors()),
    converterRegistry: new ConverterRegistry({structured: new StructuredDataConverter()}),
  });
  const equipmentTranslations = readJson('compendium/pf2e.equipment-srd.json');
  const equipmentPack = new MappedCompendium({id: 'pf2e.equipment-srd', type: 'Item'}, equipmentTranslations, {documentMappings});
  const translatedHelmet = equipmentPack.translate(helmet());
  assert.equal(translatedHelmet.system.rules[1].type, 'circumstance');
  assert.deepEqual(translatedHelmet.system.rules[1].predicate, ['hunker-down', 'item:ranged']);
  assert.equal(translatedHelmet.system.rules[0].option, 'hunker-down');
  assert.equal(equipmentPack.translate(pendant()).system.bulk.value, 0);
  assert.strictEqual(equipmentPack.translate(translatedHelmet), translatedHelmet);

  const changedSource = helmet();
  changedSource.system.rules[1].value = 3;
  assert.deepEqual(equipmentPack.translate(changedSource).system.rules, changedSource.system.rules);
  const userMappings = new DocumentMappings({Item: {name: 'name', rules: {path: 'system.rules', converter: 'custom-rules'}, bulk: 'system.bulk.value'}}, {
    identityExtractors: new IdentityExtractorRegistry(IdentityExtractorRegistry.defaultExtractors()),
    converterRegistry: new ConverterRegistry({'custom-rules': () => [{key: 'FlatModifier', selector: 'ac', value: 3}]}),
  });
  const userPack = new MappedCompendium({id: 'pf2e.equipment-srd', type: 'Item'}, {
    entries: {'Trusty Helmet': {name: '自定义头盔'}, 'Name Pendant': {name: '自定义兵籍牌', bulk: 2}},
  }, {documentMappings: userMappings});
  assert.equal(userPack.translate(helmet()).system.rules[0].value, 3);
  assert.equal(userPack.translate(pendant()).system.bulk.value, 2);

  const bridge = vm.createContext({Hooks: {once() {}}});
  vm.runInContext(readFileSync(new URL('scripts/chn-pr43-bridge.js', root), 'utf8')
    .replace(/^import .*;\r?\n/, ''), bridge);
  for (const packId of ['pf2e.spells-srd', 'pf2e.spell-effects']) {
    const override = readJson(`compendium/${packId}.json`);
    const base = {entries: {'Unrelated Spell': {name: '保留的其他法术'}}};
    if (packId === 'pf2e.spells-srd') {
      base.mapping = {
        primarycheck: 'system.primarycheck.value', secondarycheck: 'system.secondarycheck.value',
        cost: 'system.cost.value', target: 'system.target.value', duration: 'system.duration.value',
        secondarycasters: 'system.secondarycasters.value', gmnote: 'system.description.gm',
      };
      base.entries['Unrelated Spell'] = {
        name: '保留的其他法术', primarycheck: '主要检定', secondarycheck: '次要检定', cost: '施法费用',
        target: '原有目标', duration: '原有持续时间', secondarycasters: '次要施法者', gmnote: 'GM注释',
      };
      base.entries['Ancestral Memories'] = {duration: '1分钟'};
      base.entries.Light = {target: '过时的目标'};
    }
    const merged = bridge.mergeTranslations(base, override);
    assert.equal(merged.entries['Unrelated Spell'].name, '保留的其他法术');
    const pack = new MappedCompendium({id: packId, type: 'Item'}, merged, {documentMappings});
    if (packId === 'pf2e.spells-srd') {
      const original = {name: 'Unrelated Spell', type: 'spell', system: {
        primarycheck: {value: 'English'}, secondarycheck: {value: 'English'}, cost: {value: 'English'},
        target: {value: 'English'}, duration: {value: 'English'}, secondarycasters: {value: 'English'},
        description: {value: 'English', gm: 'English'},
      }};
      assert.deepEqual(pack.translate(original).system, {
        primarycheck: {value: '主要检定'}, secondarycheck: {value: '次要检定'}, cost: {value: '施法费用'},
        target: {value: '原有目标'}, duration: {value: '原有持续时间'}, secondarycasters: {value: '次要施法者'},
        description: {value: 'English', gm: 'GM注释'},
      });
    }
    for (const [name, entry] of Object.entries(override.entries)) {
      const source = {_id: name, name, type: packId.endsWith('spell-effects') ? 'effect' : 'spell', system: {
        description: {value: 'English source'},
        duration: {value: name === 'Ancestral Memories' ? '' : 'English duration'}, target: {value: ''},
        rules: [{key: 'BattleForm', overrides: {speeds: {land: 20}}}],
      }};
      const translated = pack.translate(source);
      assert.equal(translated.name, entry.name);
      assert.equal(translated.system.description.value, entry.description);
      assert.deepEqual(translated.system.rules, source.system.rules);
      if (name === 'Ancestral Memories') assert.equal(translated.system.duration.value, '');
      if (name === 'Light') {
        assert.equal(translated.system.target.value, '');
        assert.equal(translated.system.duration.value, '直到你下次每日准备');
      }
      if (name.includes('Pest Form')) {
        assert.match(translated.system.description.value, /速度 ?20尺/);
        assert.doesNotMatch(translated.system.description.value, /速度 ?10尺|调整值\+16/);
      }
    }
  }
});
