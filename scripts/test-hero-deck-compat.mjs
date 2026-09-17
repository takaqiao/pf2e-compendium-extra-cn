import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';

const source = await readFile(new URL('./hero-deck-compat.mjs', import.meta.url), 'utf8');
const BASE = 'pf2e-hero-deck-unofficial';
const EXTRA = 'pf2e-compendium-extra-cn';
const OLD = 'modules/pf2e-hero-deck-cn/assets/cards/';
const NEXT = 'modules/pf2e-compendium-extra-cn/assets/hero-action-deck/cards/';
const PACK_URL = `modules/${EXTRA}/compendium/${BASE}.pf2e-hero-action-card-deck-unofficial.json`;
const clone = value => JSON.parse(JSON.stringify(value));

// Exercise the actual bundled payload as the fetch boundary. Literal expected
// paths below remain independent of the production whitelist parser.
const translation = JSON.parse(await readFile(new URL(
  `../compendium/${BASE}.pf2e-hero-action-card-deck-unofficial.json`, import.meta.url
), 'utf8'));

function card(id, img = OLD + 'ancestral_might.webp') {
  return {
    _id: id, name: 'GM card name', description: '<p>GM notes</p>', sort: 900,
    drawn: true, origin: 'world-source', face: 1, flags: { custom: { kept: true } },
    faces: [{ img, name: 'front name', text: 'front text', flags: { face: 'keep' } },
      { img: 'worlds/custom/back.webp', name: 'back', text: 'back text' }],
  };
}

function harness({ lang = 'cn', system = 'pf2e', upstream = true, extra = true,
  legacy = false, isGM = true, active = true, activeGM = 'gm-one',
  fetchTranslation = async () => translation, settings = {}, stacks = [] } = {}) {
  const handlers = new Map();
  const writes = [];
  const fetches = [];
  const warnings = [];
  const game = {
    system: { id: system }, i18n: { lang }, user: { id: 'gm-one', isGM, active },
    users: { activeGM: activeGM ? { id: activeGM, isGM: true, active: true } : null },
    modules: new Map([[BASE, { active: upstream }], [EXTRA, { active: extra }],
      ['pf2e-hero-deck-cn', { active: legacy }]]),
    settings: { get(namespace, key) { assert.equal(namespace, BASE); return settings[key]; } },
    cards: { contents: [], get(id) { return this.contents.find(stack => stack.id === id); } },
  };
  function addStack(id, name, data = []) {
    const stack = {
      id, name, cards: { contents: data.map(raw => ({ id: raw._id,
        data: clone(raw), toObject() { return clone(this.data); } })) },
      async updateEmbeddedDocuments(type, updates) {
        assert.equal(type, 'Card');
        writes.push({ kind: 'cards', stack: id, updates: clone(updates) });
        for (const update of updates) {
          const doc = this.cards.contents.find(card => card.id === update._id);
          assert.ok(doc, 'only update existing embedded cards');
          Object.assign(doc.data, clone(update));
        }
      },
    };
    game.cards.contents.push(stack);
    return stack;
  }
  for (const stack of stacks) addStack(...stack);
  vm.runInNewContext(source, {
    game,
    Hooks: {
      once(event, fn) { const list = handlers.get(event) ?? []; list.push({ fn, once: true }); handlers.set(event, list); },
      on(event, fn) { const list = handlers.get(event) ?? []; list.push({ fn, once: false }); handlers.set(event, list); },
    },
    Cards: { async updateDocuments(updates) {
      writes.push({ kind: 'stacks', updates: clone(updates) });
      for (const update of updates) {
        const stack = game.cards.get(update._id);
        assert.ok(stack, 'only update existing world stacks');
        Object.assign(stack, clone(update));
      }
    } },
    fetch: async url => {
      fetches.push(url);
      assert.equal(url, PACK_URL, 'load the integrated translation as the whitelist');
      return { ok: true, json: async () => clone(await fetchTranslation()) };
    },
    console: { warn: (...args) => warnings.push(args) },
  }, { filename: 'hero-deck-compat.mjs' });
  async function emit(event, ...args) {
    const list = handlers.get(event) ?? [];
    handlers.set(event, list.filter(handler => !handler.once));
    await Promise.all(list.map(handler => handler.fn(...args)));
  }
  async function setting(event, key, value) {
    settings[key] = value;
    await emit(event, { key: `${BASE}.${key}`, value: JSON.stringify(value) }, { value });
  }
  return { game, writes, fetches, warnings, addStack, emit, setting };
}

test('migrates every world stack while preserving all card state and every other face field', async () => {
  const original = card('drawn-card');
  original.faces[1].img = OLD + 'last_second_sidestep.webp';
  const expected = clone(original);
  expected.faces[0].img = NEXT + 'ancestral_might.webp';
  expected.faces[1].img = NEXT + 'last_second_sidestep.webp';
  const h = harness({ stacks: [['custom-stack', 'Custom stack', [original]]] });
  await h.emit('ready');
  assert.deepEqual(h.game.cards.get('custom-stack').cards.contents[0].data, expected);
  assert.deepEqual(h.writes, [{ kind: 'cards', stack: 'custom-stack', updates: [{ _id: 'drawn-card', faces: expected.faces }] }]);
});

test('only exact known legacy paths are replaced; custom art and lookalike URLs survive', async () => {
  const untouched = [
    OLD + 'not_in_deck.webp', OLD + 'ancestral_might.webp?custom=1',
    'https://example.test/' + OLD + 'ancestral_might.webp',
    OLD + '../cards/ancestral_might.webp', 'worlds/custom/front.webp',
  ].map((img, i) => card(`custom-${i}`, img));
  const h = harness({ stacks: [['all', 'All cards', [card('known'), ...untouched]]] });
  await h.emit('ready');
  assert.equal(h.game.cards.get('all').cards.contents[0].data.faces[0].img, NEXT + 'ancestral_might.webp');
  assert.deepEqual(h.game.cards.get('all').cards.contents.slice(1).map(doc => doc.data), untouched);
});

test('only configured stacks with upstream default names are renamed', async () => {
  const h = harness({ settings: { 'deck.id.hand': 'hand', 'deck.id.discard': 'discard' }, stacks: [
    ['hand', 'Hero Actions: Hand'], ['discard', 'Hero Actions: Discard'],
    ['unrelated', 'Hero Actions: Hand'], ['custom', 'My hand'],
  ] });
  await h.emit('ready');
  assert.deepEqual(h.game.cards.contents.map(stack => stack.name), ['英雄行动：手牌', '英雄行动：弃牌堆', 'Hero Actions: Hand', 'My hand']);
  h.game.cards.get('hand').name = 'GM renamed hand';
  await h.setting('updateSetting', 'deck.id.hand', 'hand');
  assert.equal(h.game.cards.get('hand').name, 'GM renamed hand');
});

for (const [name, options] of [
  ['English world', { lang: 'en' }], ['other system', { system: 'dnd5e' }],
  ['upstream disabled', { upstream: false }], ['extra disabled', { extra: false }],
  ['player', { isGM: false }], ['inactive GM', { active: false }],
  ['another designated GM', { activeGM: 'gm-two' }], ['no active GM', { activeGM: null }],
  ['standalone translation active', { legacy: true }],
]) test(`${name}: no world writes`, async () => {
  const h = harness({ ...options, settings: { 'deck.id.hand': 'hand' },
    stacks: [['hand', 'Hero Actions: Hand', [card('legacy')]]] });
  await h.emit('ready');
  await h.setting('updateSetting', 'deck.id.hand', 'hand');
  assert.deepEqual(h.writes, []);
  assert.deepEqual(h.fetches, []);
});

test('Chinese aliases are eligible for migration', async () => {
  for (const lang of ['zh-CN', 'zh_Hans', 'zh-Hans', 'zh-cn', 'zh_hans']) {
    const h = harness({ lang, stacks: [['hand', 'Custom', [card('legacy')]]] });
    await h.emit('ready');
    assert.equal(h.game.cards.get('hand').cards.contents[0].data.faces[0].img, NEXT + 'ancestral_might.webp', lang);
  }
});

test('first setting creation and later setting updates handle stacks created after ready', async () => {
  const h = harness();
  await h.emit('ready');
  const hand = h.addStack('late-hand', 'Hero Actions: Hand', [card('late-card')]);
  await h.emit('createCards', hand);
  assert.equal(hand.name, 'Hero Actions: Hand', 'a same-name Cards creation alone proves no ownership');
  await h.setting('createSetting', 'deck.id.hand', 'late-hand');
  assert.equal(hand.name, '英雄行动：手牌');
  assert.equal(hand.cards.contents[0].data.faces[0].img, NEXT + 'ancestral_might.webp');
  const discard = h.addStack('late-discard', 'Hero Actions: Discard');
  await h.setting('updateSetting', 'deck.id.discard', 'late-discard');
  assert.equal(discard.name, '英雄行动：弃牌堆');
  const source = h.addStack('late-source', 'Hero Action Deck', [card('source-card')]);
  await h.setting('createSetting', 'deck.id.hero-actions', 'late-source');
  assert.equal(source.cards.contents[0].data.faces[0].img, NEXT + 'ancestral_might.webp');
});

test('repeated and overlapping hooks are idempotent', async () => {
  const h = harness({ settings: { 'deck.id.hand': 'hand' }, stacks: [['hand', 'Hero Actions: Hand', [card('legacy')]]] });
  await Promise.all([h.emit('ready'), h.setting('updateSetting', 'deck.id.hand', 'hand')]);
  const first = clone(h.writes);
  await h.setting('updateSetting', 'deck.id.hand', 'hand');
  assert.equal(first.filter(write => write.kind === 'cards').length, 1);
  assert.equal(first.filter(write => write.kind === 'stacks').length, 1);
  assert.deepEqual(h.writes, first);
});

test('unrelated settings do not initiate world writes', async () => {
  const h = harness({ stacks: [['hand', 'Custom', [card('legacy')]]] });
  await h.emit('updateSetting', { key: 'other-module.deck.id.hand' });
  await h.setting('createSetting', 'hero-actions.max', 3);
  assert.deepEqual(h.writes, []);
});

test('a GM losing designated status during the translation fetch cannot migrate images', async () => {
  let resolveFetch;
  const gate = new Promise(resolve => { resolveFetch = resolve; });
  const h = harness({ stacks: [['hand', 'Custom', [card('legacy')]]], fetchTranslation: () => gate });
  const ready = h.emit('ready');
  await new Promise(resolve => setImmediate(resolve));
  h.game.users.activeGM = { id: 'gm-two', active: true, isGM: true };
  resolveFetch(translation);
  await ready;
  assert.deepEqual(h.writes, []);
});

test('an incomplete translation whitelist cannot rewrite world image paths', async () => {
  const h = harness({ stacks: [['hand', 'Custom', [card('legacy')]]],
    fetchTranslation: async () => ({ entries: { 'Hero Action Deck': { cards: {
      One: { faces: [{ img: NEXT + 'ancestral_might.webp' }] },
    } } } }) });
  await h.emit('ready');
  assert.deepEqual(h.writes, []);
  assert.equal(h.warnings.length, 1);
});
