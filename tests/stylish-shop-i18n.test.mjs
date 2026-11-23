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

const overridesPath = new URL('../lang/external/stylish-shop-overrides.json', import.meta.url);
const readJson = async url => JSON.parse(await readFile(url, 'utf8'));
const get = (node, path) => path.split('.').reduce((value, key) => value?.[key], node);
const leafPaths = (node, prefix = '') => Object.entries(node).flatMap(([key, value]) =>
  value && typeof value === 'object' ? leafPaths(value, `${prefix}${key}.`) : [`${prefix}${key}`]);

test('the language files only hold Chinese strings under the Stylish Shop namespace', async () => {
  for (const url of [new URL(languagePath), overridesPath]) {
    const data = await readJson(url);
    assert.deepEqual(Object.keys(data), ['STYLISH_SHOP']);
    const leaves = leafPaths(data).map(path => get(data, path));
    assert.ok(leaves.length > 0);
    assert.ok(leaves.every(value => typeof value === 'string' && /[一-鿿]/.test(value)), url.href);
  }
});

// Keys whose English changed in Stylish Shop 2.1 while zzz_mod_chn 13.99 kept the old wording.
const REWORDED = [
  'config.audioTab.sfx.SHOP_OPEN',
  'config.audioTab.sfxHint',
  'config.audioTab.sfxOverridesHint',
  'config.identity.directoryArtHint',
  'config.npcArt',
  'settingsCenter.sections.personal.interface.description',
  'settingsCenter.tabs.world.description',
];
// zzz_mod_chn 13.99's strings for those keys, plus one key 2.1 left alone.
const ZZZ = {STYLISH_SHOP: {
  settingsCenter: {
    tabs: {world: {description: '新商店与互动默认值'}},
    sections: {personal: {interface: {description: '在标题栏空间有限时保持角色卡控件紧凑。'}}},
  },
  config: {
    npcArt: '店主图片',
    audioTab: {
      sfxTitle: '音效',
      sfxHint: '每个商店的音效覆盖。留空则使用主题默认值。',
      sfxOverridesHint: '用你自己的文件覆盖各个音效。',
      sfx: {SHOP_OPEN: '商店打开'},
    },
    identity: {directoryArtHint: '可选覆盖此商店目录卡片上显示的图片。留空则回退到 NPC 立绘（然后是角色头像）。'},
  },
}};

function merge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && target[key] && typeof target[key] === 'object') merge(target[key], value);
    else target[key] = structuredClone(value);
  }
  return target;
}

async function initializeLocalization({lang = 'cn', system = 'pf2e', shop = true} = {}) {
  const native = await readJson(new URL(languagePath));
  // Foundry merges Extra's language files first and zzz_mod_chn's after them.
  const translations = merge(merge({}, native), ZZZ);
  const before = structuredClone(translations);
  const fetched = [];
  const realFetch = globalThis.fetch;
  globalThis.foundry = {utils: {mergeObject: merge}};
  globalThis.fetch = async url => {
    fetched.push(url);
    const file = new URL(`../${url.replace(`modules/${EXTRA_ID}/`, '')}`, import.meta.url);
    return {ok: true, json: () => readJson(file)};
  };
  globalThis.game = {system: {id: system}, i18n: {lang, translations},
    modules: new Map([[EXTRA_ID, {active: true}], [STYLISH_SHOP_ID, {active: shop}]])};
  try {
    for (const callback of hooks.get('i18nInit') ?? []) await callback();
  } finally {
    globalThis.fetch = realFetch;
    delete globalThis.foundry;
  }
  return {native, before, translations, fetched};
}

test('Stylish Shop 2.1 rewordings replace the zzz_mod_chn strings at i18nInit', async t => {
  t.mock.method(console, 'log', () => {});
  const overrides = await readJson(overridesPath);
  const {native, translations, fetched} = await initializeLocalization();
  assert.deepEqual(fetched, [`modules/${EXTRA_ID}/lang/external/stylish-shop-overrides.json`]);
  for (const key of REWORDED) {
    assert.equal(get(translations.STYLISH_SHOP, key), get(overrides.STYLISH_SHOP, key), key);
    assert.notEqual(get(translations.STYLISH_SHOP, key), get(ZZZ.STYLISH_SHOP, key), key);
  }
  assert.equal(translations.STYLISH_SHOP.config.audioTab.sfxTitle, '音效');
  for (const path of leafPaths(native)) assert.equal(get(translations, path), get(native, path), path);
});

test('English clients, other systems and a disabled Stylish Shop keep the zzz_mod_chn strings', async t => {
  t.mock.method(console, 'log', () => {});
  for (const options of [{lang: 'en'}, {system: 'dnd5e'}, {shop: false}]) {
    const {before, translations, fetched} = await initializeLocalization(options);
    assert.deepEqual(fetched, [], JSON.stringify(options));
    assert.deepEqual(translations, before, JSON.stringify(options));
  }
});

test('the override file holds exactly the reworded keys, and the native file none of them', async () => {
  const overrides = await readJson(overridesPath);
  const native = await readJson(new URL(languagePath));
  assert.deepEqual(leafPaths(overrides.STYLISH_SHOP).sort(), [...REWORDED].sort());
  for (const key of REWORDED) assert.equal(get(native.STYLISH_SHOP, key), undefined, key);
});
