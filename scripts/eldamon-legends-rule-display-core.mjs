const SOURCE_PREFIX = 'Compendium.battlezoo-eldamon-legends-pf2e.';

function sameValue(left, right) {
  if (left === right) return true;
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object'
    || Array.isArray(left) !== Array.isArray(right)) return false;
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length
    && keys.every(key => Object.hasOwn(right, key) && sameValue(left[key], right[key]));
}

export function installEldamonRuleDisplay({ItemClass, classes, bindings, isEnabled}) {
  const prototype = ItemClass?.prototype;
  const own = prototype && Object.getOwnPropertyDescriptor(prototype, 'prepareRuleElements');
  const prepareRules = prototype?.prepareRuleElements;
  if (typeof prepareRules !== 'function' || own?.configurable === false) {
    throw new TypeError('Eldamon display consumer unavailable: Item.prepareRuleElements');
  }
  const nativeMethods = new Map(['FlatModifier', 'Strike'].map(kind => {
    const native = classes[kind]?.prototype?.beforePrepareData;
    if (typeof native !== 'function') {
      throw new TypeError(`Eldamon display consumer unavailable: ${kind}.beforePrepareData`);
    }
    return [kind, native];
  }));
  const rows = new Map();
  for (const row of bindings) {
    if (!row.sourceId.startsWith(SOURCE_PREFIX) || !['FlatModifier', 'Strike'].includes(row.rule.key)) continue;
    try {
      const normalized = classes[row.rule.key].cleanData(structuredClone(row.rule));
      if (!normalized || typeof normalized !== 'object' || Array.isArray(normalized)
        || normalized.key !== row.rule.key || normalized.label !== row.rule.label) {
        throw new TypeError('Unexpected normalized rule');
      }
      const serialized = JSON.parse(JSON.stringify(normalized));
      rows.set(`${row.sourceId}/${row.ruleIndex}`, {binding: row, normalized, serialized});
    } catch (error) {
      console.warn('Eldamon rule display: source normalization failed', {
        sourceId: row.sourceId, ruleIndex: row.ruleIndex, error,
      });
    }
  }
  let active = true;
  const projected = new WeakMap();
  const wrappedRules = new WeakSet();

  function resolve(rule) {
    if (!active || !isEnabled() || !rule || rule.replaceAll || rule.replaceBasicUnarmed || rule.battleForm) return null;
    const item = rule.item;
    const actor = item?.actor;
    if (!actor || item.parent !== actor || rule.parent !== item || rule.actor !== actor
      || actor.items?.get(item.id) !== item || !item.rules?.includes(rule)
      || rule.constructor !== classes[rule.key]) return null;
    const source = item._source;
    const sourceId = source?._stats?.compendiumSource ?? source?.flags?.core?.sourceId
      ?? (item.pack ? item.uuid : null);
    const match = rows.get(`${sourceId}/${rule.sourceIndex}`);
    const row = match?.binding;
    if (!row || item.type !== row.itemType || (source.system?.slug ?? null) !== row.itemSlug
      || (item.system?.slug ?? null) !== row.itemSlug || rule.key !== row.rule.key
      || rule.label !== row.rule.label) return null;
    const current = source.system?.rules?.[row.ruleIndex];
    if (!sameValue(current, row.rule) && !sameValue(current, match.normalized)
      && !sameValue(current, match.serialized)) return null;
    return row;
  }

  function display(object, key, original, rule, row, unchanged) {
    if (!object || object[key] !== original || resolve(rule) !== row || projected.has(object)) return false;
    const own = Object.getOwnPropertyDescriptor(object, key);
    if (own && (!own.configurable || !Object.hasOwn(own, 'value'))) return false;
    const state = {native: original, suppressed: 0};
    projected.set(object, state);
    Object.defineProperty(object, key, {
      configurable: true,
      enumerable: own?.enumerable ?? true,
      get() {
        return !state.suppressed && state.native === original && resolve(rule) === row && unchanged()
          ? row.translation : state.native;
      },
      set(value) {state.native = value;},
    });
    return true;
  }

  function modifier(object, rule, row) {
    const original = rule.getReducedLabel();
    const slug = object?.slug;
    if (object?.rule !== rule || typeof slug !== 'string' || !slug
      || !display(object, 'label', original, rule, row, () => object.slug === slug)) return;
    const native = object.clone;
    if (typeof native !== 'function' || Object.getOwnPropertyDescriptor(object, 'clone')?.configurable === false) return;
    // PF2e clones modifiers by reading their label. Preserve that constructor input.
    Object.defineProperty(object, 'clone', {
      configurable: true, writable: true,
      value: function(...args) {
        const state = projected.get(this);
        if (state) state.suppressed++;
        let result;
        try {result = Reflect.apply(native, this, args);}
        finally {if (state) state.suppressed--;}
        if (result && typeof result.then !== 'function') modifier(result, rule, row);
        return result;
      },
    });
  }

  function strike(object, rule, row) {
    const original = row.rule.label;
    const slug = object?.system?.slug;
    if (object?.rule !== rule || object._source?.name !== original || typeof slug !== 'string' || !slug
      || object._source.system?.slug !== slug) return;
    display(object, 'name', original, rule, row, () => object._source.name === original
      && object.system.slug === slug && object._source.system.slug === slug);
  }

  function wrapRule(instance) {
    const row = resolve(instance);
    const native = nativeMethods.get(instance.key);
    if (!row || wrappedRules.has(instance) || instance.beforePrepareData !== native
      || Object.getOwnPropertyDescriptor(instance, 'beforePrepareData')?.configurable === false) return;
    const wrapper = function(...args) {
      if (resolve(this) !== row) return Reflect.apply(native, this, args);
      const synthetics = this.actor.synthetics;
      const before = row.rule.key === 'FlatModifier'
        ? new Set(Object.values(synthetics.modifiers).flat())
        : new Map(Object.entries(synthetics.strikes));
      const result = Reflect.apply(native, this, args);
      const rule = this;
      if (row.rule.key === 'FlatModifier') {
        for (const list of Object.values(synthetics.modifiers)) {
          for (let index = 0; index < list.length; index++) {
            const factory = list[index];
            if (before.has(factory)) continue;
            list[index] = function(...factoryArgs) {
              const value = Reflect.apply(factory, this, factoryArgs);
              modifier(value, rule, row);
              return value;
            };
          }
        }
      } else {
        for (const [key, factory] of Object.entries(synthetics.strikes)) {
          if (before.get(key) === factory) continue;
          synthetics.strikes[key] = function(...factoryArgs) {
            const value = Reflect.apply(factory, this, factoryArgs);
            strike(value, rule, row);
            return value;
          };
        }
      }
      return result;
    };
    Object.defineProperty(instance, 'beforePrepareData', {
      configurable: true, writable: true, value: wrapper,
    });
    wrappedRules.add(instance);
  }

  // Native receiver qualification relies on unchanged RuleElement prototype methods.
  const wrapper = function(...args) {
    const rules = Reflect.apply(prepareRules, this, args);
    if (active && rules === this.rules && Array.isArray(rules)) rules.forEach(wrapRule);
    return rules;
  };
  Object.defineProperty(prototype, 'prepareRuleElements', {
    configurable: true, writable: true, enumerable: own?.enumerable ?? false, value: wrapper,
  });

  return {
    get active() {return active;},
    dispose() {
      active = false;
      if (prototype.prepareRuleElements !== wrapper) return;
      if (own) Object.defineProperty(prototype, 'prepareRuleElements', own);
      else delete prototype.prepareRuleElements;
    },
  };
}
