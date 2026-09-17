const normalized = value => value ?? null;
const BOB_PACK_PREFIX = 'pf2e-bastion-of-blasphemies.';
const sourcePattern = /^<p>@Localize\[([\w.]+)\]<\/p>$/;

/** Translate only exact approved whole-body display inputs; never mutate documents. */
export function installBobLocalizeDisplay({TextEditorClass, ItemClass, ActorClass, bindings, isEnabled, getUser}) {
  if ([TextEditorClass, ItemClass, ActorClass, isEnabled, getUser].some(value => typeof value !== 'function') || !Array.isArray(bindings)) {
    throw new Error('BoB wholeLocalize requires native classes, gates and approved bindings.');
  }
  const own = Object.getOwnPropertyDescriptor(TextEditorClass, 'enrichHTML');
  let owner = TextEditorClass;
  while (owner && !Object.hasOwn(owner, 'enrichHTML')) owner = Object.getPrototypeOf(owner);
  const descriptor = owner && Object.getOwnPropertyDescriptor(owner, 'enrichHTML');
  if (typeof descriptor?.value !== 'function' || own?.configurable === false) {
    throw new Error('Native PF2e enrichHTML consumer is unavailable.');
  }
  const rows = new Map();
  for (const binding of bindings) {
    const match = typeof binding.sourceBody === 'string' && binding.sourceBody.match(sourcePattern);
    if (!match || binding.normalizedBody !== `@Localize[${match[1]}]` || binding.approved !== true
      || !/^[a-f0-9]{64}$/.test(binding.sourceSha256 ?? '') || !/^[a-f0-9]{64}$/.test(binding.approvalSha256 ?? '')
      || ['actorId','actorType','actorName','itemId','itemType','itemName','displayBody','itemRulesJSON'].some(key => typeof binding[key] !== 'string' || !binding[key])
      || !Array.isArray(JSON.parse(binding.itemRulesJSON)) || binding.displayBody.includes('@Localize[')) {
      throw new Error('Invalid BoB wholeLocalize approval binding.');
    }
    const key = `${binding.actorId}/${binding.itemId}`;
    if (rows.has(key)) throw new Error(`Duplicate BoB wholeLocalize binding: ${key}`);
    rows.set(key, Object.freeze({...binding}));
  }
  let active = true;
  function resolve(text, options) {
    if (!active || !isEnabled() || typeof text !== 'string' || !options || typeof options !== 'object'
      || Array.isArray(options) || typeof options.rollData === 'function') return null;
    const data = options.rollData, relative = options.relativeTo;
    const item = data?.item instanceof ItemClass ? data.item : relative instanceof ItemClass ? relative : null;
    const actor = item?.actor;
    if (!(item instanceof ItemClass) || !(actor instanceof ActorClass) || actor.isToken !== false
      || actor.parent != null || item.parent !== actor || actor.items?.get(item.id) !== item
      || data?.item != null && data.item !== item || data?.actor != null && data.actor !== actor
      || relative != null && relative !== item && relative !== actor) return null;
    if ([item.pack, actor.pack].some(pack => pack && !pack.startsWith(BOB_PACK_PREFIX))) return null;
    const row = rows.get(`${actor.id}/${item.id}`), source = item._source, actorSource = actor._source;
    if (!row || text !== row.sourceBody && text !== row.normalizedBody
      || actorSource?._id !== row.actorId || actor.type !== row.actorType || actorSource.type !== row.actorType
      || actor.name !== row.actorName || actorSource.name !== row.actorName
      || normalized(actorSource.folder) !== normalized(row.actorFolderId)
      || normalized(actorSource._stats?.compendiumSource) !== normalized(row.actorSourceUuid)
      || source?._id !== row.itemId || item.type !== row.itemType || source.type !== row.itemType
      || item.name !== row.itemName || source.name !== row.itemName
      || normalized(source.folder) !== normalized(row.itemFolderId)
      || normalized(source._stats?.compendiumSource) !== normalized(row.itemSourceUuid)
      || normalized(source.system?.slug) !== normalized(row.itemSlug) || normalized(item.system?.slug) !== normalized(row.itemSlug)
      || source.system?.description?.value !== row.sourceBody || item.system?.description?.value !== row.sourceBody
      || JSON.stringify(source.system?.rules) !== row.itemRulesJSON) return null;
    return {row, item, actor};
  }
  function permissionSnapshot(actor) {
    const user = getUser();
    return user ? [user, user.id, user.isGM, user.role, actor.isOwner, actor.hasPlayerOwner] : null;
  }
  const native = descriptor.value;
  const wrapped = async function (...args) {
    const [text, options = {}] = args, binding = resolve(text, options);
    const permission = binding && permissionSnapshot(binding.actor);
    if (!binding || !permission) return Reflect.apply(native, this, args);
    const invoke = input => Reflect.apply(native, this, [input, {...options}, ...args.slice(2)]);
    const rendered = await invoke(binding.row.displayBody);
    const current = resolve(text, options), now = current && permissionSnapshot(current.actor);
    if (current?.row === binding.row && current.item === binding.item && current.actor === binding.actor
      && now && permission.every((value, index) => Object.is(value, now[index]))) return rendered;
    // Native mutates default options. A fresh copy re-evaluates defaults for the
    // current user if permission/language/source changed while enrichment waited.
    return invoke(text);
  };
  Object.defineProperty(TextEditorClass, 'enrichHTML', {...descriptor, configurable:true, value:wrapped});
  const dispose = () => {
    active = false;
    if (Object.getOwnPropertyDescriptor(TextEditorClass, 'enrichHTML')?.value === wrapped) {
      if (own) Object.defineProperty(TextEditorClass, 'enrichHTML', own);
      else delete TextEditorClass.enrichHTML;
    }
  };
  dispose.isActive = () => active;
  return dispose;
}
