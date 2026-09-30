import {BOB_APPROVED_JOURNAL_ANCHORS} from './bob-approved-journal-anchors.mjs';
import {BOB_CHINESE_LANGS,isBobActive} from './bob-i18n-core.mjs';
import {installBobJournalAnchors} from './bob-journal-anchor-core.mjs';
let installation=null;
const supported=()=>isBobActive(game) && BOB_CHINESE_LANGS.includes(game.i18n.lang)
  && game.modules.get('babele')?.active===true
  && game.modules.get('pf2_cn')?.active===true;
export const isBobJournalAnchorsReady=()=>installation?.isActive()===true && supported();
export function disposeBobJournalAnchors(){installation?.();installation=null;}
Hooks.once('ready',()=>{
  if(!supported())return;
  installation=installBobJournalAnchors({PageClass:CONFIG.JournalEntryPage.documentClass,
    PageSheetClass:foundry.applications.sheets.journal.JournalEntryPageSheet,
    bindings:BOB_APPROVED_JOURNAL_ANCHORS,isEnabled:supported});
});
