import assert from 'node:assert/strict';
import test from 'node:test';
import {createAdventuresChat, notificationCallsites, sourceCallAt} from '../scripts/adventures-chat.mjs';
import translations from '../scripts/adventures-presentation-data.mjs';
import {sha256} from '../scripts/team-plus-presentation-core.mjs';

const moduleId = 'pf2e-team-plus-adventures';
const page = {type: `${moduleId}.path`, name: 'The party', visible: true};
const ui = [
  {id: 'adventures-ui-228', source: '<p>The journey along <strong>${e.name}</strong> ends.</p>', after: '<p>沿<strong>${e.name}</strong>的旅途结束。</p>'},
  {id: 'adventures-ui-225', source: '${e.name} needs a start segment before the party can set out on it.', after: '${e.name}需要有起始路段，队伍才能出发。'},
  {id: 'adventures-ui-259', source: '<p>${i.actor.name} uses ${Vl(n)}, −${a} Endurance.</p>', after: '<p>${i.actor.name}使用${Vl(n)}，−${a}耐力。</p>'},
  {id: 'adventures-ui-220', source: 'Survey', after: '勘察'},
];
function context(language = 'cn') {
  return {i18n: {lang: language}, system: {id: 'pf2e'}, settings: {get: () => 'full'}, modules: new Map([[moduleId, {active: true}], ['pf2e-compendium-extra-cn', {active: true}]]), journal: {contents: [{pages: {contents: [page]}}]}};
}

test('journey messages require an exact visible path identity and retain custom names', () => {
  const chat = createAdventuresChat({game: context(), data: {ui}});
  const message = {speaker: {alias: 'The party'}, content: '<p>The journey along <strong>The party</strong> ends.</p>'};
  const before = structuredClone(message);
  assert.equal(chat.translate(message).content, '<p>沿<strong>The party</strong>的旅途结束。</p>');
  assert.deepEqual(message, before);
  assert.equal(chat.translate({...message, speaker: {alias: 'Unrelated'}}), null);
  assert.equal(chat.translate({...message, content: '<p>The journey along <strong>Another name</strong> ends.</p>'}), null);
  assert.equal(createAdventuresChat({game: context('en'), data: {ui}}).translate(message), null);
});

test('activity cards preserve UUIDs, actor names and all message data', () => {
  const chat = createAdventuresChat({game: context(), data: {ui}});
  const link = '@UUID[Compendium.pf2e-team-plus-adventures.pf2e-items.Item.KAI1cIP3cAOTl74c]{Survey}';
  const message = {speaker: {actor: 'actor-1'}, content: `<p>Survey uses ${link}, −2 Endurance.</p>`, whisper: ['gm'], rolls: [{formula: '1d20'}]};
  const before = structuredClone(message);
  assert.equal(chat.translate(message).content, `<p>Survey使用${link.replace('{Survey}', '{勘察}')}，−2耐力。</p>`);
  assert.deepEqual(message, before);
  assert.equal(chat.translate({...message, content: message.content.replace('pf2e-team-plus-adventures', 'another-module')}), null);
});

test('notification call coordinates must belong to the exact module and approved call', () => {
  const call = {line: 4, startColumn: 20, endColumn: 120, method: 'warn', id: 225};
  const stack = 'Error\n    at wrapper (https://example.test/modules/extra/chat.mjs:2:1)\n    at Hl (https://example.test/modules/pf2e-team-plus-adventures/dist/pf2e-team-plus-adventures.js:4:38)';
  assert.equal(sourceCallAt(stack, [call], 'warn')?.id, 225);
  assert.equal(sourceCallAt(stack.replace('.js:4:', '.js?v=123:4:'), [call], 'warn')?.id, 225);
  assert.equal(sourceCallAt(stack.replace(':4:38', ':4:150'), [call], 'warn'), null);
  assert.equal(sourceCallAt(stack.replace('pf2e-team-plus-adventures/dist', 'different/dist'), [call], 'warn'), null);
  assert.equal(sourceCallAt(stack, [call], 'info'), null);
});

test('notification wrappers preserve receiver, options, return values and thrown errors', () => {
  const chat = createAdventuresChat({game: context(), data: {ui}});
  const options = {permanent: true};
  const calls = [];
  const notifications = {warn(message, received) {calls.push([this, message, received]); return 17;}};
  chat.installNotifications(notifications, () => ({id: 225}));
  assert.equal(notifications.warn('The party needs a start segment before the party can set out on it.', options), 17);
  assert.equal(calls[0][0], notifications);
  assert.equal(calls[0][1], 'The party需要有起始路段，队伍才能出发。');
  assert.equal(calls[0][2], options);
  const failure = new Error('native failure');
  const broken = {warn() {throw failure;}};
  chat.installNotifications(broken, () => ({id: 225}));
  assert.throws(() => broken.warn('unchanged'), error => error === failure);
});

const action = (id, name) => `@UUID[Compendium.${moduleId}.pf2e-items.Item.${id}]{${name}}`;
const approach = action('yI99AqcBt4JHbgmU', 'approaches');
const breathe = action('OxEhepyZ6dU4W6B4', 'Breathe');
const camp = action('hbNCfPtKIwugvyPw', 'Camp');
const eventLink = '<a class="content-link" draggable="true" data-uuid="JournalEntry.private.JournalEntryPage.event" data-tooltip="Danger">Danger</a>';

test('nested approach results keep actor names and event link attributes', () => {
  const chat = createAdventuresChat({game: context(), data: translations});
  const content = `<p>The party ${approach} <strong>Danger</strong> and finds inclemency: ${eventLink}, for 2 segments. Traveling fast, everyone regains 1 Endurance.</p><ul><li>Endurance: ${eventLink}, leading, −2 Endurance</li><li>Breathe: can't spend the Endurance, so no approach</li><li>Camp:  no approach</li></ul>`;
  const translated = chat.translate({content}).content;
  assert.match(translated, /队伍/);
  assert.match(translated, /恶劣环境/);
  assert.match(translated, /持续2 个路段/);
  assert.match(translated, /带队/);
  assert.ok(translated.includes('<strong>Danger</strong>'));
  assert.ok(translated.includes(eventLink));
  assert.ok(translated.includes('Endurance：'));
  assert.ok(translated.includes('Breathe：'));
  assert.ok(translated.includes('Camp：'));
  assert.doesNotMatch(translated, /Traveling fast|no approach|leading|can.t spend/);
});

test('free-form event notes are opaque even when they end with generated-looking text', () => {
  const chat = createAdventuresChat({game: context(), data: translations});
  const note = 'Custom note. Traveling fast, everyone regains 1 Endurance';
  const content = `<p>The party ${approach} <strong>Danger</strong> and finds abundance: ${note}.</p>`;
  assert.ok(chat.translate({content}).content.includes(note));
});

test('breathe handles all endurance branches without translating participant names', () => {
  const chat = createAdventuresChat({game: context(), data: translations});
  for (const outcome of [
    '−2 Endurance each.',
    '−2 Endurance each. Inclemencies last one segment less.',
    'Nobody spends 2 Endurance. Breathe is fatigued or short of 2 Endurance.',
    'Nobody and Camp spend 2 Endurance. Breathe and Survey are fatigued or short of 2 Endurance, so inclemencies last as long as before.',
    'nobody can spend Endurance. Breathe is fatigued or short of 2 Endurance.',
  ]) {
    const content = `<p>The company takes a moment to ${breathe}: ${outcome}</p>`;
    const translated = chat.translate({content})?.content;
    assert.ok(translated, outcome);
    assert.doesNotMatch(translated, /Endurance|Inclemencies|fatigued|spends|spend| are | is /);
    if (outcome.includes('Nobody')) assert.ok(translated.includes('Nobody'));
    if (outcome.includes('Breathe')) assert.ok(translated.includes('Breathe'));
  }
});

test('camp preserves linked names and translates every event outcome', () => {
  const chat = createAdventuresChat({game: context(), data: translations});
  const content = `<p>The company makes ${camp}. Everyone regains all their Endurance, and the inclemencies end.</p><p>A danger interrupts the rest: ${eventLink}. Resolve it before the Camp's benefits.</p><p>${eventLink} begins once the camp is struck, for 3 segments.</p><p>An inclemency begins once the camp is struck: Custom event.</p>`;
  const translated = chat.translate({content})?.content;
  assert.ok(translated);
  assert.ok(translated.includes(eventLink));
  assert.ok(translated.includes('Custom event'));
  assert.doesNotMatch(translated, /Endurance|begins once|interrupts|for 3 segments/);
});

test('event rolls require a visible source path and preserve roll data', () => {
  const chat = createAdventuresChat({game: context(), data: translations});
  const message = {speaker: {alias: 'The party'}, flavor: 'Events table (d6)', content: '<ul><li><strong>Camp</strong> (2): Danger, but the path lists no such events, so it\'s peaceful</li><li><strong>Danger</strong> (4): Peaceful</li></ul>', rolls: [{formula: '1d6', total: 2}], whisper: ['gm']};
  const before = structuredClone(message);
  const translated = chat.translate(message);
  assert.ok(translated.content.includes('<strong>Camp</strong> (2)'));
  assert.ok(translated.content.includes('<strong>Danger</strong> (4)'));
  assert.doesNotMatch(translated.content, /no such events|Peaceful/);
  assert.deepEqual(message, before);
  assert.equal(chat.translate({...message, speaker: {alias: 'Other'}}), null);
  const night = `<p>The night's events table rolls (d6), which only count dangers and inclemencies:</p><ul><li>1: nothing</li><li>2: Danger, but the path lists none</li><li>3: Inclemency, ${eventLink}</li></ul>`;
  const result = chat.translate({...message, content: night}).content;
  assert.doesNotMatch(result, /nothing|lists none|dangers and inclemencies/);
  assert.ok(result.includes(eventLink));
});

test('source contracts survive unrelated changes and reject changed notification code', () => {
  const call = 'ui.notifications.warn(`A ${actor.name} message.`)';
  const contracts = [{id: 225, method: 'warn', sha256: sha256(call)}];
  const source = `const before = 42;\nfunction warn() { ${call}; }`;
  const calls = notificationCallsites(source, contracts);
  assert.equal(calls.length, 1);
  assert.equal(notificationCallsites(`// new unrelated line\n${source}`, contracts)[0].line, 3);
  assert.equal(notificationCallsites(source.replace(' message.', ' changed.'), contracts).length, 0);
  assert.equal(notificationCallsites(source.replace('warn(`', 'info(`'), contracts).length, 0);
});

test('ambiguous, invisible, altered and hidden message sources are left unchanged', () => {
  const game = context();
  const chat = createAdventuresChat({game, data: translations});
  const message = {speaker: {alias: page.name}, content: `<p>The journey along <strong>${page.name}</strong> ends.</p>`};
  assert.equal(chat.translate({...message, isContentVisible: false}), null);
  assert.equal(chat.translate({...message, content: message.content.replace('ends.', 'has changed.')}), null);
  game.journal.contents.push({pages: {contents: [{...page}]}});
  assert.equal(chat.translate(message), null);
  game.journal.contents.pop();
  game.journal.contents[0].pages.contents = [{...page, visible: false}];
  assert.equal(chat.translate(message), null);
});

test('all notification templates retain dynamic names and values', () => {
  const chat = createAdventuresChat({game: context(), data: translations});
  const fixtures = [
    [2, 'Could not move Hero after Villain, please move it manually.', ['Hero', 'Villain']],
    [10, "Skipped Hero, as a boss can't act again before its initial turn in the first round.", ['Hero']],
    [81, 'Drop a creature or hazard to use its stat block.', []],
    [82, "Hero's stat block has no Offense section.", ['Hero']],
    [107, 'Asking Hero which skills you can Recall Knowledge with.', ['Hero']],
    [108, 'Hero declined the Recall Knowledge.', ['Hero']],
    [130, "Hero's events table has no faces to roll.", ['Hero']],
    [224, 'Add characters to the party in the Actors sidebar before setting out.', []],
    [225, 'Hero needs a start segment before the party can set out on it.', ['Hero']],
    [229, 'The party can only Approach a segment a link leads to from theirs. To go back the way they came, they Retreat.', []],
    [241, 'The party has nowhere to retreat to yet.', []],
    [242, "Hero and Villain can't spend 2 Endurance, so the party has to make a desperate retreat. Move the party by hand.", ['Hero and Villain', '2']],
    [258, 'Hero needs 2 Endurance and not to be fatigued to Survey.', ['Hero', '2']],
    [260, 'A GM must be logged in to change the journey.', []],
    [349, 'Every neighbouring segment is linked already.', []],
    [350, 'Every link joins neighbouring segments already.', []],
    [351, "The map image custom/Hero Map.webp couldn't be loaded.", ['custom/Hero Map.webp']],
  ];
  for (const [id, source, preserved] of fixtures) {
    const result = chat.notification(id, source);
    assert.ok(result && result !== source, String(id));
    for (const name of preserved) assert.ok(result.includes(name), `${id}: ${name}`);
  }
});

test('creaturedex statistics translate generated numeric suffixes and retain names', () => {
  const game = context();
  const localized = {'PF2E.Actor.Speed.Type.Fly': '飞行', 'sense.darkvision': '黑暗视觉', 'sense.imprecise': '不精确'};
  game.i18n.localize = key => localized[key] ?? key;
  const chat = createAdventuresChat({game, data: translations, config: {senses: {darkvision: 'sense.darkvision'}, senseAcuities: {imprecise: 'sense.imprecise'}}, validateRoll: value => /^\d+d\d+$/.test(value)});
  assert.equal(chat.statText('Speed', ' 25 feet, fly 40 feet'), ' 25 尺, 飞行 40 尺');
  assert.equal(chat.statText('Speed', 'Custom movement 25 feet'), 'Custom movement 25 feet');
  assert.equal(chat.statText('Ranged', 'range 30 feet +12 (agile, range increment 60 feet)'), 'range 30 feet +12 (agile, 射程增量 60 尺)');
  assert.equal(chat.statText('Damage', '2d6 plus Custom effect'), '2d6，外加 Custom effect');
  assert.equal(chat.statText('Damage', 'Custom damage plus Custom effect'), 'Custom damage plus Custom effect');
  assert.equal(chat.statText('Perception', '+12; 黑暗视觉 (imprecise) 60 feet, Custom sense text'), '+12; 黑暗视觉 (不精确) 60 尺, Custom sense text');
  assert.equal(chat.statText('HP', '100 (BT 50), Custom defense'), '100（破损阈值 50）, Custom defense');
  assert.equal(chat.statText('Custom spellcasting', 'DC 23, attack +15; Custom spell name'), 'DC 23，攻击 +15; Custom spell name');
  const spells = chat.statText('Custom spellcasting', 'DC 23, attack +15; Cantrips (Rank 3) Custom spell name');
  assert.doesNotMatch(spells, /Rank/);
  assert.ok(spells.includes('Custom spell name'));
});

test('chat respects Extra and Babele activation in both supported loading modes', () => {
  const game = context();
  const chat = createAdventuresChat({game, data: translations});
  assert.equal(chat.enabled(), true);
  game.settings.get = () => 'ondemand';
  assert.equal(chat.enabled(), true);
  game.settings.get = () => 'disabled';
  assert.equal(chat.enabled(), false);
  game.settings.get = () => 'full';
  game.modules.get('pf2e-compendium-extra-cn').active = false;
  assert.equal(chat.enabled(), false);
  game.modules.get('pf2e-compendium-extra-cn').active = true;
  game.system.id = 'sf2e';
  for (const language of ['cn', 'zh-CN', 'zh_Hans', 'zh-Hans']) {
    game.i18n.lang = language;
    assert.equal(chat.enabled(), true, language);
  }
  game.i18n.lang = 'en';
  assert.equal(chat.enabled(), false);
});
