import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const script = readFileSync(new URL('../scripts/inject-homebrew.js', import.meta.url), 'utf8');

async function inject(config, homebrew) {
  const moduleId = 'pf2e-team-plus-adventures';
  const base = 'modules/pf2e-compendium-extra-cn/homebrew/';
  const files = new Map([
    [`${base}index.json`, {modules: [moduleId]}],
    [`${base}${moduleId}.homebrew.json`, {homebrew}],
  ]);
  const hooks = new Map();
  vm.runInNewContext(script, {
    CONFIG: {PF2E: config},
    Hooks: {once: (name, callback) => hooks.set(name, callback)},
    game: {system: {id: 'pf2e'}, i18n: {lang: 'cn'},
      modules: new Map([[moduleId, {active: true, flags: {[moduleId]: {'pf2e-homebrew': {}}}}]])},
    fetch: async url => ({ok: files.has(url), json: async () => files.get(url)}),
    console: {log() {}, warn: message => assert.fail(message)},
  });
  await hooks.get('setup')();
}

test('feat labels reach existing action traits without changing other records', async () => {
  const config = {
    featTraits: {latent: 'Latent', mortal: 'Mortal', unrelated: 'Unrelated feat'},
    actionTraits: {latent: 'Latent', unrelated: 'Unrelated action'},
    effectTraits: {latent: 'Unrelated effect'},
    weaponTraits: {latent: 'Unrelated weapon'},
    traitsDescriptions: {latent: 'Latent description', mortal: 'Mortal description', unrelated: 'Unrelated description'},
  };
  await inject(config, {featTraits: {
    latent: {label: '潜能 Latent', description: '只能在怪物形态使用。'},
    mortal: {label: '凡人 Mortal', description: '只能在凡人形态使用。'},
  }});
  assert.deepEqual(config, {
    featTraits: {latent: '潜能 Latent', mortal: '凡人 Mortal', unrelated: 'Unrelated feat'},
    actionTraits: {latent: '潜能 Latent', unrelated: 'Unrelated action'},
    effectTraits: {latent: 'Unrelated effect'},
    weaponTraits: {latent: 'Unrelated weapon'},
    traitsDescriptions: {latent: '只能在怪物形态使用。', mortal: '只能在凡人形态使用。', unrelated: 'Unrelated description'},
  });
});

test('feat translation does not create absent action records or labels', async () => {
  for (const mirror of [{}, {actionTraits: {}}]) {
    const config = {featTraits: {latent: 'Latent'}, traitsDescriptions: {latent: 'PF2E.TraitDescriptionLatent'}, ...mirror};
    const expected = {
      featTraits: {latent: '潜能 Latent'}, traitsDescriptions: {latent: 'PF2E.TraitDescriptionLatent'}, ...structuredClone(mirror),
    };
    await inject(config, {featTraits: {
      latent: {label: '潜能 Latent', description: 'PF2E.TraitDescriptionLatent'},
      absent: '未注册特征',
    }});
    assert.deepEqual(config, expected);
  }
});
