import {BOB_APPROVED_NOTE_DISPLAYS} from './bob-approved-note-display-bindings.mjs';
import {BOB_CHINESE_LANGS, isBobActive} from './bob-i18n-core.mjs';
import {installBobNoteDisplay} from './bob-note-display-core.mjs';
import {RULE_DISPLAY_BINDINGS} from './bob-rule-display-bindings.mjs';
import {prepareWeatherNameAttestation} from './bob-weather-name-attestation.mjs';

let installation = null;
const supported = () => isBobActive(game) && game.version === '14.368'
  && game.system.version === '8.5.1' && BOB_CHINESE_LANGS.includes(game.i18n.lang)
  && game.modules.get('pf2e-bastion-of-blasphemies')?.version === '1.0.0'
  && game.modules.get('babele')?.active === true && game.modules.get('babele')?.version === '2.9.1'
  && game.modules.get('pf2_cn')?.active === true && game.modules.get('pf2_cn')?.version === '2.5.1';

export const isBobNoteDisplayReady = () => installation?.isActive() === true && supported();
export function disposeBobNoteDisplay() { installation?.(); installation = null; }

// Parent integrator owns module registration and native client lifecycle acceptance.
Hooks.once('ready', () => {
  if (!supported()) return;
  const weatherName = prepareWeatherNameAttestation({getRuleClasses: () => game.pf2e.RuleElements.builtin,
    getActiveRuleClasses: () => game.pf2e.RuleElements.all, localize: key => game.i18n.localize(key)});
  const worldRules = new Map(RULE_DISPLAY_BINDINGS.filter(b => b.actorId === null).map(b => [b.itemId, b]));
  installation = installBobNoteDisplay({
    NoteRuleClass: game.pf2e.RuleElements.builtin.Note,
    ItemClass: CONFIG.Item.documentClass, ActorClass: CONFIG.Actor.documentClass,
    ChatMessageClass: CONFIG.ChatMessage.documentClass, TextEditorClass: game.pf2e.TextEditor,
    bindings: BOB_APPROVED_NOTE_DISPLAYS, isEnabled: supported,
    getUser: () => game.user, getActors: () => game.actors.contents,
    matchesPreparedName: (item, row) => {
      const binding = worldRules.get(row.itemId);
      return row.scope === 'worldItem' && !!binding && row.markerIdentity?.sourceFingerprint === binding.sourceFingerprint
        && row.itemName === binding.itemName && row.itemType === binding.itemType && row.description === binding.itemBody
        && weatherName(item, {itemId: binding.itemId, itemName: binding.itemName, itemType: binding.itemType,
          sourceRules: binding.expectedSource.system.rules});
    }
  });
});
