/** Private Basic 2.8 / Babele 2.9.1 / core 3.1.2 bootstrap candidate.
 * No static CN mapping delta. No global init/fetch/Actor/prototype wrapper.
 */
import '../../pf2e_compendium_chn/babele.js';
import '../../pf2e_compendium_chn/npc/NPCTranslator.js';
import {readyCheckComplete} from './babele-failsafe.js';
import {registerBasicScopedItems,TARGET_PACK,CONVERTER_NAME} from './basic-scoped-items.mjs';

const OWNER=Symbol.for('pf2e-compendium-extra-cn.basic-bootstrap.v1');
const hooksInstalled=new WeakMap();
const CN=new Set(['cn','zh-CN','zh_Hans','zh-Hans','zh-cn','zh_hans']);
const ITEMS={path:'items',converter:CONVERTER_NAME,documentType:'Item',cardinality:'many'};
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const error=(code,detail)=>Object.assign(new Error(`${code}: ${detail}; retry the target read after readiness or reload after resolving the conflict.`),{code,retryable:true});
const own=(o,k)=>Object.getOwnPropertyDescriptor(o,k);
function dataSlot(o,k){
  for(let p=o;p;p=Object.getPrototypeOf(p)){const d=own(p,k);if(d)return 'value' in d?d:null;}
  return undefined;
}
function replaceable(o,k){const d=own(o,k);return d?('value' in d&&d.configurable):Object.isExtensible(o);}
function claim(o,value){if(own(o,OWNER)||!Object.isExtensible(o))throw error('BASIC_OWNERSHIP','object already owned or non-extensible');Object.defineProperty(o,OWNER,{value,configurable:true});}

// The tables actually reachable from NPCTranslator.item/Dictionary, not a
// three-key research sample. This is shape validation, not new translations.
function validDictionary(value){
  const strings=v=>object(v)&&Object.values(v).every(x=>typeof x==='string');
  const tables=['Strike','Lore','SkillVariant','Spellcasting','SpellOffset','Source','FastHealingRestriction','PushVariants','Range','RegenerationDeactivate','SaveDetails','Sense','SensePrecision','SenseRestriction','PerceptionDetails','Language'];
  if(!object(value)||!tables.every(k=>strings(value[k]))||!object(value.Item)||!object(value.MagicWeapons))return false;
  if(!Object.values(value.Item).every(v=>object(v)&&typeof v.name==='string'&&['baseItem','description'].every(k=>v[k]===undefined||typeof v[k]==='string')))return false;
  const m=value.MagicWeapons;
  if(!strings(m.BaseItemGender)||!strings(m.StrikingRunes))return false;
  return ['Materials','PropertyRunes'].every(k=>object(m[k])&&Object.values(m[k]).every(v=>object(v)&&['prefix','suffix'].includes(v.order)&&['f','m','n'].every(g=>typeof v[g]==='string')));
}

export function installBasicBootstrap(){
  const Hooks=globalThis.Hooks;
  if(hooksInstalled.has(Hooks))return hooksInstalled.get(Hooks);
  const state={facade:null,sessionFor:null,converter:null,problem:null,observation:null,readySeen:false};
  const mapped=new WeakMap(),collections=new WeakMap();
  function baseGuard(){
    if(game.system?.id!=='pf2e')return false;
    for(const [id,version] of [['babele','2.9.1'],['pf2e_compendium_chn','3.1.2'],['battlezoo-bestiary-pf2e','2.8'],['pf2e-compendium-extra-cn',null]]){
      const mod=game.modules?.get(id);if(!mod?.active||(version&&mod.version!==version))return false;
    }
    return true;
  }
  function guard(language){
    if(!baseGuard())return false;
    let lang=language,mode;
    try{lang??=game.settings.get('core','language');mode=game.settings.get('babele','loadingMode');}catch{return null;}
    if(typeof lang==='string'&&lang&&!CN.has(lang))return false;
    if(mode==='ondemand')return false;
    return CN.has(lang)&&mode==='full'?true:null;
  }
  function facadeOwned(){
    if(game.babele!==state.facade||state.facade?.[OWNER]!==state||state.facade.sessionFor!==state.sessionFor||state.facade.converterRegistry.named(CONVERTER_NAME)!==state.converter)
      throw error('BASIC_OWNERSHIP','facade or converter changed');
    if(state.problem)throw state.problem;
  }
  function observe(){
    if(state.observation)return;
    const npc=game.npcTrans,dict=npc?.dict;
    if(!dict||!object(dict))throw error('BASIC_DICTIONARY_OWNERSHIP','original core Dictionary missing');
    const previous=dataSlot(dict,'translations');
    if(previous===null||own(dict,OWNER)||!Object.isExtensible(dict))throw error('BASIC_DICTIONARY_OWNERSHIP','foreign accessor/owner or non-extensible dictionary');
    let settle;
    const record={npc,dict,status:'pending',value:undefined,problem:null,promise:new Promise(r=>{settle=r;})};
    state.observation=record;
    const finish=value=>{
      record.value=value;
      record.problem=value===undefined?error('BASIC_DICTIONARY_FAILED','original request assigned undefined'):validDictionary(value)?null:error('BASIC_DICTIONARY_INVALID','original request assigned invalid structure');
      record.status=record.problem?'failed':'ready';settle();
    };
    if(previous){finish(previous.value);return;}
    claim(dict,record);
    const getter=()=>undefined;
    const setter=value=>{
      // Only our own accessor is retired; preserve the original one assignment.
      const d=own(dict,'translations');
      if(dict[OWNER]!==record||d?.get!==getter||d?.set!==setter){record.problem=error('BASIC_DICTIONARY_OWNERSHIP','observer replaced');record.status='failed';settle();return;}
      Object.defineProperty(dict,'translations',{value,writable:true,enumerable:true,configurable:true});
      delete dict[OWNER];finish(value);
    };
    record.getter=getter;record.setter=setter;
    Object.defineProperty(dict,'translations',{configurable:true,enumerable:true,get:getter,set:setter});
  }
  function dictionaryState(){
    if(!game.ready||!state.readySeen)throw error('BASIC_NOT_READY','target body requested before the original core ready callback');
    const r=state.observation;
    if(!r||game.npcTrans!==r.npc||game.npcTrans.dict!==r.dict)throw error('BASIC_DICTIONARY_OWNERSHIP','original NPC/Dictionary instance changed or not observed');
    const d=own(r.dict,'translations');
    if(r.status==='pending'){
      if(d?.get!==r.getter||d?.set!==r.setter||r.dict[OWNER]!==r)throw error('BASIC_DICTIONARY_OWNERSHIP','pending observer no longer owned');
    }else if(!d||!('value' in d)||d.value!==r.value)throw error('BASIC_DICTIONARY_OWNERSHIP','settled Dictionary property replaced');
    return r;
  }
  function synchronousReady(){
    facadeOwned();const r=dictionaryState();if(r.problem)throw r.problem;
    if(r.status!=='ready')throw error('BASIC_NOT_READY','original Dictionary request is still pending');
  }
  function rebuild(pack){
    const original=pack.documentMapping,definition=original?.mapping;
    const hasItems=v=>object(v)&&Object.entries(v).some(([k,x])=>k==='items'||(Array.isArray(x)?x.some(hasItems):hasItems(x)));
    const items=definition?.items;
    if(!object(items)||items.path!=='items'||!['document','npc-item-translation'].includes(items.converter)||items.documentType!=='Item'||items.cardinality!=='many'||Object.keys(items).some(k=>!['path','converter','documentType','cardinality'].includes(k))||hasItems({_variants:definition._variants??[]})||!object(pack.customMapping??{}))
      throw error('BASIC_MAPPING_CONFLICT','unknown items definition or items variant');
    const custom={...(pack.customMapping??{}),items:{...ITEMS}};
    const next=pack.documentMappings.mappingFor('Actor',custom);
    const {items:ignoredOld,...oldRest}=definition,{items:ignoredNext,...newRest}=next.mapping;
    if(!same(oldRest,newRest)||!same(original.identityDefinition,next.identityDefinition)||!same(next.mapping.items,ITEMS))throw error('BASIC_MAPPING_CONFLICT','non-items mapping or identity changed');
    return next;
  }
  function decorate(session){
    const pack=session.mappedCompendiumFor(TARGET_PACK);if(!pack)return session;
    if(mapped.has(pack))return session;
    if(pack.metadata?.id!==TARGET_PACK||pack.metadata.type!=='Actor')throw error('BASIC_OWNERSHIP','target mapping identity mismatch');
    const names=['translate','translateField','translateIndex'];
    if(names.some(k=>!replaceable(pack,k)||typeof pack[k]!=='function')||!replaceable(pack,'documentMapping'))throw error('BASIC_OWNERSHIP','unwrappable target mapping');
    const r={session,pack,original:pack.documentMapping,next:null,problem:null,wrappers:{},originals:{},custom:JSON.stringify(pack.customMapping)};
    try{r.next=rebuild(pack);}catch(e){r.problem=e;}
    claim(pack,r);
    function switchMapping(wanted){
      if(pack.documentMapping!==r.original&&pack.documentMapping!==r.next)throw error('BASIC_OWNERSHIP','foreign documentMapping slot');
      if(pack.documentMapping!==wanted){pack.documentMapping=wanted;pack.invalidateCaches('basic-scoped-mapping-transition');}
    }
    r.restore=()=>switchMapping(r.original);
    function prepare(needsItems,eligible){
      const g=guard(session.language);
      if(g===false||!eligible){switchMapping(r.original);return;}
      try{
        facadeOwned();
        if(pack[OWNER]!==r||names.some(k=>pack[k]!==r.wrappers[k])||JSON.stringify(pack.customMapping)!==r.custom)throw error('BASIC_OWNERSHIP','target methods or customMapping changed');
        if(r.problem)throw r.problem;
        if(needsItems){if(g!==true)throw error('BASIC_GUARD_UNKNOWN','language/loadingMode not confirmed');synchronousReady();}
        switchMapping(g===true?r.next:r.original);
      }catch(e){if(pack.documentMapping===r.next)switchMapping(r.original);throw e;}
    }
    for(const name of names){
      const original=pack[name];r.originals[name]=original;
      r.wrappers[name]=function(...args){
        if(this!==pack)throw error('BASIC_OWNERSHIP','borrowed mapped-compendium method');
        const source=name==='translateField'?args[1]:args[0];
        const eligible=v=>['npc','hazard'].includes(v?.type);
        const withItems=v=>eligible(v)&&Object.hasOwn(v,'items');
        const wants=name==='translateIndex'?Array.from(source??[]).some(withItems):withItems(source)&&(name!=='translateField'||args[0]==='items');
        const applies=name==='translateIndex'?Array.from(source??[]).some(eligible):eligible(source);
        prepare(wants,applies);
        if(name==='translateIndex'){
          // Babele's cache key omits items/field shape. A cached plain index
          // must not suppress later items, nor inject items into a plain one.
          // Mixed indexes can change which ID carries items without changing
          // their aggregate shape. Do not reuse that underspecified cache.
          if(guard(session.language)===true&&(wants||r.indexHadItems))pack.invalidateCaches('basic-scoped-index-items');
          r.indexHadItems=wants;
        }
        return original.apply(this,args);
      };
      Object.defineProperty(pack,name,{value:r.wrappers[name],configurable:true,writable:true});
    }
    mapped.set(pack,r);return session;
  }
  function attachCollection(){
    if(!baseGuard())return;
    const pack=game.packs?.get(TARGET_PACK);if(!pack||collections.has(pack))return;
    if(!(pack instanceof globalThis.CompendiumCollection)||pack.collection!==TARGET_PACK)throw error('BASIC_OWNERSHIP','target is not the actual CompendiumCollection');
    const names=['getDocuments','getDocument'];
    if(names.some(k=>!replaceable(pack,k)||typeof pack[k]!=='function'))throw error('BASIC_OWNERSHIP','unwrappable target collection');
    const r={wrappers:{},proven:new WeakMap()};claim(pack,r);
    function restoreCurrent(){mapped.get(state.facade?.mappedCompendiumFor(TARGET_PACK))?.restore();}
    function owned(){
      if(game.packs.get(TARGET_PACK)!==pack||pack[OWNER]!==r||names.some(k=>pack[k]!==r.wrappers[k]))throw error('BASIC_OWNERSHIP','target collection replaced');
    }
    function readContext(){
      owned();synchronousReady();
      const current=state.facade.mappedCompendiumFor(TARGET_PACK),record=mapped.get(current);
      if(!record||current[OWNER]!==record||Object.entries(record.wrappers).some(([k,v])=>current[k]!==v)||JSON.stringify(current.customMapping)!==record.custom)
        throw error('BASIC_OWNERSHIP','target mapping or methods changed');
      if(record.problem)throw record.problem;
      if(current.documentMapping!==record.original&&current.documentMapping!==record.next)throw error('BASIC_OWNERSHIP','foreign documentMapping slot');
      return {mapping:current,dictionary:state.observation};
    }
    function sameContext(a,b){return a?.mapping===b.mapping&&a?.dictionary===b.dictionary;}
    async function gate(){
      const language=state.facade?.mappedCompendiumFor(TARGET_PACK)?.language;
      const g=guard(language);if(g===false){restoreCurrent();return;}
      if(g!==true)throw error('BASIC_GUARD_UNKNOWN','target read language/loadingMode not confirmed');
      facadeOwned();
      owned();const observation=dictionaryState();await observation.promise;
      await readyCheckComplete;
      if(!await state.facade.init())throw error('BASIC_INITIALIZATION_FAILED','original Babele initialization failed');
      const after=guard(state.facade?.mappedCompendiumFor(TARGET_PACK)?.language);
      if(after===false){restoreCurrent();return;}
      if(after!==true)throw error('BASIC_GUARD_UNKNOWN','guard changed while waiting for Dictionary');
      return readContext();
    }
    for(const name of names){const original=pack[name];r.wrappers[name]=async function(...args){
      if(this!==pack)throw error('BASIC_OWNERSHIP','borrowed target collection method');
      // Empty single-id lookup does not consume an Actor at all.
      if(name==='getDocument'&&!args[0])return original.apply(this,args);
      let context;
      try{context=await gate();}catch(e){restoreCurrent();throw e;}
      if(!context)return original.apply(this,args);
      // Let original failures propagate unchanged. Babele can catch a translation
      // failure internally and return source, so recheck outside that catch.
      const result=await original.apply(this,args);
      try{
        if(guard(state.facade?.mappedCompendiumFor(TARGET_PACK)?.language)!==true)
          throw error('BASIC_GUARD_CHANGED','guard changed during the target read');
        const after=readContext();
        if(!sameContext(context,after))throw error('BASIC_SESSION_CHANGED','target session changed during the read');
        if(name==='getDocuments'){
          // Native getDocuments always fetches. Do not certify an older cached
          // object with the same ID: it may predate the protected read entirely.
          for(const document of result)if(document instanceof foundry.abstract.Document)r.proven.set(document,context);
        }else if(result instanceof foundry.abstract.Document&&!sameContext(r.proven.get(result),context)){
          throw error('BASIC_CACHE_UNVERIFIED','cached target document predates a proven read; retry with a fresh getDocuments read or after native refresh');
        }
        return result;
      }catch(e){
        // Never replace the consumer's error with a secondary restoration error.
        try{restoreCurrent();}catch{}
        throw e;
      }
    };Object.defineProperty(pack,name,{value:r.wrappers[name],configurable:true,writable:true});}
    collections.set(pack,r);
  }
  function recordFailure(fn){try{return fn();}catch(e){state.problem=e;console.error('Basic scoped bootstrap:',e);}}
  Hooks.once('babele.init',babele=>recordFailure(()=>{
    if(!baseGuard())return;
    if(state.facade===babele)return;
    const original=babele.sessionFor;
    if(typeof original!=='function'||!replaceable(babele,'sessionFor'))throw error('BASIC_OWNERSHIP','unwrappable facade sessionFor');
    claim(babele,state);state.facade=babele;
    try{
      state.converter=registerBasicScopedItems(babele,{version:game.modules.get('babele').version});
      state.sessionFor=function(...args){if(this!==babele)throw error('BASIC_OWNERSHIP','borrowed facade method');return original.apply(this,args).then(session=>decorate(session));};
      Object.defineProperty(babele,'sessionFor',{value:state.sessionFor,writable:true,configurable:true});
    }catch(e){if(babele[OWNER]===state)delete babele[OWNER];throw e;}
  }));
  Hooks.once('setup',()=>recordFailure(attachCollection));
  Hooks.once('ready',()=>recordFailure(()=>{
    state.readySeen=true;if(!baseGuard())return;
    attachCollection();if(guard()!==false)observe();
  }));
  const registration=Object.freeze({scope:TARGET_PACK});hooksInstalled.set(Hooks,registration);return registration;
}

// Append this ESM after core registration/NPC modules; callbacks never wait on
// global ready/init. Only target reads await the original Dictionary assignment.
if(globalThis.Hooks&&globalThis.game)installBasicBootstrap();
