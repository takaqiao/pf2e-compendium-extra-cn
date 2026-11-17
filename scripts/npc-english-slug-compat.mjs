import {installAttackEffectLookup, installStrikeRuleSlug} from './npc-english-slug-core.mjs';
import {isBobApprovedItem} from './bob-runtime-state.mjs';

const EXTRA_ID = 'pf2e-compendium-extra-cn';
const CHINESE_LANGS = ['cn', 'zh-CN', 'zh-Hans'];

// World documents prepare after i18nInit, and only then is the client language
// and its English fallback known. Each adapter checks its native entries first
// and stays out entirely when they do not match.
Hooks.once('i18nInit', () => {
  const isEnabled = () => game.system?.id === 'pf2e' && CHINESE_LANGS.includes(game.i18n?.lang);
  if (!isEnabled()) return;
  const sluggify = game.pf2e?.system?.sluggify;
  const actors = CONFIG.PF2E?.Actor?.documentClasses ?? {};
  try {
    installAttackEffectLookup({NPCClass: actors.npc, HazardClass: actors.hazard, attackEffectLabels: CONFIG.PF2E?.attackEffects,
      sluggify, isEnabled, hasApprovedIdentity: isBobApprovedItem});
  } catch (error) {
    console.warn(`${EXTRA_ID} | NPC attack effects keep the native lookup by Item slug or name`, error);
  }
  try {
    const fallback = game.i18n._fallback;
    if (!fallback || typeof fallback !== 'object' || !Object.keys(fallback).length) throw new Error('English fallback translations are unavailable.');
    installStrikeRuleSlug({StrikeClass: game.pf2e?.RuleElements?.builtin?.Strike, sluggify, isEnabled,
      englishText: key => foundry.utils.getProperty(game.i18n._fallback, key)});
  } catch (error) {
    console.warn(`${EXTRA_ID} | NPC Strike rules keep the slug of their localized label`, error);
  }
});
