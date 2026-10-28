const own = (value, key) => Object.getOwnPropertyDescriptor(value ?? {}, key)?.value;
const at = (value, path) => path.reduce((value, key) => own(value, key), value);
const index = value => Number.isInteger(value) && value >= 0;
const labelKeys = new Set(['FlatModifier', 'RollOption', 'SpecialResource', 'Strike', 'CraftingAbility', 'MartialProficiency']);
const fields = new Set(['requirements', 'selfEffect.name', 'identification.unidentified.name',
  'range.value', 'target.value', 'time.value', 'duration.value']);

function allowed(system, path) {
  if (!Array.isArray(path) || !path.length || path.some(p => typeof p !== 'string' && !index(p))) return false;
  if (fields.has(path.join('.'))) return true;
  if (path.length === 3 && path[0] === 'items' && typeof path[1] === 'string'
    && !['__proto__', 'constructor', 'prototype'].includes(path[1]) && path[2] === 'name') return true;
  if (path.length === 3 && path[0] === 'badge' && path[1] === 'labels' && index(path[2])) return true;
  if (path[0] !== 'rules' || !index(path[1])) return false;
  const rule = at(system, path.slice(0, 2));
  if (!rule) return false;
  if (path.length === 3) {
    if (path[2] === 'label') return labelKeys.has(rule.key);
    if (path[2] === 'prompt') return rule.key === 'ChoiceSet';
    if (path[2] === 'relabel') return rule.key === 'AdjustModifier';
    return ['title', 'text'].includes(path[2]) && rule.key === 'Note';
  }
  if (path.length !== 5 || !index(path[3])) return false;
  if (path[2] === 'choices' && path[4] === 'label') return rule.key === 'ChoiceSet';
  if (path[2] === 'suboptions' && path[4] === 'label') return rule.key === 'RollOption';
  return path[2] === 'value' && ['text', 'title'].includes(path[4])
    && rule.key === 'ItemAlteration' && rule.property === 'description';
}

function replaceAt(value, [key, ...rest], translation) {
  const copy = Array.isArray(value) ? value.slice() : {...value};
  copy[key] = rest.length ? replaceAt(own(value, key), rest, translation) : translation;
  return copy;
}

/** Copy only translated branches; all other system data retains its original identity. */
export function translateAdventuresItemText(system, translations) {
  if (!system || typeof system !== 'object' || !Array.isArray(translations)) return system;
  let result = system;
  const seen = new Set();
  for (const row of translations) {
    if (!row || typeof row.source !== 'string' || typeof row.translation !== 'string' || !allowed(system, row.path)) continue;
    const key = JSON.stringify(row.path);
    if (seen.has(key)) throw new TypeError(`adventures-item-text: duplicate path ${key}`);
    seen.add(key);
    if (at(system, row.path) !== row.source || row.source === row.translation) continue;
    result = replaceAt(result, row.path, row.translation);
  }
  return result;
}

/** A second mapping of system must not overwrite the normal description mapping. */
export function adventuresItemTextPatch(system, translations) {
  const result = translateAdventuresItemText(system, translations);
  if (result === system) return undefined;
  return Object.fromEntries(Object.entries(result).filter(([key, value]) => value !== system[key]));
}
