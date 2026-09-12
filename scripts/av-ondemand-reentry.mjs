/** Babele 2.9.1 + core CN 3.1.2 double-wrap compatibility for the eight AV packs. */
const TARGETS=new Set([
 'pf2e-abomination-vaults.av','pf2e.abomination-vaults-bestiary',
 'abomination-vaults-addons.abomination-vaults-addons-scenes','abomination-vaults-addons.abomination-vaults-addons',
 'abomination-vaults-expanded.abomination-vaults-expanded','tianzes-gauntlight-extras.tianzes-gauntlight-extras',
 'tianzes-otari-extras.tianzes-otari-extras','tianzes-otari-extras.tianzes-otari-shops'
]);
const MARK=Symbol.for('pf2e-compendium-extra-cn.avOnDemandReentry.v1');
function isCompletedNativeTranslation(pack,data,translationsOnly){
 if(translationsOnly||!TARGETS.has(pack?.metadata?.id))return false;
 const g=globalThis.game;
 if(g?.version!=='14.367'||g.system?.id!=='pf2e'||g.system?.version!=='8.5.0'||g.i18n?.lang!=='cn')return false;
 if(g.modules?.get('babele')?.version!=='2.9.1'||g.modules?.get('pf2e_compendium_chn')?.version!=='3.1.2')return false;
 if(g.settings.get('babele','loadingMode')!=='ondemand')return false;
 const f=data?.flags?.babele;
 if(!f||f.translated!==true||f.hasTranslation!==true||typeof f.originalName!=='string'||!f.originalName)return false;
 if(!f.originalPayload||Array.isArray(f.originalPayload)||f.originalPayload.name!==f.originalName)return false;
 const keys=Object.keys(f).sort().join(',');
 return keys==='hasTranslation,originalName,originalPayload,translated'
  ||(keys==='hasTranslation,lang,originalName,originalPayload,translated'&&f.lang==='cn');
}
export function installAvOnDemandReentryGuard(MappedCompendium){
 const original=MappedCompendium.prototype.translate;
 if(original[MARK])return false;
 function translate(...args){
  const [data,translationsOnly]=args;
  // Foundry reconstruction removes top-level `translated`, but retains this
  // complete native flag. The core wrapper must not overwrite its EN payload.
  if(isCompletedNativeTranslation(this,data,translationsOnly))return data;
  return Reflect.apply(original,this,args);
 }
 Object.defineProperty(translate,MARK,{value:true});
 MappedCompendium.prototype.translate=translate;
 return true;
}
