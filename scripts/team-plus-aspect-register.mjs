import {translateAspectCommand} from './team-plus-aspect-macros.mjs';

Hooks.once('babele.init', babele => {
  babele.registerConverters({'team-plus-aspect-command': translateAspectCommand});
});
