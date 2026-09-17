/** PF2e 8.5.1 display projections. No RuleElement/source/slug/predicate writes. */
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function descriptor(object,key){for(let p=object;p;p=Object.getPrototypeOf(p)){const d=Object.getOwnPropertyDescriptor(p,key);if(d)return d;}return null;}
export function installBobRuleDisplayConsumers({classes,identity,isEnabled,getLocale,localize}) {
  if(!identity?.resolveRule||![isEnabled,getLocale,localize].every(f=>typeof f==='function'))throw Error('Explicit identity and gates required');
  const specs=[['FlatModifier','beforePrepareData'],['Immunity','getIWR'],['Strike','beforePrepareData'],['SpecialStatistic','afterPrepareData'],['ItemAlteration','applyAlteration'],['Weapon','toNPCAttacks'],['Item','getDescription']];
  if(classes.NPC)specs.push(['NPC','prepareDerivedData']);
  const plans=specs.map(([kind,key])=>{const proto=classes[kind]?.prototype,d=proto&&descriptor(proto,key);if(!d||typeof d.value!=='function'||Object.getOwnPropertyDescriptor(proto,key)?.configurable===false)throw Error(`Native consumer unavailable: ${kind}.${key}`);return {kind,key,proto,d,own:Object.getOwnPropertyDescriptor(proto,key)};});
  if(typeof classes.Item.prototype.getDescriptionData!=='function')throw Error('Native description data unavailable');
  let active=true;const undo=[],projected=new WeakMap,generated=new WeakMap,addenda=new WeakMap,preparingActors=new WeakSet;
  const enabled=()=>active&&isEnabled()&&['cn','zh-CN','zh-Hans'].includes(getLocale());
  function binding(rule){if(!enabled())return null;const match=(identity.resolveRuleForPreparation??identity.resolveRule)(rule);return match&&match.rule?.key===rule.key&&(!Object.hasOwn(match.rule.source,'label')||rule.label===localize(match.rule.source.label))?match:null;}
  function live(rule,origin){const current=enabled()&&identity.resolveRule(rule);return !!current&&current.binding.key===origin.binding.key&&current.rule.index===origin.rule.index&&same(current.rule.source,origin.rule.source);}
  function put(object,key,d){const own=Object.getOwnPropertyDescriptor(object,key);Object.defineProperty(object,key,d);undo.push(()=>{if(Object.getOwnPropertyDescriptor(object,key)?.value===d.value){if(own)Object.defineProperty(object,key,own);else delete object[key];}});}
  // Only an exact derived instance is projected. The setter retains native relabels/resets.
  function display(object,key,original,translated,rule,origin,extra=()=>true){
    if(!object||object[key]!==original)return false;
    let values=projected.get(object);if(!values)projected.set(object,values=new Map);if(values.has(key))return true;
    const own=Object.getOwnPropertyDescriptor(object,key);if(own&&!own.configurable)return false;
    let native=original;const state={get native(){return native},suppressed:0};values.set(key,state);
    Object.defineProperty(object,key,{configurable:true,enumerable:own?.enumerable??true,get(){return !state.suppressed&&native===original&&live(rule,origin)&&extra()?translated:native},set(value){native=value}});
    return true;
  }
  function cloneMethods(object,names,attach){for(const name of names){const native=object[name];if(typeof native!=='function'||Object.getOwnPropertyDescriptor(object,name)?.configurable===false)continue;
    Object.defineProperty(object,name,{configurable:true,writable:true,value:function(...args){const states=projected.get(this);for(const s of states?.values()??[])s.suppressed++;let value;try{value=Reflect.apply(native,this,args)}finally{for(const s of states?.values()??[])s.suppressed--;}if(value&&typeof value.then!=='function')attach(value,args);return value;}});
  }}
  function modifier(object,rule,origin){const f=origin.rule.fields[0],expected=rule.getReducedLabel();if(object?.rule!==rule||!display(object,'label',expected,f.after,rule,origin))return;
    cloneMethods(object,['clone'],copy=>modifier(copy,rule,origin));
  }
  function statistic(object,rule,origin){const f=origin.rule.fields[0],expected=localize(f.before);if(object?.data?.label!==expected||object.slug!==origin.rule.source.slug||!display(object,'label',expected,f.after,rule,origin))return;
    // Native StatisticCheck first builds its own StatisticModifier from the label.
    // Keep that constructor input native, then expose only the completed check title.
    const check=descriptor(object,'check');if(check?.get&&!Object.hasOwn(object,'check'))Object.defineProperty(object,'check',{configurable:true,get(){const state=projected.get(this)?.get('label');if(state)state.suppressed++;let result;try{result=Reflect.apply(check.get,this,[])}finally{if(state)state.suppressed--;}display(result,'label',expected,f.after,rule,origin);return result;}});
    cloneMethods(object,['clone','withRollOptions'],copy=>statistic(copy,rule,origin));
  }
  function strike(object,rule,origin){const f=origin.rule.fields[0],expected=localize(f.before);if(!object?._source||object._source.name!==expected||!object.system?.slug||object._source.system.slug!==object.system.slug)return;
    if(display(object,'name',expected,f.after,rule,origin,()=>!preparingActors.has(rule.actor)&&object._source.name===expected&&object._source.system.slug===object.system.slug)){generated.set(object,{rule,origin});}
  }
  const wrappers={
    NPC(native){return function(...args){const wasPreparing=preparingActors.has(this);preparingActors.add(this);let result;try{result=Reflect.apply(native,this,args)}finally{if(!wasPreparing)preparingActors.delete(this);}for(const action of this.system?.actions??[]){const lineage=generated.get(action.item);if(!lineage)continue;const {rule,origin}=lineage,f=origin.rule.fields[0];display(action,'label',localize(f.before),f.after,rule,origin,()=>action.item?.actor===this);}return result;};},
    FlatModifier(native){return function(...args){const origin=binding(this),before=new Set(Object.values(this.actor?.synthetics?.modifiers??{}).flat());const result=Reflect.apply(native,this,args);if(origin)for(const array of Object.values(this.actor.synthetics.modifiers))for(let i=0;i<array.length;i++){const factory=array[i];if(before.has(factory))continue;const rule=this;array[i]=function(...xs){const value=Reflect.apply(factory,this,xs);modifier(value,rule,origin);return value;};}return result;};},
    Immunity(native){return function(...args){const origin=binding(this),result=Reflect.apply(native,this,args);if(!origin)return result;const rule=this,f=origin.rule.fields[0];for(const object of result??[])for(const key of ['label','applicationLabel']){const d=descriptor(object,key);if(!d?.get||!same(object.exceptions,origin.rule.source.exceptions))continue;Object.defineProperty(object,key,{configurable:true,get(){const value=Reflect.apply(d.get,this,[]),before=localize(f.before);return live(rule,origin)&&same(this.exceptions,origin.rule.source.exceptions)&&typeof value==='string'&&before&&value.split(before).length===2?value.replace(before,f.after):value;}});}return result;};},
    SpecialStatistic(native){return function(...args){const origin=binding(this),before=new Set(this.actor?.synthetics?.statistics?.values()??[]),result=Reflect.apply(native,this,args);if(origin){const value=this.actor.synthetics.statistics.get(origin.rule.source.slug);if(value&&!before.has(value))statistic(value,this,origin);}return result;};},
    Strike(native){return function(...args){const origin=binding(this),before=new Map(Object.entries(this.actor?.synthetics?.strikes??{})),result=Reflect.apply(native,this,args);if(origin)for(const[key,factory]of Object.entries(this.actor.synthetics.strikes)){if(before.get(key)===factory)continue;const rule=this;this.actor.synthetics.strikes[key]=function(...xs){const value=Reflect.apply(factory,this,xs);if(value?.rule===rule)strike(value,rule,origin);return value;};}return result;};},
    Weapon(native){return function(...args){const lineage=generated.get(this),result=Reflect.apply(native,this,args);if(lineage)for(const value of result??[])strike(value,lineage.rule,lineage.origin);return result;};},
    ItemAlteration(native){return function(...args){const origin=binding(this);if(!origin)return Reflect.apply(native,this,args);const actor=this.actor,targets=new Set([...actor.items.values(),args[0]?.singleItem,...args[0]?.additionalItems??[]].filter(item=>item&&item.actor===actor));const before=new Set([...targets].flatMap(item=>item.system?.description?.addenda??[]));const result=Reflect.apply(native,this,args);if(live(this,origin))for(const target of targets)for(const addition of target.system?.description?.addenda??[]){if(before.has(addition))continue;if(addition.label===this.label&&addition.contents?.length===origin.rule.source.value.length&&addition.contents.every((c,i)=>c.text===origin.rule.source.value[i].text))addenda.set(addition,{rule:this,origin,target});}return result;};},
    Item(native){return function(...args){const real=this,locale=getLocale(),seen=[];
      function render(translate){
        // Separate facade target: Foundry may define non-configurable own members.
        const view=new Proxy(Object.create(Object.getPrototypeOf(real)),{get(_facade,key){if(key==='getDescriptionData')return async function(){const data=await real.getDescriptionData();return {...data,addenda:(data.addenda??[]).map(addition=>{const tracked=addenda.get(addition);if(!tracked||tracked.target!==real)return addition;
          // Native rendering mutates processed/text. Copies protect the original
          // derived addendum even during English fallback or an awaiting gate change.
          const copy={...addition,contents:addition.contents.map(content=>({...content}))};
          if(!translate||!live(tracked.rule,tracked.origin)||real.actor?.items?.get(real.id)!==real)return copy;
          seen.push(tracked);const label=tracked.origin.rule.fields.find(f=>f.path.endsWith('.label')),text=tracked.origin.rule.fields.find(f=>f.path.endsWith('.text'));
          if(addition.label!==localize(label.before)||addition.contents[0]?.text!==text.before)return copy;
          copy.label=label.after;copy.contents[0]={...copy.contents[0],text:text.after,processed:false};return copy;
        })};};const value=Reflect.get(real,key,real);return typeof value==='function'?value.bind(real):value;},has(_facade,key){return key in real;}});
        return Reflect.apply(native,view,args);
      }
      return Promise.resolve(render(enabled())).then(value=>{if(seen.length&&(!enabled()||getLocale()!==locale||seen.some(t=>!live(t.rule,t.origin))))return render(false);return value;});
    };}
  };
  try{for(const plan of plans){const value=wrappers[plan.kind](plan.d.value);put(plan.proto,plan.key,{...plan.d,value});}}catch(error){active=false;for(const restore of undo.reverse())restore();throw error;}
  return {dispose(){active=false;for(const restore of undo.reverse())restore();},get active(){return active;}};
}
