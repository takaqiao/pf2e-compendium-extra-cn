/** Team+ Remastered display only; no document/settings/CONFIG writes or callback execution. */
import data from './team-plus-presentation-data.mjs';
import {createPresentationAdapter} from './team-plus-presentation-adapter.mjs';
const KEY=Symbol.for('pf2e-compendium-extra-cn.team-plus-display');
function install() {if(!globalThis[KEY]) {
 const adapter=createPresentationAdapter({game:globalThis.game,data});
 globalThis[KEY]=adapter;
 const safe=fn=>(...args)=>{try {Promise.resolve(fn(...args)).catch(e=>adapter.diagnostics.failures.push(String(e)));}catch(e){adapter.diagnostics.failures.push(String(e));}};
 Hooks.on('getItemSheetPF2eHeaderButtons',safe(adapter.headerButtons));
 Hooks.on('renderItemSheetPF2e',safe(adapter.itemSheet));
 Hooks.on('renderCharacterSheetPF2e',safe(adapter.actorSheet));
 Hooks.on('renderApplication',safe(adapter.application));
 Hooks.on('renderApplicationV2',safe(adapter.application));
 Hooks.on('renderChatMessageHTML',safe(adapter.chat));
 Hooks.once('ready',safe(async()=>{
  await adapter.verifySources();adapter.installNotifications();
  // Catch sheets/messages rendered while the audited module source was being checked.
  const apps=new Set([...Object.values(globalThis.ui?.windows??{}),...(globalThis.foundry?.applications?.instances?.values()??[])]);
  for(const app of apps)if(app.element){
   if(app.item)await adapter.itemSheet(app,app.element);
   else if(app.actor)await adapter.actorSheet(app,app.element);
   await adapter.application(app,app.element);
  }
  for(const root of document.querySelectorAll('li.message[data-message-id]')){
   const message=game.messages?.get(root.dataset.messageId);if(message)await adapter.chat(message,root);
  }
 }));
}}
Hooks.once('init',install);
