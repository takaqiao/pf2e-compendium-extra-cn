import assert from 'node:assert/strict';
import test from 'node:test';
import {installBobNoteDisplay} from '../scripts/bob-note-display-core.mjs';

const clone = structuredClone;
const hash = 'a'.repeat(64);
const markerKey = 'pf2e-compendium-extra-cn';

// Only the DOM and document persistence boundaries are substituted. Rule replacement
// follows applyDamage: clone notes, update HP (prepare rules again), then render notes.
class HTML {
  constructor(value, leaf = false) {
    this.value = value; this.leaf = leaf;
    this.open = value.match(/^<li[^>]*>/)?.[0] ?? '';
    this.attributes = [...this.open.matchAll(/([\w-]+)="([^"]*)"/g)].map(([,name,value]) => ({name,value}));
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

function host({beforeReady = true, variant = true, visibility = null, approvedAtReady = true} = {}) {
  const previous = {document:globalThis.document,HTMLElement:globalThis.HTMLElement};
  globalThis.HTMLElement = HTML;
  globalThis.document = {createElement:() => ({set innerHTML(value) { this.content = parse(value); }})};
  const state = {user:{id:'local',isGM:true,role:4},enabled:true};
  const sourceRule = {key:'Note',selector:['damage-received'],title:'{item|name}',text:'Native bleed note.',predicate:['bleed'],visibility};
  const row = {approved:true,scope:'worldItem',actorId:null,itemId:'hemophobia',itemType:'effect',itemName:'效果：恐血症 Effect: Hemophobia',
    itemSourceUuid:null,itemSlug:null,description:'恐血症正文。',descriptionGM:'',ruleIndex:0,sourceRule,sourceRuleSha256:hash,
    display:{title:'效果：恐血症',text:'受到流血伤害时恶心2。'},approvalHashes:{title:hash,text:hash},nativeEnglish:{},
    markerIdentity:{scope:'worldItem',itemId:'hemophobia',itemType:'effect',approvedName:'效果：恐血症 Effect: Hemophobia',sourceFingerprint:hash,approvalFingerprint:hash}};
  const sourceVariant = clone(row);
  sourceVariant.sourceRule.text = 'BASTION.RULES.LucidNightmares.Hemophobia.Note';
  sourceVariant.sourceRuleSha256 = 'b'.repeat(64);
  sourceVariant.nativeEnglish = {[sourceVariant.sourceRule.text]:'Native bleed note.'};
  row.sourceVariants = [sourceVariant];
  class Actor {
    constructor() {
      this._source = {_id:'owner',name:'Owner',type:'npc'};
      Object.assign(this, this._source, {id:'owner',parent:null,isToken:false,items:new Map(),synthetics:{rollNotes:{}},isOwner:true,hasPlayerOwner:true});
    }
  }
  class Item {
    constructor(actor) {
      this._source = {_id:'copy',type:'effect',name:row.itemName,system:{slug:null,description:{value:row.description,gm:''},
        rules:[clone(variant ? sourceVariant.sourceRule : sourceRule)]},flags:{[markerKey]:{bobIdentity:{version:1,key:'worldItem//hemophobia',sourceFingerprint:hash,approvalFingerprint:hash}}}};
      Object.assign(this, clone(this._source), {id:'copy',actor,parent:actor,rules:[]});
      actor.items.set(this.id, this);
    }
    get description() { return this.system.description.value; }
  }
  class Note {
    constructor(data) { Object.assign(this, data); }
    toObject() { return clone(Object.fromEntries(['selector','title','text','predicate','outcome','visibility'].map(key => [key,this[key]]))); }
    clone() { return new Note({...this.toObject(),rule:this.rule}); }
    toHTML() {
      if (state.noteError) throw state.noteError;
      const body = this.text === sourceVariant.sourceRule.text ? 'Native bleed note.' : this.text;
      return new HTML(`<li class="roll-note"${this.rule ? ` data-item-id="${this.rule.item.id}"` : ''}${this.visibility ? ` data-visibility="${this.visibility}"` : ''}><strong>${this.title}</strong> ${body}</li>`, true);
    }
  }
  class Rule {
    constructor(item) {
      Object.assign(this, clone(item.system.rules[0]), {item,actor:item.actor,sourceIndex:0,ignored:false,outcome:[]});
    }
    beforePrepareData() {
      const note = new Note({selector:this.selector[0],title:this.item.name.replace(/^[^:]+:\s*/,''),text:this.text,
        predicate:clone(this.predicate),outcome:[],visibility:this.visibility,rule:this});
      this.actor.synthetics.rollNotes['damage-received'] = [note];
    }
  }
  class Editor {
    static async enrichHTML(value) {
      if (state.pause) await state.pause;
      return !state.user.isGM && value.includes('data-visibility="gm"') ? '' : value;
    }
  }
  class Chat {
    constructor(source) { this._source = clone(source); this.speakerActor = this.actor = actor; this.isContentVisible = true; }
    _onCreate() { state.firstRender = this.renderHTML(); }
    async renderHTML() {
      if (state.renderError) throw state.renderError;
      return parse(this.isContentVisible ? await Editor.enrichHTML(this._source.flavor) : '');
    }
    getRollData() { return {actor}; }
  }
  const actor = new Actor(), item = new Item(actor);
  function prepare() {
    const rule = new Rule(item); item.rules = [rule]; actor.synthetics.rollNotes = {};
    rule.beforePrepareData(); return actor.synthetics.rollNotes['damage-received'][0];
  }
  if (!approvedAtReady) item._source.name = 'Unapproved source';
  if (beforeReady) prepare();
  const dispose = installBobNoteDisplay({NoteRuleClass:Rule,ItemClass:Item,ActorClass:Actor,ChatMessageClass:Chat,TextEditorClass:Editor,
    bindings:[row],isEnabled:() => state.enabled,getUser:() => state.user,getActors:() => [actor]});
  if (!beforeReady) prepare();
  function createFrom(note, userId = state.user.id) {
    const source = {speaker:{actor:actor.id},flags:{pf2e:{context:{type:'damage-taken'}}},flavor:note.toHTML().outerHTML};
    const message = new Chat(source); message._onCreate(source,{},userId); return message;
  }
  return {state,actor,item,prepare,createFrom,Chat,dispose,source:() => clone(item._source),
    close() { dispose(); Object.assign(globalThis, previous); }};
}

for (const beforeReady of [true,false]) for (const variant of [true,false]) {
  test(`damage after rule replacement projects ${variant ? 'new' : 'old'} source prepared ${beforeReady ? 'before' : 'after'} ready`, async () => {
    const h = host({beforeReady,variant});
    try {
      const before = h.source(), note = h.actor.synthetics.rollNotes['damage-received'][0].clone(), tuple = note.toObject();
      h.prepare();
      assert.equal(h.item.rules.includes(note.rule), false);
      const message = h.createFrom(note), source = clone(message._source);
      assert.equal((await h.state.firstRender).querySelector().outerHTML,
        '<li class="roll-note" data-item-id="copy"><strong>效果：恐血症</strong> 受到流血伤害时恶心2。</li>');
      assert.deepEqual(message._source, source);
      assert.deepEqual(h.source(), before);
      assert.deepEqual(note.toObject(), tuple);
    } finally { h.close(); }
  });
}

test('notes rendered before a rule replacement keep their approved display', async () => {
  const h = host();
  try {
    const note = h.actor.synthetics.rollNotes['damage-received'][0];
    note.toHTML();
    const copy = note.clone(); h.prepare();
    const message = h.createFrom(copy);
    assert.match((await message.renderHTML()).querySelector().outerHTML, /效果：恐血症/);
  } finally { h.close(); }
});

for (const [name,change] of [
  ['current rule predicate', h => h.item.rules[0].predicate.push('other')],
  ['stale rule predicate', (_h,note) => note.rule.predicate.push('other')],
  ['current rule title', h => h.item.rules[0].title = 'Edited title'],
  ['stale rule title', (_h,note) => note.rule.title = 'Edited title'],
  ['current rule selector', h => h.item.rules[0].selector = ['other']],
  ['stale rule selector', (_h,note) => note.rule.selector = ['other']],
  ['source rule', h => h.item._source.system.rules[0].text = 'Edited note'],
  ['identity marker', h => h.item._source.flags[markerKey].bobIdentity.sourceFingerprint = 'c'.repeat(64)],
  ['detached item', h => h.actor.items.delete(h.item.id)],
  ['note tuple', (_h,note) => note.title = 'Edited title'],
  ['ambiguous current rules', h => h.item.rules.push(h.item.rules[0])],
]) test(`rule replacement rejects ${name} changes`, async () => {
  const h = host();
  try {
    const note = h.actor.synthetics.rollNotes['damage-received'][0].clone(); h.prepare(); change(h,note);
    const message = h.createFrom(note);
    assert.equal((await message.renderHTML()).querySelector().outerHTML, message._source.flavor);
  } finally { h.close(); }
});

test('a rule rejected at ready cannot borrow the later approved rule identity', async () => {
  const h = host({approvedAtReady:false});
  try {
    const note = h.actor.synthetics.rollNotes['damage-received'][0].clone();
    h.item._source.name = h.item.name; h.prepare();
    const message = h.createFrom(note);
    assert.equal((await message.renderHTML()).querySelector().outerHTML, message._source.flavor);
  } finally { h.close(); }
});

test('an observed rule cannot transfer its approval to a replacement item', async () => {
  const h = host();
  try {
    const note = h.actor.synthetics.rollNotes['damage-received'][0].clone();
    const replacement = new h.item.constructor(h.actor), rule = new note.rule.constructor(replacement);
    replacement.rules = [rule]; rule.beforePrepareData(); note.rule.item = replacement;
    const message = h.createFrom(note);
    assert.equal((await message.renderHTML()).querySelector().outerHTML, message._source.flavor);
  } finally { h.close(); }
});

test('remote creation and reloaded damage messages keep native output without serialized notes', async () => {
  const h = host();
  try {
    const note = h.actor.synthetics.rollNotes['damage-received'][0].clone(); h.prepare();
    const remote = h.createFrom(note,'another-user');
    assert.equal((await remote.renderHTML()).querySelector().outerHTML, remote._source.flavor);
    const local = h.createFrom(note), reloaded = new h.Chat(local._source);
    assert.equal((await reloaded.renderHTML()).querySelector().outerHTML, reloaded._source.flavor);
  } finally { h.close(); }
});

test('permission changes cannot restore a GM note during asynchronous rendering', async () => {
  const h = host({visibility:'gm'});
  try {
    const note = h.actor.synthetics.rollNotes['damage-received'][0].clone(); h.prepare();
    let release; h.state.pause = new Promise(resolve => release = resolve);
    h.createFrom(note); h.state.user = {id:'player',isGM:false,role:1};
    h.state.pause = null; release();
    assert.equal((await h.state.firstRender).querySelector(), null);
  } finally { h.close(); }
});

test('native note and chat renderer failures propagate', async () => {
  const h = host();
  try {
    const note = h.actor.synthetics.rollNotes['damage-received'][0].clone(); h.prepare();
    const error = new Error('native note failure'); h.state.noteError = error;
    assert.throws(() => note.toHTML(), value => value === error);
    h.state.noteError = null;
    const message = h.createFrom(note); await h.state.firstRender;
    h.state.renderError = error;
    await assert.rejects(message.renderHTML(), value => value === error);
  } finally { h.close(); }
});
