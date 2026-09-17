// A per-callback view; never wraps TokenDocument.update or edits document source.
const SCENE_KEYS = ['_id', 'folder', 'background.src', 'width', 'height'];
const TOKEN_KEYS = ['_id', 'actorId', 'actorLink', 'texture.src', 'level', 'x', 'y', 'elevation', 'flags.pf2e.troop.id'];
const ACTOR_KEYS = ['_id', 'type', 'folder', '_stats.compendiumSource'];
const normalize = text => text.replace(/\r\n/g, '\n').trim();
const valueAt = (source, path) => path.split('.').reduce((value, key) => value?.[key], source) ?? null;
const matches = (source, identity, keys) => !!source && !!identity
  && Object.keys(identity).length === keys.length
  && keys.every(key => Object.hasOwn(identity, key) && valueAt(source, key) === identity[key]);
const one = (rows, id) => {
  const selected = Array.from(rows ?? []).filter(row => row?._id === id);
  return selected.length === 1 ? selected[0] : null;
};

// The empty target avoids invariants of non-configurable document properties.
// Native methods retain the actual document receiver.
function view(document, overrides) {
  return new Proxy(Object.create(null), {
    get(_target, key) {
      if (Object.hasOwn(overrides, key)) return overrides[key];
      const value = Reflect.get(document, key, document);
      return typeof value === 'function' ? value.bind(document) : value;
    }
  });
}

export function installBobImportTokenNames({Hooks, game, bindings, expectedCallbackSource,
  pack, adventureId, adventureName, isEnabled = () => false}) {
  const entries = Hooks.events.importAdventure ?? [];
  const matching = entries.filter(entry => typeof entry.fn === 'function'
    && normalize(Function.prototype.toString.call(entry.fn)) === normalize(expectedCallbackSource));
  if (matching.length !== 1) throw new Error('Expected exactly one unwrapped Babele importAdventure callback match.');
  const entry = matching[0], original = entry.fn;
  const index = new Map();
  for (const binding of structuredClone(bindings)) {
    const key = `${binding.sceneId}/${binding.tokenId}`;
    if (index.has(key)) throw new Error('Duplicate BoB token binding.');
    index.set(key, binding);
  }
  let active = true;

  function valid(adventure, scene, token, binding, createdActors) {
    if (!binding || token.parent !== scene || token.id !== binding.tokenId
      || scene.id !== binding.sceneId || token.actorId !== binding.actorId
      || scene.name !== binding.sceneName || scene._source?.name !== binding.sceneName
      || token.name !== binding.approvedName || token._source?.name !== binding.approvedName
      || token.delta?.name || token._source?.delta?.name
      || !matches(scene._source, binding.sceneIdentity, SCENE_KEYS)
      || !matches(token._source, binding.tokenIdentity, TOKEN_KEYS)) return false;
    const sourceScene = one(adventure._source.scenes, binding.sceneId);
    const sourceToken = one(sourceScene?.tokens, binding.tokenId);
    if (sourceScene?.name !== binding.sceneName || sourceToken?.name !== binding.approvedName
      || sourceToken?.delta?.name
      || !matches(sourceScene, binding.sceneIdentity, SCENE_KEYS)
      || !matches(sourceToken, binding.tokenIdentity, TOKEN_KEYS)) return false;
    const actor = game.actors.get(binding.actorId);
    return !!actor && createdActors.includes(actor) && actor.id === binding.actorId
      && actor.name === binding.actorName && actor._source?.name === binding.actorName
      && actor.prototypeToken?.name === binding.prototypeName
      && actor._source?.prototypeToken?.name === binding.prototypeName
      && matches(actor._source, binding.actorIdentity, ACTOR_KEYS);
  }

  function wrapped(...args) {
    const [adventure, _options, created] = args;
    if (!active || entry.fn !== wrapped || !isEnabled()
      || adventure?.pack !== pack || adventure?.id !== adventureId
      || adventure?.name !== adventureName || adventure?._source?._id !== adventureId
      || adventure?._source?.name !== adventureName
      || !Array.isArray(created?.Actor) || !Array.isArray(created?.Scene)) {
      return Reflect.apply(original, this, args);
    }
    const scenes = created.Scene.map(scene => {
      const tokens = Array.from(scene.tokens ?? []).map(token => {
        const binding = index.get(`${scene.id}/${token.id}`);
        if (!valid(adventure, scene, token, binding, created.Actor)) return token;
        return view(token, {update(...updateArgs) {
          const [patch] = updateArgs;
          const descriptor = patch && Object.getOwnPropertyDescriptor(patch, 'name');
          // Recheck the CAS and source guards at the exact update invocation.
          if (updateArgs.length === 1 && patch && Object.getPrototypeOf(patch) === Object.prototype
            && Reflect.ownKeys(patch).length === 1 && descriptor && 'value' in descriptor
            && descriptor.value === binding.prototypeName
            && valid(adventure, scene, token, binding, created.Actor)) {
            return Promise.resolve(token);
          }
          return Reflect.apply(token.update, token, updateArgs);
        }});
      });
      return view(scene, {tokens});
    });
    const forwarded = [...args];
    forwarded[2] = view(created, {Scene: scenes});
    return Reflect.apply(original, this, forwarded);
  }
  entry.fn = wrapped;
  const dispose = () => {
    active = false;
    if (entry.fn === wrapped) entry.fn = original;
  };
  dispose.isActive = () => active && entry.fn === wrapped
    && Hooks.events.importAdventure?.includes(entry) === true;
  return dispose;
}
