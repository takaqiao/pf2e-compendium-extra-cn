import {adventuresItemTextPatch} from './adventures-item-text.mjs';
import {adventuresPageTextPatch} from './adventures-page-text.mjs';
import {translateAdventuresDescription} from './adventures-description.mjs';
import {installAdventuresJournalAnchors} from './adventures-journal-anchor.mjs';
import {adventuresEnabled} from './adventures-runtime-gate.mjs';

Hooks.once('babele.init', babele => {
  babele.registerConverters({
    'adventures-item-text': adventuresItemTextPatch,
    'adventures-page-text': adventuresPageTextPatch,
    'adventures-description': translateAdventuresDescription,
  });
});

Hooks.once('ready', () => {
  installAdventuresJournalAnchors({
    PageSheetClass: foundry.applications.sheets.journal.JournalEntryPageSheet,
    isEnabled: () => adventuresEnabled(game),
  });
});
