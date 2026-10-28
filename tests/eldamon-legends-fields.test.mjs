import assert from 'node:assert/strict';
import test from 'node:test';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {
  createEldamonRuleTextConverter,
  createEldamonBadgeLabelsConverter,
} from '../scripts/eldamon-legends-fields.mjs';

const pack = 'battlezoo-eldamon-legends-pf2e.pf2e-effects';
const id = '1234567890abcdef';
const sourceId = `Compendium.${pack}.Item.${id}`;
const ruleConverter = createEldamonRuleTextConverter();
const badgeConverter = createEldamonBadgeLabelsConverter();

function sourceFixture() {
  return {
    _id: id, name: 'Effect: Example', type: 'effect',
    system: {
      rules: [
        {key: 'FlatModifier', label: 'Water Barrier', selector: 'ac', type: 'status', value: 1, predicate: ['water']},
        {key: 'Strike', label: 'Tail', slug: 'tail', damage: {base: {damageType: 'bludgeoning', dice: 1, die: 'd6'}}},
        {key: 'RollOption', domain: 'all', option: 'eldamon:water', toggleable: true,
          suboptions: [{label: 'Regular', value: 'regular'}, {label: 'Underwater', value: 'underwater', predicate: ['submerged']}]},
        {key: 'ItemAlteration', itemType: 'action', mode: 'add', property: 'description', predicate: ['item:slug:example'],
          value: [{text: '<p>Use @Check[reflex|dc:20].</p>', predicate: ['water']}]},
        {key: 'ItemAlteration', itemType: 'effect', mode: 'override', property: 'name', value: 'Effect: Pelagic Pressure'},
        {key: 'GrantItem', uuid: 'Compendium.example.items.Item.abcdefghijklmnop', onDeleteActions: {grantee: 'restrict'}},
      ],
      badge: {type: 'counter', value: 1, labels: ['Low Tide', 'High Tide'], min: 1, max: 2},
    },
  };
}

const ruleEntries = [
  {path: [0, 'label'], ruleKey: 'FlatModifier', source: 'Water Barrier', translation: '水之屏障'},
  {path: [1, 'label'], ruleKey: 'Strike', source: 'Tail', translation: '尾巴'},
  {path: [2, 'suboptions', 1, 'label'], ruleKey: 'RollOption', source: 'Underwater', translation: '水下'},
  {path: [3, 'value', 0, 'text'], ruleKey: 'ItemAlteration', source: '<p>Use @Check[reflex|dc:20].</p>', translation: '<p>进行 @Check[reflex|dc:20]。</p>'},
  {path: [4, 'value'], ruleKey: 'ItemAlteration', source: 'Effect: Pelagic Pressure', translation: '效果：深海压力'},
];
const badgeEntries = [
  {path: [0], source: 'Low Tide', translation: '低潮'},
  {path: [1], source: 'High Tide', translation: '高潮'},
];

function context(source = sourceFixture(), entries = ruleEntries, kind = 'rules') {
  return {
    source, value: kind === 'rules' ? source.system.rules : source.system.badge.labels,
    path: kind === 'rules' ? 'system.rules' : 'system.badge.labels',
    contextCompendium: {metadata: {id: pack}},
    translation: {sourceId, entries},
  };
}

function freezeDeep(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freezeDeep);
    Object.freeze(value);
  }
  return value;
}

test('derived labels remain native in Babele so PF2e can derive stable slugs', () => {
  assert.equal(ruleConverter.translate(context(sourceFixture(), ruleEntries.slice(0, 2))), undefined);
});

test('ItemAlteration names retain their source value for native item preparation', () => {
  const source = freezeDeep(sourceFixture());
  assert.equal(ruleConverter.translate(context(source, [ruleEntries[4]])), undefined);
  assert.equal(source.system.rules[4].value, 'Effect: Pelagic Pressure');
});

test('Legends rule projections translate visible leaves and preserve mechanics and input', () => {
  const source = freezeDeep(sourceFixture());
  const entries = freezeDeep(structuredClone(ruleEntries));
  const expected = sourceFixture().system.rules;
  expected[2].suboptions[1].label = '水下';
  expected[3].value[0].text = '<p>进行 @Check[reflex|dc:20]。</p>';
  const result = ruleConverter.translate(context(source, entries));
  assert.deepEqual(result, expected);
  assert.deepEqual(source, sourceFixture());
  assert.deepEqual(entries, ruleEntries);
});

test('wrong document identity, pack and mapping path retain the original source', () => {
  for (const mutate of [
    ctx => {ctx.source._id = 'another-document';},
    ctx => {ctx.contextCompendium.metadata.id = 'another-module.pf2e-effects';},
    ctx => {ctx.contextCompendium.metadata.id = 'battlezoo-eldamon-legends-pf2e.sf2e-effects';},
    ctx => {ctx.translation.sourceId = `Compendium.${pack}.Item.another-document`;},
    ctx => {ctx.path = 'system.otherRules';},
  ]) {
    const ctx = context();
    mutate(ctx);
    assert.equal(ruleConverter.translate(ctx), undefined);
  }
});

test('imported documents require an exact Legends source UUID in the active source pack', () => {
  const source = sourceFixture();
  source._id = 'imported-document';
  source._stats = {compendiumSource: sourceId};
  assert.equal(ruleConverter.translate(context(source, [ruleEntries[2]]))?.[2].suboptions[1].label, '水下');
  source._stats.compendiumSource = 'Compendium.another-module.items.Item.1234567890abcdef';
  assert.equal(ruleConverter.translate(context(source)), undefined);
  delete source._stats;
  source.flags = {core: {sourceId}};
  assert.equal(ruleConverter.translate(context(source, [ruleEntries[2]]))?.[2].suboptions[1].label, '水下');
});

test('changed source text, moved rules and already translated leaves fail open', () => {
  const stale = {...ruleEntries[2], source: 'Underwater '};
  assert.equal(ruleConverter.translate(context(sourceFixture(), [stale])), undefined);
  const moved = sourceFixture();
  [moved.system.rules[2], moved.system.rules[3]] = [moved.system.rules[3], moved.system.rules[2]];
  assert.equal(ruleConverter.translate(context(moved, [ruleEntries[2]])), undefined);
  const source = sourceFixture();
  source.system.rules = ruleConverter.translate(context(source));
  assert.equal(ruleConverter.translate(context(source)), undefined);
});

test('rule keys, display paths and alteration properties cannot authorize mechanical writes', () => {
  const rows = [
    {...ruleEntries[0], ruleKey: 'Strike'},
    {...ruleEntries[0], path: ['0', 'label']},
    {path: [0, 'selector'], ruleKey: 'FlatModifier', source: 'ac', translation: 'changed'},
    {path: [2, 'suboptions', 1, 'value'], ruleKey: 'RollOption', source: 'underwater', translation: 'changed'},
    {path: [5, 'uuid'], ruleKey: 'GrantItem', source: 'Compendium.example.items.Item.abcdefghijklmnop', translation: 'changed'},
    {path: [0, '__proto__', 'label'], ruleKey: 'FlatModifier', source: 'Water Barrier', translation: 'changed'},
    {...ruleEntries[0], path: [99, 'label']},
  ];
  for (const row of rows) assert.equal(ruleConverter.translate(context(sourceFixture(), [row])), undefined);
  const source = sourceFixture();
  source.system.rules[3].property = 'slug';
  source.system.rules[4].property = 'description';
  assert.equal(ruleConverter.translate(context(source, ruleEntries.slice(3))), undefined);
});

test('invalid payloads leave the source and valid sibling rows intact', () => {
  for (const payload of [null, [], {}, {sourceId, entries: {}}, {sourceId, entries: [null, {}, {path: [0, 'label'], source: 1, translation: 'x'}]}]) {
    assert.equal(ruleConverter.translate({...context(), translation: payload}), undefined);
  }
  const ctx = context(sourceFixture(), [null, {...ruleEntries[2], translation: null}, ruleEntries[3]]);
  const result = ruleConverter.translate(ctx);
  assert.equal(result?.[0].label, 'Water Barrier');
  assert.equal(result?.[3].value[0].text, '<p>进行 @Check[reflex|dc:20]。</p>');
});

test('duplicate paths reject the payload without mutating source data', () => {
  const ctx = context(freezeDeep(sourceFixture()), [ruleEntries[2], ruleEntries[2]]);
  assert.throws(() => ruleConverter.translate(ctx), /duplicate.*\[2,"suboptions",1,"label"\]/);
  assert.deepEqual(ctx.source, sourceFixture());
});

test('counter badge labels project independently without changing values or numeric labels', () => {
  const source = freezeDeep(sourceFixture());
  const result = badgeConverter.translate(context(source, badgeEntries, 'badge'));
  assert.deepEqual(result, ['低潮', '高潮']);
  assert.deepEqual(source, sourceFixture());
  const numeric = sourceFixture();
  numeric.system.badge.labels = ['1', '2'];
  assert.equal(badgeConverter.translate(context(numeric, [{path: [0], source: '1', translation: '一'}], 'badge')), undefined);
});

test('badge projections reject stale labels, incorrect badge kinds and unrelated paths', () => {
  for (const mutate of [
    ctx => {ctx.source.system.badge.type = 'value';},
    ctx => {ctx.source.type = 'equipment';},
    ctx => {ctx.path = 'system.badge.value';},
    ctx => {ctx.source._id = 'wrong-id';},
    ctx => {ctx.translation.entries = [{path: ['0'], source: 'Low Tide', translation: '低潮'}];},
    ctx => {ctx.translation.entries = [{path: [0], source: 'Low Tide ', translation: '低潮'}];},
  ]) {
    const ctx = context(sourceFixture(), structuredClone(badgeEntries), 'badge');
    mutate(ctx);
    assert.equal(badgeConverter.translate(ctx), undefined);
  }
});

test('the actual Babele field consumer preserves arrays and omits unmatched projections', {
  skip: !process.env.BABELE_SOURCE_ROOT,
}, async () => {
  const root = process.env.BABELE_SOURCE_ROOT;
  const {FieldMapping} = await import(pathToFileURL(resolve(root, 'script/mapping/field-mapping.js')));
  const {ConverterRegistry} = await import(pathToFileURL(resolve(root, 'script/converter/converter-registry.js')));
  const registry = new ConverterRegistry({'eldamon-legends-rule-text': ruleConverter});
  const field = new FieldMapping('ruleTexts', {path: 'system.rules', converter: 'eldamon-legends-rule-text'}, registry);
  const previousFoundry = globalThis.foundry;
  globalThis.foundry = {utils: {Collection: Map}};
  try {
    const source = sourceFixture();
    const runtime = {currentCompendium: {metadata: {id: pack}}};
    const result = field.map(source, {ruleTexts: {sourceId, entries: ruleEntries}}, runtime);
    assert.ok(Array.isArray(result.system?.rules));
    assert.equal(result.system.rules[0].label, 'Water Barrier');
    assert.equal(result.system.rules[2].suboptions[1].label, '水下');
    assert.equal(result.system.rules[0].value, 1);
    assert.equal(result.system.rules[2].suboptions[1].value, 'underwater');
    assert.deepEqual(field.map(source, {ruleTexts: {sourceId: 'wrong', entries: ruleEntries}}, runtime), {});
  } finally {
    globalThis.foundry = previousFoundry;
  }
});

test('babele.init registers working converters without changing default mappings', async () => {
  const previousHooks = globalThis.Hooks;
  const hooks = new Map();
  const converters = new Map();
  globalThis.Hooks = {once(name, callback) {hooks.set(name, callback);}};
  try {
    await import('../scripts/eldamon-legends-fields-register.mjs');
    assert.equal(typeof hooks.get('babele.init'), 'function');
    hooks.get('babele.init')({registerConverters(entries) {
      for (const [name, converter] of Object.entries(entries)) converters.set(name, converter);
    }});
    const rules = converters.get('eldamon-legends-rule-text')?.translate(context());
    const labels = converters.get('eldamon-legends-badge-labels')?.translate(context(sourceFixture(), badgeEntries, 'badge'));
    assert.equal(rules?.[2].suboptions[1].label, '水下');
    assert.deepEqual(labels, ['低潮', '高潮']);
    assert.equal(converters.size, 2);
  } finally {
    globalThis.Hooks = previousHooks;
  }
});
