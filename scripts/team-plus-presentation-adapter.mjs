import {patchFragment,replaceText,sourceUuid,dynamicCandidate,showInputName,literals,sha256} from './team-plus-presentation-core.mjs';
const EXTRA='pf2e-compendium-extra-cn',MAGIC='pf2e-team-plus-magic',SUMMONERS='pf2e-summoners-plus',FEATS='pf2e-team-plus-feats',BARB='pf2e-team-plus-barbarians',WIZARDS='pf2e-team-plus-wizards',INVENTORS='pf2e-team-plus-inventors';
const rootOf=html=>html instanceof HTMLElement?html:html?.[0];
const uuidTail=s=>s?.split('.').at(-1);
const actionGroups=[['daring-swing',[39,40,41]],['haughty-correction',[42,43,44,45,46,47]],['entrap-confession',[48,49,50,51,52,53]]];
const constantValues={'${t(a)["pf2e.actionspf2e"]}':'pf2e.actionspf2e','${t(a)["pf2e.conditionitems"]}':'pf2e.conditionitems'};

export function createPresentationAdapter({game,data,fetchSource=path=>fetch(path).then(r=>{if(!r.ok)throw Error(r.status);return r.text()}),verifiedModules=new Set()}) {
 const ui=new Map(data.ui.map(x=>[x.id,x])),observers=new WeakMap(),pending=new WeakSet();
 const diagnostics={sourceChecks:[],applications:0,dynamicApplied:0,uiApplied:0,failures:[]};
 const unit=n=>ui.get(`ui-${String(n).padStart(3,'0')}`);
 const allowed=mid=>{
  try {const m=game.modules.get(mid),p=data.profiles[mid];return game.system?.id===data.system&&game.system.version===data.systemVersion
   && `${game.release?.generation}.${game.release?.build}`===data.foundryVersion&&game.i18n?.lang==='cn'
   && game.modules.get(EXTRA)?.active===true&&['full','ondemand'].includes(game.settings.get('babele','loadingMode'))
   && p&&m?.active===true&&m.version===p.version&&verifiedModules.has(mid);
  } catch{return false;}
 };
 const optional=mid=>game.modules.get(mid)?.active===true&&game.modules.get(mid)?.version===data.optional[mid]?.version;
 function presentationFor(item){
  if(!allowed(MAGIC))return null;
  const row=dynamicCandidate(item,data.dynamic),p=row?.presentation;if(!p)return null;
  const id=item.variantId??item.appliedOverlays?.get?.('override')??null;
  if(id&&!Object.hasOwn(p.overlays,id))return null;
  return {row,id,fields:{...p.base,...(id?p.overlays[id].fields:{})}};
 }
 function metadataIn(root,item,{inputs=false,blocks=false,variants=false}={}){
  const context=presentationFor(item);if(!root||!context)return;
  const {row,fields}=context;
  const labels={range:'PF2E.TraitRange',target:'PF2E.SpellTargetLabel',duration:'PF2E.Time.Duration'};
  for(const[field,p]of Object.entries(fields)){
   if(!p.source||p.source===p.after||item.system?.[field]?.value!==p.source)continue;
   if(inputs)for(const input of root.querySelectorAll(`input[type="text"][name="system.${field}.value"]`))showInputName(input,p.source,p.after);
   if(blocks)for(const span of root.querySelectorAll('.item-block-line > span')){
    if(span.querySelector(':scope > strong')?.textContent.trim()!==game.i18n.localize(labels[field]))continue;
    // PF2e's description prepend emits source text and an optional line separator.
    // Exact complete text nodes only; the underlying document and inputs stay raw.
    replaceText(span,p.source,p.after);replaceText(span,`${p.source};`,`${p.after};`);
   }
  }
  if(variants)for(const[oid,p]of Object.entries(row.presentation.overlays)){
   const source=item.system?.overlays?.[oid];if(!source)continue;
   const name=p.name?.source===source.name?p.name:null;
   if(p.name&&!name)continue;
   if(!p.name&&source.name)continue;
   for(const label of root.querySelectorAll(`.variants .variant[data-variant-id="${oid}"] > label,button[data-action="spell-variant"][data-overlay-ids="${oid}"] > span:first-child`)){
    if(name)replaceText(label,name.source,name.after);else nameIn(label,item);
   }
  }
 }
 async function verifySources(){
  const results=await Promise.allSettled(Object.entries(data.profiles).map(async([mid,profile])=>{
   if(!game.modules.get(mid)?.active||game.modules.get(mid).version!==profile.version)return;
   const checks=await Promise.allSettled(Object.entries(profile.files).map(async([path,hash])=>sha256(await fetchSource(`modules/${mid}/${path}`))===hash));
   const pass=checks.every(r=>r.status==='fulfilled'&&r.value===true);diagnostics.sourceChecks.push({module:mid,pass});if(pass)verifiedModules.add(mid);
  }));
  for(const r of results)if(r.status==='rejected')diagnostics.failures.push(String(r.reason));
  return diagnostics.sourceChecks;
 }
 function plain(root,n,options){const x=unit(n);if(!root||!x||!allowed(x.module))return false;const count=replaceText(root,x.source,x.after,options);diagnostics.uiApplied+=count;return !!count;}
 async function rich(root,n,options={}){
  const x=unit(n);if(!root||!x||!allowed(x.module))return false;
  const before=literals(x.source,constantValues),after=literals(x.after,constantValues);
  if(patchFragment(root,before,after)){diagnostics.uiApplied++;return true;}
  const enrich=game.pf2e?.TextEditor?.enrichHTML;
  if(typeof enrich!=='function')return false;
  const [en,cn]=await Promise.all([enrich.call(game.pf2e.TextEditor,before,options),enrich.call(game.pf2e.TextEditor,after,options)]);
  // Foundry calls renderChatMessageHTML before the HTMLElement is attached.
  if(!allowed(x.module))return false;
  const changed=patchFragment(root,en,cn);if(changed)diagnostics.uiApplied++;return changed;
 }
 function displayedName(item){
  if(!item)return null;
  if(allowed(MAGIC)){
   if(item.name===unit(4).source&&uuidTail(sourceUuid(item))==='4ryvly84IUf6HZaO')return unit(4).after;
   const row=dynamicCandidate(item,data.dynamic);
   if(row){
    const context=presentationFor(item),variant=context?.id?row.presentation.overlays[context.id]?.name:null;
    if(variant&&item.name===variant.source)return variant.after;
    const en=`${row.englishName} (Mastered)`,bilingual=`${row.chineseName} ${en}`;
    if([en,bilingual].includes(item.name))return `${row.chineseName}${unit(3).after} ${en}`;
   }
  }
  if(allowed(BARB)&&item.name===unit(63).source&&item.type==='class'&&item.system?.slug==='barbarian'
   && item.actor?.items?.some(x=>x.slug==='wildblood-instinct'))return unit(63).after;
  return null;
 }
 function nameIn(root,item){const name=displayedName(item);if(name)replaceText(root,item.name,name);return name;}
 async function dynamicIn(root,item){
  if(!root||!allowed(MAGIC))return false;
  const row=dynamicCandidate(item,data.dynamic);if(!row)return false;
  if(root.matches('[contenteditable="true"],.ProseMirror')||root.closest('.prosemirror'))return false;
  const before=item.system.description.value,opts={secrets:item.isOwner,rollData:item.getRollData?.()??{},relativeTo:item};
  const enrich=game.pf2e?.TextEditor?.enrichHTML;if(typeof enrich!=='function')return false;
  const [en,cn]=await Promise.all([enrich.call(game.pf2e.TextEditor,before,opts),enrich.call(game.pf2e.TextEditor,row.after,opts)]);
  if(!allowed(MAGIC)||dynamicCandidate(item,data.dynamic)!==row)return false;
  if(patchFragment(root,en,cn)){diagnostics.dynamicApplied++;return true;}return false;
 }
 function headerButtons(sheet,buttons){
  if(!allowed(MAGIC)||!data.dynamic.some(r=>r.uuid===sourceUuid(sheet.item)))return;
  for(const b of buttons)if(b.class==='dynamic-mastery'&&b.label===unit(1).source)b.label=unit(1).after;
 }
 function watch(root,run){
  if(observers.has(root))return;
  const obs=new MutationObserver(records=>{
   if(!root.isConnected){obs.disconnect();return;}
   if(!records.some(r=>r.addedNodes.length)||pending.has(root))return;
   pending.add(root);queueMicrotask(()=>{pending.delete(root);void run();});
  });obs.observe(root,{childList:true,subtree:true});observers.set(root,obs);
 }
 async function itemSheet(sheet,html){
  const root=rootOf(html),item=sheet.item;if(!root||!item)return;
  diagnostics.applications++;
  const name=nameIn(root,item);if(name)showInputName(root.querySelector('input[name="name"]'),item.name,name);
  metadataIn(root,item,{inputs:true,blocks:true,variants:true});
  const editor=sheet.editors?.['system.description.value'];
  if(!editor?.active)for(const el of root.querySelectorAll('.tab.description .main .editor-content'))await dynamicIn(el,item);
  if(allowed(SUMMONERS)&&item.flags?.[SUMMONERS]?.sidenote)for(const h of root.querySelectorAll('.inventory-details .prerequisites h4.tags-title'))plain(h,18);
  if(allowed(BARB)){
   if(item.type==='class'&&item.system?.slug==='barbarian'){
    for(const row of Object.values(item.system.items??{}))if(row.uuid==='Compendium.pf2e-team-plus-barbarians.items.Item.0GLtuUDJbU32n7LD'){
     for(const el of root.querySelectorAll(`[data-item-uuid="${row.uuid}"] > .name`))plain(el,62);
    }
    for(const p of root.querySelectorAll('p.team-plus-brew'))plain(p,64);
   }
  }
  const dynamicButton=root.querySelector('.dynamic-mastery');
  if(dynamicButton&&allowed(MAGIC)&&data.dynamic.some(r=>r.uuid===sourceUuid(item))&&!dynamicButton.dataset.extraTeamPlusCapture){
   // Observe notifications generated synchronously by this owned click; never invoke its callback.
   dynamicButton.dataset.extraTeamPlusCapture='true';dynamicButton.addEventListener('click',event=>capturePermission(item,root,event),{capture:true});
  }
 }
 async function actorSheet(sheet,html){
  const root=rootOf(html),actor=sheet.actor;if(!root||!actor)return;
  const render=async()=>{
   if(allowed(MAGIC)){
    for(const row of root.querySelectorAll('[data-item-id]')){
     const item=actor.items?.get(row.dataset.itemId);if(!item)continue;
     for(const heading of row.querySelectorAll('.item-name, .item-name h4, .spell-name'))nameIn(heading,item);
     for(const desc of row.querySelectorAll('.item-summary .description')){metadataIn(desc,item,{blocks:true,variants:true});await dynamicIn(desc,item);}
    }
    if(actor.getRollOptions?.().includes('feature:essence-pool'))for(const el of root.querySelectorAll('[data-action="essence-toggle"]')){
     if(actor.items?.get(el.dataset.location))plain(el,8);
    }
   }
   if(allowed(FEATS))for(const [id,n]of [['unrestrictedPlusPackClass',54],['unrestrictedPlusPackGeneral',55],['basicPackClass',56],['basicPackGeneral',57]]){
    const h=root.querySelector(`[data-group-id="${id}"] > header`);plain(h,n);
   }
   if(allowed(BARB)){
    if(actor.class?.name===unit(63).source)nameIn(root,actor.class);
    for(const row of root.querySelectorAll('[data-strike][data-action-index]')){
     const weapon=actor.system?.actions?.[Number(row.dataset.actionIndex)]?.item;if(!weapon)continue;
     const aux=row.querySelector('.auxiliary-actions.weapon-drawn');if(!aux)continue;
     if(weapon.system?.traits?.value?.includes('modular-moonscythe')){
      for(const b of aux.querySelectorAll('button.use-action'))if(b.querySelector('select.modular')){
       plain(b.querySelector(':scope > span'),66);
       for(const [value,n]of [['pick',67],['polearm',68]])plain(b.querySelector(`option[value="${value}"]`),n,{substring:true});
      }
     }
     if(weapon.baseType==='mouthsword')for(const b of aux.querySelectorAll('button.use-action')){plain(b,69);plain(b,70);}
    }
   }
  };
  await render();watch(root,render);
 }
 async function dialog(app,html){
  const root=rootOf(html);if(!root)return;
  const title=app.title??app.options?.window?.title??app.data?.title;
  if(allowed(MAGIC)&&title===unit(5).source&&await rich(root,6))plain(root.querySelector('.window-title'),5);
  for(const [heading,body]of [[22,31],[24,32],[26,33],[28,34]])if(allowed(SUMMONERS)&&title===unit(heading).source){
   if(await rich(root,body))plain(root.querySelector('.window-title'),heading);
  }
  if(allowed(BARB)&&optional('pf2e-brewrata'))for(const card of root.querySelectorAll('.brewrata-errata-card')){
   if(card.querySelector('.brewrata-errata-module')?.textContent.trim()!==BARB)continue;
   for(const n of [59,60,61])plain(card.querySelector('.brewrata-errata-desc'),n);
  }
 }
 function settings(app,html){
  const root=rootOf(html);if(!root)return;
  for(const [mid,key,label,hint]of [[INVENTORS,'legacy-plus-unstable',13,14],[FEATS,'basicPack',35,36],[FEATS,'unrestrictedPlusPack',37,38]]){
   if(!allowed(mid))continue;
   const input=root.querySelector(`[name="${mid}.${key}"]`),group=input?.closest('.form-group');if(!group)continue;
   plain(group.querySelector('label'),label);for(const h of group.querySelectorAll('.hint, .notes'))plain(h,hint);
  }
 }
 function dailies(app,html){
  const root=rootOf(html);if(!root||!allowed(WIZARDS)||!optional('pf2e-dailies')||!String(app.id).startsWith('pf2e-dailies-interface-'))return;
  const actor=app.actor,tradition=actor?.flags?.pf2e?.quasiplane;if(!['arcane','divine','occult','primal'].includes(tradition))return;
  // Dailies 4.20.0 creates group labels and data-dailykey from the registered key.
  for(const select of root.querySelectorAll('select[data-dailykey="module.quasiplanar-fusionist"]')){
   const group=select.closest('.group');if(!group)continue;
   const title=tradition[0].toUpperCase()+tradition.slice(1);
   replaceText(group.querySelector('h3'),`${title} Quasiplanar Planes`,`${data.traditions[title]} 准位面`);
   const label=select.previousElementSibling;
   if(label?.tagName==='LABEL')for(const n of [72,73,74,75])plain(label,n);
  }
 }
 async function chat(message,html){
  const root=rootOf(html);if(!root||message.isContentVisible===false)return;
  const item=message.item;
  if(item&&allowed(MAGIC)){
   for(const card of root.querySelectorAll('.chat-card[data-item-id]'))if(card.dataset.itemId===item.id){
    nameIn(card.querySelector('.card-header'),item);metadataIn(card,item,{blocks:true,variants:true});await dynamicIn(card.querySelector('.card-content'),item);
   }
  }
  if(allowed(MAGIC)&&message.flags?.[MAGIC]?.diff!==undefined)for(const box of root.querySelectorAll(`[data-module="${MAGIC}"]`)){
   const walker=document.createTreeWalker(box,NodeFilter.SHOW_TEXT);
   for(let n=walker.nextNode();n;n=walker.nextNode()){
    const m=n.data.match(/Life essence depleted! You have healed (\d+) hit points while at (-?\d+) life essence\./);
    if(m)n.data=n.data.replace(m[0],literals(unit(10).after,{'${Math.abs(appliedHealing)}':m[1],'${resource.value}':m[2]}));
   }
   for(const em of box.querySelectorAll('em')){
    const amount=em.querySelector('b')?.textContent.match(/^-(\d+)$/)?.[1];if(!amount)continue;
    const values={'${fullHealing - Math.abs(appliedHealing) - value}':amount};patchFragment(box,literals(unit(11).source,values),literals(unit(11).after,values));
   }
   plain(box,12);
  }
  if(allowed('witches-remaster')&&String(message.content).includes('Compendium.witches-remaster.witches-remaster-journals.JournalEntry.qgxQMdRUrBVZeNv5'))await rich(root,17);
  const options=message.flags?.pf2e?.context?.options??[];
  if(allowed(INVENTORS)&&game.settings.get(INVENTORS,'legacy-plus-unstable')&&options.some(x=>x==='unstable-check'||x==='item:trait:unstable'))await rich(root,16,{rollData:message.actor?.getRollData?.()??{}});
  if(allowed(FEATS))for(const [slug,ids]of actionGroups){
   const actual=game.pf2e?.actions?.get(slug),description=unit(ids[0]);
   if(!actual||actual.name!==unit(ids[1]).source||actual.description!==literals(description.source,constantValues))continue;
   const tagged=options.includes(`action:${slug}`)||options.includes(`self:action:slug:${slug}`)||message.flags?.pf2e?.context?.action===slug;
   if(tagged){for(const n of ids){plain(root,n);await rich(root,n,{rollData:message.actor?.getRollData?.()??{}});}}
   // BaseAction.toMessage has no provenance flags. Require its complete description and title.
   else if(root.querySelector('.action')&&root.textContent.includes(actual.name)&&await rich(root,ids[0]))plain(root,ids[1]);
  }
  if(allowed(FEATS)&&optional('pf2e-dailies')&&message.actor?.items?.some(x=>uuidTail(sourceUuid(x))==='F5FmDkhTduTmIS2W'))for(const summary of root.querySelectorAll('.pf2e-dailies-summary')){
   const walker=document.createTreeWalker(summary,NodeFilter.SHOW_TEXT);
   for(let n=walker.nextNode();n;n=walker.nextNode()){
    const m=n.data.match(/^Prepared an arcane ward against ([^<>\n]+)\.$/);
    if(m)n.data=literals(unit(58).after,{'${e.getResistanceLabel(t.wardType)}':m[1]});
   }
  }
 }
 function notification(root){
  // Only module-identifying complete messages, never an unrestricted dictionary.
  for(const n of [7,9,15,19,20,21,23,25,27,29,30])plain(root,n);
  if(allowed(BARB))replaceText(root,`Barbarians+ | ${unit(65).source}`,`Barbarians+ | ${unit(65).after}`);
 }
 function capturePermission(item,root,event){
  const list=document.querySelector('#notifications');if(!list||!allowed(MAGIC)||!data.dynamic.some(r=>r.uuid===sourceUuid(item)))return;
  if(item.canUserModify?.(game.user,'update')!==false)return;
  let matched=false,timer;
  const consume=records=>{for(const r of records)for(const n of r.addedNodes){
   if(matched||!(n instanceof HTMLElement)||!n.matches('li.notification.warning'))continue;
   if(plain(n.querySelector(':scope > p'),2))matched=true;
  }};
  const obs=new MutationObserver(consume);
  const stop=()=>{obs.disconnect();root.removeEventListener('click',finish);clearTimeout(timer);};
  const finish=e=>{if(e!==event)return;consume(obs.takeRecords());stop();};
  // Real browser events run microtasks between capture and target listeners.
  // Close at this same event's bubble tail, after the native synchronous warning.
  obs.observe(list,{childList:true});root.addEventListener('click',finish);
  // If propagation is interrupted, disconnect only. Never scan older/later messages.
  timer=setTimeout(stop,0);
 }
 function installNotifications(){
  const list=document.querySelector('#notifications');if(!list)return;
  notification(list);watch(list,()=>notification(list));
 }
 async function application(app,html){await dialog(app,html);settings(app,html);dailies(app,html);}
 return {allowed,verifySources,headerButtons,itemSheet,actorSheet,dialog,settings,dailies,chat,application,notification,installNotifications,displayedName,dynamicIn,diagnostics};
}
