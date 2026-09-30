import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const MODULE_ID = 'pf2e-compendium-extra-cn';
const CHN_MODULE_ID = 'pf2e_compendium_chn';
const source = fs.readFileSync(new URL('../babele.js', import.meta.url), 'utf8');

function environment({patch = true, recorded = [], isGM = false, overlaps = []} = {}) {
  const hooks = new Map(), registrations = [], refreshes = [], priorities = [];
  const babele = {
    register(registration) {
      const row = structuredClone(registration);
      registrations.push(row);
      const state = this.__ondemandPatch;
      if (!state) return;
      const normalized = {module: row.module, lang: row.lang, dirs: row.dirs ?? [row.dir]};
      if (!state.registeredModules.some(value => JSON.stringify(value) === JSON.stringify(normalized))) {
        state.registeredModules.push(normalized);
      }
    },
    async loadLabels() {refreshes.push('labels');},
    async loadTitleIndex() {refreshes.push('titles');},
    async applyRuntimeTranslations(options) {refreshes.push(structuredClone(options));},
    async sourceDiagnostics() {return {translation: {overlaps}};},
    async setSourcePriority(collection, sources) {priorities.push({collection, sources: [...sources]});},
  };
  if (patch) babele.__ondemandPatch = {
    registeredModules: [{module: CHN_MODULE_ID, lang: 'cn', dirs: ['zh-CN', 'compendium']}, ...structuredClone(recorded)],
  };
  const context = vm.createContext({
    Babele: function Babele() {}, game: {babele, user: {isGM}},
    console: {log() {}, warn() {}},
    Hooks: {once(name, callback) {
      const callbacks = hooks.get(name) ?? [];
      callbacks.push(callback); hooks.set(name, callbacks);
    }},
  });
  // The two unrelated SoG import entry points are outside this registration
  // boundary. Evaluate the complete extra registration script and its hooks.
  vm.runInContext(source.replace(/^import[^\r\n]+;\r?\n/gm, ''), context, {filename: 'babele.js'});
  return {
    babele, registrations, refreshes, priorities,
    async fire(name) {for (const callback of hooks.get(name) ?? []) await callback(babele);},
    extraRegistrations() {return registrations.filter(row => row.module === MODULE_ID);},
  };
}

test('native full-mode source discovery receives all three Chinese language registrations', async () => {
  const runtime = environment({patch: false});
  await runtime.fire('babele.init');
  assert.deepEqual(runtime.extraRegistrations(), [
    {module: MODULE_ID, lang: 'cn', dir: 'compendium'},
    {module: MODULE_ID, lang: 'zh-CN', dir: 'compendium'},
    {module: MODULE_ID, lang: 'zh-Hans', dir: 'compendium'},
  ]);
});

test('recorded aliases prevent duplicate registrations across init, setup and ready', async () => {
  const runtime = environment();
  await runtime.fire('babele.init');
  await runtime.fire('setup');
  await runtime.fire('ready');
  await runtime.fire('babele.init');
  await runtime.fire('setup');
  await runtime.fire('ready');
  assert.equal(runtime.extraRegistrations().length, 3);
  assert.deepEqual(runtime.refreshes, []);
  assert.deepEqual(runtime.priorities, []);
});

test('setup repairs missing aliases when the old cn registration is already recorded', async () => {
  const runtime = environment({recorded: [{module: MODULE_ID, lang: 'cn', dirs: ['compendium']}]});
  await runtime.fire('setup');
  assert.deepEqual(runtime.extraRegistrations(), [
    {module: MODULE_ID, lang: 'zh-CN', dir: 'compendium'},
    {module: MODULE_ID, lang: 'zh-Hans', dir: 'compendium'},
  ]);
  await runtime.fire('setup');
  assert.equal(runtime.extraRegistrations().length, 2);
});

test('ready repairs partial recordings and reapplies the late source only once', async () => {
  const runtime = environment({recorded: [{module: MODULE_ID, lang: 'cn', dirs: ['compendium']}]});
  await runtime.fire('ready');
  assert.deepEqual(runtime.extraRegistrations().map(row => row.lang), ['zh-CN', 'zh-Hans']);
  assert.deepEqual(runtime.refreshes, [
    'labels', 'titles', {shareSources: false, notify: false, rebuildDocumentIndexNow: true},
  ]);
  await runtime.fire('ready');
  assert.equal(runtime.extraRegistrations().length, 2);
  assert.equal(runtime.refreshes.length, 3);
});

test('registration before the old patch recording wrapper is repaired at setup', async () => {
  const runtime = environment({patch: false});
  await runtime.fire('babele.init');
  runtime.babele.__ondemandPatch = {
    registeredModules: [{module: CHN_MODULE_ID, lang: 'cn', dirs: ['zh-CN', 'compendium']}],
  };
  await runtime.fire('setup');
  assert.deepEqual(runtime.extraRegistrations().map(row => row.lang), ['cn', 'zh-CN', 'zh-Hans', 'cn', 'zh-CN', 'zh-Hans']);
  await runtime.fire('setup');
  assert.equal(runtime.extraRegistrations().length, 6);
});

test('each registered alias retains extra precedence without repeated setting writes', async () => {
  for (const lang of ['cn', 'zh-CN', 'zh-Hans']) {
    const extra = `module:${MODULE_ID}:${lang}`;
    const other = `module:${CHN_MODULE_ID}:${lang}`;
    const row = {collection: 'pf2e-bastion-of-blasphemies.bastion-of-blasphemies', sources: [extra, other]};
    const runtime = environment({isGM: true, overlaps: [row]});
    runtime.babele.setSourcePriority = async (collection, sources) => {
      runtime.priorities.push({collection, sources: [...sources]});
      row.sources = [...sources];
    };
    await runtime.fire('babele.init');
    await runtime.fire('ready');
    assert.deepEqual(runtime.priorities, [{collection: row.collection, sources: [other, extra]}]);
    await runtime.fire('ready');
    assert.equal(runtime.priorities.length, 1);
  }
});
