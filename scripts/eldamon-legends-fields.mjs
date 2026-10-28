const MODULE_ID = 'battlezoo-eldamon-legends-pf2e';
const RULE_PACKS = new Set(['effects', 'eldamon', 'equipment', 'features', 'powers']
  .map(name => `${MODULE_ID}.pf2e-${name}`));

function matchesSource(context, path, packs) {
  const pack = context.contextCompendium?.metadata?.id;
  const payload = context.translation;
  const source = context.source;
  if (context.path !== path || !packs.has(pack) || !source
    || typeof payload?.sourceId !== 'string' || !Array.isArray(payload.entries)
    || !Array.isArray(context.value)) return false;
  const prefix = `Compendium.${pack}.Item.`;
  if (!payload.sourceId.startsWith(prefix) || !payload.sourceId.slice(prefix.length)) return false;
  return payload.sourceId === `${prefix}${source._id}`
    || payload.sourceId === (source._stats?.compendiumSource ?? source.flags?.core?.sourceId);
}

function isIndex(value) {
  return Number.isInteger(value) && value >= 0;
}

function pathValue(value, path) {
  for (const part of path) {
    if (value === null || typeof value !== 'object' || !Object.hasOwn(value, part)) return undefined;
    value = value[part];
  }
  return value;
}

function isRuleText(rules, {path, ruleKey}) {
  if (!Array.isArray(path) || !isIndex(path[0])) return false;
  const rule = rules[path[0]];
  if (!rule || rule.key !== ruleKey) return false;
  if (ruleKey === 'RollOption') {
    return path.length === 4 && path[1] === 'suboptions' && isIndex(path[2])
      && path[3] === 'label' && Array.isArray(rule.suboptions);
  }
  if (ruleKey === 'ItemAlteration') {
    return rule.property === 'description' && path.length === 4 && path[1] === 'value'
      && isIndex(path[2]) && path[3] === 'text' && Array.isArray(rule.value);
  }
  return false;
}

function projectTexts(value, entries, allowed) {
  const paths = new Set();
  let result;
  for (const row of entries) {
    if (!row || typeof row.source !== 'string' || typeof row.translation !== 'string'
      || !row.translation.length || !allowed(value, row)) continue;
    const pathKey = JSON.stringify(row.path);
    // Babele catches a rejected payload and retains the source field.
    if (paths.has(pathKey)) throw new TypeError(`eldamon-legends-fields: duplicate path ${pathKey}`);
    paths.add(pathKey);
    if (pathValue(value, row.path) !== row.source || row.source === row.translation) continue;
    result ??= structuredClone(value);
    const parent = pathValue(result, row.path.slice(0, -1));
    parent[row.path.at(-1)] = row.translation;
  }
  return result;
}

/** Explicit pack mappings project reviewed strings onto the current source array. */
export function createEldamonRuleTextConverter() {
  return {
    translate(context) {
      if (!matchesSource(context, 'system.rules', RULE_PACKS)) return undefined;
      return projectTexts(context.value, context.translation.entries, isRuleText);
    },
  };
}

const BADGE_PACKS = new Set([`${MODULE_ID}.pf2e-effects`]);

export function createEldamonBadgeLabelsConverter() {
  return {
    translate(context) {
      if (!matchesSource(context, 'system.badge.labels', BADGE_PACKS)
        || context.source.type !== 'effect' || context.source.system?.badge?.type !== 'counter') return undefined;
      return projectTexts(context.value, context.translation.entries, (_value, row) =>
        Array.isArray(row.path) && row.path.length === 1 && isIndex(row.path[0]) && !/^\d+$/.test(row.source));
    },
  };
}
