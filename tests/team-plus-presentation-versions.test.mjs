import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import test from 'node:test';
import data from '../scripts/team-plus-presentation-data.mjs';
import {createPresentationAdapter} from '../scripts/team-plus-presentation-adapter.mjs';

const MAGIC='pf2e-team-plus-magic';
const hash=text=>createHash('sha256').update(text).digest('hex');
function fixture({version='1.3.6',source='new source'}={}){
 const module={active:true,version};
 const game={system:{id:'pf2e',version:'8.5.1'},release:{generation:14},i18n:{lang:'cn'},
  modules:new Map([[MAGIC,module],['pf2e-compendium-extra-cn',{active:true}]]),settings:{get:()=> 'full'}};
 const payload={...data,profiles:{[MAGIC]:{version:'1.3.5',files:{'dist/magic.js':hash('old source')},
  additionalVersions:{'1.3.6':{files:{'dist/magic.js':hash('new source')}}}}}};
 const runtime={game,data:payload,fetchSource:async path=>{
  assert.equal(path,`modules/${MAGIC}/dist/magic.js`);
  return source;
 }};
 return {...runtime,module,adapter:createPresentationAdapter(runtime)};
}
function buttonLabel(adapter){
 const buttons=[{class:'dynamic-mastery',label:'Dynamic Mastery'}];
 adapter.headerButtons({item:{uuid:data.dynamic[0].uuid}},buttons);
 return buttons[0].label;
}

test('both reviewed releases enable translated controls only after their own source passes',async()=>{
 for(const [version,source] of [['1.3.5','old source'],['1.3.6','new source']]){
  const {adapter}=fixture({version,source});
  assert.equal(buttonLabel(adapter),'Dynamic Mastery');
  await adapter.verifySources();
  assert.equal(buttonLabel(adapter),'动态精通');
 }
});

test('core version labels do not prevent source-verified controls from translating',async()=>{
 for(const [version,generation] of [['14.369',14],['15.100',15]]){
  const {adapter,game}=fixture();game.version=version;game.release.generation=generation;
  await adapter.verifySources();
  assert.equal(buttonLabel(adapter),'动态精通');
 }
});

test('source hashes from another reviewed release do not enable translated controls',async()=>{
 for(const [version,source] of [['1.3.5','new source'],['1.3.6','old source'],['1.3.6','new source changed']]){
  const {adapter}=fixture({version,source});
  await adapter.verifySources();
  assert.equal(buttonLabel(adapter),'Dynamic Mastery');
  assert.deepEqual(adapter.diagnostics.sourceChecks,[{module:MAGIC,pass:false}]);
 }
});

test('a module version change cannot reuse a previous source verification',async()=>{
 const {adapter,module}=fixture({version:'1.3.5',source:'old source'});
 await adapter.verifySources();
 assert.equal(buttonLabel(adapter),'动态精通');
 module.version='1.3.6';
 assert.equal(buttonLabel(adapter),'Dynamic Mastery');
 await adapter.verifySources();
 assert.equal(buttonLabel(adapter),'Dynamic Mastery');
});

test('failed source rechecks revoke a previous verification',async()=>{
 const runtime=fixture({version:'1.3.5',source:'old source'});
 let source='old source';
 const adapter=createPresentationAdapter({...runtime,fetchSource:async()=>source});
 await adapter.verifySources();
 assert.equal(buttonLabel(adapter),'动态精通');
 source='changed source';
 await adapter.verifySources();
 assert.equal(buttonLabel(adapter),'Dynamic Mastery');
});

test('missing source files and unknown versions leave native controls intact',async()=>{
 const runtime=fixture({version:'1.3.5',source:'old source'});
 const missing=createPresentationAdapter({...runtime,fetchSource:async()=>{throw Error('missing source');}});
 await missing.verifySources();
 assert.equal(buttonLabel(missing),'Dynamic Mastery');
 for(const version of ['1.3.7','1.3.6-custom','toString']){
  runtime.module.version=version;
  const adapter=createPresentationAdapter({...runtime,verifiedModules:new Set([MAGIC])});
  await adapter.verifySources();
  assert.equal(buttonLabel(adapter),'Dynamic Mastery');
 }
});

test('a version change during source loading cannot approve the new release',async()=>{
 const runtime=fixture({version:'1.3.5',source:'old source'});
 const adapter=createPresentationAdapter({...runtime,fetchSource:async()=>{
  runtime.module.version='1.3.6';
  return 'old source';
 }});
 await adapter.verifySources();
 assert.equal(buttonLabel(adapter),'Dynamic Mastery');
});

test('published profiles retain the old releases and accept only the five reviewed updates',()=>{
 const releases={
  'pf2e-team-plus-alchemists':['1.0.1','1.0.2'],
  'pf2e-team-plus-barbarians':['1.1.3','1.1.5'],
  'pf2e-team-plus-magic':['1.3.5','1.3.6'],
  'pf2e-team-plus-tian-xia':['1.0.0','1.0.1'],
  'pf2e-team-plus-wizards':['1.1.3','1.1.4'],
 };
 for(const [id,versions] of Object.entries(releases)){
  for(const version of [...versions,'unreviewed']){
   const {game}=fixture();
   game.modules.set(id,{active:true,version});
   const adapter=createPresentationAdapter({game,data,verifiedModules:new Set([id])});
   assert.equal(adapter.allowed(id),version!=='unreviewed',`${id} ${version}`);
  }
 }
});
