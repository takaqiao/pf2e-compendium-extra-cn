/** Version-scoped source selection for the system SoG bestiary only. */
export const SOG_PACK='pf2e.season-of-ghosts-bestiary';
const MODULE='pf2e-compendium-extra-cn';
const BASE=`modules/${MODULE}/compendium/${SOG_PACK}.json`;
const VARIANT=`modules/${MODULE}/compendium-851/${SOG_PACK}.json`;
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
 return packId===SOG_PACK&&useSog851(game)?'compendium-851':'compendium';
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
/** Correct only our exact SoG file, including a GM-published list from another version. */
export function selectSogTranslationFiles(files,game=globalThis.game){
 if(!supportsSogSources(game)||!Array.isArray(files))return files;
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
   try{return selectSogTranslationFiles(files);}catch(error){
    console.warn(`${MODULE} | SoG source selection failed; keeping native sources`,error);return files;
   }
  });
 }
 Object.defineProperty(translationFiles,PUBLISHED,{value:true});
 Object.defineProperty(proto,'translationFiles',{...descriptor,value:translationFiles});
 return true;
}

/** CHN 3.1.2 on-demand bypasses the native source registry; repair its one URL slot. */
export function refreshOnDemandSogSources(babele,game=globalThis.game){
 if(!supportsSogOnDemand(game)||!knownOnDemandMethod(babele))return false;
 const state=babele?.__ondemandPatch;
 if(!state)return false;
 let changed=false;
 if(Array.isArray(state.translationFilesCache)){
  const next=selectSogTranslationFiles(state.translationFilesCache,game);
  changed||=next!==state.translationFilesCache;state.translationFilesCache=next;
 }
 const previous=state.packTranslationUrls?.get?.(SOG_PACK);
 if(Array.isArray(previous)){
  const next=selectSogTranslationFiles(previous,game);
  if(next!==previous){state.packTranslationUrls.set(SOG_PACK,next);changed=true;}
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
    if(id===SOG_PACK)refreshOnDemandSogSources(babele);
   }
  }catch(error){console.warn(`${MODULE} | SoG on-demand source selection failed`,error);}
  return Reflect.apply(original,this,args);
 }
 Object.defineProperty(ensurePackTranslationsLoaded,ONDEMAND,{value:true});
 Object.defineProperty(babele,'ensurePackTranslationsLoaded',{...descriptor,value:ensurePackTranslationsLoaded});
 onDemandWrappers.set(babele,ensurePackTranslationsLoaded);
 return true;
}
