// Test doubles for libWrapper.
//
// createMockLibWrapper() models the parts of libWrapper 1.13.5.1 that Extra's
// BoB lanes depend on: a wrapped method becomes a non-configurable accessor
// whose getter carries `_lib_wrapper`; the handler's own toString carries the
// wrapped source after a marker; one registration per package per wrapper;
// numeric ids; `next` is bound to the real receiver; unregister honours
// `fail`; a WRAPPER that returns (or resolves) without calling `next` is
// unregistered. Priorities, MIXED/OVERRIDE ordering and FAST mode are not
// modelled; the real-libWrapper tests cover those.
//
// loadRealLibWrapper(path) loads the real bundle (not vendored: LGPL) with the
// minimal Foundry globals it needs, for tests gated on EXTRA_TEST_LIBWRAPPER.
import {readFileSync} from 'node:fs';

function resolvePath(path) {
  const parts = path.split('.');
  const key = parts.pop();
  let object = globalThis;
  for (const part of parts) object = object?.[part];
  if (!object) throw new Error(`Cannot resolve ${path}`);
  return {object, key};
}

export function createMockLibWrapper() {
  let nextId = 1;
  const wrappers = new Map();
  const log = [];
  function wrap(object, key) {
    const own = Object.getOwnPropertyDescriptor(object, key);
    if (own?.get?._lib_wrapper) return own.get._lib_wrapper;
    if (own && (typeof own.value !== 'function' || own.configurable === false)) throw new Error(`Cannot wrap ${key}`);
    const original = own?.value;
    const state = {is_property: false, fn_name: key, object, getter_id: nextId++, names: [], entries: []};
    const handler = function (...args) {
      const self = this;
      const entries = state.entries.slice();
      const base = original ?? Reflect.get(Object.getPrototypeOf(object), key, self);
      const run = (index, values) => {
        if (index < 0) return Reflect.apply(base, self, values);
        const entry = entries[index];
        let chained = false;
        const next = (...more) => { chained = true; return run(index - 1, more); };
        const result = Reflect.apply(entry.fn, self, [next, ...values]);
        const check = () => {
          if (!chained && entry.type === 'WRAPPER') {
            log.push(['unchained', entry.packageId, key]);
            const position = state.entries.indexOf(entry);
            if (position >= 0) state.entries.splice(position, 1);
          }
        };
        // Like libWrapper, only a normal return or a resolved promise is checked.
        if (typeof result?.then === 'function') return result.then(value => { check(); return value; });
        check();
        return result;
      };
      return run(entries.length - 1, args);
    };
    handler.toString = function () {
      const base = original ?? Reflect.get(Object.getPrototypeOf(object), key);
      return `/* WARNING: libWrapper wrappers present! */\n${base?.toString()}`;
    };
    const getter = function () { return handler; };
    getter._lib_wrapper = state;
    Object.defineProperty(object, key, {get: getter, set() { throw new Error('Classic assignment is not modelled'); },
      enumerable: false, configurable: false});
    wrappers.set(state.getter_id, state);
    return state;
  }
  const find = target => typeof target === 'number' ? wrappers.get(target) : (() => {
    const {object, key} = resolvePath(target);
    return Object.getOwnPropertyDescriptor(object, key)?.get?._lib_wrapper;
  })();
  const libWrapper = {
    register(packageId, target, fn, type = 'MIXED') {
      const state = typeof target === 'number' ? wrappers.get(target) : (() => {
        const {object, key} = resolvePath(target);
        return wrap(object, key);
      })();
      if (!state) throw new Error(`Unknown wrapper id ${target}`);
      if (state.entries.some(entry => entry.packageId === packageId)) {
        throw new Error(`A wrapper for '${state.fn_name}' has already been registered by ${packageId}.`);
      }
      state.entries.push({packageId, fn, type});
      log.push(['register', packageId, state.fn_name, state.getter_id]);
      return state.getter_id;
    },
    unregister(packageId, target, fail = true) {
      const state = find(target);
      const index = state?.entries.findIndex(entry => entry.packageId === packageId) ?? -1;
      if (index < 0) {
        if (fail) throw new Error(`Cannot unregister '${target}' by ${packageId}: no such wrapper.`);
        return;
      }
      state.entries.splice(index, 1);
      log.push(['unregister', packageId, state.fn_name, state.getter_id]);
    }
  };
  return {libWrapper, wrap, log, registrations: () => [...wrappers.values()].flatMap(state =>
    state.entries.map(entry => `${entry.packageId}:${state.fn_name}`))};
}

/** Loads the real libWrapper bundle into this process. Call once per test file. */
export async function loadRealLibWrapper(path) {
  const notifications = [];
  const settings = new Map();
  class FormApplication {}
  class Game { initialize() {} }
  globalThis.addEventListener ??= () => {};
  globalThis.FormApplication ??= FormApplication;
  globalThis.Application ??= class Application { async _render() {} };
  globalThis.foundry ??= {};
  globalThis.foundry.Game ??= Game;
  globalThis.Hooks ??= {
    _call() { try { return true; } catch (error) { return false; } },
    onError() {}, once() {}, on() {}, callAll() { return true; }, call() { return true; }
  };
  globalThis.game ??= {};
  globalThis.game.user ??= {id: 'gm', isGM: true};
  globalThis.game.userId ??= 'gm';
  globalThis.game.data ??= {users: [{_id: 'gm', role: 4}]};
  globalThis.game.settings ??= {
    register(namespace, key, options) { settings.set(`${namespace}.${key}`, options?.default); },
    registerMenu() {}, get(namespace, key) { return settings.get(`${namespace}.${key}`); },
    set(namespace, key, value) { settings.set(`${namespace}.${key}`, value); return value; }
  };
  globalThis.game.i18n ??= {lang: 'en', localize: key => key, format: key => key, has: () => false};
  globalThis.ui ??= {};
  globalThis.ui.notifications ??= {error: message => notifications.push(['error', message]),
    warn: message => notifications.push(['warn', message]), info: message => notifications.push(['info', message])};
  const source = readFileSync(path);
  await import(`data:text/javascript;base64,${source.toString('base64')}`);
  new globalThis.foundry.Game().initialize();
  return {libWrapper: globalThis.libWrapper, notifications};
}
