import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import test from 'node:test';
import data from '../scripts/team-plus-presentation-data.mjs';
import {createPresentationAdapter} from '../scripts/team-plus-presentation-adapter.mjs';

const MAGIC='pf2e-team-plus-magic';
const hash=text=>createHash('sha256').update(text).digest('hex');
function fixture({version='1.3.6',source='new source',fetchSource}={}){
 const module={active:true,version};
 const settings={mode:'full'};
 const game={system:{id:'pf2e',version:'8.5.1'},release:{generation:14},i18n:{lang:'cn'},
  modules:new Map([[MAGIC,module],['pf2e-compendium-extra-cn',{active:true}]]),settings:{get:()=>settings.mode}};
 const payload={...data,profiles:{[MAGIC]:{version:'1.3.5',files:{'dist/magic.js':hash('old source')},
  additionalVersions:{'1.3.6':{files:{'dist/magic.js':hash('new source')}}}}}};
 const runtime={game,data:payload,fetchSource:fetchSource??(async path=>{
  assert.equal(path,`modules/${MAGIC}/dist/magic.js`);
  return source;
 })};
 return {...runtime,module,settings,adapter:createPresentationAdapter(runtime)};
}
function buttonLabel(adapter){
 const buttons=[{class:'dynamic-mastery',label:'Dynamic Mastery'}];
 adapter.headerButtons({item:{uuid:data.dynamic[0].uuid}},buttons);
 return buttons[0].label;
}

test('an active module translates whatever its version label or source bytes',()=>{
 for(const version of ['1.3.5','1.3.7','1.4.1','custom'])for(const source of ['old source','unknown source']){
  const {adapter}=fixture({version,source});
  assert.equal(buttonLabel(adapter),'动态精通',`${version} ${source}`);
 }
});

test('core version labels do not prevent translated controls',()=>{
 for(const [version,generation] of [['14.369',14],['15.100',15]]){
  const {adapter,game}=fixture();game.version=version;game.release.generation=generation;
  assert.equal(buttonLabel(adapter),'动态精通');
 }
});

test('inactive modules, other languages, systems and Babele modes keep native controls',()=>{
 const cases=[
  ['module inactive',f=>{f.module.active=false;}],
  ['module missing',f=>{f.game.modules.delete(MAGIC);}],
  ['extra inactive',f=>{f.game.modules.get('pf2e-compendium-extra-cn').active=false;}],
  ['english',f=>{f.game.i18n.lang='en';}],
  ['zh-CN code',f=>{f.game.i18n.lang='zh-CN';}],
  ['other system',f=>{f.game.system.id='sf2e';}],
  ['babele translation off',f=>{f.settings.mode='disabled';}],
  ['settings unreadable',f=>{f.game.settings.get=()=>{throw Error('not ready');};}],
 ];
 for(const [label,apply] of cases){
  const f=fixture();apply(f);
  assert.equal(buttonLabel(f.adapter),'Dynamic Mastery',label);
 }
});

test('the Babele ondemand mode translates like full mode',()=>{
 const f=fixture();f.settings.mode='ondemand';
 assert.equal(buttonLabel(f.adapter),'动态精通');
});

test('deactivating the module at runtime restores native controls',()=>{
 const {adapter,module}=fixture();
 assert.equal(buttonLabel(adapter),'动态精通');
 module.active=false;
 assert.equal(buttonLabel(adapter),'Dynamic Mastery');
});

test('only modules with a reviewed profile are recognised',()=>{
 const {game,data:payload}=fixture();
 for(const id of ['pf2e-team-plus-unknown','toString','__proto__'])game.modules.set(id,{active:true,version:'1.0.0'});
 const adapter=createPresentationAdapter({game,data:payload});
 assert.equal(adapter.allowed(MAGIC),true);
 for(const id of ['pf2e-team-plus-unknown','toString','__proto__'])assert.equal(adapter.allowed(id),false,id);
});

test('source records are diagnostics only and never change what is shown',async()=>{
 for(const [source,reviewed] of [['old source',true],['new source',true],['unknown source',false]]){
  const {adapter}=fixture({version:'1.4.1',source});
  assert.deepEqual(await adapter.recordSources(),[{module:MAGIC,version:'1.4.1',reviewed}]);
  assert.equal(buttonLabel(adapter),'动态精通',source);
 }
});

test('missing source files are recorded without blocking translation',async()=>{
 const {adapter}=fixture({fetchSource:async()=>{throw Error('missing source');}});
 assert.deepEqual(await adapter.recordSources(),[{module:MAGIC,version:'1.3.6',reviewed:false}]);
 assert.equal(buttonLabel(adapter),'动态精通');
});

test('repeated source records replace the previous record',async()=>{
 let source='old source';
 const {adapter}=fixture({version:'1.4.1',fetchSource:async()=>source});
 await adapter.recordSources();
 source='changed source';
 assert.deepEqual(await adapter.recordSources(),[{module:MAGIC,version:'1.4.1',reviewed:false}]);
 assert.equal(adapter.diagnostics.sourceChecks.length,1);
});

test('every profiled Team+ module is allowed under any release label',()=>{
 for(const id of Object.keys(data.profiles)){
  for(const version of ['1.0.0','9.9.9','unreviewed']){
   const {game}=fixture();
   game.modules.set(id,{active:true,version});
   const adapter=createPresentationAdapter({game,data});
   assert.equal(adapter.allowed(id),true,`${id} ${version}`);
  }
 }
});
