/** Preserve incoming native English heading fragments only on identified BoB pages.
 * Neither document HTML, live DOM attributes, nor native TOC caches are mutated. */
export function installBobJournalAnchors({PageClass,PageSheetClass,bindings,isEnabled}) {
  const pageProto=PageClass?.prototype,sheetProto=PageSheetClass?.prototype;
  const tocDescriptor=pageProto && Object.getOwnPropertyDescriptor(pageProto,'toc');
  const renderDescriptor=sheetProto && Object.getOwnPropertyDescriptor(sheetProto,'_onRender');
  if(!tocDescriptor?.get || !tocDescriptor.configurable || typeof renderDescriptor?.value!=='function' || !renderDescriptor.configurable)
    throw new Error('Native journal TOC descriptors are unavailable.');
  const table=new Map();
  const parse=html=>{const t=document.createElement('template');t.innerHTML=html;return t.content;};
  const headings=host=>[...host.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(h=>PageClass._isHeading(h));
  const signature=h=>h.outerHTML;
  const expectedText=html=>parse(html.replace(/@UUID\[[^\]]+\]\{([^}]+)\}/g,'$1')).textContent;
  for(const b of bindings){
    const key=b.journalId+'/'+b.pageId;
    if(table.has(key) || new Set(b.headings.map(h=>h.slug)).size!==b.headings.length)throw new Error('Ambiguous BoB journal binding.');
    table.set(key,{...b,headings:b.headings.map(h=>({...h,signatures:[h.before,h.after].map(v=>signature(headings(parse(v))[0])),texts:[h.before,h.after].map(expectedText),tag:headings(parse(h.before))[0].tagName}))});
  }
  let active=true;
  function match(page){
    if(!active || !isEnabled() || !(page instanceof PageClass) || page.type!=='text')return null;
    const parent=page.parent,b=table.get(parent?.id+'/'+page.id);
    if(!b || parent.documentName!=='JournalEntry' || parent.pages?.get(page.id)!==page
      || !b.journalNames.includes(parent.name) || !b.pageNames.includes(page.name)
      || (parent._source?.folder??null)!==b.journalFolder
      || (parent._source?._stats?.compendiumSource??null)!==b.journalSourceUuid
      || (page._source?._stats?.compendiumSource??null)!==b.pageSourceUuid)return null;
    const hs=headings(parse(page.text.content));
    return hs.length===b.headings.length && hs.every((h,i)=>b.headings[i].signatures.includes(signature(h)))?b:null;
  }
  function remap(toc,nodes,b){
    if(nodes.length!==b.headings.length)return toc;
    const changes=new Map(nodes.map((n,i)=>[n.slug,b.headings[i].slug]));
    const keys=Object.keys(toc).map(k=>changes.get(k)??k);
    if(new Set(keys).size!==keys.length)return toc;
    return Object.fromEntries(Object.entries(toc).map(([key,node])=>[changes.get(key)??key,{...node,slug:changes.get(key)??key,children:node.children.map(c=>changes.get(c)??c)}]));
  }
  function getToc(){
    const native=tocDescriptor.get.call(this),b=match(this);
    if(!b)return native;
    return remap(native,Object.values(native).sort((a,b)=>a.order-b.order),b);
  }
  async function onRender(...args){
    const result=await renderDescriptor.value.apply(this,args),b=match(this.page);
    if(!b || !this.isView || !this.options.includeTOC)return result;
    const containers=this.element?.querySelectorAll('section.journal-page-content');
    if(containers?.length!==1)return result;
    const content=containers[0],hs=headings(content);
    if(hs.length!==b.headings.length || !hs.every((h,i)=>h.tagName===b.headings[i].tag && b.headings[i].texts.includes(h.textContent)))return result;
    const nodes=Object.values(this.toc??{}).filter(n=>content.contains(n.element)).sort((a,b)=>a.order-b.order);
    if(!nodes.every((n,i)=>n.element===hs[i]))return result;
    this.toc=remap(this.toc,nodes,b);
    return result;
  }
  Object.defineProperty(pageProto,'toc',{...tocDescriptor,get:getToc});
  try {Object.defineProperty(sheetProto,'_onRender',{...renderDescriptor,value:onRender});}
  catch(error){Object.defineProperty(pageProto,'toc',tocDescriptor);throw error;}
  const dispose=()=>{active=false;if(Object.getOwnPropertyDescriptor(pageProto,'toc')?.get===getToc)Object.defineProperty(pageProto,'toc',tocDescriptor);if(sheetProto._onRender===onRender)Object.defineProperty(sheetProto,'_onRender',renderDescriptor);};
  dispose.isActive=()=>active;
  return dispose;
}
