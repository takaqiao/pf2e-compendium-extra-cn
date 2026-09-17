import {prepareNativeRuleSourceGuard} from './bob-rule-prepared-source.mjs';
import {prepareWeatherNameAttestation} from './bob-weather-name-attestation.mjs';
import {prepareSyntheticIdentity} from './bob-rule-synthetic-identity.mjs';
export const RULE_DISPLAY_FLAG='bobRuleDisplay';
const EXTRA='pf2e-compendium-extra-cn',nil=v=>v??null;
const stable=value=>JSON.stringify(value,(_key,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>[k,v[k]])):v);
const equal=(a,b)=>stable(a)===stable(b);
const physical=b=>['weapon','equipment'].includes(b.itemType);
function expectedLeaves(actual,expected,path='',dynamic=new Set){if(dynamic.has(path))return true;if(expected&&typeof expected==='object'){if(!actual||typeof actual!=='object'||Array.isArray(actual)!==Array.isArray(expected))return false;if(Array.isArray(expected))return equal(actual,expected);return Object.entries(expected).every(([key,v])=>expectedLeaves(actual[key],v,path?`${path}.${key}`:key,dynamic));}return nil(actual)===nil(expected);}
export function prepareBobRuleDisplayIdentity({bindings,syntheticBindings=[],legacyWorldIdentities=[],ActorClass,ItemClass,SceneClass,TokenDocumentClass,ActorDeltaClass,getActors,getItems,getScenes=()=>new Map,getPacks=()=>new Map,isEnabled,getLocale,getRuleClasses,getActiveRuleClasses,localize}){
  if(!Array.isArray(bindings)||![ActorClass,ItemClass,getActors,getItems,isEnabled,getLocale].every(f=>typeof f==='function'))throw Error('Native identity dependencies required');
  const preparedRules=prepareNativeRuleSourceGuard({getRuleClasses,getActiveRuleClasses});
  const weatherName=prepareWeatherNameAttestation({getRuleClasses,getActiveRuleClasses,localize});
  const rows=new Map;for(const row of structuredClone(bindings)){if(rows.has(row.key)||!row.sourceFingerprint||!row.approvalFingerprint||!Array.isArray(row.rules))throw Error('Invalid display binding');rows.set(row.key,row);}
  const legacy=new Map(legacyWorldIdentities.filter(i=>i.scope==='worldItem').map(i=>[`worldItem//${i.itemId}`,i]));
  const synthetic=prepareSyntheticIdentity({syntheticBindings,ActorClass,ItemClass,SceneClass,TokenDocumentClass,ActorDeltaClass,getActors,getScenes});
  const enabled=()=>isEnabled()&&['cn','zh-CN','zh-Hans'].includes(getLocale());
  const allowed=doc=>!doc?.pack||doc.pack.startsWith('pf2e-bastion-of-blasphemies.');
  function registered(doc,world){if(doc.pack){const pack=getPacks().get(doc.pack);return allowed(doc)&&pack===doc.collection&&pack.get(doc.id)===doc;}return doc.collection===world&&world.get(doc.id)===doc;}
  function sourceMatches(item,b){const s=item._source;if(!(item instanceof ItemClass)||!s||!allowed(item)||item.type!==b.itemType||s.type!==b.itemType||(item.name!==b.itemName&&!weatherName(item,{itemId:b.itemId,itemName:b.itemName,itemType:b.itemType,sourceRules:b.expectedSource.system.rules}))||s.name!==b.itemName||item.img!==b.itemImage||s.img!==b.itemImage||nil(s.folder)!==b.itemFolderId||nil(s._stats?.compendiumSource)!==b.itemSourceUuid||nil(s.system?.slug)!==b.itemSlug||nil(item.system?.slug)!==b.itemSlug||!preparedRules.matches(item,b)||s.system?.description?.value!==b.itemBody)return false;
    const dynamic=new Set(['_migration','rules']);if(physical(b)){for(const p of ['quantity','equipped','containerId','hp.value'])dynamic.add(p);if(!Number.isInteger(s.system.quantity)||s.system.quantity<1)return false;}if(b.itemType==='effect')dynamic.add('start');
    return expectedLeaves(s.system,b.expectedSource.system,'',dynamic);
  }
  function ownMarker(item){const marker=item._source.flags?.[EXTRA]?.[RULE_DISPLAY_FLAG];if(!marker||Object.keys(marker).sort().join(',')!=='approvalFingerprint,key,sourceFingerprint,version'||marker.version!==1)return null;const b=rows.get(marker.key);return b&&marker.sourceFingerprint===b.sourceFingerprint&&marker.approvalFingerprint===b.approvalFingerprint?b:null;}
  function legacyMarker(item){const marker=item._source.flags?.[EXTRA]?.bobIdentity;if(!marker||Object.keys(marker).sort().join(',')!=='approvalFingerprint,key,sourceFingerprint,version'||marker.version!==1)return null;const approval=legacy.get(marker.key),b=approval&&rows.get(`world/${approval.itemId}`);return b&&approval.sourceFingerprint===b.sourceFingerprint&&approval.approvedName===b.itemName&&approval.itemType===b.itemType&&marker.sourceFingerprint===approval.sourceFingerprint&&marker.approvalFingerprint===approval.approvalFingerprint?b:null;}
  function resolveItem(item){if(!enabled()||!(item instanceof ItemClass)||!allowed(item))return null;const actor=item.actor??item.parent;
    if(actor){if(!(actor instanceof ActorClass)||!allowed(actor)||item.parent!==actor||actor.items?.get(item.id)!==item)return null;
      if(actor.isToken===true){const b=rows.get(`${actor.token?.actorId}/${item.id}`);return b&&sourceMatches(item,b)&&synthetic.resolve(actor,item,b)?b:null;}
      if(actor.isToken!==false||actor.parent!=null||!registered(actor,getActors()))return null;
      const marked=ownMarker(item)??legacyMarker(item);if(marked&&sourceMatches(item,marked))return marked;
      const b=rows.get(`${actor.id}/${item.id}`),a=actor._source;if(!b||a?._id!==b.actorId||actor.type!==b.actorType||a.type!==b.actorType||actor.name!==b.actorName||a.name!==b.actorName||nil(a.folder)!==b.actorFolderId||nil(a._stats?.compendiumSource)!==b.actorSourceUuid)return null;return sourceMatches(item,b)?b:null;
    }
    const b=rows.get(`world/${item.id}`);return item.parent==null&&registered(item,getItems())&&b&&sourceMatches(item,b)?b:null;
  }
  function resolveRule(rule){const item=rule?.item,b=resolveItem(item);if(!b||rule.parent!==item||rule.actor!==item.actor||!item.rules?.includes(rule))return null;const row=b.rules.find(r=>r.index===rule.sourceIndex&&r.key===rule.key);return row&&equal(item._source.system.rules[row.index],row.source)?{binding:b,rule:row}:null;}
  // Constructors prepare before collection.set / Delta.syntheticActor assignment.
  // This captures candidates only. Every display read still calls resolveRule above.
  function resolveRuleForPreparation(rule){const strict=resolveRule(rule);if(strict)return strict;if(!enabled())return null;const item=rule?.item,actor=item?.actor;if(!(actor instanceof ActorClass)||item.parent!==actor||rule.parent!==item||rule.actor!==actor||!item.rules?.includes(rule)||!allowed(actor))return null;
    const marked=actor.isToken===false&&actor.parent==null&&actor.items?.get(item.id)===item?(ownMarker(item)??legacyMarker(item)):null;
    const actorId=actor.isToken===true?actor.token?.actorId:actor.id,b=marked??rows.get(`${actorId}/${item.id}`);if(!b||!sourceMatches(item,b))return null;
    if(actor.isToken===true){const token=actor.token,row=syntheticBindings.find(t=>t.tokenId===token?.id&&t.sceneId===token?.parent?.id&&t.actorId===b.actorId&&t.boundItemIds.includes(b.itemId));if(!row||actor.name!==(row.deltaSource.name??b.actorName))return null;}
    else{const a=actor._source;if(actor.parent!=null||actor.isToken!==false)return null;if(marked){if(a?._id!==actor.id||a.name!==actor.name||a.type!==actor.type)return null;}else if(a?._id!==b.actorId||actor.name!==b.actorName||a.name!==b.actorName||actor.type!==b.actorType||a.type!==b.actorType||nil(a.folder)!==b.actorFolderId||nil(a._stats?.compendiumSource)!==b.actorSourceUuid)return null;}
    const row=b.rules.find(r=>r.index===rule.sourceIndex&&r.key===rule.key);return row&&equal(item._source.system.rules[row.index],row.source)?{binding:b,rule:row}:null;
  }
  function copy(item){const b=resolveItem(item);if(!b||(!physical(b)&&b.actorId))return null;const result=item.clone({}, {keepId:true,parent:item.parent,pack:item.pack});result.updateSource({flags:{[EXTRA]:{[RULE_DISPLAY_FLAG]:{version:1,key:b.key,sourceFingerprint:b.sourceFingerprint,approvalFingerprint:b.approvalFingerprint}}}});return result;}
  // Do not snapshot a physical Item before native merchant awaits. Every native
  // getter/method observes the real document; only the newly serialized copy gains metadata.
  function copyView(item,isActive=()=>true){
    const initial=resolveItem(item);if(!initial||(!physical(initial)&&initial.actorId))return null;
    const methods=new Map;
    return new Proxy(item,{get(target,key){
      const value=Reflect.get(target,key,target);
      if(key==='constructor'||typeof value!=='function')return value;
      const cached=methods.get(key);if(cached?.native===value)return cached.bound;
      const bound=key==='toObject'?function(...args){
        const source=Reflect.apply(value,target,args),b=isActive()?resolveItem(target):null;
        if(!b||b.key!==initial.key||(!physical(b)&&b.actorId)||!source||typeof source!=='object')return source;
        return {...source,flags:{...source.flags,[EXTRA]:{...source.flags?.[EXTRA],[RULE_DISPLAY_FLAG]:{version:1,key:b.key,sourceFingerprint:b.sourceFingerprint,approvalFingerprint:b.approvalFingerprint}}}};
      }:value.bind(target);
      methods.set(key,{native:value,bound});return bound;
    }});
  }
  return {resolveItem,resolveRule,resolveRuleForPreparation,copy,copyView};
}
