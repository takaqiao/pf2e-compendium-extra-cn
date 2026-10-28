import assert from 'node:assert/strict';
import test from 'node:test';
import {installEldamonEffectDisplay} from '../scripts/eldamon-legends-effect-display.mjs';

const SOURCE = 'Compendium.battlezoo-eldamon-legends-pf2e.pf2e-effects.Item.S7p5yXf4BzSujMrL';
const EN = 'Effect: Pelagic Pressure', CN = '效果：深海重压 Effect: Pelagic Pressure';
const rule = {key:'ItemAlteration',itemId:'{item|id}',property:'name',mode:'override',
  predicate:[{not:'self:signature:{item|origin.signature}'}],value:EN};

// The DOM boundary is supplied explicitly; selectors follow the shipped PF2e templates.
class Element {
  constructor(text = null) {
    this.childNodes = text === null ? [] : [{nodeType:3,data:text}];
    this.dataset = {}; this.queries = new Map(); this.selectors = new Set();
    this.attributes = new Map(); this.descendants = new Set(); this.isConnected = true;
  }
  querySelectorAll(selector) { return this.queries.get(selector) ?? []; }
  matches(selector) { return this.selectors.has(selector); }
  closest() { return this.hidden ? this : null; }
  contains(element) { return this.descendants.has(element); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  setAttribute(name,value) { this.attributes.set(name,value); }
}
class Actor {
  constructor() { this.id='actor'; this.items=new Map(); this.permitted=true; }
  testUserPermission() { return this.permitted; }
}
class Item {
  constructor(actor) {
    this.id='effect'; this.uuid='Actor.actor.Item.effect'; this.actor=this.parent=actor;
    this.type='effect'; this.preparedName=EN; this.system={slug:null}; this.isIdentified=true;
    this._source={_id:this.id,type:'effect',name:'Aura: Pelagic Pressure',_stats:{compendiumSource:SOURCE},
      system:{slug:null,rules:[{key:'Aura'},{key:'FlatModifier'},structuredClone(rule)]}};
    this.system.rules=structuredClone(this._source.system.rules);
    actor.items.set(this.id,this);
  }
  get name() { return this.preparedName; }
  set name(_value) { throw Error('display must not assign item.name'); }
}
class Chat {}
class Tooltip {
  calls=[]; result={native:true};
  activate(...args) { this.calls.push({receiver:this,args}); if(this.error)throw this.error; return this.result; }
}
function fixture(mode='full') {
  const actor=new Actor(),item=new Item(actor),tooltip=new Tooltip(),panel=new Element();
  const game={system:{id:'pf2e'},i18n:{lang:'cn'},user:{isGM:false,character:actor},
    modules:new Map(['babele','battlezoo-eldamon-legends-pf2e','pf2e-compendium-extra-cn'].map(id=>[id,{active:true}])),
    settings:{get:()=>mode},tooltip,pf2e:{effectPanel:{element:panel}}};
  const hooks=new Map(),runtime={getGame:()=>game,Hooks:{on:(name,fn)=>hooks.set(name,fn)},
    ItemClass:Item,ActorClass:Actor,ChatMessageClass:Chat,HTMLElementClass:Element,tooltip,
    resolveUuid:uuid=>uuid===item.uuid?actor.items.get(item.id):null,
    getPanelActor:()=>game.user.character};
  const adapter=installEldamonEffectDisplay(runtime);
  return {actor,item,tooltip,panel,game,hooks,runtime,adapter};
}
function sheet(f) {
  const root=new Element(),row=new Element(),title=new Element(EN),img=new Element();
  row.dataset={itemId:f.item.id,itemType:'effect'};
  root.queries.set('li.effects[data-item-type="effect"][data-item-id]',[row]);
  row.queries.set(':scope > .item-name > h4.action-name > a[data-action="toggle-summary"]',[title]);
  row.queries.set(':scope > .item-name > a.item-image > img',[img]);
  img.setAttribute('alt',EN);
  return {root,row,title,img,app:{actor:f.actor,element:[root]}};
}
function tip(f) {
  const target=new Element(),html=new Element(),title=new Element('\n  '+EN+'\n  ');
  const edit={nodeType:1,tagName:'A',attributes:{'data-action':'edit'},click:()=> 'edit'};
  const chat={nodeType:1,tagName:'A',attributes:{'data-action':'send-to-chat'},click:()=> 'chat'};
  title.childNodes.push(edit,chat);
  target.dataset.itemId=f.item.id;target.selectors.add('.effect-item[data-item-id]');
  html.dataset.itemUuid=f.item.uuid;html.selectors.add('.content[data-item-uuid]');
  html.queries.set(':scope > h1',[title]);f.panel.descendants.add(target);
  return {target,html,title,edit,chat,options:{html,cssClass:'pf2e effect-info application',direction:'LEFT',locked:true}};
}
function card(f) {
  const root=new Element(),card=new Element(),title=new Element(EN),img=new Element(),message=new Chat();
  Object.assign(message,{id:'message',item:f.item,speakerActor:f.actor,visible:true,isContentVisible:true,blind:false,isRoll:false,rolls:[]});
  root.dataset.messageId=message.id;root.selectors.add('li.chat-message.message');
  root.queries.set('.message-content > .pf2e.chat-card.item-card',[card]);
  card.dataset={itemId:f.item.id,actorId:f.actor.id};
  card.queries.set(':scope > header.card-header > h3',[title]);
  card.queries.set(':scope > header.card-header > img',[img]);img.setAttribute('alt',EN);
  return {root,card,title,img,message};
}

for(const mode of ['full','ondemand'])test(`the actor effect row translates only display names in ${mode}`,()=>{
  const f=fixture(mode),s=sheet(f),before=structuredClone(f.item._source);
  f.hooks.get('renderActorSheet')(s.app,[s.root]);
  assert.equal(s.title.childNodes[0].data,CN);assert.equal(s.img.getAttribute('alt'),CN);
  assert.equal(f.item.name,EN);assert.deepEqual(f.item._source,before);assert.equal(f.item.system.slug,null);
});

test('native normalized rules with an injected origin signature allow display without changing either rule',()=>{
  const f=fixture();
  f.item.system.rules[2]={...structuredClone(rule),
    predicate:[{not:'self:signature:3683c742-77d0-53e7-ba42-3d6f5310f321'}],
    slug:null,priority:150,ignored:false,requiresEquipped:null,requiresInvestment:null,
    battleForm:false,fromEquipment:true};
  const sourceBefore=structuredClone(f.item._source),preparedBefore=structuredClone(f.item.system);
  const s=sheet(f),t=tip(f),c=card(f);
  f.hooks.get('renderActorSheet')(s.app,[s.root]);
  f.tooltip.activate(t.target,t.options);
  f.hooks.get('renderChatMessageHTML')(c.message,c.root);
  assert.equal(s.title.childNodes[0].data,CN);
  assert.equal(t.title.childNodes[0].data,'\n  '+CN+'\n  ');
  assert.equal(c.title.childNodes[0].data,CN);
  assert.equal(f.item.name,EN);
  assert.deepEqual(f.item._source,sourceBefore);assert.deepEqual(f.item.system,preparedBefore);
});

test('tooltip title retains native controls, options, receiver, arguments and return identity',()=>{
  const f=fixture(),t=tip(f),before=structuredClone(f.item._source),extra={argument:true};
  const result=f.tooltip.activate(t.target,t.options,extra);
  assert.equal(t.title.childNodes[0].data,'\n  '+CN+'\n  ');
  assert.equal(t.title.childNodes[1],t.edit);assert.equal(t.title.childNodes[2],t.chat);
  assert.equal(t.edit.click(),'edit');assert.equal(t.chat.click(),'chat');
  assert.equal(result,f.tooltip.result);assert.equal(f.tooltip.calls[0].receiver,f.tooltip);
  assert.deepEqual(f.tooltip.calls[0].args,[t.target,t.options,extra]);
  assert.equal(t.options.html,t.html);assert.equal(f.item.name,EN);assert.deepEqual(f.item._source,before);
});

test('visible native item cards translate the exact effect without changing message content',()=>{
  const f=fixture(),c=card(f);c.message.content='<p>saved English card</p>';
  f.hooks.get('renderChatMessageHTML')(c.message,c.root);
  assert.equal(c.title.childNodes[0].data,CN);assert.equal(c.img.getAttribute('alt'),CN);
  assert.equal(c.message.content,'<p>saved English card</p>');assert.equal(f.item.name,EN);
});

test('source, rule, prepared name, actor identity and visibility changes retain native names',()=>{
  for(const mutate of [
    f=>f.item._source._stats.compendiumSource='Compendium.other.Item.same',
    f=>f.item._source.system.rules[2].predicate=[],f=>f.item._source.system.rules[2].value=CN,
    f=>f.item._source.system.rules[2].itemId='another',f=>f.item._source.system.slug='custom',
    f=>f.item.preparedName='A custom name',f=>f.actor.items.delete(f.item.id),
    f=>f.item.isIdentified=false,f=>f.actor.permitted=false,f=>f.game.i18n.lang='en',
    f=>f.game.modules.get('battlezoo-eldamon-legends-pf2e').active=false
  ]){
    const f=fixture(),s=sheet(f);mutate(f);f.hooks.get('renderActorSheet')(s.app,s.root);
    assert.equal(s.title.childNodes[0].data,EN);assert.equal(s.img.getAttribute('alt'),EN);
  }
});

test('tooltip checks the final selected actor and both DOM item identities after native rendering',()=>{
  for(const mutate of [
    (f,t)=>f.game.user.character=new Actor(),(f,t)=>f.panel.descendants.clear(),
    (f,t)=>t.target.dataset.itemId='other',(f,t)=>t.html.dataset.itemUuid='Actor.other.Item.other',
    (f,t)=>t.options.cssClass='other',(f,t)=>t.options.direction='RIGHT',
    (f,t)=>t.target.isConnected=false,(f,t)=>f.actor.items.delete(f.item.id),
    (f,t)=>f.actor.permitted=false,(f,t)=>t.title.hidden=true
  ]){
    const f=fixture(),t=tip(f);mutate(f,t);const result=f.tooltip.activate(t.target,t.options);
    assert.equal(t.title.childNodes[0].data,'\n  '+EN+'\n  ');assert.equal(result,f.tooltip.result);
  }
});

test('unrelated tooltip calls and native failures preserve their result or error',()=>{
  const f=fixture(),target=new Element(),options={text:'unrelated'};
  assert.equal(f.tooltip.activate(target,options),f.tooltip.result);
  assert.equal(f.tooltip.calls[0].args[1],options);
  const error=Error('native failure');f.tooltip.error=error;
  assert.throws(()=>f.tooltip.activate(target,options),e=>e===error);
});

test('hidden or unrelated message cards and editable name fields remain untouched',()=>{
  for(const mutate of [c=>c.message.visible=false,c=>c.message.isContentVisible=false,c=>c.message.blind=true,
    c=>c.card.dataset.itemId='other',c=>c.title.hidden=true]){
    const f=fixture(),c=card(f);mutate(c);f.hooks.get('renderChatMessageHTML')(c.message,c.root);
    assert.equal(c.title.childNodes[0].data,EN);
  }
  const f=fixture(),s=sheet(f),input={value:EN};s.root.queries.set('input[name="name"]',[input]);
  s.title.childNodes[0].data='Custom display';f.hooks.get('renderActorSheet')(s.app,s.root);
  assert.equal(input.value,EN);assert.equal(s.img.getAttribute('alt'),EN);
});

test('repeated installation does not stack observers',()=>{
  const f=fixture(),wrapper=f.tooltip.activate;
  assert.equal(installEldamonEffectDisplay(f.runtime),f.adapter);assert.equal(f.tooltip.activate,wrapper);
});

test('unwritable native tooltip methods and foreign accessors are not replaced or evaluated',()=>{
  for(const descriptor of [
    {value:Tooltip.prototype.activate,writable:false,configurable:false},
    {get(){throw Error('foreign getter must not run');},configurable:true}
  ]){
    const f=fixture(),tooltip={};Object.defineProperty(tooltip,'activate',descriptor);
    const before=Object.getOwnPropertyDescriptor(tooltip,'activate');
    const hooks={on(){}};
    const adapter=installEldamonEffectDisplay({...f.runtime,Hooks:hooks,tooltip});
    assert.equal(adapter.tooltipInstalled,false);
    assert.deepEqual(Object.getOwnPropertyDescriptor(tooltip,'activate'),before);
  }
});
