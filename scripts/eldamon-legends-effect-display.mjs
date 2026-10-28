/** Pelagic Pressure's prepared name is mechanical when its slug is null. Project only final DOM. */
export const ELDAMON_EFFECT_DISPLAY = Object.freeze({
  sourceId:'Compendium.battlezoo-eldamon-legends-pf2e.pf2e-effects.Item.S7p5yXf4BzSujMrL',
  ruleIndex:2,
  rule:{key:'ItemAlteration',itemId:'{item|id}',property:'name',mode:'override',
    predicate:[{not:'self:signature:{item|origin.signature}'}],value:'Effect: Pelagic Pressure'},
  nativeName:'Effect: Pelagic Pressure',
  translation:'效果：深海重压 Effect: Pelagic Pressure'
});
const binding = ELDAMON_EFFECT_DISPLAY;
const stable = value => JSON.stringify(value, (_key, entry) => entry && typeof entry === 'object' && !Array.isArray(entry)
  ? Object.fromEntries(Object.keys(entry).sort().map(key => [key,entry[key]])) : entry);
const ruleSource = stable(binding.rule);
const installations = new WeakMap();
const hidden = 'input,textarea,[contenteditable]:not([contenteditable="false"]),[hidden],[inert],[aria-hidden="true"],.secret,.hidden-to-others';
const one = (root, selector) => {
  const matches = root.querySelectorAll(selector);
  return matches.length === 1 ? matches[0] : null;
};

function translateName(title) {
  if (!title || title.closest(hidden)) return false;
  const text = [...title.childNodes].filter(node => node.nodeType === 3 && node.data.trim());
  if (text.length !== 1 || text[0].data.trim() !== binding.nativeName) return false;
  text[0].data = text[0].data.replace(binding.nativeName,binding.translation);
  return true;
}
function translateImage(image) {
  if (image && !image.closest(hidden) && image.getAttribute('alt') === binding.nativeName) {
    image.setAttribute('alt',binding.translation);
  }
}

export function installEldamonEffectDisplay({
  Hooks=globalThis.Hooks, getGame=()=>globalThis.game,
  ItemClass=globalThis.CONFIG?.Item?.documentClass, ActorClass=globalThis.CONFIG?.Actor?.documentClass,
  ChatMessageClass=globalThis.CONFIG?.ChatMessage?.documentClass, HTMLElementClass=globalThis.HTMLElement,
  tooltip=getGame()?.tooltip, resolveUuid=globalThis.fromUuidSync,
  getPanelActor=()=>globalThis.canvas?.tokens?.controlled?.at(0)?.document?.actor ?? getGame()?.user?.character
} = {}) {
  if (installations.has(Hooks)) return installations.get(Hooks);
  if (!Hooks || ![ItemClass,ActorClass,ChatMessageClass,HTMLElementClass,resolveUuid].every(value=>typeof value==='function')) return null;
  function enabled() {
    try {
      const game=getGame();
      return game.system?.id==='pf2e' && game.i18n?.lang==='cn'
        && ['babele','battlezoo-eldamon-legends-pf2e','pf2e-compendium-extra-cn'].every(id=>game.modules.get(id)?.active===true)
        && ['full','ondemand'].includes(game.settings.get('babele','loadingMode'));
    } catch { return false; }
  }
  if (!enabled()) return null;
  function matches(item) {
    if (!enabled() || !(item instanceof ItemClass)) return false;
    const actor=item.actor, source=item._source, user=getGame().user;
    return actor instanceof ActorClass && item.parent===actor && actor.items.get(item.id)===item
      && source?._id===item.id && item.type==='effect' && source.type==='effect'
      && source._stats?.compendiumSource===binding.sourceId && item.name===binding.nativeName
      && source.system?.slug===null && item.system?.slug===null
      && stable(source.system.rules?.[binding.ruleIndex])===ruleSource
      && !!user && actor.testUserPermission(user,'OBSERVER') && (user.isGM || item.isIdentified===true);
  }
  const element = value => value instanceof HTMLElementClass ? value : value?.[0];
  function actorSheet(app, html) {
    const root=element(html), actor=app.actor;
    if (!(root instanceof HTMLElementClass) || element(app.element)!==root || !(actor instanceof ActorClass)) return;
    for (const row of root.querySelectorAll('li.effects[data-item-type="effect"][data-item-id]')) {
      const item=actor.items.get(row.dataset.itemId);
      if (!matches(item) || row.closest(hidden)) continue;
      const title=one(row,':scope > .item-name > h4.action-name > a[data-action="toggle-summary"]');
      if (translateName(title)) translateImage(one(row,':scope > .item-name > a.item-image > img'));
    }
  }
  function chat(message, root) {
    if (!(message instanceof ChatMessageClass) || !message.visible || !message.isContentVisible || message.blind
      || message.isRoll || !Array.isArray(message.rolls) || message.rolls.length
      || !(root instanceof HTMLElementClass) || !root.matches('li.chat-message.message')
      || root.dataset.messageId!==message.id) return;
    const item=message.item;
    if (!matches(item) || message.speakerActor!==item.actor) return;
    const card=one(root,'.message-content > .pf2e.chat-card.item-card');
    if (!card || card.dataset.itemId!==item.id || card.dataset.actorId!==item.actor.id || card.closest(hidden)) return;
    if (translateName(one(card,':scope > header.card-header > h3'))) {
      translateImage(one(card,':scope > header.card-header > img'));
    }
  }
  function tooltipDisplay(target, options) {
    const html=options?.html, panel=getGame()?.pf2e?.effectPanel?.element;
    if (!enabled() || options?.cssClass!=='pf2e effect-info application' || options.locked!==true || options.direction!=='LEFT'
      || Object.keys(options).sort().join(',')!=='cssClass,direction,html,locked'
      || !(target instanceof HTMLElementClass) || !target.matches('.effect-item[data-item-id]') || !target.isConnected
      || !(html instanceof HTMLElementClass) || !html.matches('.content[data-item-uuid]')
      || !(panel instanceof HTMLElementClass) || !panel.contains(target) || target.closest(hidden)) return;
    // PF2e has finished its asynchronous template render and attached the native button listeners here.
    const item=resolveUuid(html.dataset.itemUuid);
    if (!matches(item) || item.uuid!==html.dataset.itemUuid || target.dataset.itemId!==item.id || getPanelActor()!==item.actor) return;
    translateName(one(html,':scope > h1'));
  }

  const adapter={actorSheet,chat,tooltipInstalled:false};
  Hooks.on('renderActorSheet',actorSheet);
  Hooks.on('renderChatMessageHTML',chat);
  let owner=tooltip;
  while (owner && !Object.hasOwn(owner,'activate')) owner=Object.getPrototypeOf(owner);
  const descriptor=owner && Object.getOwnPropertyDescriptor(owner,'activate');
  if (tooltip && Object.isExtensible(tooltip) && typeof descriptor?.value==='function' && descriptor.writable) {
    const original=descriptor.value;
    function activate(...args) {
      if (this===tooltip) {
        try { tooltipDisplay(args[0],args[1]); }
        catch { /* A display-only check must not prevent native tooltip activation. */ }
      }
      return Reflect.apply(original,this,args);
    }
    Object.defineProperty(tooltip,'activate',{...descriptor,value:activate});
    adapter.tooltipInstalled=true;
  }
  installations.set(Hooks,adapter);
  return adapter;
}

globalThis.Hooks?.once('ready',()=>installEldamonEffectDisplay());
