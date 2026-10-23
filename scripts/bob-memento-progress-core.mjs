const MODULE_ID = 'pf2e-bastion-of-blasphemies';
const source = fn => typeof fn === 'function'
  ? Function.prototype.toString.call(fn).replace(/\s+/g, '').replaceAll('"', "'") : '';
const includesAll = (text, parts) => parts.every(part => text.includes(part));

export function installBobMementoProgress({game, Hooks, CampaignManager, WorldStateHandlers,
  getManager, onError = error => console.error('BoB memento progress:', error)}) {
  const managerPrototype = CampaignManager?.prototype;
  const handlerPrototype = WorldStateHandlers?.prototype;
  if (!managerPrototype || !handlerPrototype || 'toggleMementoReturned' in managerPrototype) return null;
  const originalHandler = handlerPrototype.toggleMementoReturned;
  const originalReturn = managerPrototype.toggleMementoReturn;
  const originalUpdate = managerPrototype.onUpdateCampaignData;
  const hookMatches = (Hooks.events.createItem ?? []).filter(entry => includesAll(source(entry.fn), [
    'item.parent?.id!==ARUDORA_FOUNTAIN.actorId', "game.settings.get(MODULE_ID,'campaign')",
    'foundry.utils.iterateValues(data.areas)', 'item.slug??game.pf2e.system.sluggify(item.name)',
    'itemSlug===area.memento?.slug', 'if(game.user.isActiveGM)bastion.manager.toggleMementoReturned(area.id,true)'
  ]));
  // Check the broken call and the native state-machine seams, without pinning a release or a file hash.
  if (hookMatches.length !== 1
    || !includesAll(source(originalReturn), ['async', 'this.#stateHandlers.toggleMementoReturned(areaId,returned);'])
    || /(?:return|await)this\.#stateHandlers/.test(source(originalReturn))
    || !includesAll(source(originalHandler), ['this.#data.areas[areaId]', 'returned??=!area.memento.returned',
      'this.#data.toObject()', "awaitgame.settings.set(MODULE_ID,'campaign',setting)",
      'awaitPromise.all(', 'tile.update(', 'this.#toggleAreaAccess(area.next.id)'])
    || !includesAll(source(originalUpdate), ['if(!game.user.isGM)return;', 'awaitthis.render()',
      'if(!game.user.isActiveGM)return;'])) return null;

  const hookEntry = hookMatches[0], originalHook = hookEntry.fn;
  const handlers = new WeakMap();
  const unfinished = new Set();
  const patches = [];
  let active = true, queue = Promise.resolve(), notifications = null;

  function observe(promise) {
    // Return the same rejecting Promise to callers, while native fire-and-forget hooks still report failures.
    promise.catch(onError);
    return promise;
  }

  function currentManager() {
    const manager = getManager();
    if (!(manager instanceof CampaignManager)) throw new Error('BoB campaign manager is unavailable.');
    manager.data = game.settings.get(MODULE_ID, 'campaign');
    return manager;
  }

  function bridgeHandler() {
    const manager = currentManager();
    if (!handlers.has(manager)) handlers.set(manager, new WorldStateHandlers());
    return handlers.get(manager);
  }

  function enqueue(receiver, args, automatic = false) {
    const operation = queue.then(async () => {
      if (!active || game.modules.get(MODULE_ID)?.active !== true || !game.user.isGM
        || (automatic && !game.user.isActiveGM)) return;
      const manager = currentManager();
      const [areaId, returned] = args;
      const memento = manager.data.areas[areaId]?.memento;
      if (typeof returned === 'boolean' && memento?.returned === returned && !unfinished.has(areaId)) return;
      const updates = [];
      notifications = updates;
      try {
        const result = await Reflect.apply(originalHandler, receiver(), args);
        // The native settings onChange callback discards this Promise.
        await Promise.all(updates);
        unfinished.delete(areaId);
        return result;
      } catch (error) {
        unfinished.add(areaId);
        // A failed tile update must not let still-running notifications race the next return.
        await Promise.allSettled(updates);
        throw error;
      } finally {
        notifications = null;
      }
    });
    queue = operation.catch(() => {});
    return observe(operation);
  }

  function wrappedHandler(...args) {
    return enqueue(() => this, args);
  }

  function automaticReturn(...args) {
    return enqueue(bridgeHandler, args, true);
  }

  function manualReturn(...args) {
    return enqueue(bridgeHandler, args);
  }

  function updateCampaign(...args) {
    if (active) this.data = game.settings.get(MODULE_ID, 'campaign');
    const result = Reflect.apply(originalUpdate, this, args);
    if (active) {
      notifications?.push(result);
      observe(result);
    }
    return result;
  }

  function patch(target, key, value) {
    const descriptor = Object.getOwnPropertyDescriptor(target, key);
    Object.defineProperty(target, key, {...descriptor, configurable: true, writable: true, value});
    patches.push({target, key, descriptor, value});
  }
  patch(handlerPrototype, 'toggleMementoReturned', wrappedHandler);
  patch(managerPrototype, 'toggleMementoReturn', manualReturn);
  patch(managerPrototype, 'toggleMementoReturned', automaticReturn);
  patch(managerPrototype, 'onUpdateCampaignData', updateCampaign);

  const dispose = () => {
    active = false;
    for (const {target, key, descriptor, value} of patches) {
      if (target[key] !== value) continue;
      if (descriptor) Object.defineProperty(target, key, descriptor);
      else delete target[key];
    }
  };
  dispose.isActive = () => active && hookEntry.fn === originalHook
    && Hooks.events.createItem?.includes(hookEntry) === true
    && patches.every(({target, key, value}) => target[key] === value);
  return dispose;
}
