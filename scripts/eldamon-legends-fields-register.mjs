import './eldamon-legends-effect-display.mjs';
import './eldamon-legends-rule-display.mjs';
import {createEldamonRuleTextConverter, createEldamonBadgeLabelsConverter} from './eldamon-legends-fields.mjs';

Hooks.once('babele.init', babele => {
  babele.registerConverters({
    'eldamon-legends-rule-text': createEldamonRuleTextConverter(),
    'eldamon-legends-badge-labels': createEldamonBadgeLabelsConverter(),
  });
});
