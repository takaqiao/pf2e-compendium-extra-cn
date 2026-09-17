/** Explicit candidate factory. Root owns registration and native client QA. */
import {installBobMementoDisplay} from './bob-memento-display-core.mjs';
import {MEMENTO_BINDINGS} from './bob-memento-display-bindings.mjs';
const installed=new WeakMap();
export function createBobMementoDisplay(env=globalThis){
 const {game,CONFIG}=env;
 const equipment=CONFIG?.Item?.sheetClasses?.equipment?.['pf2e.EquipmentSheetPF2e']?.cls;
 const loot=CONFIG?.Actor?.sheetClasses?.loot?.['pf2e.LootSheetPF2e']?.cls;
 const ItemClass=CONFIG?.Item?.documentClass,ActorClass=CONFIG?.Actor?.documentClass,ChatMessageClass=CONFIG?.ChatMessage?.documentClass;
 const supported=()=>game?.version==='14.368'&&game.system?.id==='pf2e'&&game.system.version==='8.5.1'
  &&game.modules?.get('pf2e-bastion-of-blasphemies')?.active===true&&game.modules.get('pf2e-bastion-of-blasphemies').version==='1.0.0'
  &&game.modules.get('pf2e-compendium-extra-cn')?.active===true
  &&game.modules.get('pf2_cn')?.active===true&&game.modules.get('pf2_cn').version==='2.5.1'
  &&game.modules.get('babele')?.active===true&&game.modules.get('babele').version==='2.9.1'
  &&CONFIG?.Item?.documentClass===ItemClass&&CONFIG?.Actor?.documentClass===ActorClass&&CONFIG?.ChatMessage?.documentClass===ChatMessageClass
  &&CONFIG?.Item?.sheetClasses?.equipment?.['pf2e.EquipmentSheetPF2e']?.cls===equipment
  &&CONFIG?.Actor?.sheetClasses?.loot?.['pf2e.LootSheetPF2e']?.cls===loot;
 if(![ItemClass,ActorClass,ChatMessageClass,equipment,loot].every(x=>typeof x==='function')||!supported())return null;
 const existing=installed.get(ActorClass);if(existing)return existing;
 const coreDispose=installBobMementoDisplay({ItemClass,ActorClass,ChatMessageClass,ItemSheetClass:equipment,ActorSheetClass:loot,bindings:MEMENTO_BINDINGS,
  getActors:()=>game.actors,getLocale:()=>game.i18n.lang,getUser:()=>game.user,isEnabled:supported});
 const dispose=()=>{coreDispose();if(installed.get(ActorClass)===dispose)installed.delete(ActorClass);};
 installed.set(ActorClass,dispose);return dispose;
}
