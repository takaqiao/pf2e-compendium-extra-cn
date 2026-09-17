import {BOB_APPROVED_JOURNAL_ANCHORS} from './bob-approved-journal-anchors.mjs';
import {BOB_CHINESE_LANGS,isBobActive} from './bob-i18n-core.mjs';
import {installBobJournalAnchors} from './bob-journal-anchor-core.mjs';
let installation=null;
const supported=()=>isBobActive(game) && game.version==='14.368'
  && game.system.version==='8.5.1' && BOB_CHINESE_LANGS.includes(game.i18n.lang)
  && game.modules.get('pf2e-bastion-of-blasphemies')?.version==='1.0.0'
  && game.modules.get('babele')?.active===true && game.modules.get('babele')?.version==='2.9.1'
  && game.modules.get('pf2_cn')?.active===true && game.modules.get('pf2_cn')?.version==='2.5.1';
export const isBobJournalAnchorsReady=()=>installation?.isActive()===true && supported();
export function disposeBobJournalAnchors(){installation?.();installation=null;}
Hooks.once('ready',()=>{
  if(!supported())return;
  installation=installBobJournalAnchors({PageClass:CONFIG.JournalEntryPage.documentClass,
    PageSheetClass:foundry.applications.sheets.journal.JournalEntryPageSheet,
    bindings:BOB_APPROVED_JOURNAL_ANCHORS,isEnabled:supported});
});
