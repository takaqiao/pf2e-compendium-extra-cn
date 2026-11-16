import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {GALLERY_LABELS, GALLERY_SOURCES, installEldamonGalleryDisplay} from '../scripts/eldamon-legends-gallery.mjs';

const READER = 'pf2e-tokens-characters', LEGENDS = 'battlezoo-eldamon-legends-pf2e';
const SHEET = 'battlezoo-eldamon-legends-creatures';
const json = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));

// Only the selectors the adapter queries; the structure follows the reader's 1.3.0 templates.
class Element {
  constructor(text = '') { this.textContent = text; this.dataset = {}; this.attributes = new Map(); this.queries = new Map(); }
  querySelectorAll(selector) { return this.queries.get(selector) ?? []; }
  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
}

const art = name => ({portrait: `p/${name}.webp`, thumb: `t/${name}.webp`, token: `k/${name}.webp`, scale: 2});
const legend = (label, element = 'Air') => ({label, key: `EL-${element}_${label.toLowerCase()}`,
  source: `Eldamon Legends: ${element}`, art: art(label), tags: {ancestry: ['eldamon'], category: [element.toLowerCase()]}});

function fixture({lang = 'cn', loadingMode = 'full', legendsSheet = true} = {}) {
  const legends = [legend('Aeromight'), legend('Sundo', 'Wood'), legend('Aeromight Prime'),
    {...legend('Pegi'), source: 'Eldamon Legends: Sky'}];
  // Another sheet reusing a Legends label, and one taking over a Legends key.
  const others = [{label: 'Pegi', key: 'other-pegi', source: 'Character Gallery', art: art('other'), tags: {}},
    {label: 'Sundo', key: 'EL-Wood_sundo', source: 'Character Gallery', art: art('sundo-other'), tags: {}}];
  const sources = [{id: 'character-gallery', module: {id: READER}, data: others}];
  if (legendsSheet) sources.unshift({id: SHEET, module: {id: LEGENDS}, label: 'Battlezoo Eldamon Legends Datasheet', data: legends});
  const app = {database: new Map(), session: {selected: 'EL-Air_aeromight', preview: 'portrait', targetActor: null}};
  for (const record of sources.flatMap(sheet => sheet.data)) app.database.set(record.key, record);
  const game = {system: {id: 'pf2e'}, i18n: {lang},
    modules: new Map([['babele', {active: true}], [LEGENDS, {active: true}], ['pf2e-compendium-extra-cn', {active: true}],
      [READER, {active: true, application: app}]]),
    settings: {get: (module, key) => module === 'babele' && key === 'loadingMode' ? loadingMode : undefined}};
  const hooks = new Map();
  installEldamonGalleryDisplay({hooks: {on: (name, fn) => hooks.set(name, fn)}, getGame: () => game});
  return {app, game, hooks, sources, legends, snapshot: structuredClone(sources)};
}

function galleryElement(app) {
  const element = new Element(), cells = [], captions = new Map();
  for (const record of app.database.values()) {
    const cell = new Element(), caption = new Element(record.label);
    Object.assign(cell.dataset, {key: record.key, label: record.label, source: record.source});
    cell.queries.set(':scope > figure > figcaption', [caption]);
    cells.push(cell); captions.set(record.key, caption);
  }
  element.queries.set('[data-application-part="grid"] > .grid > .preview[data-key]', cells);
  const selected = app.database.get(app.session.selected);
  const selection = new Element(), name = new Element(selected.label), info = new Element();
  selection.dataset.selection = selected.key;
  info.setAttribute('data-tooltip', `Source<br/><em>${selected.source}</em>`);
  selection.queries.set(':scope > header > p', [name]);
  selection.queries.set(':scope > header > div > i.info[data-tooltip]', [info]);
  element.queries.set('[data-application-part="details"] > section.selection[data-selection]', [selection]);
  return {element, cells, captions, name, info};
}

function render(f, view = galleryElement(f.app)) {
  f.hooks.get('renderGalleryApplication')(f.app, view.element, {sources: f.sources, displayData: []});
  return view;
}

function popout(f, {src = f.app.database.get(f.app.session.selected).art.portrait, isFirstRender = true} = {}) {
  const label = f.app.database.get(f.app.session.selected).label;
  const app = {options: {src, window: {title: label}}}, context = {title: label, altText: label};
  const options = {isFirstRender, window: {title: label}};
  f.hooks.get('preRenderImagePopout')(app, context, options);
  return {title: app.options.window.title, frame: options.window.title, context};
}

test('Legends records show their Chinese names in the grid, details and source tooltip', () => {
  const f = fixture(), view = render(f);
  assert.equal(view.captions.get('EL-Air_aeromight').textContent, '雄风飞鼠');
  assert.equal(view.name.textContent, '雄风飞鼠');
  assert.equal(view.info.getAttribute('data-tooltip'), 'Source<br/><em>爱达梦传奇：气</em>');
  // Search reads the data-* attributes; records and sources stay native.
  assert.equal(view.cells.find(cell => cell.dataset.key === 'EL-Air_aeromight').dataset.label, 'Aeromight');
  assert.deepEqual(f.sources, f.snapshot);
});

test('a label or source the table does not know keeps its English', () => {
  const f = fixture(), view = render(f);
  assert.equal(view.captions.get('EL-Air_aeromight prime').textContent, 'Aeromight Prime');
  f.app.session.selected = 'EL-Air_pegi';
  const pegi = render(f);
  assert.equal(pegi.name.textContent, '佩姬');
  assert.equal(pegi.info.getAttribute('data-tooltip'), 'Source<br/><em>Eldamon Legends: Sky</em>');
});

test('records from other datasheets stay native even with a Legends label or key', () => {
  const f = fixture(), view = render(f);
  assert.equal(view.captions.get('other-pegi').textContent, 'Pegi');
  assert.equal(view.captions.get('EL-Wood_sundo').textContent, 'Sundo');
  f.app.session.selected = 'EL-Wood_sundo';
  assert.equal(render(f).name.textContent, 'Sundo');
});

test('text already changed by a render or another module is left alone', () => {
  const f = fixture(), view = galleryElement(f.app);
  view.captions.get('EL-Air_aeromight').textContent = 'Aeromight (alt)';
  render(f, view);
  assert.equal(view.captions.get('EL-Air_aeromight').textContent, 'Aeromight (alt)');
  assert.equal(view.name.textContent, '雄风飞鼠');
  // A details-only render repaints the details panel; the grid keeps its earlier result.
  render(f, view);
  assert.equal(view.name.textContent, '雄风飞鼠');
  assert.equal(view.info.getAttribute('data-tooltip'), 'Source<br/><em>爱达梦传奇：气</em>');
});

test('nothing changes outside a Chinese Babele world or without the Legends datasheet', () => {
  const unregistered = fixture();
  unregistered.game.settings.get = () => { throw Error('babele.loadingMode is not a registered game setting'); };
  // Legends 4.0 declares no datasheet.
  const withoutSheet = fixture({legendsSheet: false});
  withoutSheet.app.session.selected = 'other-pegi';
  for (const f of [fixture({lang: 'en'}), fixture({loadingMode: 'none'}), unregistered, withoutSheet]) {
    const view = render(f), selected = f.app.database.get(f.app.session.selected);
    for (const [key, caption] of view.captions) assert.equal(caption.textContent, f.app.database.get(key).label);
    assert.equal(view.name.textContent, selected.label);
    assert.equal(popout(f).title, selected.label);
  }
  const f = fixture(), view = galleryElement(f.app);
  f.hooks.get('renderGalleryApplication')({database: f.app.database}, view.element, {sources: f.sources});
  assert.equal(view.name.textContent, 'Aeromight');
  assert.doesNotThrow(() => f.hooks.get('renderGalleryApplication')(f.app, {}, {sources: f.sources}));
  assert.doesNotThrow(() => f.hooks.get('renderGalleryApplication')(f.app, view.element, undefined));
});

test('the image popout opened from the gallery gets the Chinese title', () => {
  const f = fixture();
  render(f);
  assert.deepEqual(popout(f), {title: '雄风飞鼠', frame: '雄风飞鼠', context: {title: '雄风飞鼠', altText: '雄风飞鼠'}});
  f.app.session.preview = 'token';
  assert.equal(popout(f, {src: 'k/Aeromight.webp'}).title, '雄风飞鼠');
  assert.equal(popout(f, {src: 'p/elsewhere.webp'}).title, 'Aeromight');
  assert.equal(popout(f, {isFirstRender: false}).title, 'Aeromight');
  f.app.session.selected = 'other-pegi';
  assert.equal(popout(f, {src: 'p/other.webp'}).title, 'Pegi');
});

test('form names match the eldamon translations and the manifest loads the display', () => {
  assert.equal(GALLERY_LABELS.size, 60);
  assert.equal(new Set(GALLERY_LABELS.values()).size, 60);
  assert.equal(GALLERY_SOURCES.size, 5);
  const labels = [...GALLERY_LABELS], {entries} = json('../compendium/battlezoo-eldamon-legends-pf2e.pf2e-eldamon.json');
  assert.equal(Object.keys(entries).length, 20);
  for (const [base, entry] of Object.entries(entries)) {
    const start = labels.findIndex(([label]) => label === base);
    const family = /^<p><strong>([^<]+)<\/strong><\/p>/.exec(entry.description)?.[1].split(/、|与/);
    assert.equal(entry.name, `${GALLERY_LABELS.get(base)} ${base}`);
    assert.deepEqual(labels.slice(start, start + 3).map(([, name]) => name), family, base);
  }
  assert.ok(json('../module.json').esmodules.includes('scripts/eldamon-legends-gallery.mjs'));
});
