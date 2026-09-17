// Explicit factory only. Root owns hook registration and native QA integration.
import {RULE_DISPLAY_BINDINGS,RULE_DISPLAY_SYNTHETIC_BINDINGS} from './bob-rule-display-bindings.mjs';
import {prepareBobRuleDisplayIdentity} from './bob-rule-display-identity.mjs';
import {installBobRuleDisplayConsumers} from './bob-rule-display-core.mjs';
import {installBobRuleDisplayTransfers} from './bob-rule-display-transfer.mjs';
export function installBobRuleDisplayCandidate({game,CONFIG,bindings=RULE_DISPLAY_BINDINGS,syntheticBindings=RULE_DISPLAY_SYNTHETIC_BINDINGS,legacyWorldIdentities=[]}){
  const enabled=()=>game?.version==='14.368'&&game.system?.id==='pf2e'&&game.system.version==='8.5.1'
    &&['cn','zh-CN','zh-Hans'].includes(game.i18n?.lang)
    &&game.modules?.get('pf2e-compendium-extra-cn')?.active===true
    &&game.modules?.get('pf2e-bastion-of-blasphemies')?.active===true&&game.modules.get('pf2e-bastion-of-blasphemies').version==='1.0.0'
    &&game.modules?.get('babele')?.active===true&&game.modules.get('babele').version==='2.9.1'
    &&game.modules?.get('pf2_cn')?.active===true&&game.modules.get('pf2_cn').version==='2.5.1';
  if(!enabled())return {active:false,dispose(){},installActorSheets(){}};
  const rules=game.pf2e?.RuleElements?.all,classes={FlatModifier:rules?.FlatModifier,Immunity:rules?.Immunity,Strike:rules?.Strike,SpecialStatistic:rules?.SpecialStatistic,ItemAlteration:rules?.ItemAlteration,
    Item:CONFIG.Item?.documentClass,Weapon:CONFIG.PF2E?.Item?.documentClasses?.weapon,NPC:CONFIG.PF2E?.Actor?.documentClasses?.npc};
  if(!classes.NPC)throw Error('Native NPC class required');
  const ActorClass=CONFIG.Actor?.documentClass;
  const identity=prepareBobRuleDisplayIdentity({bindings,syntheticBindings,legacyWorldIdentities,ActorClass,ItemClass:classes.Item,SceneClass:CONFIG.Scene?.documentClass,TokenDocumentClass:CONFIG.Token?.documentClass,ActorDeltaClass:CONFIG.ActorDelta?.documentClass,
    getRuleClasses:()=>game.pf2e.RuleElements.builtin,getActiveRuleClasses:()=>game.pf2e.RuleElements.all,localize:key=>game.i18n.localize(key),
    getActors:()=>game.actors,getItems:()=>game.items,getScenes:()=>game.scenes,getPacks:()=>game.packs,isEnabled:enabled,getLocale:()=>game.i18n.lang});
  let consumers,transfer,drop,active=true;
  const dispose=()=>{active=false;drop?.dispose();transfer?.dispose();consumers?.dispose();};
  try{consumers=installBobRuleDisplayConsumers({classes,identity,isEnabled:enabled,getLocale:()=>game.i18n.lang,localize:(key,args)=>args?game.i18n.format(key,args):game.i18n.localize(key)});transfer=installBobRuleDisplayTransfers({ActorClass,identity});}catch(error){dispose();throw error;}
  return {get active(){return active&&enabled();},dispose,identity,
    installActorSheets(ActorSheetClasses){if(!active)throw Error('Rule display installation is inactive');if(drop)return;
      try{const owners=new Set;for(const cls of ActorSheetClasses){let owner=cls?.prototype;while(owner&&!Object.hasOwn(owner,'_handleDroppedItem'))owner=Object.getPrototypeOf(owner);if(!owner)throw Error('Native Actor drop owner unavailable');owners.add(owner);}if(!owners.size)throw Error('No native Actor sheets registered');
        drop=installBobRuleDisplayTransfers({identity,dropOwners:[...owners]});
      }catch(error){dispose();throw error;}}
  };
}
