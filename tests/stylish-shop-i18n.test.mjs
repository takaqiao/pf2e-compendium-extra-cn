import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const EXTRA_ID = 'pf2e-compendium-extra-cn';
const STYLISH_SHOP_ID = 'stylish-shop';
const languagePath = new URL('../lang/external/stylish-shop.json', import.meta.url).href;
const hooks = new Map();
globalThis.Hooks = {once(name, callback) {
  const callbacks = hooks.get(name) ?? [];
  callbacks.push(callback);
  hooks.set(name, callbacks);
}};
await import('../inject-lang.js');
delete globalThis.Hooks;

function environment({system = 'pf2e', extra = true, shop = true, languages = []} = {}) {
  const module = {active: extra, languages: new Set(languages)};
  const modules = new Map([[EXTRA_ID, module]]);
  if (shop !== null) modules.set(STYLISH_SHOP_ID, {active: shop});
  globalThis.game = {system: {id: system}, modules,
    get i18n() {throw new Error('Client language is not initialized during init');},
  };
  return {module, init() {
    for (const callback of hooks.get('init') ?? []) callback();
  }};
}

const shopEntries = module => [...module.languages].filter(entry => entry.module === STYLISH_SHOP_ID);

test('Chinese language files for Stylish Shop are registered on Extra before localization loads', () => {
  const runtime = environment();
  runtime.init();
  assert.deepEqual(shopEntries(runtime.module).map(({lang, path, system}) => ({lang, path, system})), [
    {lang: 'cn', path: languagePath, system: 'pf2e'},
    {lang: 'zh-CN', path: languagePath, system: 'pf2e'},
    {lang: 'zh-Hans', path: languagePath, system: 'pf2e'},
  ]);
});

test('missing or disabled modules and other systems register nothing', () => {
  for (const options of [{extra: false}, {shop: false}, {shop: null}, {system: 'dnd5e'}]) {
    const runtime = environment(options);
    runtime.init();
    assert.equal(runtime.module.languages.size, 0);
  }
});

test('repeated registration keeps existing entries without duplicating Stylish Shop', () => {
  const unrelated = {lang: 'cn', path: 'modules/other/cn.json', module: 'other'};
  const runtime = environment({languages: [unrelated]});
  runtime.init();
  runtime.init();
  assert.equal(shopEntries(runtime.module).length, 3);
  assert.ok(runtime.module.languages.has(unrelated));
});

test('the language file only holds Chinese strings under the Stylish Shop namespace', async () => {
  const data = JSON.parse(await readFile(new URL(languagePath), 'utf8'));
  assert.deepEqual(Object.keys(data), ['STYLISH_SHOP']);
  const leaves = [];
  const walk = node => {
    for (const value of Object.values(node)) {
      if (value && typeof value === 'object') walk(value);
      else leaves.push(value);
    }
  };
  walk(data);
  assert.ok(leaves.length > 0);
  assert.ok(leaves.every(value => typeof value === 'string' && /[一-鿿]/.test(value)));
});
