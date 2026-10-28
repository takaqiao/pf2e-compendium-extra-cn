import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const LEGENDS = 'battlezoo-eldamon-legends-pf2e';
const EXTRA = 'pf2e-compendium-extra-cn';
const script = readFileSync(new URL('../scripts/eldamon-legends-display.js', import.meta.url), 'utf8');

function settingsFixture(mode) {
  class BooleanField {}
  const field = new BooleanField();
  field.name = `${LEGENDS}.introPopUp`;
  field.label = 'Intro Pop-Up';
  const setting = {namespace:LEGENDS, key:'introPopUp', type:Boolean, scope:'client', config:true, default:true};
  const game = {
    system:{id:'pf2e'}, i18n:{lang:'cn'},
    modules:new Map([[LEGENDS, {active:true}], [EXTRA, {active:true}]]),
    settings:{get:() => mode, settings:new Map([[field.name, setting]])}
  };
  const hooks = new Map();
  const context = vm.createContext({game, Boolean, foundry:{data:{fields:{BooleanField}}},
    Hooks:{on:(event, fn) => hooks.set(event, fn), once:(event, fn) => hooks.set(event, fn)}});
  vm.runInContext(script, context);
  return {game, field, setting,
    render:() => hooks.get('preRenderSettingsConfig')({}, {categories:{[LEGENDS]:{entries:[{field}]}}})};
}

for (const mode of ['full', 'ondemand']) {
  test(`Legends settings display translates in ${mode} without changing its registered setting`, () => {
    const {field, setting, render} = settingsFixture(mode);
    const source = {...setting};
    render();
    assert.equal(field.label, '介绍弹窗');
    assert.deepEqual(setting, source);
    assert.equal(field.name, `${LEGENDS}.introPopUp`);
  });
}

test('unknown or unavailable Babele modes retain the native settings label', () => {
  for (const mode of ['disabled', 'custom', '', undefined, null]) {
    const {field, render} = settingsFixture(mode);
    render();
    assert.equal(field.label, 'Intro Pop-Up', String(mode));
  }
  const f = settingsFixture('ondemand');
  f.game.settings.get = () => { throw Error('not registered'); };
  f.render();
  assert.equal(f.field.label, 'Intro Pop-Up');
});

test('on-demand display still requires the supported language, system, modules and setting', () => {
  for (const mutate of [
    f => { f.game.i18n.lang = 'en'; },
    f => { f.game.system.id = 'sf2e'; },
    f => { f.game.modules.get(LEGENDS).active = false; },
    f => { f.game.modules.get(EXTRA).active = false; },
    f => { f.setting.scope = 'world'; },
    f => { f.field.label = 'Custom label'; }
  ]) {
    const f = settingsFixture('ondemand');
    mutate(f);
    const label = f.field.label;
    f.render();
    assert.equal(f.field.label, label);
  }
});
