const normalize = value => value ?? null;
const equal = (a, b) => {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) return a.length === b.length && Array.from(a).every((value, index) => equal(value, b[index]));
  // Foundry materializes optional source fields as own undefined properties.
  // JSON omits those properties; null, false, zero and actual values remain exact.
  const keys = Object.keys(a).filter(key => a[key] !== undefined);
  const otherKeys = Object.keys(b).filter(key => b[key] !== undefined);
  return keys.length === otherKeys.length && keys.every(key => Object.hasOwn(b, key) && equal(a[key], b[key]));
};
const projection = source => ({
  _id: source?._id, type: source?.type, folder: normalize(source?.folder), img: normalize(source?.img),
  sourceUuid: normalize(source?._stats?.compendiumSource), effects: source?.effects ?? [], flags: source?.flags ?? {},
  system: Object.fromEntries(Object.entries(source?.system ?? {}).filter(([key]) => !['description','publication','_migration'].includes(key)))
});

/** Exact token delta authorization. This module never changes source data. */
export function prepareBobTokenItemIdentity({identities, ActorClass, ActorDeltaClass, TokenDocumentClass, SceneClass}) {
  const rows = new Map();
  for (const row of identities.filter(row => row.scope === 'tokenItem')) {
    const key = `${row.sceneId}/${row.tokenId}/${row.actorId}/${row.itemId}`;
    if (rows.has(key)) throw new Error(`Duplicate BoB token Item identity: ${key}`);
    if (!row.itemProjection || !row.sceneProjection || !row.tokenProjection) throw new Error('Missing BoB token Item projection.');
    rows.set(key, row);
  }
  let applyOwner = ActorDeltaClass;
  if (rows.size) {
    if ([ActorClass,ActorDeltaClass,TokenDocumentClass,SceneClass].some(cls => typeof cls !== 'function')) {
      throw new Error('Native BoB token Item document classes are unavailable.');
    }
    while (applyOwner && !Object.hasOwn(applyOwner,'applyDelta')) applyOwner = Object.getPrototypeOf(applyOwner);
    const descriptor = applyOwner && Object.getOwnPropertyDescriptor(applyOwner,'applyDelta');
    if (typeof descriptor?.value !== 'function' || (applyOwner === ActorDeltaClass && descriptor.configurable !== true)) {
      throw new Error('Native ActorDelta.applyDelta is unavailable.');
    }
  }
  const contexts = [];
  const concreteDelta = token => Object.getOwnPropertyDescriptor(token ?? {},'delta')?.value;
  const contextFor = token => contexts.findLast(context => context.token === token);
  const deltaSources = actor => {
    const token = actor?.token ?? actor?.parent;
    return [contextFor(token)?.delta?._source, concreteDelta(token)?._source, token?._source?.delta];
  };
  // A delta override is a distinct identity even if it has a base Actor's Item ID.
  // Never turn a rejected token binding into a looser actorItem authorization.
  const hasOwnDeltaItem = (item, actor) => !!actor?.isToken && deltaSources(actor).some(source =>
    Array.isArray(source?.items) && source.items.some(entry => entry?._id === item.id));
  const uniqueItem = (source, id) => {
    const matches = source?.items?.filter?.(entry => entry?._id === id) ?? [];
    return matches.length === 1 ? matches[0] : null;
  };
  function resolve(item, actor) {
    if (!rows.size || !(actor instanceof ActorClass) || actor.isToken !== true) return null;
    const token = actor.token, scene = token?.parent;
    if (!(token instanceof TokenDocumentClass) || actor.parent !== token || !(scene instanceof SceneClass)
      || scene.tokens?.get(token.id) !== token || token.actorLink !== false || token.isLinked !== false
      || item.parent !== actor || actor.items?.get(item.id) !== item) return null;
    const context = contextFor(token), delta = context?.delta ?? concreteDelta(token), base = context?.baseActor ?? token.baseActor;
    if (!(delta instanceof ActorDeltaClass) || delta.parent !== token || !(base instanceof ActorClass)
      || base.isToken || token.baseActor !== base) return null;
    // During native applyDelta, new Actor construction prepares Items before the
    // caller assigns delta.syntheticActor. Outside that synchronous frame demand
    // the materialized native references, not just a matching source/ID.
    if (!context && (concreteDelta(token) !== delta || delta.syntheticActor !== actor || token.actor !== actor)) return null;
    const row = rows.get(`${scene.id}/${token.id}/${base.id}/${item.id}`);
    if (!row || token.actorId !== row.actorId || actor.id !== row.actorId
      || item.type !== row.itemType || item.name !== row.approvedName || item._source?.name !== row.approvedName
      || normalize(item.system?.slug) !== normalize(row.itemSlug)) return null;
    const sceneSource = scene._source, tokenSource = token._source;
    if (scene.name !== row.sceneName || sceneSource?.name !== row.sceneName
      || token.name !== row.tokenName || tokenSource?.name !== row.tokenName
      || !equal({_id:sceneSource?._id,folder:normalize(sceneSource?.folder),backgroundSrc:normalize(sceneSource?.background?.src),width:sceneSource?.width,height:sceneSource?.height},row.sceneProjection)
      || !equal({_id:tokenSource?._id,actorId:tokenSource?.actorId,actorLink:tokenSource?.actorLink,textureSrc:normalize(tokenSource?.texture?.src)},row.tokenProjection)) return null;
    for (const source of [base._source,actor._source]) {
      if (source?._id !== row.actorId || source.type !== row.actorType
        || normalize(source.folder) !== normalize(row.actorFolderId)
        || normalize(source._stats?.compendiumSource) !== normalize(row.actorSourceUuid)) return null;
    }
    if (base.name !== row.actorName || base._source.name !== row.actorName || actor.type !== row.actorType
      || actor.name !== (row.deltaName ?? row.actorName) || actor._source.name !== (row.deltaName ?? row.actorName)) return null;
    for (const source of [delta._source,tokenSource?.delta]) {
      if (source?._id !== row.tokenId || normalize(source.name) !== normalize(row.deltaName)
        || normalize(source.type) !== normalize(row.deltaType)) return null;
      const rawItem = uniqueItem(source,row.itemId);
      if (!rawItem || rawItem.name !== row.approvedName || !equal(projection(rawItem),row.itemProjection)) return null;
    }
    return equal(projection(item._source),row.itemProjection) ? row : null;
  }
  function install(replace) {
    if (!rows.size) return;
    const original = Object.getOwnPropertyDescriptor(applyOwner,'applyDelta').value;
    replace(ActorDeltaClass,'applyDelta',{configurable:true,writable:true,enumerable:false,value:function(delta,baseActor,...args) {
      const context = {delta,baseActor,token:delta?.parent};
      contexts.push(context);
      try { return Reflect.apply(original,this,[delta,baseActor,...args]); }
      finally { contexts.pop(); } // Deliberately never await or retain async context.
    }});
  }
  return {hasOwnDeltaItem,resolve,install};
}
