/** Display-only adapter for the reviewed PF2e 8.5.1 spell consumers.
 * No real Document, system field, rule, slug, UUID or source flag is modified.
 */
const FIELDS = ['range', 'time', 'target', 'duration'];
const PACK = 'pf2e-bastion-of-blasphemies.';
const at = (object, path) => path.split('.').reduce((value, key) => value?.[key], object);
const normalized = value => value ?? null;
const sourceUUID = item => normalized(item?._source?._stats?.compendiumSource);
const folder = item => normalized(item?._source?.folder);
const contents = value => value?.contents ?? (value?.values ? [...value.values()] : []);

function methodDescriptor(prototype, key) {
  for (let owner = prototype; owner; owner = Object.getPrototypeOf(owner)) {
    const descriptor = Object.getOwnPropertyDescriptor(owner, key);
    if (descriptor) return descriptor;
  }
  return null;
}

function makeResolver(bindings) {
  const rows = new Map();
  for (const row of bindings) {
    const key = `${row.actorId}/${row.ownerId}/${row.spellId}`;
    if (rows.has(key) || !['actorSpell', 'consumableSpell'].includes(row.scope)
      || !row.names?.name || !row.ownerName || !row.fields) throw new Error(`Invalid BoB spell display binding: ${key}`);
    for (const [path, text] of Object.entries(row.fields)) {
      if (!/^system\.(?:(?:overlays\.[^.]+\.system\.)|(?:heightening\.levels\.\d+\.))?(range|time|target|duration)\.value$/.test(path)
        || typeof text.before !== 'string' || !text.before || typeof text.after !== 'string' || !text.after) {
        throw new Error(`Invalid BoB spell display field: ${key}/${path}`);
      }
    }
    rows.set(key, row);
  }
  function identify(spell) {
    if (!spell || spell.type !== 'spell') return null;
    const root = spell.original ?? spell;
    if (root.original) return null;
    const owner = root.parentItem ?? root, actor = root.actor ?? root.parent;
    if (!actor || [root.pack, owner.pack, actor.pack].some(pack => pack && !pack.startsWith(PACK))) return null;
    const row = rows.get(`${actor.id}/${owner.id}/${root.id}`);
    if (!row || row.scope !== (root.parentItem ? 'consumableSpell' : 'actorSpell')
      || owner.type !== row.ownerType || owner.name !== row.ownerName.after || root.name !== row.names.name.after
      || folder(owner) !== normalized(row.ownerFolderId) || sourceUUID(owner) !== normalized(row.ownerSourceUuid)
      || folder(root) !== normalized(row.spellFolderId) || sourceUUID(root) !== normalized(row.spellSourceUuid)
      || actor.type !== row.actorType || folder(actor) !== normalized(row.actorFolderId)
      || sourceUUID(actor) !== normalized(row.actorSourceUuid)) return null;
    if (root.parentItem && (owner.embeddedSpell !== root || owner.system?.spell?._id !== root.id)) return null;
    const overlays = spell.original ? [...(spell.appliedOverlays?.entries() ?? [])] : [];
    if (overlays.some(([type, id]) => type !== 'override' || !root._source.system.overlays?.[id]) || overlays.length > 1) return null;
    let expectedName = row.names.name.after;
    for (const [, id] of overlays) {
      const namePath = `system.overlays.${id}.name`, rawName = at(root._source, namePath);
      if (rawName !== undefined) {
        const name = row.names[namePath];
        if (!name || rawName !== name.after) return null;
        expectedName = name.after;
      }
    }
    if (spell.name !== expectedName || spell.actor !== root.actor || spell.parentItem !== root.parentItem) return null;
    return {row, root, spell, overlays};
  }
  function field(spell, path) {
    const identity = identify(spell);
    if (!identity) return null;
    const {row, root, overlays} = identity;
    let sourcePath = path;
    const base = /^system\.(range|time|target|duration)\.value$/.exec(path);
    if (base && spell.original) {
      for (const [, id] of overlays) {
        const override = `system.overlays.${id}.system.${base[1]}.value`;
        if (at(root._source, override) !== undefined) sourcePath = override;
      }
      for (const layer of root.getHeightenLayers(spell.rank)) {
        const heighten = `system.heightening.levels.${layer.level}.${base[1]}.value`;
        if (at(root._source, heighten) !== undefined) sourcePath = heighten;
      }
    }
    const text = row.fields[sourcePath];
    if (!text || at(root._source, sourcePath) !== text.before || at(spell, path) !== text.before) return null;
    return {...text, key: row.key, path, sourcePath};
  }
  return {identify, field};
}

function descriptionDisplay(value, spell, resolve, localize, format) {
  if (typeof value !== 'string') return value;
  const divider = '<hr class="item-block-divider" />', boundary = value.indexOf(divider);
  if (boundary < 0) return value;
  const prefix = value.slice(0, boundary), template = document.createElement('template');
  template.innerHTML = prefix;
  const requests = [
    ['range', 'PF2E.TraitRange'], ['target', 'PF2E.SpellTargetLabel'],
    ['duration', 'PF2E.Time.Duration'], ['time', 'PF2E.Item.Spell.Cast.Noun']
  ];
  let changed = false;
  for (const [field, label] of requests) {
    if (field === 'time' && spell.actionGlyph) continue;
    const text = resolve(spell, `system.${field}.value`);
    if (!text || text.before === text.after) continue;
    let before = text.before.trim(), after = text.after.trim();
    if (field === 'duration' && spell.system.duration.sustained) {
      before = format('PF2E.Item.Spell.Sustained.Duration', {maximum: before}).toLocaleLowerCase(game.i18n.lang);
      after = format('PF2E.Item.Spell.Sustained.Duration', {maximum: after}).toLocaleLowerCase(game.i18n.lang);
    }
    const candidates = [...template.content.querySelectorAll('p.item-block-line > span')]
      .filter(span => span.querySelector(':scope > strong')?.textContent === localize(label));
    if (candidates.length !== 1) continue;
    const span = candidates[0], strong = span.querySelector(':scope > strong');
    const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT), nodes = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (strong.contains(node)) continue;
      const start = node.nodeValue.indexOf(before);
      if (start < 0) continue;
      const leading = node.nodeValue.slice(0, start), trailing = node.nodeValue.slice(start + before.length).trim();
      if (!leading.trim() && (!trailing || trailing === localize('PF2E.Item.Spell.LineSplit').trim())) nodes.push({node, start});
    }
    if (nodes.length !== 1) continue;
    const {node, start} = nodes[0];
    node.nodeValue = node.nodeValue.slice(0, start) + after + node.nodeValue.slice(start + before.length);
    changed = true;
  }
  return changed ? template.innerHTML + value.slice(boundary) : value;
}

const domRoots = html => html instanceof Element ? [html] : [...(html ?? [])].filter(root => root instanceof Element);

export function installBobSpellDisplay({SpellClass, SpellSheetClasses, ActorSheetClasses, Hooks,
  bindings, isEnabled, localize, format}) {
  const resolve = makeResolver(bindings), specs = [];
  const add = (prototype, key, kind) => {
    if (specs.some(spec => spec.prototype === prototype && spec.key === key)) return;
    const own = Object.getOwnPropertyDescriptor(prototype, key), inherited = methodDescriptor(prototype, key);
    if (typeof inherited?.value !== 'function' || own && !own.configurable || !own && !Object.isExtensible(prototype)) {
      throw new Error(`PF2e compatible spell display entry unavailable: ${key}`);
    }
    specs.push({prototype, key, kind, own, original: inherited.value, enumerable: inherited.enumerable});
  };
  add(SpellClass.prototype, 'getDescriptionData', 'description');
  for (const cls of new Set(SpellSheetClasses)) {
    add(cls.prototype, '_renderInner', 'spellRender');
    add(cls.prototype, '_getSubmitData', 'submit');
  }
  for (const cls of new Set(ActorSheetClasses)) add(cls.prototype, '_renderInner', 'actorRender');
  if (!specs.some(s => s.kind === 'submit') || typeof Hooks?.on !== 'function' || typeof Hooks?.off !== 'function') {
    throw new Error('BoB spell display form serialization and hook entries are required.');
  }
  let active = true, hookId;
  const installed = [], sheets = new Set(), ledgers = new WeakMap(), rendered = new WeakSet();
  const enabled = () => active && isEnabled();
  function ledgerFor(sheet) {
    let entries = ledgers.get(sheet);
    if (!entries) {ledgers.set(sheet, entries = []); sheets.add(new WeakRef(sheet));}
    return entries;
  }
  function localizeForm(sheet, html) {
    if (!enabled()) return;
    for (const root of domRoots(html)) {
      if (rendered.has(root)) continue;
      const entries = ledgerFor(sheet);
      for (const input of root.querySelectorAll('input[name]')) {
        const text = resolve.field(sheet.item, input.name);
        if (!text || text.before === text.after || input.value !== text.before) continue;
        const entry = {input: new WeakRef(input), item: sheet.item, dirty: false, ...text};
        entry.onEdit = () => {entry.dirty = true;};
        input.addEventListener('input', entry.onEdit);
        input.addEventListener('change', entry.onEdit);
        entries.push(entry);
        input.value = text.after;
      }
      rendered.add(root);
    }
  }
  function restoreSubmission(sheet, result, updateData) {
    // Cleanup must run even after language/component gates change.
    for (const entry of ledgers.get(sheet) ?? []) {
      const input = entry.input.deref();
      if (!input || entry.dirty || !sheet.form?.contains(input) || input.name !== entry.path || input.value !== entry.after
        || result[entry.path] !== entry.after || Object.hasOwn(updateData ?? {}, entry.path)
        || at(updateData, entry.path) !== undefined) continue;
      const current = resolve.field(entry.item, entry.path);
      if (current?.key === entry.key && current.before === entry.before && sheet.item === entry.item) result[entry.path] = entry.before;
      else delete result[entry.path];
    }
    return result;
  }
  function actorSpells(actor) {
    return contents(actor?.items).flatMap(item => item.type === 'spell' ? [item]
      : item.type === 'consumable' && item.system?.spell ? [item.embeddedSpell].filter(Boolean) : []);
  }
  function locate(actor, id, entryId) {
    const candidates = actorSpells(actor).filter(spell => spell.id === id &&
      (entryId === undefined || normalized(spell.system.location.value) === normalized(entryId || null)));
    return candidates.length === 1 ? candidates[0] : null;
  }
  function localizeActor(sheet, html) {
    if (!enabled()) return;
    for (const root of domRoots(html)) for (const row of root.querySelectorAll('li.spell[data-item-id][data-entry-id]')) {
      const spell = locate(sheet.actor, row.dataset.itemId, row.dataset.entryId), node = row.querySelector(':scope > .range');
      const text = spell && resolve.field(spell, 'system.range.value');
      if (text && node && node.textContent === text.before) node.textContent = text.after;
    }
  }
  function dispose() {
    active = false;
    // Restore still-visible generated values before removing serialization.
    for (const ref of sheets) {
      const sheet = ref.deref();
      if (!sheet) continue;
      for (const entry of ledgers.get(sheet) ?? []) {
        const input = entry.input.deref();
        if (input) {
          input.removeEventListener('input', entry.onEdit);
          input.removeEventListener('change', entry.onEdit);
        }
        if (input?.value === entry.after && !entry.dirty) {
          const current = at(entry.item, entry.path);
          input.value = typeof current === 'string' ? current : entry.before;
        }
      }
    }
    if (hookId !== undefined) Hooks.off('preRenderSpellPreparationApp', hookId);
    for (const spec of installed.reverse()) {
      if (Object.getOwnPropertyDescriptor(spec.prototype, spec.key)?.value !== spec.wrapper) continue;
      if (spec.own) Object.defineProperty(spec.prototype, spec.key, spec.own);
      else delete spec.prototype[spec.key];
    }
    installed.length = 0; sheets.clear();
  }
  try {
    for (const spec of specs) {
      const original = spec.original;
      if (spec.kind === 'description') spec.wrapper = async function (...args) {
        const result = await original.apply(this, args);
        if (!enabled()) return result;
        const value = descriptionDisplay(result.value, this, resolve.field, localize, format);
        return value === result.value ? result : {...result, value};
      };
      else if (spec.kind === 'submit') spec.wrapper = function (updateData = {}) {
        return restoreSubmission(this, original.call(this, updateData), updateData);
      };
      else spec.wrapper = async function (...args) {
        // An inherited actor renderer must follow the current superclass entry.
        // Capturing it here would hide later adapters on ActorSheetPF2e behind
        // this new subclass own method. Native own renderers retain their exact
        // implementation, including their ordinary super dispatch.
        const render = spec.kind === 'actorRender' && !spec.own
          ? Reflect.get(Object.getPrototypeOf(spec.prototype), spec.key, this) : original;
        const html = await Reflect.apply(render, this, args);
        if (spec.kind === 'spellRender') localizeForm(this, html); else localizeActor(this, html);
        return html;
      };
      Object.defineProperty(spec.wrapper, 'name', {value: original.name, configurable: true});
      Object.defineProperty(spec.wrapper, 'length', {value: original.length, configurable: true});
      Object.defineProperty(spec.prototype, spec.key, {value: spec.wrapper, configurable: true, writable: true, enumerable: spec.enumerable});
      installed.push(spec);
    }
    hookId = Hooks.on('preRenderSpellPreparationApp', (app, context) => {
      if (!enabled()) return;
      for (const group of context.state?.groups ?? []) for (const record of group.spells ?? []) {
        const spell = locate(app.actor, record.id), text = spell && resolve.field(spell, 'system.range.value');
        if (text && record.uuid === spell.uuid && record.name === spell.name && record.range === text.before) record.range = text.after;
      }
    });
  } catch (error) {dispose(); throw error;}
  dispose.isActive = () => active;
  return dispose;
}
