import {adventuresItemTextPatch} from './adventures-item-text.mjs';
import {adventuresPageTextPatch} from './adventures-page-text.mjs';
import {translateAdventuresDescription} from './adventures-description.mjs';

Hooks.once('babele.init', babele => {
  babele.registerConverters({
    'adventures-item-text': adventuresItemTextPatch,
    'adventures-page-text': adventuresPageTextPatch,
    'adventures-description': translateAdventuresDescription,
  });
});
