import test from 'node:test';
import assert from 'node:assert/strict';
import {
  selectSogTranslationFiles, refreshOnDemandSogSources, installOnDemandSogGuard,
  installPublishedSogGuard,
} from '../scripts/sog-851-core.mjs';

const moduleId = 'pf2e-compendium-extra-cn';
const bob = 'pf2e.bastion-of-blasphemies-bestiary';
const sog = 'pf2e.season-of-ghosts-bestiary';
const base = pack => `modules/${moduleId}/compendium/${pack}.json`;
const variant = pack => `modules/${moduleId}/compendium-851/${pack}.json`;
function environment(version = '8.5.1', mode = 'full') {
  return {
    system: {id: 'pf2e', version},
    user: {isGM: true},
    modules: new Map([
      [moduleId, {active: true}],
      ['babele', {active: true, version: '2.9.1'}],
      ['pf2e_compendium_chn', {active: true, version: '3.1.2'}],
    ]),
    settings: {get: (module, setting) => setting === 'language' ? 'cn' : setting === 'loadingMode' ? mode : ''},
  };
}

test('8.5.1 adds BoB after its base while keeping custom source precedence', () => {
  const custom = 'worlds/custom/cn/pf2e.bastion-of-blasphemies-bestiary.json';
  const files = [base(bob), custom, 'unrelated.json'];
  assert.deepEqual(selectSogTranslationFiles(files, environment()), [base(bob), variant(bob), custom, 'unrelated.json']);
  assert.deepEqual(files, [base(bob), custom, 'unrelated.json']);
});

test('8.5.0 repairs a stale published BoB variant to the base', () => {
  assert.deepEqual(selectSogTranslationFiles([variant(bob), 'other.json'], environment('8.5.0')), [base(bob), 'other.json']);
  assert.deepEqual(selectSogTranslationFiles([base(bob), variant(bob)], environment('8.5.0')), [base(bob)]);
});

test('SoG and BoB version selection compose and are idempotent', () => {
  const selected = selectSogTranslationFiles([base(sog), base(bob)], environment());
  assert.deepEqual(selected, [base(sog), variant(sog), base(bob), variant(bob)]);
  assert.strictEqual(selectSogTranslationFiles(selected, environment()), selected);
  assert.deepEqual(selectSogTranslationFiles(selected, environment('8.5.0')), [base(sog), base(bob)]);
});

test('source object metadata survives BoB variant insertion', () => {
  const row = {file: base(bob), directory: `modules/${moduleId}/compendium`, source: 'custom-preserved', extra: 7};
  assert.deepEqual(selectSogTranslationFiles([row], environment()), [row, {...row, file: variant(bob), directory: `modules/${moduleId}/compendium-851`}]);
});

test('unsupported versions, language and inactive module leave files untouched', () => {
  const files = [base(bob)];
  for (const version of ['8.4.0', '8.5.2', '9.0.0']) assert.strictEqual(selectSogTranslationFiles(files, environment(version)), files);
  const english = environment(); english.settings.get = () => 'en';
  assert.strictEqual(selectSogTranslationFiles(files, english), files);
  const inactive = environment(); inactive.modules.get(moduleId).active = false;
  assert.strictEqual(selectSogTranslationFiles(files, inactive), files);
});

function onDemandBabele() {
  const state = {translationFilesCache: [base(sog), base(bob)], packTranslationUrls: new Map([[bob, [base(bob)]], [sog, [base(sog)]], ['other', ['other.json']]])};
  const ensurePackTranslationsLoaded = (_babele, patch, collection) => patch.packTranslationUrls.get(collection);
  const babele = {__ondemandPatch: state};
  babele.ensurePackTranslationsLoaded = async (collection) => ensurePackTranslationsLoaded(babele, state, collection);
  return babele;
}

test('cold on-demand BoB request selects variant before the native loader reads URLs', async () => {
  globalThis.game = environment('8.5.1', 'ondemand');
  const babele = onDemandBabele();
  assert.equal(installOnDemandSogGuard(babele), true);
  assert.deepEqual(await babele.ensurePackTranslationsLoaded(bob), [base(bob), variant(bob)]);
  assert.deepEqual(babele.__ondemandPatch.packTranslationUrls.get('other'), ['other.json']);
  assert.deepEqual(babele.__ondemandPatch.packTranslationUrls.get(sog), [base(sog), variant(sog)]);
  assert.equal(installOnDemandSogGuard(babele), false);
});

test('unknown on-demand loader is not patched or its sources changed', () => {
  globalThis.game = environment('8.5.1', 'ondemand');
  const babele = onDemandBabele();
  babele.ensurePackTranslationsLoaded = async () => [];
  const original = babele.ensurePackTranslationsLoaded;
  assert.equal(installOnDemandSogGuard(babele), false);
  assert.equal(refreshOnDemandSogSources(babele), false);
  assert.strictEqual(babele.ensurePackTranslationsLoaded, original);
  assert.deepEqual(babele.__ondemandPatch.packTranslationUrls.get(bob), [base(bob)]);
});

test('native published-source wrapper repairs BoB without changing the other sources', async () => {
  globalThis.game = environment();
  class Published {
    #buildFiles(_kind, files) { return Promise.resolve(files); }
    _translationFiles() { return [base(bob), 'other.json']; }
    async translationFiles() {
        return this.#buildFiles("translation", this._translationFiles());
    }
  }
  assert.equal(installPublishedSogGuard(Published), true);
  assert.deepEqual(await new Published().translationFiles(), [base(bob), variant(bob), 'other.json']);
  assert.equal(installPublishedSogGuard(Published), false);
});
