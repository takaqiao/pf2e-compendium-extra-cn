/** Version-scoped source selection for the system SoG and BoB bestiaries. */
export const SOG_PACK='pf2e.season-of-ghosts-bestiary';
export const BOB_PACK='pf2e.bastion-of-blasphemies-bestiary';
const VERSIONED_PACKS=[SOG_PACK,BOB_PACK];
const MODULE='pf2e-compendium-extra-cn';
const registered=new WeakMap();
const onDemandWrappers=new WeakMap();
const PUBLISHED=Symbol.for(`${MODULE}.sog851.published.v1`);
const ONDEMAND=Symbol.for(`${MODULE}.sog851.ondemand.v1`);
// Exact Function.prototype.toString baselines from the tested, unmodified modules.
// Do not normalize whitespace or accept a foreign wrapper with the same signature.
const PUBLISHED_SOURCE='async translationFiles() {\n        return this.#buildFiles("translation", this._translationFiles());\n    }';
const ONDEMAND_SOURCE='async (collection) => ensurePackTranslationsLoaded(babele, state, collection)';

function language(game){return game?.settings?.get?.('core','language')??game?.i18n?.lang;}
export function supportsSogSources(game=globalThis.game){
 return game?.system?.id==='pf2e'&&['8.5.0','8.5.1'].includes(game.system.version)
  &&game.modules?.get(MODULE)?.active===true&&game.modules.get('babele')?.active===true
  &&game.modules.get('babele').version==='2.9.1'&&/^(?:cn|zh(?:[-_]|$))/i.test(language(game)??'');
}
export function supportsSogOnDemand(game=globalThis.game){
 return supportsSogSources(game)&&game.modules.get('pf2e_compendium_chn')?.active===true
  &&game.modules.get('pf2e_compendium_chn').version==='3.1.2'
  &&game.settings.get('babele','loadingMode')==='ondemand';
}
function knownOnDemandMethod(babele){
 const method=babele&&Object.getOwnPropertyDescriptor(babele,'ensurePackTranslationsLoaded')?.value;
 return typeof method==='function'&&(onDemandWrappers.get(babele)===method
  ||Function.prototype.toString.call(method)===ONDEMAND_SOURCE);
}
export function useSog851(game=globalThis.game){
 return supportsSogSources(game)&&game.system.version==='8.5.1';
}
export function sogTranslationDirectory(packId,game=globalThis.game){
 return VERSIONED_PACKS.includes(packId)&&useSog851(game)?'compendium-851':'compendium';
}
export function registerSog851(babele,game=globalThis.game){
 if(!useSog851(game)||typeof babele?.register!=='function')return false;
 const lang=language(game);
 if(registered.get(babele)===lang)return false;
 // Native Babele combines same-module/same-language dirs in insertion order.
 // Include base explicitly so an earlier callback cannot accidentally omit it.
 babele.register({module:MODULE,lang,dirs:['compendium','compendium-851']});
 registered.set(babele,lang);
 return true;
}

const fileOf=row=>typeof row==='string'?row:row?.file;
const canonical=file=>typeof file==='string'?file.replace(/^\//,''):file;
function withFile(template,file){
 if(typeof template==='string')return file;
 return {...template,file,directory:file.slice(0,file.lastIndexOf('/'))};
}
/** Correct only our exact versioned files, including a GM-published list from another version. */
export function selectSogTranslationFiles(files,game=globalThis.game){
 if(!supportsSogSources(game)||!Array.isArray(files))return files;
 return VERSIONED_PACKS.reduce((selected,packId)=>selectPackTranslationFiles(selected,game,packId),files);
}
function selectPackTranslationFiles(files,game,packId){
 const BASE=`modules/${MODULE}/compendium/${packId}.json`;
 const VARIANT=`modules/${MODULE}/compendium-851/${packId}.json`;
 const base=files.find(row=>canonical(fileOf(row))===BASE);
 const variant=files.find(row=>canonical(fileOf(row))===VARIANT);
 if(!base&&!variant)return files;
 const selected=useSog851(game);
 if(selected){
  // Never move a published entry past user or other-module sources.
  if(base&&variant)return files;
  const out=[...files];
  if(base){
   const lastBase=files.findLastIndex(row=>canonical(fileOf(row))===BASE);
   out.splice(lastBase+1,0,withFile(base,VARIANT));
  }else{
   out.splice(files.indexOf(variant),0,withFile(variant,BASE));
  }
  return out;
 }
 const out=[];
 let restored=false;
 for(const row of files){
  if(canonical(fileOf(row))!==VARIANT){out.push(row);continue;}
  if(!base&&!restored){out.push(withFile(row,BASE));restored=true;}
 }
 return out.length===files.length&&out.every((row,i)=>row===files[i])?files:out;
}

/** Native full-mode players read PublishedTranslationSource, not registered directories. */
export function installPublishedSogGuard(PublishedTranslationSource){
 if(!supportsSogSources())return false;
 const proto=PublishedTranslationSource?.prototype;
 const descriptor=proto&&Object.getOwnPropertyDescriptor(proto,'translationFiles');
 const original=descriptor?.value;
 if(typeof original!=='function'||original[PUBLISHED]||descriptor.writable!==true
  ||Function.prototype.toString.call(original)!==PUBLISHED_SOURCE)return false;
 function translationFiles(...args){
  const result=Reflect.apply(original,this,args);
  try{if(!supportsSogSources())return result;}catch(error){
   console.warn(`${MODULE} | SoG source scope check failed; keeping native sources`,error);return result;
  }
  return result.then(files=>{
   try{return orderSogTranslationFiles(selectSogTranslationFiles(files),globalThis.game?.babele,globalThis.game,{published:true});}catch(error){
    console.warn(`${MODULE} | SoG source selection failed; keeping native sources`,error);return files;
   }
  });
 }
 Object.defineProperty(translationFiles,PUBLISHED,{value:true});
 Object.defineProperty(proto,'translationFiles',{...descriptor,value:translationFiles});
 return true;
}

/** CHN 3.1.2 on-demand bypasses the native source registry; repair the known pack URL slots. */
export function refreshOnDemandSogSources(babele,game=globalThis.game){
 if(!supportsSogOnDemand(game)||!knownOnDemandMethod(babele))return false;
 const state=babele?.__ondemandPatch;
 if(!state)return false;
 let changed=false;
 if(Array.isArray(state.translationFilesCache)){
  const next=orderSogTranslationFiles(selectSogTranslationFiles(state.translationFilesCache,game),babele,game);
  changed||=next!==state.translationFilesCache;state.translationFilesCache=next;
 }
 for(const packId of VERSIONED_PACKS){
  const previous=state.packTranslationUrls?.get?.(packId);
  if(Array.isArray(previous)){
   const next=orderSogTranslationFiles(selectSogTranslationFiles(previous,game),babele,game);
   if(next!==previous){state.packTranslationUrls.set(packId,next);changed=true;}
  }
 }
 return changed;
}
export function installOnDemandSogGuard(babele){
 if(!supportsSogOnDemand()||!babele?.__ondemandPatch)return false;
 const descriptor=Object.getOwnPropertyDescriptor(babele,'ensurePackTranslationsLoaded');
 const original=descriptor?.value;
 if(typeof original!=='function'||original[ONDEMAND]||descriptor.writable!==true
  ||Function.prototype.toString.call(original)!==ONDEMAND_SOURCE)return false;
 function ensurePackTranslationsLoaded(...args){
  try{
   if(supportsSogOnDemand()){
    const pack=args[0];const id=typeof pack==='string'?pack:pack?.collection??pack?.metadata?.id;
    if(VERSIONED_PACKS.includes(id))refreshOnDemandSogSources(babele);
   }
  }catch(error){console.warn(`${MODULE} | SoG on-demand source selection failed`,error);}
  return Reflect.apply(original,this,args);
 }
 Object.defineProperty(ensurePackTranslationsLoaded,ONDEMAND,{value:true});
 Object.defineProperty(babele,'ensurePackTranslationsLoaded',{...descriptor,value:ensurePackTranslationsLoaded});
 onDemandWrappers.set(babele,ensurePackTranslationsLoaded);
 return true;
}

const PRIORITY_SOURCE="sourcePriority() {\n        return this.#engine.sourcePriority();\n    }";
/** Babele 2.9.1 orderedSourcesFor policy: unranked first, stable within a source. */
function orderKnownSources(order,sources){
 const ranks=new Map(order.map((source,index)=>[source,index]));
 return sources.map((source,index)=>({source,index})).sort((left,right)=>{
  const a=ranks.has(left.source.source),b=ranks.has(right.source.source);
  if(!a&&!b)return left.index-right.index;
  if(a!==b)return a?1:-1;
  return ranks.get(left.source.source)-ranks.get(right.source.source);
 }).map(entry=>entry.source);
}

/** Apply configured order only to proven sources in this pack's known cache paths. */
export function orderSogTranslationFiles(files,babele,game=globalThis.game,{published=false}={}){
 return VERSIONED_PACKS.reduce((ordered,packId)=>orderPackTranslationFiles(ordered,babele,game,published,packId),files);
}
function orderPackTranslationFiles(files,babele,game,published,packId){
 try{
 if(!supportsSogSources(game)||!Array.isArray(files))return files;
 if(published){
  if(game.user?.isGM!==false||game.settings.get('babele','loadingMode')!=='full'
   ||game.modules.get('pf2e_compendium_chn')?.active!==true
   ||game.modules.get('pf2e_compendium_chn').version!=='3.1.2')return files;
 }else if(!useSog851(game)||!supportsSogOnDemand(game)||!knownOnDemandMethod(babele))return files;
 const priority=babele?.sourcePriority;
 if(typeof priority!=='function'||Function.prototype.toString.call(priority)!==PRIORITY_SOURCE)return files;
 const config=Reflect.apply(priority,babele,[]);
 const order=config?.collections?.[packId]??config?.global;
 if(!Array.isArray(order)||!order.length)return files;
 const lang=language(game),indices=[],sources=[];
 const configured=game.settings.get('babele','directory')?.trim?.();
 const BASE=`modules/${MODULE}/compendium/${packId}.json`;
 const VARIANT=`modules/${MODULE}/compendium-851/${packId}.json`;
 const chn=`modules/pf2e_compendium_chn/compendium/${packId}.json`;
 for(let index=0;index<files.length;index++){
  const file=canonical(fileOf(files[index]));
  const basename=typeof file==='string'?file.slice(file.lastIndexOf('/')+1):'';
  if(!basename.startsWith(`${packId}.`)||!basename.endsWith('.json'))continue;
  let source;
  if(file===BASE||file===VARIANT)source=`module:${MODULE}:${lang}`;
  else if(file===chn)source=`module:pf2e_compendium_chn:${lang}`;
  else if(configured&&file===`${configured}/${lang}/${packId}.json`&&order.includes('directory'))source='directory';
  else return files; // Unknown or unranked custom source: retain its existing precedence.
  indices.push(index);sources.push({source,row:files[index]});
 }
 if(sources.length<2)return files;
 const ordered=orderKnownSources(order,sources);
 if(ordered.every((row,index)=>row===sources[index]))return files;
 const result=[...files];indices.forEach((index,i)=>{result[index]=ordered[i].row;});return result;
 }catch(error){
  console.warn(`${MODULE} | SoG source priority unavailable; keeping version-selected sources`,error);
  return files;
 }
}
