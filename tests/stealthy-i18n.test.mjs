import assert from 'node:assert/strict';
import test from 'node:test';

const EXTRA_ID = 'pf2e-compendium-extra-cn';
const STEALTHY_ID = 'pf2e-stealthy';
const languagePath = new URL('../lang/external/pf2e-stealthy.json', import.meta.url).href;
const hooks = new Map();
globalThis.Hooks = {once(name, callback) {
  const callbacks = hooks.get(name) ?? [];
  callbacks.push(callback);
  hooks.set(name, callbacks);
}};
await import('../inject-lang.js');
delete globalThis.Hooks;

function environment({system = 'pf2e', extra = true, stealthy = true, languages = []} = {}) {
  const source = {languages: structuredClone(languages)};
  const module = {active: extra, languages: new Set(languages), _source: source};
  const modules = new Map([[EXTRA_ID, module]]);
  if (stealthy !== null) modules.set(STEALTHY_ID, {active: stealthy});
  globalThis.game = {system: {id: system}, modules,
    get i18n() {throw new Error('Client language is not initialized during init');},
    get settings() {throw new Error('Language registration must not access settings');},
  };
  return {module, source, init() {
    for (const callback of hooks.get('init') ?? []) callback();
  }};
}

test('the existing entry registers Chinese language files before client language initialization', () => {
  const runtime = environment();
  runtime.init();
  assert.deepEqual([...runtime.module.languages].map(({lang, path, module, system}) =>
    ({lang, path, module, system})), [
    {lang: 'cn', path: languagePath, module: STEALTHY_ID, system: 'pf2e'},
    {lang: 'zh-CN', path: languagePath, module: STEALTHY_ID, system: 'pf2e'},
    {lang: 'zh-Hans', path: languagePath, module: STEALTHY_ID, system: 'pf2e'},
  ]);
  assert.deepEqual(runtime.source, {languages: []});
});

test('SF2e receives language descriptors for its own system', () => {
  const runtime = environment({system: 'sf2e'});
  runtime.init();
  assert.equal(runtime.module.languages.size, 3);
  assert.ok([...runtime.module.languages].every(entry => entry.system === 'sf2e'));
});

test('missing or disabled modules and other systems leave the language collection unchanged', () => {
  for (const options of [{extra: false}, {stealthy: false}, {stealthy: null}, {system: 'dnd5e'}]) {
    const runtime = environment(options);
    runtime.init();
    assert.equal(runtime.module.languages.size, 0);
    assert.deepEqual(runtime.source, {languages: []});
  }
});

test('registration preserves existing entries and does not duplicate matching language paths', () => {
  const existing = {lang: 'cn', path: languagePath, module: STEALTHY_ID, system: 'pf2e'};
  const unrelated = {lang: 'cn', path: 'modules/other/cn.json', module: 'other'};
  const runtime = environment({languages: [existing, unrelated]});
  runtime.init();
  runtime.init();
  assert.equal(runtime.module.languages.size, 4);
  assert.ok(runtime.module.languages.has(existing));
  assert.ok(runtime.module.languages.has(unrelated));
  assert.deepEqual(runtime.source, {languages: [existing, unrelated]});
});

test('a different module filter on the same path does not suppress Stealthy registration', () => {
  const runtime = environment({languages: [{lang: 'cn', path: languagePath, module: 'other'}]});
  runtime.init();
  assert.equal([...runtime.module.languages].filter(entry => entry.module === STEALTHY_ID).length, 3);
});
