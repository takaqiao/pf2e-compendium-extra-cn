const MODULE = 'pf2e-team-plus-adventures';
const paths = {
  approach: ['description', 'company', 'lead'],
  event: ['description', 'special', 'gm', 'inclemency.movement', 'inclemency.sensory', 'inclemency.survey',
    'navigation.skills', 'navigation.disorientation.name', 'discovery.knowledge', 'discovery.keyActionDCs',
    'discovery.keyActions', 'discovery.repercussions', 'discovery.revelation', 'abundance.buffs', 'abundance.loot'],
  path: ['description', 'gm', 'biome'],
};
const own = (value, key) => Object.getOwnPropertyDescriptor(value ?? {}, key)?.value;
const at = (value, path) => path.reduce((value, key) => own(value, key), value);
const index = value => Number.isInteger(value) && value >= 0;

function replaceAt(value, [key, ...rest], translation) {
  const copy = Array.isArray(value) ? value.slice() : {...value};
  copy[key] = rest.length ? replaceAt(own(value, key), rest, translation) : translation;
  return copy;
}

function allowed(page, row) {
  const type = page.type?.startsWith(`${MODULE}.`) ? page.type.slice(MODULE.length + 1) : '';
  const path = row.path;
  if (!paths[type] || !Array.isArray(path) || path.some(p => typeof p !== 'string' && !index(p))) return false;
  if (paths[type].includes(path.join('.'))) return true;
  if (type === 'event') return path.length === 4 && path[0] === 'navigation'
    && path[1] === 'disorientation' && path[2] === 'stages' && index(path[3]);
  if (type !== 'path' || path.length !== 3 || !index(path[1])) return false;
  const keys = path[0] === 'survey' && path[2] === 'note' ? ['skill', 'dc']
    : path[0] === 'events' && path[2] === 'note' ? ['uuid', 'kind']
      : path[0] === 'segments' && ['label', 'note'].includes(path[2]) ? ['id'] : null;
  const entry = at(page.system, path.slice(0, 2));
  return !!keys && !!row.identity && keys.every(key => Object.hasOwn(row.identity, key)
    && own(entry, key) === row.identity[key]);
}

/** Babele maps this field to pages; page ids survive ordering changes. */
export function translateAdventuresPageText(data, translations) {
  if (!Array.isArray(data) || !translations || typeof translations !== 'object') return data;
  let result = data;
  for (const [pageIndex, page] of data.entries()) {
    const rows = own(translations, page._id);
    if (!Array.isArray(rows)) continue;
    const seen = new Set();
    for (const row of rows) {
      if (!row || typeof row.source !== 'string' || typeof row.translation !== 'string' || !allowed(page, row)) continue;
      const key = JSON.stringify(row.path);
      if (seen.has(key)) throw new TypeError(`adventures-page-text: duplicate path ${page._id} ${key}`);
      seen.add(key);
      if (at(page.system, row.path) !== row.source || row.source === row.translation) continue;
      result = replaceAt(result, [pageIndex, 'system', ...row.path], row.translation);
    }
  }
  return result;
}

/** Used inside Babele's page mapping so names and text keep their normal converters. */
export function adventuresPageTextPatch(system, translations, page) {
  if (!page?._id || !Array.isArray(translations)) return undefined;
  const result = translateAdventuresPageText([{...page, system}], {[page._id]: translations})[0].system;
  if (result === system) return undefined;
  return Object.fromEntries(Object.entries(result).filter(([key, value]) => value !== system[key]));
}
