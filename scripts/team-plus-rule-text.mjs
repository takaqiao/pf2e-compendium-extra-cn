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

const INDEX = Symbol('index');
const STRIKE = Symbol('strike');
const rulePaths = [['label'], ['text'], ['title'], ['value', INDEX, 'text'], ['value', INDEX, 'title']];
const statblockPaths = [
  ['name'], ['strikes', STRIKE, 'label'],
  ...rulePaths.map(path => ['rules', INDEX, ...path]),
];
const displayPaths = [
  ...rulePaths,
  ['option', 'label'], ['option', 'hint'],
  ['choices', INDEX, 'label'], ['choices', INDEX, 'hint'],
  ['choices', INDEX, 'options', INDEX, 'label'], ['choices', INDEX, 'options', INDEX, 'hint'],
  ...statblockPaths.map(path => ['base', ...path]),
  ...statblockPaths.map(path => ['patches', INDEX, ...path]),
];

function matchesPath(path, pattern) {
  return path.length === pattern.length && pattern.every((part, index) => {
    if (part === INDEX) return isIndex(path[index]);
    if (part === STRIKE) return typeof path[index] === 'string' && path[index].length > 0
      && !['__proto__', 'prototype', 'constructor'].includes(path[index]);
    return path[index] === part;
  });
}

function isDisplayPath(path) {
  if (!isArray(path) || path.length < 2 || path.length > 8) return false;
  if (Reflect.ownKeys(path).length !== path.length + 1) return false;
  const parts = Array.from({length: path.length}, (_, index) => ownValue(path, index));
  if (!isIndex(parts[0])) return false;
  return displayPaths.some(pattern => matchesPath(parts.slice(1), pattern));
}

function pathValue(object, path) {
  let value = object;
  for (const part of path) {
    if (typeof part === 'number') {
      if (!isArray(value) || part >= value.length) return undefined;
    } else if (!isRecord(value)) return undefined;
    value = ownValue(value, part);
  }
  return value;
}

function ruleText(rule, path, nested = false) {
  if (!isRecord(rule)) return undefined;
  const key = ownValue(rule, 'key');
  if (path.length === 1) {
    const expectedKey = path[0] === 'label' ? (nested ? 'FlatModifier' : 'RollOption') : 'Note';
    return key === expectedKey ? ownValue(rule, path[0]) : undefined;
  }
  if (path.length === 3 && path[0] === 'value' && key === 'ItemAlteration'
    && ownValue(rule, 'property') === 'description') return pathValue(rule, path);
  return undefined;
}

function statblockText(block, path) {
  if (!isRecord(block)) return undefined;
  if (path[0] === 'rules') return ruleText(pathValue(block, path.slice(0, 2)), path.slice(2), true);
  return pathValue(block, path);
}

function displayText(rules, path) {
  const rule = pathValue(rules, [path[0]]);
  if (!isRecord(rule)) return undefined;
  const key = ownValue(rule, 'key');
  const field = path[1];
  if (key === 'AspectForm') {
    if (field === 'label' || field === 'choices') return pathValue(rule, path.slice(1));
    if (field === 'base') return statblockText(ownValue(rule, 'base'), path.slice(2));
    if (field === 'patches') return statblockText(pathValue(rule, path.slice(1, 3)), path.slice(3));
    return undefined;
  }
  if (key === 'AdjustAspect') {
    return field === 'label' || field === 'option' ? pathValue(rule, path.slice(1)) : undefined;
  }
  return ruleText(rule, path.slice(1));
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
    const parent = pathValue(result, path.slice(0, -1));
    parent[path.at(-1)] = translation;
  }
  return result;
}
