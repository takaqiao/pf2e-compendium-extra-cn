/**
 * Startup-only journal style labels for the six source versions reviewed below.
 * Loaded as an extra ESM before i18nInit. No fetch, sheet wrapper or registry edit.
 * Foundry 14.367 localizes pending sheet labels after synchronous i18nInit listeners.
 */
const JOURNAL_LABELS = [
  ['battlezoo-dragons-battle-dragons-pf2e', '1.3',
    'battlezoo-dragons-battle-dragons-pf2e Journal', '战斗动物园：战斗龙日志'],
  ['battlezoo-dragons-core-pf2e', '1.2',
    'battlezoo-dragons-core-pf2e Journal', '战斗动物园：龙族核心日志'],
  ['battlezoo-dragons-fairy-dragons-pf2e', '2.3',
    'battlezoo-dragons-fairy-dragons-pf2e Journal', '战斗动物园：妖精龙日志'],
  ['battlezoo-dragons-leshy-dragons-pf2e', '2.3',
    'battlezoo-dragons-leshy-dragons-pf2e Journal', '战斗动物园：莱西龙日志'],
  ['battlezoo-ancestries-year-of-mysteries-pf2e', '9.0',
    'Year of Mysteries Journal', '战斗动物园：谜团之年日志'],
  ['battlezoo-immortals', '1.1',
    'battlezoo-immortals Journal', '战斗动物园：永生者日志']
];

// Ownership belongs to an exact dictionary/property descriptor, not just a key.
let owned = [];

function withdrawOwned() {
  for (const {dictionary, key, before, written} of owned) {
    const current = Object.getOwnPropertyDescriptor(dictionary, key);
    if (!current || !('value' in current)
      || current.value !== written.value
      || current.writable !== written.writable
      || current.configurable !== written.configurable
      || current.enumerable !== written.enumerable) continue;
    if (before) Object.defineProperty(dictionary, key, before);
    else Reflect.deleteProperty(dictionary, key);
  }
  owned = [];
}

function allowed(game) {
  return game?.system?.id === 'pf2e'
    && game.release?.generation === 14 && game.release?.build === 367
    && game.modules?.get('pf2e-compendium-extra-cn')?.active === true
    && game.i18n?.lang === 'cn'
    && game.settings.get('babele', 'loadingMode') === 'full';
}

// Inspect descriptors only: even a third-party getter must remain uninvoked.
function fallbackIsUntranslated(dictionary, key) {
  if (dictionary == null) return true;
  if (typeof dictionary !== 'object' || Array.isArray(dictionary)) return false;
  for (let object = dictionary; object; object = Object.getPrototypeOf(object)) {
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    if (descriptor) return 'value' in descriptor && descriptor.value === key;
  }
  return true;
}

function translateJournalLabels() {
  withdrawOwned();
  const game = globalThis.game;
  // Settings do not exist at ESM evaluation/init in every load order. Read here only.
  try {
    if (!allowed(game)) return;
  } catch {
    return;
  }
  const dictionary = game.i18n.translations;
  if (!dictionary || typeof dictionary !== 'object' || Array.isArray(dictionary)) return;
  for (const [moduleId, version, key, value] of JOURNAL_LABELS) {
    const module = game.modules.get(moduleId);
    if (module?.active !== true || module.version !== version) continue;
    const before = Object.getOwnPropertyDescriptor(dictionary, key);
    if (before) {
      if (!('value' in before) || before.value !== key
        || !before.configurable || !before.writable) continue;
    } else if ((key in dictionary) || !Object.isExtensible(dictionary)) continue;
    if (!fallbackIsUntranslated(game.i18n._fallback, key)) continue;
    const written = before ? {...before, value} : {
      value, configurable: true, writable: true, enumerable: true
    };
    Object.defineProperty(dictionary, key, written);
    owned.push({dictionary, key, before, written});
  }
}

// Not once: a new localization dictionary can replace the old object. Cleanup is
// bounded to values we still own. Existing registered sheet labels are never patched.
Hooks.on('i18nInit', translateJournalLabels);
