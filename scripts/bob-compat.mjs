import {StructuredDataConverter} from '../../babele/script/converter/structured-data-converter.js';
import {CompendiumRuntime} from '../../babele/script/compendium/compendium-runtime.js';
import {BOB_STRUCTURED, createBobStructuredConverter} from './bob-structured-core.mjs';
import {isBobActive, registerBobLanguages, refreshBobSchemaLabels} from './bob-i18n-core.mjs';
import {isBobIdentityReady} from './bob-runtime-state.mjs';

// Native Localization awaits these files before i18nInit. Registering the
// descriptors at init avoids asynchronous hook and module-evaluation races.
// Resolving against this script also preserves a configured Foundry route prefix.
const languagePath = new URL('../lang/external/pf2e-bastion-of-blasphemies.json', import.meta.url).href;
Hooks.once('init', () => registerBobLanguages(game, languagePath));

Hooks.once('i18nInit', () => {
  // BoB may have already cached English with localizeDataModel's ||= writes.
  // Its registered setting exposes the same schema without importing BoB code.
  refreshBobSchemaLabels(game);
});

Hooks.once('babele.init', babele => {
  if (!isBobActive(game) || game.modules.get('babele')?.version !== '2.9.1') return;
  if (babele.converterRegistry.named(BOB_STRUCTURED)) {
    throw new Error(`Babele converter '${BOB_STRUCTURED}' is already registered.`);
  }
  // Registration happens before client-language initialization. The converter
  // is used only by this module's explicit Chinese BoB mappings.
  babele.registerConverters({
    [BOB_STRUCTURED]: createBobStructuredConverter(StructuredDataConverter, CompendiumRuntime, isBobIdentityReady)
  });
});
