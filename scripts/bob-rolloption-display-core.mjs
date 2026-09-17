// Final sheet-context projection only. Neither rule preparation nor toggle writes
// are intercepted. Unsupported copies, token Actors and loot remain native.
const own = (o,k) => Object.prototype.hasOwnProperty.call(o,k);
const plain = o => o !== null && typeof o === 'object' && !Array.isArray(o);
const equal = (a,b) => {
  if (Object.is(a,b)) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a)!==Array.isArray(b)) return false;
  if (Array.isArray(a) && a.length!==b.length) return false;
  const keys=Object.keys(a);
  return keys.length===Object.keys(b).length && keys.every(k=>own(b,k)&&equal(a[k],b[k]));
};
const copy = x => x === undefined ? undefined : structuredClone(x);
const packAllowed = p => !p || typeof p === 'string' && p.startsWith('pf2e-bastion-of-blasphemies.');

export function installBobRollOptionDisplay({SheetClass,RollOptionClass,DataModelClass,ItemClass,ActorClass,
  bindings,isEnabled,getUser,getLocale,HooksApi=globalThis.Hooks}) {
  const proto=SheetClass?.prototype, descriptor=proto && Object.getOwnPropertyDescriptor(proto,'_renderInner');
  const states=SheetClass?.RENDER_STATES;
  if (!descriptor || typeof descriptor.value!=='function' || !descriptor.configurable
      || ![RollOptionClass,DataModelClass,ItemClass,ActorClass,isEnabled,getUser,getLocale,HooksApi?.on,HooksApi?.off].every(x=>typeof x==='function')
      || !states || states.RENDERING!==1 || states.RENDERED!==2)
    throw new TypeError('RollOption display requires native constructors, render states, close hooks and dynamic gates');
  const approved=copy(bindings).filter(b=>b.approved===true && b.scope==='native-root-actor-rule');
  const native=descriptor.value;
  const closeGenerations=new WeakMap(),closeHookName='close'+SheetClass.name;
  let active=true;

  function identity(doc,b,Class) {
    const s=doc?._source;
    return doc instanceof Class && s && doc.id===b.id && s._id===b.id && doc.type===b.type && s.type===b.type
      && b.names.includes(s.name) && doc.name===s.name && (s.folder??null)===(b.folder??null)
      && (s._stats?.compendiumSource??null)===(b.sourceUuid??null) && packAllowed(doc.pack);
  }
  function stateAllowed(source,selectionEnum) {
    if (!plain(source) || own(source,'value') && typeof source.value!=='boolean') return false;
    return !own(source,'selection') || selectionEnum.length>0 && selectionEnum.includes(source.selection);
  }
  function rulesMatch(item,b) {
    const rules=item._source.system?.rules;
    if (!Array.isArray(rules) || rules.length!==b.rules.length) return false;
    if (Array.from({length:rules.length},(_,i)=>i).some(i=>!own(rules,i))) return false;
    return rules.every((r,i)=>{
      if(i!==b.ruleIndex)return equal(r,b.rules[i]);
      if(!stateAllowed(r,b.selectionEnum))return false;
      const strip=v=>Object.fromEntries(Object.entries(v).filter(([k])=>k!=='value' && !(b.selectionEnum.length && k==='selection')));
      return equal(strip(r),strip(b.rules[i]));
    });
  }
  function matchingRule(actor,b) {
    if (!identity(actor,b.actor,ActorClass) || actor.parent || actor.isToken || actor.type==='loot') return null;
    const item=actor.items?.get(b.item.id), s=item?._source?.system, p=item?.system;
    if (!identity(item,b.item,ItemClass) || item.parent!==actor || item.actor!==actor
        || (s?.slug??null)!==(b.item.slug??null) || (p?.slug??null)!==(b.item.slug??null)
        || !b.item.bodies.includes(s?.description?.value) || p?.description?.value!==s.description.value
        || !b.item.gmBodies.includes(s?.description?.gm??'') || (p?.description?.gm??'')!==(s.description.gm??'')
        || !rulesMatch(item,b)) return null;
    const source=b.rules[b.ruleIndex];
    const matches=(item.rules??[]).filter(r=>r instanceof RollOptionClass && r.sourceIndex===b.ruleIndex
      && r.parent===item && r.item===item && r.actor===actor && actor.rules?.includes(r)
      && r.key==='RollOption' && !r.ignored && !r.invalid
      && r.domain===(source.domain??'all') && r.option===source.option && r.toggleable===source.toggleable
      && !!r.mergeable===!!source.mergeable && (r.placement??'actions')===(source.placement??'actions')
      && typeof r.value==='boolean'
      && (r.selection===undefined || b.selectionEnum.includes(r.selection)));
    return matches.length===1?matches[0]:null;
  }
  function realSuboption(sub,rule,b) {
    if (!(sub instanceof DataModelClass) || sub.parent!==rule || sub.rule!==rule
        || !rule.getSelfSuboptions().includes(sub)) return false;
    const source=b.rules[b.ruleIndex].suboptions;
    return Array.isArray(source) && source.filter(s=>s.value===sub.value).length===1 && sub.value===b.suboptionValue;
  }
  function permissionStamp(sheet,actor,context) {
    const user=getUser();
    return {refs:[user,actor,context.document], values:[getLocale(),user?.id,user?.role,user?.isGM,
      actor.isOwner,actor.hasPlayerOwner,actor.observer,actor.limited,sheet.isEditable,context.editable,context.owner,context.limited,
      sheet._state,closeGenerations.get(sheet)??0]};
  }
  function project(sheet,context) {
    if(!active || !isEnabled() || !plain(context) || !plain(context.toggles))return null;
    // A valid initial render is RENDERING while rendered === false. Closed,
    // closing, failed and not-yet-rendering applications keep native behavior.
    if(![states.RENDERING,states.RENDERED].includes(sheet._state))return null;
    // An external baseApplication override may truncate the native close-hook
    // chain before this common class. Without that observer, fail closed.
    if(!sheet.constructor._getInheritanceChain?.().includes(SheetClass))return null;
    const actor=sheet.actor;
    if(!(actor instanceof ActorClass) || actor!==context.document)return null;
    const collection=actor.collection;
    // No temporary-document exception: a removed Document remains reachable
    // with intact source/rules, but is no longer a registered source Actor.
    if(typeof collection?.get!=='function' || collection.get(actor.id)!==actor)return null;
    const stamp=permissionStamp(sheet,actor,context), groups={}, rules=[];
    stamp.refs.push(collection,context.toggles,actor.synthetics,actor.synthetics?.toggles,actor.items,actor.rules);
    stamp.values.push(Object.keys(context.toggles));
    let changed=false;
    for(const [placement,group] of Object.entries(context.toggles)) {
      if(!Array.isArray(group))return null;
      stamp.refs.push(group);stamp.values.push(group.length);
      groups[placement]=group.map(toggle=>{
        stamp.refs.push(toggle);
        if(!plain(toggle) || !Array.isArray(toggle.suboptions))return toggle;
        stamp.values.push(copy(Object.fromEntries(Object.entries(toggle).filter(([k])=>k!=='suboptions'))));
        stamp.refs.push(toggle.suboptions);
        for(const s of toggle.suboptions){stamp.refs.push(s,s.rule,s.parent);stamp.values.push([s.label,s.value,s.selected]);}
        if(actor.synthetics?.toggles?.[toggle.domain]?.[toggle.option]!==toggle || toggle.placement!==placement)return toggle;
        const candidates=approved.filter(b=>b.actor.id===actor.id && b.rules[b.ruleIndex].option===toggle.option
          && (b.rules[b.ruleIndex].domain??'all')===toggle.domain);
        // A source or prepared selection outside the frozen enum rejects this
        // entire approved mergeable group, even if native still exposes its option.
        if(candidates.some(b=>b.rules[b.ruleIndex].mergeable && (()=>{
          const item=actor.items.get(b.item.id),source=item?._source?.system?.rules?.[b.ruleIndex];
          const r=item?.rules?.find(r=>r.sourceIndex===b.ruleIndex);
          return source && (!stateAllowed(source,b.selectionEnum) || r?.selection!==undefined && !b.selectionEnum.includes(r.selection));
        })()))return toggle;
        let label=toggle.label;
        const matched=candidates.map(b=>({b,r:matchingRule(actor,b)})).filter(x=>x.r);
        const root=matched.filter(({b,r})=>b.kind==='label' && !r.mergeable && toggle.itemId===r.item.id && toggle.label===r.getReducedLabel());
        if(root.length===1){label=root[0].b.display;rules.push(root[0]);}
        const suboptions=toggle.suboptions.map(sub=>{
          const hits=matched.filter(({b,r})=>b.kind==='suboption' && realSuboption(sub,r,b));
          if(hits.length!==1)return sub;
          const {b,r}=hits[0];rules.push({b,r});
          // Do not spread a DataModel: selected lives on its prototype and needs
          // the genuine native rule. No rule/item reference is fabricated here.
          return {label:b.display,value:sub.value,get selected(){return sub.selected;}};
        });
        if(label===toggle.label && suboptions.every((s,i)=>s===toggle.suboptions[i]))return toggle;
        changed=true;return {...toggle,label,suboptions};
      });
    }
    if(!changed)return null;
    for(const {b,r} of rules) {
      stamp.refs.push(r,r.item,r.item._source,r.item.system,r.item.rules,r.actor);
      stamp.values.push([b.path,r.value,r.selection,r.ignored,r.label,copy(r.item._source),
        r.item.system.slug,r.item.system.description.value,r.item.system.description.gm,
        copy(r.actor._source),r.actor.name,r.item.name]);
    }
    return {context:{...context,toggles:groups},stamp};
  }
  const safelyProject=(sheet,context)=>{try{return project(sheet,context);}catch{return null;}};
  async function wrapped(context,...args) {
    const projected=safelyProject(this,context);
    if(!projected)return native.call(this,context,...args);
    const result=await native.call(this,projected.context,...args);
    const current=safelyProject(this,context);
    const a=projected.stamp,b=current?.stamp;
    if(!b || a.refs.length!==b.refs.length || a.refs.some((v,i)=>v!==b.refs[i]) || !equal(a.values,b.values))
      return native.call(this,context,...args);
    return result;
  }
  // Native ApplicationV1.close dispatches the inheritance-chain close hook.
  // Observe only: do not wrap/alter close. The WeakMap epoch catches close then
  // reopen to the same _state while an older render is still awaiting a result.
  const closeHookId=HooksApi.on(closeHookName,sheet=>{
    if(active && sheet instanceof SheetClass)closeGenerations.set(sheet,(closeGenerations.get(sheet)??0)+1);
  });
  try{Object.defineProperty(proto,'_renderInner',{...descriptor,value:wrapped});}
  catch(error){active=false;HooksApi.off(closeHookName,closeHookId);throw error;}
  const dispose=()=>{
    if(!active)return;
    active=false;
    HooksApi.off(closeHookName,closeHookId);
    if(proto._renderInner===wrapped)Object.defineProperty(proto,'_renderInner',descriptor);
  };
  dispose.isActive=()=>active && proto._renderInner===wrapped;
  return dispose;
}
