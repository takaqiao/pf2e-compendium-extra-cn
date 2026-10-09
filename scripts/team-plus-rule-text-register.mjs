import {translateRuleTexts} from './team-plus-rule-text.mjs';

Hooks.once('babele.init', babele => {
  babele.registerConverters({'team-plus-rule-text': translateRuleTexts});
});
