/** Exact existing Token inheritance only. Does not materialize, prepare or mutate Documents. */
const nil = value => value ?? null;
const stable = value => JSON.stringify(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item)
  ? Object.fromEntries(Object.keys(item).filter(key => item[key] !== undefined).sort().map(key => [key, item[key]])) : item);
const equal = (a, b) => stable(a) === stable(b);
const allowedPack = doc => !doc.pack || doc.pack.startsWith('pf2e-bastion-of-blasphemies.');

function systemIdentity(source) {
  const result = structuredClone(source ?? {}), hp = result.attributes?.hp;
  if (hp) {
    for (const key of ['value', 'temp']) if (Object.hasOwn(hp, key)) {
      if (typeof hp[key] !== 'number' || !Number.isFinite(hp[key])) return null;
      delete hp[key];
    }
    if (!Object.keys(hp).length) delete result.attributes.hp;
    if (!Object.keys(result.attributes).length) delete result.attributes;
  }
  return result;
}
function deltaIdentity(source) {
  if (!source || !Array.isArray(source.items) || !Array.isArray(source.effects)) return null;
  const system = systemIdentity(source.system);
  // Native import tags embedded Delta Items with creation/update metadata.
  // Their approved content, provenance, rules and ownership remain exact.
  const items = structuredClone(source.items);
  for (const item of items) {
    if (item._tombstone === true) continue;
    const stats = item._stats;
    if (!stats || typeof stats !== 'object' || Array.isArray(stats)) return null;
    for (const key of ['createdTime', 'modifiedTime']) {
      if (!Object.hasOwn(stats, key) || stats[key] !== null
        && (!Number.isSafeInteger(stats[key]) || stats[key] < 0)) return null;
      delete stats[key];
    }
    if (!Object.hasOwn(stats, 'lastModifiedBy') || stats.lastModifiedBy !== null
      && (typeof stats.lastModifiedBy !== 'string' || !/^[A-Za-z0-9]{16}$/.test(stats.lastModifiedBy))) return null;
    delete stats.lastModifiedBy;
  }
  return system && {_id: source._id, name: nil(source.name), type: nil(source.type), img: nil(source.img),
    system, items, effects: source.effects, flags: source.flags ?? {}};
}

export function prepareSyntheticIdentity({syntheticBindings = [], ActorClass, ItemClass, SceneClass, TokenDocumentClass, ActorDeltaClass, getActors, getScenes}) {
  const rows = new Map();
  for (const raw of structuredClone(syntheticBindings)) {
    const key = `${raw.sceneId}/${raw.tokenId}`;
    if (rows.has(key) || !raw.sceneProjection || !raw.tokenProjection || !deltaIdentity(raw.deltaSource)
      || raw.tokenProjection.actorLink !== false || raw.tokenProjection.actorId !== raw.actorId
      || raw.tokenProjection._id !== raw.tokenId || raw.sceneProjection._id !== raw.sceneId
      || raw.deltaSource._id !== raw.tokenId || !Array.isArray(raw.boundItemIds)
      || !raw.boundItemIds.length || new Set(raw.boundItemIds).size !== raw.boundItemIds.length
      || raw.boundItemIds.some(id => raw.deltaSource.items.some(item => item._id === id))) throw Error('Invalid frozen synthetic identity');
    rows.set(key, raw);
  }
  if (rows.size && ([ActorClass, ItemClass, SceneClass, TokenDocumentClass, ActorDeltaClass, getActors, getScenes].some(value => typeof value !== 'function'))) throw Error('Native synthetic chain dependencies required');

  function resolve(actor, item, binding) {
    if (!rows.size || !(actor instanceof ActorClass) || actor.isToken !== true || !(item instanceof ItemClass)) return null;
    const token = actor.token, scene = token?.parent;
    if (!(token instanceof TokenDocumentClass) || actor.parent !== token || !(scene instanceof SceneClass)
      || scene.parent != null || !allowedPack(scene) || !allowedPack(token) || !allowedPack(actor)
      || scene.collection !== getScenes() || getScenes().get(scene.id) !== scene || scene.tokens?.get(token.id) !== token
      || token.actorLink !== false || token.isLinked !== false || token.isLazyDelta === true) return null;
    // Reading an own data property cannot trigger ActorDelta's lazy construction getter.
    const delta = Object.getOwnPropertyDescriptor(token, 'delta')?.value;
    if (!(delta instanceof ActorDeltaClass) || delta.parent !== token || delta.syntheticActor !== actor || token.actor !== actor) return null;
    const base = token.baseActor, baseItem = base?.items?.get(item.id), row = rows.get(`${scene.id}/${token.id}`);
    if (!row || !row.boundItemIds.includes(item.id) || row.actorId !== binding.actorId || token.actorId !== row.actorId
      || !(base instanceof ActorClass) || base.isToken !== false || base.parent != null || !allowedPack(base)
      || base.collection !== getActors() || getActors().get(base.id) !== base || base.id !== row.actorId
      || !(baseItem instanceof ItemClass) || baseItem.parent !== base || !allowedPack(baseItem)) return null;
    const ss = scene._source, ts = token._source, ds = delta._source, bs = base._source, bis = baseItem._source;
    if (scene.name !== row.sceneName || ss?.name !== row.sceneName || token.name !== row.tokenName || ts?.name !== row.tokenName
      || !equal({_id: ss?._id, folder: nil(ss?.folder), backgroundSrc: nil(ss?.background?.src), width: ss?.width, height: ss?.height}, row.sceneProjection)
      || !equal({_id: ts?._id, actorId: ts?.actorId, actorLink: ts?.actorLink, textureSrc: nil(ts?.texture?.src)}, row.tokenProjection)
      || !equal(deltaIdentity(ds), deltaIdentity(row.deltaSource))) return null;
    // A fresh, materialized empty Delta may legitimately retain null token source.
    if (ts.delta == null) {
      if (row.rawToken.delta != null || !equal(deltaIdentity(ds), deltaIdentity(row.deltaSource))
        || !equal(ds.system ?? {}, row.deltaSource.system ?? {}) || ds.ownership != null) return null;
    } else if (!equal(deltaIdentity(ts.delta), deltaIdentity(ds)) || !equal(ts.delta.system, ds.system)
      || !equal(nil(ts.delta.ownership), nil(ds.ownership))) return null;
    if (!bs || bs._id !== binding.actorId || base.type !== binding.actorType || bs.type !== binding.actorType
      || base.name !== binding.actorName || bs.name !== binding.actorName || nil(bs.folder) !== binding.actorFolderId
      || nil(bs._stats?.compendiumSource) !== binding.actorSourceUuid
      || !bis || bis._id !== binding.itemId || bis.type !== binding.itemType || baseItem.type !== binding.itemType
      || baseItem.name !== binding.itemName || bis.name !== binding.itemName || nil(bis.folder) !== binding.itemFolderId
      || nil(bis._stats?.compendiumSource) !== binding.itemSourceUuid || nil(bis.system?.slug) !== binding.itemSlug
      || nil(baseItem.system?.slug) !== binding.itemSlug || JSON.stringify(bis.system?.rules) !== binding.itemRulesJSON
      || bis.system?.description?.value !== baseItem.system?.description?.value
      || bis.system?.description?.value !== item._source?.system?.description?.value
      || base.visible === false || baseItem.visible === false || scene.visible === false || token.visible === false) return null;
    return {syntheticName: row.deltaSource.name ?? binding.actorName, baseActor: base, baseItem,
      baseActorSource: bs, baseItemSource: bis, baseActorSystem: base.system, baseItemSystem: baseItem.system,
      baseItems: base.items, baseCollection: getActors(), scene, sceneSource: ss, sceneCollection: getScenes(), sceneTokens: scene.tokens,
      token, tokenSource: ts, delta, deltaSource: ds, deltaState: stable(ds), tokenState: stable(ts), sceneState: stable(ss)};
  }
  return {resolve};
}
