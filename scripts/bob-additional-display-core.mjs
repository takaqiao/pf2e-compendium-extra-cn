/** Review-only, exact-carrier display projection. Never writes a Document or rule. */
import {prepareSyntheticIdentity} from './bob-additional-synthetic-identity.mjs';
const CHINESE = new Set(['cn', 'zh-CN', 'zh-Hans']);
const SHA = /^[0-9a-f]{64}$/;
const own = (o, key) => Object.prototype.hasOwnProperty.call(o, key);
const nil = value => value ?? null;
const allowedPack = document => !document.pack || document.pack.startsWith('pf2e-bastion-of-blasphemies.');

function compile(bindings) {
  if (!Array.isArray(bindings) || !bindings.length) throw new TypeError('Approved bindings required');
  const index = new Map();
  for (const raw of bindings) {
    if (!raw || raw.approved !== true || !SHA.test(raw.sourceSha256) || !SHA.test(raw.approvalSha256)
        || !SHA.test(raw.actorNameApprovalSha256) || !SHA.test(raw.itemNameApprovalSha256)
        || ![raw.actorId, raw.actorType, raw.actorName, raw.itemId, raw.itemType, raw.itemName, raw.key, raw.displayFragment].every(v => typeof v === 'string' && v)
        || !/^PF2E\.NPC\.Abilities\.Glossary\.\w+$/.test(raw.key)
        || raw.displayFragment.includes('@Localize[') || !Array.isArray(raw.forms) || !raw.forms.length
        || typeof raw.itemRulesJSON !== 'string' || !Array.isArray(JSON.parse(raw.itemRulesJSON))) throw new TypeError('Invalid approved display binding');
    const token = `@Localize[${raw.key}]`, paragraph = `<p>${token}</p>`;
    const forms = raw.forms.map(form => {
      if (!form || typeof form.source !== 'string' || typeof form.display !== 'string'
          || form.source.split(token).length !== 2 || form.source.split('@Localize[').length !== 2
          || form.source.split(paragraph).length !== 2
          || form.display !== form.source.replace(paragraph, raw.displayFragment)) throw new TypeError('Invalid complete carrier projection');
      return Object.freeze({source: form.source, display: form.display});
    });
    if (new Set(forms.map(f => f.source)).size !== forms.length
        || (raw.normalizedBody !== null && (raw.normalizedBody !== token || !forms.every(f => f.source === paragraph)))) throw new TypeError('Invalid normalized carrier');
    const key = `${raw.actorId}/${raw.itemId}`;
    if (index.has(key)) throw new TypeError('Duplicate Actor/Item binding');
    index.set(key, Object.freeze({...raw, forms: Object.freeze(forms)}));
  }
  return index;
}

export function installBobAdditionalDisplay({TextEditorClass, ItemClass, ActorClass, bindings, isEnabled, getLocale, getUser,
  syntheticBindings = [], SceneClass, TokenDocumentClass, ActorDeltaClass, getActors, getScenes}) {
  const descriptor = Object.getOwnPropertyDescriptor(TextEditorClass, 'enrichHTML');
  if (!descriptor || typeof descriptor.value !== 'function' || typeof ItemClass !== 'function' || typeof ActorClass !== 'function'
      || typeof isEnabled !== 'function' || typeof getLocale !== 'function' || typeof getUser !== 'function') throw new TypeError('Native consumer dependencies required');
  const original = descriptor.value, index = compile(bindings);
  const synthetic = prepareSyntheticIdentity({syntheticBindings, ActorClass, ItemClass, SceneClass, TokenDocumentClass, ActorDeltaClass, getActors, getScenes});
  let active = true;

  function resolve(text, options) {
    if (!active || !isEnabled() || !CHINESE.has(getLocale()) || typeof text !== 'string'
        || !options || typeof options !== 'object' || Array.isArray(options) || typeof options.rollData === 'function') return null;
    const data = options.rollData;
    if (data != null && (typeof data !== 'object' || Array.isArray(data))) return null;
    const item = data?.item ?? options.relativeTo;
    if (!(item instanceof ItemClass)) return null;
    const actor = item.actor;
    if (!(actor instanceof ActorClass) || item.parent !== actor
        || !actor.items || actor.items.get?.(item.id) !== item || !allowedPack(actor) || !allowedPack(item)
        || actor.visible === false || item.visible === false
        || (data && own(data, 'item') && data.item !== item) || (data && own(data, 'actor') && data.actor !== actor)
        || (options.relativeTo != null && options.relativeTo !== item && options.relativeTo !== actor)) return null;
    const row = index.get(`${actor.id}/${item.id}`), as = actor._source, source = item._source;
    if (!row) return null;
    const chain = actor.isToken === true ? synthetic.resolve(actor, item, row) : null;
    if (actor.isToken === true ? !chain : (actor.isToken !== false || actor.parent != null || !actor.collection || actor.collection.get?.(actor.id) !== actor)) return null;
    const expectedActorName = chain?.syntheticName ?? row.actorName;
    if (!row || !as || !source || !source.system || !item.system
        || as._id !== row.actorId || actor.type !== row.actorType || as.type !== row.actorType
        || actor.name !== expectedActorName || as.name !== expectedActorName
        || nil(as.folder) !== row.actorFolderId || nil(as._stats?.compendiumSource) !== row.actorSourceUuid
        || source._id !== row.itemId || item.type !== row.itemType || source.type !== row.itemType
        || item.name !== row.itemName || source.name !== row.itemName
        || nil(source.folder) !== row.itemFolderId || nil(source._stats?.compendiumSource) !== row.itemSourceUuid
        || nil(source.system.slug) !== row.itemSlug || nil(item.system.slug) !== row.itemSlug
        || JSON.stringify(source.system.rules) !== row.itemRulesJSON) return null;
    const body = source.system.description?.value;
    if (item.system.description?.value !== body) return null;
    const form = row.forms.find(form => form.source === body);
    if (!form || (text !== body && text !== row.normalizedBody)) return null;
    return {row, form, actor, item, actorCollection: actor.collection, itemCollection: actor.items,
      actorSource: as, itemSource: source, actorSystem: actor.system, itemSystem: item.system, ...chain};
  }

  function authority(context) {
    const user = getUser();
    return [user, user?.id, user?.role, user?.isGM, user?.active, getLocale(),
      context.actor.isOwner, context.actor.hasPlayerOwner, context.actor.permission, context.actor.visible,
      context.item.isOwner, context.item.permission, context.item.visible,
      context.baseActor?.isOwner, context.baseActor?.permission, context.baseActor?.visible,
      context.baseItem?.permission, context.baseItem?.visible, context.scene?.permission, context.scene?.visible,
      context.token?.permission, context.token?.visible];
  }

  const visibilityOptions = options => [options.secrets, options.processVisibility, options.rollData, options.relativeTo];

  const wrapped = async function(text, options = {}, ...rest) {
    const context = resolve(text, options);
    if (!context) return Reflect.apply(original, this, [text, options, ...rest]);
    const permission = authority(context);
    const inputOptions = visibilityOptions(options);
    const result = await Reflect.apply(original, this, [context.form.display, {...options}, ...rest]);
    const fresh = resolve(text, options);
    const stable = fresh && Object.keys(context).every(key => fresh[key] === context[key])
      && authority(fresh).every((value, i) => Object.is(value, permission[i]))
      && visibilityOptions(options).every((value, i) => Object.is(value, inputOptions[i]));
    if (stable) return result;
    // Fresh native defaults observe the current user; no stale secrets option is carried from the projected invocation.
    return Reflect.apply(original, this, [text, {...options}, ...rest]);
  };
  Object.defineProperty(TextEditorClass, 'enrichHTML', {...descriptor, value: wrapped});
  const dispose = () => {
    active = false;
    if (TextEditorClass.enrichHTML === wrapped) Object.defineProperty(TextEditorClass, 'enrichHTML', descriptor);
  };
  dispose.isActive = () => active && isEnabled() && CHINESE.has(getLocale());
  return dispose;
}
