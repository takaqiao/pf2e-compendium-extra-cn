/** Explicit QA factory; no auto-registration or source writes. */
import {installBobJournalCheckDisplay} from './bob-journal-check-display-core.mjs';
import {BINDINGS} from './bob-journal-check-display-bindings.mjs';
export function createBobJournalCheckDisplay(env=globalThis){
 const {game,CONFIG,foundry,document}=env;
 const supported=()=>game?.system?.id==='pf2e'
  &&game.modules?.get('pf2e-bastion-of-blasphemies')?.active===true
  &&game.modules.get('pf2e-compendium-extra-cn')?.active===true
  &&game.modules.get('pf2_cn')?.active===true
  &&game.modules.get('babele')?.active===true
  &&foundry?.applications?.ux?.TextEditor?.implementation===game.pf2e?.TextEditor;
 if(!supported())return null;
 return installBobJournalCheckDisplay({TextEditorClass:game.pf2e.TextEditor,JournalClass:CONFIG.JournalEntry.documentClass,PageClass:CONFIG.JournalEntryPage.documentClass,bindings:BINDINGS,document,isEnabled:supported,getLocale:()=>game.i18n.lang,getUser:()=>game.user,getJournals:()=>game.journal,format:(key,vars)=>game.i18n.format(key,vars)});
}
