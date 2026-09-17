/** Only BoB mappings opt into this converter; native identity and merge rules remain intact. */
export const BOB_STRUCTURED = 'bob-structured-context';

const stable = value => Array.isArray(value) ? value.map(stable)
  : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])])) : value;

export function createBobStructuredConverter(NativeStructured, Runtime, canTranslate = () => true) {
  return new class extends NativeStructured {
    translate(context) {
      if (!canTranslate()) return context.value;
      const params = context.params ?? {};
      const hasLabel = Object.hasOwn(params, 'bobLabelSources') || Object.hasOwn(params, 'bobLabelSourcesById');
      const hasValue = Object.hasOwn(params, 'bobValueSources') || Object.hasOwn(params, 'bobValueSourcesById');
      if (!hasLabel && !hasValue) return super.translate(context);
      if (hasLabel && hasValue) return context.value;
      // Non-ID arrays require a unique original display value and an exact
      // source object. Never use the native positional
      // fallback or translate a label whose associated predicate/value changed.
      const key = hasLabel ? 'label' : 'value';
      const sourceKey = hasLabel ? 'bobLabelSources' : 'bobValueSources';
      const scoped = params[sourceKey + 'ById'];
      const sources = Object.hasOwn(params, sourceKey + 'ById')
        ? scoped && typeof scoped === 'object' && !Array.isArray(scoped)
          && Object.hasOwn(scoped, context.source?._id) ? scoped[context.source._id] : null
        : params[sourceKey];
      const path = context.path ?? params.path ?? '';
      const validPath = hasLabel ? /^system\.skills\.[a-z]+\.special$/.test(path) : path === 'system.prerequisites.value';
      if (params.key !== key || params.cardinality !== 'many' || params.container !== 'array'
        || !validPath
        || JSON.stringify(params.mapping) !== JSON.stringify({[key]: key})
        || !sources || typeof sources !== 'object' || Array.isArray(sources)
        || !Array.isArray(context.value) || !context.translation || Array.isArray(context.translation)) return context.value;
      const translation = Object.create(null);
      for (const [label, expected] of Object.entries(sources)) {
        const matches = context.value.filter(entry => entry?.[key] === label);
        if (matches.length === 1 && JSON.stringify(stable(matches[0])) === JSON.stringify(stable(expected))
          && Object.hasOwn(context.translation, label)) translation[label] = context.translation[label];
      }
      return super.translate({...context, translation});
    }

    _fieldRuntime(runtime = {}, sourceKey = null) {
      // Babele 2.9.1 unwraps only one {runtime, sourceKey} layer. Normalize
      // before adding the next layer so deeply nested mappings keep their
      // converter registry, without invoking any document/source lookup.
      return super._fieldRuntime(Runtime.from(runtime), sourceKey);
    }
  }();
}
