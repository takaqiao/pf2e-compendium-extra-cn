import assert from 'node:assert/strict';
import test from 'node:test';
import {installEldamonRuleDisplay} from '../scripts/eldamon-legends-rule-display-core.mjs';

const clone = structuredClone;
const slug = text => text.toLowerCase().replaceAll(' ', '-');
const sourceId = 'Compendium.battlezoo-eldamon-legends-pf2e.pf2e-eldamon.Item.1234567890abcdef';
const strikeSource = {key: 'Strike', label: 'Water Trident', group: 'brawling', damage: {base: {dice: 1, die: 'd6', damageType: 'piercing'}}};
const modifierSource = {key: 'FlatModifier', label: 'Water Barrier', selector: 'ac', type: 'status', value: 1, predicate: ['water']};

function host(kind = 'Strike', raw = kind === 'Strike' ? strikeSource : modifierSource) {
  const actor = {items: new Map(), synthetics: {strikes: {}, modifiers: {}}, type: 'character'};
  const calls = [];
  class Item {
    prepareRuleElements(...args) {
      calls.push({method: 'prepareRules', receiver: this, args});
      if (this.nativeFailure) throw this.nativeFailure;
      this.rules = this.nativeRules;
      return this.rules;
    }
  }
  const item = Object.assign(new Item(), {
    id: 'imported-item', type: 'ancestry', name: '样例 Example', parent: actor, actor,
    _source: {_stats: {compendiumSource: sourceId}, system: {slug: 'example', rules: [clone(raw)]}},
    system: {slug: 'example'}, rules: [],
  });
  actor.items.set(item.id, item);
  class Modifier {
    constructor(data) {Object.assign(this, data);}
    clone(changes = {}) {
      calls.push({method: 'clone', label: this.label});
      if (changes.fail) throw new Error('native clone failure');
      return new Modifier({...this, ...changes});
    }
  }
  class Rule {
    static cleanData(data) {
      data.priority ??= 100;
      data.slug ??= null;
      data.predicate ??= [];
      data.spinoff ??= undefined;
      data.replaceAll ??= undefined;
      data.replaceBasicUnarmed ??= undefined;
      data.battleForm ??= undefined;
      data.options ??= undefined;
      data.graspingAppendage ??= undefined;
      if (data.key === 'Strike') data.damage.base.modifier ??= 0;
      return data;
    }
    constructor() {
      Object.assign(this, clone(raw), {item, parent: item, actor, sourceIndex: 0});
      if (this.key === 'Strike') this.slug ??= slug(this.label);
    }
    getReducedLabel() {return this.label;}
  }
  class Strike extends Rule {
    beforePrepareData(...args) {
      calls.push({method: 'prepare', receiver: this, args});
      this.actor.synthetics.strikes[this.slug] = function(...factoryArgs) {
        calls.push({method: 'factory', receiver: this, args: factoryArgs});
        const source = {name: raw.label, system: {slug: slug(raw.label), damage: clone(raw.damage)}};
        const weapon = {_source: source, system: clone(source.system), name: source.name, rule: rule, actor};
        calls.push({method: 'latePreparation', name: weapon.name, slug: weapon.system.slug});
        return weapon;
      };
      return 'prepared';
    }
  }
  class FlatModifier extends Rule {
    beforePrepareData(...args) {
      calls.push({method: 'prepare', receiver: this, args});
      const label = this.getReducedLabel(), modifierSlug = this.slug ?? slug(label);
      const currentRule = this;
      const factory = function(...factoryArgs) {
        calls.push({method: 'factory', receiver: this, args: factoryArgs});
        return new Modifier({label, slug: modifierSlug, rule: currentRule, modifier: currentRule.value, predicate: clone(currentRule.predicate)});
      };
      const list = this.actor.synthetics.modifiers[this.selector] ??= [];
      list.push(factory);
      calls.push({method: 'registered', factory, list, index: list.length - 1});
      return 'prepared';
    }
  }
  const classes = {Strike, FlatModifier};
  const nativeMethods = {Strike: Strike.prototype.beforePrepareData, FlatModifier: FlatModifier.prototype.beforePrepareData};
  const rule = new classes[kind]();
  item.rules.push(rule);
  item.nativeRules = item.rules;
  const binding = {sourceId, itemType: 'ancestry', itemSlug: 'example', ruleIndex: 0, rule: clone(raw), translation: kind === 'Strike' ? '水之三叉戟' : '水之屏障'};
  let enabled = true;
  const installation = installEldamonRuleDisplay({ItemClass: Item, classes, bindings: [binding], isEnabled: () => enabled});
  return {
    actor, item, rule, calls, classes, Item, nativeMethods, binding, installation,
    disable() {enabled = false;},
    factory() {return kind === 'Strike' ? actor.synthetics.strikes[rule.slug] : actor.synthetics.modifiers.ac.at(-1);},
    prepare() {item.prepareRuleElements(); rule.beforePrepareData(); return this.factory()();},
  };
}

test('unrelated receiver rules retain the exact native beforePrepareData method', () => {
  const h = host('FlatModifier');
  try {
    const unrelated = new h.classes.FlatModifier();
    unrelated.item = Object.assign(new h.Item(), {actor: h.actor, rules: [unrelated], nativeRules: [unrelated], _source: {system: {rules: [{key: 'FlatModifier', selector: 'healing-received', value: 2}]}}});
    unrelated.parent = unrelated.item;
    unrelated.selector = 'healing-received';
    unrelated.item.prepareRuleElements();
    assert.strictEqual(unrelated.beforePrepareData, h.nativeMethods.FlatModifier);
    assert.strictEqual(h.classes.FlatModifier.prototype.beforePrepareData, h.nativeMethods.FlatModifier);
    assert.strictEqual(h.classes.Strike.prototype.beforePrepareData, h.nativeMethods.Strike);
    unrelated.beforePrepareData();
    const receipt = h.calls.find(call => call.method === 'registered');
    assert.strictEqual(h.actor.synthetics.modifiers['healing-received'], receipt.list);
    assert.strictEqual(receipt.list[receipt.index], receipt.factory);
  } finally {h.installation.dispose();}
});

test('native-normalized source rules match without changing the sparse binding', () => {
  for (const defaults of [{}, {
    spinoff: undefined, replaceAll: undefined, replaceBasicUnarmed: undefined,
    battleForm: undefined, options: undefined, graspingAppendage: undefined,
  }]) {
    const h = host();
    try {
      h.item._source.system.rules[0] = {
        ...clone(strikeSource), priority: 100, slug: null, predicate: [],
        damage: {base: {dice: 1, die: 'd6', damageType: 'piercing', modifier: 0}},
        ...defaults,
      };
      const before = clone(h.item._source);
      assert.equal(h.prepare().name, '水之三叉戟');
      assert.deepEqual(h.item._source, before);
      assert.deepEqual(h.binding.rule, strikeSource);
    } finally {h.installation.dispose();}
  }
});

test('changed defaults and unknown source fields reject normalized matching', () => {
  const optionalFields = ['spinoff', 'replaceAll', 'replaceBasicUnarmed', 'battleForm', 'options', 'graspingAppendage'];
  const changes = [{priority: 101}, {unknownMechanic: true},
    ...optionalFields.flatMap(key => [{[key]: false}, {[key]: true}])];
  for (const change of changes) {
    const h = host();
    try {
      h.item._source.system.rules[0] = {
        ...clone(strikeSource), priority: 100, slug: null, predicate: [],
        damage: {base: {dice: 1, die: 'd6', damageType: 'piercing', modifier: 0}},
        ...change,
      };
      assert.equal(h.prepare().name, 'Water Trident');
      assert.deepEqual(h.binding.rule, strikeSource);
    } finally {h.installation.dispose();}
  }
});

test('item preparation preserves its return, arguments and errors without stacking instance wrappers', () => {
  const h = host();
  try {
    const options = {suppressWarnings: true};
    assert.strictEqual(h.item.prepareRuleElements(options), h.item.rules);
    const call = h.calls.find(entry => entry.method === 'prepareRules');
    assert.strictEqual(call.receiver, h.item);
    assert.strictEqual(call.args[0], options);
    const wrapped = h.rule.beforePrepareData;
    h.item.prepareRuleElements();
    assert.strictEqual(h.rule.beforePrepareData, wrapped);
    const failure = new Error('native item preparation failure');
    h.item.nativeFailure = failure;
    assert.throws(() => h.item.prepareRuleElements(), error => error === failure);
  } finally {h.installation.dispose();}
});

test('Strike display follows completed factory preparation without changing source or slug', () => {
  const h = host();
  const before = clone(h.item._source);
  try {
    const weapon = h.prepare();
    assert.equal(weapon.name, '水之三叉戟');
    assert.equal(weapon._source.name, 'Water Trident');
    assert.equal(weapon.system.slug, 'water-trident');
    assert.equal(weapon._source.system.slug, 'water-trident');
    assert.deepEqual(Object.keys(h.actor.synthetics.strikes), ['water-trident']);
    assert.deepEqual(h.calls.find(call => call.method === 'latePreparation'), {method: 'latePreparation', name: 'Water Trident', slug: 'water-trident'});
    assert.deepEqual(h.item._source, before);
    assert.equal(h.rule.label, 'Water Trident');
  } finally {h.installation.dispose();}
});

test('modifier display and clones preserve the native constructor label and mechanical slug', () => {
  const h = host('FlatModifier');
  const before = clone(h.item._source);
  try {
    const modifier = h.prepare();
    assert.equal(modifier.label, '水之屏障');
    assert.equal(modifier.slug, 'water-barrier');
    const copy = modifier.clone();
    assert.equal(copy.label, '水之屏障');
    assert.equal(copy.slug, 'water-barrier');
    assert.equal(copy.modifier, 1);
    assert.deepEqual(copy.predicate, ['water']);
    assert.equal(h.calls.find(call => call.method === 'clone').label, 'Water Barrier');
    assert.equal(copy.clone().label, '水之屏障');
    assert.deepEqual(h.item._source, before);
  } finally {h.installation.dispose();}
});

test('native relabels, clone overrides and clone errors keep their original behavior', () => {
  const h = host('FlatModifier');
  try {
    const modifier = h.prepare();
    assert.equal(modifier.label, '水之屏障');
    assert.equal(modifier.clone({label: 'User label'}).label, 'User label');
    assert.throws(() => modifier.clone({fail: true}), /native clone failure/);
    assert.equal(modifier.label, '水之屏障');
    modifier.label = 'Native override';
    assert.equal(modifier.label, 'Native override');
    assert.equal(modifier.clone().label, 'Native override');
  } finally {h.installation.dispose();}
});

test('display reads withdraw translation after source, ownership or runtime changes', () => {
  for (const mutate of [
    h => {h.item._source.system.rules[0].damage.base.dice = 2;},
    h => {h.item._source._stats.compendiumSource = 'Compendium.other.items.Item.1234567890abcdef';},
    h => {h.item._source.system.slug = 'custom';},
    h => {h.item.rules = [];},
    h => {h.actor.items.delete(h.item.id);},
    h => {h.rule.label = 'Custom label';},
    h => {h.rule.replaceAll = true;},
    h => {h.rule.battleForm = true;},
    h => {h.disable();},
  ]) {
    const h = host();
    try {
      const weapon = h.prepare();
      assert.equal(weapon.name, '水之三叉戟');
      mutate(h);
      assert.equal(weapon.name, 'Water Trident');
    } finally {h.installation.dispose();}
  }
});

test('only the bound source and complete original rule are eligible', () => {
  for (const mutate of [
    h => {h.item._source._stats.compendiumSource = null;},
    h => {h.item.type = 'effect';},
    h => {h.item.system.slug = 'changed';},
    h => {h.item._source.system.rules[0].predicate = ['custom'];},
    h => {h.rule.sourceIndex = 1;},
    h => {h.rule.parent = {};},
  ]) {
    const h = host();
    try {
      mutate(h);
      assert.equal(h.prepare().name, 'Water Trident');
    } finally {h.installation.dispose();}
  }
});

test('replacement and battle-form rules remain native even when explicitly supplied in bindings', () => {
  for (const field of ['replaceAll', 'replaceBasicUnarmed', 'battleForm']) {
    const h = host('Strike', {...strikeSource, [field]: true});
    try {assert.equal(h.prepare().name, 'Water Trident');} finally {h.installation.dispose();}
  }
});

test('only factories added by the bound rule are wrapped and native arguments are retained', () => {
  for (const kind of ['FlatModifier', 'Strike']) {
    const h = host(kind);
    const unrelated = () => ({label: 'Other', name: 'Other'});
    h.actor.synthetics.modifiers.ac = [unrelated];
    h.actor.synthetics.strikes.other = unrelated;
    const receiver = {factory: true};
    try {
      h.item.prepareRuleElements();
      assert.equal(h.rule.beforePrepareData('prepare arg'), 'prepared');
      const result = h.factory().call(receiver, 'factory arg');
      assert.equal(result[kind === 'Strike' ? 'name' : 'label'], h.binding.translation);
      assert.strictEqual(h.actor.synthetics.modifiers.ac[0], unrelated);
      assert.strictEqual(h.actor.synthetics.strikes.other, unrelated);
      assert.deepEqual(h.calls.find(call => call.method === 'prepare').args, ['prepare arg']);
      const call = h.calls.find(call => call.method === 'factory');
      assert.strictEqual(call.receiver, receiver);
      assert.deepEqual(call.args, ['factory arg']);
    } finally {h.installation.dispose();}
  }
});

test('disposal withdraws existing projections and leaves later wrappers installed', () => {
  const h = host();
  const weapon = h.prepare();
  assert.equal(weapon.name, '水之三叉戟');
  const installed = h.Item.prototype.prepareRuleElements;
  const later = function(...args) {return installed.apply(this, args);};
  h.Item.prototype.prepareRuleElements = later;
  h.installation.dispose();
  assert.equal(weapon.name, 'Water Trident');
  assert.strictEqual(h.Item.prototype.prepareRuleElements, later);
});
