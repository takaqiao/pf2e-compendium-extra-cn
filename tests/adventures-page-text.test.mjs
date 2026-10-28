import assert from 'node:assert/strict';
import test from 'node:test';
import {translateAdventuresPageText, adventuresPageTextPatch} from '../scripts/adventures-page-text.mjs';

const type = 'pf2e-team-plus-adventures.';
const row = (path, source, translation) => ({path, source, translation});

test('special pages translate by stable page id and exact source without changing mechanics', () => {
  const pages = [{_id: 'other', type: 'text', system: {}}, {
    _id: 'event', type: `${type}event`, name: 'Custom name',
    system: {description: '<p>A cold wind.</p>', kind: 'navigation', navigation: {
      skills: '<p>Nature</p>', combination: ['north'],
      disorientation: {name: 'Lost', stages: ['<p>First stage.</p>', '<p>Second stage.</p>']},
    }, danger: {threats: [{uuid: 'Actor.unchanged', quantity: '1d4'}]}},
  }];
  const before = structuredClone(pages);
  const translations = {event: [
    row(['description'], '<p>A cold wind.</p>', '<p>一阵寒风。</p>'),
    row(['navigation', 'disorientation', 'stages', 1], '<p>Second stage.</p>', '<p>第二阶段。</p>'),
    row(['kind'], 'navigation', '导航'),
    row(['danger', 'threats', 0, 'quantity'], '1d4', '四个'),
  ]};
  const result = translateAdventuresPageText(pages, translations);
  assert.equal(result[1].system.description, '<p>一阵寒风。</p>');
  assert.equal(result[1].system.navigation.disorientation.stages[1], '<p>第二阶段。</p>');
  assert.deepEqual(result[1].system.danger, before[1].system.danger);
  assert.equal(result[1].system.kind, 'navigation');
  assert.equal(result[1].name, 'Custom name');
  assert.deepEqual(pages, before);
});

test('path array rows require matching identity as well as source', () => {
  const pages = [{_id: 'path', type: `${type}path`, system: {
    biome: 'Mountains', survey: [{skill: 'survival', dc: '+2', note: 'Snow'}],
    events: [{uuid: 'JournalEntryPage.first', kind: 'danger', note: 'Ambush'}],
    segments: [{id: 's1', label: 'Pass', note: 'Snow', event: 'JournalEntryPage.first', hidden: true}],
  }}];
  const translations = {path: [
    row(['biome'], 'Mountains', '山地'),
    {...row(['survey', 0, 'note'], 'Snow', '积雪'), identity: {skill: 'survival', dc: '+2'}},
    {...row(['events', 0, 'note'], 'Ambush', '伏击'), identity: {uuid: 'JournalEntryPage.first', kind: 'danger'}},
    {...row(['segments', 0, 'label'], 'Pass', '山口'), identity: {id: 's1'}},
    {...row(['segments', 0, 'note'], 'Snow', '不得应用'), identity: {id: 's2'}},
  ]};
  const result = translateAdventuresPageText(pages, translations);
  assert.equal(result[0].system.biome, '山地');
  assert.equal(result[0].system.survey[0].note, '积雪');
  assert.equal(result[0].system.events[0].note, '伏击');
  assert.equal(result[0].system.segments[0].label, '山口');
  assert.equal(result[0].system.segments[0].note, 'Snow');
  assert.equal(result[0].system.segments[0].hidden, true);
  const moved = structuredClone(pages);
  moved[0].system.survey[0].skill = 'nature';
  assert.equal(translateAdventuresPageText(moved, translations)[0].system.survey[0].note, 'Snow');
});

test('changed source, wrong page type, unsupported paths and missing identities stay unchanged', () => {
  const pages = [{_id: 'approach', type: `${type}approach`, system: {
    description: 'Custom text', company: '<p>Company.</p>', lead: '<p>Lead.</p>',
    journey: {endurance: 3},
  }}, {_id: 'foreign', type: 'other.approach', system: {description: 'Original'}}];
  const result = translateAdventuresPageText(pages, {
    approach: [row(['description'], 'Original', '译文'), row(['journey', 'endurance'], '3', '4')],
    foreign: [row(['description'], 'Original', '译文')],
  });
  assert.equal(result, pages);
});

test('approach fields translate while empty source and no-op rows keep the original reference', () => {
  const pages = [{_id: 'a', type: `${type}approach`, system: {description: '', company: 'Company', lead: 'Lead'}}];
  const result = translateAdventuresPageText(pages, {a: [row(['company'], 'Company', '全队'), row(['lead'], 'Lead', '领队')]});
  assert.deepEqual(result[0].system, {description: '', company: '全队', lead: '领队'});
  assert.equal(translateAdventuresPageText(pages, {a: [row(['company'], 'Company', 'Company')]}), pages);
});

test('duplicate translated paths fail before returning a partial document', () => {
  const pages = [{_id: 'a', type: `${type}approach`, system: {company: 'Company'}}];
  assert.throws(() => translateAdventuresPageText(pages, {a: [
    row(['company'], 'Company', '全队'), row(['company'], 'Company', '其他'),
  ]}), /duplicate path/);
  assert.equal(pages[0].system.company, 'Company');
});

test('the nested Babele page patch does not return names, text or unchanged system branches', () => {
  const page = {_id: 'a', type: `${type}approach`, name: 'Page', text: {content: 'Page text'},
    system: {description: 'Prose', company: 'Company', lead: 'Lead'}};
  assert.deepEqual(adventuresPageTextPatch(page.system, [row(['company'], 'Company', '全队')], page), {company: '全队'});
  assert.equal(adventuresPageTextPatch(page.system, [], page), undefined);
});
