function isRecord(value) {
  if (value === null || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isArray(value) {
  return Array.isArray(value) && Object.getPrototypeOf(value) === Array.prototype;
}

function ownValue(object, key) {
  return Object.getOwnPropertyDescriptor(object, key)?.value;
}

function isIndex(value) {
  return Number.isInteger(value) && value >= 0;
}

function isDisplayPath(path) {
  if (!isArray(path) || (path.length !== 2 && path.length !== 4)) return false;
  if (Reflect.ownKeys(path).length !== path.length + 1) return false;
  const parts = Array.from({length: path.length}, (_, index) => ownValue(path, index));
  if (!isIndex(parts[0])) return false;
  if (parts.length === 2 && parts[1] === 'label') return true;
  if (!['text', 'title'].includes(parts.at(-1))) return false;
  return parts.length === 2 || (parts[1] === 'value' && isIndex(parts[2]));
}

function displayText(rules, path) {
  if (path[0] >= rules.length) return undefined;
  const rule = ownValue(rules, path[0]);
  if (!isRecord(rule)) return undefined;
  if (path.length === 2) {
    const expectedKey = path[1] === 'label' ? 'RollOption' : 'Note';
    return ownValue(rule, 'key') === expectedKey ? ownValue(rule, path[1]) : undefined;
  }
  if (ownValue(rule, 'key') !== 'ItemAlteration' || ownValue(rule, 'property') !== 'description') return undefined;
  const value = ownValue(rule, 'value');
  if (!isArray(value) || path[2] >= value.length) return undefined;
  const entry = ownValue(value, path[2]);
  return isRecord(entry) ? ownValue(entry, path[3]) : undefined;
}

/** Babele maps ruleTexts to the complete system.rules array, preserving mechanical fields. */
export function translateRuleTexts(data, translations) {
  if (!isArray(data) || !isArray(translations)) return data;
  const paths = new Set();
  let result = data;
  for (let index = 0; index < translations.length; index++) {
    const row = ownValue(translations, index);
    if (!isRecord(row) || Reflect.ownKeys(row).length !== 3) continue;
    const path = ownValue(row, 'path');
    const source = ownValue(row, 'source');
    const translation = ownValue(row, 'translation');
    if (!isDisplayPath(path) || typeof source !== 'string' || typeof translation !== 'string') continue;
    const pathKey = JSON.stringify(path);
    // Throw before returning any changes; Babele keeps the source and reports the path.
    if (paths.has(pathKey)) throw new TypeError(`team-plus-rule-text: duplicate path ${pathKey}`);
    paths.add(pathKey);
    const original = displayText(data, path);
    if (original !== source || original === translation) continue;
    if (result === data) result = structuredClone(data);
    if (path.length === 2) result[path[0]][path[1]] = translation;
    else result[path[0]].value[path[2]][path[3]] = translation;
  }
  return result;
}
