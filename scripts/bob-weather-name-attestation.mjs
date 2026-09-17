import {prepareNativeRuleSourceGuard} from './bob-rule-prepared-source.mjs';

// PF2e 8.5.1 ItemAlteration name handler (40700) changes the prepared name only.
// This attests that one result; it never grants source identity or registration.
// Callers must retain their own exact binding/marker, full source and document gates.
const WEATHER_ITEMS=new Set(['KAI0Cx2ys0P56hZw','4azrweHGcJ1XoBqo','9oiPR5aNEpQTzgfD','XVFJTwaE9P3H5IRk','DGrF0tPpGZcNNQUN','lff614VwbcqbXxtO']);
const NAME_KEY='BASTION.RULES.TheSkiesAbove.EffectLabel';
export function prepareWeatherNameAttestation({getRuleClasses,getActiveRuleClasses,localize}){
  const prepared=prepareNativeRuleSourceGuard({getRuleClasses,getActiveRuleClasses});
  return function attest(item,{itemId,itemName,itemType,sourceRules}){
    if(typeof localize!=='function'||!WEATHER_ITEMS.has(itemId)||itemType!=='effect'
      ||item?.type!=='effect'||item._source?.type!=='effect'||item._source.name!==itemName
      ||!Array.isArray(sourceRules)||!item.actor||item.parent!==item.actor||item.actor.items?.get(item.id)!==item)return false;
    const source=sourceRules[0];
    if(!source||Object.keys(source).sort().join(',')!=='itemId,key,mode,property,value'
      ||source.key!=='ItemAlteration'||source.mode!=='override'||source.property!=='name'
      ||source.itemId!=='{item|id}'||source.value!==NAME_KEY
      ||!prepared.matches(item,{itemId,expectedSource:{system:{rules:sourceRules}}}))return false;
    const rule=item.rules.find(r=>r.sourceIndex===0),C=getRuleClasses()?.ItemAlteration;
    if(typeof C!=='function'||getActiveRuleClasses()?.ItemAlteration!==C
      ||!rule||Object.getPrototypeOf(rule)!==C.prototype||rule.parent!==item||rule.item!==item||rule.actor!==item.actor
      ||rule.key!=='ItemAlteration'||rule.ignored!==false||rule.invalid===true
      ||rule.mode!=='override'||rule.property!=='name'||rule.itemId!=='{item|id}'||rule.value!==NAME_KEY
      ||rule.battleForm!==false||rule.fromEquipment!==false||!Array.isArray(rule.predicate)||rule.predicate.length!==0
      ||!item.actor.synthetics?.itemAlterations?.includes(rule))return false;
    try{const expected=localize(NAME_KEY);return typeof expected==='string'&&expected.length>0&&item.name===expected;}catch{return false;}
  };
}
