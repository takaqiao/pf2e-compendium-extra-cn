import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import * as sog from '../scripts/sog-851-core.mjs';
const {createSogSourceTextConverter, registerSogSourceFields, sogTranslationDirectory} = sog;

const packs = ['pf2e.season-of-ghosts-bestiary', 'pf2e.bastion-of-blasphemies-bestiary'];

test('both published directory paths carry identical translations', () => {
  for (const pack of packs) {
    assert.equal(readFileSync(new URL(`../compendium/${pack}.json`, import.meta.url), 'utf8'),
      readFileSync(new URL(`../compendium-851/${pack}.json`, import.meta.url), 'utf8'));
    for (const version of ['8.5.0', '8.5.1', '8.6.0', '9.99.0']) {
      assert.equal(sogTranslationDirectory(pack, {system: {version}}), 'compendium');
    }
  }
});

test('source text matching changes only a known field and accepts a user string override', () => {
  const converter = createSogSourceTextConverter();
  const translation = {sources: [['old rule', '旧规则'], ['new rule', '新规则']]};
  assert.equal(converter.translate({value: 'old rule', translation}), '旧规则');
  assert.equal(converter.translate({value: 'new rule', translation}), '新规则');
  assert.equal(converter.translate({value: 'future rule', translation}), undefined);
  assert.equal(converter.translate({value: 'future rule', translation: '用户覆盖'}), '用户覆盖');
  assert.equal(converter.translate({value: 'future rule', translation: {sources: [null, 4, []]}}), undefined);
  assert.equal(converter.translate({value: {}, translation: '用户覆盖'}), undefined);
  assert.equal(converter.extract({value: 'original'}), 'original');
});

test('actual entrypoint registers synchronously without reading documents or choosing sources', async () => {
  const hooks = new Map(), converters = new Map();
  const nativeDocument = {prepare() {}, translate() {}, extract() {}};
  converters.set('document', nativeDocument);
  globalThis.Hooks = {once: (event, callback) => hooks.set(event, [...(hooks.get(event) ?? []), callback]), on() {}};
  globalThis.game = {get packs() { throw new Error('init must not load documents'); }};
  const source = readFileSync(new URL('../scripts/sog-851.mjs', import.meta.url), 'utf8');
  vm.runInNewContext(source.replace(/^import[^\n]+\n/gm, ''), {
    ...sog, Hooks, PublishedTranslationSource: class {}, game, console,
  });
  const facade = {converterRegistry: {named: name => converters.get(name)},
    registerConverters: entries => Object.entries(entries).forEach(([name, converter]) => converters.set(name, converter))};
  assert.equal(hooks.get('babele.init')[0](facade), true);
  hooks.get('babele.init').slice(1).forEach(callback => callback(facade));
  assert.equal(converters.get('sog-source-text').translate({value: 'x', translation: '译文'}), '译文');
  assert.equal(typeof converters.get('sog-source-items').translate, 'function');
  assert.equal(registerSogSourceFields(facade), false);
  assert.equal(converters.get('document'), nativeDocument);
});

test('source priority is preserved in old on-demand caches without version selection', async () => {
  const pack = packs[1], base = `modules/pf2e-compendium-extra-cn/compendium/${pack}.json`;
  const custom = `worlds/custom/cn/${pack}.json`;
  for (const customLast of [true, false]) {
    const priority = customLast ? ['module:pf2e-compendium-extra-cn:cn', 'directory']
      : ['directory', 'module:pf2e-compendium-extra-cn:cn'];
    globalThis.game = {system: {id: 'pf2e', version: '9.99.0'}, i18n: {lang: 'cn'},
      modules: new Map([['pf2e-compendium-extra-cn', {active: true}], ['babele', {active: true}]]),
      settings: {get: (_module, key) => ({language: 'cn', directory: 'worlds/custom', loadingMode: 'ondemand'}[key])}};
    const state = {translationFilesCache: [base, custom], packTranslationUrls: new Map([[pack, [base, custom]]])};
    const babele = {__ondemandPatch: state, sourcePriority: () => ({global: priority}),
      ensurePackTranslationsLoaded: async collection => state.packTranslationUrls.get(collection)};
    sog.installOnDemandSogGuard?.(babele);
    assert.deepEqual(await babele.ensurePackTranslationsLoaded(pack), customLast ? [base, custom] : [custom, base]);
  }
});

test('registration preserves already registered converters and absent APIs', () => {
  const foreign = {translate() {return 'foreign';}};
  assert.equal(registerSogSourceFields({converterRegistry: {named: () => foreign}, registerConverters() {
    assert.fail('must preserve an existing converter');
  }}), false);
  assert.equal(registerSogSourceFields({}), false);
});
