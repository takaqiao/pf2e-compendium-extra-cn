import assert from 'node:assert/strict';
import test from 'node:test';
import {createMockLibWrapper} from './support/libwrapper.mjs';
import {englishNameSlug, installAttackEffectLookup, installStrikeRuleSlug} from '../scripts/npc-english-slug-core.mjs';
import {installBobIdentityCompatibility} from '../scripts/bob-identity-core.mjs';
import {installBobRuleDisplayConsumers} from '../scripts/bob-rule-display-core.mjs';

// Unicode-preserving like PF2e's sluggify: a bilingual name keeps its Chinese half.
const sluggify = value => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');
const LABELS = {grab: 'PF2E.AttackEffectGrab'};
let counter = 0;

class Items extends Map {
  find(predicate) { for (const item of this.values()) if (predicate(item)) return item; }
  get contents() { return [...this.values()]; }
}

// Fresh PF2e-shaped classes per test, so that installers never share prototypes.
function classes() {
  class ItemBase { get slug() { return this.system.slug ?? null; } getRollOptions() { return []; } }
  class Lore extends ItemBase { get slug() { return sluggify(this.name); } }
  class Melee extends ItemBase { prepareSiblingData() {} }
  class Actor {}
  // Native strike labels (pf2e.mjs:20382 and 20531) consider every Item type.
  const prepareActions = actor => {
    actor.system.actions = actor.itemTypes.melee.map(item => ({item, additionalEffects: item.system.attackEffects.value.map(tag => ({
      tag, label: LABELS[tag] ?? actor.items.contents.find(other => (other.slug ?? sluggify(other.name)) === tag)?.name ?? tag}))}));
  };
  class NPC extends Actor {
    // PF2e 8.7.1 getAttackEffects reduced to its Item lookup (pf2e.mjs:38119).
    async getAttackEffects(strike) {
      return strike.system.attackEffects.value.map(tag => this.items.find(item => item.type !== 'melee'
        && (item.slug ?? sluggify(item.name)) === sluggify(tag))?.name ?? null);
    }
    prepareDerivedData() { prepareActions(this); }
  }
  class Hazard extends Actor { prepareDerivedData() { prepareActions(this); } }
  const name = `NpcEnglishSlug${++counter}`;
  const result = {ItemBase, Lore, Melee, Actor, NPC, Hazard, path: key => `${name}.${key}`};
  globalThis[name] = result;
  return result;
}

function npc(world, Class, items) {
  const actor = Object.assign(new Class(), {id: 'npc', type: Class === world.Hazard ? 'hazard' : 'npc', name: '测试鱼人 Test Fisher',
    system: {}, items: new Items(), isToken: false, parent: null, _source: {folder: null, _stats: {compendiumSource: null}}});
  for (const [id, type, name, extra = {}] of items) {
    const ItemClass = type === 'melee' ? world.Melee : world.ItemBase;
    actor.items.set(id, Object.assign(new ItemClass(), {id, type, name, flags: extra.flags ?? {}, actor, parent: actor,
      system: {slug: extra.slug ?? null, attackEffects: {value: extra.tags ?? []}},
      _source: {_id: id, type, name, folder: null, _stats: {compendiumSource: null}, system: {slug: extra.slug ?? null}}}));
  }
  actor.itemTypes = {melee: actor.items.contents.filter(item => item.type === 'melee')};
  return actor;
}

const TAGS = ['oar-breaker', 'line-snagged', 'grab', 'unknown'];
const ITEMS = [
  ['beak', 'melee', '喙 Beak', {tags: TAGS}],
  ['oar', 'action', '碎桨者 Oar Breaker'],
  ['hook', 'action', '缠线入体', {flags: {babele: {originalName: 'Line Snagged'}}}],
];
const install = (world, options = {}) => installAttackEffectLookup({NPCClass: world.NPC, HazardClass: world.Hazard,
  attackEffectLabels: LABELS, sluggify, isEnabled: () => true, ...options});
const effects = actor => actor.getAttackEffects(actor.items.get('beak'));
const labels = actor => { actor.prepareDerivedData(); return actor.system.actions[0].additionalEffects.map(effect => effect.label); };

test('the English slug comes from Babele\'s original name, else from the English half of a bilingual name', () => {
  const slug = (name, flags) => englishNameSlug({name, flags}, sluggify);
  assert.equal(slug('碎桨者 Oar Breaker'), 'oar-breaker');
  assert.equal(slug('“公正的”测试员（13级） Tester the Fair (Level 13)'), 'tester-the-fair-level-13');
  assert.equal(slug('测试员·遗名 Testa Noname'), 'testa-noname');
  assert.equal(slug('缠线入体', {babele: {originalName: 'Line Snagged'}}), 'line-snagged');
  assert.equal(slug('缠线入体 Snag Line', {babele: {originalName: 'Line Snagged'}}), 'line-snagged');
  for (const name of ['Oar Breaker', '碎桨者', '碎桨者（改）', '碎桨者 123', '碎桨者 Oar（改）']) assert.equal(slug(name), null, name);
});

test('NPC attack effects find slugless bilingual Items by their English name', async () => {
  const world = classes();
  const dispose = install(world);
  try {
    const actor = npc(world, world.NPC, ITEMS);
    assert.deepEqual(await effects(actor), ['碎桨者 Oar Breaker', '缠线入体', null, null]);
    assert.deepEqual(labels(actor), ['碎桨者 Oar Breaker', '缠线入体', LABELS.grab, 'unknown']);
    assert.deepEqual(labels(npc(world, world.Hazard, ITEMS)), ['碎桨者 Oar Breaker', '缠线入体', LABELS.grab, 'unknown']);
    // Only the lookup view changes: the Item keeps its native slug and name.
    assert.equal(actor.items.get('oar').slug, null);
    assert.equal(actor.items.get('oar').name, '碎桨者 Oar Breaker');
  } finally { dispose(); }
  const actor = npc(world, world.NPC, ITEMS);
  assert.deepEqual(await effects(actor), [null, null, null, null]);
  assert.deepEqual(labels(actor), ['oar-breaker', 'line-snagged', LABELS.grab, 'unknown']);
});

test('a native slug or name match wins, and Items with their own slug or of melee type are not reinterpreted', async () => {
  const world = classes();
  const dispose = install(world);
  try {
    const native = npc(world, world.NPC, [['beak', 'melee', '喙 Beak', {tags: ['oar-breaker']}],
      ['oar', 'action', '碎桨者 Oar Breaker'], ['english', 'action', 'Oar Breaker']]);
    assert.deepEqual(await native.getAttackEffects(native.items.get('beak')), ['Oar Breaker']);
    assert.deepEqual(labels(native), ['Oar Breaker']);
    const own = npc(world, world.NPC, [['beak', 'melee', '喙 Beak', {tags: ['oar-breaker', 'line-snagged']}],
      ['oar', 'action', '碎桨者 Oar Breaker', {slug: 'oar-wrecker'}], ['hook', 'melee', '缠线入体 Line Snagged']]);
    assert.deepEqual(await own.getAttackEffects(own.items.get('beak')), [null, null]);
  } finally { dispose(); }
});

test('nothing changes while the language gate is closed', async () => {
  const world = classes();
  let enabled = false;
  const dispose = install(world, {isEnabled: () => enabled});
  try {
    const actor = npc(world, world.NPC, ITEMS);
    assert.deepEqual(await effects(actor), [null, null, null, null]);
    assert.deepEqual(labels(actor), ['oar-breaker', 'line-snagged', LABELS.grab, 'unknown']);
    enabled = true;
    assert.deepEqual(await effects(actor), ['碎桨者 Oar Breaker', '缠线入体', null, null]);
  } finally { dispose(); }
});

test('an Item BoB approves keeps BoB\'s original name, whichever wrapper is outer', async () => {
  // BoB maps this Item to "Festering Spite"; its English half alone would read "spite".
  const row = {scope: 'actorItem', actorId: 'npc', actorType: 'npc', actorFolderId: null, actorSourceUuid: null, itemId: 'spite',
    itemType: 'action', itemFolderId: null, itemSourceUuid: null, originalName: 'Festering Spite', approvedName: '怨恨 Spite', itemSlug: null};
  const items = [['beak', 'melee', '喙 Beak', {tags: ['spite', 'festering-spite', 'oar-breaker']}],
    ['spite', 'action', '怨恨 Spite'], ['oar', 'action', '碎桨者 Oar Breaker']];
  for (const order of ['lookup-first', 'bob-first']) {
    const world = classes();
    let bob = null, lookup = null;
    const installBob = () => installBobIdentityCompatibility({itemClasses: [world.Lore, world.Melee, world.ItemBase],
      LoreClass: world.Lore, NPCClass: world.NPC, HazardClass: world.Hazard, MeleeClass: world.Melee, sluggify,
      isEnabled: () => true, identities: [row]});
    const installLookup = () => install(world, {hasApprovedIdentity: item => bob?.approves(item) === true});
    if (order === 'lookup-first') { lookup = installLookup(); bob = installBob(); }
    else { bob = installBob(); lookup = installLookup(); }
    try {
      const actor = npc(world, world.NPC, items);
      assert.deepEqual(await effects(actor), [null, '怨恨 Spite', '碎桨者 Oar Breaker'], order);
      assert.deepEqual(labels(actor), ['spite', '怨恨 Spite', '碎桨者 Oar Breaker'], order);
    } finally { bob(); }
    // Once BoB is gone the same Item is an ordinary bilingual one.
    try {
      assert.deepEqual(await effects(npc(world, world.NPC, items)), ['怨恨 Spite', null, '碎桨者 Oar Breaker'], order);
    } finally { lookup(); }
    assert.deepEqual(await effects(npc(world, world.NPC, items)), [null, null, null], order);
  }
});

test('labels join a libWrapper-managed preparation and leave its chain on dispose', () => {
  const world = classes();
  const mock = createMockLibWrapper();
  for (const key of ['NPC', 'Hazard']) {
    mock.libWrapper.register('other-module', world.path(`${key}.prototype.prepareDerivedData`), function (next, ...args) {
      return next(...args);
    }, 'WRAPPER');
  }
  const dispose = install(world, {libWrapper: mock.libWrapper});
  assert.deepEqual(labels(npc(world, world.NPC, ITEMS)), ['碎桨者 Oar Breaker', '缠线入体', LABELS.grab, 'unknown']);
  assert.deepEqual(labels(npc(world, world.Hazard, ITEMS)), ['碎桨者 Oar Breaker', '缠线入体', LABELS.grab, 'unknown']);
  dispose();
  assert.deepEqual(labels(npc(world, world.NPC, ITEMS)), ['oar-breaker', 'line-snagged', LABELS.grab, 'unknown']);
  assert.deepEqual(mock.registrations().filter(entry => entry.endsWith(':prepareDerivedData')),
    ['other-module:prepareDerivedData', 'other-module:prepareDerivedData']);
});

test('an unavailable native entry fails before any change', () => {
  const snapshot = world => [[world.NPC, 'getAttackEffects'], [world.NPC, 'prepareDerivedData'], [world.Hazard, 'prepareDerivedData']]
    .map(([Class, key]) => Object.getOwnPropertyDescriptor(Class.prototype, key));
  const managed = classes();
  const mock = createMockLibWrapper();
  mock.libWrapper.register('other-module', managed.path('NPC.prototype.getAttackEffects'), (next, ...args) => next(...args), 'WRAPPER');
  const missing = classes();
  delete missing.NPC.prototype.getAttackEffects;
  const noLibWrapper = classes();
  mock.libWrapper.register('other-module', noLibWrapper.path('Hazard.prototype.prepareDerivedData'), (next, ...args) => next(...args), 'WRAPPER');
  for (const [world, libWrapper] of [[managed, mock.libWrapper], [missing, mock.libWrapper], [noLibWrapper, null]]) {
    const before = snapshot(world);
    assert.throws(() => install(world, {libWrapper}));
    assert.deepEqual(snapshot(world), before);
  }
});

// PF2e 8.7.1 StrikeRuleElement: the constructor localizes label, then sets
// `slug ??= sluggify(label)` (pf2e.mjs:32463, 43838); beforePrepareData keys the strike by it.
function strikes() {
  class Strike {
    beforePrepareData() {
      const slug = this.slug ?? sluggify(this.label);
      this.actor.synthetics.strikes[slug] = () => ({rule: this, name: this.label, system: {slug},
        _source: {name: this.label, system: {slug}}});
    }
  }
  const name = `NpcEnglishStrike${++counter}`;
  globalThis[name] = {Strike};
  return {Strike, path: key => `${name}.${key}`};
}
const ENGLISH = {'PF2E.BattleForm.Attack.Jaws': 'Jaws', 'PF2E.Test.Item': '{item} Jaws'};
const CHINESE = {'PF2E.BattleForm.Attack.Jaws': '噬咬', 'PF2E.Test.Item': '{item}噬咬'};
function strikeRule(Strike, {type = 'npc', source = {label: 'PF2E.BattleForm.Attack.Jaws'}, slug} = {}) {
  const label = CHINESE[source.label] ?? source.label;
  const actor = {type, synthetics: {strikes: {}}};
  return Object.assign(new Strike(), {key: 'Strike', actor, _source: {key: 'Strike', slug: null, ...source}, label,
    slug: source.slug ?? slug ?? sluggify(label)});
}
const installStrike = (Strike, options = {}) => installStrikeRuleSlug({StrikeClass: Strike, sluggify, isEnabled: () => true,
  englishText: key => ENGLISH[key], ...options});
const strikeKeys = rule => { rule.beforePrepareData(); return Object.keys(rule.actor.synthetics.strikes); };

test('NPC Strike rules without a slug take the English slug of their i18n label', () => {
  const {Strike} = strikes();
  const dispose = installStrike(Strike);
  try {
    const rule = strikeRule(Strike), source = structuredClone(rule._source);
    assert.deepEqual(strikeKeys(rule), ['jaws']);
    assert.equal(rule.slug, 'jaws');
    assert.equal(rule.label, '噬咬');
    assert.deepEqual(rule._source, source);
    assert.deepEqual(strikeKeys(strikeRule(Strike, {type: 'character'})), ['噬咬']);
    assert.deepEqual(strikeKeys(strikeRule(Strike, {source: {label: 'PF2E.BattleForm.Attack.Jaws', slug: 'bite'}})), ['bite']);
    assert.deepEqual(strikeKeys(strikeRule(Strike, {source: {label: '噬咬'}})), ['噬咬']);
    assert.deepEqual(strikeKeys(strikeRule(Strike, {source: {label: 'PF2E.Test.Missing'}})), ['pf2e-test-missing']);
    assert.deepEqual(strikeKeys(strikeRule(Strike, {source: {label: 'PF2E.Test.Item'}})), ['item-噬咬']);
    // A slug PF2e set itself (the fist option) is not the localized-label fallback.
    assert.deepEqual(strikeKeys(strikeRule(Strike, {slug: 'fist'})), ['fist']);
  } finally { dispose(); }
  assert.deepEqual(strikeKeys(strikeRule(Strike)), ['噬咬']);
  let enabled = false;
  const gated = installStrike(Strike, {isEnabled: () => enabled});
  try {
    assert.deepEqual(strikeKeys(strikeRule(Strike)), ['噬咬']);
    enabled = true;
    assert.deepEqual(strikeKeys(strikeRule(Strike)), ['jaws']);
  } finally { gated(); }
});

test('BoB\'s rule display keeps its Chinese strike name over the English slug, in either install order', () => {
  for (const order of ['slug-first', 'display-first']) {
    const {Strike} = strikes();
    class Weapon { toNPCAttacks() { return []; } }
    class Item { getDescription() {} getDescriptionData() {} }
    class NPC { prepareDerivedData() {} }
    const match = {binding: {key: 'test-jaws'}, rule: {key: 'Strike', index: 1, source: {key: 'Strike', label: 'PF2E.BattleForm.Attack.Jaws'},
      fields: [{path: 'system.rules.1.label', before: 'PF2E.BattleForm.Attack.Jaws', after: '颚咬'}]}};
    const display = () => installBobRuleDisplayConsumers({classes: {FlatModifier: class { beforePrepareData() {} }, Immunity: class { getIWR() {} },
      Strike, SpecialStatistic: class { afterPrepareData() {} }, ItemAlteration: class { applyAlteration() {} }, Weapon, Item, NPC},
    identity: {resolveRule: rule => rule instanceof Strike ? match : null}, isEnabled: () => true, getLocale: () => 'cn',
    localize: key => CHINESE[key] ?? key});
    const installed = order === 'slug-first' ? [installStrike(Strike), display()] : [display(), installStrike(Strike)];
    try {
      const rule = strikeRule(Strike);
      assert.deepEqual(strikeKeys(rule), ['jaws'], order);
      const weapon = rule.actor.synthetics.strikes.jaws();
      assert.equal(weapon.name, '颚咬', order);
      assert.equal(weapon.system.slug, 'jaws', order);
    } finally {
      for (const dispose of installed.reverse()) typeof dispose === 'function' ? dispose() : dispose.dispose();
    }
  }
});

test('Strike slugs join a libWrapper-managed beforePrepareData', () => {
  const {Strike, path} = strikes();
  const mock = createMockLibWrapper();
  mock.libWrapper.register('other-module', path('Strike.prototype.beforePrepareData'), function (next, ...args) {
    return next(...args);
  }, 'WRAPPER');
  const dispose = installStrike(Strike, {libWrapper: mock.libWrapper});
  try { assert.deepEqual(strikeKeys(strikeRule(Strike)), ['jaws']); } finally { dispose(); }
  assert.deepEqual(strikeKeys(strikeRule(Strike)), ['噬咬']);
  const missing = strikes();
  delete missing.Strike.prototype.beforePrepareData;
  assert.throws(() => installStrike(missing.Strike));
});

test('the i18nInit entry installs only in Chinese and warns instead of half-installing', async () => {
  const previous = {Hooks: globalThis.Hooks, game: globalThis.game, CONFIG: globalThis.CONFIG, foundry: globalThis.foundry};
  const warn = console.warn;
  const getProperty = (object, key) => key.split('.').reduce((value, part) => value?.[part], object);
  const run = async (lang, {strike = true} = {}) => {
    const world = classes(), {Strike} = strikes(), callbacks = [], warnings = [];
    globalThis.Hooks = {once(name, callback) { if (name === 'i18nInit') callbacks.push(callback); }};
    globalThis.game = {system: {id: 'pf2e'}, i18n: {lang, _fallback: {PF2E: {BattleForm: {Attack: {Jaws: 'Jaws'}}}}},
      pf2e: {system: {sluggify}, RuleElements: {builtin: strike ? {Strike} : {}}}};
    globalThis.CONFIG = {PF2E: {attackEffects: LABELS, Actor: {documentClasses: {npc: world.NPC, hazard: world.Hazard}}}};
    globalThis.foundry = {utils: {getProperty}};
    console.warn = (...args) => warnings.push(String(args[0]));
    const native = {attack: world.NPC.prototype.getAttackEffects, strike: Strike.prototype.beforePrepareData};
    await import(`../scripts/npc-english-slug-compat.mjs?case=${++counter}`);
    for (const callback of callbacks) callback();
    return {warnings, attack: world.NPC.prototype.getAttackEffects !== native.attack, strike: Strike.prototype.beforePrepareData !== native.strike,
      jaws: strikeKeys(strikeRule(Strike))};
  };
  try {
    assert.deepEqual(await run('cn'), {warnings: [], attack: true, strike: true, jaws: ['jaws']});
    assert.deepEqual(await run('en'), {warnings: [], attack: false, strike: false, jaws: ['噬咬']});
    const missing = await run('zh-CN', {strike: false});
    assert.equal(missing.attack, true);
    assert.equal(missing.warnings.length, 1);
    assert.match(missing.warnings[0], /Strike rules keep the slug/);
  } finally { Object.assign(globalThis, previous); console.warn = warn; }
});
