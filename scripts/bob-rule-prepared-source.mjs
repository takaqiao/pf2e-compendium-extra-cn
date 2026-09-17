// Display identity only. These functions never prepare rules or mutate a Document.
const canonical=v=>JSON.stringify(v,(_k,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.keys(x).sort().filter(k=>x[k]!==undefined).map(k=>[k,x[k]])):x);
const finite=value=>typeof value==='number'?Number.isFinite(value):value&&typeof value==='object'?Object.values(value).every(finite):true;
const equal=(a,b)=>finite(a)&&finite(b)&&canonical(a)===canonical(b);
const CHARG_ACTOR='aEuFu2OCViPxG08f',CHARG_ITEM='xD3VAfvamgQTMsIJ';

export function approvedRuleState(item,binding){
  const source=item?._source?.system?.rules,expected=binding?.expectedSource?.system?.rules;
  if(!Array.isArray(source)||!Array.isArray(expected))return null;
  if(equal(source,expected))return source;
  // Native RollOption.toggle persists exactly this boolean (PF2e 44487–98).
  // This is one approved original document state, not a generic rule exception.
  if(binding.actorId!==CHARG_ACTOR||binding.itemId!==CHARG_ITEM||item.actor?.id!==CHARG_ACTOR||item.id!==CHARG_ITEM)return null;
  const first=expected[0],actual=source[0];
  if(first?.key!=='RollOption'||first.option!=='chargs-final-gift'||first.toggleable!==true||first.value!==false||typeof actual?.value!=='boolean')return null;
  const allowed=structuredClone(expected);allowed[0].value=actual.value;
  return equal(source,allowed)?source:null;
}

export function prepareNativeRuleSourceGuard({getRuleClasses,getActiveRuleClasses}){
  if(typeof getRuleClasses!=='function'||typeof getActiveRuleClasses!=='function')throw Error('Native builtin/active Rule class providers required');
  function matches(item,binding){
    const source=approvedRuleState(item,binding),prepared=item.system?.rules,instances=item.rules??[];
    if(!source||!Array.isArray(prepared)||prepared.length!==source.length||!Array.isArray(instances))return false;
    // World/loot items legitimately have no Rule instances. Only the complete
    // unprepared source shape is accepted in this state.
    if(instances.length===0)return equal(prepared,source);
    if(instances.length!==source.length)return false;
    try{
      const builtin=getRuleClasses(),active=getActiveRuleClasses(),seen=new Set;
      for(let index=0;index<source.length;index++){
        const raw=source[index],C=builtin?.[raw.key],rule=instances.find(r=>r.sourceIndex===index);
        if(typeof C!=='function'||active?.[raw.key]!==C||typeof C.cleanData!=='function'||typeof C.shimData!=='function'
          ||!rule||rule.invalid===true||seen.has(rule)||Object.getPrototypeOf(rule)!==C.prototype||rule.parent!==item||rule.item!==item
          ||rule.actor!==item.actor||rule.key!==raw.key||!C.validActorTypes?.includes(item.actor?.type))return false;
        seen.add(rule);
        // Current approved AdjustModifier sources never use suppress. Do not
        // silently invent handling for its pre-super source rewrite.
        if(raw.key==='AdjustModifier'&&raw.suppress)return false;
        const copy=structuredClone(raw);
        // PF2e AdjustStrike constructor copies input and fixes priority to 110.
        if(raw.key==='AdjustStrike')copy.priority=110;
        const cleaned=C.shimData(C.cleanData(copy,{prune:true,migrate:true,model:true,sanitize:false,copy:false,partial:false},{source:copy}));
        if(!equal(rule._source,cleaned))return false;
        if(raw.key==='AdjustStrike'){
          if(rule._source===prepared[index]||!equal(prepared[index],raw))return false;
        }else if(rule._source!==prepared[index]||!equal(prepared[index],cleaned))return false;
      }
      return true;
    }catch{return false;}
  }
  return {matches};
}
