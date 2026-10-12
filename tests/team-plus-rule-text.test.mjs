import assert from 'node:assert/strict';
import test from 'node:test';
import {translateRuleTexts} from '../scripts/team-plus-rule-text.mjs';

function ruleFixture() {
  return [
    {
      key: 'Note', selector: ['strike-damage', 'spell-damage'],
      text: 'Deal @Damage[2d6[fire]] damage.', title: 'Burning Strike',
      predicate: ['target:trait:undead', {or: ['item:melee', 'item:ranged']}],
      outcome: ['success', 'criticalSuccess'], visibility: 'owner',
    },
    {
      key: 'ItemAlteration', itemType: 'action', mode: 'add', property: 'description',
      predicate: ['item:slug:breath-weapon'],
      value: [
        {text: 'Use @Check[reflex|dc:20].', title: 'Fiery Breath', predicate: ['self:level:5']},
        {text: 'Keep this paragraph.', title: 'Unchanged', predicate: [{gte: ['self:level', 10]}]},
      ],
    },
    {
      key: 'ChoiceSet', flag: 'breathType', rollOption: 'breath:type',
      choices: [{label: 'Fire', value: 'fire'}, {label: 'Cold', value: 'cold'}],
      selection: 'fire',
    },
    {
      key: 'GrantItem', uuid: 'Compendium.pf2e.feats-srd.Item.ABCDEFGHIJKLMNOP',
      alterations: [{mode: 'override', property: 'badge-value', value: 2}],
      onDeleteActions: {grantee: 'restrict'}, reevaluateOnUpdate: true,
    },
  ];
}

const translations = [
  {path: [0, 'text'], source: 'Deal @Damage[2d6[fire]] damage.', translation: '造成 @Damage[2d6[fire]] 伤害。'},
  {path: [0, 'title'], source: 'Burning Strike', translation: '燃烧打击'},
  {path: [1, 'value', 0, 'text'], source: 'Use @Check[reflex|dc:20].', translation: '进行 @Check[reflex|dc:20]。'},
  {path: [1, 'value', 0, 'title'], source: 'Fiery Breath', translation: '烈焰吐息'},
];

function freezeDeep(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freezeDeep);
    Object.freeze(value);
  }
  return value;
}

const scatterLabel = {
  path: [7, 'label'], source: 'Chemical Poliorectica Scatter', translation: '炼金攻城学散射',
};

function scatterRules() {
  return [
    ...ruleFixture(),
    {key: 'FlatModifier', selector: 'strike-damage', value: 2},
    {key: 'DamageDice', selector: 'strike-damage', diceNumber: 1, dieSize: 'd6'},
    {key: 'RollOption', label: 'Chemical Poliorectica Scatter', domain: 'all', option: 'other-option'},
    {key: 'RollOption', label: 'Chemical Poliorectica Scatter', domain: 'all', option: 'chemical-scatter', toggleable: true},
  ];
}

test('an explicitly mapped RollOption label is translated without changing mechanics or other labels', () => {
  const rules = freezeDeep(scatterRules());
  const before = structuredClone(rules);
  const payload = freezeDeep([structuredClone(scatterLabel)]);
  const expected = scatterRules();
  expected[7].label = '炼金攻城学散射';

  const result = translateRuleTexts(rules, payload);
  assert.deepEqual(result, expected);
  assert.deepEqual(rules, before);
  assert.deepEqual(payload, [scatterLabel]);
  assert.notStrictEqual(result, rules);
  assert.notStrictEqual(result[1].value, rules[1].value);
});

test('RollOption labels retain exact-source guards, explicit array indices and idempotency', () => {
  const rules = scatterRules();
  const row = scatterLabel;
  assert.strictEqual(translateRuleTexts(rules, []), rules);
  assert.strictEqual(translateRuleTexts(rules, [{...row, source: `${row.source} `}]), rules);
  assert.strictEqual(translateRuleTexts(rules, [{...row, source: 'Chemical Poliorcetica Scatter'}]), rules);
  assert.strictEqual(translateRuleTexts(rules, [{...row, translation: row.source}]), rules);
  const shifted = [...rules.slice(0, 6), rules[0], rules[1], rules[7]];
  assert.strictEqual(translateRuleTexts(shifted, [row]), shifted);
  for (const index of ['7', -1, 7.5, 8, NaN, Infinity, undefined, '__proto__']) {
    assert.strictEqual(translateRuleTexts(rules, [{...row, path: [index, 'label']}]), rules);
  }
  const result = translateRuleTexts(rules, [row]);
  assert.strictEqual(translateRuleTexts(result, [row]), result);
});

test('label support is limited to own string fields on RollOption rules', () => {
  const cases = [
    {key: 'Note', label: 'Source'},
    {key: 'ChoiceSet', label: 'Source'},
    {key: 'FlatModifier', label: 'Source'},
    {key: 'ItemAlteration', property: 'description', label: 'Source'},
    {key: 'RollOption'},
    {key: 'RollOption', label: 7},
    {key: 'RollOption', label: {value: 'Source'}},
    Object.assign(Object.create({key: 'RollOption'}), {label: 'Source'}),
    Object.assign(Object.create({label: 'Source'}), {key: 'RollOption'}),
    Object.defineProperty({key: 'RollOption'}, 'label', {get() {assert.fail('label accessors must not run');}}),
  ];
  for (const rule of cases) {
    const rules = [rule];
    assert.strictEqual(translateRuleTexts(rules, [{path: [0, 'label'], source: 'Source', translation: '译文'}]), rules);
  }
  const rules = [
    {key: 'RollOption', text: 'Source', title: 'Source', option: 'Source', domain: 'Source'},
    {key: 'ItemAlteration', property: 'description', value: [{label: 'Source'}]},
    {key: 'RollOption', suboptions: [{label: 'Source', value: 'Source'}]},
  ];
  for (const path of [[0, 'text'], [0, 'title'], [0, 'option'], [0, 'domain'], [1, 'value', 0, 'label'], [2, 'suboptions', 0, 'label']]) {
    assert.strictEqual(translateRuleTexts(rules, [{path, source: 'Source', translation: '译文'}]), rules);
  }
});

test('malformed label records are skipped while a valid label record still applies', () => {
  const rules = scatterRules();
  const malformed = [
    null,
    Object.create(scatterLabel),
    {...scatterLabel, extra: true},
    {...scatterLabel, source: null},
    {...scatterLabel, translation: {}},
    {...scatterLabel, path: '7.label'},
    {...scatterLabel, path: Object.assign([7, 'label'], {extra: true})},
    {...scatterLabel, path: Object.setPrototypeOf([7, 'label'], Object.create(Array.prototype))},
    Object.defineProperty({...scatterLabel}, 'source', {get() {assert.fail('payload accessors must not run');}}),
  ];
  const expected = scatterRules();
  expected[7].label = '炼金攻城学散射';
  for (const row of malformed) {
    assert.strictEqual(translateRuleTexts(rules, [row]), rules);
    assert.deepEqual(translateRuleTexts(rules, [row, scatterLabel]), expected);
  }
});

test('duplicate label paths reject the payload without modifying the source', () => {
  const rules = freezeDeep(scatterRules());
  const before = structuredClone(rules);
  assert.throws(() => translateRuleTexts(rules, [scatterLabel, {...scatterLabel, translation: '另一译文'}]), {
    name: 'TypeError', message: /team-plus-rule-text.*duplicate.*\[7,"label"\]/i,
  });
  assert.deepEqual(rules, before);
});

test('translates approved display leaves while preserving complete rule arrays and mechanics', () => {
  const rules = freezeDeep(ruleFixture());
  const before = structuredClone(rules);
  const payload = freezeDeep(structuredClone(translations));
  const expected = ruleFixture();
  expected[0].text = '造成 @Damage[2d6[fire]] 伤害。';
  expected[0].title = '燃烧打击';
  expected[1].value[0].text = '进行 @Check[reflex|dc:20]。';
  expected[1].value[0].title = '烈焰吐息';

  const result = translateRuleTexts(rules, payload);
  assert.deepEqual(result, expected);
  assert.deepEqual(rules, before);
  assert.deepEqual(payload, translations);
  assert.notStrictEqual(result, rules);
  assert.notStrictEqual(result[2].choices, rules[2].choices);
  assert.ok(Array.isArray(result));
  assert.ok(Array.isArray(result[1].value));
});

test('stale text, moved rules and already translated rules retain their original identity', () => {
  const rules = ruleFixture();
  const stale = [{...translations[0], source: 'Deal @Damage[2d8[fire]] damage.'}];
  assert.strictEqual(translateRuleTexts(rules, stale), rules);
  assert.strictEqual(translateRuleTexts(rules, [{...translations[0], source: `${rules[0].text} `}]), rules);
  const shifted = [rules[2], rules[0], rules[1]];
  assert.strictEqual(translateRuleTexts(shifted, translations), shifted);
  const result = translateRuleTexts(rules, translations);
  assert.strictEqual(translateRuleTexts(result, translations), result);
  assert.strictEqual(translateRuleTexts(rules, [{...translations[0], translation: rules[0].text}]), rules);
});

test('missing and malformed top-level payloads leave rules untouched', () => {
  const rules = ruleFixture();
  for (const payload of [undefined, null, {}, 'text', 7, [], [null], [false], [[]]]) {
    assert.strictEqual(translateRuleTexts(rules, payload), rules);
  }
  for (const rules of [undefined, null, {}, 'text', 7]) {
    assert.strictEqual(translateRuleTexts(rules, translations), rules);
  }
});

test('only the two approved path shapes can write to a rule', () => {
  const cases = [
    {path: [0, 'key'], source: 'Note'},
    {path: [0, 'selector', 0], source: 'strike-damage'},
    {path: [0, 'outcome', 0], source: 'success'},
    {path: [1, 'property'], source: 'description'},
    {path: [1, 'mode'], source: 'add'},
    {path: [1, 'value'], source: []},
    {path: [1, 'value', 0, 'predicate', 0], source: 'self:level:5'},
    {path: [2, 'selection'], source: 'fire'},
    {path: [2, 'choices', 0, 'label'], source: 'Fire'},
    {path: [3, 'uuid'], source: 'Compendium.pf2e.feats-srd.Item.ABCDEFGHIJKLMNOP'},
    {path: ['__proto__', 'text'], source: 'prototype'},
    {path: [0, '__proto__'], source: 'prototype'},
    {path: [0, 'constructor'], source: 'prototype'},
    {path: [0, 'text', '__proto__'], source: 'prototype'},
    {path: [1, 'value', '__proto__', 'text'], source: 'prototype'},
  ];
  for (const row of cases) {
    const rules = freezeDeep(ruleFixture());
    assert.strictEqual(translateRuleTexts(rules, [{...row, translation: '错误修改'}]), rules, JSON.stringify(row.path));
  }
});

test('indices must be own nonnegative integers within both arrays', () => {
  const rules = ruleFixture();
  for (const index of ['0', -1, 0.5, 4, NaN, Infinity, null, undefined]) {
    const payload = [{...translations[0], path: [index, 'text']}];
    assert.strictEqual(translateRuleTexts(rules, payload), rules, String(index));
  }
  for (const index of ['0', -1, 0.5, 2, NaN, Infinity, null, undefined]) {
    const payload = [{...translations[2], path: [1, 'value', index, 'text']}];
    assert.strictEqual(translateRuleTexts(rules, payload), rules, String(index));
  }
  const sparse = new Array(1);
  assert.strictEqual(translateRuleTexts(sparse, [translations[0]]), sparse);
});

test('malformed records are skipped without preventing another valid translation', () => {
  const inherited = Object.create(translations[0]);
  const customPrototype = Object.assign(Object.create({unexpected: true}), translations[0]);
  const pathWithProperty = Object.assign([0, 'text'], {extra: 'field'});
  const pathWithPrototype = Object.setPrototypeOf([0, 'text'], Object.create(Array.prototype));
  const getter = Object.defineProperty({...translations[0]}, 'source', {
    get() {assert.fail('payload accessors must not run');},
  });
  const cases = [
    inherited, customPrototype, getter,
    {path: [0, 'text'], translation: '错误修改'},
    {path: [0, 'text'], source: 7, translation: '错误修改'},
    {...translations[0], translation: {}},
    {...translations[0], translation: null},
    {...translations[0], extra: 'field'},
    {...translations[0], path: '0.text'},
    {...translations[0], path: pathWithProperty},
    {...translations[0], path: pathWithPrototype},
    {...translations[0], path: [0, , 'text']},
    JSON.parse('{"path":[0,"text"],"source":"Deal @Damage[2d6[fire]] damage.","translation":"错误修改","__proto__":{}}'),
  ];
  for (const row of cases) {
    const rules = ruleFixture();
    assert.strictEqual(translateRuleTexts(rules, [row]), rules);
    const result = translateRuleTexts(rules, [row, translations[1]]);
    assert.equal(result[0].text, rules[0].text);
    assert.equal(result[0].title, '燃烧打击');
  }
});

test('rule kinds, property and leaf types must match before translation', () => {
  const noteCases = [
    {key: 'RollOption', text: 'Source'},
    {key: 'ItemAlteration', property: 'description', text: 'Source'},
    {key: 'Note'},
    {key: 'Note', text: 42},
    {key: 'Note', text: {value: 'Source'}},
    Object.assign(Object.create({key: 'Note'}), {text: 'Source'}),
    Object.assign(Object.create({text: 'Source'}), {key: 'Note'}),
    Object.defineProperty({key: 'Note'}, 'text', {get() {assert.fail('rule accessors must not run');}}),
    Object.assign([], {key: 'Note', text: 'Source'}),
    null,
  ];
  for (const rule of noteCases) {
    const rules = [rule];
    assert.strictEqual(translateRuleTexts(rules, [{path: [0, 'text'], source: 'Source', translation: '译文'}]), rules);
  }
  const alterationCases = [
    {key: 'Note', property: 'description', value: [{text: 'Source'}]},
    {key: 'ItemAlteration', property: 'slug', value: [{text: 'Source'}]},
    {key: 'ItemAlteration', property: 'description', value: {0: {text: 'Source'}}},
    {key: 'ItemAlteration', property: 'description', value: ['Source']},
    {key: 'ItemAlteration', property: 'description', value: [{text: 42}]},
    {key: 'ItemAlteration', property: 'description', value: [Object.create({text: 'Source'})]},
    Object.assign(Object.create({property: 'description'}), {key: 'ItemAlteration', value: [{text: 'Source'}]}),
  ];
  for (const rule of alterationCases) {
    const rules = [rule];
    assert.strictEqual(translateRuleTexts(rules, [{path: [0, 'value', 0, 'text'], source: 'Source', translation: '译文'}]), rules);
  }
});

test('array prototypes cannot supply rules or payloads', () => {
  const rules = Object.setPrototypeOf(new Array(1), Object.assign(Object.create(Array.prototype), {0: {key: 'Note', text: 'Source'}}));
  const payload = [{path: [0, 'text'], source: 'Source', translation: '译文'}];
  assert.strictEqual(translateRuleTexts(rules, payload), rules);
  const regularRules = [{key: 'Note', text: 'Source'}];
  const inheritedPayload = Object.setPrototypeOf(new Array(1), Object.assign(Object.create(Array.prototype), {0: payload[0]}));
  assert.strictEqual(translateRuleTexts(regularRules, inheritedPayload), regularRules);
});

test('duplicate paths reject the payload with an auditable path and no source mutations', () => {
  const rules = freezeDeep(ruleFixture());
  const before = structuredClone(rules);
  const duplicates = [translations[0], {...translations[0], translation: '另一译文'}];
  assert.throws(() => translateRuleTexts(rules, duplicates), {
    name: 'TypeError', message: /team-plus-rule-text.*duplicate.*\[0,"text"\]/i,
  });
  assert.deepEqual(rules, before);
  assert.throws(() => translateRuleTexts(rules, [translations[2], translations[2]]), {
    name: 'TypeError', message: /\[1,"value",0,"text"\]/,
  });
});

test('the babele.init registration exposes a working named converter before translation', async () => {
  const previousHooks = globalThis.Hooks;
  const hooks = new Map();
  const converters = new Map();
  globalThis.Hooks = {once(name, callback) {hooks.set(name, callback);}};
  try {
    await import('../scripts/team-plus-rule-text-register.mjs');
    const babele = {registerConverters(entries) {
      for (const [name, converter] of Object.entries(entries)) converters.set(name, converter);
    }};
    hooks.get('babele.init')?.(babele);
    const converter = converters.get('team-plus-rule-text');
    assert.equal(typeof converter, 'function');
    const rules = ruleFixture();
    const result = converter(rules, translations, {system: {rules}}, {}, {ruleTexts: translations}, {}, {});
    assert.equal(result[0].title, '燃烧打击');
    assert.equal(result[1].value[0].title, '烈焰吐息');
    assert.deepEqual(result[2], rules[2]);
    assert.equal(rules[0].title, 'Burning Strike');
  } finally {
    if (previousHooks === undefined) delete globalThis.Hooks;
    else globalThis.Hooks = previousHooks;
  }
});
