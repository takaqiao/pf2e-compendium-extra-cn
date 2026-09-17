import {BOB_APPROVED_ROLLOPTION_DISPLAYS} from './bob-approved-rolloption-display-bindings.mjs';
import {BOB_CHINESE_LANGS,isBobActive} from './bob-i18n-core.mjs';
import {installBobRollOptionDisplay} from './bob-rolloption-display-core.mjs';

let installation=null;
const supported=()=>isBobActive(game) && game.version==='14.368' && game.system.version==='8.5.1'
  && BOB_CHINESE_LANGS.includes(game.i18n.lang)
  && game.modules.get('pf2e-bastion-of-blasphemies')?.version==='1.0.0'
  && game.modules.get('babele')?.active===true && game.modules.get('babele')?.version==='2.9.1'
  && game.modules.get('pf2_cn')?.active===true && game.modules.get('pf2_cn')?.version==='2.5.1';

export const isBobRollOptionDisplayReady=()=>installation?.isActive()===true && supported();
export function disposeBobRollOptionDisplay(){installation?.();installation=null;}

// Find the one native common owner; never wrap individual subclasses or invent
// a consumer for loot or external SheetV2 templates. Registration is root-owned.
export function findBobRollOptionSheetClass(registry) {
  const candidates=new Set();
  for(const entries of Object.values(registry??{}))for(const entry of Object.values(entries??{})) {
    for(let p=entry?.cls?.prototype;p;p=Object.getPrototypeOf(p)) {
      if(p.constructor?.name==='ActorSheetPF2e' && Object.hasOwn(p,'_renderInner'))candidates.add(p.constructor);
    }
  }
  return candidates.size===1?[...candidates][0]:null;
}

Hooks.once('ready',()=>{
  if(!supported() || installation)return;
  const SheetClass=findBobRollOptionSheetClass(CONFIG.Actor.sheetClasses);
  const RollOptionClass=game.pf2e?.RuleElements?.builtin?.RollOption,DataModelClass=foundry.abstract?.DataModel;
  if(![SheetClass,RollOptionClass,DataModelClass,CONFIG.Item.documentClass,CONFIG.Actor.documentClass].every(c=>typeof c==='function'))return;
  installation=installBobRollOptionDisplay({SheetClass,RollOptionClass,
    DataModelClass,ItemClass:CONFIG.Item.documentClass,ActorClass:CONFIG.Actor.documentClass,
    bindings:BOB_APPROVED_ROLLOPTION_DISPLAYS,isEnabled:supported,getUser:()=>game.user,getLocale:()=>game.i18n.lang});
});
