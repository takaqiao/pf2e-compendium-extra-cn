import assert from 'node:assert/strict';
import test from 'node:test';
import {installBobMementoProgress as install} from '../scripts/bob-memento-progress-core.mjs';
const MODULE_ID = 'pf2e-bastion-of-blasphemies';
const ARUDORA_FOUNTAIN = {actorId: 'cHogqC3igqd7t1hM'};
const mappings = [
  ['grounds', 'cellars', 'jinniveres-riding-crop'],
  ['cellars', 'reception', 'augstens-cudgel'],
  ['reception', 'dungeon', 'alisendras-fan'],
  ['dungeon', 'private', 'dazeriens-thumbscrew'],
  ['private', 'temple', 'raudltzs-telescope'],
  ['temple', 'vault', 'ryhasphineas-hourglass'],
  ['vault', 'towers', 'irrokciss-medallion']
];
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => {resolve = yes; reject = no;});
  return {promise, resolve, reject};
};
const tick = () => new Promise(resolve => setImmediate(resolve));

function fixture({isGM = true, isActiveGM = true} = {}) {
  const events = [], errors = [], gates = {};
  let saved = {areas: Object.fromEntries(mappings.map(([id, next, slug]) =>
    [id, {id, next: {id: next}, memento: {slug, returned: false, statueId: `${id}-statue`}}])),
    research: {discovered: true}};
  const bastion = {};
  const game = {user: {isGM, isActiveGM}, system: {id: 'pf2e'},
    modules: new Map([[MODULE_ID, {active: true}]]),
    pf2e: {system: {sluggify: name => name.toLowerCase().replaceAll(' ', '-')}},
    settings: {
      get(module, key) {
        assert.equal(module, MODULE_ID);
        assert.equal(key, 'campaign');
        // toObject must retain the fetched snapshot, as the real DataModel does.
        const data = structuredClone(saved);
        const source = structuredClone(saved);
        data.toObject = () => structuredClone(source);
        return data;
      },
      async set(module, key, update) {
        assert.equal(module, MODULE_ID);
        assert.equal(key, 'campaign');
        events.push(['setting', structuredClone(update)]);
        if (gates.setting) await gates.setting;
        if (gates.failSetting) {gates.failSetting = false; throw new Error('setting failed');}
        saved = structuredClone(update);
        bastion.manager.onUpdateCampaignData();
        return update;
      }
    }};
  const foundry = {utils: {iterateValues: object => Object.values(object)}};
  class WorldStateHandlers {
    get #data() {return bastion.manager.data;}
    async #toggleAreaAccess(areaId) {
      if (gates.access) await gates.access;
      if (gates.failAccess) {gates.failAccess = false; throw new Error('access failed');}
      const prior = mappings.find(([, next]) => next === areaId)[0];
      events.push(['access', areaId, this.#data.areas[prior].memento.returned]);
    }
    async toggleMementoReturned(areaId, returned) {
      const area = this.#data.areas[areaId];
      if (!area?.memento) throw new Error('No memento in this area');
      returned ??= !area.memento.returned;
      const setting = this.#data.toObject();
      setting.areas[areaId].memento.returned = returned;
      const tile = {update: async data => {
        if (gates.tile) await gates.tile;
        if (gates.failTile) {gates.failTile = false; throw new Error('tile failed');}
        events.push(['tile', area.memento.statueId, data]);
      }};
      await game.settings.set(MODULE_ID, 'campaign', setting);
      await Promise.all([tile.update({hidden: !returned, alpha: Number(returned)}),
        this.#toggleAreaAccess(area.next.id)]);
    }
  }
  class CampaignManager {
    #stateHandlers = new WorldStateHandlers();
    data = game.settings.get(MODULE_ID, 'campaign');
    rendered = false;
    async render() {
      if (this.rendered) this.data = game.settings.get(MODULE_ID, 'campaign');
    }
    async toggleMementoReturn(areaId, returned) {
      this.#stateHandlers.toggleMementoReturned(areaId, returned);
    }
    async onUpdateCampaignData() {
      if (!game.user.isGM) return;
      await this.render();
      if (!game.user.isActiveGM) return;
      if (gates.weather) await gates.weather;
      if (gates.failWeather) {gates.failWeather = false; throw new Error('weather failed');}
      events.push(['weather', Object.values(this.data.areas).filter(area => area.memento.returned).map(area => area.id)]);
    }
    async reset(areaId) {await this.#stateHandlers.toggleMementoReturned(areaId);}
    async skip(areaId) {await this.#stateHandlers.toggleMementoReturned(areaId);}
  }
  // Only the native hook's selection and dispatch contract is modeled here.
  const callback = item => {
    if (item.parent?.id !== ARUDORA_FOUNTAIN.actorId) return;
    const data = game.settings.get(MODULE_ID, 'campaign');
    for (const area of foundry.utils.iterateValues(data.areas)) {
      const itemSlug = item.slug ?? game.pf2e.system.sluggify(item.name);
      if (itemSlug === area.memento?.slug) {
        if (!item.slug) item.update({'system.slug': itemSlug});
        events.push(['sound']);
        if (game.user.isActiveGM) bastion.manager.toggleMementoReturned(area.id, true);
        break;
      }
    }
  };
  const Hooks = {events: {createItem: [{fn: callback}]}};
  bastion.manager = new CampaignManager();
  const options = {game, Hooks, CampaignManager, WorldStateHandlers, getManager: () => bastion.manager,
    onError: error => errors.push(error.message)};
  return {game, Hooks, options, events, errors, gates, WorldStateHandlers, CampaignManager,
    get manager() {return bastion.manager;}, get saved() {return structuredClone(saved);},
    replaceManager() {bastion.manager = new CampaignManager();},
    externalUpdate() {saved.research.discovered = false;},
    create(slug, parentId = ARUDORA_FOUNTAIN.actorId, userId = 'player') {
      Hooks.events.createItem[0].fn({slug, name: slug, parent: {id: parentId}, update: data => events.push(['item', data])}, {}, userId);
    }};
}

test('installation writes nothing and returns an active disposable adapter', () => {
  const f = fixture(), dispose = install(f.options);
  assert.equal(typeof f.manager.toggleMementoReturned, 'function');
  assert.equal(dispose.isActive(), true);
  assert.deepEqual(f.events, []);
  dispose();
  assert.equal(dispose.isActive(), false);
  assert.equal(f.manager.toggleMementoReturned, undefined);
});

test('all seven native mappings preserve statue, access and unrelated campaign state', async () => {
  const f = fixture(); install(f.options);
  f.externalUpdate();
  for (const [area, next] of mappings) {
    await f.manager.toggleMementoReturned(area, true);
    assert.equal(f.saved.areas[area].memento.returned, true);
    assert.ok(f.events.some(event => event[0] === 'tile' && event[1] === `${area}-statue` && event[2].alpha === 1));
    assert.ok(f.events.some(event => event[0] === 'access' && event[1] === next && event[2] === true));
  }
  assert.equal(f.saved.research.discovered, false);
  assert.deepEqual(f.events.filter(event => event[0] === 'weather').at(-1)[1], mappings.map(([area]) => area));
});

test('same-batch player creates use the closed manager and serialize different mementos', async () => {
  const f = fixture(); install(f.options);
  const gate = deferred(); f.gates.tile = gate.promise;
  f.create(mappings[0][2]); f.create(mappings[1][2]);
  await tick();
  assert.equal(f.events.filter(event => event[0] === 'setting').length, 1);
  gate.resolve(); await tick(); await tick();
  assert.equal(f.saved.areas.grounds.memento.returned, true);
  assert.equal(f.saved.areas.cellars.memento.returned, true);
  assert.equal(f.events.filter(event => event[0] === 'setting').length, 2);
});

test('public return awaits settings, statue, access and campaign notification work', async () => {
  const f = fixture(); install(f.options);
  const gates = ['setting', 'tile', 'access', 'weather'].map(key => {
    const gate = deferred(); f.gates[key] = gate.promise; return gate;
  });
  let finished = false;
  const result = f.manager.toggleMementoReturn('grounds', true).then(() => {finished = true;});
  for (const gate of gates) {await tick(); assert.equal(finished, false); gate.resolve();}
  await result;
  assert.equal(finished, true);
});

test('repeated true does not write, touch statues or close an already opened door', async () => {
  const f = fixture(); install(f.options);
  await f.manager.toggleMementoReturned('grounds', true);
  f.events.length = 0;
  await Promise.all([f.manager.toggleMementoReturned('grounds', true), f.manager.toggleMementoReturn('grounds', true)]);
  assert.deepEqual(f.events, []);
});

test('native reset/skip and explicit false share the automatic queue', async () => {
  const f = fixture(); install(f.options);
  await Promise.all([f.manager.toggleMementoReturned('grounds', true), f.manager.reset('grounds'), f.manager.skip('grounds')]);
  assert.equal(f.saved.areas.grounds.memento.returned, true);
  await f.manager.toggleMementoReturn('grounds', false);
  assert.equal(f.saved.areas.grounds.memento.returned, false);
  assert.deepEqual(f.events.filter(event => event[0] === 'tile').map(event => event[2].hidden), [false, true, false, true]);
});

test('active GM processes player creates; other clients and other items do not write', async () => {
  for (const role of [{isGM: false, isActiveGM: false}, {isGM: true, isActiveGM: false}]) {
    const f = fixture(role); install(f.options);
    f.create(mappings[0][2]); await tick();
    assert.equal(f.events.filter(event => event[0] === 'setting').length, 0);
    if (role.isGM) {
      await f.manager.toggleMementoReturn('grounds', true);
      assert.equal(f.saved.areas.grounds.memento.returned, true);
    } else {
      await f.manager.toggleMementoReturn('grounds', true);
      assert.equal(f.saved.areas.grounds.memento.returned, false);
    }
  }
  const f = fixture(); install(f.options);
  f.create('ordinary-item'); f.create(mappings[0][2], 'another-actor'); await tick();
  assert.deepEqual(f.events, []);
  f.create(mappings[0][2]); await tick();
  assert.equal(f.saved.areas.grounds.memento.returned, true);
  assert.equal(f.Hooks.events.deleteItem, undefined);
});

test('rebuilt managers keep the adapter and a lazy handler', async () => {
  const f = fixture(); install(f.options);
  f.replaceManager();
  await f.manager.toggleMementoReturned('grounds', true);
  f.replaceManager();
  await f.manager.toggleMementoReturn('cellars', true);
  assert.equal(f.saved.areas.grounds.memento.returned, true);
  assert.equal(f.saved.areas.cellars.memento.returned, true);
});

for (const failure of ['Setting', 'Tile', 'Access', 'Weather']) {
  test(`${failure} failure rejects visibly, permits same-value retry and does not poison the queue`, async () => {
    const f = fixture(); install(f.options); f.gates[`fail${failure}`] = true;
    await assert.rejects(f.manager.toggleMementoReturned('grounds', true), new RegExp(`${failure.toLowerCase()} failed`));
    assert.ok(f.errors.includes(`${failure.toLowerCase()} failed`));
    await f.manager.toggleMementoReturned('grounds', true);
    await f.manager.toggleMementoReturned('cellars', true);
    assert.equal(f.saved.areas.grounds.memento.returned, true);
    assert.equal(f.saved.areas.cellars.memento.returned, true);
    assert.ok(f.events.some(event => event[0] === 'tile' && event[1] === 'grounds-statue'));
  });
}

test('unawaited automatic failures are reported and later automatic returns continue', async () => {
  const f = fixture(); install(f.options); f.gates.failSetting = true;
  f.create(mappings[0][2]); await tick();
  assert.deepEqual(f.errors, ['setting failed']);
  f.create(mappings[1][2]); await tick();
  assert.equal(f.saved.areas.cellars.memento.returned, true);
});

test('native fixed entry and unsupported callback leave all original methods untouched', () => {
  for (const mode of ['native', 'hook', 'handler']) {
    const f = fixture();
    if (mode === 'native') f.CampaignManager.prototype.toggleMementoReturned = async () => 'native';
    if (mode === 'hook') f.Hooks.events.createItem[0].fn = () => {};
    if (mode === 'handler') f.WorldStateHandlers.prototype.toggleMementoReturned = async () => {};
    const before = Object.getOwnPropertyDescriptors(f.CampaignManager.prototype);
    assert.equal(install(f.options), null);
    assert.deepEqual(Object.getOwnPropertyDescriptors(f.CampaignManager.prototype), before);
    assert.deepEqual(f.events, []);
  }
});

test('dispose restores methods without removing a later wrapper', async () => {
  const f = fixture();
  const before = f.CampaignManager.prototype.toggleMementoReturn;
  const dispose = install(f.options);
  const added = f.CampaignManager.prototype.toggleMementoReturned;
  const outer = function (...args) {return added.apply(this, args);};
  f.CampaignManager.prototype.toggleMementoReturned = outer;
  dispose();
  assert.equal(f.CampaignManager.prototype.toggleMementoReturn, before);
  assert.equal(f.CampaignManager.prototype.toggleMementoReturned, outer);
  await f.manager.toggleMementoReturned('grounds', true);
  assert.deepEqual(f.events, []);
});

test('automatic permission is checked when queued work runs, while manual GM actions remain available', async () => {
  const f = fixture(); install(f.options);
  const gate = deferred(); f.gates.tile = gate.promise;
  const first = f.manager.toggleMementoReturned('grounds', true);
  await tick();
  const second = f.manager.toggleMementoReturned('cellars', true);
  f.game.user.isActiveGM = false;
  gate.resolve(); await Promise.all([first, second]);
  assert.equal(f.saved.areas.cellars.memento.returned, false);
  await f.manager.toggleMementoReturn('cellars', true);
  assert.equal(f.saved.areas.cellars.memento.returned, true);
});

test('disposal cancels queued work and restores exact prototype descriptors', async () => {
  const f = fixture();
  const beforeManager = Object.getOwnPropertyDescriptors(f.CampaignManager.prototype);
  const beforeHandler = Object.getOwnPropertyDescriptors(f.WorldStateHandlers.prototype);
  const dispose = install(f.options);
  const pending = f.manager.toggleMementoReturned('grounds', true);
  dispose(); await pending;
  assert.deepEqual(f.events, []);
  assert.deepEqual(Object.getOwnPropertyDescriptors(f.CampaignManager.prototype), beforeManager);
  assert.deepEqual(Object.getOwnPropertyDescriptors(f.WorldStateHandlers.prototype), beforeHandler);
});

test('bootstrap runs without display dependencies, language checks or an existing manager', async () => {
  const f = fixture();
  const once = [];
  globalThis.Hooks = {once: (...args) => once.push(args)};
  const compat = await import('../scripts/bob-memento-progress-compat.mjs');
  delete globalThis.Hooks;
  assert.equal(once[0][0], 'ready');
  let managerReady = false;
  await compat.installBobMementoProgressCompatibility({...f.options,
    getManager: () => {assert.equal(managerReady, true); return f.manager;},
    loadModule: async path => {
      if (path.endsWith('/manager.mjs')) return {CampaignManager: f.CampaignManager};
      if (path.endsWith('/state-handlers.mjs')) return {WorldStateHandlers: f.WorldStateHandlers};
      if (path.endsWith('/constants.mjs')) return {ARUDORA_FOUNTAIN};
      throw new Error(`Unexpected import: ${path}`);
    }});
  assert.deepEqual(f.events, []);
  managerReady = true;
  await f.manager.toggleMementoReturned('grounds', true);
  assert.equal(f.saved.areas.grounds.memento.returned, true);
  compat.disposeBobMementoProgress();
});
