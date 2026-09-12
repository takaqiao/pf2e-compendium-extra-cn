import {AV_LEGACY_CONTENT_LINK_FIELDS as fields} from './av-legacy-content-link-data.mjs';

const moduleId='tianzes-gauntlight-extras',packId=moduleId+'.'+moduleId;
const observers=new WeakMap(),signatures=new Map();
const editingSelector='[contenteditable]:not([contenteditable="false"]),.ProseMirror,.prosemirror,prose-mirror';
export function supportsAvLegacyContentLinks(g=globalThis.game){
  return (g?.release?.version??g?.version)==='14.367'&&g.system?.id==='pf2e'&&g.system.version==='8.5.0'
    &&g.i18n?.lang==='cn'&&g.modules.get(moduleId)?.active===true&&g.modules.get(moduleId)?.version==='2.0.0';
}
function allowedFields(doc){
  if(!doc||doc.pack&&doc.pack!==packId)return [];
  return fields.filter(f=>f.documentId===doc.id&&f.documentType===doc.documentName&&f.type===doc.type
    &&(!doc.parent||doc.parent.id===f.parentId));
}
function matchesField(doc,f){
  let value=doc._source;for(const key of f.path)value=value?.[key];
  return typeof value==='string'&&f.acceptedHTML.includes(value);
}
function getSignatures(f){
  if(!signatures.has(f)){
    const set=new Set();
    for(const literal of [...f.sourceAnchors,...f.translatedAnchors]){
      const t=document.createElement('template');t.innerHTML=literal;
      const a=t.content.querySelector('a.content-link[data-uuid]:not([data-link])');
      if(a&&!a.classList.contains('broken'))set.add(a.outerHTML);
    }
    signatures.set(f,set);
  }
  return signatures.get(f);
}
function readonlyRoots(doc,root,f){
  const fieldSelector=`[data-edit="${f.path.join('.')}"]`;
  const roots=[...(root.matches?.(fieldSelector)?[root]:[]),...root.querySelectorAll(fieldSelector)];
  // PF2e's delayed item summary has no data-edit marker. Require its exact item row.
  if(doc.documentName==='Item'&&doc.parent?.documentName==='Actor'&&f.path.join('.')==='system.description.value'){
    const row=root.matches?.(`[data-item-id="${doc.id}"]`)?root:root.closest?.(`[data-item-id="${doc.id}"]`);
    if(row&&row===root)roots.push(...row.querySelectorAll('.item-summary > .description'));
  }
  // Foundry's read-only Journal page content is identified by its actual article ID.
  if(doc.documentName==='JournalEntryPage'&&f.path.join('.')==='text.content'){
    const selector=`article[data-page-id="${doc.id}"]`;
    const article=root.matches?.(selector)?root:root.closest?.(selector);
    if(article)roots.push(...article.querySelectorAll('.journal-page-content'));
  }
  return [...new Set(roots)].filter(e=>!e.closest(editingSelector));
}
/** Repair only exact, frozen literals in a validated document's rendered DOM. No Document update. */
export function repairAvLegacyContentLinks(doc,root){
  if(!supportsAvLegacyContentLinks()||!root?.querySelectorAll)return 0;
  let patched=0;
  for(const f of allowedFields(doc)){
    if(!matchesField(doc,f))continue;
    const candidates=getSignatures(f);
    for(const fieldRoot of readonlyRoots(doc,root,f))for(const a of fieldRoot.querySelectorAll('a.content-link[data-uuid]:not([data-link]):not(.broken)')){
      const field=a.closest('[data-edit]');
      if(a.closest(editingSelector)||field&&field.dataset.edit!==f.path.join('.'))continue;
      if(candidates.has(a.outerHTML)){a.setAttribute('data-link','');patched++;}
    }
  }
  return patched;
}
function targets(doc,root){
  const list=[[doc,root]];
  if(doc?.documentName==='JournalEntry')for(const p of doc.pages??[]){
    const e=root.querySelector(`article[data-page-id="${p.id}"]`);if(e)list.push([p,e]);
  }
  if(doc?.documentName==='Actor')for(const item of doc.items??[]){
    const e=root.querySelector(`[data-item-id="${item.id}"]`);if(e)list.push([item,e]);
  }
  return list;
}
function relevant(doc){
  return allowedFields(doc).length>0||[...(doc?.pages??[]),...(doc?.items??[])].some(d=>allowedFields(d).length>0);
}
function render(app,html){
  const root=html instanceof HTMLElement?html:html?.[0],doc=app.document??app.object;
  if(!root||!supportsAvLegacyContentLinks()||!relevant(doc))return;
  observers.get(app)?.disconnect();
  const repair=()=>{for(const [d,e]of targets(doc,root))repairAvLegacyContentLinks(d,e);};
  repair();
  // Item summaries and paginated Journal pages may be inserted after the sheet's render hook.
  const observer=new MutationObserver(repair);observer.observe(root,{childList:true,subtree:true});observers.set(app,observer);
}
function close(app){observers.get(app)?.disconnect();observers.delete(app);}
for(const name of ['Application','ApplicationV2','ActorSheet','ItemSheet','JournalSheet','JournalEntrySheet']){
  Hooks.on('render'+name,render);Hooks.on('close'+name,close);
}
