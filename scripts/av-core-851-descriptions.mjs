import {AV_CORE_851_DESCRIPTIONS} from './av-core-851-description-data.mjs';

const SOURCE_FRAMES=new WeakMap();
const SOURCE_GUARD=Symbol.for('pf2e-compendium-extra-cn.avCore851SourceGuard.v1');

function supportsCurrentRuntime(g=globalThis.game){
  return g?.release?.generation===14&&g.system?.id==='pf2e'&&g.system.version==='8.5.1'&&g.i18n?.lang==='cn'
    &&g.modules?.get('pf2e-compendium-extra-cn')?.active===true
    &&g.modules?.get('babele')?.active===true&&g.modules.get('babele').version==='2.9.1'
    &&g.modules?.get('pf2e_compendium_chn')?.active===true&&g.modules.get('pf2e_compendium_chn').version==='3.1.2';
}

function uniqueItem(items,id){
  if(!Array.isArray(items))return null;
  const matches=items.filter(item=>item?._id===id);
  return matches.length===1?matches[0]:null;
}

function matchesSourceIdentity(metadata,source,field){
  return metadata?.id===field.packId&&metadata.type===field.documentType
    &&source?._id===field.documentId&&source.type===field.documentSourceType;
}

function sourceLeaf(source,field){
  const item=field.itemId?uniqueItem(source?.items,field.itemId):source;
  return item&&(!field.itemId||item.type===field.itemSourceType)?item:null;
}

/** Retain this call's EN evidence before core CN's NPC converter mutates source.items. */
export function installAvCore851DescriptionSourceGuard(MappedCompendium){
  const original=MappedCompendium.prototype.translate;
  if(original[SOURCE_GUARD])return false;
  function translate(...args){
    const [data]=args;
    if(!data||typeof data!=='object')return Reflect.apply(original,this,args);
    const frames=SOURCE_FRAMES.get(data);
    const eligible=supportsCurrentRuntime()&&AV_CORE_851_DESCRIPTIONS.some(field=>
      matchesSourceIdentity(this?.metadata,data,field)&&sourceLeaf(data,field)?.system?.description?.value===field.english);
    let source=null;
    if(eligible){try{source=structuredClone(data);}catch{/* No snapshot means no repair. */}}
    const stack=frames??[];
    // Every object call owns a frame: later mutations cannot manufacture entry-time EN evidence.
    stack.push({pack:this,source});
    SOURCE_FRAMES.set(data,stack);
    try{return Reflect.apply(original,this,args);}
    finally{stack.pop();if(!stack.length)SOURCE_FRAMES.delete(data);}
  }
  Object.defineProperty(translate,SOURCE_GUARD,{value:true});
  MappedCompendium.prototype.translate=translate;
  return true;
}

/** Only the translated description changes; upstream source mutations and metadata are not rewritten. */
export function applyAvCore851Descriptions(context){
  if(!supportsCurrentRuntime()||!context?.source||!context.translated)return 0;
  const currentSource=context.source,metadata=context.metadata;
  const frame=SOURCE_FRAMES.get(currentSource)?.at(-1);
  const source=frame?(frame.pack===context.pack?frame.source:null):currentSource;
  if(!source)return 0;
  let corrected=null,count=0;
  for(const field of AV_CORE_851_DESCRIPTIONS){
    if(!matchesSourceIdentity(metadata,source,field)||!matchesSourceIdentity(metadata,currentSource,field))continue;
    // Mapping payloads may omit identity fields, but explicit conflicting values are never ours to repair.
    if(context.translated._id!==undefined&&context.translated._id!==field.documentId
      ||context.translated.type!==undefined&&context.translated.type!==field.documentSourceType)continue;
    const sourceItem=sourceLeaf(source,field),currentItem=sourceLeaf(currentSource,field);
    const translatedItem=field.itemId?uniqueItem(context.translated.items,field.itemId):context.translated;
    if(!sourceItem||!currentItem||!translatedItem
      ||field.itemId&&translatedItem.type!==undefined&&translatedItem.type!==field.itemSourceType)continue;
    if(sourceItem.system?.description?.value!==field.english
      ||![field.english,field.previousTranslation].includes(currentItem.system?.description?.value)
      ||translatedItem.system?.description?.value!==field.previousTranslation)continue;
    corrected??=structuredClone(context.translated);
    const target=field.itemId?uniqueItem(corrected.items,field.itemId):corrected;
    target.system.description.value=field.translation;
    count++;
  }
  if(corrected)context.translated=corrected;
  return count;
}

Hooks.on('babele.translateDocumentData',applyAvCore851Descriptions);
