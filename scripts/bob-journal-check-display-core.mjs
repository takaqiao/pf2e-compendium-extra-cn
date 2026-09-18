/** Exact Journal page display candidate. No saved source, macro parameter or roll option writes. */
const CHINESE=new Set(['cn','zh-CN','zh-Hans']);
const nil=x=>x??null;
const equal=(a,b)=>{if(Object.is(a,b))return true;if(!a||!b||typeof a!=='object'||typeof b!=='object')return false;if(Array.isArray(a)!==Array.isArray(b))return false;const ak=Object.keys(a).sort(),bk=Object.keys(b).sort();return ak.length===bk.length&&ak.every((k,i)=>k===bk[i]&&equal(a[k],b[k]));};
const allElements=root=>Array.from(root.children??[]).flatMap(c=>[c,...allElements(c)]);
// PF2e adds the visible DC itself, including its native visibility rules.
export function cleanBobCheckLabels(text){
 if(typeof text!=='string')return text;
 return text.replace(/(@Check\[([^\]\r\n]+)\])\{DC[ \t\u00a0]+(\d+)(?![\d.])[ \t\u00a0]*([^{}\r\n]+)\}/g,(whole,macro,parameters,dc,label)=>{
  const values=parameters.split('|').filter(p=>p.startsWith('dc:'));
  return values.length===1&&values[0]===`dc:${dc}`&&label.trim()?`${macro}{${label}}`:whole;
 });
}
function compile(bindings){
 if(!Array.isArray(bindings)||bindings.length!==2)throw TypeError('Exact two-page review bindings required');
 const rows=structuredClone(bindings),index=new Map();
 for(const row of rows){
  if(!row.journalId||!row.pageId||index.has(row.pageId)||!Array.isArray(row.macros)||!row.macros.length||!Array.isArray(row.forms)||row.forms.length!==2)throw TypeError('Invalid page binding');
  for(const m of row.macros){
   if(!/^@Check\[[^\]\n]+\]$/.test(m.macro)||!m.displayLabel||/[<>{}\[\]]/.test(m.displayLabel)||!m.titleAfter||/[<>{}]/.test(m.titleAfter)
      ||!['28','32'].includes(m.dc)||!/^([a-z]+-lore|counteract)$/.test(m.type)||!(/^[0-9a-f]{64}$/).test(m.blockApprovalSha256)
      ||m.macro!==`@Check[${m.type}|dc:${m.dc}|name:${m.titleBefore}${m.rollOptions?'|options:'+m.rollOptions:''}]`)throw TypeError('Invalid exact Check binding');
   for(const f of row.forms)if(typeof f.source!=='string'||f.source.split(m.macro).length!==2||f.source.includes(m.macro+'{'))throw TypeError('Ambiguous source macro');
  }
  for(const f of row.forms){f.display=f.source;for(const m of row.macros)f.display=f.display.replace(m.macro,m.macro+'{'+m.displayLabel+'}');}
  index.set(row.pageId,row);
 }
 if(rows.reduce((n,r)=>n+r.macros.length,0)!==7)throw TypeError('Seven exact macros required');
 return index;
}
export function installBobJournalCheckDisplay({TextEditorClass,JournalClass,PageClass,bindings,document,isEnabled,getLocale,getUser,getJournals,format}){
 const descriptor=Object.getOwnPropertyDescriptor(TextEditorClass,'enrichHTML');
 if(!descriptor||typeof descriptor.value!=='function'||![JournalClass,PageClass,isEnabled,getLocale,getUser,getJournals,format].every(f=>typeof f==='function')||!document?.createElement)throw TypeError('Native dependencies required');
 const original=descriptor.value,index=compile(bindings);let active=true;
 function cleanExistingPage(text,options){
  if(!active||!isEnabled()||!CHINESE.has(getLocale())||typeof text!=='string'||!options||options.processVisibility===false||options.rollData!=null)return text;
  const page=options.relativeTo,journal=page?.parent,collection=getJournals();
  if(!(page instanceof PageClass)||!(journal instanceof JournalClass)||journal.parent!=null||page.pack||journal.pack
     ||journal.collection!==collection||collection?.get?.(journal.id)!==journal||journal.pages?.get?.(page.id)!==page||page.collection!==journal.pages
     ||page.type!=='text'||page.visible!==true||journal.visible!==true
     ||journal._source?.flags?.core?.sheetClass!=='pf2e-bastion-of-blasphemies.BastionJournalSheet'
     ||page.text?.content!==text||page._source?.text?.content!==text)return text;
  return cleanBobCheckLabels(text);
 }
 function resolve(text,options){
  if(!active||!isEnabled()||!CHINESE.has(getLocale())||typeof text!=='string'||!options||options.processVisibility===false||options.rollData!=null)return null;
  const page=options.relativeTo,journal=page?.parent,collection=getJournals();
  if(!(page instanceof PageClass)||!(journal instanceof JournalClass)||journal.parent!=null||page.pack||journal.pack
     ||journal.collection!==collection||collection?.get?.(journal.id)!==journal||journal.pages?.get?.(page.id)!==page||page.collection!==journal.pages
     ||page.visible!==true||journal.visible!==true)return null;
  const row=index.get(page.id),ps=page._source,js=journal._source;
  if(!row||!ps||!js||journal.id!==row.journalId||js._id!==row.journalId||ps._id!==row.pageId
     ||!row.journalNames.includes(journal.name)||js.name!==journal.name||!row.pageNames.includes(page.name)||ps.name!==page.name
     ||nil(js.folder)!==row.journalFolder||nil(js._stats?.compendiumSource)!==row.journalSourceUuid||nil(ps._stats?.compendiumSource)!==row.pageSourceUuid
     ||page.type!==row.pageType||ps.type!==row.pageType||ps.text?.format!==row.pageFormat||ps.category!==row.pageCategory
     ||!equal(ps.flags,row.pageFlags)||!equal(js.flags,row.journalFlags)||!equal(ps.system,row.pageSystem)
     ||page.text?.content!==ps.text?.content||text!==ps.text.content)return null;
  const form=row.forms.find(f=>f.source===text);if(!form)return null;
  return {row,form,page,journal,collection,pages:journal.pages,ps,js,pageText:page.text,
   pageSnapshot:JSON.stringify(ps),journalSnapshot:JSON.stringify({id:js._id,name:js.name,folder:js.folder,flags:js.flags,ownership:js.ownership,stats:js._stats})};
 }
 function authority(c){const u=getUser();return [u,u?.id,u?.role,u?.isGM,u?.active,getLocale(),c.page.isOwner,c.page.visible,c.page.permission,c.journal.isOwner,c.journal.visible,c.journal.permission,c.journal.hasPlayerOwner];}
 const optionsState=o=>[o.relativeTo,o.secrets,o.processVisibility,o.rollData];
 function project(html,row){
  if(typeof html!=='string')return null;
  const root=document.createElement('div');root.innerHTML=html;
  const anchors=allElements(root).filter(e=>e.tagName==='A'&&e.classList.contains('inline-check'));
  const plans=[];
  for(const m of row.macros){
   const candidates=anchors.filter(a=>a.getAttribute('data-pf2-check')===m.type&&a.getAttribute('data-pf2-dc')===m.dc);
   if(candidates.length>1)return null;
   if(candidates.length===0)continue; // Native permission processing removed it; never reconstruct.
   const a=candidates[0],label=Array.from(a.children).find(e=>e.tagName==='SPAN'&&e.classList.contains('label'));
   if(!label||![m.displayLabel,`DC ${m.dc} ${m.displayLabel}`].includes(label.textContent.trim())
      ||a.getAttribute('data-pf2-repost-flavor')!==m.titleBefore||a.getAttribute('data-pf2-label')!==format('PF2E.InlineCheck.DCWithName',{name:m.titleBefore})
      ||a.getAttribute('data-pf2-roll-options')!==m.rollOptions||a.getAttribute('data-roller-role')!=='origin'
      ||!['gm',null].includes(a.getAttribute('data-pf2-show-dc'))
      ||['data-pf2-traits','data-pf2-adjustment','data-pf2-roller','data-target-owner','data-against','data-item-uuid','data-invalid','data-pf2-defense','data-slug','data-override-traits'].some(k=>a.hasAttribute(k)))return null;
   plans.push({a,m});
  }
  if(!plans.length)return html;
  for(const {a,m}of plans){a.setAttribute('data-pf2-label',format('PF2E.InlineCheck.DCWithName',{name:m.titleAfter}));a.setAttribute('data-pf2-repost-flavor',m.titleAfter);}
  return root.innerHTML;
 }
 const wrapped=async function(text,options={},...rest){
  const c=resolve(text,options);if(!c)return Reflect.apply(original,this,[cleanExistingPage(text,options),options,...rest]);
  const auth=authority(c),opts=optionsState(options);
  const result=await Reflect.apply(original,this,[c.form.display,{...options},...rest]);
  const fresh=resolve(text,options),stable=fresh&&Object.keys(c).every(k=>Object.is(c[k],fresh[k]))&&authority(fresh).every((v,i)=>Object.is(v,auth[i]))&&optionsState(options).every((v,i)=>Object.is(v,opts[i]));
  const projected=stable?project(result,c.row):null;
  if(projected!==null)return projected;
  // A stale owner flag supplied before the await must not restore secret text after ownership loss.
  const freshOptions={...options};if(freshOptions.secrets===true)freshOptions.secrets=c.page.isOwner===true&&c.page.visible===true&&c.journal.visible===true;
  return Reflect.apply(original,this,[text,freshOptions,...rest]);
 };
 Object.defineProperty(TextEditorClass,'enrichHTML',{...descriptor,value:wrapped});
 const dispose=()=>{active=false;if(TextEditorClass.enrichHTML===wrapped)Object.defineProperty(TextEditorClass,'enrichHTML',descriptor);};
 dispose.isActive=()=>active&&isEnabled()&&CHINESE.has(getLocale());return dispose;
}
