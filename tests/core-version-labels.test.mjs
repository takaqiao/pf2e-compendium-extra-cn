import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import {AV_CORE_851_DESCRIPTIONS} from '../scripts/av-core-851-description-data.mjs';

globalThis.Hooks={on(){}};
const {applyAvCore851Descriptions}=await import('../scripts/av-core-851-descriptions.mjs');
const {supportsAvLegacyContentLinks}=await import('../scripts/av-legacy-content-links.mjs');
const {installAvOnDemandReentryGuard}=await import('../scripts/av-ondemand-reentry.mjs');

const EXTRA='pf2e-compendium-extra-cn',LEGENDS='battlezoo-eldamon-legends-pf2e';
const coreLabels=[{version:'14.369',generation:14},{version:'15.100',generation:15}];
function fixture({version='15.100',generation=15}={}){
  return {version,release:{generation},system:{id:'pf2e',version:'8.5.1'},i18n:{lang:'cn',translations:{}},
    modules:new Map([[EXTRA,{active:true}],['babele',{active:true,version:'2.9.1'}],
      ['pf2e_compendium_chn',{active:true,version:'3.1.2'}],
      ['tianzes-gauntlight-extras',{active:true,version:'2.0.0'}],
      [LEGENDS,{active:true,version:'3.0'}],['battlezoo-dragons-core-pf2e',{active:true,version:'1.2'}]]),
    settings:{get:()=> 'full'}};
}
function loadScript(name,game,globals={}){
  const hooks=new Map();
  const context=vm.createContext({game,Boolean,...globals,Hooks:{
    on:(event,callback)=>hooks.set(event,callback),once:(event,callback)=>hooks.set(event,callback)}});
  vm.runInContext(readFileSync(new URL(`../scripts/${name}`,import.meta.url),'utf8'),context);
  return hooks;
}
function descriptionContext(){
  const field=AV_CORE_851_DESCRIPTIONS[0];
  const source={_id:field.documentId,type:'npc',items:[{_id:field.itemId,type:'action',system:{description:{value:field.english}}}]};
  const translated=structuredClone(source);
  translated.items[0].system.description.value=field.previousTranslation;
  return {metadata:{id:field.packId,type:'Actor'},source,translated};
}

test('AV description repair depends on approved source text rather than the core version label',()=>{
  for(const core of coreLabels){
    globalThis.game=fixture(core);
    const context=descriptionContext(),source=structuredClone(context.source);
    assert.equal(applyAvCore851Descriptions(context),1);
    assert.ok(context.translated.items[0].system.description.value.startsWith('<p><strong>需求</strong> 醉鬼搏击手'));
    assert.deepEqual(context.source,source);
  }
});

test('AV description repair rejects changed source, system, language and dependency contracts',()=>{
  for(const mutate of [
    (g,c)=>c.source.items[0].system.description.value='changed source',
    (g,c)=>c.translated.items[0]._id='another-item',
    g=>g.system.version='8.6.0',g=>g.i18n.lang='en',
    g=>g.modules.get('babele').version='3.0.0',g=>g.modules.get(EXTRA).active=false]){
    const game=fixture(),context=descriptionContext();mutate(game,context);globalThis.game=game;
    const translated=structuredClone(context.translated);
    assert.equal(applyAvCore851Descriptions(context),0);
    assert.deepEqual(context.translated,translated);
  }
});

test('AV legacy links accept an unchanged supported runtime across core labels',()=>{
  for(const core of coreLabels)assert.equal(supportsAvLegacyContentLinks(fixture(core)),true);
});

test('AV legacy links still require the source module, supported system and Chinese locale',()=>{
  for(const mutate of [g=>g.system.id='other',g=>g.system.version='8.6.0',g=>g.i18n.lang='en',
    g=>g.modules.get('tianzes-gauntlight-extras').version='2.0.1',
    g=>g.modules.get('tianzes-gauntlight-extras').active=false]){
    const game=fixture();mutate(game);assert.equal(supportsAvLegacyContentLinks(game),false);
  }
});

function reentryFixture(core){
  const game=fixture(core);game.settings.get=()=> 'ondemand';
  class MappedCompendium {
    metadata={id:'pf2e-abomination-vaults.av'};
    translate(data){return {...data,flags:{babele:{originalName:data.name}}};}
  }
  installAvOnDemandReentryGuard(MappedCompendium);
  const data={name:'已翻译条目',flags:{babele:{translated:true,hasTranslation:true,originalName:'Original entry',originalPayload:{name:'Original entry'}}}};
  return {game,pack:new MappedCompendium(),data};
}

test('AV on-demand reentry preserves the original English payload across core labels',()=>{
  for(const core of coreLabels){
    const {game,pack,data}=reentryFixture(core);globalThis.game=game;
    assert.equal(pack.translate(data),data);
    assert.equal(data.flags.babele.originalPayload.name,'Original entry');
  }
});

test('AV reentry delegates incomplete metadata and requests outside the approved contract',()=>{
  for(const mutate of [f=>f.data.flags.babele.originalPayload.name='mismatch',
    f=>f.data.flags.babele.unexpected=true,f=>f.pack.metadata.id='another.pack',
    f=>f.game.system.version='8.6.0',f=>f.game.settings.get=()=> 'full']){
    const f=reentryFixture();mutate(f);globalThis.game=f.game;
    assert.notEqual(f.pack.translate(f.data),f.data);
  }
  const f=reentryFixture();globalThis.game=f.game;
  assert.notEqual(f.pack.translate(f.data,true),f.data);
});

const journalKey='battlezoo-dragons-core-pf2e Journal';
test('journal startup labels translate across core labels',()=>{
  for(const core of coreLabels){
    const game=fixture(core),hooks=loadScript('journal-label4-compat.js',game);
    hooks.get('i18nInit')();
    assert.equal(game.i18n.translations[journalKey],'战斗动物园：龙族核心日志');
  }
});

test('journal startup labels preserve existing translations and withdraw owned labels when eligibility changes',()=>{
  const game=fixture(),hooks=loadScript('journal-label4-compat.js',game);
  game.i18n.translations[journalKey]='已有译文';hooks.get('i18nInit')();
  assert.equal(game.i18n.translations[journalKey],'已有译文');
  delete game.i18n.translations[journalKey];hooks.get('i18nInit')();
  game.i18n.lang='en';hooks.get('i18nInit')();
  assert.equal(Object.hasOwn(game.i18n.translations,journalKey),false);
  game.i18n.lang='cn';game.modules.get('battlezoo-dragons-core-pf2e').version='unreviewed';hooks.get('i18nInit')();
  assert.equal(Object.hasOwn(game.i18n.translations,journalKey),false);
});

function legendsFixture(core){
  const game=fixture(core);
  class BooleanField {}
  const field=new BooleanField();field.name=LEGENDS+'.introPopUp';field.label='Intro Pop-Up';
  const setting={namespace:LEGENDS,key:'introPopUp',type:Boolean,scope:'client',config:true,default:true};
  game.settings.settings=new Map([[field.name,setting]]);
  const hooks=loadScript('eldamon-legends-display.js',game,{foundry:{data:{fields:{BooleanField}}}});
  const context={categories:{[LEGENDS]:{entries:[{field}]}}};
  return {game,field,setting,render:()=>hooks.get('preRenderSettingsConfig')({},context)};
}

test('Eldamon settings display translates a matching field across core labels',()=>{
  for(const core of coreLabels){
    const f=legendsFixture(core);f.render();assert.equal(f.field.label,'介绍弹窗');
  }
});

test('Eldamon settings display rejects changed field contracts and dependencies',()=>{
  for(const mutate of [f=>f.setting.scope='world',f=>Object.setPrototypeOf(f.field,Object.prototype),
    f=>f.game.system.version='8.6.0',f=>f.game.modules.get(LEGENDS).version='unreviewed',
    f=>f.game.i18n.lang='en']){
    const f=legendsFixture();mutate(f);f.render();assert.equal(f.field.label,'Intro Pop-Up');
  }
});
