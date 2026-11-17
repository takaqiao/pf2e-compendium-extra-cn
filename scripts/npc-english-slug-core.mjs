import {hasLibWrapperApi, managedMethod, subscribeManagedMethod} from './bob-native-lane.mjs';

// Han, kana, Hangul and full-width punctuation. The English half of a bilingual
// 「中文 English」 name follows the last of these characters.
const CJK = String.raw`\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\u3000-\u303F\uFF00-\uFFEF`;
const ENGLISH_TAIL = new RegExp(`^.*[${CJK}]([^${CJK}]*)$`, 'su');
// Foundry's Localization string ID pattern.
const I18N_KEY = /^[\x21-\x2D\x2F-\x7E]+(?:\.[\x21-\x2D\x2F-\x7E]+)+$/;

/**
 * Slug an English client would derive for this Item's name: Babele's recorded
 * original name, else the English half of a bilingual name. Null when neither exists.
 */
export function englishNameSlug(item, sluggify) {
  const original = item?.flags?.babele?.originalName;
  if (typeof original === 'string' && original.trim()) return sluggify(original.trim());
  const english = typeof item?.name === 'string' ? ENGLISH_TAIL.exec(item.name)?.[1].trim() : null;
  return english && /[A-Za-z]/.test(english) ? sluggify(english) : null;
}

const viewOf = (target, overrides) => new Proxy(Object.create(Object.getPrototypeOf(target)), {
  get(_facade, key) { return Object.hasOwn(overrides, key) ? overrides[key] : Reflect.get(target, key, target); },
  has(_facade, key) { return key in target; }
});

function ownMethod(prototype, key) {
  const descriptor = prototype && Object.getOwnPropertyDescriptor(prototype, key);
  if (typeof descriptor?.value !== 'function' || descriptor.configurable !== true) {
    throw new Error(`PF2e compatible own method is unavailable: ${key}`);
  }
  return descriptor;
}

// Plans a wrapper for an own method or, when another package has wrapped it
// with libWrapper, for that chain. Nothing is changed until installPlans().
function planMethod(prototype, key, libWrapper) {
  if (managedMethod(prototype, key)) {
    if (!hasLibWrapperApi(libWrapper)) throw new Error(`libWrapper is unavailable for the managed ${key}.`);
    return {prototype, key, lane: true};
  }
  return {prototype, key, descriptor: ownMethod(prototype, key)};
}

function installPlans(plans, body, libWrapper) {
  const restores = [];
  const dispose = () => { for (const restore of restores.splice(0).reverse()) restore(); };
  try {
    for (const plan of plans) {
      if (plan.lane) { restores.push(subscribeManagedMethod(plan.prototype, plan.key, body, {libWrapper})); continue; }
      const native = plan.descriptor.value;
      const value = function (...args) { return Reflect.apply(body, this, [(...next) => Reflect.apply(native, this, next), ...args]); };
      Object.defineProperty(plan.prototype, plan.key, {...plan.descriptor, value});
      restores.push(() => {
        if (Object.getOwnPropertyDescriptor(plan.prototype, plan.key)?.value === value) Object.defineProperty(plan.prototype, plan.key, plan.descriptor);
      });
    }
  } catch (error) { dispose(); throw error; }
  return dispose;
}

/**
 * NPC attack effects name abilities by English slug (`碎桨者 Oar Breaker` for
 * `oar-breaker`). A world Item with no slug of its own is found under its
 * English name only after the native lookup found nothing; it keeps its slug,
 * name and description. `hasApprovedIdentity` excludes Items another adapter
 * (BoB) already maps to an original name. Returns a dispose function.
 */
export function installAttackEffectLookup({NPCClass, HazardClass, attackEffectLabels = {}, sluggify, isEnabled,
  hasApprovedIdentity = () => false, libWrapper = globalThis.libWrapper}) {
  if (typeof sluggify !== 'function' || typeof isEnabled !== 'function' || typeof hasApprovedIdentity !== 'function') {
    throw new Error('PF2e sluggify or the language gate is unavailable.');
  }
  // getAttackEffects receives a substituted receiver, which a libWrapper chain cannot pass on.
  const attack = ownMethod(NPCClass?.prototype, 'getAttackEffects');
  const preparations = [NPCClass, HazardClass].filter(Boolean).map(ActorClass => planMethod(ActorClass.prototype, 'prepareDerivedData', libWrapper));
  const englishSlug = item => item.slug == null && !hasApprovedIdentity(item) ? englishNameSlug(item, sluggify) : null;

  let active = true;
  const lookup = function (...args) {
    if (!active || !isEnabled()) return Reflect.apply(attack.value, this, args);
    const lookupItems = new Proxy(this.items, {get(target, key) {
      if (key !== 'find') return Reflect.get(target, key, target);
      return (predicate, thisArg) => target.find(predicate, thisArg) ?? target.find((item, ...rest) => {
        const slug = englishSlug(item);
        return slug !== null && Reflect.apply(predicate, thisArg, [viewOf(item, {slug}), ...rest]);
      });
    }});
    // find returns the original Item, so note titles and descriptions stay Chinese.
    return Reflect.apply(attack.value, viewOf(this, {items: lookupItems}), args);
  };
  // Native strike labels (pf2e.mjs 8.7.1 20382, 20531) fall back to the raw tag.
  const relabel = function (next, ...args) {
    const result = next(...args);
    if (!active || !isEnabled()) return result;
    for (const action of this.system?.actions ?? []) {
      for (const effect of action.additionalEffects ?? []) {
        if (attackEffectLabels[effect.tag] != null || effect.label !== effect.tag) continue;
        const item = this.items.find(item => englishSlug(item) === effect.tag);
        if (item) effect.label = item.name;
      }
    }
    return result;
  };
  const disposePreparations = installPlans(preparations, relabel, libWrapper);
  try { Object.defineProperty(NPCClass.prototype, 'getAttackEffects', {...attack, value: lookup}); }
  catch (error) { disposePreparations(); throw error; }
  return () => {
    active = false;
    if (Object.getOwnPropertyDescriptor(NPCClass.prototype, 'getAttackEffects')?.value === lookup) {
      Object.defineProperty(NPCClass.prototype, 'getAttackEffects', attack);
    }
    disposePreparations();
  };
}

/**
 * A Strike rule without a slug takes `sluggify(label)` after the label is
 * localized, so a Chinese client keys an NPC's Jaws strike `噬咬` and its
 * `jaws-damage` notes never attach. For NPC rules whose label is an i18n key
 * with plain English fallback text, use the English slug instead. Character
 * rules keep theirs: hotbar strike macros store the slug. Returns a dispose function.
 */
export function installStrikeRuleSlug({StrikeClass, sluggify, isEnabled, englishText, libWrapper = globalThis.libWrapper}) {
  if (![sluggify, isEnabled, englishText].every(fn => typeof fn === 'function')) {
    throw new Error('PF2e sluggify, the language gate or English fallback text is unavailable.');
  }
  const plan = planMethod(StrikeClass?.prototype, 'beforePrepareData', libWrapper);
  let active = true;
  const englishSlug = rule => {
    const source = rule._source;
    if (rule.actor?.type !== 'npc' || source?.slug != null || typeof source?.label !== 'string' || !I18N_KEY.test(source.label)) return null;
    // Only the constructor's localized-label fallback, not a slug PF2e set itself (fist).
    if (typeof rule.label !== 'string' || rule.slug !== sluggify(rule.label)) return null;
    const english = englishText(source.label);
    return typeof english === 'string' && english.trim() && !english.includes('{') ? sluggify(english) : null;
  };
  const dispose = installPlans([plan], function (next, ...args) {
    const slug = active && isEnabled() ? englishSlug(this) : null;
    // The rule instance only; its source and the Item stay untouched.
    if (slug) this.slug = slug;
    return next(...args);
  }, libWrapper);
  return () => { active = false; dispose(); };
}
