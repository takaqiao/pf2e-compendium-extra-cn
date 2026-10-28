import assert from 'node:assert/strict';
import test from 'node:test';
import {adventuresSurface, adventuresText, adventuresEnabled, bossTurnName, journeyCount} from '../scripts/adventures-presentation.mjs';
import * as presentation from '../scripts/adventures-presentation.mjs';

const MODULE = 'pf2e-team-plus-adventures';
const ui = [
  {surface: 'journey', source: 'Start the Journey', after: '开始旅行'},
  {surface: 'journey', source: 'Stage ${r+1}', after: '阶段 ${r+1}'},
  {surface: 'creaturedex', source: 'Creaturedex: ${e.target.name}', after: '生物图鉴：${e.target.name}'},
  {surface: 'journey', source: "${name}'s approach", after: '${name}的行进方案'},
  {surface: 'journey', source: '${count} ${count===1?`segment`:`segments`}', after: '${count}路段'},
  {surface: 'boss', source: '${t.name} (Boss Turn)', after: '${t.name}（首领回合）'},
];

test('owned applications require module classes and the special page type', () => {
  assert.equal(adventuresSurface({options: {classes: [MODULE, 'journey-page']}, page: {type: `${MODULE}.path`}}), 'journey');
  assert.equal(adventuresSurface({options: {classes: [MODULE, 'creaturedex-menu']}}), 'creaturedex');
  assert.equal(adventuresSurface({options: {classes: [MODULE, 'creaturedex-reveal']}}), 'creaturedex');
  assert.equal(adventuresSurface({options: {classes: ['journey-page']}, page: {type: `${MODULE}.path`}}), null);
  assert.equal(adventuresSurface({options: {classes: [MODULE, 'journey-page']}, page: {type: 'other.path'}}), null);
  assert.equal(adventuresSurface({title: 'Creaturedex'}), null);
});

test('exact static text and simple templates preserve names, numbers and literal replacement characters', () => {
  assert.equal(adventuresText('Start the Journey', 'journey', ui), '开始旅行');
  assert.equal(adventuresText('Stage 12', 'journey', ui), '阶段 12');
  assert.equal(adventuresText('Creaturedex: $& <Moth>', 'creaturedex', ui), '生物图鉴：$& <Moth>');
  assert.equal(adventuresText("My Custom Name's approach", 'journey', ui), 'My Custom Name的行进方案');
  assert.equal(adventuresText('A Stage 12 story', 'journey', ui), 'A Stage 12 story');
  assert.equal(adventuresText('Start the Journey', 'creaturedex', ui), 'Start the Journey');
});

test('templates never evaluate expressions or guess nested conditional results', () => {
  globalThis.adventuresUnexpectedEvaluation = false;
  const rows = [{surface: 'journey', source: 'Value ${globalThis.adventuresUnexpectedEvaluation=true}', after: '值 ${globalThis.adventuresUnexpectedEvaluation=true}'}];
  assert.equal(adventuresText('Value 6', 'journey', rows), '值 6');
  assert.equal(globalThis.adventuresUnexpectedEvaluation, false);
  assert.equal(adventuresText('3 segments', 'journey', ui), '3 segments');
  assert.equal(adventuresText('Value 6', 'journey', [{...rows[0], after: '${anotherExpression}'}]), 'Value 6');
  delete globalThis.adventuresUnexpectedEvaluation;
});

test('only an unchanged automatically generated boss combatant name is translated', () => {
  const initial = {id: 'first', name: 'My Boss'};
  const extra = {name: 'My Boss (Boss Turn)', flags: {[MODULE]: {bossOf: 'first', bossTurn: 2}}};
  assert.equal(bossTurnName(extra, initial, ui), 'My Boss（首领回合）');
  assert.equal(bossTurnName({...extra, name: 'Custom Boss Turn'}, initial, ui), null);
  assert.equal(bossTurnName(extra, {...initial, id: 'wrong'}, ui), null);
  assert.equal(bossTurnName({...extra, flags: {}}, initial, ui), null);
});

test('display supports both source systems and the existing Chinese locale aliases', () => {
  const game = {system: {id: 'pf2e'}, i18n: {lang: 'cn'},
    modules: new Map([[MODULE, {active: true, version: 'custom'}], ['pf2e-compendium-extra-cn', {active: true}]]),
    settings: {get: () => 'full'}};
  assert.equal(adventuresEnabled(game), true);
  for (const id of ['pf2e', 'sf2e']) for (const lang of ['cn', 'zh-CN', 'zh_Hans', 'zh-Hans']) {
    assert.equal(adventuresEnabled({...game, system: {id}, i18n: {lang}}), true);
  }
  game.settings.get = () => 'ondemand';
  assert.equal(adventuresEnabled(game), true);
  for (const change of [g => g.i18n.lang = 'en', g => g.system.id = 'dnd5e',
    g => g.modules.get(MODULE).active = false, g => g.modules.get('pf2e-compendium-extra-cn').active = false,
    g => g.settings.get = () => 'disabled', g => g.settings.get = () => {throw Error('not ready');}]) {
    const copy = {...game, system: {...game.system}, i18n: {...game.i18n}, settings: {...game.settings},
      modules: new Map([...game.modules].map(([key, value]) => [key, {...value}]))};
    change(copy);
    assert.equal(adventuresEnabled(copy), false);
  }
});

test('map tooltip translation preserves custom segment names and event notes', () => {
  const rows = ['Start', 'End', 'Danger', 'Peaceful', 'Rolled on the events table'].map((source, index) =>
    ({surface: 'journey', source, after: ['起点', '终点', '险情', '平静', '由事件表掷骰决定'][index]}));
  const segment = {label: 'Danger, Start', start: true, end: false,
    tooltip: 'Danger, Start, Start — Danger: Custom Peaceful: End'};
  assert.equal(presentation.journeySegmentTooltip(segment, rows), 'Danger, Start, 起点 — 险情: Custom Peaceful: End');
  assert.equal(presentation.journeySegmentTooltip({...segment, tooltip: 'Danger, Start, Start'}, rows), 'Danger, Start, 起点');
  assert.equal(presentation.journeySegmentTooltip({label: '', end: true, tooltip: 'End — Peaceful'}, rows), '终点 — 平静');
  assert.equal(presentation.journeySegmentTooltip({...segment, tooltip: 'Custom Start — Danger'}, rows), 'Custom Start — Danger');
  assert.equal(presentation.journeySegmentTooltip({...segment, tooltip: 'Danger, Start, Start — Custom event'}, rows), 'Danger, Start, Start — Custom event');
  assert.equal(presentation.journeySegmentTooltip({label: '', tooltip: 'Rolled on the events table'}, rows), '由事件表掷骰决定');
  assert.equal(presentation.journeySegmentTooltip({label: 'Peaceful', tooltip: 'Peaceful'}, rows), 'Peaceful');
});

test('generated segment counts translate the units without treating arbitrary names as counts', () => {
  const rows = [{surface: 'journey', source: 'segments', after: '个路段'},
    {surface: 'journey', source: '${qc(V(n).remaining)} left', after: '剩余 ${qc(V(n).remaining)}'}];
  assert.equal(journeyCount('3 segments left', rows), '剩余 3 个路段');
  assert.equal(journeyCount('1 segment', rows), '1 个路段');
  assert.equal(journeyCount('1d4 segments', rows), '1d4 个路段');
  assert.equal(journeyCount('My 3 segments story', rows), 'My 3 segments story');
});

test('generated event ranges translate only the fixed event names', () => {
  const rows = [{surface: 'journey', source: 'Danger', after: '险情'},
    {surface: 'journey', source: 'Peaceful', after: '平静'}];
  assert.equal(presentation.journeyEventRanges(' 1–4 Danger, 5 Peaceful', rows), ' 1–4 险情, 5 平静');
  assert.equal(presentation.journeyEventRanges('My 1–4 Danger', rows), 'My 1–4 Danger');
  assert.equal(presentation.journeyEventRanges('1–4 Danger, 5 Custom Name', rows), '1–4 Danger, 5 Custom Name');
});
