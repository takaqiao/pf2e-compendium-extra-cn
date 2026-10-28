import {patchFragment, replaceText, showInputName} from './team-plus-presentation-core.mjs';
import {createAdventuresChat} from './adventures-chat.mjs';
import {adventuresEnabled} from './adventures-runtime-gate.mjs';
export {adventuresEnabled} from './adventures-runtime-gate.mjs';

const MODULE = 'pf2e-team-plus-adventures';
const ATTRIBUTES = ['title', 'alt', 'aria-label', 'data-tooltip', 'placeholder'];
const EDITOR = 'prose-mirror,.ProseMirror,[contenteditable]:not([contenteditable="false"])';
const rootOf = html => html?.nodeType === 1 ? html : html?.[0];
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const templateCache = new WeakMap();

export function adventuresSurface(app) {
  const classes = app.options?.classes ?? [];
  if (!classes.includes(MODULE)) return null;
  if (classes.includes('creaturedex-menu') || classes.includes('creaturedex-reveal')) return 'creaturedex';
  if (classes.includes('journey-page') && ['path', 'event', 'approach'].some(type => app.page?.type === `${MODULE}.${type}`)) return 'journey';
  return null;
}

function template(row) {
  if (templateCache.has(row)) return templateCache.get(row);
  const slots = [...row.source.matchAll(/\$\{([^{}]*)\}/g)];
  const names = slots.map(match => match[0]);
  const valid = slots.length && names.every(name => !name.includes('${', 2))
    && row.source.split(/\$\{[^{}]*\}/).every(part => !part.includes('${'))
    && [...row.after.matchAll(/\$\{[^{}]*\}/g)].every(match => names.includes(match[0]))
    && names.every(name => row.after.includes(name));
  const compiled = valid ? {
    pattern: new RegExp(`^${row.source.split(/\$\{[^{}]*\}/).map(escape).join('([\\s\\S]*?)')}$`), names,
  } : null;
  templateCache.set(row, compiled);
  return compiled;
}

/** Interpolation values are opaque strings. No upstream expression is executed. */
export function adventuresText(value, surface, rows) {
  const exact = rows.find(row => row.surface === surface && row.source === value);
  if (exact) return exact.after;
  for (const row of rows) {
    if (row.surface !== surface || !row.source.includes('${') || row.source === row.after) continue;
    const compiled = template(row);
    const match = compiled?.pattern.exec(value);
    if (!match) continue;
    return row.after.replace(/\$\{[^{}]*\}/g, name => match[compiled.names.indexOf(name) + 1]);
  }
  return value;
}

export function bossTurnName(combatant, initial, rows) {
  const flags = combatant.flags?.[MODULE];
  if (!flags?.bossTurn || flags.bossOf !== initial?.id || combatant.name !== `${initial.name} (Boss Turn)`) return null;
  return adventuresText(combatant.name, 'boss', rows);
}

export function journeyCount(value, rows) {
  const match = /^(\d+(?:d\d+)?) segments?( left)?$/.exec(value);
  if (!match) return value;
  const count = `${match[1]} ${adventuresText('segments', 'journey', rows)}`;
  return match[2] ? adventuresText(`${count} left`, 'journey', rows) : count;
}

export function journeySegmentTooltip(segment, rows) {
  const text = value => adventuresText(value, 'journey', rows);
  const parts = [segment.label, segment.start && 'Start', segment.end && 'End'].filter(Boolean);
  const before = parts.join(', ');
  const after = [segment.label, segment.start && text('Start'), segment.end && text('End')].filter(Boolean).join(', ');
  if (segment.tooltip === before) return after;
  const prefix = before ? `${before} — ` : '';
  if (typeof segment.tooltip !== 'string' || !segment.tooltip.startsWith(prefix)) return segment.tooltip;
  const event = segment.tooltip.slice(prefix.length);
  const match = /^(Danger|Inclemency|Navigation|Discovery|Abundance|Special|Peaceful|Missing event|Rolled on the events table)(: [\s\S]*)?$/.exec(event);
  if (!match) return segment.tooltip;
  return (after ? `${after} — ` : '') + text(match[1]) + (match[2] ?? '');
}

export function journeyEventRanges(value, rows) {
  const entry = '\\d+(?:–\\d+)? (?:Danger|Inclemency|Navigation|Discovery|Peaceful|Abundance)';
  if (!new RegExp(`^${entry}(?:, ${entry})*$`).test(value.trim())) return value;
  return value.replace(/Danger|Inclemency|Navigation|Discovery|Peaceful|Abundance/g,
    kind => adventuresText(kind, 'journey', rows));
}

const journeySelectors = [
  '.journey-edit label', '.journey-edit legend', '.journey-edit button', '.journey-edit .hint',
  '.journey-edit .journey-columns > span', '.journey-map-controls button', '.journey-map-empty',
  '.journey-row > strong', '.journey-company h4', '.journey-inclemencies h4',
  '.journey-company-actions button', '.journey-delete', '.journey-primary', '.journey-speed > span',
  '.journey-fatigued', '.journey-hint', '.journey-location', '.journey-count', '.journey-cost',
  '.journey-pool-kind', '.journey-missing', '.journey-traits .tag', '.journey-table-row > span',
].join(',');
const creatureSelectors = [
  '.creaturedex-known th', '.creaturedex-note', '.creaturedex-warning', '.creaturedex-hint',
  '.creaturedex-footer button', '.creaturedex-choice', '.creaturedex-field legend',
  '.creaturedex-changed',
].join(',');
const optionSelectors = [
  'select[name="system.kind"] option', 'select[name="system.length"] option', 'select[name="system.layout"] option',
  '.journey-direction select option', '.journey-grid-fields select option', '.journey-speed select option',
  'select[aria-label="Kind"] option',
].join(',');

export function createAdventuresPresentation({game, data, fromUuid = globalThis.fromUuid}) {
  const rows = data.ui;
  const {statText, templateText} = createAdventuresChat({game, data});
  const observers = new WeakMap();
  const dialogs = new WeakMap();
  const speedLookups = new WeakMap();
  const journeyRoots = new Set();
  const embeds = new WeakMap();
  let menuObserver;
  const diagnostics = {applications: 0, changes: 0, failures: []};
  const text = (value, surface) => {
    if (surface === 'journey') {
      const activity = /^(Breathe|Survey|Navigate|Discover|Circumvent): (not while fatigued|(?:needs )?\d+ Endurance)$/.exec(value);
      if (activity) return `${adventuresText(activity[1], surface, rows)}：${adventuresText(activity[2], surface, rows)}`;
      const match = /^(Danger|Inclemency|Navigation|Discovery|Abundance|Special|Peaceful) faces$/.exec(value);
      if (match) return templateText(417, value, {'gl[V(t).kind]??``': kind => adventuresText(kind, surface, rows)});
    } else if (surface === 'creaturedex') {
      const match = /^Reset (Characteristics|Defense|Offense|Description|Disable|Routine and Reset)$/.exec(value);
      if (match) return templateText(79, value, {'V(i).label??``': section => adventuresText(section, surface, rows)});
    }
    return adventuresText(value, surface, rows);
  };
  const label = (value, surface) => {
    const trimmed = value.trim();
    const after = text(trimmed, surface);
    return after === trimmed ? value : value.replace(trimmed, () => after);
  };

  function present(element, surface, {attributes = true, content = true} = {}) {
    if (!element || element.closest(EDITOR)) return;
    if (content && !element.matches('input,textarea')) for (const child of element.childNodes) {
      if (child.nodeType !== 3) continue;
      const after = label(child.data, surface);
      if (after !== child.data) { child.data = after; diagnostics.changes++; }
    }
    if (attributes) for (const attribute of ATTRIBUTES) {
      const before = element.getAttribute(attribute);
      if (before === null) continue;
      const after = text(before, surface);
      if (before !== after) { element.setAttribute(attribute, after); diagnostics.changes++; }
    }
  }

  function observe(root, run) {
    if (observers.has(root)) return;
    const observer = new MutationObserver(() => {
      if (!root.isConnected) { observer.disconnect(); return; }
      run();
    });
    observer.observe(root, {subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ATTRIBUTES});
    observers.set(root, observer);
  }

  function contextMenu() {
    const menu = globalThis.ui?.context;
    if (!adventuresEnabled(game) || !menu?.element || !menu.target) return;
    for (const root of journeyRoots) {
      if (!root.isConnected) { journeyRoots.delete(root); continue; }
      if (!root.contains(menu.target) || !menu.target.closest('.svelte-flow')) continue;
      for (const entry of menu.menuItems ?? []) {
        const span = entry.element?.querySelector(':scope > span');
        if (!span) continue;
        present(span, 'journey');
        for (const cost of span.querySelectorAll('.journey-menu-cost')) present(cost, 'journey');
      }
    }
  }

  function settings(root) {
    for (const [key, surface] of [['bossTurnAutomation', 'boss'], ['creaturedexPartyKnowledge', 'creaturedex']]) {
      const group = root.querySelector(`[name="${MODULE}.${key}"]`)?.closest('.form-group');
      if (group) for (const el of group.querySelectorAll('label,.hint,.notes')) present(el, surface);
    }
    const menu = root.querySelector(`[data-key="${MODULE}.creaturedex"]`)?.closest('.form-group');
    if (menu) for (const el of menu.querySelectorAll('label,button > span,.hint,.notes')) present(el, 'creaturedex');
    for (const option of root.querySelectorAll(`option[value^="${MODULE}."]`)) present(option, 'journey');
  }

  function dialogSurface(app, root) {
    if (dialogs.has(app)) return dialogs.get(app);
    const title = app.options?.window?.title ?? app.title;
    const content = root.querySelector('.dialog-content');
    if (!content) return null;
    const body = content.textContent;
    let surface = null;
    if (title === 'Boss Turn Order' && body.includes("The initiative order changed and a boss's turns are no longer in the right place.")
      && root.querySelector('[data-action="reshuffle"]')) surface = 'boss';
    if (/^(Recall Knowledge|Discerning Aid): /.test(title ?? '') && (content.querySelector('.creaturedex-choices')
      || content.querySelector('[name="loreDC"]') && body.includes('wants to Recall Knowledge about'))) surface = 'creaturedex';
    if (title === 'Forget Creature' && /^Forget everything .+ learned about .+\? They also lose the completed creaturedex for it\.$/.test(body.trim())) surface = 'creaturedex';
    if (title === 'Camp' && /^Everyone who can spends \d+ Endurance\./.test(body.trim())
      && body.includes('What was the result of the check to Camp?')) surface = 'journey';
    if (title === 'End the Journey' && body.trim() === "End this journey? The party's Endurance, approaches and the segments they reached are cleared.") surface = 'journey';
    if (title === 'Unresolved Event' && /^The .+ isn't resolved yet, which usually keeps the party from moving on\. Approach anyway\?$/.test(body.trim())) surface = 'journey';
    if (surface) dialogs.set(app, surface);
    return surface;
  }

  function dialog(app, root) {
    const surface = dialogSurface(app, root);
    if (!surface) return;
    for (const el of root.querySelectorAll('.window-title,.dialog-buttons button,.dialog-content label,.dialog-content legend,.dialog-content .hint,.dialog-content > p')) present(el, surface);
    const content = root.querySelector('.dialog-content');
    const fullBefore = content.innerHTML;
    const fullAfter = templateText(327, fullBefore);
    if (fullBefore !== fullAfter) patchFragment(content, fullBefore, fullAfter);
    for (const p of root.querySelectorAll('.dialog-content p')) {
      const before = p.outerHTML;
      let after = before;
      for (const id of surface === 'journey' ? [353] : [59, 91, 92]) {
        const transforms = id === 353 ? {n: value => {
          const capitalized = value[0]?.toUpperCase() + value.slice(1);
          const translated = text(capitalized, 'journey');
          return translated === capitalized ? null : translated;
        }} : id === 92 ? {'Cc(d.map(e=>u[e]))': value => {
          const sections = value.split(/,? and |, /);
          const translated = sections.map(section => text(section, 'creaturedex'));
          return translated.some((section, index) => section === sections[index]) ? null : translated.join('、');
        }} : {};
        after = templateText(id, after, transforms);
      }
      if (after === before) after = text(before, surface);
      if (before !== after && patchFragment(p.parentElement, before, after)) diagnostics.changes++;
    }
    for (const option of root.querySelectorAll('select[name="first"] option,select[name="second"] option,select[name="skills"] option[value="lore"]')) {
      if (option.textContent.endsWith(' (known)')) {
        const original = option.textContent.slice(0, -8);
        const known = text('known', 'creaturedex');
        const after = `${text(original, 'creaturedex')}（${known}）`;
        replaceText(option, option.textContent, after);
      } else present(option, surface);
    }
    for (const legend of root.querySelectorAll('.creaturedex-choices')) {
      const heading = legend.parentElement.querySelector('legend');
      if (heading?.textContent === 'Skill') replaceText(heading, 'Skill', text('Skill', 'journey'));
    }
  }

  async function travelSpeed(app, root) {
    if (app.page?.isOwner !== true || app.page.type !== `${MODULE}.path` || app.$state?.party?.speedRules) return;
    const heading = root.querySelector('.journey-speed > span');
    const existing = heading?.querySelector('.journey-help');
    if (!heading || existing?.getAttribute('data-tooltip-html') || existing?.getAttribute('data-tooltip') || !fromUuid) return;
    if (!speedLookups.has(app)) speedLookups.set(app, (async () => {
      const page = await fromUuid(`Compendium.${MODULE}.${game.system.id}-journals.JournalEntry.wKHOSd6WYx3q5L0A.JournalEntryPage.QcVVriPxaBx4muGX`);
      if (!page || page.id !== 'QcVVriPxaBx4muGX' || page.parent?.id !== 'wKHOSd6WYx3q5L0A') return '';
      const holder = document.createElement('div');
      holder.innerHTML = page.text?.content ?? '';
      const heading = [...holder.querySelectorAll('h2')].find(el => ['Travel Speed', text('Travel Speed', 'journey')].includes(el.textContent.trim()));
      if (!heading) return '';
      const parts = [];
      for (let el = heading.nextElementSibling; el && el.tagName !== 'H2'; el = el.nextElementSibling) parts.push(el.outerHTML);
      const enrich = globalThis.foundry?.applications?.ux?.TextEditor?.implementation?.enrichHTML;
      return enrich ? enrich(parts.join(''), {relativeTo: page}) : '';
    })());
    const html = await speedLookups.get(app);
    if (!html || app.page.isOwner !== true || !adventuresEnabled(game) || !root.contains(heading)) return;
    let help = heading.querySelector('.journey-help');
    if (!help) {
      help = document.createElement('i');
      help.className = 'journey-help fa-solid fa-circle-question';
      help.setAttribute('role', 'img');
      help.setAttribute('aria-label', text('Travel speed rules', 'journey'));
      help.setAttribute('data-tooltip-class', 'pf2e');
      heading.append(help);
    }
    if (!help.hasAttribute('data-tooltip-html')) help.setAttribute('data-tooltip-html', html);
  }

  function owned(app, root, surface) {
    const selectors = surface === 'journey' ? journeySelectors : creatureSelectors;
    for (const el of root.querySelectorAll(selectors)) present(el, surface);
    const attrs = surface === 'journey'
      ? '.journey-edit input,.journey-edit select,.journey-edit button,.journey-map-controls button,.journey-party button,.journey-party select,.journey-pips,.journey-party-marker,.journey-help,.journey-lead'
      : '.creaturedex-known [aria-label],.creaturedex-known [data-tooltip],.creaturedex-count,.creaturedex-characters,.creaturedex-field button,.creaturedex-choice';
    for (const el of root.querySelectorAll(attrs)) present(el, surface, {content: false});
    if (surface === 'journey') {
      const segments = app.$state?.map?.segments ?? app.$state?.edit?.path?.map?.segments ?? [];
      for (const element of root.querySelectorAll('.svelte-flow__node[data-id] > .journey-segment')) {
        const segment = segments.find(segment => segment.id === element.parentElement.dataset.id);
        if (!segment) continue;
        const after = journeySegmentTooltip(segment, rows);
        if (after === segment.tooltip) continue;
        for (const attribute of ['data-tooltip', 'aria-label']) {
          if (element.getAttribute(attribute) === segment.tooltip) element.setAttribute(attribute, after);
        }
      }
      journeyRoots.add(root);
      if (!menuObserver) {
        menuObserver = new MutationObserver(contextMenu);
        menuObserver.observe(document.body, {childList: true});
      }
      for (const el of root.querySelectorAll(optionSelectors)) present(el, surface);
      // Svelte assigns these default options an explicit empty value before render.
      for (const el of root.querySelectorAll('option[value=""]')) if (['Choose an approach…', 'Add an event…', 'Add an inclemency…', 'Undecided, rolled when reached'].includes(el.textContent)) present(el, surface);
      for (const group of root.querySelectorAll('.journey-party optgroup,.journey-edit optgroup')) {
        const before = group.getAttribute('label');
        const after = text(before ?? '', 'journey');
        if (before !== after) group.setAttribute('label', after);
      }
      for (const count of root.querySelectorAll('.journey-inclemencies .journey-count')) {
        const before = count.textContent;
        const after = journeyCount(before.trim(), rows);
        if (after !== before.trim()) replaceText(count, before, after);
      }
      for (const row of root.querySelectorAll('.journey-row')) {
        const heading = row.querySelector(':scope > strong')?.textContent;
        if (heading === text('Events', surface) && app.page?.type === `${MODULE}.path`) {
          const source = app.$state?.view?.rows?.find(row => row.label === 'Events')?.html;
          if (source) {
            const template = document.createElement('template');
            template.innerHTML = source;
            for (const node of template.content.childNodes) {
              if (node.nodeType === 3) node.data = journeyEventRanges(node.data, rows);
            }
            patchFragment(row, source, template.innerHTML);
          }
        }
        if (heading === text('Duration', surface)) for (const child of row.childNodes) {
          if (child.nodeType !== 3) continue;
          const before = child.data.trim();
          const after = journeyCount(before, rows);
          if (before !== after) child.data = child.data.replace(before, after);
          else if (before === 'segments') child.data = child.data.replace(before, text(before, surface));
        }
        if (heading === text('Combination', surface)) for (const child of row.childNodes) {
          if (child.nodeType === 3 && /^(North|East|South|West)(, (North|East|South|West))*$/.test(child.data.trim())) {
            child.data = child.data.trim().split(', ').map(direction => text(direction, surface)).join('、');
          }
        }
        if (heading === text('Forks', surface)) for (const child of row.childNodes) {
          if (child.nodeType === 3 && ['webbed', 'hexcrawl'].includes(child.data.trim())) {
            const before = child.data.trim();
            child.data = child.data.replace(before, text(before[0].toUpperCase() + before.slice(1), surface));
          }
        }
      }
      const header = root.querySelector('.statblock > :is(h1,h2,h3,h4,h5,h6) > span:last-of-type');
      if (header && header.textContent === app.$state?.view?.header?.title) present(header, surface);
      void travelSpeed(app, root).catch(error => diagnostics.failures.push(String(error)));
    } else {
      present(root.querySelector('.window-title'), surface);
      const parties = app.$state?.parties ?? [];
      const headings = root.querySelectorAll('.creaturedex-party');
      parties.filter(party => party.name).forEach((party, index) => {
        if (party.id === '' && party.name === 'No Party') present(headings[index], surface);
      });
      const sections = root.querySelectorAll('fieldset.creaturedex-field:has(.creaturedex-choices)');
      for (const [index, section] of (app.data?.sections ?? []).entries()) {
        const entries = section.choice === 'reveal' ? section.original : section.entries;
        const editor = sections[index]?.querySelector('.creaturedex-editor');
        if (!editor) continue;
        for (const label of editor.querySelectorAll('label[for$="-name"],label[for$="-level"]')) present(label, surface);
        const details = editor.querySelectorAll('details');
        entries.filter(entry => entry.kind === 'rich').forEach((entry, detailIndex) => {
          // Native actor abilities have glyph/traits properties, even when empty.
          if (!Object.hasOwn(entry, 'glyph') && !Object.hasOwn(entry, 'traits')) present(details[detailIndex]?.querySelector('summary > strong'), surface);
        });
        entries.forEach((entry, entryIndex) => {
          if (entry.kind === 'traits') present(editor.querySelector(`label[for$="-${entryIndex}"]`), surface);
          if (entry.kind !== 'stat') return;
          entry.parts.forEach((part, partIndex) => {
            const label = editor.querySelector(`label[for$="-${entryIndex}-${partIndex}"]`);
            const input = label && editor.querySelector(`#${CSS.escape(label.htmlFor)}`);
            if (!label || !input || input.value !== part.value) return;
            const fixedLabels = section.key === 'characteristics'
              ? ['Perception', 'Languages', 'Skills', 'Str', 'Dex', 'Con', 'Int', 'Wis', 'Cha', 'Stealth']
              : section.key === 'defense' ? ['AC', 'HP', 'Hardness', 'Immunities', 'Weaknesses', 'Resistances'] : [];
            const strike = ['Melee', 'Ranged'].includes(entry.parts[0]?.label)
              && /^.+ (?:[+-]\d+|DC \d+)(?: \(.+\))?$/.test(entry.parts[0].value);
            const speed = part.label === 'Speed' && /^(?:(?:burrow|climb|fly|swim) )?\d+ feet/.test(part.value);
            if (fixedLabels.includes(part.label) || strike || speed) {
              present(label, surface);
              const key = globalThis.CONFIG?.PF2E?.abilities?.[part.label?.toLowerCase()];
              if (key && label.textContent.trim() === part.label) replaceText(label, part.label, game.i18n.localize(key));
            }
            const after = statText(part.label, input.value);
            if (after !== input.value) showInputName(input, input.value, after);
          });
        });
      }
      const summary = root.querySelector('.creaturedex-subline');
      const before = app.data && `${app.data.actor.name} · ${app.data.summary}`;
      if (summary && before && summary.textContent === before) replaceText(summary, before, `${app.data.actor.name} · ${text(app.data.summary, surface)}`);
    }
  }

  function embedded(root) {
    if (!fromUuid) return;
    for (const element of root.querySelectorAll('.content-embed[data-uuid]')) {
      if (element.closest(EDITOR)) continue;
      if (!embeds.has(element)) embeds.set(element, Promise.resolve(fromUuid(element.dataset.uuid)).then(page => {
        const app = {options: {classes: [MODULE, 'journey-page']}, page};
        if (adventuresSurface(app) !== 'journey') return;
        const kind = page.type.slice(MODULE.length + 1);
        const title = kind === 'path' ? `Path ${page._source.system.level}`
          : kind === 'event' ? page._source.system.kind.replace(/^./, character => character.toUpperCase()) : null;
        app.$state = {view: {header: {title}}};
        const run = () => { if (adventuresEnabled(game)) owned(app, element, 'journey'); };
        run();
        observe(element, run);
      }).catch(error => diagnostics.failures.push(String(error))));
    }
  }

  function application(app, html) {
    if (!adventuresEnabled(game)) return;
    const root = rootOf(html);
    if (!root) return;
    diagnostics.applications++;
    const surface = adventuresSurface(app);
    const run = () => {
      if (!adventuresEnabled(game)) return;
      if (surface) owned(app, root, surface);
      else { settings(root); dialog(app, root); embedded(root); }
    };
    run();
    if (surface || dialogs.has(app)) observe(root, run);
  }

  function combatTracker(app, html) {
    if (!adventuresEnabled(game)) return;
    const root = rootOf(html);
    const combat = app.viewed ?? game.combat;
    if (!root || !combat) return;
    for (const element of root.querySelectorAll('[data-combatant-id]')) {
      const combatant = combat.combatants.get(element.dataset.combatantId);
      if (!combatant) continue;
      const initial = combat.combatants.get(combatant.flags?.[MODULE]?.bossOf);
      const name = bossTurnName(combatant, initial, rows);
      if (name) for (const label of element.querySelectorAll('.token-name h4,.token-name > .name,.combatant-name')) replaceText(label, combatant.name, name);
    }
  }

  return {application, combatTracker, diagnostics};
}
