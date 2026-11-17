import assert from 'node:assert/strict';
import test from 'node:test';
import {installBobIdentityCompatibility} from '../scripts/bob-identity-core.mjs';

// Unicode-preserving like PF2e's sluggify: a bilingual name keeps its Chinese half.
const sluggify = value => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');
const clone = structuredClone;

class Items extends Map {
  find(predicate) { for (const item of this.values()) if (predicate(item)) return item; }
  get contents() { return [...this.values()]; }
}
class ItemBase { get slug() { return this.system.slug ?? null; } getRollOptions() { return []; } }
class Lore extends ItemBase { get slug() { return sluggify(this.name); } }
class Melee extends ItemBase { prepareSiblingData() {} }
class Actor {}
class NPC extends Actor {
  // PF2e 8.7.1 getAttackEffects reduced to its Item lookup (pf2e.mjs:38119).
  async getAttackEffects(strike) {
    return strike.system.attackEffects.value.map(tag => this.items.find(item => item.type !== 'melee'
      && (item.slug ?? sluggify(item.name)) === sluggify(tag))?.name ?? null);
  }
  prepareDerivedData() { this.preparedSlugs = this.itemTypes.melee.map(item => item.slug); }
}
class Hazard extends Actor { prepareDerivedData() {} }
class Scene {}
class Token {}
class ActorDelta { static applyDelta() {} }

const ACTOR = {_id: 'armor', type: 'npc', name: '测试盔甲 Test Armor', folder: 'bestiary',
  _stats: {compendiumSource: 'Compendium.test.Actor.armor'}};
const GLAIVE = {_id: 'glaive', type: 'melee', name: '大砍刀 Glaive', img: 'glaive.webp', folder: null, flags: {}, effects: [],
  _stats: {compendiumSource: null}, system: {slug: null, attackEffects: {value: ['rust-fever']}, rules: []}};
const FEVER = {_id: 'fever', type: 'action', name: '锈热 Rust Fever', img: 'fever.webp', folder: null, flags: {}, effects: [],
  _stats: {compendiumSource: 'Compendium.test.Item.fever'},
  system: {slug: null, rules: [{key: 'RollOption', option: 'rust-fever', toggleable: true, value: false}]}};
const actorRow = (source, originalName) => ({scope: 'actorItem', actorId: ACTOR._id, actorType: 'npc', actorFolderId: ACTOR.folder,
  actorSourceUuid: ACTOR._stats.compendiumSource, itemId: source._id, itemType: source.type, itemFolderId: null,
  itemSourceUuid: source._stats.compendiumSource, originalName, approvedName: source.name, itemSlug: null});
const ROWS = [actorRow(GLAIVE, 'Glaive'), actorRow(FEVER, 'Rust Fever')];

function actorDocument(source, items, extra = {}) {
  const actor = Object.assign(new NPC(), {id: source._id, type: source.type, name: source.name, _source: clone(source),
    system: {}, items: new Items(), isToken: false, parent: null}, extra);
  for (const itemSource of items) {
    const Class = itemSource.type === 'melee' ? Melee : ItemBase;
    actor.items.set(itemSource._id, Object.assign(new Class(), {id: itemSource._id, type: itemSource.type, name: itemSource.name,
      system: clone(itemSource.system), _source: clone(itemSource), actor, parent: actor}));
  }
  actor.itemTypes = {melee: actor.items.contents.filter(item => item.type === 'melee')};
  return actor;
}

// An unlinked token whose delta holds `copies` (PF2e's migration writes every base Item there).
function scene({copies = [GLAIVE, FEVER], base = actorDocument(ACTOR, [GLAIVE, FEVER])} = {}) {
  const world = Object.assign(new Scene(), {id: 'scene', name: '大厅 Hall', _source: {_id: 'scene', name: '大厅 Hall', width: 100, height: 100}});
  const token = Object.assign(new Token(), {id: 'token', name: base.name, parent: world, actorId: ACTOR._id, actorLink: false,
    isLinked: false, baseActor: base});
  token._source = {_id: 'token', name: base.name, actorId: ACTOR._id, actorLink: false, delta: {_id: 'token', items: clone(copies)}};
  world.tokens = new Map([[token.id, token]]);
  const byId = new Map([[GLAIVE, FEVER].map(source => [source._id, source]), copies.map(copy => [copy._id, copy])].flat());
  const synthetic = actorDocument(ACTOR, [...byId.values()], {isToken: true, token, parent: token});
  const delta = Object.assign(new ActorDelta(), {parent: token, syntheticActor: synthetic, _source: clone(token._source.delta)});
  Object.assign(token, {delta, actor: synthetic});
  return {base, token, synthetic, delta};
}

function install(identities = ROWS) {
  return installBobIdentityCompatibility({itemClasses: [Lore, Melee, ItemBase], LoreClass: Lore, NPCClass: NPC,
    HazardClass: Hazard, MeleeClass: Melee, ActorClass: Actor, ActorDeltaClass: ActorDelta, TokenDocumentClass: Token,
    SceneClass: Scene, sluggify, isEnabled: () => true, identities});
}

async function observe(actor) {
  actor.prepareDerivedData();
  return {effects: await actor.getAttackEffects(actor.items.get('glaive')), slugs: actor.preparedSlugs};
}
const APPROVED = {effects: ['锈热 Rust Fever'], slugs: ['glaive']};
const NATIVE = {effects: [null], slugs: [null]};

test('migration copies identical to the base Items keep the base actorItem identity', async () => {
  const dispose = install();
  try {
    const {base, synthetic} = scene();
    assert.deepEqual(await observe(base), APPROVED);
    assert.deepEqual(await observe(scene({copies: []}).synthetic), APPROVED);
    assert.deepEqual(await observe(synthetic), APPROVED);
  } finally { dispose(); }
});

test('copies with toggled rules, locations or flags still keep the base identity', async () => {
  const glaive = clone(GLAIVE), fever = clone(FEVER);
  glaive.system.location = 'held';
  glaive.flags = {pf2e: {rulesSelections: {grip: 'two-handed'}}};
  fever.system.rules[0].value = true;
  fever._stats.modifiedTime = 1;
  const dispose = install();
  try {
    assert.deepEqual(await observe(scene({copies: [glaive, fever]}).synthetic), APPROVED);
  } finally { dispose(); }
});

test('a copy whose identity fields differ from the base Item gets no identity', async () => {
  // The copy still equals the approved row; only the base Item has changed since.
  const variants = [['name', '大砍刀（改） Glaive'], ['folder', 'moved'], ['_stats.compendiumSource', 'Compendium.test.Item.other'],
    ['type', 'weapon'], ['system.slug', 'glaive']];
  for (const [path, value] of variants) {
    const base = clone(GLAIVE);
    const keys = path.split('.'), key = keys.pop();
    keys.reduce((object, part) => object[part], base)[key] = value;
    const dispose = install();
    try {
      const {synthetic} = scene({base: actorDocument(ACTOR, [base, FEVER])});
      assert.deepEqual((await observe(synthetic)).slugs, [null], path);
    } finally { dispose(); }
  }
});

test('a copy is not authorized without its base actor or base Item', async () => {
  for (const base of [null, actorDocument(ACTOR, [FEVER])]) {
    const dispose = install();
    try {
      const {token, synthetic} = scene();
      token.baseActor = base;
      assert.deepEqual((await observe(synthetic)).slugs, [null]);
    } finally { dispose(); }
  }
});

// Mirrors bob-token-item-identity.mjs: the projection a tokenItem row stores.
const projection = source => ({_id: source._id, type: source.type, folder: source.folder ?? null, img: source.img ?? null,
  sourceUuid: source._stats?.compendiumSource ?? null, effects: source.effects ?? [], flags: source.flags ?? {},
  system: Object.fromEntries(Object.entries(source.system).filter(([key]) => !['description', 'publication', '_migration'].includes(key)))});
const tokenRow = (source, originalName) => ({scope: 'tokenItem', sceneId: 'scene', tokenId: 'token', actorId: ACTOR._id,
  itemId: source._id, sceneName: '大厅 Hall', tokenName: ACTOR.name, actorName: ACTOR.name, actorType: 'npc',
  actorFolderId: ACTOR.folder, actorSourceUuid: ACTOR._stats.compendiumSource, itemType: source.type, approvedName: source.name,
  itemSlug: null, originalName, itemProjection: projection(source),
  sceneProjection: {_id: 'scene', folder: null, backgroundSrc: null, width: 100, height: 100},
  tokenProjection: {_id: 'token', actorId: ACTOR._id, actorLink: false, textureSrc: null}});

test('a registered token Item resolves only through its own tokenItem row', async () => {
  const dispose = install([...ROWS, tokenRow(GLAIVE, 'Glaive'), tokenRow(FEVER, 'Rust Fever')]);
  try {
    const {synthetic} = scene();
    assert.deepEqual(await observe(synthetic), APPROVED);
    // A rejected token binding is not relaxed to the actorItem row, even for an unchanged copy.
    synthetic.token.parent.name = synthetic.token.parent._source.name = '别处 Elsewhere';
    assert.deepEqual(await observe(synthetic), NATIVE);
  } finally { dispose(); }
});

test('inside the native applyDelta frame the base actor comes from its arguments', async () => {
  const {base, token, synthetic, delta} = scene();
  let observed;
  ActorDelta.applyDelta = function (newDelta) {
    // Native construction prepares the synthetic actor before the token links to it.
    observed = observe(synthetic);
    assert.equal(newDelta, delta);
  };
  // Any registered token row makes Extra track the applyDelta frame.
  const dispose = install([...ROWS, tokenRow({...GLAIVE, _id: 'other'}, 'Other')]);
  try {
    token.baseActor = undefined;
    delete token.delta;
    ActorDelta.applyDelta(delta, base);
    assert.deepEqual(await observed, APPROVED);
  } finally {
    dispose();
    ActorDelta.applyDelta = function () {};
  }
});
