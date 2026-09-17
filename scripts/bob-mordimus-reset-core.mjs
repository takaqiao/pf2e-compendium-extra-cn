const normalized = value => value.replace(/\r\n/g, '\n').trim();
function exactDataKeys(value, keys) {
  if (!value || Object.getPrototypeOf(value) !== Object.prototype) return false;
  const actual = Reflect.ownKeys(value);
  return actual.length === keys.length && keys.every(key => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return !!descriptor && Object.hasOwn(descriptor, 'value');
  });
}
function currentName(document, names) {
  return names.includes(document.name) && document._source?.name === document.name;
}
function descriptorOf(object, key) {
  for (let target = object; target; target = Object.getPrototypeOf(target)) {
    const descriptor = Object.getOwnPropertyDescriptor(target, key);
    if (descriptor) return descriptor;
  }
  return null;
}

export function installMordimusResetDisplay({backend, game, binding, classes, isEnabled = () => false}) {
  const descriptor = descriptorOf(backend, 'modifyDocumentBatch');
  const ownDescriptor = Object.getOwnPropertyDescriptor(backend, 'modifyDocumentBatch');
  if (!descriptor || !Object.hasOwn(descriptor, 'value') || typeof descriptor.value !== 'function'
    || normalized(Function.prototype.toString.call(descriptor.value)) !== normalized(binding.nativeMethodSource)
    || (ownDescriptor && !ownDescriptor.configurable && !ownDescriptor.writable)
    || (!ownDescriptor && !Object.isExtensible(backend))) throw new Error('Unsupported native BoB batch backend.');
  const original = descriptor.value;
  const pinned = structuredClone(binding);
  let active = true;

  function accepts(operation) {
    if (!active || backend.modifyDocumentBatch !== wrapped || !isEnabled() || game.user?.isGM !== true) return false;
    if (!exactDataKeys(operation, ['action', 'documentName', 'updates', 'parent', 'animate', 'constrainOptions', 'noHook'])
      || operation.action !== 'update' || operation.documentName !== 'Token'
      || operation.animate !== false || operation.noHook !== true
      || !exactDataKeys(operation.constrainOptions, ['ignoreWalls', 'ignoreCost'])
      || operation.constrainOptions.ignoreWalls !== true || operation.constrainOptions.ignoreCost !== true
      || !Array.isArray(operation.updates) || operation.updates.length !== 1) return false;
    const update = operation.updates[0];
    if (!exactDataKeys(update, ['_id', 'hidden', 'name', 'x', 'y']) || update._id !== pinned.token.id
      || update.hidden !== true || update.name !== pinned.reset.sourceName
      || update.x !== pinned.reset.x || update.y !== pinned.reset.y) return false;
    const scene = operation.parent;
    if (!(scene instanceof classes.Scene) || scene.id !== pinned.scene.id || game.scenes.get(scene.id) !== scene
      || scene._source?._id !== scene.id || !currentName(scene, pinned.scene.names)
      || scene._source.folder !== pinned.scene.folder || scene._source.width !== pinned.scene.width
      || scene._source.height !== pinned.scene.height || scene._source.background?.src) return false;
    const actor = game.actors.get(pinned.actor.id);
    if (!(actor instanceof classes.Actor) || actor.id !== pinned.actor.id || actor._source?._id !== actor.id
      || !currentName(actor, pinned.actor.names) || actor._source.type !== pinned.actor.type
      || actor._source.folder !== pinned.actor.folder || actor._source._stats?.compendiumSource !== pinned.actor.sourceUuid) return false;
    const token = scene.tokens.get(pinned.token.id);
    if (!(token instanceof classes.Token) || token.parent !== scene || token.id !== pinned.token.id
      || token._source?._id !== token.id || token.actorId !== pinned.actor.id
      || token._source.actorId !== pinned.actor.id || token._source.actorLink !== false
      || token._source.texture?.src !== pinned.token.texture || token._source.level !== pinned.token.level
      || !currentName(token, pinned.token.names) || token._source.delta?.name) return false;
    const phantom = game.settings.get('pf2e-bastion-of-blasphemies', 'campaign')?.areas?.shore?.phantoms?.mordimus;
    return phantom?.rescued === false && phantom.actorId === pinned.actor.id && phantom.tokenId === pinned.token.id
      && phantom.rescuePosition?.x === pinned.reset.x && phantom.rescuePosition?.y === pinned.reset.y;
  }

  function wrapped(...args) {
    if (this !== backend || args.length !== 1 || !Array.isArray(args[0])) return Reflect.apply(original, this, args);
    const operations = args[0];
    let matched = -1;
    try {
      for (let i = 0; i < operations.length; i++) if (accepts(operations[i])) {
        // The original handler produces exactly one reset operation.
        if (matched !== -1) {matched = -1; break;}
        matched = i;
      }
    } catch {
      return Reflect.apply(original, this, args);
    }
    if (matched < 0) return Reflect.apply(original, this, args);
    const operation = operations[matched];
    const forwarded = operations.slice();
    forwarded[matched] = {...operation, updates: [{...operation.updates[0], name: pinned.reset.approvedName}]};
    return Reflect.apply(original, this, [forwarded]);
  }
  if (ownDescriptor) Object.defineProperty(backend, 'modifyDocumentBatch', {...ownDescriptor, value: wrapped});
  else Object.defineProperty(backend, 'modifyDocumentBatch', {value: wrapped, configurable: true, writable: true});
  const dispose = () => {
    active = false;
    if (backend.modifyDocumentBatch !== wrapped) return;
    if (ownDescriptor) Object.defineProperty(backend, 'modifyDocumentBatch', ownDescriptor);
    else delete backend.modifyDocumentBatch;
  };
  dispose.isActive = () => active && backend.modifyDocumentBatch === wrapped;
  return dispose;
}
