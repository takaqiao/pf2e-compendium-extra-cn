import assert from 'node:assert/strict';
import test from 'node:test';
import {createMockLibWrapper, loadRealLibWrapper} from './support/libwrapper.mjs';
import {installBobIdentityCompatibility} from '../scripts/bob-identity-core.mjs';
import {installBobRuleDisplayConsumers} from '../scripts/bob-rule-display-core.mjs';

const REAL = process.env.EXTRA_TEST_LIBWRAPPER;
const real = REAL ? await loadRealLibWrapper(REAL) : null;
const EXTRA = 'pf2e-compendium-extra-cn';
const sluggify = value => value.toLowerCase().replaceAll(' ', '-');
let counter = 0;

// Each scenario builds a fresh world; other packages wrap it through env.register.
function environments() {
  const list = [['mock', () => {
    const mock = createMockLibWrapper();
    return {libWrapper: mock.libWrapper, registrations: mock.registrations,
      register: (packageId, path, fn) => mock.libWrapper.register(packageId, path, fn, 'WRAPPER')};
  }]];
  if (real) {
    list.push(['real libWrapper 1.13.5.1', () => ({libWrapper: real.libWrapper,
      register: (packageId, path, fn) => real.libWrapper.register(packageId, path, fn, 'WRAPPER')})]);
    list.push(['real libWrapper 1.13.5.1 FAST', () => ({libWrapper: real.libWrapper,
      register: (packageId, path, fn) => real.libWrapper.register(packageId, path, fn, 'WRAPPER', {perf_mode: 'FAST'})})]);
  }
  return list;
}

const observe = actor => `${actor.claw.slug}|${actor.fist.name}`;

// PF2e-shaped classes for both cores. `entry` selects the SpellcastingEntry
// getRollOptions: PF2e 8.7.0's own source, or one that reads a name or slug.
function world({entry = 'native'} = {}) {
  const name = `BobLaneWorld${++counter}`;
  class ItemBase {
    get slug() { return this.system?.slug ?? null; }
    getRollOptions(prefix = 'item') { return [`${prefix}:${this.name}`]; }
    getDescription() { return Promise.resolve(this.name); }
    getDescriptionData() { return Promise.resolve({}); }
  }
  class Lore extends ItemBase { get slug() { return sluggify(this.name); } }
  class Melee extends ItemBase { prepareSiblingData() {} }
  class Weapon extends ItemBase { toNPCAttacks() { return []; } }
  const SpellcastingEntry = {
    native: class extends ItemBase {
      getRollOptions(e = this.type) { return [`${e}:${this.attribute}`, `${e}:attribute:${this.attribute}`, `${e}:${this.category}`, `${e}:category:${this.category}`, `${e}:${this.tradition}`, `${e}:tradition:${this.tradition}`]; }
    },
    name: class extends ItemBase { getRollOptions(e = this.type) { return [`${e}:${this.name}`]; } },
    slug: class extends ItemBase { getRollOptions(e = this.type) { return [`${e}:${this.slug}`]; } },
  }[entry];
  class FlatModifier { beforePrepareData() {} }
  class Immunity { getIWR() { return []; } }
  class Strike { beforePrepareData() { this.actor.synthetics.strikes.fist = () => this.actor.fist; } }
  class SpecialStatistic { afterPrepareData() {} }
  class ItemAlteration { applyAlteration() {} }
  function prepare(actor) {
    actor.log.push(['native', observe(actor)]);
    actor.system.actions = [
      {item: actor.claw, label: 'Claw', damage() { return actor.claw.slug; }, additionalEffects: []},
      {item: actor.fist, label: 'Fist', additionalEffects: []},
    ];
  }
  class NPC { getAttackEffects() { return []; } prepareDerivedData() { prepare(this); } }
  class Hazard { prepareDerivedData() { prepare(this); } }
  const classes = {ItemBase, Lore, Melee, Weapon, SpellcastingEntry, FlatModifier, Immunity, Strike, SpecialStatistic,
    ItemAlteration, NPC, Hazard};
  globalThis[name] = classes;

  const source = {folder: null, _stats: {compendiumSource: null}};
  const actor = (Class, id) => {
    const self = Object.assign(new Class(), {id, type: id, _source: source, system: {}, log: [], synthetics: {strikes: {}}});
    self.claw = Object.assign(new Melee(), {id: 'claw', type: 'melee', name: '爪 Claw', system: {slug: null}, _source: source, actor: self});
    self.items = [self.claw];
    self.itemTypes = {melee: [self.claw]};
    self.rule = Object.assign(new Strike(), {key: 'Strike', label: 'Fist', actor: self});
    self.fist = {rule: self.rule, actor: self, name: 'Fist', system: {slug: 'fist'}, _source: {name: 'Fist', system: {slug: 'fist'}}};
    return self;
  };
  const lore = Object.assign(new Lore(), {id: 'lore', type: 'lore', name: '旧学识 Old Lore', system: {slug: null}, _source: source});
  const identities = [
    ...['npc', 'hazard'].map(kind => ({scope: 'actorItem', actorId: kind, actorType: kind, itemId: 'claw', itemType: 'melee',
      itemFolderId: null, itemSourceUuid: null, actorFolderId: null, actorSourceUuid: null,
      originalName: 'Claw', approvedName: '爪 Claw', itemSlug: null})),
    {scope: 'worldItem', itemId: 'lore', itemType: 'lore', itemFolderId: null, itemSourceUuid: null,
      originalName: 'Old Lore', approvedName: '旧学识 Old Lore', itemSlug: null},
  ];
  const match = {binding: {key: 'fist'}, rule: {key: 'Strike', index: 0, source: {key: 'Strike', slug: 'fist'},
    fields: [{path: 'name', before: 'Fist', after: '拳 Fist'}]}};
  const targets = [[ItemBase, 'getRollOptions'], [ItemBase, 'getDescription'], [Lore, 'slug'], [Melee, 'slug'],
    [Melee, 'prepareSiblingData'], [Weapon, 'toNPCAttacks'], [SpellcastingEntry, 'getRollOptions'],
    [FlatModifier, 'beforePrepareData'], [Immunity, 'getIWR'], [Strike, 'beforePrepareData'],
    [SpecialStatistic, 'afterPrepareData'], [ItemAlteration, 'applyAlteration'],
    [NPC, 'getAttackEffects'], [NPC, 'prepareDerivedData'], [Hazard, 'prepareDerivedData']];
  return {...classes, lore, actors: {npc: actor(NPC, 'npc'), hazard: actor(Hazard, 'hazard')},
    path: key => `${name}.${key}`,
    snapshot: () => targets.map(([Class, key]) => Object.getOwnPropertyDescriptor(Class.prototype, key)),
    installIdentity: libWrapper => installBobIdentityCompatibility({itemClasses: [Lore, Melee, Weapon, SpellcastingEntry],
      LoreClass: Lore, NPCClass: NPC, HazardClass: Hazard, MeleeClass: Melee, sluggify, isEnabled: () => true,
      identities, libWrapper}),
    installRules: libWrapper => installBobRuleDisplayConsumers({classes: {FlatModifier, Immunity, Strike, SpecialStatistic,
      ItemAlteration, Weapon, Item: ItemBase, NPC}, identity: {resolveRule: rule => rule instanceof Strike ? match : null},
      isEnabled: () => true, getLocale: () => 'cn', localize: key => key, libWrapper}),
  };
}

// The Strike rule creates the synthetic strike whose name and NPC action label rule display projects.
function projectStrike(actor) {
  actor.rule.beforePrepareData();
  actor.synthetics.strikes.fist();
}

function prepared(actor) {
  actor.log.length = 0;
  actor.prepareDerivedData();
  const [claw, fist] = actor.system.actions;
  return {log: actor.log.slice(), slug: actor.claw.slug, damage: claw.damage(), name: actor.fist.name, label: fist.label};
}

const passThrough = function (next, ...args) {
  this.log.push(['other', observe(this)]);
  return next(...args);
};
const lanes = env => env.registrations?.().filter(entry => entry.endsWith(':prepareDerivedData')).sort();

for (const [label, create] of environments()) {
  test(`${label}: identity joins managed NPC and hazard preparation and leaves the chain on dispose`, () => {
    const reference = world();
    const own = reference.installIdentity(null);
    const expected = {slug: null, damage: 'claw', name: 'Fist', label: 'Fist'};
    for (const actor of Object.values(reference.actors)) {
      assert.deepEqual(prepared(actor), {...expected, log: [['native', 'claw|Fist']]});
    }
    own();

    const env = create();
    const current = world();
    for (const key of ['NPC', 'Hazard']) env.register('other-module', current.path(`${key}.prototype.prepareDerivedData`), passThrough);
    const dispose = current.installIdentity(env.libWrapper);
    for (const actor of Object.values(current.actors)) {
      assert.deepEqual(prepared(actor), {...expected, log: [['other', 'claw|Fist'], ['native', 'claw|Fist']]});
    }
    if (env.registrations) assert.deepEqual(lanes(env), ['other-module:prepareDerivedData', 'other-module:prepareDerivedData',
      `${EXTRA}:prepareDerivedData`, `${EXTRA}:prepareDerivedData`]);
    dispose();
    dispose();
    for (const actor of Object.values(current.actors)) {
      assert.deepEqual(prepared(actor), {...expected, damage: null, log: [['other', 'null|Fist'], ['native', 'null|Fist']]});
    }
    if (env.registrations) assert.deepEqual(lanes(env), ['other-module:prepareDerivedData', 'other-module:prepareDerivedData']);
  });

  test(`${label}: identity leaves a managed getRollOptions whose original reads no name or slug to its chain`, () => {
    const env = create();
    const current = world();
    env.register('other-module', current.path('SpellcastingEntry.prototype.getRollOptions'), function (next, ...args) {
      return [...next(...args), `${this.type}:id:${this.id}`];
    });
    const entry = Object.assign(new current.SpellcastingEntry(), {id: 'entry', type: 'spellcasting', name: '先天 Innate',
      attribute: 'cha', category: 'innate', tradition: 'occult'});
    const options = ['spellcasting:cha', 'spellcasting:attribute:cha', 'spellcasting:innate', 'spellcasting:category:innate',
      'spellcasting:occult', 'spellcasting:tradition:occult', 'spellcasting:id:entry'];
    const dispose = current.installIdentity(env.libWrapper);
    try {
      assert.deepEqual(entry.getRollOptions(), options);
      // The unmanaged base layer is still adapted for an approved item.
      assert.deepEqual(current.lore.getRollOptions(), ['item:Old Lore']);
    } finally { dispose(); }
    assert.deepEqual(entry.getRollOptions(), options);
    assert.deepEqual(current.lore.getRollOptions(), ['item:旧学识 Old Lore']);
  });

  test(`${label}: identity still refuses managed methods that need a substituted receiver`, () => {
    for (const [entry, key] of [['name', 'SpellcastingEntry.prototype.getRollOptions'], ['slug', 'SpellcastingEntry.prototype.getRollOptions'],
      ['native', 'NPC.prototype.getAttackEffects']]) {
      const env = create();
      const current = world({entry});
      env.register('other-module', current.path(key), function (next, ...args) { return next(...args); });
      const before = current.snapshot();
      assert.throws(() => current.installIdentity(env.libWrapper), /getRollOptions|identity consumers/, `${entry} ${key}`);
      assert.deepEqual(current.snapshot(), before);
    }
  });

  test(`${label}: rule display projects through a managed NPC preparation as it does through an own method`, () => {
    const expected = {slug: null, damage: null, name: '拳 Fist', label: '拳 Fist'};
    const reference = world();
    const own = reference.installRules(null);
    projectStrike(reference.actors.npc);
    // Native preparation keeps seeing the native strike name.
    assert.deepEqual(prepared(reference.actors.npc), {...expected, log: [['native', 'null|Fist']]});
    own.dispose();

    const env = create();
    const current = world();
    const npc = current.actors.npc;
    env.register('other-module', current.path('NPC.prototype.prepareDerivedData'), passThrough);
    const consumers = current.installRules(env.libWrapper);
    projectStrike(npc);
    assert.deepEqual(prepared(npc), {...expected, log: [['other', 'null|Fist'], ['native', 'null|Fist']]});
    if (env.registrations) assert.deepEqual(lanes(env), ['other-module:prepareDerivedData', `${EXTRA}:prepareDerivedData`]);
    consumers.dispose();
    assert.equal(consumers.active, false);
    assert.deepEqual(prepared(npc), {...expected, name: 'Fist', label: 'Fist', log: [['other', 'null|Fist'], ['native', 'null|Fist']]});
    if (env.registrations) assert.deepEqual(lanes(env), ['other-module:prepareDerivedData']);
  });

  test(`${label}: identity and rule display share one registration between earlier and later packages`, () => {
    const env = create();
    const current = world();
    const npc = current.actors.npc;
    const path = current.path('NPC.prototype.prepareDerivedData');
    env.register('other-module', path, function (next, ...args) {
      this.log.push(['other:before', observe(this)]);
      const result = next(...args);
      this.log.push(['other:after', this.system.actions[1].label]);
      return result;
    });
    // bob-2 order: both install at i18nInit, identity's script first in module.json.
    const identity = current.installIdentity(env.libWrapper);
    const rules = current.installRules(env.libWrapper);
    env.register('third-module', path, function (next, ...args) {
      this.log.push(['third:before', observe(this)]);
      const result = next(...args);
      const [claw, fist] = this.system.actions;
      this.log.push(['third:after', `${fist.label}|${claw.damage()}`]);
      return result;
    });
    // Identity collects approved melee items on entry. Rule display's preparation
    // scope (native strike name) is visible there only if rule display is outer.
    Object.defineProperty(npc, 'itemTypes', {configurable: true, get() {
      npc.log.push(['identity', observe(npc)]);
      return {melee: [npc.claw]};
    }});
    projectStrike(npc);
    assert.deepEqual(prepared(npc).log, [
      ['third:before', 'null|拳 Fist'],
      ['identity', 'null|Fist'],
      ['other:before', 'claw|Fist'],
      ['native', 'claw|Fist'],
      ['other:after', 'Fist'],
      ['third:after', '拳 Fist|claw'],
    ]);
    if (env.registrations) assert.deepEqual(lanes(env), ['other-module:prepareDerivedData', `${EXTRA}:prepareDerivedData`,
      'third-module:prepareDerivedData']);

    identity();
    assert.deepEqual(prepared(npc).log, [['third:before', 'null|拳 Fist'], ['other:before', 'null|Fist'], ['native', 'null|Fist'],
      ['other:after', 'Fist'], ['third:after', '拳 Fist|null']]);
    rules.dispose();
    assert.deepEqual(prepared(npc).log, [['third:before', 'null|Fist'], ['other:before', 'null|Fist'], ['native', 'null|Fist'],
      ['other:after', 'Fist'], ['third:after', 'Fist|null']]);
    if (env.registrations) assert.deepEqual(lanes(env), ['other-module:prepareDerivedData', 'third-module:prepareDerivedData']);
  });

  test(`${label}: a managed target without the libWrapper API fails before any change`, () => {
    const env = create();
    const current = world();
    env.register('other-module', current.path('NPC.prototype.prepareDerivedData'), passThrough);
    const before = current.snapshot();
    assert.throws(() => current.installIdentity(null), /libWrapper is unavailable/);
    assert.throws(() => current.installRules({register() {}}), /libWrapper unavailable for managed NPC\.prepareDerivedData/);
    assert.deepEqual(current.snapshot(), before);
    // Nothing was left half-installed.
    const dispose = current.installIdentity(env.libWrapper);
    const consumers = current.installRules(env.libWrapper);
    consumers.dispose();
    dispose();
    assert.deepEqual(current.snapshot(), before);
  });

  test(`${label}: rule display still refuses a managed Item.getDescription`, () => {
    const env = create();
    const current = world();
    env.register('other-module', current.path('ItemBase.prototype.getDescription'), function (next, ...args) { return next(...args); });
    const before = current.snapshot();
    assert.throws(() => current.installRules(env.libWrapper), /Native consumer unavailable: Item\.getDescription/);
    assert.deepEqual(current.snapshot(), before);
  });
}

test('real libWrapper run was requested', {skip: !REAL && 'set EXTRA_TEST_LIBWRAPPER to lib-wrapper.js 1.13.5.1'}, () => {
  assert.equal(real.libWrapper.version, '1.13.5.1');
});
