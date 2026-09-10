/** Bounded display compatibility: Legends 2.2 / Foundry 14.367 / PF2e 8.5.0.
 * Startup ESM; no persistent settings/chat/Actor writes and no global API wrappers.
 * HC11 intentionally also matches approved Basic/manual complete same-text messages.
 */
const MODULE = 'battlezoo-eldamon-legends-pf2e';
const EXTRA = 'pf2e-compendium-extra-cn';
const EN_SUFFIX = " created. Remember to equip the eldamon's Innate Defenses armor item from their inventory tab.";
const CN_SUFFIX = '。请记得在物品栏中为这只爱达梦装备“内在防御”护甲物品。';
const SOURCE = Object.freeze({
  api: 'b8690e9f3858c460a9ea42ea45e31d8dee00530214de7ceb89ddf4d2127b420f',
  appRender: '96cdd6d13cb279e53bc10282b1bf2e41e896fea1271fe934ab1c214516ff4eaa',
  appInner: '9eba2f6a82426e331e65625f8f1531c73c867f4c044d42166130c1b462552f47',
  dialogData: '77c206910ca1590b6ea2008a287a2594035f1e488241dcd032009d88d16cc34e',
  dialogListeners: 'fa47bd14a64e2ec276d5aa29c1f51aab77d6480bd2edf5f9c54ef357ed04fb24',
  dialogSubmit: '96ec7ce57b3b42a3ac483ac87156d5be930d237bd254d2a7705ab81fa350f08b',
  chatNative: '5899ae055bb4ac54d44a232edc49a58bf90101afb1dfaddefb51cb539af06847',
  chatPF2: '298b1fbb292fda6bce3450708cda6816e3ae1ee6a86b477ce1e9af9d707374ae'
});

// Synchronous SHA-256 avoids an asynchronous gap in the API call/instance observation.
// It hashes function source identity, not user text or permissions. No paid source embedded.
function sha256(text) {
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
const hashes = new WeakMap();
const functionText = Function.prototype.toString;
function exact(fn, key) {
  if (typeof fn !== 'function') return false;
  if (!hashes.has(fn)) hashes.set(fn, sha256(functionText.call(fn).replace(/\r\n?/g, '\n')));
  return hashes.get(fn) === SOURCE[key];
}
function ownValue(object, key) {
  if (!object) return undefined;
  const d = Object.getOwnPropertyDescriptor(object, key);
  return d && 'value' in d ? d.value : undefined;
}
function allowed() {
  try {
    const g = globalThis.game, m = g?.modules?.get(MODULE);
    return g?.system?.id === 'pf2e' && g.system.version === '8.5.0'
      && g.release?.generation === 14 && g.release.build === 367
      && m?.active === true && m.version === '2.2'
      && g.modules.get(EXTRA)?.active === true && g.i18n?.lang === 'cn'
      && g.settings.get('babele', 'loadingMode') === 'full';
  } catch { return false; }
}
// Resolve the method that would actually run, without executing a foreign getter.
function effectiveMethod(object, key) {
  for (let current = object; current; current = Object.getPrototypeOf(current)) {
    const descriptor = Object.getOwnPropertyDescriptor(current, key);
    if (descriptor) return 'value' in descriptor ? descriptor.value : undefined;
  }
}
function nativeDialogChain(app) {
  try {
    const A = globalThis.foundry?.appv1?.api?.Application?.prototype;
    const D = globalThis.Dialog?.prototype;
    const methods = [
      ['render', ownValue(A,'render'), 'appRender'],
      ['_render', ownValue(A,'_render'), 'appInner'],
      ['getData', ownValue(D,'getData'), 'dialogData'],
      ['activateListeners', ownValue(D,'activateListeners'), 'dialogListeners'],
      ['submit', ownValue(D,'submit'), 'dialogSubmit']
    ];
    return methods.every(([key, original, fingerprint]) => exact(original, fingerprint)
      && effectiveMethod(D, key) === original
      && (app === undefined || effectiveMethod(app, key) === original));
  } catch { return false; }
}

let entry;
const claimed = new WeakSet();
const claims = new WeakMap();
function ownedEntry() {
  return entry && game.modules.get(MODULE)?.api === entry.api
    && ownValue(entry.api,'eldamonDialog') === entry.wrapper;
}
function metadataMatches(app) {
  const data = app?.data;
  return app instanceof Dialog && Object.getPrototypeOf(app) === Dialog.prototype
    && app.options?.jQuery === false && data?.title === 'Create an eldamon!' && data.default === 'yes'
    && Object.keys(data).sort().join(',') === 'buttons,content,default,title'
    && Object.keys(data.buttons ?? {}).sort().join(',') === 'no,yes'
    && data.buttons.no.label === 'Cancel' && data.buttons.yes.label === 'Create eldamon'
    && typeof data.buttons.yes.callback === 'function' && !data.buttons.no.callback;
}
function installEntry() {
  if (entry || !allowed() || !nativeDialogChain()) return;
  const api = ownValue(game.modules.get(MODULE),'api');
  const descriptor = api && Object.getOwnPropertyDescriptor(api,'eldamonDialog');
  if (!descriptor || !('value' in descriptor) || !descriptor.writable || !exact(descriptor.value,'api')) return;
  const original = descriptor.value;
  // Not async: original value/Promise/throw, this, arity and arguments pass through unchanged.
  function eldamonDisplayObserver(...args) {
    let before;
    try {
      if (ownedEntry() && allowed() && nativeDialogChain() && !game.modules.get('battlezoo-eldamon-pf2e')?.active) {
        before = new Set(Object.values(ui.windows));
      }
    } catch { /* Observation failure must never prevent the original call. */ }
    const value = Reflect.apply(original, this, args);
    if (before) {
      try {
        const added = Object.values(ui.windows).filter(app => !before.has(app));
        if (added.length === 1 && ownedEntry() && allowed() && nativeDialogChain(added[0]) && metadataMatches(added[0])) {
          const app = added[0];
          claimed.add(app); claims.set(app, {data:app.data, callback:app.data.buttons.yes.callback});
        }
      } catch { /* Keep the original result even if observation fails. */ }
    }
    return value;
  }
  Object.defineProperty(api,'eldamonDialog',{...descriptor,value:eldamonDisplayObserver});
  entry = {api, wrapper:eldamonDisplayObserver};
}

function settingDisplay(_app, context) {
  if (!allowed()) return;
  const setting = game.settings.settings.get(MODULE+'.introPopUp');
  if (setting?.namespace !== MODULE || setting.key !== 'introPopUp' || setting.type !== Boolean
    || setting.scope !== 'client' || setting.config !== true || setting.default !== true) return;
  const matches = context?.categories?.[MODULE]?.entries?.filter(e=>e.field?.name === MODULE+'.introPopUp');
  if (matches?.length !== 1) return;
  const field = matches[0].field;
  if (Object.getPrototypeOf(field) !== foundry.data.fields.BooleanField.prototype || field === setting.type) return;
  const label = Object.getOwnPropertyDescriptor(field,'label');
  if (label && 'value' in label && label.writable && label.value === 'Intro Pop-Up') field.label = '介绍弹窗';
}

function one(root, selector) {
  const nodes = root.querySelectorAll(selector);
  return nodes.length === 1 ? nodes[0] : null;
}
function textEdit(node, before, after, edits) {
  if (!node || node.nodeType !== Node.TEXT_NODE || node.data.trim() !== before) return false;
  edits.push([node,node.data.replace(before,after)]);return true;
}
function plainText(element, before, after, edits) {
  return element?.childNodes.length === 1 && textEdit(element.firstChild,before,after,edits);
}
function dialogDisplay(app, html) {
  if (!claimed.has(app) || !ownedEntry() || !allowed() || !nativeDialogChain(app)
    || game.modules.get('battlezoo-eldamon-pf2e')?.active || !metadataMatches(app)) return;
  const claim = claims.get(app);
  if (claim.data !== app.data || claim.callback !== app.data.buttons.yes.callback) return;
  const root = html?.[0];
  if (!(root instanceof HTMLElement) || app.element?.[0] !== root) return;
  const form = one(root,'.dialog-content > form'), edits=[];
  if (!form || form.querySelectorAll('input').length !== 4 || form.querySelectorAll('select').length !== 1
    || form.querySelectorAll('label').length !== 5 || form.querySelectorAll('br').length !== 9) return;
  const nickname=one(form,'input#nickname[name="nickname"][type="text"]');
  const level=one(form,'input#level[name="level"][type="number"][min="1"][max="20"]');
  const species=one(form,'select[name="species"]');
  if (!nickname || !level || !species || !one(form,'input[name="defaultImage"][type="checkbox"]')
    || !one(form,'input[name="defaultPowers"][type="checkbox"]')) return;
  const label=one(form,'label[for="nickname"]'), speciesLabel=species.parentElement;
  if (label?.childNodes.length !== 3 || label.childNodes[1].nodeName !== 'BR'
    || speciesLabel?.tagName !== 'LABEL' || speciesLabel.childNodes.length !== 3 || speciesLabel.childNodes[1] !== species
    || species.options[0]?.value !== '' || species.options[0]?.childNodes.length !== 1) return;
  if (!textEdit(label.firstChild,'Give this eldamon a nickname?','给这只爱达梦起个昵称？',edits)
    || !textEdit(label.lastChild,'(Leave blank to use default name)','（留空则使用默认名称）',edits)
    || !plainText(one(form,'label[for="level"]'),'Level:','等级：',edits)
    || !textEdit(speciesLabel.firstChild,'Select your eldamon species','选择爱达梦的种类',edits)
    || !plainText(species.options[0],'Make a selection','请选择',edits)
    || !plainText(one(form,'label[for="defaultImage"]'),'Use default artwork?','使用默认图像？',edits)
    || !plainText(one(form,'label[for="defaultPower"]'),'Use default powers for the eldamon level?','使用该等级爱达梦的默认威能？',edits)
    || !plainText(one(root,'.window-title'),'Create an eldamon!','创建一只爱达梦！',edits)
    || !plainText(one(root,'.dialog-button[data-button="no"]'),'Cancel','取消',edits)
    || !plainText(one(root,'.dialog-button[data-button="yes"]'),'Create eldamon','创建爱达梦',edits)) return;
  for (const [node,value] of edits) node.data=value;
}

function chatDisplay(message, root) {
  if (!allowed() || !message?.visible || !message.isContentVisible || message.blind || message.isRoll
    || !Array.isArray(message.rolls) || message.rolls.length || typeof message.system?.renderHTML === 'function') return;
  const C=globalThis.CONFIG?.ChatMessage?.documentClass;
  if (!C || Object.getPrototypeOf(message) !== C.prototype || !exact(C.prototype.renderHTML,'chatPF2')
    || !exact(Object.getPrototypeOf(C.prototype)?.renderHTML,'chatNative')
    || CONFIG.ChatMessage.template !== 'templates/sidebar/chat-message.hbs') return;
  if (!(root instanceof HTMLElement) || !root.matches('li.chat-message.message') || root.dataset.messageId !== message.id) return;
  const content=one(root,'.message-content');
  if (!content || content.parentElement !== root) return;
  const children=[...content.childNodes].filter(n=>n.nodeType!==Node.TEXT_NODE || n.data.trim());
  if (children.length!==1 || children[0].nodeName!=='P') return;
  const paragraph=children[0], tail=paragraph.lastChild;
  if (!tail || tail.nodeType!==Node.TEXT_NODE || !tail.data.endsWith(EN_SUFFIX)) return;
  const allText=paragraph.textContent;
  if (allText.split(EN_SUFFIX).length!==2 || !allText.slice(0,-EN_SUFFIX.length).trim()) return;
  // Restrict to ordinary inline nickname DOM. Preserve approved links/roll spans in place.
  const safeTags=new Set(['P','A','BR','SPAN','B','STRONG','I','EM','U','S','SMALL','SUB','SUP']);
  for (const element of [paragraph,...paragraph.querySelectorAll('*')]) {
    if (!safeTags.has(element.tagName) || element.hasAttribute('hidden') || element.hasAttribute('inert')
      || element.hasAttribute('aria-hidden') || element.hasAttribute('style') || element.hasAttribute('data-visibility')
      || element.classList.contains('secret') || element.classList.contains('hidden') || element.classList.contains('hidden-to-others')) return;
  }
  const walk=document.createTreeWalker(paragraph,NodeFilter.SHOW_COMMENT);
  if (walk.nextNode()) return;
  tail.data=tail.data.slice(0,-EN_SUFFIX.length)+CN_SUFFIX;
  paragraph.insertBefore(document.createTextNode('已创建'),paragraph.firstChild);
}

const token=Symbol.for('pf2e-compendium-extra-cn.legends-display.2.2.v1');
// Any existing ownership marker (including foreign) wins; never reclaim/stack registration.
function registerDisplayHooks() {
 const extra=globalThis.game?.modules?.get(EXTRA);
 if (extra && Object.isExtensible(extra) && !Object.prototype.hasOwnProperty.call(extra,token)) {
  Object.defineProperty(extra,token,{value:true});
  Hooks.on('i18nInit',installEntry);
  Hooks.on('setup',installEntry);
  Hooks.on('preRenderSettingsConfig',settingDisplay);
  Hooks.on('renderDialog',dialogDisplay);
  Hooks.on('renderChatMessageHTML',chatDisplay);
 }
}
// Foundry loads package ESMs before constructing game.modules. The init retry
// registers before i18nInit/setup; the ownership marker keeps both paths idempotent.
registerDisplayHooks();
Hooks.once('init',registerDisplayHooks);
