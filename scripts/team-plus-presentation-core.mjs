/** Pure presentation helpers. Never receive a writable document API. */
const VISIBLE = new Set(['title','alt','aria-label','data-tooltip']);
const UNSAFE = 'input,textarea,script,style,prose-mirror,.ProseMirror,[contenteditable]:not([contenteditable="false"]),option:not([value])';
const norm=s=>s.replace(/\s+/g,' ').trim();
function editable(node) {return !!node.parentElement?.closest(UNSAFE);}
function fragment(html) {const t=document.createElement('template');t.innerHTML=html;return t.content;}
function children(node) {return [...node.childNodes];}
function trimBoundary(nodes) {
 while(nodes[0]?.nodeType===3&&!norm(nodes[0].data))nodes.shift();
 while(nodes.at(-1)?.nodeType===3&&!norm(nodes.at(-1).data))nodes.pop();
 return nodes;
}
function planNode(live,before,after,changes) {
 if(live.nodeType!==before.nodeType||before.nodeType!==after.nodeType)return false;
 if(before.nodeType===3){
  if(editable(live)||norm(live.data)!==norm(before.data))return false;
  if(before.data!==after.data)changes.push(()=>{live.data=after.data});return true;
 }
 if(before.nodeType!==1)return live.isEqualNode(before)&&before.isEqualNode(after);
 if(live.tagName!==before.tagName||before.tagName!==after.tagName||live.matches(UNSAFE))return false;
 if(before.attributes.length!==after.attributes.length)return false;
 for(const a of before.attributes){
  const av=after.getAttribute(a.name);
  if(av===null||live.getAttribute(a.name)!==a.value)return false;
  if(av!==a.value){if(!VISIBLE.has(a.name))return false;changes.push(()=>live.setAttribute(a.name,av));}
 }
 const l=children(live),b=children(before),a=children(after);
 return l.length===b.length&&b.length===a.length&&b.every((x,i)=>planNode(l[i],x,a[i],changes));
}
/** Find one complete source fragment; commit only after every descendant matches. */
export function patchFragment(root,beforeHTML,afterHTML) {
 if(!root||typeof beforeHTML!=='string'||typeof afterHTML!=='string'||beforeHTML===afterHTML)return false;
 const before=trimBoundary(children(fragment(beforeHTML))),after=trimBoundary(children(fragment(afterHTML)));
 if(!before.length||before.length!==after.length)return false;
 for(const parent of [root,...root.querySelectorAll('*')]){
  if(parent.closest?.(UNSAFE))continue;
  const live=children(parent);
  for(let at=0;at+before.length<=live.length;at++){
   const changes=[];
   if(before.every((n,i)=>planNode(live[at+i],n,after[i],changes))){
    if(!changes.length)continue;for(const apply of changes)apply();return true;
   }
  }
 }
 return false;
}
/** Exact complete visible node/attribute; no attributes carrying identifiers or values. */
export function replaceText(root,before,after,{substring=false}={}) {
 if(!root||!before||before===after)return 0;let count=0;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 for(let n=walker.nextNode();n;n=walker.nextNode()){
  if(editable(n))continue;
  if(substring?n.data.includes(before):norm(n.data)===norm(before)){
   n.data=substring?n.data.replace(before,after):n.data.replace(n.data.trim(),after.trim());count++;
  }
 }
 for(const el of [root,...root.querySelectorAll('*')]){
  if(el.matches?.(UNSAFE)||el.closest?.(UNSAFE))continue;
  for(const a of VISIBLE)if(el.getAttribute?.(a)===before){el.setAttribute(a,after);count++;}
 }
 return count;
}
export function sourceUuid(item) {return item?._stats?.compendiumSource||item?._source?._stats?.compendiumSource||item?.uuid;}
export function dynamicCandidate(item,rows) {
 if(item?.flags?.['pf2e-team-plus-magic']?.mastered!==true)return null;
 const row=rows.find(r=>r.uuid===sourceUuid(item));if(!row)return null;
 const text=item.system?.description?.value;
 if(typeof text!=='string')return null;
 const hash=sha256(text);
 // Exact per-row fingerprints only; adapter callers also enforce the captured runtime profile.
 return hash===row.sha256||hash===row.nativeSha256?row:null;
}
const nameOverlays=new WeakMap();
/** A non-form visual overlay; underlying input, defaultValue and submission stay source. */
export function showInputName(input,before,after) {
 if(!input||input.tagName!=='INPUT'||input.value!==before||nameOverlays.has(input))return false;
 const wrapper=document.createElement('span'),label=document.createElement('span');
 wrapper.style.cssText='position:relative;display:block;flex:1;min-width:0';
 label.style.cssText='position:absolute;inset:0;display:flex;align-items:center;pointer-events:none;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;padding:0 3px';
 label.className='extra-team-plus-display-name';label.textContent=after;label.setAttribute('aria-hidden','true');
 input.before(wrapper);wrapper.append(input,label);
 const originalColor=input.style.color;
 const refresh=()=>{const showing=document.activeElement!==input&&input.value===before;label.hidden=!showing;label.style.display=showing?'flex':'none';input.style.color=showing?'transparent':originalColor;};
 input.addEventListener('focus',refresh);input.addEventListener('blur',refresh);input.addEventListener('input',refresh);refresh();
 nameOverlays.set(input,label);return true;
}
/** Materialize only approved literal substitutions. No eval or Function constructor. */
export function literals(text,values) {for(const [key,value] of Object.entries(values))text=text.split(key).join(String(value));return text;}

// SHA-256 reused from the existing extra display adapter.
export function sha256(text) {
  const bytes = new TextEncoder().encode(text), length = (bytes.length + 9 + 63) & ~63;
  const data = new Uint8Array(length); data.set(bytes); data[bytes.length] = 128;
  const view = new DataView(data.buffer); view.setUint32(length - 4, bytes.length * 8);
  const h = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const k = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const rotate = (n, r) => (n >>> r) | (n << (32 - r));
  const w = new Uint32Array(64);
  for (let block = 0; block < length; block += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(block + i * 4);
    for (let i = 16; i < 64; i++) {
      const a = w[i-15], b = w[i-2];
      w[i] = w[i-16] + (rotate(a,7)^rotate(a,18)^(a>>>3)) + w[i-7] + (rotate(b,17)^rotate(b,19)^(b>>>10));
    }
    let [a,b,c,d,e,f,g,z] = h;
    for (let i = 0; i < 64; i++) {
      const t1 = (z + (rotate(e,6)^rotate(e,11)^rotate(e,25)) + ((e&f)^(~e&g)) + k[i] + w[i]) | 0;
      const t2 = ((rotate(a,2)^rotate(a,13)^rotate(a,22)) + ((a&b)^(a&c)^(b&c))) | 0;
      z=g;g=f;f=e;e=(d+t1)|0;d=c;c=b;b=a;a=(t1+t2)|0;
    }
    for (const [i, v] of [a,b,c,d,e,f,g,z].entries()) h[i] = (h[i] + v) >>> 0;
  }
  return h.map(v=>v.toString(16).padStart(8,'0')).join('');
}
