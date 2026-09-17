/** Preserve native ownership, remote GM request, random IDs and stacking policy. */
export function installBobRuleDisplayTransfers({ActorClass,identity,dropOwners=[]}){
  if(typeof identity?.copyView!=='function')throw Error('Exact live copy identity required');
  function find(proto,key){for(let p=proto;p;p=Object.getPrototypeOf(p))if(Object.hasOwn(p,key))return {owner:p,descriptor:Object.getOwnPropertyDescriptor(p,key)};return null;}
  const transfer=ActorClass?find(ActorClass.prototype,'transferItemToActor'):null;
  if(ActorClass&&(!transfer||typeof transfer.descriptor.value!=='function'||!transfer.descriptor.configurable))throw Error('Native transfer consumer unavailable');
  const plans=[...transfer?[{...transfer,key:'transferItemToActor',kind:'transfer'}]:[],...new Set(dropOwners)].map(p=>p.kind?p:{...find(p,'_handleDroppedItem'),key:'_handleDroppedItem',kind:'drop'});
  if(!plans.length)throw Error('At least one native acquisition consumer required');
  for(const p of plans)if(!p.owner||typeof p.descriptor.value!=='function'||!p.descriptor.configurable)throw Error('Native drop consumer unavailable');
  let active=true;const undo=[];
  try{for(const p of plans){const native=p.descriptor.value;const wrapped=p.kind==='transfer'?function(target,item,...args){const view=active&&item?.actor===this?identity.copyView(item,()=>active):null;return Reflect.apply(native,this,[target,view??item,...args]);}:function(event,item,...args){return Reflect.apply(native,this,[event,active?identity.copyView(item,()=>active)??item:item,...args]);};Object.defineProperty(p.owner,p.key,{...p.descriptor,value:wrapped});undo.push(()=>{if(Object.getOwnPropertyDescriptor(p.owner,p.key)?.value===wrapped)Object.defineProperty(p.owner,p.key,p.descriptor);});}}catch(error){active=false;for(const f of undo.reverse())f();throw error;}
  return {dispose(){active=false;for(const f of undo.reverse())f();}};
}
