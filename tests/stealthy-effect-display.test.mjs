import assert from 'node:assert/strict';
import test from 'node:test';
import {installBobIdentityCompatibility} from '../scripts/bob-identity-core.mjs';

const hooks = new Map();
globalThis.Hooks = {once(name, callback) {
  const callbacks = hooks.get(name) ?? [];
  callbacks.push(callback);
  hooks.set(name, callbacks);
}};
await import('../inject-lang.js');
delete globalThis.Hooks;

const nativeDescription = 'Stealth effect which applies hidden/undetected to observer tokens as appropriate';
const translations = {
  'pf2e-stealthy.effects.stealthy.name': '隐秘 Stealthy',
  'pf2e-stealthy.effects.stealthy.description': '根据观察者施加藏匿或无踪状态。',
  'pf2e-stealthy.badge.hidden': '藏匿',
  'pf2e-stealthy.badge.undetected': '无踪',
};

async function environment({lang = 'cn', system = 'pf2e', active = true, mutate = () => {}, preparedName,
  nativeFailure, bobFirst = false} = {}) {
  globalThis.game = {system: {id: system}, modules: new Map([
    ['pf2e-compendium-extra-cn', {active: true}], ['pf2e-stealthy', {active}],
  ]), i18n: {lang, localize: key => translations[key] ?? key}};
  class Item {
    get id() {return this._source._id;}
    prepareData(result) {
      Object.assign(this, structuredClone(this._source));
      // PF2e's EffectSystemData normalizes its badge before the document method runs.
      const badge = this.system.badge;
      badge.min = 1;
      badge.max = badge.labels.length;
      badge.label = badge.labels[badge.value - 1].trim();
      this.prepareBaseData();
      this.prepareDerivedData();
      return result;
    }
    prepareDerivedData() {
      if (nativeFailure) throw nativeFailure;
      if (preparedName) this.name = preparedName;
    }
  }
  class Effect extends Item {
    constructor() {
      super();
      this._source = {_id: 'stealthy-effect', type: 'effect', name: 'Stealthy',
        flags: {'pf2e-stealthy': {hidden: {except: ['observer']}}},
        system: {slug: 'pf2e-stealthy-stealth', description: {value: nativeDescription},
          badge: {type: 'counter', value: 2, labels: ['HDN', 'UDT'], min: null, max: null},
          rules: [{key: 'GrantItem', uuid: 'Compendium.pf2e.conditionitems.Item.test'}]}};
      mutate(this._source);
    }
    prepareBaseData() {
      this.system.expired = false;
      this.rollOptionSlug = this.system.slug ?? this.name.toLowerCase().replaceAll(' ', '-');
    }
    update() {throw new Error('Display must not update the document');}
    updateSource() {throw new Error('Display must not update source');}
  }
  globalThis.CONFIG = {PF2E: {Item: {documentClasses: {effect: Effect}}}};
  globalThis.libWrapper = {register(_module, target, wrapper, type) {
    if (type !== 'WRAPPER') throw new Error('Expected a wrapper which preserves native preparation');
    const parts = target.split('.');
    const method = parts.pop();
    const owner = parts.reduce((value, key) => value[key], globalThis);
    const original = owner[method];
    const wrapped = function(...args) {return wrapper.call(this, original.bind(this), ...args);};
    const getter = () => wrapped;
    getter._lib_wrapper = {is_property: false};
    Object.defineProperty(owner, method, {get: getter, configurable: false});
  }};
  class Lore {get slug() {return this.name.toLowerCase().replaceAll(' ', '-');}}
  class NPC {getAttackEffects() {}}
  const installBob = () => installBobIdentityCompatibility({itemClasses: [Effect, Lore], EffectClass: Effect,
    LoreClass: Lore, NPCClass: NPC, isEnabled: () => true, sluggify: value => value.toLowerCase().replaceAll(' ', '-'),
    identities: [{scope: 'worldItem', itemId: 'bob-effect', itemType: 'effect', itemFolderId: null,
      itemSourceUuid: null, originalName: 'Effect Tide', approvedName: '效果 Effect Tide', itemSlug: null}]});
  const originalPrepareData = Item.prototype.prepareData;
  const disposeBob = bobFirst ? installBob() : null;
  for (const callback of hooks.get('i18nInit') ?? []) await callback();
  const item = new Effect();
  return {item, game: globalThis.game, Effect, Item, originalPrepareData, installBob, disposeBob};
}

test('old English effects display translated text and the normalized current badge without source writes', async () => {
  const {item} = await environment();
  const source = structuredClone(item._source);
  const result = {};
  assert.equal(item.prepareData(result), result);
  assert.equal(item.name, '隐秘 Stealthy');
  assert.equal(item.system.description.value, '根据观察者施加藏匿或无踪状态。');
  assert.deepEqual(item.system.badge, {type: 'counter', value: 2, labels: ['藏匿', '无踪'],
    min: 1, max: 2, label: '无踪'});
  assert.deepEqual(item._source, source);
  assert.deepEqual(item.flags, source.flags);
  assert.deepEqual(item.system.rules, source.system.rules);
  assert.equal(item.system.slug, source.system.slug);
});

test('repeated preparation and switching back to English retain native badge mechanics', async () => {
  const {item, game} = await environment({mutate: source => {source.system.badge.value = 1;}});
  for (let i = 0; i < 2; i++) {
    item.prepareData();
    assert.equal(item.system.badge.label, '藏匿');
    assert.equal(item.system.badge.value, 1);
  }
  game.i18n.lang = 'en';
  item.prepareData();
  assert.equal(item.name, 'Stealthy');
  assert.equal(item.system.description.value, nativeDescription);
  assert.deepEqual(item.system.badge.labels, ['HDN', 'UDT']);
  assert.equal(item.system.badge.label, 'HDN');
});

test('a custom display field remains intact while other original fields translate', async () => {
  for (const mutate of [
    source => {source.name = 'Custom name';},
    source => {source.system.description.value = 'Custom description';},
    source => {source.system.badge.labels = ['My hidden', 'UDT'];},
  ]) {
    const {item} = await environment({mutate});
    const source = structuredClone(item._source);
    item.prepareData();
    assert.equal(item.name, source.name === 'Stealthy' ? '隐秘 Stealthy' : source.name);
    assert.equal(item.system.description.value, source.system.description.value === nativeDescription
      ? '根据观察者施加藏匿或无踪状态。' : source.system.description.value);
    assert.deepEqual(item.system.badge.labels, source.system.badge.labels[0] === 'HDN'
      ? ['藏匿', '无踪'] : source.system.badge.labels);
    assert.deepEqual(item._source, source);
  }
});

test('native prepared name overrides are preserved', async () => {
  const {item} = await environment({preparedName: 'Another module name'});
  item.prepareData();
  assert.equal(item.name, 'Another module name');
  assert.equal(item.system.badge.label, '无踪');
});

test('unrelated effect identities retain every original display field', async () => {
  for (const mutate of [
    source => {source.type = 'equipment';},
    source => {source.system.slug = 'custom-effect';},
    source => {delete source.flags['pf2e-stealthy'];},
  ]) {
    const {item} = await environment({mutate});
    item.prepareData();
    assert.equal(item.name, 'Stealthy');
    assert.equal(item.system.description.value, nativeDescription);
    assert.deepEqual(item.system.badge.labels, ['HDN', 'UDT']);
    assert.equal(item.system.badge.label, 'UDT');
  }
});

test('English, other systems and inactive Stealthy retain native display', async () => {
  for (const options of [{lang: 'en'}, {system: 'dnd5e'}, {active: false}]) {
    const {item} = await environment(options);
    item.prepareData();
    assert.equal(item.name, 'Stealthy');
    assert.equal(item.system.description.value, nativeDescription);
    assert.deepEqual(item.system.badge.labels, ['HDN', 'UDT']);
  }
});

test('both valid Chinese aliases and SF2e use the same display adapter', async () => {
  for (const options of [{lang: 'zh-CN'}, {lang: 'zh-Hans'}, {system: 'sf2e'}]) {
    const {item} = await environment(options);
    item.prepareData();
    assert.equal(item.name, '隐秘 Stealthy');
    assert.equal(item.system.badge.label, '无踪');
  }
});

test('inherited native preparation preserves BoB identity installation, behavior and disposal in either order', async () => {
  for (const bobFirst of [false, true]) {
    const runtime = await environment({bobFirst});
    const {item, Effect, Item, installBob, originalPrepareData} = runtime;
    const source = structuredClone(item._source);
    let dispose = runtime.disposeBob;
    try {
      dispose ??= installBob();
      assert.equal(dispose.isActive(), true);
      item.prepareData();
      assert.equal(item.name, '隐秘 Stealthy');
      assert.equal(item.system.badge.label, '无踪');
      assert.deepEqual(item._source, source);
      assert.deepEqual(item.system.rules, source.system.rules);
      assert.deepEqual(item.flags, source.flags);
      assert.equal(item.system.badge.value, source.system.badge.value);
      assert.equal(Item.prototype.prepareData, originalPrepareData);

      const bob = new Effect();
      Object.assign(bob._source, {_id: 'bob-effect', name: '效果 Effect Tide', flags: {}});
      bob._source.system.slug = null;
      bob.prepareData();
      assert.equal(bob.rollOptionSlug, 'tide');
      dispose();
      assert.equal(dispose.isActive(), false);
      bob.prepareData();
      assert.equal(bob.rollOptionSlug, '效果-effect-tide');
      item.prepareData();
      assert.equal(item.name, '隐秘 Stealthy');
      assert.deepEqual(item._source, source);
      dispose = installBob();
      bob.prepareData();
      assert.equal(bob.rollOptionSlug, 'tide');
    } finally {dispose?.();}
  }
});

test('native preparation failures propagate before any display replacement', async () => {
  const nativeFailure = new Error('Native derived preparation failed');
  const {item} = await environment({nativeFailure});
  const source = structuredClone(item._source);
  assert.throws(() => item.prepareData(), error => error === nativeFailure);
  assert.equal(item.name, 'Stealthy');
  assert.equal(item.system.description.value, nativeDescription);
  assert.deepEqual(item.system.badge.labels, ['HDN', 'UDT']);
  assert.deepEqual(item._source, source);
});
