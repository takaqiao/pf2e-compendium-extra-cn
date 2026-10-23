import assert from 'node:assert/strict';
import test from 'node:test';
import {installBobMementoDisplay} from '../scripts/bob-memento-display-core.mjs';

const clone = structuredClone;
const extra = 'pf2e-compendium-extra-cn';

function host() {
  const actors = new Map();
  class Actor {
    constructor(source) {
      this._source = clone(source);
      Object.assign(this, clone(source), {id:source._id,parent:null,isToken:false,collection:actors,items:new Map(),visible:true});
      actors.set(this.id, this);
    }
    transferItemToActor(target, item, prefix = 'Returned ') {
      const copy = item.toObject();
      copy._id = 'copy';
      copy.name = prefix + copy.name;
      copy.system.hp.max = 1;
      return new Item(copy, target);
    }
  }
  class Item {
    constructor(source, actor) {
      this._source = clone(source);
      Object.assign(this, clone(source), {id:source._id,parent:actor,actor,collection:actor.items,isIdentified:true,visible:true});
      actor.items.set(this.id, this);
    }
    get slug() { return this.system.slug; }
    toObject() { return clone(this._source); }
  }
  class ItemSheet {
    constructor(item) { this.item = this.object = item; }
    get title() { return this.item.name; }
    _renderInner() {} _getSubmitData() {} _updateObject() {} close() {}
  }
  class ActorSheet { _renderInner() {} close() {} }
  class Chat { renderHTML() {} }
  const rawActor = {_id:'fountain',type:'loot',name:'Fountain',img:'fountain.webp',folder:null,flags:{},_stats:{compendiumSource:null}};
  const origin = new Actor({...clone(rawActor),_id:'origin',type:'npc',name:'Keeper'});
  const fountain = new Actor(rawActor);
  const rawItem = {_id:'keepsake',type:'equipment',name:'Keepsake',img:'keepsake.webp',flags:{},
    system:{slug:'keepsake',quantity:1,equipped:{carryType:'worn'},containerId:null,hp:{value:10,max:10},rules:[],
      description:{value:'',gm:'Hidden clue.'},publication:{title:'Adventure'}}};
  const approvedItem = clone(rawItem);
  approvedItem.name = '信物 Keepsake';
  approvedItem.system.description.gm = '冒险译文。';
  approvedItem.system.publication.title = '冒险';
  const importedItem = clone(approvedItem);
  importedItem.system.description.gm = '系统包译文。';
  importedItem.flags.babele = {translated:true,lang:'cn',originalPayload:{gmnote:'Hidden clue.',publication:'Adventure'}};
  const row = {actorId:origin.id,itemId:rawItem._id,actorType:origin.type,actorNames:[origin.name],actorFolder:null,
    actorImg:origin.img,actorSourceUuid:null,originalName:rawItem.name,approvedName:approvedItem.name,chineseName:'信物',
    displayName:'已毁的信物 Destroyed Keepsake',nativeExplicitSlug:'keepsake',nativeManagerTriggers:true,
    rawItem,approvedItem,approvedItemVariants:[importedItem],
    marker:{actorId:origin.id,itemId:rawItem._id,sourceFingerprint:'a'.repeat(64),approvalFingerprint:'b'.repeat(64)}};
  const dispose = installBobMementoDisplay({ItemClass:Item,ActorClass:Actor,ItemSheetClass:ItemSheet,ActorSheetClass:ActorSheet,ChatMessageClass:Chat,
    bindings:{rows:[row],fountain:{rawActor,nameRecord:{after:'喷泉 Fountain'}}},getActors:()=>actors,
    getUser:()=>({isGM:true}),getLocale:()=> 'cn',isEnabled:()=>true});
  return {row,origin,fountain,Item,ItemSheet,dispose};
}

test('exact imported mementos receive provenance before native transfer', () => {
  const h = host();
  try {
    const source = new h.Item(h.row.approvedItemVariants[0], h.origin), before = clone(source._source);
    const returned = h.origin.transferItemToActor(h.fountain, source);
    assert.deepEqual(returned.flags[extra]?.bobMementoDisplay, h.row.marker);
    assert.equal(new h.ItemSheet(returned).title, '已归还的信物 Returned Keepsake');
    assert.deepEqual(source._source, before);
    const expected = clone(before);
    expected._id = 'copy'; expected.name = 'Returned ' + expected.name; expected.system.hp.max = 1;
    expected.flags[extra] = {bobMementoDisplay:h.row.marker};
    assert.deepEqual(returned._source, expected);
  } finally { h.dispose(); }
});

test('original sources and legacy destroyed copies remain supported', () => {
  const h = host();
  try {
    for (const form of [h.row.rawItem,h.row.approvedItem]) {
      const source = new h.Item(form, h.origin);
      const returned = h.origin.transferItemToActor(h.fountain, source, 'Destroyed ');
      assert.deepEqual(returned.flags[extra]?.bobMementoDisplay, h.row.marker);
      assert.equal(new h.ItemSheet(returned).title, '已毁的信物 Destroyed Keepsake');
    }
  } finally { h.dispose(); }
});

test('unreviewed imported fields do not receive provenance', () => {
  const h = host();
  const changes = [
    s => { s.system.description.gm = 'Edited clue.'; },
    s => { s.system.publication.title = 'Other publication'; },
    s => { s.flags.babele.originalPayload.gmnote = 'Different source'; },
    s => { delete s.flags.babele; },
    s => { s.system.rules.push({key:'RollOption',option:'unreviewed'}); },
    s => { s.system.hp.max = 20; },
  ];
  try {
    for (const change of changes) {
      const edited = clone(h.row.approvedItemVariants[0]); change(edited);
      const source = new h.Item(edited, h.origin), before = clone(source._source);
      const returned = h.origin.transferItemToActor(h.fountain, source);
      assert.equal(returned.flags[extra], undefined);
      assert.equal(new h.ItemSheet(returned).title, returned.name);
      assert.deepEqual(source._source, before);
    }
  } finally { h.dispose(); }
});
