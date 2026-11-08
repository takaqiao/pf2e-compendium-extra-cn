import assert from 'node:assert/strict';
import test from 'node:test';
import {createMockLibWrapper, loadRealLibWrapper} from './support/libwrapper.mjs';
import {installBobLocalizeDisplay} from '../scripts/bob-localize-display-core.mjs';
import {installBobAdditionalDisplay} from '../scripts/bob-additional-display-core.mjs';
import {installBobJournalCheckDisplay} from '../scripts/bob-journal-check-display-core.mjs';
import {BINDINGS} from '../scripts/bob-journal-check-display-bindings.mjs';

const REAL = process.env.EXTRA_TEST_LIBWRAPPER;
const real = REAL ? await loadRealLibWrapper(REAL) : null;
const EXTRA_ID = 'pf2e-compendium-extra-cn';
// module.json order of the ready hooks: journal-check ends up outermost.
const CORES = ['localize', 'additional', 'journal'];
const PROJECTS = {localize: ['localize'], additional: ['additional'], journal: ['journal', 'clean']};
const ERRORS = {localize: /enrichHTML consumer is unavailable/, additional: /Native consumer dependencies required/,
  journal: /Native dependencies required/};
const hash = 'a'.repeat(64);
let counter = 0;

// Each managed environment lets another package wrap a fresh TextEditor class first.
function environments() {
  const list = [['mock', () => {
    const mock = createMockLibWrapper();
    return {libWrapper: mock.libWrapper, register: (path, fn) => mock.libWrapper.register('other-module', path, fn, 'WRAPPER'),
      registrations: mock.registrations};
  }]];
  if (real) {
    list.push(['real libWrapper 1.13.5.1', () => ({libWrapper: real.libWrapper,
      register: (path, fn) => real.libWrapper.register('other-module', path, fn, 'WRAPPER')})]);
    // FAST mode switches the whole wrapper to static dispatch.
    list.push(['real libWrapper 1.13.5.1 FAST', () => ({libWrapper: real.libWrapper,
      register: (path, fn) => real.libWrapper.register('other-module', path, fn, 'WRAPPER', {perf_mode: 'FAST'})})]);
  }
  return list;
}

function fixture(env = null) {
  const name = `BobLaneEditor${++counter}`;
  // receivers records which class each native call ran on, so a call that
  // continued on another call's chain shows up.
  const log = {native: [], receivers: [], other: [], trace: []};
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  class Editor {
    static async enrichHTML(text, options) {
      log.native.push(text);
      log.receivers.push(this.name);
      if (options?.slow) await gate;
      return `native:${text}`;
    }
  }
  globalThis[name] = Editor;
  if (env) env.register(`${name}.enrichHTML`, function (next, ...args) { log.other.push(args[0]); return next(...args); });
  class Waiting extends Editor {}

  const actors = new Map();
  class Actor {
    constructor(source) {
      this._source = structuredClone(source);
      Object.assign(this, structuredClone(source), {id: source._id, parent: null, isToken: false, collection: actors,
        items: new Map(), visible: true, isOwner: true, hasPlayerOwner: false});
      actors.set(this.id, this);
    }
  }
  class Item {
    constructor(source, actor) {
      this._source = structuredClone(source);
      Object.assign(this, structuredClone(source), {id: source._id, parent: actor, actor, visible: true});
      actor.items.set(this.id, this);
    }
  }
  const user = {id: 'user', isGM: true, role: 4, active: true};

  const wholeBody = '<p>@Localize[PF2E.NPC.Abilities.Glossary.Whole]</p>';
  const localizeRow = {approved: true, sourceSha256: hash, approvalSha256: hash, sourceBody: wholeBody,
    normalizedBody: '@Localize[PF2E.NPC.Abilities.Glossary.Whole]', displayBody: '<p>整段说明。</p>',
    actorId: 'actorL', actorType: 'npc', actorName: '角色 Actor', itemId: 'itemL', itemType: 'action', itemName: '整段 Whole',
    itemRulesJSON: '[]'};
  const localizeItem = new Item({_id: 'itemL', type: 'action', name: localizeRow.itemName,
    system: {rules: [], description: {value: wholeBody}}}, new Actor({_id: 'actorL', type: 'npc', name: localizeRow.actorName}));

  // Same shape as the additional case in bob-source-variants.test.mjs.
  const auraBody = '<p>@Localize[PF2E.NPC.Abilities.Glossary.Test]</p>', rules = [{key: 'Aura', radius: 0}];
  const additionalRow = {approved: true, sourceSha256: hash, approvalSha256: hash, actorNameApprovalSha256: hash, itemNameApprovalSha256: hash,
    actorId: 'actorA', actorType: 'npc', actorName: '角色 Actor', actorFolderId: null, actorSourceUuid: null,
    itemId: 'itemA', itemType: 'action', itemName: '气场 Aura', itemFolderId: null, itemSourceUuid: null, itemSlug: null,
    key: 'PF2E.NPC.Abilities.Glossary.Test', displayFragment: '<p>气场说明。</p>', normalizedBody: '@Localize[PF2E.NPC.Abilities.Glossary.Test]',
    itemRulesJSON: JSON.stringify(rules), forms: [{source: auraBody, display: '<p>气场说明。</p>'}]};
  const additionalItem = new Item({_id: 'itemA', type: 'action', name: additionalRow.itemName,
    system: {slug: null, rules, description: {value: auraBody}}}, new Actor({_id: 'actorA', type: 'npc', name: additionalRow.actorName}));

  // One approved BoB page (labels are added before native enrichment) and one
  // other page of the same BoB journal (old DC labels are cleaned).
  const row = BINDINGS[1], journals = new Map();
  class Journal {}
  class Page {}
  const journal = Object.assign(new Journal(), {id: row.journalId, name: row.journalNames[0], pages: new Map(), collection: journals,
    visible: true, isOwner: true, hasPlayerOwner: false,
    _source: {_id: row.journalId, name: row.journalNames[0], folder: row.journalFolder, flags: structuredClone(row.journalFlags)}});
  journals.set(journal.id, journal);
  const page = (id, fields) => {
    const result = Object.assign(new Page(), {id, parent: journal, collection: journal.pages, visible: true, isOwner: true, type: 'text'}, fields);
    journal.pages.set(id, result);
    return result;
  };
  const checkSource = row.forms[0].source;
  const checkDisplay = row.macros.reduce((text, m) => text.replace(m.macro, `${m.macro}{${m.displayLabel}}`), checkSource);
  const boundPage = page(row.pageId, {name: row.pageNames[0], text: {content: checkSource},
    _source: {_id: row.pageId, name: row.pageNames[0], type: 'text', category: row.pageCategory, flags: structuredClone(row.pageFlags),
      system: structuredClone(row.pageSystem), text: {content: checkSource, format: row.pageFormat}}});
  const labelled = '原文 @Check[occultism|dc:20|traits:secret]{DC 20神秘}';
  const plainPage = page('plainPage', {name: 'Plain', text: {content: labelled}, _source: {_id: 'plainPage', text: {content: labelled}}});
  // No inline-check anchors parse out of the stub, so an approved page keeps the native result.
  const document = {createElement: () => ({innerHTML: '', children: []})};

  const inputs = {
    localize: [wholeBody, {relativeTo: localizeItem}],
    additional: [auraBody, {relativeTo: additionalItem}],
    journal: [checkSource, {relativeTo: boundPage, secrets: false}],
    clean: [labelled, {relativeTo: plainPage, secrets: false}],
    plain: ['<p>plain</p>', {}],
  };
  // The text each core hands to the native method for its own input.
  const display = {localize: '<p>整段说明。</p>', additional: '<p>气场说明。</p>', journal: checkDisplay,
    clean: '原文 @Check[occultism|dc:20|traits:secret]{神秘}'};
  const rendered = values => Object.fromEntries(Object.entries(values).map(([key, text]) => [key, `native:${text}`]));
  const raw = rendered(Object.fromEntries(Object.entries(inputs).map(([key, [text]]) => [key, text])));
  const projected = rendered(display);
  // Every core reads its gate first, so the trace records the layer order of one call.
  const enabled = core => () => {
    if (log.trace.at(-1) !== core) log.trace.push(core);
    return true;
  };
  const common = {TextEditorClass: Editor, getUser: () => user, libWrapper: env ? env.libWrapper : null};
  const installers = {
    localize: overrides => installBobLocalizeDisplay({...common, ItemClass: Item, ActorClass: Actor, bindings: [localizeRow],
      isEnabled: enabled('localize'), ...overrides}),
    additional: overrides => installBobAdditionalDisplay({...common, ItemClass: Item, ActorClass: Actor, bindings: [additionalRow],
      isEnabled: enabled('additional'), getLocale: () => 'cn', ...overrides}),
    journal: overrides => installBobJournalCheckDisplay({...common, JournalClass: Journal, PageClass: Page, bindings: BINDINGS, document,
      isEnabled: enabled('journal'), getLocale: () => 'cn', getJournals: () => journals, format: () => '', ...overrides}),
  };
  return {name, Editor, log, release, user, inputs, raw, projected, display,
    install: (core, overrides = {}) => installers[core](overrides),
    enrich: key => Editor.enrichHTML(inputs[key][0], {...inputs[key][1]}),
    // Waits at the native until release(), on a subclass receiver.
    enrichWaiting: key => Waiting.enrichHTML(inputs[key][0], {...inputs[key][1], slow: true})};
}

const nativeTexts = (fx, receiver) => fx.log.native.filter((_, index) => fx.log.receivers[index] === receiver);

function expected(fx, cores) {
  const result = {...fx.raw};
  for (const core of cores) for (const key of PROJECTS[core]) result[key] = fx.projected[key];
  return result;
}

async function outputs(fx) {
  const result = {};
  for (const key of Object.keys(fx.inputs)) result[key] = await fx.enrich(key);
  return result;
}

async function trace(fx) {
  fx.log.trace.length = 0;
  await fx.enrich('plain');
  return fx.log.trace.slice();
}

// libWrapper allows one registration per package per wrapper; a second one shows whether Extra holds it.
function extraRegistered(env, fx) {
  try {
    const id = env.libWrapper.register(EXTRA_ID, `${fx.name}.enrichHTML`, function (next, ...args) { return next(...args); }, 'WRAPPER');
    env.libWrapper.unregister(EXTRA_ID, id);
    return false;
  } catch (error) {
    if (/already been registered/.test(error.message)) return true;
    throw error;
  }
}

const MODES = [['define', () => null], ...environments()];

for (const [label, create] of environments()) {
  for (const core of CORES) {
    test(`${label}: ${core} installs on an enrichHTML another package wrapped and matches define mode`, async () => {
      const env = create(), baseline = fixture(), fx = fixture(env);
      const disposers = [baseline.install(core), fx.install(core)];
      try {
        const want = await outputs(baseline);
        assert.deepEqual(want, expected(baseline, [core]));
        assert.deepEqual(await outputs(fx), want);
        assert.deepEqual(fx.log.native, baseline.log.native);
        assert.deepEqual(fx.log.other, fx.log.native, 'the other package still wraps every native call');
        assert.equal(extraRegistered(env, fx), true);
      } finally { for (const dispose of disposers) dispose(); }
    });
  }

  test(`${label}: the three cores share one registration and keep the define-mode layer order`, async () => {
    const env = create(), baseline = fixture(), fx = fixture(env);
    const disposers = CORES.flatMap(core => [baseline.install(core), fx.install(core)]);
    try {
      if (env.registrations) assert.deepEqual(env.registrations().filter(entry => entry.endsWith(':enrichHTML')).sort(),
        ['other-module:enrichHTML', `${EXTRA_ID}:enrichHTML`]);
      const want = await outputs(baseline);
      assert.deepEqual(want, expected(baseline, CORES));
      assert.deepEqual(await outputs(fx), want);
      assert.deepEqual(fx.log.native, baseline.log.native);
      assert.deepEqual(await trace(baseline), ['journal', 'additional', 'localize']);
      assert.deepEqual(await trace(fx), ['journal', 'additional', 'localize']);
      assert.deepEqual(fx.log.other, fx.log.native);
    } finally { for (const dispose of disposers) dispose(); }
  });

  test(`${label}: disposing each core removes only its layer, and the last one releases the registration`, async () => {
    const env = create(), fx = fixture(env);
    const disposers = Object.fromEntries(CORES.map(core => [core, fx.install(core)]));
    const remaining = new Set(CORES);
    for (const core of ['additional', 'journal', 'localize']) {
      disposers[core]();
      disposers[core]();
      remaining.delete(core);
      assert.equal(disposers[core].isActive(), false);
      assert.deepEqual(await outputs(fx), expected(fx, [...remaining]));
      assert.deepEqual(await trace(fx), CORES.filter(name => remaining.has(name)).reverse());
      assert.equal(extraRegistered(env, fx), remaining.size > 0);
    }
    if (env.registrations) assert.deepEqual(env.registrations().filter(entry => entry.endsWith(':enrichHTML')), ['other-module:enrichHTML']);
    assert.deepEqual(fx.log.other, fx.log.native, 'the other package keeps running after Extra leaves');
    const again = fx.install('localize');
    try { assert.equal(await fx.enrich('localize'), fx.projected.localize); } finally { again(); }
  });

  test(`${label}: a managed enrichHTML is left unchanged when libWrapper is missing or refuses`, async () => {
    const env = create(), fx = fixture(env);
    const before = Object.getOwnPropertyDescriptor(fx.Editor, 'enrichHTML');
    for (const core of CORES) assert.throws(() => fx.install(core, {libWrapper: null}), ERRORS[core]);
    const refusing = {register() { throw new Error('refused'); }, unregister() {}};
    for (const core of CORES) assert.throws(() => fx.install(core, {libWrapper: refusing}), /refused/);
    assert.deepEqual(Object.getOwnPropertyDescriptor(fx.Editor, 'enrichHTML'), before);
    assert.equal(extraRegistered(env, fx), false);
    assert.deepEqual(await outputs(fx), fx.raw);
    // The same holds when another Extra core already joined the chain.
    const dispose = fx.install('journal');
    try {
      for (const core of ['localize', 'additional']) assert.throws(() => fx.install(core, {libWrapper: null}), ERRORS[core]);
      assert.deepEqual(await outputs(fx), expected(fx, ['journal']));
      assert.deepEqual(await trace(fx), ['journal']);
    } finally { dispose(); }
    assert.equal(extraRegistered(env, fx), false);
  });
}

for (const [label, create] of MODES) {
  test(`${label}: interleaved async enrich calls each keep every Extra layer`, async () => {
    const fx = fixture(create());
    const disposers = CORES.map(core => fx.install(core));
    try {
      const keys = ['localize', 'additional', 'journal', 'clean'];
      const waiting = keys.map(key => fx.enrichWaiting(key));
      for (const key of keys) assert.equal(await fx.enrich(key), fx.projected[key]);
      fx.release();
      assert.deepEqual(await Promise.all(waiting), keys.map(key => fx.projected[key]));
      for (const receiver of ['Waiting', 'Editor']) assert.deepEqual(nativeTexts(fx, receiver), keys.map(key => fx.display[key]));
    } finally { for (const dispose of disposers) dispose(); }
  });

  test(`${label}: a permission change while enrichment waits re-enriches the source on the waiting call's own chain`, async () => {
    const fx = fixture(create());
    const disposers = CORES.map(core => fx.install(core));
    try {
      const waiting = CORES.map(core => fx.enrichWaiting(core));
      // These calls settle first; a body that reused their next would show up as an Editor call below.
      for (const core of CORES) assert.equal(await fx.enrich(core), fx.projected[core]);
      fx.user.role = 1;
      fx.release();
      assert.deepEqual(await Promise.all(waiting), CORES.map(core => fx.raw[core]));
      assert.deepEqual(nativeTexts(fx, 'Waiting').sort(), CORES.flatMap(core => [fx.display[core], fx.inputs[core][0]]).sort());
      assert.deepEqual(nativeTexts(fx, 'Editor'), CORES.map(core => fx.display[core]));
    } finally { for (const dispose of disposers) dispose(); }
  });
}

test('define mode restores the native enrichHTML descriptor on dispose', async () => {
  for (const core of CORES) {
    const fx = fixture(), before = Object.getOwnPropertyDescriptor(fx.Editor, 'enrichHTML');
    const dispose = fx.install(core);
    assert.notEqual(fx.Editor.enrichHTML, before.value);
    dispose();
    assert.deepEqual(Object.getOwnPropertyDescriptor(fx.Editor, 'enrichHTML'), before);
  }
  // localize also follows an inherited native method and removes its own shadow again.
  const fx = fixture();
  class Editor extends fx.Editor {}
  const dispose = fx.install('localize', {TextEditorClass: Editor});
  try {
    assert.equal(await Editor.enrichHTML(...fx.inputs.localize), fx.projected.localize);
    assert.equal(await fx.Editor.enrichHTML(...fx.inputs.localize), fx.raw.localize);
  } finally { dispose(); }
  assert.equal(Object.hasOwn(Editor, 'enrichHTML'), false);
});

test('real libWrapper run was requested', {skip: !REAL && 'set EXTRA_TEST_LIBWRAPPER to lib-wrapper.js 1.13.5.1'}, () => {
  assert.equal(real.libWrapper.version, '1.13.5.1');
});
