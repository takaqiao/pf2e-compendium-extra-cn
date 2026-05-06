/**
 * Inject external module i18n strings into game.i18n.translations.
 *
 * Why this is needed: a few PF2e community modules (notably
 * pf2e-team-plus-magic and pf2e-team-plus-oracles-remastered) ship a
 * `lang/en.json` that defines i18n keys used by their compendium
 * content (e.g. `PF2E.TEAMPLUS.ORACLES.Prompt.Cursebound`). Babele only
 * translates compendium documents, not these system-style keys — so
 * tooltips, choice prompts, and rule-element prompts that reference
 * those keys never get localized through babele.
 *
 * Foundry's normal auto-loading via `module.json`'s `languages` field
 * only loads files belonging to *this* module. To translate keys
 * defined elsewhere, we have to merge them into `game.i18n.translations`
 * ourselves. The `i18nInit` hook is the right time: translations are
 * already fetched and indexed, but UI rendering hasn't happened yet.
 *
 * Usage: drop the original module's `lang/en.json` into
 * `lang/external/<moduleId>.json` here, then later replace each value
 * with its Chinese translation. Keys must stay identical.
 */

const MODULE_ID = 'pf2e-compendium-extra-cn';

// Source modules whose i18n keys we want to override. Add an entry here
// (and a file at lang/external/<moduleId>.json) to support more.
// Files contain raw English source by default — replace values with
// translations as work proceeds.
const EXTERNAL_LANG_SOURCES = [
  'pf2e-playtest-data',
];

Hooks.once('i18nInit', async () => {
  let totalKeys = 0;
  let loadedModules = 0;
  for (const sourceModule of EXTERNAL_LANG_SOURCES) {
    if (!game.modules.get(sourceModule)?.active) continue;
    try {
      const url = `modules/${MODULE_ID}/lang/external/${sourceModule}.json`;
      const response = await fetch(url);
      if (!response.ok) continue;
      const translations = await response.json();
      foundry.utils.mergeObject(game.i18n.translations, translations);
      const leafCount = countLeaves(translations);
      totalKeys += leafCount;
      loadedModules++;
      console.log(`[${MODULE_ID}] merged ${leafCount} i18n keys from ${sourceModule}`);
    } catch (err) {
      console.warn(`[${MODULE_ID}] failed loading external lang for ${sourceModule}:`, err);
    }
  }
  console.log(`[${MODULE_ID}] external lang injection: ${totalKeys} keys from ${loadedModules} modules`);
});

function countLeaves(obj) {
  if (typeof obj !== 'object' || obj === null) return typeof obj === 'string' ? 1 : 0;
  let n = 0;
  for (const v of Object.values(obj)) n += countLeaves(v);
  return n;
}
