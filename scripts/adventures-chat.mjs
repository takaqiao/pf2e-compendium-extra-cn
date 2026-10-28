import {patchFragment, replaceText, sha256} from './team-plus-presentation-core.mjs';
import {adventuresEnabled} from './adventures-runtime-gate.mjs';

const MODULE = 'pf2e-team-plus-adventures';
const SOURCE_PATH = `modules/${MODULE}/dist/${MODULE}.js`;
const ACTIONS = new Map([
  ['yI99AqcBt4JHbgmU', 215], ['OxEhepyZ6dU4W6B4', 216],
  ['hbNCfPtKIwugvyPw', 217], ['rddqPIKA1s7vTMHE', 218],
  ['fQ2an1a1ga8U7vrc', 219], ['KAI1cIP3cAOTl74c', 220],
  ['CIJuYb1VmjUL973c', 221], ['EJhngqVRLG88JPrm', 222],
]);
const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const BRANCH_PATTERNS = new Map([
  ['n.lead?`, leading`:``', '(?:, leading)?'],
  ['a?`can\'t spend the Endurance, so`:``', "(?:can't spend the Endurance, so)?"],
  ['i.length===1?`spends`:`spend`', '(?:spends|spend)'],
  ['a.length===1?`is`:`are`', '(?:is|are)'],
  ['o?` Inclemencies last one segment less.`:``', '(?: Inclemencies last one segment less\\.)?'],
  ['a?`, and the inclemencies end`:``', '(?:, and the inclemencies end)?'],
]);

// Read interpolation boundaries without evaluating any upstream expression.
function expressionEnd(text, start, closing = '}') {
  for (let i = start; i < text.length; i++) {
    const char = text[i];
    if (char === closing) return i;
    if (char === '"' || char === "'") {
      const quote = char;
      while (++i < text.length && text[i] !== quote) if (text[i] === '\\') i++;
    } else if (char === '`') {
      while (++i < text.length && text[i] !== '`') {
        if (text[i] === '\\') i++;
        else if (text.slice(i, i + 2) === '${') i = expressionEnd(text, i + 2);
      }
    } else if (char === '{') i = expressionEnd(text, i + 1);
    else if (char === '(') i = expressionEnd(text, i + 1, ')');
    else if (char === '[') i = expressionEnd(text, i + 1, ']');
  }
  return text.length;
}

function templateParts(text) {
  const parts = [];
  let from = 0, start;
  while ((start = text.indexOf('${', from)) >= 0) {
    parts.push(text.slice(from, start));
    const end = expressionEnd(text, start + 2);
    parts.push({slot: text.slice(start + 2, end)});
    from = end + 1;
  }
  parts.push(text.slice(from));
  return parts;
}

function compile(row) {
  const before = templateParts(row.source), afterParts = templateParts(row.after);
  return {...row, before, afterParts, pattern: new RegExp('^' + before.map(part => typeof part === 'string' ? escapeRegExp(part) : `(${BRANCH_PATTERNS.get(part.slot) ?? '[\\s\\S]*?'})`).join('') + '$')};
}

export function sourceCallAt(stack, calls, method) {
  const frame = String(stack).split('\n').find(line => line.includes(`/${SOURCE_PATH}`));
  if (!frame) return null;
  const location = frame.match(new RegExp('/' + escapeRegExp(SOURCE_PATH) + '(?:\\?[^\\s():]*)?:(\\d+):(\\d+)\\)?$'));
  if (!location) return null;
  const [, line, column] = location.map(Number);
  return calls.find(call => call.method === method && call.line === line && column >= call.startColumn && column <= call.endColumn) ?? null;
}

export function notificationCallsites(source, contracts) {
  const calls = [];
  for (const method of ['info', 'warn', 'error']) {
    const prefix = `ui.notifications.${method}(`;
    let from = 0, start;
    while ((start = source.indexOf(prefix, from)) >= 0) {
      const end = expressionEnd(source, start + prefix.length, ')') + 1;
      const contract = contracts.find(row => row.method === method && row.sha256 === sha256(source.slice(start, end)));
      if (contract) {
        const lineStart = source.lastIndexOf('\n', start) + 1;
        const line = source.slice(0, start).split('\n').length;
        calls.push({...contract, line, startColumn: start - lineStart + 1, endColumn: end - lineStart + 1});
      }
      from = end;
    }
  }
  return calls;
}

export function createAdventuresChat({game, data, config = globalThis.CONFIG?.PF2E, validateRoll = globalThis.Roll?.validate?.bind(globalThis.Roll)}) {
  const rows = new Map((data.ui ?? data.entries ?? []).filter(row => typeof row.after === 'string').map(row => [Number(row.id.split('-').at(-1)), compile(row)]));
  const diagnostics = {messages: 0, unmatched: 0, notifications: 0, sourceCalls: 0};
  const enabled = () => adventuresEnabled(game);
  const text = id => rows.get(id)?.after ?? rows.get(id)?.source;
  function match(id, value) {
    const row = rows.get(id), result = typeof value === 'string' && row?.pattern.exec(value);
    if (!result) return null;
    let index = 0;
    return Object.fromEntries(row.before.filter(part => typeof part !== 'string').map(part => [part.slot, result[++index]]));
  }
  function format(id, values) {
    return rows.get(id).afterParts.map(part => typeof part === 'string' ? part : values[part.slot]).join('');
  }
  function translateUnit(id, value, transforms = {}) {
    const values = match(id, value);
    if (!values) return null;
    for (const [slot, transform] of Object.entries(transforms)) {
      if (!(slot in values)) continue;
      const translated = transform(values[slot]);
      if (translated === null) return null;
      values[slot] = translated;
    }
    return format(id, values);
  }
  function branch(value, before, id) {
    return value === '' ? '' : value === before ? text(id) : null;
  }
  function actionLink(value, expected) {
    const link = value.match(/^@UUID\[Compendium\.pf2e-team-plus-adventures\.(?:pf2e|sf2e)-items\.Item\.([A-Za-z0-9]+)\]\{([^{}]+)\}$/);
    const row = rows.get(ACTIONS.get(link?.[1]));
    if (!row || expected && ACTIONS.get(link[1]) !== expected || link[2] !== row.source && !(link[2] === 'approaches' && ACTIONS.get(link[1]) === 215)) return null;
    const label = row.after;
    return value.slice(0, value.lastIndexOf('{') + 1) + label + '}';
  }
  function eventKind(value) {
    for (const id of [144, 145, 146, 147, 148, 149, 155]) {
      const row = rows.get(id);
      if (row && (value === row.source || value === row.source.toLowerCase())) return row.after;
    }
    return null;
  }
  function eventResult(value) {
    const result = value.match(/^(Danger|Inclemency|Navigation|Discovery|Peaceful|Abundance)(: [\s\S]*|, but the path lists no such events, so it's peaceful)?$/);
    if (!result) return null;
    return eventKind(result[1]) + (result[2] === rows.get(131)?.source ? text(131) : result[2] ?? '');
  }
  function segments(value) {
    const result = value.match(/^(\d+(?:\.\d+)?) segments?$/);
    return result ? `${result[1]} ${text(Number(result[1]) === 1 ? 409 : 410)}` : null;
  }
  function encounter(value) {
    const note = value.match(/^(danger|inclemency|navigation|discovery|abundance|special): ([\s\S]*)$/);
    // A free-form event note has no delimiter separating it from generated suffixes.
    if (note && !/^<a\b[^>]*class="[^"]*\bcontent-link\b/.test(note[2])) return eventKind(note[1]) + ': ' + note[2];
    let fast = '';
    if (value.endsWith(rows.get(237)?.source)) {
      fast = text(237);
      value = value.slice(0, -rows.get(237).source.length);
    }
    let duration = '';
    if (value.endsWith(rows.get(236)?.source)) {
      duration = text(236);
      value = value.slice(0, -rows.get(236).source.length);
    } else {
      const timed = value.match(/, for (\d+(?:\.\d+)? segments?)$/);
      if (timed) {duration = translateUnit(414, timed[0], {'qc(e)': segments}); value = value.slice(0, -timed[0].length);}
    }
    let result = value === rows.get(233)?.source ? text(233) : null;
    result ??= translateUnit(235, value, {'pl[u].toLowerCase()': eventKind});
    if (result === null) {
      const kind = value.match(/^(danger|inclemency|navigation|discovery|abundance|special)(: [\s\S]*)?$/);
      if (kind) result = eventKind(kind[1]) + (kind[2] ?? '');
    }
    return result === null ? null : result + duration + fast;
  }
  function list(value, translateItem) {
    if (!value.startsWith('<ul>') || !value.endsWith('</ul>')) return null;
    const items = value.slice(4, -5).match(/<li>[\s\S]*?<\/li>/g) ?? [];
    if (items.join('') !== value.slice(4, -5)) return null;
    const translated = items.map(translateItem);
    return translated.includes(null) ? null : `<ul>${translated.join('')}</ul>`;
  }
  function approaches(value) {
    if (value === '') return '';
    return list(value, item => translateUnit(230, item, {'a?`can\'t spend the Endurance, so`:``': value => branch(value, "can't spend the Endurance, so", 231)})
      ?? translateUnit(232, item, {'n.lead?`, leading`:``': value => branch(value, ', leading', 413)}));
  }
  function breath(value) {
    const each = translateUnit(248, value, {'o?` Inclemencies last one segment less.`:``': value => branch(value, ' Inclemencies last one segment less.', 249)});
    if (each !== null) return each;
    const split = value.match(/^([\s\S]*?Endurance\.)( [\s\S]*? fatigued or short of \d+ Endurance)(, so inclemencies last as long as before\.|\.)$/);
    if (!split) return null;
    const spent = split[1] === rows.get(245)?.source ? text(245) : translateUnit(244, split[1], {'i.length===1?`spends`:`spend`': value => ['spends', 'spend'].includes(value) ? '消耗' : null});
    const unable = translateUnit(246, split[2], {'a.length===1?`is`:`are`': value => ['is', 'are'].includes(value) ? '' : null});
    if (spent === null || unable === null) return null;
    return spent + unable + (split[3] === '.' ? '。' : text(247));
  }
  function campEvents(value) {
    const parts = value.match(/<p>[\s\S]*?<\/p>/g) ?? [];
    if (parts.join('') !== value) return null;
    const translated = parts.map(part => {
      const body = part.slice(3, -4);
      const result = translateUnit(252, body)
        ?? translateUnit(253, body, {'t===null?``:`, for ${qc(t)}`': value => value === '' ? '' : /^, for \d+(?:\.\d+)? segments?$/.test(value) ? translateUnit(414, value, {'qc(e)': segments}) : null})
        ?? translateUnit(254, body);
      return result === null ? null : `<p>${result}</p>`;
    });
    return translated.includes(null) ? null : translated.join('');
  }
  function nightRolls(value) {
    return list(`<ul><li>${value}</li></ul>`, item => {
      const inner = item.slice(4, -5);
      const nothing = inner.match(/^(\d+): nothing$/);
      if (nothing) return `<li>${translateUnit(415, inner)}</li>`;
      const absent = translateUnit(251, inner, {'pl[i]': eventKind});
      if (absent !== null) return `<li>${absent}</li>`;
      const event = inner.match(/^(\d+): (Danger|Inclemency)(, [\s\S]*)?$/);
      return event ? `<li>${event[1]}: ${eventKind(event[2])}${event[3] ?? ''}</li>` : null;
    })?.slice(8, -10) ?? null;
  }
  function visiblePath(message) {
    const alias = message.speaker?.alias;
    if (!alias) return null;
    const pages = (game.journal?.contents ?? []).flatMap(journal => journal.pages?.contents ?? []).filter(page => page.type === `${MODULE}.path` && page.visible === true && page.name === alias);
    return pages.length === 1 ? pages[0] : null;
  }
  function journey(message) {
    const content = message.content;
    if (typeof content !== 'string') return null;
    const path = visiblePath(message);
    for (const id of [226, 228]) {
      const values = match(id, content);
      if (values && path && values['e.name'] === path.name) return {content: format(id, values)};
    }
    const knownAction = /@UUID\[Compendium\.pf2e-team-plus-adventures\.(?:pf2e|sf2e)-items\.Item\.([A-Za-z0-9]+)\]/.exec(content);
    if (knownAction && ACTIONS.has(knownAction[1])) {
      const result = translateUnit(238, content, {
        'n?`moves to`:`@UUID[${Al.approach.uuid}]{approaches}`': value => actionLink(value, 215),
        f: encounter,
        's.length?`<ul>${s.join(``)}</ul>`:``': approaches,
      }) ?? translateUnit(243, content, {'Vl(`retreat`)': value => actionLink(value, 219)})
        ?? translateUnit(250, content, {'Vl(`breathe`)': value => actionLink(value, 216), c: breath})
        ?? translateUnit(255, content, {
          'Vl(`camp`)': value => actionLink(value, 217),
          'a?`, and the inclemencies end`:``': value => branch(value, ', and the inclemencies end', 256),
          'l.map(e=>`<p>${e}</p>`).join(``)': campEvents,
        }) ?? translateUnit(259, content, {'Vl(n)': actionLink});
      if (result !== null) return {content: result};
    }
    if (!path) return null;
    const moved = translateUnit(238, content, {
      'n?`moves to`:`@UUID[${Al.approach.uuid}]{approaches}`': value => value === 'moves to' ? text(239) : null,
      f: encounter, 's.length?`<ul>${s.join(``)}</ul>`:``': approaches,
    });
    if (moved !== null) return {content: moved};
    const night = translateUnit(257, content, {'c.join(`</li><li>`)': nightRolls});
    if (night !== null) return {content: night};
    const flavor = translateUnit(133, message.flavor);
    if (flavor !== null) {
      const result = list(content, item => translateUnit(132, item, {l: eventResult}));
      if (result !== null) return {content: result, flavor};
    }
    return null;
  }
  function translate(message) {
    if (!enabled() || message.isContentVisible === false) return null;
    const result = journey(message);
    if (result) diagnostics.messages++;
    return result;
  }
  function notification(id, value) {
    return translateUnit(id, value, {'Al[n].label': value => {
      for (const id of ACTIONS.values()) if (value === rows.get(id)?.source) return text(id);
      return null;
    }, 'e.label': value => {
      for (const id of [11, 12, 13, 14, 15, 16]) if (value === rows.get(id)?.source) return text(id);
      return null;
    }});
  }
  function localized(key, fallback) {
    if (!key) return fallback;
    const value = game.i18n.localize?.(key);
    return value && value !== key ? value : fallback;
  }
  function statText(label, value) {
    const source = value.trim();
    let result = source;
    const casting = source.match(/^(DC \d+, attack [+-]?\d+)(; [\s\S]+)$/);
    if (casting) result = (translateUnit(401, casting[1]) ?? casting[1]) + casting[2];
    else if (label === 'Speed' && /^(?:(?:burrow|climb|fly|swim) )?\d+ feet(?:, (?:(?:burrow|climb|fly|swim) )?\d+ feet)*$/.test(source) && rows.has(404)) {
      result = source.split(', ').map(speed => {
        const [, kind, amount] = speed.match(/^(?:(burrow|climb|fly|swim) )?(\d+) feet$/);
        const name = kind ? localized(`PF2E.Actor.Speed.Type.${kind[0].toUpperCase()}${kind.slice(1)}`, kind) + ' ' : '';
        return format(404, {'e===`land`?``:`${e} `': name, 't?.value': amount});
      }).join(', ');
    } else if (['Melee', 'Ranged'].includes(label)) {
      const attack = source.match(/^([\s\S]+ (?:[+-]\d+|DC \d+)) \(([\s\S]+)\)$/);
      if (attack) result = `${attack[1]} (${attack[2].split(', ').map(trait => {
        if (/^range increment \d+ feet$/.test(trait)) return translateUnit(17, trait) ?? trait;
        if (/^range \d+ feet$/.test(trait)) return translateUnit(399, trait) ?? trait;
        return trait;
      }).join(', ')})`;
    } else if (label === 'Damage') {
      const damage = source.match(/^([\s\S]+?) plus ([\s\S]+)$/);
      if (damage && validateRoll?.(damage[1])) result = translateUnit(400, source) ?? source;
    } else if (label === 'HP') {
      result = source.replace(/^(\d+)( \(BT \d+\))(?=, |$)/, (all, hp, threshold) => hp + (translateUnit(32, threshold) ?? threshold));
    } else if (label === 'Perception') {
      const perception = source.match(/^([+-]\d+|0); ([\s\S]+)$/);
      if (perception) {
        const senses = Object.values(config?.senses ?? {}).map(key => localized(key, key));
        result = perception[1] + '; ' + perception[2].split(', ').map(sense => {
          for (const name of senses) {
            const pattern = new RegExp('^' + escapeRegExp(name) + '(?: \\((imprecise|vague)\\))?(?: (\\d+) feet)?$');
            const match = sense.match(pattern);
            if (!match) continue;
            const acuity = match[1] ? ` (${localized(config?.senseAcuities?.[match[1]], match[1])})` : '';
            const distance = match[2] ? translateUnit(403, ` ${match[2]} feet`) ?? ` ${match[2]} feet` : '';
            return name + acuity + distance;
          }
          return sense;
        }).join(', ');
      }
    }
    if (casting || !['Speed', 'Melee', 'Ranged', 'Damage', 'HP', 'Perception'].includes(label)) {
      const cantrips = localized('PF2E.Actor.Creature.Spellcasting.Cantrips', 'Cantrips');
      const rank = new RegExp('^(' + escapeRegExp(cantrips) + ')( \\(Rank \\d+\\)) ');
      result = result.split('; ').map(group => group.replace(rank, (all, label, rank) => label + (translateUnit(36, rank) ?? rank) + ' ')).join('; ');
    }
    return result === source ? value : value.replace(source, result);
  }
  function installNotifications(notifications, identify) {
    for (const method of ['info', 'warn', 'error']) {
      const original = notifications?.[method];
      if (typeof original !== 'function') continue;
      notifications[method] = function(message, ...args) {
        if (enabled() && typeof message === 'string') {
          const call = identify(method, new Error().stack);
          const translated = call && notification(call.id, message);
          if (translated !== null && translated !== undefined) {message = translated; diagnostics.notifications++;}
        }
        return original.call(this, message, ...args);
      };
    }
  }

  function materializeLinks(html, root, translated = false) {
    return html.replace(/@UUID\[([^\]]+)\](?:\{([^{}]*)\})?/g, (source, uuid, label) => {
      const redirected = game.system.id === 'sf2e' ? uuid.replace(`Compendium.${MODULE}.pf2e-items.`, `Compendium.${MODULE}.sf2e-items.`) : uuid;
      const link = [...root.querySelectorAll('a.content-link[data-uuid]')].find(link => link.dataset.uuid === uuid || link.dataset.uuid === redirected);
      if (!link) return source;
      const clone = link.cloneNode(true);
      if (translated && label) {
        const nodes = [...clone.childNodes].filter(node => node.nodeType === 3);
        if (nodes.length === 1) nodes[0].data = label;
      }
      return clone.outerHTML;
    });
  }
  function hasFragment(root, html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    return root.innerHTML.includes(template.innerHTML);
  }
  function chat(message, html) {
    const root = html?.querySelectorAll ? html : html?.[0];
    if (!root || !enabled() || message.isContentVisible === false) return;
    const result = translate(message);
    if (result) {
      for (const [field, selector] of [['content', '.message-content'], ['flavor', '.flavor-text']]) {
        const target = root.querySelector(selector);
        if (!target || !result[field]) continue;
        const before = materializeLinks(message[field], target), after = materializeLinks(result[field], target, true);
        if (!patchFragment(target, before, after) && !hasFragment(target, after)) diagnostics.unmatched++;
      }
    }
    const flag = message.flags?.[MODULE]?.creaturedex;
    if (!flag?.target || !Array.isArray(flag.sections)) return;
    const flavor = root.querySelector('.flavor-text');
    const title = translateUnit(102, message.flavor);
    if (title && flavor) patchFragment(flavor, message.flavor, title);
    const complete = root.querySelector('.creaturedex-complete');
    if (complete) {
      const source = String(message.content).match(/<p class="creaturedex-complete">[\s\S]*<\/p>$/)?.[0];
      const translated = translateUnit(104, source, {yc: value => /^Compendium\.pf2e-team-plus-adventures\.(?:pf2e|sf2e)-items\.Item\.joQr2Uo0dNBU2mQo$/.test(value) ? value : null});
      if (translated) patchFragment(complete.parentElement, materializeLinks(source, complete), materializeLinks(translated, complete, true));
    }
    const sections = root.querySelectorAll('.creaturedex-statblock > section.creaturedex-section');
    for (const section of sections) {
      if (!flag.sections.some(key => section.classList.contains(key))) continue;
      const heading = section.querySelector(':scope > h4');
      for (const id of [11, 12, 13, 14, 15, 16]) {
        const row = rows.get(id);
        if (row && heading) replaceText(heading, row.source, row.after);
      }
      for (const mark of section.querySelectorAll('.creaturedex-false[data-visibility="gm"]')) {
        const row = rows.get(83);
        if (row) replaceText(mark, row.source, row.after);
      }
      for (const type of section.querySelectorAll(':scope > .creaturedex-name > span')) {
        const value = type.textContent.match(/^(Hazard|Creature) (-?\d+)$/);
        if (value) replaceText(type, type.textContent, `${text(value[1] === 'Hazard' ? 25 : 26)} ${value[2]}`);
      }
      for (const label of section.querySelectorAll(':scope > p:not(.creaturedex-name) > strong')) {
        const sourceLabel = label.textContent.trim();
        const values = [];
        for (let value = label.nextSibling; value && value.nodeName !== 'STRONG'; value = value.nextSibling) {
          if (value.nodeType === 3) {values.push(value.data); value.data = statText(sourceLabel, value.data);}
        }
        if (/^(Str|Dex|Con|Int|Wis|Cha)$/.test(sourceLabel) && /^\s*(?:[+-]\d+|0)(?:, |; )?\s*$/.test(values.join(''))) {
          replaceText(label, sourceLabel, localized(`PF2E.Ability${sourceLabel}`, sourceLabel));
        }
        const fixedLabels = section.classList.contains('characteristics') ? [27, 37, 38, 39, 40]
          : section.classList.contains('defense') ? [22, 23, 24, 30]
          : label.parentElement.querySelector('.action-glyph') ? [18, 19, 20, 21]
          : /^(?:(?:burrow|climb|fly|swim) )?\d+ feet(?:, |$)/.test(values.join('').trim()) ? [41] : [];
        for (const id of fixedLabels) {
          const row = rows.get(id);
          if (row) replaceText(label, row.source, row.after);
        }
      }
    }
  }
  const templateText = (id, value, transforms) => translateUnit(id, value, transforms) ?? value;
  return {chat, translate, notification, statText, templateText, installNotifications, enabled, diagnostics};
}
