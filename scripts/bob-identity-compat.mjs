import {BOB_APPROVED_IDENTITIES} from './bob-approved-identities.mjs';
import {BOB_CHINESE_LANGS, isBobActive} from './bob-i18n-core.mjs';
import {installBobIdentityCompatibility} from './bob-identity-core.mjs';
import {setBobIdentityReadiness} from './bob-runtime-state.mjs';

// PF2e exposes its classes and sluggify during init; documents prepare later.
// These wrappers are intentionally tied to the native consumer version tested.
Hooks.once('i18nInit', () => {
  setBobIdentityReadiness();
  const isEnabled = () => isBobActive(game) && game.version === '14.368' && game.system.version === '8.5.1'
    && game.modules.get('pf2e-bastion-of-blasphemies')?.version === '1.0.0'
    && BOB_CHINESE_LANGS.includes(game.i18n.lang);
  if (!isEnabled()) return;
  const classes = CONFIG.PF2E.Item.documentClasses;
  const installation = installBobIdentityCompatibility({
    ActorClass: CONFIG.Actor.documentClass, ActorDeltaClass: CONFIG.ActorDelta?.documentClass,
    TokenDocumentClass: CONFIG.Token?.documentClass, SceneClass: CONFIG.Scene?.documentClass,
    ItemClass: CONFIG.Item.documentClass, itemClasses: Object.values(classes), LoreClass: classes.lore,
    EffectClass: classes.effect, SpellcastingEntryClass: classes.spellcastingEntry, FeatClass: classes.feat,
    NPCClass: CONFIG.PF2E.Actor.documentClasses.npc,
    HazardClass: CONFIG.PF2E.Actor.documentClasses.hazard, MeleeClass: classes.melee,
    CharacterClass: CONFIG.PF2E.Actor.documentClasses.character,
    RuleElementClass: game.pf2e.RuleElement, TextEditorClass: game.pf2e.TextEditor,
    ActorClasses: Object.values(CONFIG.PF2E.Actor.documentClasses), inlineDamage: true,
    attackEffectLabels: CONFIG.PF2E.attackEffects,
    sluggify: game.pf2e.system.sluggify, identities: BOB_APPROVED_IDENTITIES, isEnabled
  });
  // Foundry materializes queued sheet registrations after setup, before ready.
  // Babele 2.9.1's ready callback necessarily awaits session initialization
  // before applying translations. This synchronous ready callback therefore
  // completes even when Babele's callback is registered first.
  Hooks.once('ready', () => {
    try {
      const ActorSheetClasses = [...new Set(Object.values(CONFIG.Actor.sheetClasses)
        .flatMap(entries => Object.values(entries).map(entry => entry.cls)))];
      installation.installActorSheets(ActorSheetClasses);
      setBobIdentityReadiness(()=>isEnabled() && installation.isActive());
    } catch (error) {
      installation();
      setBobIdentityReadiness();
      throw error;
    }
  });
});
