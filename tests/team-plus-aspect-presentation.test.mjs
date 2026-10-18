import assert from 'node:assert/strict';
import test from 'node:test';
import {aspectText, isAspectConfigurator, presentAspectPreset} from '../scripts/team-plus-aspect-presentation.mjs';
import {translateAspectCommand} from '../scripts/team-plus-aspect-macros.mjs';

const translations = {
  'trait.animal': '动物', 'trait.minion': '仆从', 'trait.agile': '灵巧',
  'sense.darkvision': '黑暗视觉', 'sense.tremorsense': '震动感知',
  'acuity.imprecise': '不精确', 'damage.piercing': '穿刺',
  'immune.poison': '毒素', 'resist.fire': '火焰', 'weak.cold': '寒冷',
  'PF2E.Actor.Speed.Type.Fly': '飞行', 'PF2E.Actor.Speed.Type.Burrow': '掘地',
};
const context = {
  config: {
    creatureTraits: {animal: 'trait.animal', minion: 'trait.minion'},
    npcAttackTraits: {agile: 'trait.agile'},
    senses: {darkvision: 'sense.darkvision', tremorsense: 'sense.tremorsense'},
    senseAcuities: {imprecise: 'acuity.imprecise'},
    damageTypes: {piercing: 'damage.piercing'},
    immunityTypes: {poison: 'immune.poison'},
    resistanceTypes: {fire: 'resist.fire'}, weaknessTypes: {cold: 'weak.cold'},
  },
  localize: key => translations[key] ?? key,
};

test('only the Magic aspect configurator application is recognised', () => {
  assert.equal(isAspectConfigurator({options: {classes: ['magic-plus', 'aspect-configurator']}}), true);
  for (const classes of [[], ['magic-plus'], ['aspect-configurator'], ['other-configurator']]) {
    assert.equal(isAspectConfigurator({options: {classes}}), false);
  }
  assert.equal(isAspectConfigurator({title: 'Configure Animal Aspect'}), false);
});

test('preview slugs use system labels and leave unknown or untranslated slugs alone', () => {
  const before = structuredClone(context.config);
  assert.equal(aspectText('Traits', 'animal, minion, custom-trait', context), '动物, 仆从, custom-trait');
  assert.equal(aspectText('Senses', 'darkvision, tremorsense (imprecise) 30 ft', context), '黑暗视觉, 震动感知（不精确）30尺');
  assert.equal(aspectText('Speed', '25 ft, fly 40 ft, burrow 10 ft', context), '25尺, 飞行40尺, 掘地10尺');
  assert.equal(aspectText('Defenses', 'Immune poison; Resist fire 5; Weak cold 10', context), '免疫毒素; 抗力火焰 5; 弱点寒冷 10');
  assert.equal(aspectText('Traits', 'animal, custom-trait', {config: context.config, localize: x => x}), 'animal, custom-trait');
  assert.equal(aspectText('other', 'animal, minion', context), 'animal, minion');
  assert.deepEqual(context.config, before);
});

test('generated previews keep numeric values and separate labels from attack names', () => {
  assert.equal(aspectText('Saves', 'Fort +12, Ref +8, Will -1 (to your own)', context), '强韧 +12, 反射 +8, 意志 -1（加到自身豁免上）');
  assert.equal(aspectText('save-choice', 'Fort +3 · Ref +1 · Will +2', context), '强韧 +3 · 反射 +1 · 意志 +2');
  assert.equal(aspectText('Size', '大型, reach 10 ft, 10 × 10 ft', context), '大型, 触及10尺, 10 × 10尺');
  assert.equal(aspectText('strike', ' +14 (2d6+3 piercing, range 30 ft)', context), ' +14 (2d6+3 穿刺, 射程30尺)');
  assert.equal(aspectText('strike-traits', 'agile, custom-attack', context), '灵巧, custom-attack');
  assert.equal(aspectText('strike', 'Fang +14 (2d6+3 piercing)', context), 'Fang +14 (2d6+3 piercing)');
});

test('native unsigned zero saves translate without changing signs or values', () => {
  assert.equal(aspectText('save-choice', 'Fort -2 · Ref 0 · Will +1', context), '强韧 -2 · 反射 0 · 意志 +1');
  assert.equal(aspectText('Saves', 'Fort -2, Ref 0, Will +1 (to your own)', context), '强韧 -2, 反射 0, 意志 +1（加到自身豁免上）');
  assert.equal(aspectText('save-choice', 'Fort 0 · Ref 0 · Will 0', context), '强韧 0 · 反射 0 · 意志 0');
});

test('Skills previews translate only the thirteen lore labels present in aspect rules', () => {
  const loreLabels = [
    ['Air Lore', '空气学识'], ['Earth Lore', '土地学识'], ['Fire Lore', '火焰学识'],
    ['Metal Lore', '金属学识'], ['Water Lore', '水流学识'], ['Wood Lore', '木质学识'],
    ['Disaster Lore', '灾祸学识'], ['Forest Lore', '森林学识'], ['Legal Lore', '律法学识'],
    ['Planar Lore', '位面学识'], ['Riddle Lore', '谜题学识'], ['Secrets Lore', '秘密学识'],
    ['Spirit Lore', '灵魂学识'],
  ];
  for (const [source, translation] of loreLabels) for (const value of ['+9', '0', '-2']) {
    assert.equal(aspectText('Skills', `${source} ${value}`, context), `${translation} ${value}`);
  }
  assert.equal(aspectText('Skills', 'Air Lore +9, 特技 +9, 运动 +9', context), '空气学识 +9, 特技 +9, 运动 +9');
  for (const source of ['Custom Lore +9', 'Air Lore II +9', 'air lore +9', 'Air Lore nine', 'Air Lore', 'Air Lore +9 (custom)']) {
    assert.equal(aspectText('Skills', source, context), source);
  }
  assert.equal(aspectText('other', 'Air Lore +9', context), 'Air Lore +9');
});

test('preset dialog text accepts the native localized Save button and preserves unknown dialogs', () => {
  const previousDocument = globalThis.document, previousFilter = globalThis.NodeFilter;
  globalThis.NodeFilter = {SHOW_TEXT: 4};
  globalThis.document = {createTreeWalker: root => {
    let index = 0;
    return {nextNode: () => root.childNodes[index++] ?? null};
  }};
  function textElement(text) {
    const element = {querySelectorAll: () => [], closest: () => null, matches: () => false};
    element.childNodes = [{nodeType: 3, data: text, parentElement: element}];
    Object.defineProperty(element, 'textContent', {get: () => element.childNodes[0].data});
    return element;
  }
  try {
    for (const [buttonText, coreLabel, title, labelText, hasOwner, hasInput, expected] of [
      ['保存', '保存', 'Save Aspect Preset', 'Preset name ', true, true, true],
      ['Save', '保存', 'Save Aspect Preset', 'Preset name ', true, true, true],
      ['储存', '储存', 'Save Aspect Preset', 'Preset name ', true, true, true],
      ['Submit', '保存', 'Save Aspect Preset', 'Preset name ', true, true, false],
      ['保存', '保存', 'Other Dialog', 'Preset name ', true, true, false],
      ['保存', '保存', 'Save Aspect Preset', 'Custom name ', true, true, false],
      ['保存', '保存', 'Save Aspect Preset', 'Preset name ', false, true, false],
      ['保存', '保存', 'Save Aspect Preset', 'Preset name ', true, false, false],
    ]) {
      const heading = textElement(title), label = textElement(labelText), button = textElement(buttonText);
      const input = {value: 'My Save', defaultValue: 'None'};
      label.querySelector = () => hasInput ? input : null;
      const elements = {'.window-title': heading, '.dialog-content > label': label, 'button[data-action="ok"]': button};
      const root = {querySelector: selector => elements[selector]};
      presentAspectPreset({title}, root, hasOwner, coreLabel);
      assert.equal(heading.textContent, expected ? '保存层面预设' : title);
      assert.equal(label.textContent, expected ? '预设名称 ' : labelText);
      assert.equal(button.textContent, expected && buttonText === 'Save' ? '保存' : buttonText);
      assert.deepEqual(input, {value: 'My Save', defaultValue: 'None'});
    }
  } finally {
    if (previousDocument === undefined) delete globalThis.document; else globalThis.document = previousDocument;
    if (previousFilter === undefined) delete globalThis.NodeFilter; else globalThis.NodeFilter = previousFilter;
  }
});

test('dynamic UI templates translate complete generated strings but preserve user names', () => {
  const rows = [
    ['title', 'Configure Animal Aspect', '配置Animal Aspect'],
    ['mode', 'Summon for Save', '召唤（目标：Save）'],
    ['caster', 'Rank · level 9 · spell DC 27', 'Rank · 9级 · 法术DC 27'],
    ['count', 'Pick 2.', '选择2项。'],
    ['issue', 'Pick 3 (1 picked).', '选择3项（已选1项）。'],
    ['issue', 'Gift: No option is available.', 'Gift：没有可用选项。'],
    ['changed', 'was nothing', '原为无'],
    ['art-use', "Use None's art", '使用None的立绘'],
    ['art-tooltip', "Uncheck Save's art to use your own", '取消勾选Save的立绘后，可使用自定义图像'],
    ['art-missing', 'No art is installed for Animal. A token art module, such as Pathfinder Tokens: Bestiaries, can provide it.', '未安装Animal的立绘。可通过Pathfinder Tokens: Bestiaries等Token立绘模组提供。'],
    ['size-card', '+10 ft Speed', '+10尺速度'],
  ];
  for (const [kind, source, expected] of rows) assert.equal(aspectText(kind, source, context), expected, kind);
  for (const source of ['Pick two.', 'Configure', 'Unknown text']) assert.equal(aspectText('count', source, context), source);
});

const macroId = 'ZQhSg2pV8enjw4Rg';
const sourceUuid = `Compendium.pf2e-team-plus-magic.macros.Macro.${macroId}`;
const macroDocument = {_id: macroId, type: 'script'};
// A small executable fixture: no upstream macro implementation is copied.
const command = [
  "const actorUuid = 'Compendium.pf2e-team-plus-magic.actors.Actor.2uDnYIc16jKJdPK1';",
  "const effectUuid = 'Compendium.pf2e-team-plus-magic.misc.TLIkcaSk5Zx3iFjK';",
  'ui.notifications.warn("Select the summoning token before summoning.");',
  'return await finish(actorUuid, effectUuid);',
].join('\n');

test('macro translation requires the mapped macro identity and its summon targets', () => {
  const translated = translateAspectCommand(command, {sourceUuid}, macroDocument);
  assert.match(translated, /召唤前请先选中施法者的Token。/);
  assert.equal(translated.replace('召唤前请先选中施法者的Token。', 'Select the summoning token before summoning.'), command);
  const variants = [
    [{sourceUuid: sourceUuid.replace(macroId, 'unknown')}, macroDocument, command],
    [{sourceUuid}, {...macroDocument, _id: 'unknown'}, command],
    [{sourceUuid}, {...macroDocument, type: 'chat'}, command],
    [{sourceUuid}, {...macroDocument, _stats: {compendiumSource: 'Compendium.other.macros.Macro.other'}}, command],
    [{sourceUuid}, macroDocument, command.replace('TLIkcaSk5Zx3iFjK', 'unknown')],
    [{sourceUuid}, macroDocument, command.replace('Select the summoning token before summoning.', 'Select another token.')],
  ];
  for (const [mapping, doc, source] of variants) assert.equal(translateAspectCommand(source, mapping, doc), source);
  assert.equal(translateAspectCommand(command, {sourceUuid}, macroDocument, {collection: 'other.macros'}), command);
  assert.equal(translateAspectCommand(translated, {sourceUuid}, macroDocument), translated);
});

test('both macro packs preserve asynchronous results, call arguments and errors', async () => {
  const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
  for (const sf2 of [false, true]) {
    const source = sf2 ? command.replaceAll('.actors.', '.sf2e-actors.').replaceAll('.misc.', '.sf2e-misc.') : command;
    const mapping = {sourceUuid: sf2 ? sourceUuid.replace('.macros.', '.sf2e-macros.') : sourceUuid};
    const translated = translateAspectCommand(source, mapping, macroDocument);
    const notices = [];
    const run = new AsyncFunction('ui', 'finish', translated);
    const result = await run({notifications: {warn: text => notices.push(text)}}, async (...args) => args);
    assert.deepEqual(notices, ['召唤前请先选中施法者的Token。']);
    assert.equal(result[0], `Compendium.pf2e-team-plus-magic.${sf2 ? 'sf2e-' : ''}actors.Actor.2uDnYIc16jKJdPK1`);
    assert.equal(result[1], `Compendium.pf2e-team-plus-magic.${sf2 ? 'sf2e-' : ''}misc.TLIkcaSk5Zx3iFjK`);
    const failure = new Error('native failure');
    await assert.rejects(run({notifications: {warn() {}}}, async () => {throw failure;}), error => error === failure);
  }
});

test('summon controls and cancellation messages change only inside the mapped command', async () => {
  const source = command.split('\n').slice(0, 2).join('\n') + `
ui.notifications.warn("Foundry Summons is not installed! Cannot automate summoning without it.");
const choice = await prompt({window: { title: "Pick spell rank" }, ok: {label: "Summon"}, rejectClose: false});
if (!choice) {
  try { await cleanup(); }
  catch { ui.notifications.warn("The aspect was cancelled. Remove the summoned token manually."); }
}
return choice;`;
  const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
  const run = new AsyncFunction('ui', 'prompt', 'cleanup', translateAspectCommand(source, {sourceUuid}, macroDocument));
  let calls = 0;
  const notices = [];
  const result = await run({notifications: {warn: value => notices.push(value)}}, async options => {
    assert.deepEqual(options, {window: {title: '选择法术环阶'}, ok: {label: '召唤'}, rejectClose: false});
    return null;
  }, async () => {calls++; throw Error('cleanup failure');});
  assert.equal(result, null);
  assert.equal(calls, 1);
  assert.deepEqual(notices, ['未安装Foundry Summons，无法自动召唤。', '已取消层面配置，请手动移除召唤出的Token。']);
});
