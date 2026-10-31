import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const ready = [];
const previousHooks = globalThis.Hooks;
globalThis.Hooks = {once(event, callback) {
  if (event === 'ready') ready.push(callback);
}};
try {
  await import('../scripts/adventures-text-register.mjs');
} finally {
  globalThis.Hooks = previousHooks;
}

const pageId = 'e9nykXPZit7kJXIP';
const journalId = 'wKHOSd6WYx3q5L0A';
const sourceModule = 'pf2e-team-plus-adventures';
const extraModule = 'pf2e-compendium-extra-cn';
const pageUuid = system => `Compendium.${sourceModule}.${system}-journals.JournalEntry.${journalId}.JournalEntryPage.${pageId}`;
const heading = {text: '永不死亡', level: 2, slug: '永不死亡', children: [], element: {textContent: '永不死亡'}};

function fixture(t, system = 'pf2e') {
  const previousGame = globalThis.game, previousFoundry = globalThis.foundry;
  const calls = [];
  class PageSheet {
    async _onRender(context, options) {
      calls.push({sheet: this, context, options});
      if (context.error) throw context.error;
      this.toc = context.toc;
      return context.result;
    }
  }
  const game = {system: {id: system}, i18n: {lang: 'cn'},
    modules: new Map([[sourceModule, {active: true}], [extraModule, {active: true}]]),
    settings: {get: () => 'full'}};
  globalThis.game = game;
  globalThis.foundry = {applications: {sheets: {journal: {JournalEntryPageSheet: PageSheet}}}};
  t.after(() => {
    globalThis.game = previousGame;
    globalThis.foundry = previousFoundry;
  });
  for (const callback of ready) callback();
  const data = JSON.parse(readFileSync(new URL(`../compendium/${sourceModule}.${system}-journals.json`, import.meta.url), 'utf8'));
  const sheet = new PageSheet();
  sheet.page = {uuid: pageUuid(system), type: 'text', text: {content: data.entries[journalId].pages[pageId].text}};
  sheet.isView = true;
  sheet.options = {includeTOC: true};
  return {sheet, game, calls};
}

for (const system of ['pf2e', 'sf2e']) test(`${system} links resolve the translated heading without adding a sidebar entry`, async t => {
  const {sheet, calls} = fixture(t, system);
  const toc = {'永不死亡': heading};
  const context = {toc, result: Symbol('native result')}, options = {parts: ['content']};
  const before = structuredClone(sheet.page);
  assert.equal(await sheet._onRender(context, options), context.result);
  assert.equal(sheet.toc['never-die']?.element, heading.element);
  assert.deepEqual(Object.keys(sheet.toc), ['永不死亡']);
  assert.equal(JSON.stringify(sheet.toc), JSON.stringify(toc));
  assert.equal(Object.hasOwn(toc, 'never-die'), false);
  assert.deepEqual(sheet.page, before);
  assert.deepEqual(calls, [{sheet, context, options}]);
});

test('English content retains its native heading and anchor', async t => {
  const {sheet} = fixture(t);
  sheet.page.text.content = '<h2>Never Die</h2><p>Original rules.</p>';
  const toc = {'never-die': {text: 'Never Die', level: 2, slug: 'never-die', children: []}};
  await sheet._onRender({toc}, {});
  assert.equal(sheet.toc, toc);
});

test('other pages, changed headings and edit views retain their native TOC', async t => {
  const {sheet} = fixture(t);
  const page = structuredClone(sheet.page);
  const cases = [
    {...page, uuid: pageUuid('pf2e').replace('pf2e-journals', 'other-journals')},
    {...page, uuid: pageUuid('pf2e').replace(journalId, 'AnotherJournal')},
    {...page, uuid: pageUuid('pf2e').replace(pageId, 'AnotherPage')},
    {...page, uuid: `JournalEntry.${journalId}.JournalEntryPage.${pageId}`},
    {...page, type: 'image'},
    {...page, text: {content: '<h2>自定标题</h2>'}},
  ];
  for (const candidate of cases) {
    sheet.page = candidate;
    const toc = {'永不死亡': heading};
    await sheet._onRender({toc}, {});
    assert.equal(sheet.toc, toc);
  }
  sheet.page = page;
  sheet.isView = false;
  const toc = {'永不死亡': heading};
  await sheet._onRender({toc}, {});
  assert.equal(sheet.toc, toc);
  sheet.isView = true;
  sheet.options.includeTOC = false;
  await sheet._onRender({toc}, {});
  assert.equal(sheet.toc, toc);
});

test('the existing Adventures language and loading gates apply to the anchor', async t => {
  const {sheet, game} = fixture(t);
  for (const mode of ['full', 'ondemand']) for (const lang of ['cn', 'zh-CN', 'zh_Hans', 'zh-Hans']) {
    game.settings.get = () => mode;
    game.i18n.lang = lang;
    await sheet._onRender({toc: {'永不死亡': heading}}, {});
    assert.equal(sheet.toc['never-die']?.element, heading.element);
  }
  game.i18n.lang = 'cn';
  const disabled = [
    () => { game.i18n.lang = 'en'; },
    () => { game.i18n.lang = 'cn'; game.system.id = 'other'; },
    () => { game.system.id = 'pf2e'; game.modules.get(sourceModule).active = false; },
    () => { game.modules.get(sourceModule).active = true; game.modules.get(extraModule).active = false; },
    () => { game.modules.get(extraModule).active = true; game.settings.get = () => 'none'; },
  ];
  for (const disable of disabled) {
    disable();
    const toc = {'永不死亡': heading};
    await sheet._onRender({toc}, {});
    assert.equal(sheet.toc, toc);
  }
});

test('an existing English anchor is never replaced', async t => {
  const {sheet} = fixture(t);
  const toc = {'永不死亡': heading, 'never-die': {text: 'Never Die', element: {textContent: 'Never Die'}}};
  await sheet._onRender({toc}, {});
  assert.equal(sheet.toc, toc);
});

test('native permission and render failures propagate unchanged', async t => {
  const {sheet, calls} = fixture(t);
  const error = new Error('Permission denied');
  await assert.rejects(sheet._onRender({error}, {}), actual => actual === error);
  assert.equal(calls.length, 1);
  assert.equal(sheet.toc, undefined);
});
