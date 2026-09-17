/** Exact, reversible presentation projection. Original gallery data and context stay native. */
const MODULE = 'pf2e-bastion-of-blasphemies';
const READER = 'pf2e-tokens-characters';
const SHEET = 'bastion-of-blasphemies-creatures';
const SHEET_PATH = 'modules/pf2e-bastion-of-blasphemies/data/bastion-of-blasphemies-datasheet.json';
const canonical = value => JSON.stringify(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item)
  ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);
const same = (a, b) => canonical(a) === canonical(b);
const children = node => Array.from(node?.children ?? []);
const hasClass = (node, value) => (node?.getAttribute('class') ?? '').split(/\s+/).includes(value);
const one = values => values.length === 1 ? values[0] : null;
const leaf = node => node && children(node).length === 0;
const escape = text => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

export function installBobGalleryDisplay(config) {
  const {application: app, GalleryClass} = config;
  const rows = structuredClone(config.bindings ?? []);
  if (rows.length !== 182 || rows.some((row, index) => row.index !== index || row.approved !== true
    || row.key !== row.sourceRecord?.key || typeof row.labelAfter !== 'string' || typeof row.sourceAfter !== 'string')
    || new Set(rows.map(row => row.key)).size !== 181) throw Error('Invalid frozen gallery bindings');
  if (!(app instanceof GalleryClass)) throw Error('Expected the native gallery application');
  let active = true, generation = 0, lastAudit = {applied: []};
  const contexts = new WeakMap(), restorers = [];

  function capture(phase = 'render') {
    try {
      if (!active || !config.isEnabled() || !['cn', 'zh-CN'].includes(config.getLocale())
        || config.getApplication() !== app || !(app instanceof GalleryClass)
        || !(phase === 'prepare' ? [-3, -1, 0, 1, 2] : [1, 2]).includes(app.state)) return null;
      const user = config.getUser(), module = config.getModule(), sources = config.getSources();
      if (!user || !app.userHasAccess || module?.id !== MODULE || !module.active || module.version !== '1.0.0'
        || module.flags?.galleryDatasheets?.[SHEET]?.sheet !== SHEET_PATH || !Array.isArray(sources)) return null;
      const matches = sources.filter(source => source.id === SHEET && source.module?.id === MODULE);
      if (matches.length !== 1) return null;
      const source = matches[0], data = source.data;
      if (!Array.isArray(data) || data.length !== rows.length || !data.every((record, index) => same(record, rows[index].sourceRecord))) return null;
      // A borrowed object makes provenance ambiguous even when it retains the original values.
      const records = new Set(data);
      if (sources.some(other => other !== source && other.data?.some(record => records.has(record)))) return null;
      const excluded = user.flags?.[READER]?.excludedSheets ?? [];
      const restricted = config.getRestrictedSheets();
      const excludes = value => value?.some(entry => entry.moduleId === MODULE && entry.sheetId === SHEET);
      if (excludes(excluded) || (!user.isGM && excludes(restricted))) return null;
      const database = app.database;
      if (!(database instanceof Map)) return null;
      return {user, userId: user.id, role: user.role, isGM: user.isGM, locale: config.getLocale(),
        access: config.getGalleryAccess(), restricted: canonical(restricted), excluded: canonical(excluded),
        module, sources, source, data, records: [...data], sourceObjects: [...sources],
        database, entries: [...database], selected: app.session.selected, preview: app.session.preview,
        targetActor: app.session.targetActor, generation, state: app.state,
        tooltipLabel: config.getSourceTooltipLabel()};
    } catch { return null; }
  }

  function unchanged(before, after, checkState = false) {
    if (!before || !after) return false;
    const keys = ['user','userId','role','isGM','locale','access','restricted','excluded','module','sources','source','data',
      'database','selected','preview','targetActor','generation','tooltipLabel'];
    return keys.every(key => before[key] === after[key]) && (!checkState || before.state === after.state)
      && before.records.length === after.records.length && before.records.every((row, index) => row === after.records[index])
      && before.sourceObjects.length === after.sourceObjects.length && before.sourceObjects.every((row, index) => row === after.sourceObjects[index])
      && before.entries.length === after.entries.length && before.entries.every(([key, row], index) => key === after.entries[index][0] && row === after.entries[index][1]);
  }

  function binding(record, proof) {
    const index = proof.data.indexOf(record);
    return index >= 0 && proof.database.get(record.key) === record ? rows[index] : null;
  }
  function contextProof(context, proof) {
    if (!context || context.sources !== proof.sources || !Array.isArray(context.displayData)
      || context.selected !== proof.database.get(proof.selected) || context.preview !== proof.preview
      || context.targetActor !== proof.targetActor || context.displayData.length !== proof.database.size) return null;
    const seen = new Set();
    for (const row of context.displayData) {
      if (seen.has(row.key)) return null;
      seen.add(row.key);
      const original = proof.database.get(row.key), approval = original && binding(original, proof);
      // Preserve contexts projected by unrelated adapters; exact BoB rows must still be native.
      if (approval && (row.label !== original.label || row.source !== original.source || row.art !== original.art
        || row.tags !== original.tags || !same(row.allTags, Object.values(original.tags).flat().filter(Boolean)))) return null;
    }
    return {displayData: context.displayData, rows: [...context.displayData], content: canonical(context.displayData), selected: context.selected};
  }
  function sameContext(before, context, proof) {
    const after = contextProof(context, proof);
    return after && before.displayData === after.displayData && before.selected === after.selected
      && before.content === after.content && before.rows.every((row, index) => row === after.rows[index]);
  }
  function project(parts, context, proof) {
    const applied = [], plans = [];
    const grid = parts?.grid;
    if (grid?.tagName === 'SECTION' && grid.getAttribute('data-application-part') === 'grid') {
      const container = one(children(grid).filter(node => node.tagName === 'DIV' && hasClass(node, 'grid') && hasClass(node, 'cg-scrollable')));
      const cells = children(container), counts = new Map();
      for (const cell of cells) counts.set(cell.getAttribute('data-key'), (counts.get(cell.getAttribute('data-key')) ?? 0) + 1);
      for (const cell of cells) {
        const key = cell.getAttribute('data-key'), record = proof.database.get(key), approval = record && binding(record, proof);
        if (!approval || counts.get(key) !== 1 || cell.tagName !== 'DIV' || !hasClass(cell, 'preview')
          || cell.getAttribute('data-action') !== 'selectImage' || cell.getAttribute('data-label') !== record.label
          || cell.getAttribute('data-source') !== record.source) continue;
        const row = context.displayData.find(row => row.key === key);
        if (!row || cell.getAttribute('data-tags') !== String(row.allTags)) continue;
        const figure = one(children(cell).filter(node => node.tagName === 'FIGURE'));
        const image = one(children(figure).filter(node => node.tagName === 'IMG'));
        const caption = one(children(figure).filter(node => node.tagName === 'FIGCAPTION'));
        if (image?.getAttribute('src') !== record.art.thumb || !leaf(caption) || caption.textContent !== record.label) continue;
        plans.push(() => {caption.textContent = approval.labelAfter; applied.push({index: approval.index, field: 'label', surface: 'grid'});});
      }
    }
    const details = parts?.details, record = proof.database.get(proof.selected), approval = record && binding(record, proof);
    if (approval && details?.tagName === 'ASIDE' && details.getAttribute('data-application-part') === 'details') {
      const section = one(children(details).filter(node => node.tagName === 'SECTION' && hasClass(node, 'selection')));
      if (section?.getAttribute('data-selection') === record.key
        && section.getAttribute('style') === `background-image: url('${record.art[proof.preview]}')`) {
        const header = one(children(section).filter(node => node.tagName === 'HEADER'));
        const name = one(children(header).filter(node => node.tagName === 'P'));
        if (leaf(name) && name.textContent === record.label) plans.push(() => {
          name.textContent = approval.labelAfter; applied.push({index: approval.index, field: 'label', surface: 'details'});
        });
        const tooltip = children(children(header)[0])[0];
        if (tooltip?.tagName === 'I' && hasClass(tooltip, 'info') && hasClass(tooltip, 'fa-books')
          && tooltip.getAttribute('data-tooltip') === `${proof.tooltipLabel}<br/><em>${record.source}</em>`) plans.push(() => {
          tooltip.setAttribute('data-tooltip', `${proof.tooltipLabel}<br/><em>${escape(approval.sourceAfter)}</em>`);
          applied.push({index: approval.index, field: 'source', surface: 'details'});
        });
      }
    }
    for (const commit of plans) commit();
    return {applied, maskedIndexes: rows.filter(row => proof.database.get(row.key) !== proof.data[row.index]).map(row => row.index)};
  }
  function wrap(target, key, make) {
    const descriptor = Object.getOwnPropertyDescriptor(target, key), original = target[key];
    if (typeof original !== 'function') return false;
    const wrapper = make(original);
    Object.defineProperty(target, key, {configurable: true, writable: true, value: wrapper});
    restorers.push(() => {if (target[key] !== wrapper) return; if (descriptor) Object.defineProperty(target, key, descriptor); else delete target[key];});
    return true;
  }
  wrap(app, 'close', original => function (...args) {
    if (this === app) generation++;
    return Reflect.apply(original, this, args);
  });
  wrap(app, '_prepareContext', original => async function (...args) {
    const before = this === app ? capture('prepare') : null;
    const context = await Reflect.apply(original, this, args);
    const after = capture('prepare');
    if (unchanged(before, after, true)) {
      const prepared = contextProof(context, after);
      if (prepared) contexts.set(context, {proof: after, prepared});
    }
    return context;
  });
  wrap(app, '_renderHTML', original => async function (context, ...args) {
    const prepared = this === app ? contexts.get(context) : null, before = capture();
    const valid = prepared && unchanged(prepared.proof, before) && [1, 2].includes(before.state)
      && sameContext(prepared.prepared, context, before);
    const parts = await Reflect.apply(original, this, [context, ...args]);
    lastAudit = {applied: []};
    const after = capture();
    if (valid && unchanged(before, after, true) && sameContext(prepared.prepared, context, after)) lastAudit = project(parts, context, after);
    return parts;
  });
  // Do not bypass an already-installed third-party action wrapper.
  const actions = app.options.actions;
  const nativeInspect = GalleryClass.DEFAULT_OPTIONS.actions.inspectImage;
  if (actions.inspectImage === nativeInspect) wrap(actions, 'inspectImage', original => function (...args) {
    const proof = this === app ? capture() : null;
    const record = proof?.database.get(proof.selected), approval = record && binding(record, proof);
    if (!approval || ![1, 2].includes(proof.state)) return Reflect.apply(original, this, args);
    const database = new Map(proof.database);
    database.set(record.key, {...record, label: approval.labelAfter});
    const view = Object.create(app, {database: {value: database}, session: {value: {...app.session}}});
    return Reflect.apply(original, view, args);
  });
  const dispose = () => {if (!active) return; active = false; generation++; lastAudit = {applied: []}; for (const restore of restorers.reverse()) restore();};
  dispose.isActive = () => active;
  dispose.getLastAudit = () => structuredClone(lastAudit);
  return dispose;
}
