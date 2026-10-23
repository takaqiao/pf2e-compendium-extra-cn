import assert from 'node:assert/strict';
import test from 'node:test';
import {installBobMementoDisplay} from '../scripts/bob-memento-display-core.mjs';
import {installBobAdditionalDisplay} from '../scripts/bob-additional-display-core.mjs';
import {prepareBobRuleDisplayIdentity} from '../scripts/bob-rule-display-identity.mjs';
import {installBobSpellDisplay} from '../scripts/bob-spell-display-core.mjs';
import {installBobIdentityCompatibility} from '../scripts/bob-identity-core.mjs';
import {installBobNoteDisplay} from '../scripts/bob-note-display-core.mjs';
import {prepareSyntheticIdentity} from '../scripts/bob-rule-synthetic-identity.mjs';

const clone = structuredClone;
const hash = 'a'.repeat(64);
const marker = 'pf2e-compendium-extra-cn';

function documents() {
  const actors = new Map(), items = new Map();
  class Actor {
    constructor(source) {
      this._source = clone(source);
      Object.assign(this, source, {id:source._id, parent:null, isToken:false, collection:actors, visible:true, items:new Map()});
      actors.set(this.id, this);
    }
    transferItemToActor() {}
  }
  class Item {
    constructor(source, actor = null) {
      this._source = clone(source);
      Object.assign(this, clone(source), {id:source._id, parent:actor, actor, collection:actor?.items ?? items, visible:true, isIdentified:true});
      this.collection.set(this.id, this);
    }
    get slug() { return this.system.slug; }
  }
  return {Actor, Item, actors, items};
}

function mementoHost(prefix, extraRow = false) {
  const {Actor, Item, actors} = documents();
  class ItemSheet {
    constructor(item) { this.item = this.object = item; }
    get title() { return this.item.name; }
    _renderInner() {} _getSubmitData() {} _updateObject() {} close() {}
  }
  class ActorSheet { _renderInner() {} close() {} }
  class Chat { renderHTML() {} }
  const source = {_id:'item', type:'equipment', name:'Keepsake', img:'test.webp', flags:{},
    system:{slug:'keepsake', quantity:1, equipped:{carryType:'worn'}, containerId:null, hp:{value:10,max:10}, rules:[], description:{value:'A keepsake.'}}};
  const rows = Array.from({length:extraRow ? 8 : 7}, (_, i) => ({actorId:'origin'+i, itemId:'item'+i,
    originalName:'Keepsake', approvedName:'纪念物 Keepsake', chineseName:'纪念物', displayName:'已毁的纪念物 Destroyed Keepsake',
    rawItem:{...clone(source), _id:'item'+i}, approvedItem:{...clone(source), _id:'item'+i, name:'纪念物 Keepsake'},
    nativeExplicitSlug:'keepsake', nativeManagerTriggers:true,
    marker:{actorId:'origin'+i,itemId:'item'+i,sourceFingerprint:hash,approvalFingerprint:hash}}));
  const rawActor = {_id:'fountain',type:'loot',name:'Fountain',folder:null,img:'fountain.webp',_stats:{compendiumSource:null},flags:{}};
  const fountain = new Actor(rawActor), row = rows.at(-1);
  const returned = {...clone(row.rawItem),name:prefix+'Keepsake',flags:{[marker]:{bobMementoDisplay:row.marker}}};
  returned.system.hp.max = 1;
  const item = new Item(returned, fountain);
  const dispose = installBobMementoDisplay({ItemClass:Item,ActorClass:Actor,ItemSheetClass:ItemSheet,ActorSheetClass:ActorSheet,ChatMessageClass:Chat,
    bindings:{rows,fountain:{rawActor,nameRecord:{after:'喷泉 Fountain'}}},getActors:()=>actors,getUser:()=>({isGM:true}),getLocale:()=> 'cn',isEnabled:()=>true});
  return {item,sheet:new ItemSheet(item),dispose};
}

test('returned and legacy destroyed mementos project distinct titles without source writes', () => {
  for (const [prefix, expected] of [['Returned ','已归还的纪念物 Returned Keepsake'], ['Destroyed ','已毁的纪念物 Destroyed Keepsake']]) {
    const h = mementoHost(prefix), before = clone(h.item._source);
    try {
      assert.equal(h.sheet.title, expected);
      assert.deepEqual(h.item._source, before);
      h.item._source.system.hp.max = h.item.system.hp.max = 2;
      assert.equal(h.sheet.title, prefix+'Keepsake');
    } finally { h.dispose(); }
  }
});

test('new exact memento identities coexist with the original seven', () => {
  const h = mementoHost('Returned ', true);
  try { assert.equal(h.sheet.title, '已归还的纪念物 Returned Keepsake'); } finally { h.dispose(); }
});

test('unapproved memento prefixes and edited content remain native', () => {
  const h = mementoHost('Repaired ');
  try { assert.equal(h.sheet.title, 'Repaired Keepsake'); } finally { h.dispose(); }
});

test('additional descriptions accept both exact rule sources and reject other radii', async () => {
  const {Actor,Item} = documents();
  const actor = new Actor({_id:'actor',type:'npc',name:'角色 Actor'});
  const rules = [{key:'Aura',radius:0}], body = '<p>@Localize[PF2E.NPC.Abilities.Glossary.Test]</p>';
  const row = {approved:true,sourceSha256:hash,approvalSha256:hash,actorNameApprovalSha256:hash,itemNameApprovalSha256:hash,
    actorId:actor.id,actorType:'npc',actorName:actor.name,actorFolderId:null,actorSourceUuid:null,
    itemId:'item',itemType:'action',itemName:'气场 Aura',itemFolderId:null,itemSourceUuid:null,itemSlug:null,
    key:'PF2E.NPC.Abilities.Glossary.Test',displayFragment:'<p>气场说明。</p>',normalizedBody:'@Localize[PF2E.NPC.Abilities.Glossary.Test]',
    itemRulesJSON:JSON.stringify(rules),forms:[{source:body,display:'<p>气场说明。</p>'}]};
  row.sourceVariants = [{...clone(row),sourceSha256:'b'.repeat(64),itemRulesJSON:JSON.stringify([{key:'Aura',radius:10}])}];
  const item = new Item({_id:'item',type:'action',name:row.itemName,system:{slug:null,rules,description:{value:body}}},actor);
  class Editor { static async enrichHTML(text) { return text; } }
  const user = {isGM:true};
  const dispose = installBobAdditionalDisplay({ActorClass:Actor,ItemClass:Item,TextEditorClass:Editor,bindings:[row],isEnabled:()=>true,getLocale:()=> 'cn',getUser:()=>user});
  try {
    for (const radius of [0,10,11]) {
      item.system.rules = item._source.system.rules = [{key:'Aura',radius}];
      const before = clone(item._source);
      assert.equal(await Editor.enrichHTML(body,{relativeTo:item}),radius===11 ? body : '<p>气场说明。</p>');
      assert.deepEqual(item._source,before);
    }
  } finally { dispose(); }
});

test('rule identity resolves exact old and new source variants and rejects a third source', () => {
  const {Actor,Item,actors,items} = documents();
  const actor = new Actor({_id:'actor',type:'npc',name:'角色 Actor'});
  const source = {_id:'item',name:'能力 Ability',type:'action',img:'test.webp',system:{slug:null,description:{value:'正文'},rules:[{key:'RollOption',option:'test',value:false}]}};
  const row = {key:'actor/item',actorId:'actor',actorType:'npc',actorName:actor.name,actorFolderId:null,actorSourceUuid:null,
    itemId:'item',itemName:source.name,itemType:'action',itemImage:source.img,itemFolderId:null,itemSourceUuid:null,itemSlug:null,itemBody:'正文',
    expectedSource:clone(source),sourceFingerprint:hash,approvalFingerprint:hash,rules:[]};
  const variant = clone(row); delete variant.expectedSource.system.rules[0].value;
  variant.sourceFingerprint = 'b'.repeat(64); row.sourceVariants = [variant];
  const item = new Item(source,actor); item.rules = [];
  const identity = prepareBobRuleDisplayIdentity({bindings:[row],ActorClass:Actor,ItemClass:Item,getActors:()=>actors,getItems:()=>items,
    isEnabled:()=>true,getLocale:()=> 'cn',getRuleClasses:()=>({}),getActiveRuleClasses:()=>({}),localize:x=>x});
  for (const [rules,expected] of [[source.system.rules,hash],[variant.expectedSource.system.rules,variant.sourceFingerprint],[[{key:'RollOption',option:'different'}],undefined]]) {
    item.system.rules = item._source.system.rules = clone(rules);
    const before = clone(item._source);
    assert.equal(identity.resolveItem(item)?.sourceFingerprint,expected);
    assert.deepEqual(item._source,before);
  }
});

test('existing world-copy markers resolve the reviewed description variant only', () => {
  const {Actor,Item,actors,items}=documents();
  const actor=new Actor({_id:'owner',type:'character',name:'Owner'});
  const source={_id:'source',name:'效果 Effect',type:'effect',img:'test.webp',system:{slug:null,description:{value:'旧正文'},rules:[]}};
  const row={key:'world/source',actorId:null,itemId:'source',itemName:source.name,itemType:'effect',itemImage:source.img,itemFolderId:null,itemSourceUuid:null,itemSlug:null,itemBody:'旧正文',expectedSource:clone(source),sourceFingerprint:hash,approvalFingerprint:hash,rules:[]};
  const variant=clone(row);variant.sourceFingerprint='b'.repeat(64);variant.legacySourceFingerprint=hash;variant.itemBody=variant.expectedSource.system.description.value='新正文';row.sourceVariants=[variant];
  const legacy={scope:'worldItem',itemId:'source',itemType:'effect',approvedName:source.name,sourceFingerprint:hash,approvalFingerprint:hash};
  const item=new Item({...clone(variant.expectedSource),_id:'copy',flags:{[marker]:{bobIdentity:{version:1,key:'worldItem//source',sourceFingerprint:hash,approvalFingerprint:hash}}}},actor);item.rules=[];
  const identity=prepareBobRuleDisplayIdentity({bindings:[row],legacyWorldIdentities:[legacy],ActorClass:Actor,ItemClass:Item,getActors:()=>actors,getItems:()=>items,isEnabled:()=>true,getLocale:()=> 'cn',getRuleClasses:()=>({}),getActiveRuleClasses:()=>({}),localize:x=>x});
  assert.equal(identity.resolveItem(item)?.itemBody,'新正文');
  item.system.description.value=item._source.system.description.value='自行改写';
  assert.equal(identity.resolveItem(item),null);
});

test('spell preparation ranges follow exact renamed source variants', () => {
  class Spell { getDescriptionData() {} }
  class Sheet { _renderInner() {} _getSubmitData() {} }
  let render;
  const actor = {id:'actor',type:'npc',_source:{},items:new Map()};
  const spell = {id:'spell',type:'spell',name:'侦测魔法（恒定） Detect Magic (Constant)',actor,parent:actor,uuid:'Actor.actor.Item.spell',
    _source:{system:{range:{value:'30 feet'}}},system:{range:{value:'30 feet'}}};
  actor.items.set(spell.id,spell);
  const row = {key:'spell',scope:'actorSpell',actorId:actor.id,actorType:'npc',ownerId:spell.id,ownerType:'spell',spellId:spell.id,
    ownerName:{before:'Detect Magic',after:'侦测魔法 Detect Magic'},names:{name:{before:'Detect Magic',after:'侦测魔法 Detect Magic'}},
    fields:{'system.range.value':{before:'30 feet',after:'30尺'}}};
  row.sourceVariants = [{...clone(row),ownerName:{before:'Detect Magic (Constant)',after:spell.name},names:{name:{before:'Detect Magic (Constant)',after:spell.name}}}];
  const dispose = installBobSpellDisplay({SpellClass:Spell,SpellSheetClasses:[Sheet],ActorSheetClasses:[],Hooks:{on:(_name,fn)=>{render=fn;return 1},off(){}},
    bindings:[row],isEnabled:()=>true,localize:x=>x,format:x=>x});
  try {
    for (const [name,expected] of [[spell.name,'30尺'],[row.names.name.after,'30尺'],['自定法术','30 feet']]) {
      spell.name=name;
      const context={state:{groups:[{spells:[{id:spell.id,uuid:spell.uuid,name,range:'30 feet'}]}]}};
      render({actor},context);
      assert.equal(context.state.groups[0].spells[0].range,expected);
      assert.equal(spell._source.system.range.value,'30 feet');
    }
  } finally { dispose(); }
});

test('name fallback uses each approved source identity without changing item names', () => {
  class Lore { get slug() { return this.name.toLowerCase().replaceAll(' ','-'); } }
  class NPC { getAttackEffects() {} }
  const old={scope:'actorItem',actorId:'actor',actorType:'npc',itemId:'item',itemType:'lore',itemFolderId:null,itemSourceUuid:null,actorFolderId:null,
    actorSourceUuid:'original',originalName:'Old Lore',approvedName:'旧学识 Old Lore',itemSlug:null};
  old.sourceVariants=[{...clone(old),actorSourceUuid:null,originalName:'New Lore',approvedName:'新学识 New Lore'}];
  const actor={id:'actor',type:'npc',_source:{folder:null,_stats:{compendiumSource:null}}};
  const item=new Lore();Object.assign(item,{id:'item',type:'lore',actor,name:'新学识 New Lore',system:{slug:null},_source:{folder:null}});
  const dispose=installBobIdentityCompatibility({itemClasses:[Lore],LoreClass:Lore,NPCClass:NPC,identities:[old],isEnabled:()=>true,sluggify:x=>x.toLowerCase().replaceAll(' ','-')});
  try {
    assert.equal(item.slug,'new-lore');
    assert.equal(item.name,'新学识 New Lore');
    item.name='自定学识';assert.equal(item.slug,'自定学识');
  } finally { dispose(); }
});

test('synthetic identity accepts only the two approved delta versions', () => {
  const {Actor,Item,actors} = documents();
  class Scene {} class Token {} class Delta {}
  const scenes=new Map(),scene=new Scene(),token=new Token(),delta=new Delta();
  const base=new Actor({_id:'actor',type:'npc',name:'角色 Actor'});
  const actor=new Actor({_id:'synthetic',type:'npc',name:'角色 Actor'});
  Object.assign(actor,{isToken:true,parent:token,token});
  const source={_id:'item',type:'action',name:'能力 Ability',system:{slug:null,rules:[],description:{value:'正文'}}};
  new Item(source,base);const item=new Item(source,actor);
  const deltaSource={_id:'token',system:{},items:[{_id:'other',_stats:{coreVersion:'old',systemVersion:'old',createdTime:null,modifiedTime:null,lastModifiedBy:null}}],effects:[]};
  const row={sceneId:'scene',tokenId:'token',actorId:'actor',sceneName:'场景 Scene',tokenName:'角色 Actor',boundItemIds:['item'],rawToken:{delta:clone(deltaSource)},deltaSource,
    sceneProjection:{_id:'scene',folder:null,backgroundSrc:null,width:100,height:100},tokenProjection:{_id:'token',actorId:'actor',actorLink:false,textureSrc:null}};
  const variant=clone(row);variant.deltaSource.items[0]._stats.coreVersion='new';variant.deltaSource.items[0]._stats.systemVersion='new';variant.rawToken.delta=clone(variant.deltaSource);row.sourceVariants=[variant];
  Object.assign(scene,{id:'scene',name:row.sceneName,parent:null,collection:scenes,tokens:new Map([['token',token]]),_source:{_id:'scene',name:row.sceneName,width:100,height:100}});scenes.set(scene.id,scene);
  Object.assign(token,{id:'token',name:row.tokenName,parent:scene,actorId:'actor',actorLink:false,isLinked:false,delta,actor,baseActor:base,
    _source:{_id:'token',name:row.tokenName,actorId:'actor',actorLink:false,delta:clone(deltaSource)}});
  Object.assign(delta,{parent:token,syntheticActor:actor,_source:clone(deltaSource)});
  const binding={actorId:'actor',actorType:'npc',actorName:base.name,actorFolderId:null,actorSourceUuid:null,itemId:'item',itemType:'action',itemName:source.name,
    itemFolderId:null,itemSourceUuid:null,itemSlug:null,itemRulesJSON:'[]'};
  const resolver=prepareSyntheticIdentity({syntheticBindings:[row],ActorClass:Actor,ItemClass:Item,SceneClass:Scene,TokenDocumentClass:Token,ActorDeltaClass:Delta,getActors:()=>actors,getScenes:()=>scenes});
  for(const [version,expected] of [['old',true],['new',true],['unknown',false]]){
    for(const state of [delta._source,token._source.delta])Object.assign(state.items[0]._stats,{coreVersion:version,systemVersion:version});
    assert.equal(!!resolver.resolve(actor,item,binding),expected);
  }
});

test('note text changed to an i18n key retains exact chat display and native source', async () => {
  const previous={document:globalThis.document,HTMLElement:globalThis.HTMLElement};
  class HTML {
    constructor(value,leaf=false){this.value=value;this.leaf=leaf;this.attributes=[];this.childNodes=[value.replace(/^<li class="roll-note">|<\/li>$/g,'')];}
    get outerHTML(){return this.leaf?`<li class="roll-note">${this.childNodes.join('')}</li>`:this.value;}
    querySelectorAll(){return this.nodes??=[];}
    querySelector(){return this.querySelectorAll()[0]??null;}
    hasAttribute(){return false;}
    contains(node){return this.nodes?.includes(node)??false;}
    replaceChildren(...nodes){this.childNodes=nodes;}
  }
  const parse=value=>{const html=new HTML(value);html.nodes=[new HTML(value,true)];return html;};
  globalThis.HTMLElement=HTML;
  globalThis.document={createElement:()=>({set innerHTML(value){this.content=parse(value);}})};
  const {Actor,Item}=documents(),actor=new Actor({_id:'actor',type:'npc',name:'角色 Actor'}),user={id:'user',isGM:true};
  const row={approved:true,scope:'actorItem',actorId:'actor',actorType:'npc',actorName:actor.name,actorFolderId:null,actorSourceUuid:null,itemId:'item',itemType:'action',itemName:'能力 Ability',itemFolderId:null,itemSourceUuid:null,itemSlug:null,
    description:'正文',descriptionGM:'',ruleIndex:0,sourceRule:{key:'Note',selector:'damage',text:'Native text'},sourceRuleSha256:hash,display:{text:'中文提示'},approvalHashes:{text:hash},nativeEnglish:{'TEST.Note':'Native text'}};
  const variant=clone(row);variant.sourceRule.text='TEST.Note';variant.sourceRuleSha256='b'.repeat(64);row.sourceVariants=[variant];
  const item=new Item({_id:'item',type:'action',name:row.itemName,system:{slug:null,description:{value:'正文',gm:''},rules:[clone(variant.sourceRule)]}},actor);
  class Rule {beforePrepareData(){}}
  const rule=new Rule();Object.assign(rule,{key:'Note',sourceIndex:0,item,parent:item,actor,selector:['damage'],predicate:[],outcome:[],title:null,visibility:null,text:'TEST.Note'});item.rules=[rule];
  class Note {
    constructor(data){Object.assign(this,data);}
    toObject(){return {selector:'damage',text:this.text,title:null,visibility:null,predicate:[],outcome:[]};}
    toHTML(){return new HTML(`<li class="roll-note">${this.text==='TEST.Note'?'Native text':this.text}</li>`,true);}
  }
  const note=new Note({rule,text:'TEST.Note'});actor.synthetics={rollNotes:{damage:[note]}};
  class Chat {
    _onCreate(){}
    async renderHTML(){return parse(this._source.flavor);}
    getRollData(){return {};}
  }
  class Editor {static async enrichHTML(value){return value;}}
  const message=new Chat();Object.assign(message,{isContentVisible:true,speakerActor:actor,_source:{flavor:'<li class="roll-note">Native text</li>',flags:{pf2e:{context:{notes:[note.toObject()]}}}}});
  const before=clone(item._source);
  const dispose=installBobNoteDisplay({NoteRuleClass:Rule,ItemClass:Item,ActorClass:Actor,ChatMessageClass:Chat,TextEditorClass:Editor,bindings:[row],isEnabled:()=>true,getUser:()=>user,getActors:()=>[actor]});
  try {
    assert.equal((await message.renderHTML()).querySelector().outerHTML,'<li class="roll-note">中文提示</li>');
    assert.deepEqual(item._source,before);
  } finally {dispose();Object.assign(globalThis,previous);}
});
