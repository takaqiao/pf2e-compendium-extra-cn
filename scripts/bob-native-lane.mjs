const EXTRA_ID = 'pf2e-compendium-extra-cn';
const lanes = new WeakMap();

/**
 * Another package has wrapped object[key] with libWrapper: the property is now a
 * non-configurable accessor and cannot be redefined. Recognise only a method
 * wrapper that libWrapper created on this exact object for this exact key.
 */
export function managedMethod(object, key) {
  const descriptor = object && Object.getOwnPropertyDescriptor(object, key);
  if (typeof descriptor?.get !== 'function' || descriptor.configurable !== false) return null;
  const wrapper = descriptor.get._lib_wrapper;
  if (!wrapper || typeof wrapper !== 'object' || wrapper.is_property !== false || wrapper.fn_name !== key
    || wrapper.object !== object || !Number.isInteger(wrapper.getter_id)) return null;
  return wrapper;
}

const MARKER = '/* WARNING: libWrapper wrappers present! */';

/**
 * Source text of the method underneath a libWrapper chain. libWrapper gives
 * its dispatch handler an own toString that prefixes the wrapped method's
 * source with a marker; Function.prototype.toString would return the handler's
 * own code instead. Returns null when that contract is not recognisable.
 */
export function managedOriginalSource(object, key) {
  if (!managedMethod(object, key)) return null;
  let text;
  try { text = String(object[key]); } catch { return null; }
  return typeof text === 'string' && text.startsWith(MARKER) ? text.slice(MARKER.length) : null;
}

export function hasLibWrapperApi(libWrapper = globalThis.libWrapper) {
  return typeof libWrapper?.register === 'function' && typeof libWrapper?.unregister === 'function';
}

/**
 * Join an existing libWrapper chain. libWrapper allows one registration per
 * package per wrapper, so every Extra consumer of the same target shares one
 * registration. `body(next, ...args)` runs with the real receiver; `next` is
 * created for this call only and continues to the next consumer or to the
 * libWrapper chain. Later subscribers are outer, matching the order of stacked
 * defineProperty wrappers. Returns an idempotent unsubscribe function.
 *
 * Every body must call `next` before it returns (or before its promise
 * resolves). A body that does not is treated the way libWrapper treats a
 * WRAPPER that does not chain: it is removed, its result is ignored and the
 * call continues down the chain. The shared registration therefore always
 * chains, in libWrapper's normal and FAST modes alike.
 */
export function subscribeManagedMethod(object, key, body, {libWrapper = globalThis.libWrapper} = {}) {
  const wrapper = managedMethod(object, key);
  if (!wrapper) throw new TypeError(`libWrapper-managed method is unavailable: ${key}`);
  if (typeof body !== 'function') throw new TypeError('A lane body is required.');
  let lane = lanes.get(wrapper);
  if (lane?.subscribers.includes(body)) throw new Error(`Duplicate Extra subscriber for ${key}.`);
  if (!lane) {
    if (!hasLibWrapperApi(libWrapper)) throw new TypeError('libWrapper register/unregister are unavailable.');
    const subscribers = [];
    const drop = body => {
      const index = subscribers.indexOf(body);
      if (index < 0) return;
      subscribers.splice(index, 1);
      console.error(`${EXTRA_ID} | an Extra subscriber did not call the native ${key}; it was removed.`);
    };
    const dispatch = function (wrapped, ...args) {
      const chain = subscribers.slice();
      const call = (index, values) => {
        if (index < 0) return wrapped(...values);
        const body = chain[index];
        let chained = false;
        const result = Reflect.apply(body, this, [(...next) => { chained = true; return call(index - 1, next); }, ...values]);
        const settle = value => {
          if (chained) return value;
          drop(body);
          return call(index - 1, values);
        };
        return typeof result?.then === 'function' ? result.then(settle) : settle(result);
      };
      return call(chain.length - 1, args);
    };
    // The numeric id addresses exactly the wrapper inspected above; a path
    // string could resolve to a different object.
    const id = libWrapper.register(EXTRA_ID, wrapper.getter_id, dispatch, 'WRAPPER');
    if (id !== wrapper.getter_id) {
      libWrapper.unregister(EXTRA_ID, id, false);
      throw new Error(`libWrapper registered ${key} on an unexpected target.`);
    }
    lane = {id, libWrapper, subscribers};
    lanes.set(wrapper, lane);
  }
  lane.subscribers.push(body);
  let subscribed = true;
  return () => {
    if (!subscribed) return;
    subscribed = false;
    const index = lane.subscribers.indexOf(body);
    if (index >= 0) lane.subscribers.splice(index, 1);
    if (!lane.subscribers.length && lanes.get(wrapper) === lane) {
      lanes.delete(wrapper);
      lane.libWrapper.unregister(EXTRA_ID, lane.id, false);
    }
  };
}
