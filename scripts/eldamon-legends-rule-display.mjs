import {ELDAMON_RULE_DISPLAY_BINDINGS} from './eldamon-legends-rule-display-data.mjs';
import {installEldamonRuleDisplay} from './eldamon-legends-rule-display-core.mjs';

Hooks.once('i18nInit', () => {
  const enabled = () => game.system?.id === 'pf2e'
    && ['cn', 'zh-CN', 'zh-Hans'].includes(game.i18n.lang)
    && ['battlezoo-eldamon-legends-pf2e', 'pf2e-compendium-extra-cn', 'babele']
      .every(id => game.modules.get(id)?.active);
  if (!enabled()) return;
  const rules = game.pf2e?.RuleElements?.all;
  installEldamonRuleDisplay({
    ItemClass: CONFIG.Item.documentClass,
    classes: {FlatModifier: rules?.FlatModifier, Strike: rules?.Strike},
    bindings: ELDAMON_RULE_DISPLAY_BINDINGS,
    isEnabled: enabled,
  });
});
