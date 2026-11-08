import assert from 'node:assert/strict';
import test from 'node:test';
import {createMockLibWrapper, loadRealLibWrapper} from './support/libwrapper.mjs';
import {managedMethod} from '../scripts/bob-native-lane.mjs';
import {installBobMementoDisplay} from '../scripts/bob-memento-display-core.mjs';
import {installBobNoteDisplay} from '../scripts/bob-note-display-core.mjs';

const REAL = process.env.EXTRA_TEST_LIBWRAPPER;
const real = REAL ? await loadRealLibWrapper(REAL) : null;
const EXTRA = 'pf2e-compendium-extra-cn';
const clone = structuredClone;
const hash = 'a'.repeat(64);
let counter = 0;

// Each environment lets another package wrap targets before Extra installs.
function environments() {
  const list = [['mock', () => {
    const mock = createMockLibWrapper();
    return {libWrapper: mock.libWrapper, register: (path, fn) => mock.libWrapper.register('other-module', path, fn, 'WRAPPER')};
  }]];
  if (real) {
    list.push(['real libWrapper 1.13.5.1', () => ({libWrapper: real.libWrapper,
      register: (path, fn) => real.libWrapper.register('other-module', path, fn, 'WRAPPER')})]);
    // FAST mode switches the whole wrapper to static dispatch.
    list.push(['real libWrapper 1.13.5.1 FAST', () => ({libWrapper: real.libWrapper,
      register: (path, fn) => real.libWrapper.register('other-module', path, fn, 'WRAPPER', {perf_mode: 'FAST'})})]);
  }
  return list;
}

// Transparent wrappers from another package; records each target it passes through.
function wrapAsOther(env, name, paths) {
  const calls = [];
  for (const path of paths) env.register(`${name}.${path}`, function (next, ...args) { calls.push(path); return next(...args); });
  return calls;
}

// Extra holds a registration on this wrapper exactly when another one under its id is refused.
function extraRegistered(env, object, key) {
  const id = managedMethod(object, key).getter_id;
  try { env.libWrapper.register(EXTRA, id, function (next, ...args) { return next(...args); }, 'WRAPPER'); } catch (error) {
    if (/already been registered/.test(error.message)) return true;
    throw error;
  }
  env.libWrapper.unregister(EXTRA, id);
  return false;
}

const descriptors = objects => objects.map(object => Reflect.ownKeys(object).map(key => [key, Object.getOwnPropertyDescriptor(object, key)]));

// String DOM used by the Note core, as in bob-note-ready.test.mjs.
class HTML {
  constructor(value, leaf = false) {
    this.value = value; this.leaf = leaf;
    this.open = value.match(/^<li[^>]*>/)?.[0] ?? '';
    this.attributes = [...this.open.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, name, value]) => ({name, value}));
    this.childNodes = [value.slice(this.open.length, -5)];
  }
  get outerHTML() { return this.leaf ? this.open + this.childNodes.join('') + '</li>' : this.value; }
  querySelectorAll() { return this.nodes ?? []; }
  querySelector() { return this.querySelectorAll()[0] ?? null; }
  hasAttribute(name) { return this.attributes.some(a => a.name === name); }
  contains(node) { return this.nodes?.includes(node) ?? false; }
  replaceChildren(...nodes) { this.childNodes = nodes; }
}
function parse(value) {
  const dom = new HTML(value);
  dom.nodes = [...value.matchAll(/<li\b[^>]*>[\s\S]*?<\/li>/g)].map(([html]) => new HTML(html, true));
  return dom;
}

// Element trees walked by the memento core.
const text = textContent => ({nodeType: 3, textContent});
class TreeNode {
  constructor(tagName, attributes = {}, childNodes = []) {
    Object.assign(this, {tagName, attributes: {...attributes}, childNodes, nodeType: 1});
    this.classList = {contains: name => (this.attributes.class ?? '').split(' ').includes(name)};
    for (const node of childNodes) node.parentElement = this;
  }
  get children() { return this.childNodes.filter(node => node.nodeType === 1); }
  get textContent() { return this.childNodes.map(node => node.textContent).join(''); }
  set textContent(value) { this.childNodes = [text(value)]; }
  getAttribute(name) { return this.attributes[name] ?? null; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
}
const el = (...args) => new TreeNode(...args);
const serialize = node => node.nodeType === 3 ? node.textContent : `<${node.tagName}${Object.entries(node.attributes)
  .map(([key, value]) => ` ${key}="${value}"`).join('')}${'value' in node ? ` value="${node.value}"` : ''}>${node.childNodes.map(serialize).join('')}</${node.tagName}>`;

function noteWorld() {
  const previous = {document: globalThis.document, HTMLElement: globalThis.HTMLElement};
  globalThis.HTMLElement = HTML;
  globalThis.document = {createElement: () => ({set innerHTML(value) { this.content = parse(value); }})};
  const state = {user: {id: 'local', isGM: true, role: 4}, enrichments: 0, onEnrich: null}, native = [];
  const sourceRule = {key: 'Note', selector: ['damage-received'], title: '{item|name}', text: 'Native bleed note.', predicate: ['bleed'], visibility: null};
  const row = {approved: true, scope: 'worldItem', actorId: null, itemId: 'hemophobia', itemType: 'effect', itemName: '效果：恐血症 Effect: Hemophobia',
    itemSourceUuid: null, itemSlug: null, description: '恐血症正文。', descriptionGM: '', ruleIndex: 0, sourceRule, sourceRuleSha256: hash,
    display: {title: '效果：恐血症', text: '受到流血伤害时恶心2。'}, approvalHashes: {title: hash, text: hash}, nativeEnglish: {},
    markerIdentity: {scope: 'worldItem', itemId: 'hemophobia', itemType: 'effect', approvedName: '效果：恐血症 Effect: Hemophobia', sourceFingerprint: hash, approvalFingerprint: hash}};
  const variant = clone(row);
  variant.sourceRule.text = 'BASTION.RULES.LucidNightmares.Hemophobia.Note';
  variant.sourceRuleSha256 = 'b'.repeat(64);
  variant.nativeEnglish = {[variant.sourceRule.text]: 'Native bleed note.'};
  row.sourceVariants = [variant];
  class Actor {
    constructor() {
      this._source = {_id: 'owner', name: 'Owner', type: 'npc'};
      Object.assign(this, this._source, {id: 'owner', parent: null, isToken: false, items: new Map(), synthetics: {rollNotes: {}}, isOwner: true, hasPlayerOwner: true});
    }
  }
  class Item {
    constructor(actor) {
      this._source = {_id: 'copy', type: 'effect', name: row.itemName, system: {slug: null, description: {value: row.description, gm: ''},
        rules: [clone(variant.sourceRule)]}, flags: {[EXTRA]: {bobIdentity: {version: 1, key: 'worldItem//hemophobia', sourceFingerprint: hash, approvalFingerprint: hash}}}};
      Object.assign(this, clone(this._source), {id: 'copy', actor, parent: actor, rules: []});
      actor.items.set(this.id, this);
    }
    get description() { return this.system.description.value; }
  }
  class Note {
    constructor(data) { Object.assign(this, data); }
    toObject() { return clone(Object.fromEntries(['selector', 'title', 'text', 'predicate', 'outcome', 'visibility'].map(key => [key, this[key]]))); }
    clone() { return new Note({...this.toObject(), rule: this.rule}); }
    toHTML() {
      const body = this.text === variant.sourceRule.text ? 'Native bleed note.' : this.text;
      return new HTML(`<li class="roll-note"${this.rule ? ` data-item-id="${this.rule.item.id}"` : ''}><strong>${this.title}</strong> ${body}</li>`, true);
    }
  }
  class Rule {
    constructor(item) { Object.assign(this, clone(item.system.rules[0]), {item, actor: item.actor, sourceIndex: 0, ignored: false, outcome: []}); }
    beforePrepareData() {
      const note = new Note({selector: this.selector[0], title: this.item.name.replace(/^[^:]+:\s*/, ''), text: this.text,
        predicate: clone(this.predicate), outcome: [], visibility: this.visibility, rule: this});
      this.actor.synthetics.rollNotes['damage-received'] = [note];
    }
  }
  class Editor {
    static async enrichHTML(value) { state.onEnrich?.(++state.enrichments); return value; }
  }
  class Chat {
    constructor(source) { this._source = clone(source); this.speakerActor = this.actor = actor; this.isContentVisible = true; }
    _onCreate() { native.push('_onCreate'); state.firstRender = this.renderHTML(); }
    async renderHTML() {
      native.push('renderHTML');
      if (this.nativeCard) return this.nativeCard();
      return parse(await Editor.enrichHTML(this._source.flavor));
    }
    getRollData() { return {actor}; }
  }
  const actor = new Actor(), item = new Item(actor);
  function prepare() {
    const rule = new Rule(item); item.rules = [rule]; actor.synthetics.rollNotes = {};
    rule.beforePrepareData();
  }
  function createFrom(note) {
    const source = {speaker: {actor: actor.id}, flags: {pf2e: {context: {type: 'damage-taken'}}}, flavor: note.toHTML().outerHTML};
    const message = new Chat(source); message._onCreate(source, {}, state.user.id); return message;
  }
  const name = `NoteLane${++counter}`, classes = {Rule, Note, Chat};
  globalThis[name] = classes;
  return {name, classes, state, native, actor, prepare, createFrom,
    install: (options = {}) => installBobNoteDisplay({NoteRuleClass: Rule, ItemClass: Item, ActorClass: Actor, ChatMessageClass: Chat,
      TextEditorClass: Editor, bindings: [row], isEnabled: () => true, getUser: () => state.user, getActors: () => [actor], ...options}),
    close() { Object.assign(globalThis, previous); delete globalThis[name]; }};
}

function mementoWorld({Chat} = {}) {
  const actors = new Map(), native = [], user = {id: 'gm', isGM: true};
  class Actor {
    constructor(source) {
      this._source = clone(source);
      Object.assign(this, clone(source), {id: source._id, parent: null, isToken: false, collection: actors, items: new Map(), visible: true});
      actors.set(this.id, this);
    }
    transferItemToActor(target, item, prefix = 'Returned ') {
      native.push('transferItemToActor');
      const copy = item.toObject();
      copy._id = 'copy'; copy.name = prefix + copy.name; copy.system.hp.max = 1;
      return new Item(copy, target);
    }
  }
  class Item {
    constructor(source, actor) {
      this._source = clone(source);
      Object.assign(this, clone(source), {id: source._id, parent: actor, actor, collection: actor.items, isIdentified: true, visible: true,
        uuid: `Actor.${actor.id}.Item.${source._id}`});
      actor.items.set(this.id, this);
    }
    get slug() { return this.system.slug; }
    toObject() { return clone(this._source); }
  }
  class ItemSheet {
    constructor(item) { this.item = this.object = item; this._state = 1; }
    get title() { return this.item.name; }
    async _renderInner() { return []; }
    _getSubmitData(update = {}) { native.push('_getSubmitData'); return {name: this.form.children[0].value, ...update}; }
    _updateObject() {}
    close() { native.push('close'); this._state = 0; }
  }
  // The PF2e sheet subclasses own the _renderInner that Toolbelt wraps in bob-2.
  class EquipmentSheet extends ItemSheet {
    async _renderInner() {
      native.push('_renderInner:item');
      const input = el('INPUT', {name: 'name'});
      input.value = this.item.name;
      return [el('DIV', {}, [el('FORM', {}, [input])])];
    }
  }
  class ActorSheet {
    constructor(actor) { this.actor = this.object = actor; this._state = 1; }
    async _renderInner() { return []; }
    _handleDroppedItem(_event, item) { native.push('_handleDroppedItem'); return item.toObject(); }
    close() { native.push('close'); this._state = 0; }
  }
  class LootSheet extends ActorSheet {
    async _renderInner() {
      native.push('_renderInner:actor');
      return [el('OL', {}, [...this.actor.items.values()].map(item => el('LI', {'data-item-id': item.id},
        [el('IMG', {alt: item.name}), el('A', {'data-action': 'toggle-summary'}, [text(item.name)])])))];
    }
  }
  Chat ??= class Chat {
    constructor(source) { this._source = clone(source); this.isContentVisible = true; }
    async renderHTML() { native.push('renderHTML'); return this.nativeCard(); }
  };
  const rawActor = {_id: 'fountain', type: 'loot', name: 'Fountain', img: 'fountain.webp', folder: null, flags: {}, _stats: {compendiumSource: null}};
  const origin = new Actor({...clone(rawActor), _id: 'origin', type: 'npc', name: 'Keeper'});
  const fountain = new Actor(rawActor);
  const rawItem = {_id: 'keepsake', type: 'equipment', name: 'Keepsake', img: 'keepsake.webp', flags: {},
    system: {slug: 'keepsake', quantity: 1, equipped: {carryType: 'worn'}, containerId: null, hp: {value: 10, max: 10}, rules: [],
      description: {value: '', gm: 'Hidden clue.'}, publication: {title: 'Adventure'}}};
  const approvedItem = clone(rawItem);
  approvedItem.name = '信物 Keepsake';
  approvedItem.system.description.gm = '冒险译文。';
  approvedItem.system.publication.title = '冒险';
  const importedItem = clone(approvedItem);
  importedItem.system.description.gm = '系统包译文。';
  importedItem.flags.babele = {translated: true, lang: 'cn', originalPayload: {gmnote: 'Hidden clue.', publication: 'Adventure'}};
  const row = {actorId: origin.id, itemId: rawItem._id, actorType: origin.type, actorNames: [origin.name], actorFolder: null,
    actorImg: origin.img, actorSourceUuid: null, originalName: rawItem.name, approvedName: approvedItem.name, chineseName: '信物',
    displayName: '已毁的信物 Destroyed Keepsake', nativeExplicitSlug: 'keepsake', nativeManagerTriggers: true,
    rawItem, approvedItem, approvedItemVariants: [importedItem],
    marker: {actorId: origin.id, itemId: rawItem._id, sourceFingerprint: 'a'.repeat(64), approvalFingerprint: 'b'.repeat(64)}};
  const card = item => el('DIV', {}, [
    el('DIV', {class: 'item-card', 'data-actor-id': item.actor.id, 'data-item-id': item.id},
      [el('HEADER', {class: 'card-header'}, [el('IMG', {alt: item.name}), el('H3', {}, [text(item.name)])])]),
    el('A', {class: 'content-link', 'data-uuid': item.uuid, 'data-id': item.id, 'data-type': 'Item'}, [el('I'), text(item.name)])]);
  const name = `MementoLane${++counter}`, classes = {Actor, Item, ItemSheet, EquipmentSheet, ActorSheet, LootSheet, Chat};
  globalThis[name] = classes;
  return {name, classes, native, row, origin, fountain, Item, EquipmentSheet, LootSheet,
    message: item => Object.assign(new Chat({flavor: '', flags: {pf2e: {origin: {uuid: item.uuid}}}}),
      {item, flags: {pf2e: {origin: {uuid: item.uuid}}}, nativeCard: () => card(item)}),
    install: (options = {}) => installBobMementoDisplay({ItemClass: Item, ActorClass: Actor, ItemSheetClass: EquipmentSheet,
      ActorSheetClass: LootSheet, ChatMessageClass: Chat, bindings: {rows: [row], fountain: {rawActor, nameRecord: {after: '喷泉 Fountain'}}},
      getActors: () => actors, getUser: () => user, getLocale: () => 'cn', isEnabled: () => true, ...options})};
}

const target = (world, path) => { const [name, , key] = path.split('.'); return [world.classes[name].prototype, key]; };
const nativeNote = '<li class="roll-note" data-item-id="copy"><strong>Hemophobia</strong> Native bleed note.</li>';
const projectedNote = '<li class="roll-note" data-item-id="copy"><strong>效果：恐血症</strong> 受到流血伤害时恶心2。</li>';

// Make the next render's projection stale: the user changes during its own enrichment, so the
// Note wrapper falls back to a second native call after an await.
function supersedeNextProjection(world) {
  const start = world.state.enrichments;
  world.state.onEnrich = count => { if (count === start + 2) { world.state.user = {...world.state.user}; world.state.onEnrich = null; } };
}

async function runNote(env, paths) {
  const w = noteWorld();
  try {
    const calls = env ? wrapAsOther(env, w.name, paths) : [];
    w.prepare();
    const dispose = w.install(env ? {libWrapper: env.libWrapper} : {});
    const note = w.actor.synthetics.rollNotes['damage-received'][0].clone();
    w.prepare();
    const message = w.createFrom(note), out = {sync: [...w.native]};
    out.projected = (await w.state.firstRender).querySelector().outerHTML;
    supersedeNextProjection(w);
    out.superseded = (await message.renderHTML()).querySelector().outerHTML;
    out.nativeRenders = w.native.filter(call => call === 'renderHTML').length;
    dispose();
    out.disposed = (await message.renderHTML()).querySelector().outerHTML;
    const registered = env ? paths.map(path => extraRegistered(env, ...target(w, path))) : [];
    return {out, calls, registered};
  } finally { w.close(); }
}

async function runMemento(env, paths) {
  const w = mementoWorld();
  const calls = env ? wrapAsOther(env, w.name, paths) : [];
  const dispose = w.install(env ? {libWrapper: env.libWrapper} : {});
  const out = {}, sync = [];
  const source = new w.Item(w.row.approvedItemVariants[0], w.origin);
  out.dropped = new w.LootSheet(w.fountain)._handleDroppedItem({}, source).flags[EXTRA]?.bobMementoDisplay ?? null;
  const returned = w.origin.transferItemToActor(w.fountain, source);
  out.returned = returned._source;
  const sheet = new w.EquipmentSheet(returned);
  out.title = sheet.title;
  const rendering = sheet._renderInner(); sync.push(w.native.at(-1));
  const [root] = await rendering;
  sheet.form = root.children[0];
  out.itemSheet = serialize(root);
  out.submit = sheet._getSubmitData({});
  sheet.close();
  out.closed = serialize(root);
  const listing = new w.LootSheet(w.fountain)._renderInner(); sync.push(w.native.at(-1));
  out.actorSheet = serialize((await listing)[0]);
  const chat = w.message(returned).renderHTML(); sync.push(w.native.at(-1));
  out.chat = serialize(await chat);
  Object.assign(out, {sync, native: [...w.native]});
  dispose();
  out.disposedTitle = sheet.title;
  out.disposedChat = serialize(await w.message(returned).renderHTML());
  const registered = env ? paths.map(path => extraRegistered(env, ...target(w, path))) : [];
  return {out, calls, registered, marker: w.row.marker};
}

// Note and memento on one ChatMessage class, installed in module.json order (note first).
async function runTogether(env) {
  const n = noteWorld(), m = mementoWorld({Chat: n.classes.Chat});
  try {
    const calls = env ? wrapAsOther(env, n.name, ['Chat.prototype.renderHTML']) : [];
    n.prepare();
    const disposeNote = n.install(env ? {libWrapper: env.libWrapper} : {});
    const disposeMemento = m.install(env ? {libWrapper: env.libWrapper} : {});
    const note = n.actor.synthetics.rollNotes['damage-received'][0].clone();
    n.prepare();
    const damage = n.createFrom(note);
    await n.state.firstRender;
    const returned = m.origin.transferItemToActor(m.fountain, new m.Item(m.row.approvedItemVariants[0], m.origin));
    const render = async () => [(await damage.renderHTML()).querySelector().outerHTML, serialize(await m.message(returned).renderHTML())];
    const out = {both: await render()};
    // Memento reads message.item once per call, so this counts how often its layer ran.
    let mementoCalls = 0;
    Object.defineProperty(damage, 'item', {get() { mementoCalls++; }, configurable: true});
    supersedeNextProjection(n);
    out.superseded = (await damage.renderHTML()).querySelector().outerHTML;
    out.mementoCalls = mementoCalls;
    const registered = env ? [extraRegistered(env, n.classes.Chat.prototype, 'renderHTML')] : [];
    disposeNote();
    out.mementoOnly = await render();
    disposeMemento();
    out.none = await render();
    if (env) registered.push(extraRegistered(env, n.classes.Chat.prototype, 'renderHTML'));
    return {out, calls, registered, nativeRenders: n.native.filter(call => call === 'renderHTML').length};
  } finally { n.close(); }
}

const MEMENTO_TARGETS = ['Actor.prototype.transferItemToActor', 'EquipmentSheet.prototype._renderInner',
  'LootSheet.prototype._renderInner', 'Chat.prototype.renderHTML'];

test('define mode baselines show every projection these lane tests compare against', async () => {
  const note = await runNote(null, []);
  assert.deepEqual(note.out, {sync: ['_onCreate', 'renderHTML'], projected: projectedNote, superseded: nativeNote,
    nativeRenders: 3, disposed: nativeNote});
  const {out, marker} = await runMemento(null, []);
  assert.deepEqual(out.dropped, marker);
  assert.deepEqual(out.returned.flags[EXTRA], {bobMementoDisplay: marker});
  assert.equal(out.title, '已归还的信物 Returned Keepsake');
  assert.match(out.itemSheet, /<INPUT name="name" value="已归还的信物 Returned Keepsake">/);
  assert.deepEqual(out.submit, {});
  assert.match(out.closed, /<INPUT name="name" value="Returned 信物 Keepsake">/);
  assert.match(out.actorSheet, /<IMG alt="已归还的信物 Returned Keepsake"><\/IMG><A data-action="toggle-summary">已归还的信物 Returned Keepsake<\/A>/);
  assert.match(out.chat, /<IMG alt="已归还的信物 Returned Keepsake"><\/IMG><H3>已归还的信物 Returned Keepsake<\/H3>/);
  assert.match(out.chat, /<I><\/I>已归还的信物 Returned Keepsake<\/A>/);
  // The native method runs synchronously, before the wrapper's first await.
  assert.deepEqual(out.sync, ['_renderInner:item', '_renderInner:actor', 'renderHTML']);
  assert.equal(out.disposedTitle, 'Returned 信物 Keepsake');
  assert.doesNotMatch(out.disposedChat, /已归还/);
  const together = await runTogether(null);
  assert.deepEqual(together.out.both, [projectedNote, out.chat]);
  assert.equal(together.out.mementoCalls, 1, 'memento is outside note, so a second native call skips it');
  assert.deepEqual(together.out.mementoOnly, [nativeNote, out.chat]);
  assert.deepEqual(together.out.none, [nativeNote, out.disposedChat]);
});

for (const [label, create] of environments()) {
  for (const paths of [['Chat.prototype.renderHTML'],
    ['Rule.prototype.beforePrepareData', 'Chat.prototype._onCreate', 'Chat.prototype.renderHTML']]) {
    test(`${label}: note joins pre-wrapped ${paths.map(path => path.split('.').at(-1)).join(', ')} and renders as in define mode`, async () => {
      const define = await runNote(null, []);
      const lane = await runNote(create(), paths);
      assert.deepEqual(lane.out, define.out);
      // Every native render, including the fallback after an await and the one after dispose, passed the other package.
      assert.equal(lane.calls.filter(path => path.endsWith('renderHTML')).length, define.out.nativeRenders + 1);
      for (const path of paths) assert.ok(lane.calls.includes(path), path);
      assert.deepEqual(lane.registered, paths.map(() => false));
    });
  }

  test(`${label}: memento joins pre-wrapped transfer, sheet-subclass _renderInner and renderHTML as in define mode`, async () => {
    const define = await runMemento(null, []);
    const lane = await runMemento(create(), MEMENTO_TARGETS);
    assert.deepEqual(lane.out, define.out);
    assert.deepEqual(lane.calls, [...MEMENTO_TARGETS, 'Chat.prototype.renderHTML']);
    assert.deepEqual(lane.registered, MEMENTO_TARGETS.map(() => false));
  });

  test(`${label}: note and memento share one registration on a wrapped renderHTML and leave it layer by layer`, async () => {
    const define = await runTogether(null);
    const lane = await runTogether(create());
    assert.deepEqual(lane.out, define.out);
    assert.deepEqual(lane.registered, [true, false]);
    // The other package's wrapper saw every native render, before and after both disposals.
    assert.equal(lane.calls.length, lane.nativeRenders);
  });

  test(`${label}: a wrapped target without the libWrapper API throws and leaves every target as it was`, async () => {
    const env = create();
    const m = mementoWorld(), mementoCalls = wrapAsOther(env, m.name, ['Chat.prototype.renderHTML']);
    const mementoTargets = Object.values(m.classes).map(Class => Class.prototype), before = descriptors(mementoTargets);
    assert.throws(() => m.install({libWrapper: {}}), /libWrapper required for wrapped native consumer renderHTML/);
    assert.deepEqual(descriptors(mementoTargets), before);
    assert.equal(extraRegistered(env, m.classes.Chat.prototype, 'renderHTML'), false);
    await Reflect.apply(m.classes.Chat.prototype.renderHTML, {nativeCard: () => el('P')}, []);
    assert.deepEqual(mementoCalls, ['Chat.prototype.renderHTML']);

    const n = noteWorld();
    try {
      wrapAsOther(env, n.name, ['Chat.prototype.renderHTML']);
      n.prepare();
      const noteTargets = Object.values(n.classes).map(Class => Class.prototype), prior = descriptors(noteTargets);
      assert.throws(() => n.install({libWrapper: {}}), /Native renderHTML is wrapped but libWrapper is unavailable/);
      assert.deepEqual(descriptors(noteTargets), prior);
      assert.equal(extraRegistered(env, n.classes.Chat.prototype, 'renderHTML'), false);
    } finally { n.close(); }
  });

  test(`${label}: a wrapped Note toHTML is still refused and the install rolls back`, () => {
    const env = create(), n = noteWorld();
    try {
      const calls = wrapAsOther(env, n.name, ['Note.prototype.toHTML', 'Chat.prototype.renderHTML']);
      n.prepare();
      const targets = Object.values(n.classes).map(Class => Class.prototype), before = descriptors(targets);
      assert.throws(() => n.install({libWrapper: env.libWrapper}), /Native toHTML unavailable/);
      assert.deepEqual(descriptors(targets), before);
      assert.equal(extraRegistered(env, n.classes.Chat.prototype, 'renderHTML'), false);
      n.actor.synthetics.rollNotes['damage-received'][0].toHTML();
      assert.deepEqual(calls, ['Note.prototype.toHTML']);
    } finally { n.close(); }
  });
}

test('real libWrapper run was requested', {skip: !REAL && 'set EXTRA_TEST_LIBWRAPPER to lib-wrapper.js 1.13.5.1'}, () => {
  assert.equal(real.libWrapper.version, '1.13.5.1');
});
