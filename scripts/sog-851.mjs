import {PublishedTranslationSource} from '../../babele/script/translation/translation-source.js';
import {registerSogSourceFields, installPublishedSogGuard, installOnDemandSogGuard, refreshOnDemandSogSources} from './sog-851-core.mjs';

// Both directories contain the same field-level translations, including stale
// Published lists. No pack documents are read during registration.
Hooks.once('babele.init', registerSogSourceFields);
Hooks.once('babele.init', babele => {
  installPublishedSogGuard(PublishedTranslationSource);
  installOnDemandSogGuard(babele);
});
Hooks.once('setup', () => installOnDemandSogGuard(globalThis.game?.babele));
Hooks.on('babele.dataLoaded', () => refreshOnDemandSogSources(globalThis.game?.babele));
