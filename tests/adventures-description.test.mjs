import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import test from 'node:test';
import {pathToFileURL} from 'node:url';

const converters = {};
const previousHooks = globalThis.Hooks;
globalThis.Hooks = {once(event, callback) {
  if (event === 'babele.init') callback({registerConverters: entries => Object.assign(converters, entries)});
}};
try {
  await import('../scripts/adventures-text-register.mjs');
} finally {
  globalThis.Hooks = previousHooks;
}

const versions = {sources: [
  {source: '<p>If you Unleash the Monster while under a mutagen.</p>', translation: '<p>若你在突变药剂影响下释放怪物。</p>'},
  {source: '<p>While under a mutagen.</p>', translation: '<p>当你受到突变药剂影响时。</p>'},
]};

function translate(source, translation) {
  assert.equal(typeof converters['adventures-description'], 'function');
  return converters['adventures-description'](source, translation);
}

test('the registered description converter selects only the exact source field', () => {
  assert.equal(translate(versions.sources[0].source, versions), '<p>若你在突变药剂影响下释放怪物。</p>');
  assert.equal(translate(versions.sources[1].source, versions), '<p>当你受到突变药剂影响时。</p>');
  assert.equal(translate('<p>Future rule.</p>', versions), undefined);
  assert.equal(translate(`${versions.sources[0].source} `, versions), undefined);
});

test('ordinary string translations and user overrides keep their existing behavior', () => {
  assert.equal(translate('<p>Original.</p>', '<p>译文。</p>'), '<p>译文。</p>');
  assert.equal(translate('<p>Future rule.</p>', '用户覆盖'), '用户覆盖');
  assert.equal(translate('<p>Original.</p>', ''), '');
});

test('non-string source values and invalid translation rows are left untouched', () => {
  for (const source of [undefined, null, 3, false, [], {}]) {
    assert.equal(translate(source, versions), undefined);
    assert.equal(translate(source, '译文'), undefined);
  }
  for (const translation of [undefined, null, 3, [], {}, {sources: {}},
    {sources: [null, 3, [], {source: versions.sources[0].source, translation: {}}]}]) {
    assert.equal(translate(versions.sources[0].source, translation), undefined);
  }
});

test('previously translated descriptions do not switch to another source variant', () => {
  for (const row of versions.sources) assert.equal(translate(row.translation, versions), undefined);
});

async function withBabele(callback) {
  const root = pathToFileURL(`${resolve(process.env.BABELE_MODULE_ROOT)}/`);
  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  function mergeObject(target, source, {inplace = true} = {}) {
    const result = inplace ? target : structuredClone(target);
    for (const [key, value] of Object.entries(source)) {
      result[key] = isObject(value)
        ? mergeObject(isObject(result[key]) ? result[key] : {}, value) : structuredClone(value);
    }
    return result;
  }
  const previousFoundry = globalThis.foundry, previousHooks = globalThis.Hooks;
  globalThis.foundry = {utils: {deepClone: structuredClone, mergeObject, Collection: Map,
    parseUuid: uuid => uuid ? {id: uuid.split('.').at(-1)} : null,
    getProperty: (data, path) => path.split('.').reduce((value, key) => value?.[key], data),
  }};
  globalThis.Hooks = {callAll() {}};
  try {
    const [{MappedCompendium}, {DocumentMappings}, {ConverterRegistry}, {IdentityExtractorRegistry}] = await Promise.all([
      import(new URL('script/compendium/mapped-compendium.js', root)),
      import(new URL('script/mapping/document-mappings.js', root)),
      import(new URL('script/converter/converter-registry.js', root)),
      import(new URL('script/identity/identity-extractor-registry.js', root)),
    ]);
    const documentMappings = new DocumentMappings({Item: {name: 'name', description: 'system.description.value'}}, {
      identityExtractors: new IdentityExtractorRegistry(IdentityExtractorRegistry.defaultExtractors()),
      converterRegistry: new ConverterRegistry(converters),
    });
    await callback((id, translations) => new MappedCompendium({id, type: 'Item'}, translations, {documentMappings}));
  } finally {
    globalThis.foundry = previousFoundry;
    globalThis.Hooks = previousHooks;
  }
}

const mapping = {
  description: {path: 'system.description.value', converter: 'adventures-description'},
  adventuresText: {path: 'system', converter: 'adventures-item-text'},
};

test('real Babele merges versioned descriptions with rule text and preserves unknown fields', {
  skip: !process.env.BABELE_MODULE_ROOT && 'set BABELE_MODULE_ROOT to a Babele 2.9.1 installation',
}, async () => withBabele(makePack => {
  for (const fields of [mapping, Object.fromEntries(Object.entries(mapping).reverse())]) {
    const pack = makePack('pf2e-team-plus-adventures.pf2e-items', {mapping: fields, entries: {
      Scientist: {name: '科学家 Scientist', description: versions,
        adventuresText: [{path: ['rules', 0, 'label'], source: 'Bombs', translation: '炸弹'}]},
      Ordinary: {description: '<p>普通译文。</p>'},
    }});
    for (const [source, expected] of [
      [versions.sources[0].source, '<p>若你在突变药剂影响下释放怪物。</p>'],
      [versions.sources[1].source, '<p>当你受到突变药剂影响时。</p>'],
      ['<p>Future rule.</p>', '<p>Future rule.</p>'],
      ['<p>若你在突变药剂影响下释放怪物。</p>', '<p>若你在突变药剂影响下释放怪物。</p>'],
      [null, null], [{value: 'unexpected object'}, {value: 'unexpected object'}],
    ]) {
      const item = {_id: 'scientist', name: 'Scientist', type: 'feat', system: {
        description: {value: source, gm: 'GM notes'}, rules: [{key: 'FlatModifier', label: 'Bombs', value: 1}],
      }};
      const before = structuredClone(item);
      const result = pack.translate(item);
      assert.deepEqual(result.system.description.value, expected);
      assert.equal(result.system.description.gm, 'GM notes');
      assert.equal(result.system.rules[0].label, '炸弹');
      assert.equal(result.system.rules[0].value, 1);
      assert.equal(result.name, '科学家 Scientist');
      assert.equal(pack.translate(result), result);
      assert.deepEqual(item, before);
      if (typeof source === 'string') assert.equal(pack.translateField('description', item), expected);
    }
    const ordinary = {name: 'Ordinary', system: {description: {value: '<p>Original.</p>'}}};
    assert.equal(pack.translate(ordinary).system.description.value, '<p>普通译文。</p>');
  }
}));

test('published Scientist variants translate the official 1.0.0 and 1.0.1 PF/SF descriptions', {
  skip: !(process.env.BABELE_MODULE_ROOT && process.env.ADVENTURES_100_RAW_ROOT && process.env.ADVENTURES_101_RAW_ROOT)
    && 'set BABELE_MODULE_ROOT, ADVENTURES_100_RAW_ROOT and ADVENTURES_101_RAW_ROOT for official source regression',
}, async () => withBabele(makePack => {
  for (const edition of ['pf2e', 'sf2e']) {
    const id = `pf2e-team-plus-adventures.${edition}-items`;
    const translations = JSON.parse(readFileSync(new URL(`../compendium/${id}.json`, import.meta.url), 'utf8'));
    const pack = makePack(id, translations);
    for (const [index, rawRoot] of [process.env.ADVENTURES_100_RAW_ROOT, process.env.ADVENTURES_101_RAW_ROOT].entries()) {
      const docs = JSON.parse(readFileSync(resolve(rawRoot, `${edition}-items.json`), 'utf8')).docs;
      const source = docs.find(item => item.name === 'Scientist');
      const before = structuredClone(source);
      const entry = translations.entries[source._id];
      assert.equal(entry.description.sources[index].source, source.system.description.value);
      const translated = pack.translate(source);
      assert.equal(translated.system.description.value, entry.description.sources[index].translation);
      const blessing = translated.system.description.value.match(/<p><strong>宿主祝福<\/strong>.*?<\/p>/)?.[0];
      assert.ok(blessing, `${edition} ${index}: missing Blessing paragraph`);
      assert.equal(blessing.includes('{释放怪物}'), index === 0);
      assert.equal(pack.translate(translated), translated);
      assert.deepEqual(source, before);
      const unknown = structuredClone(source);
      unknown.system.description.value += '<p>Future change.</p>';
      assert.equal(pack.translate(unknown).system.description.value, unknown.system.description.value);
    }
  }
}));
