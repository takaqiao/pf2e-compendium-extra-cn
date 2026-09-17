/** Exact returned mementos. Persistent NEW-copy provenance only; native names/slugs/HP/rules stay native. */
const EXTRA='pf2e-compendium-extra-cn',FLAG='bobMementoDisplay',CN=new Set(['cn','zh-CN','zh-Hans']);
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k),nil=v=>v??null;
const equal=(a,b)=>{if(Object.is(a,b))return true;if(!a||!b||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)!==Array.isArray(b))return false;const ak=Object.keys(a).sort(),bk=Object.keys(b).sort();return ak.length===bk.length&&ak.every((k,i)=>k===bk[i]&&equal(a[k],b[k]));};
const elements=root=>[root,...Array.from(root.children??[]).flatMap(elements)];
const owner=(p,k)=>{while(p&&!own(p,k))p=Object.getPrototypeOf(p);return p;};
function shape(source){
 const s=structuredClone(source);delete s._id;delete s.sort;
 // Native creation assigns creator ACLs. Permissions are checked on live Documents.
 delete s.ownership;
 s._stats={compendiumSource:nil(s._stats?.compendiumSource),duplicateSource:nil(s._stats?.duplicateSource)};
 if(s.flags?.[EXTRA]){delete s.flags[EXTRA][FLAG];if(!Object.keys(s.flags[EXTRA]).length)delete s.flags[EXTRA];}
 delete s.system.equipped;delete s.system.containerId;s.system.quantity=1;
 return s;
}
export function installBobMementoDisplay({ItemClass,ActorClass,ItemSheetClass,ActorSheetClass,ChatMessageClass,bindings,getActors,getUser,getLocale,isEnabled}){
 if(![ItemClass,ActorClass,ItemSheetClass,ActorSheetClass,ChatMessageClass,getActors,getUser,getLocale,isEnabled].every(f=>typeof f==='function')||bindings?.rows?.length!==7)throw TypeError('Exact native memento dependencies required');
 const consumers=[[ActorClass,'transferItemToActor'],[ItemSheetClass,'_renderInner'],[ItemSheetClass,'_getSubmitData'],[ItemSheetClass,'_updateObject'],[ItemSheetClass,'close'],[ActorSheetClass,'_renderInner'],[ActorSheetClass,'close'],[ChatMessageClass,'renderHTML']];
 if(owner(ActorSheetClass.prototype,'_handleDroppedItem'))consumers.push([ActorSheetClass,'_handleDroppedItem']);
 for(const [Ctor,key]of consumers){const p=owner(Ctor.prototype,key),d=p&&Object.getOwnPropertyDescriptor(p,key),ownD=Object.getOwnPropertyDescriptor(Ctor.prototype,key);if(typeof d?.value!=='function'||d?.configurable===false||ownD?.configurable===false||!ownD&&!Object.isExtensible(Ctor.prototype))throw TypeError('Unavailable native consumer '+key);}
 const titleP=owner(ItemSheetClass.prototype,'title'),titleDescriptor=titleP&&Object.getOwnPropertyDescriptor(titleP,'title'),titleOwn=Object.getOwnPropertyDescriptor(ItemSheetClass.prototype,'title');if(typeof titleDescriptor?.get!=='function'||titleDescriptor.configurable===false||titleOwn?.configurable===false||!titleOwn&&!Object.isExtensible(ItemSheetClass.prototype))throw TypeError('Native Item sheet title getter required');
 const rows=structuredClone(bindings.rows),f=structuredClone(bindings.fountain),byKey=new Map(),restores=[],ownedInputs=new Set(),generations=new WeakMap();let active=true;
 for(const r of rows){if(!r.actorId||!r.itemId||!r.approvedName.endsWith(' '+r.originalName)||r.displayName!==`已毁的${r.chineseName} Destroyed ${r.originalName}`||!['sourceFingerprint','approvalFingerprint'].every(k=>/^[a-f0-9]{64}$/.test(r.marker[k])))throw TypeError('Invalid exact name/marker binding');r.forms=[shape(r.rawItem),shape(r.approvedItem)];byKey.set(r.actorId+'/'+r.itemId,r);}
 const enabled=()=>active&&isEnabled();
 const chinese=()=>enabled()&&CN.has(getLocale());
 function actorValid(a){return a instanceof ActorClass&&a.isToken===false&&a.parent==null&&!a.pack&&a.collection===getActors()&&getActors()?.get(a.id)===a&&a._source?._id===a.id;}
 function fountainValid(a){const s=a?._source,r=f.rawActor;return actorValid(a)&&a.id===r._id&&a.type===r.type&&s.type===r.type&&[r.name,f.nameRecord.after].includes(a.name)&&s.name===a.name&&nil(s.folder)===nil(r.folder)&&s.img===r.img&&nil(s._stats?.compendiumSource)===nil(r._stats.compendiumSource)&&equal(s.flags,r.flags);}
 function itemValid(item){const a=item?.actor??item?.parent;return item instanceof ItemClass&&actorValid(a)&&item.parent===a&&a.items?.get(item.id)===item&&item.collection===a.items&&!item.pack&&item.type==='equipment'&&item._source?._id===item.id&&item._source.type===item.type&&item.name===item._source.name&&item.isIdentified===true;}
 function matches(item,r,allowDestroyed){
  const s=item._source,destroyed=s.name==='Destroyed '+r.originalName||s.name==='Destroyed '+r.approvedName;
  if(destroyed&&!allowDestroyed||!destroyed&&![r.originalName,r.approvedName].includes(s.name)||(!Number.isInteger(s.system?.quantity)||s.system.quantity<1)
      ||s.system.slug!==r.nativeExplicitSlug||item.slug!==r.nativeExplicitSlug||!equal(item.system.rules,s.system.rules)||item.system.description.value!==s.system.description.value)return false;
  if(s.system.containerId!=null&&typeof s.system.containerId!=='string')return false;
  const equip=s.system.equipped;if(!equip||typeof equip!=='object'||!['worn','held','stowed','dropped','attached'].includes(equip.carryType)||Object.keys(equip).some(k=>!['carryType','handsHeld','inSlot','invested'].includes(k)))return false;
  if(own(equip,'handsHeld')&&![0,1,2].includes(equip.handsHeld)||own(equip,'inSlot')&&typeof equip.inSlot!=='boolean'||own(equip,'invested')&&equip.invested!==null&&typeof equip.invested!=='boolean')return false;
  const normalized=shape(s);
  if(destroyed){if(!r.nativeManagerTriggers||s.system.hp.max!==1)return false;normalized.name=s.name.slice(10);normalized.system.hp.max=r.rawItem.system.hp.max;}
  return r.forms.some(form=>equal(normalized,form));
 }
 function resolve(item,{display=false}={}){
  if(!enabled()||!itemValid(item))return null;
  const a=item.actor??item.parent,s=item._source,marker=s.flags?.[EXTRA]?.[FLAG];let row;
  if(marker){row=byKey.get(marker.actorId+'/'+marker.itemId);if(!row||!equal(marker,row.marker)||!matches(item,row,true))return null;}
  else {row=byKey.get(a.id+'/'+item.id);const as=a._source;if(!row||a.type!==row.actorType||as.type!==row.actorType||!row.actorNames.includes(a.name)||as.name!==a.name||nil(as.folder)!==row.actorFolder||as.img!==row.actorImg||nil(as._stats?.compendiumSource)!==row.actorSourceUuid||!matches(item,row,false))return null;}
  if(display&&(!chinese()||!marker||!fountainValid(a)||!s.name.startsWith('Destroyed ')||item.visible!==true||a.visible!==true))return null;
  return {row,item,actor:a,source:s,actorSource:a._source,items:a.items,actors:getActors(),snapshot:JSON.stringify(s),actorSnapshot:JSON.stringify({id:a.id,name:a.name,type:a.type,folder:a._source.folder,img:a._source.img,flags:a._source.flags,stats:a._source._stats,ownership:a._source.ownership}),sourceName:s.name,displayName:row.displayName};
 }
 const authority=p=>{const u=getUser();return [u,u?.id,u?.role,u?.isGM,u?.active,getLocale(),p.item.visible,p.item.isOwner,p.item.permission,p.actor.visible,p.actor.isOwner,p.actor.permission];};
 const stable=(p,auth)=>{const fresh=resolve(p.item,{display:true});return fresh&&Object.keys(p).every(k=>Object.is(p[k],fresh[k]))&&authority(fresh).every((v,i)=>Object.is(v,auth[i]));};
 function replace(prototype,key,descriptor){const previous=Object.getOwnPropertyDescriptor(prototype,key);Object.defineProperty(prototype,key,descriptor);restores.push(()=>{const cur=Object.getOwnPropertyDescriptor(prototype,key);if(cur?.value===descriptor.value&&cur?.get===descriptor.get){if(previous)Object.defineProperty(prototype,key,previous);else delete prototype[key];}});}
 function wrap(prototype,key,make){const p=owner(prototype,key),d=p&&Object.getOwnPropertyDescriptor(p,key);if(typeof d?.value!=='function')throw TypeError(`Native ${key} required`);replace(prototype,key,{...d,value:make(d.value)});}
 // A short-lived view keeps native mechanical reads live across payment awaits.
 // Never clone a Document here: native reads quantity again AFTER removeCoins/addCoins.
 // Native getters/private methods run on the real registered Item, not on the Proxy.
 function markedCopyView(item){
  const initial=resolve(item);if(!initial)return item;
  const methods=new Map();
  return new Proxy(item,{
   get(target,key){
    const value=Reflect.get(target,key,target);
    if(key==='constructor'||typeof value!=='function')return value;
    const cached=methods.get(key);if(cached?.native===value)return cached.bound;
    const bound=key!=='toObject'?value.bind(target):function(...args){
     const data=Reflect.apply(value,target,args),proof=resolve(target);
     // Only an exact, newly serialized full source may carry this marker.
     // A changed source, disabled/disposed adapter, or non-source serialization stays native.
     if(!proof||proof.row!==initial.row||data===target._source||!equal(data,target._source))return data;
     return {...data,flags:{...data.flags,[EXTRA]:{...data.flags?.[EXTRA],[FLAG]:structuredClone(proof.row.marker)}}};
    };methods.set(key,{native:value,bound});return bound;
   },
   set(){return false;},defineProperty(){return false;},deleteProperty(){return false;},setPrototypeOf(){return false;}
  });
 }
 // Ownership of a projected input is separate from permission to make a NEW projection.
 // Cleanup never writes a Document; it only removes display text that this adapter inserted.
 const formOf=input=>{for(let node=input;node;node=node.parentElement)if(node.tagName==='FORM')return node;return null;};
 const nameInputs=form=>elements(form).filter(e=>e.tagName==='INPUT'&&e.getAttribute('name')==='name');
 function isOwned(record){return record.input.value===record.displayName&&formOf(record.input)===record.form&&nameInputs(record.form).length===1&&nameInputs(record.form)[0]===record.input;}
 function cleanRecord(record){if(isOwned(record)&&record.sheet.item===record.item&&record.sheet.object===record.item&&typeof record.item._source?.name==='string')record.input.value=record.item._source.name;ownedInputs.delete(record);}
 function cleanSheet(sheet){for(const record of ownedInputs)if(record.sheet===sheet)cleanRecord(record);}
 try {
 wrap(ActorClass.prototype,'transferItemToActor',original=>function(target,item,...args){return Reflect.apply(original,this,[target,this===item?.actor?markedCopyView(item):item,...args]);});
 if(owner(ActorSheetClass.prototype,'_handleDroppedItem'))wrap(ActorSheetClass.prototype,'_handleDroppedItem',original=>function(event,item,...args){return Reflect.apply(original,this,[event,markedCopyView(item),...args]);});
 function captureSheet(sheet,items){if(![1,2].includes(sheet._state))return null;const list=items.map(i=>resolve(i,{display:true})).filter(Boolean);return {list,auth:list.map(authority),state:sheet._state,generation:generations.get(sheet)??0};}
 function currentSheet(sheet,c){return enabled()&&c&&[1,2].includes(sheet._state)&&sheet._state===c.state&&(generations.get(sheet)??0)===c.generation&&c.list.every((p,i)=>stable(p,c.auth[i]));}
 function namesInInventory(root,p){const rows=elements(root).filter(e=>e.getAttribute?.('data-item-id')===p.item.id&&e.tagName==='LI');if(rows.length!==1)return;const names=elements(rows[0]).filter(e=>e.tagName==='A'&&e.getAttribute('data-action')==='toggle-summary');if(names.length!==1||names[0].textContent!==p.sourceName)return;names[0].textContent=p.displayName;for(const img of elements(rows[0]).filter(e=>e.tagName==='IMG'&&e.getAttribute('alt')===p.sourceName))img.setAttribute('alt',p.displayName);}
 wrap(ActorSheetClass.prototype,'_renderInner',original=>async function(...args){const c=captureSheet(this,[...this.actor.items.values()]),result=await Reflect.apply(original,this,args);if(currentSheet(this,c)&&result?.[0])for(const p of c.list)namesInInventory(result[0],p);return result;});
 wrap(ItemSheetClass.prototype,'_renderInner',original=>async function(...args){
  // Retain the current live form while native rendering awaits. Superseded detached forms can be cleaned.
  for(const record of ownedInputs)if(record.sheet===this&&record.form!==this.form)cleanRecord(record);
  const c=captureSheet(this,[this.item]),result=await Reflect.apply(original,this,args);
  if(currentSheet(this,c)&&c.list.length===1&&this.item===c.list[0].item&&this.object===c.list[0].item&&result?.[0]){
   const p=c.list[0],inputs=nameInputs(result[0]);
   if(inputs.length===1&&inputs[0].value===p.sourceName){const input=inputs[0],form=formOf(input);
    if(form&&elements(result[0]).includes(form)){input.value=p.displayName;ownedInputs.add({sheet:this,item:p.item,form,input,displayName:p.displayName});}
   }
  }return result;
 });
 wrap(ItemSheetClass.prototype,'_getSubmitData',original=>function(updateData,...args){
  // Keep the real native synchronous collector/merge/exception behavior. Explicit overrides remain native.
  const data=Reflect.apply(original,this,[updateData,...args]);
  if(own(updateData??{},'name')||!data||typeof data!=='object'||!own(data,'name'))return data;
  for(const record of ownedInputs)if(record.sheet===this&&record.form===this.form&&this.item===record.item&&this.object===record.item&&isOwned(record)&&data.name===record.displayName){
   const copy={...data};delete copy.name;return copy;
  }return data;
 });
 const titleOwner=owner(ItemSheetClass.prototype,'title'),title=titleOwner&&Object.getOwnPropertyDescriptor(titleOwner,'title');
 if(typeof title?.get!=='function')throw TypeError('Native Item sheet title getter required');
 replace(ItemSheetClass.prototype,'title',{...title,get:function(){const native=Reflect.apply(title.get,this,[]),p=resolve(this.item,{display:true});return p&&native===p.sourceName?p.displayName:native;}});
 for(const Sheet of new Set([ItemSheetClass,ActorSheetClass]))wrap(Sheet.prototype,'close',original=>function(...args){generations.set(this,(generations.get(this)??0)+1);cleanSheet(this);return Reflect.apply(original,this,args);});
 wrap(ChatMessageClass.prototype,'renderHTML',original=>async function(...args){const item=this.item,p=resolve(item,{display:true}),auth=p&&authority(p),source=this._source,sourceSnapshot=JSON.stringify(source),visible=this.isContentVisible;const links=[...(getActors()?.get(f.rawActor._id)?.items?.values()??[])].map(i=>resolve(i,{display:true})).filter(Boolean),linkAuth=links.map(authority);const result=await Reflect.apply(original,this,args);
  if(visible!==true||this.isContentVisible!==true||this._source!==source||JSON.stringify(source)!==sourceSnapshot||!result)return result;
  for(const [i,proof] of links.entries())if(stable(proof,linkAuth[i]))for(const a of elements(result)){
   if(a.tagName!=='A'||!a.classList?.contains('content-link')||a.classList.contains('broken')||a.getAttribute('data-uuid')!==proof.item.uuid||a.getAttribute('data-id')!==proof.item.id||a.getAttribute('data-type')!=='Item'||a.textContent!==proof.sourceName)continue;
   const nodes=Array.from(a.childNodes??[]);if(nodes.length!==2||nodes[0].tagName!=='I'||nodes[1].nodeType!==3||nodes[1].textContent!==proof.sourceName)continue;nodes[1].textContent=proof.displayName;
  }
  if(!p||visible!==true||this.isContentVisible!==true||this.item!==item||this._source!==source||JSON.stringify(source)!==sourceSnapshot||!stable(p,auth)||this.flags?.pf2e?.origin?.uuid!==item.uuid||!result)return result;
  const cards=elements(result).filter(e=>e.classList?.contains('item-card')&&e.getAttribute('data-actor-id')===p.actor.id&&e.getAttribute('data-item-id')===item.id);if(cards.length!==1)return result;
  const header=Array.from(cards[0].children).find(e=>e.tagName==='HEADER'&&e.classList.contains('card-header')),h=header&&Array.from(header.children).filter(e=>e.tagName==='H3');if(h?.length!==1||h[0].textContent!==p.sourceName)return result;
  h[0].textContent=p.displayName;for(const img of header.children)if(img.tagName==='IMG'&&img.getAttribute('alt')===p.sourceName)img.setAttribute('alt',p.displayName);return result;
 });
 const dispose=()=>{for(const record of ownedInputs)cleanRecord(record);active=false;for(const restore of restores.toReversed())restore();};dispose.isActive=enabled;return dispose;
 }catch(error){for(const record of ownedInputs)cleanRecord(record);active=false;for(const restore of restores.toReversed())restore();throw error;}
}
