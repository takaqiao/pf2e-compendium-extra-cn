import './av-legacy-content-links.mjs';
import {AV_BADGE_LABELS,createAvBadgeLabelsConverter} from './av-badge-labels-core.mjs';
import {MappedCompendium} from '../../babele/script/compendium/mapped-compendium.js';
import {installAvOnDemandReentryGuard} from './av-ondemand-reentry.mjs';
/** Append to extra esmodules. Registration only; no global/default converter replacement. */
import {StructuredDataConverter} from '../../babele/script/converter/structured-data-converter.js';
import {CompendiumRuntime} from '../../babele/script/compendium/compendium-runtime.js';
import {AV_STRUCTURED,createAvStructuredConverter} from './av-structured-core.mjs';
Hooks.once('babele.init',babele=>{
  installAvOnDemandReentryGuard(MappedCompendium);
  if(game.system?.id!=='pf2e'||game.modules.get('babele')?.version!=='2.9.1')return;
  if(babele.converterRegistry.named(AV_STRUCTURED))throw new Error(`Duplicate ${AV_STRUCTURED} converter registration`);
  if(babele.converterRegistry.named(AV_BADGE_LABELS))throw new Error(`Duplicate ${AV_BADGE_LABELS} converter registration`);
  babele.registerConverters({[AV_STRUCTURED]:createAvStructuredConverter(StructuredDataConverter,CompendiumRuntime),[AV_BADGE_LABELS]:createAvBadgeLabelsConverter()});
});
