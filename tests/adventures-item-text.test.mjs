import assert from 'node:assert/strict';
import test from 'node:test';
import {translateAdventuresItemText, adventuresItemTextPatch} from '../scripts/adventures-item-text.mjs';

const row = (path, source, translation) => ({path, source, translation});

test('rules translate only the visible fields appropriate to their rule key', () => {
  const system = {rules: [
    {key: 'ChoiceSet', prompt: 'Choose a skill', choices: [{value: 'arcana', label: 'Arcana', predicate: ['trained:arcana']}]},
    {key: 'RollOption', option: 'vessel:form', label: 'Form', suboptions: [{value: 'mortal', label: 'Mortal'}]},
    {key: 'AdjustModifier', relabel: 'Aid', slug: 'aid', mode: 'add', value: 1},
    {key: 'ItemAlteration', property: 'description', mode: 'add', value: [{title: 'Benefit', text: '<p>A benefit.</p>'}]},
  ], slug: 'test-entry'};
  const before = structuredClone(system);
  const result = translateAdventuresItemText(system, [
    row(['rules', 0, 'prompt'], 'Choose a skill', '选择一项技能'),
    row(['rules', 0, 'choices', 0, 'label'], 'Arcana', '奥秘'),
    row(['rules', 1, 'suboptions', 0, 'label'], 'Mortal', '凡人'),
    row(['rules', 2, 'relabel'], 'Aid', '协助'),
    row(['rules', 3, 'value', 0, 'text'], '<p>A benefit.</p>', '<p>一项增益。</p>'),
    row(['rules', 0, 'choices', 0, 'value'], 'arcana', '奥秘'),
    row(['rules', 1, 'option'], 'vessel:form', '不得翻译'),
  ]);
  assert.equal(result.rules[0].prompt, '选择一项技能');
  assert.equal(result.rules[0].choices[0].label, '奥秘');
  assert.equal(result.rules[0].choices[0].value, 'arcana');
  assert.equal(result.rules[0].choices[0].predicate, system.rules[0].choices[0].predicate);
  assert.equal(result.rules[1].suboptions[0].label, '凡人');
  assert.equal(result.rules[1].option, 'vessel:form');
  assert.equal(result.rules[2].relabel, '协助');
  assert.equal(result.rules[3].value[0].text, '<p>一项增益。</p>');
  assert.deepEqual(system, before);
});

test('item display metadata preserves references to every untouched mechanical branch', () => {
  const system = {
    selfEffect: {uuid: 'Item.effect', name: 'Effect'},
    identification: {status: 'unidentified', unidentified: {name: 'Unknown object'}},
    items: {f1: {uuid: 'Item.feature', name: 'Feature', level: 2}},
    badge: {type: 'counter', value: 1, labels: ['First', 'Second']},
    range: {value: '10 feet'}, target: {value: 'one creature'}, requirements: 'A free hand',
    rules: [{key: 'FlatModifier', selector: 'ac', value: 1}],
  };
  const result = translateAdventuresItemText(system, [
    row(['selfEffect', 'name'], 'Effect', '效果'),
    row(['identification', 'unidentified', 'name'], 'Unknown object', '不明物体'),
    row(['items', 'f1', 'name'], 'Feature', '特性'),
    row(['badge', 'labels', 1], 'Second', '第二'),
    row(['range', 'value'], '10 feet', '10尺'),
    row(['requirements'], 'A free hand', '一只空手'),
    row(['badge', 'value'], '1', '2'),
  ]);
  assert.equal(result.selfEffect.name, '效果');
  assert.equal(result.selfEffect.uuid, 'Item.effect');
  assert.equal(result.identification.unidentified.name, '不明物体');
  assert.equal(result.items.f1.name, '特性');
  assert.equal(result.badge.labels[1], '第二');
  assert.equal(result.badge.value, 1);
  assert.equal(result.range.value, '10尺');
  assert.equal(result.rules, system.rules);
  assert.equal(result.target, system.target);
});

test('unknown rule keys, changed sources and mechanical paths stay native', () => {
  const system = {rules: [{key: 'Unknown', label: 'Label'}, {key: 'ItemAlteration', property: 'name', value: [{text: 'Text'}]}], slug: 'slug'};
  assert.equal(translateAdventuresItemText(system, [
    row(['rules', 0, 'label'], 'Label', '标签'),
    row(['rules', 1, 'value', 0, 'text'], 'Text', '正文'),
    row(['slug'], 'slug', '标识'),
    row(['selfEffect', 'name'], 'Absent', '缺失'),
  ]), system);
});

test('all observed label-producing rule keys support exact label translation', () => {
  for (const key of ['FlatModifier', 'RollOption', 'SpecialResource', 'Strike', 'CraftingAbility', 'MartialProficiency']) {
    const system = {rules: [{key, label: 'Label', value: 1}]};
    assert.equal(translateAdventuresItemText(system, [row(['rules', 0, 'label'], 'Label', '标签')]).rules[0].label, '标签', key);
  }
});

test('duplicate paths fail before returning partial item data', () => {
  const system = {requirements: 'One hand'};
  assert.throws(() => translateAdventuresItemText(system, [
    row(['requirements'], 'One hand', '一只手'), row(['requirements'], 'One hand', '另一只手'),
  ]), /duplicate path/);
  assert.equal(system.requirements, 'One hand');
});

test('the Babele patch leaves the normal description mapping out of its merge payload', () => {
  const system = {description: {value: 'Original prose'}, range: {value: '10 feet'}, rules: []};
  assert.deepEqual(adventuresItemTextPatch(system, [row(['range', 'value'], '10 feet', '10尺')]), {range: {value: '10尺'}});
  assert.equal(adventuresItemTextPatch(system, []), undefined);
});
