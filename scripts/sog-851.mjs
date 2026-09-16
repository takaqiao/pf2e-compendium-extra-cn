import {PublishedTranslationSource} from '../../babele/script/translation/translation-source.js';
import {registerSog851,installPublishedSogGuard,installOnDemandSogGuard,refreshOnDemandSogSources,supportsSogSources,supportsSogOnDemand} from './sog-851-core.mjs';

/** Babele 2.9.1 registration happens synchronously before its ready-time source discovery. */
function configure(babele=globalThis.game?.babele){
 try{
  if(!supportsSogSources())return;
  installPublishedSogGuard(PublishedTranslationSource);
  registerSog851(babele);
  installOnDemandSogGuard(babele);
 }catch(error){console.warn('pf2e-compendium-extra-cn | SoG 8.5.1 source setup failed',error);}
}
Hooks.once('babele.init',configure);
// CHN may finish installing its wrapper after the first babele.init listener.
Hooks.once('setup',()=>configure());
Hooks.on('babele.dataLoaded',()=>{
 try{
  if(!supportsSogOnDemand())return;
  const babele=globalThis.game?.babele;
  installOnDemandSogGuard(babele);
  refreshOnDemandSogSources(babele);
 }catch(error){console.warn('pf2e-compendium-extra-cn | SoG source cache selection failed',error);}
});
