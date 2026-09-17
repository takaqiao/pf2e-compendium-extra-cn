import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(fs.readFileSync(new URL('module.json', root), 'utf8'));
const script = 'scripts/world-clock-i18n.mjs';
const oldMonths = {
  January: '阿贝迪乌斯', February: '卡莉茲翠', March: '法拉斯特', April: '格茲萊',
  May: '黛丝娜斯', June: '赛伦尼斯', July: '埃拉斯图斯', August: '奥罗都斯',
  September: '洛瓦', October: '拉玛沙恩', November: '奈斯', December: '库松纳',
};
const weekdays = { Monday: '月之日', Tuesday: '辛之日', Wednesday: '鞭之日', Thursday: '誓之日', Friday: '火之日', Saturday: '星之日', Sunday: '阳之日' };

function setup({ lang = 'cn', system = 'pf2e', extra = true, cn = true } = {}) {
  // Installed pf2_cn 2.5.2 / PF2e 8.5.1 translation contract.
  const translations = {
    PF2E: {
      OrdinalNumber: '{value}{suffix}',
      OrdinalSuffixes: { one: 'st', two: 'nd', few: 'rd', other: 'th' },
      WorldClock: {
        Date: '{year} {era}，{month}，{day}{ordinalSuffix}，{weekday}',
        AR: { Era: 'AR', Months: { ...oldMonths }, Weekdays: { ...weekdays } },
        Button: { Advance: '推进' },
      },
      Item: { Spell: { Rank: { Ordinal: '{rank}环' } } },
    },
    unrelated: { value: '保留' },
  };
  const fallback = { PF2E: { OrdinalNumber: '{value}{suffix}' } };
  const initial = structuredClone(translations);
  const callbacks = [];
  const modules = new Map([
    ['pf2_cn', { active: cn }], ['pf2e-compendium-extra-cn', { active: extra }],
  ]);
  const game = { system: { id: system }, modules, i18n: { lang, translations, _fallback: fallback } };
  const context = vm.createContext({ game, Hooks: { once(name, callback) { if (name === 'i18nInit') callbacks.push(callback); } } });
  if (manifest.esmodules.includes(script)) vm.runInContext(fs.readFileSync(new URL(script, root), 'utf8'), context);
  const localize = (key, data) => {
    const value = key.split('.').reduce((object, segment) => object[segment], translations);
    return data ? value.replace(/{[^}]+}/g, token => data[token.slice(1, -1)]) : value;
  };
  const ordinal = value => localize('PF2E.OrdinalNumber', {
    value,
    suffix: localize(`PF2E.OrdinalSuffixes.${new Intl.PluralRules(lang.replace('_', '-'), { type: 'ordinal' }).select(value)}`),
  });
  const date = (day = 30, month = 'September', weekday = 'Monday', era = 'AR') => localize('PF2E.WorldClock.Date', {
    year: 4726, era, month: translations.PF2E.WorldClock.AR.Months[month], day: ordinal(day),
    weekday: translations.PF2E.WorldClock.AR.Weekdays[weekday],
  });
  return { game, initial, fallback, localize, ordinal, date, initialize() { for (const callback of callbacks) callback(); } };
}

test('the first date rendered after i18nInit has a Chinese month/day and no missing suffix', () => {
  const runtime = setup();
  assert.equal(runtime.date(), '4726 AR，洛瓦，30thundefined，月之日');
  runtime.initialize();
  assert.equal(runtime.date(), '4726 AR，怒灾月30日，月之日');
  assert.equal(runtime.date(1, 'January', 'Sunday'), '4726 AR，财商月1日，阳之日');
  assert.equal(runtime.date(29, 'February', 'Thursday', 'IC'), '4726 IC，仇欲月29日，誓之日');
});

test('all twelve translated months render in the requested calendar vocabulary', () => {
  const runtime = setup();
  runtime.initialize();
  const names = ['财商月', '仇欲月', '生死月', '风海月', '星梦月', '阳愈月', '农狩月', '人文月', '怒灾月', '狂噩月', '魔法月', '苦暗月'];
  Object.keys(oldMonths).forEach((month, index) => {
    assert.equal(runtime.date(1, month), `4726 AR，${names[index]}1日，月之日`);
  });
});

test('shared ordinal translation renders spell ranks without English suffixes', () => {
  const runtime = setup();
  runtime.initialize();
  for (let rank = 1; rank <= 10; rank++) {
    assert.equal(runtime.localize('PF2E.Item.Spell.Rank.Ordinal', { rank: runtime.ordinal(rank) }), `${rank}环`);
  }
});

test('English, unrelated systems and disabled translation modules are untouched', () => {
  for (const options of [{ lang: 'en' }, { lang: 'de' }, { system: 'dnd5e' }, { extra: false }, { cn: false }]) {
    const runtime = setup(options);
    runtime.initialize();
    assert.deepEqual(runtime.game.i18n.translations, runtime.initial);
  }
});

test('simplified Chinese language aliases use the same repaired date', () => {
  for (const lang of ['cn', 'zh-CN', 'zh-cn', 'zh_Hans', 'zh-Hans']) {
    const runtime = setup({ lang });
    runtime.initialize();
    assert.equal(runtime.date(), '4726 AR，怒灾月30日，月之日');
  }
});

test('the override preserves weekdays, other translations, dictionary identity and fallback', () => {
  const runtime = setup();
  const translations = runtime.game.i18n.translations;
  const originalFallback = structuredClone(runtime.fallback);
  runtime.initialize();
  assert.strictEqual(runtime.game.i18n.translations, translations);
  assert.deepEqual(translations.PF2E.WorldClock.AR.Weekdays, weekdays);
  assert.deepEqual(translations.PF2E.WorldClock.Button, { Advance: '推进' });
  assert.deepEqual(translations.unrelated, { value: '保留' });
  assert.deepEqual(runtime.game.i18n._fallback, originalFallback);
});
