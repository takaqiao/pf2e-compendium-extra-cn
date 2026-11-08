import assert from 'node:assert/strict';
import test from 'node:test';
import {createMockLibWrapper, loadRealLibWrapper} from './support/libwrapper.mjs';
import {managedMethod, managedOriginalSource, subscribeManagedMethod} from '../scripts/bob-native-lane.mjs';

const REAL = process.env.EXTRA_TEST_LIBWRAPPER;
const real = REAL ? await loadRealLibWrapper(REAL) : null;
let counter = 0;

// Each scenario receives a fresh class wrapped first by another package.
function environments() {
  const list = [['mock', () => {
    const mock = createMockLibWrapper();
    return {libWrapper: mock.libWrapper, register: (path, fn) => mock.libWrapper.register('other-module', path, fn, 'WRAPPER'),
      registrations: mock.registrations};
  }]];
  if (real) {
    list.push(['real libWrapper 1.13.5.1', () => ({libWrapper: real.libWrapper,
      register: (path, fn) => real.libWrapper.register('other-module', path, fn, 'WRAPPER')})]);
    // FAST mode switches the whole wrapper to static dispatch.
    list.push(['real libWrapper 1.13.5.1 FAST', () => ({libWrapper: real.libWrapper,
      register: (path, fn) => real.libWrapper.register('other-module', path, fn, 'WRAPPER', {perf_mode: 'FAST'})})]);
  }
  return list;
}

function target() {
  const name = `LaneTarget${++counter}`;
  class Base { m(x) { return `base(${this.tag}:${x})`; } async later(x) { await null; return `later(${this.tag}:${x})`; } }
  class Sub extends Base { m(x) { return `sub(${super.m(x)})`; } }
  globalThis[name] = {Base, Sub};
  return {name, Base, Sub, receiver: Object.assign(new Sub(), {tag: 'r'})};
}

test('managedMethod recognises only a libWrapper method accessor owned by the object', () => {
  const {libWrapper} = createMockLibWrapper();
  const {name, Base, Sub} = target();
  assert.equal(managedMethod(Sub.prototype, 'm'), null);
  Object.defineProperty(Base, 'plain', {get() { return () => {}; }, configurable: false});
  assert.equal(managedMethod(Base, 'plain'), null);
  libWrapper.register('other-module', `${name}.Base.prototype.m`, function (next, x) { return next(x); }, 'WRAPPER');
  assert.equal(managedMethod(Sub.prototype, 'm'), null, 'an inherited wrapper is not the subclass own method');
  const wrapper = managedMethod(Base.prototype, 'm');
  assert.equal(wrapper?.fn_name, 'm');
  assert.equal(wrapper.object, Base.prototype);
});

for (const [label, create] of environments()) {
  test(`${label}: an Extra subscriber joins outside the existing chain and leaves it intact`, () => {
    const env = create();
    const {name, Sub, receiver} = target();
    env.register(`${name}.Sub.prototype.m`, function (next, x) { return `other[${next(x)}]`; });
    const undo = subscribeManagedMethod(Sub.prototype, 'm', function (next, x) {
      assert.equal(this, receiver);
      return `extra[${next(x + 1)}]`;
    }, {libWrapper: env.libWrapper});
    assert.equal(receiver.m(1), 'extra[other[sub(base(r:2))]]');
    undo();
    undo();
    assert.equal(receiver.m(1), 'other[sub(base(r:1))]');
  });

  test(`${label}: Extra consumers of one wrapper share one registration, later ones outer`, () => {
    const env = create();
    const {name, Sub, receiver} = target();
    env.register(`${name}.Sub.prototype.m`, function (next, x) { return `other[${next(x)}]`; });
    const first = subscribeManagedMethod(Sub.prototype, 'm', function (next, x) { return `a[${next(x)}]`; }, {libWrapper: env.libWrapper});
    const second = subscribeManagedMethod(Sub.prototype, 'm', function (next, x) { return `b[${next(x)}]`; }, {libWrapper: env.libWrapper});
    assert.equal(receiver.m(0), 'b[a[other[sub(base(r:0))]]]');
    if (env.registrations) assert.deepEqual(env.registrations().filter(entry => entry.endsWith(':m')).sort(),
      ['other-module:m', 'pf2e-compendium-extra-cn:m']);
    first();
    assert.equal(receiver.m(0), 'b[other[sub(base(r:0))]]');
    second();
    assert.equal(receiver.m(0), 'other[sub(base(r:0))]');
    // After the lane is empty a later consumer registers again.
    const third = subscribeManagedMethod(Sub.prototype, 'm', function (next, x) { return `c[${next(x)}]`; }, {libWrapper: env.libWrapper});
    assert.equal(receiver.m(0), 'c[other[sub(base(r:0))]]');
    third();
  });

  test(`${label}: interleaved async calls keep their own chain`, async () => {
    const env = create();
    const {name, Base} = target();
    env.register(`${name}.Base.prototype.later`, async function (next, x) { return `other[${await next(x)}]`; });
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    const undo = subscribeManagedMethod(Base.prototype, 'later', async function (next, x) {
      const first = next(x);
      if (x === 'slow') await gate;
      const value = await first;
      // A second downstream call after an await is legal before this call settles.
      return x === 'slow' ? `extra[${value}|${await next('again')}]` : `extra[${value}]`;
    }, {libWrapper: env.libWrapper});
    const a = Object.assign(new Base(), {tag: 'a'}), b = Object.assign(new Base(), {tag: 'b'});
    const slow = a.later('slow');
    const fast = await b.later('fast');
    release();
    assert.equal(fast, 'extra[other[later(b:fast)]]');
    assert.equal(await slow, 'extra[other[later(a:slow)]|other[later(a:again)]]');
    undo();
  });

  test(`${label}: a subscriber that skips next is removed and the call continues down the chain`, t => {
    const env = create();
    const {name, Sub, receiver} = target();
    env.register(`${name}.Sub.prototype.m`, function (next, x) { return `other[${next(x)}]`; });
    const errors = [];
    t.mock.method(console, 'error', (...args) => errors.push(args.join(' ')));
    const inner = subscribeManagedMethod(Sub.prototype, 'm', function (next, x) { return `in[${next(x)}]`; }, {libWrapper: env.libWrapper});
    const broken = subscribeManagedMethod(Sub.prototype, 'm', function (next, x) {
      return x === 'skip' ? 'short-circuit' : `bad[${next(x)}]`;
    }, {libWrapper: env.libWrapper});
    const outer = subscribeManagedMethod(Sub.prototype, 'm', function (next, x) { return `out[${next(x)}]`; }, {libWrapper: env.libWrapper});
    assert.equal(receiver.m(1), 'out[bad[in[other[sub(base(r:1))]]]]');
    // Its short-circuit is ignored, the same as libWrapper does for a WRAPPER.
    assert.equal(receiver.m('skip'), 'out[in[other[sub(base(r:skip))]]]');
    assert.equal(errors.filter(message => message.includes('did not call the native m')).length, 1, errors.join(' | '));
    assert.equal(receiver.m(2), 'out[in[other[sub(base(r:2))]]]', 'the other Extra subscribers keep running');
    if (env.registrations) assert.ok(env.registrations().includes('pf2e-compendium-extra-cn:m'));
    broken();
    inner();
    assert.equal(receiver.m(3), 'out[other[sub(base(r:3))]]');
    outer();
    assert.equal(receiver.m(4), 'other[sub(base(r:4))]');
    const fresh = subscribeManagedMethod(Sub.prototype, 'm', function (next, x) { return `ok[${next(x)}]`; }, {libWrapper: env.libWrapper});
    assert.equal(receiver.m(5), 'ok[other[sub(base(r:5))]]');
    fresh();
  });

  test(`${label}: an async subscriber that resolves without next is removed after it resolves`, async t => {
    const env = create();
    const {name, Base} = target();
    env.register(`${name}.Base.prototype.later`, async function (next, x) { return `other[${await next(x)}]`; });
    const errors = [];
    t.mock.method(console, 'error', (...args) => errors.push(args.join(' ')));
    const broken = subscribeManagedMethod(Base.prototype, 'later', async function (next, x) {
      await null;
      return x === 'skip' ? 'short-circuit' : `bad[${await next(x)}]`;
    }, {libWrapper: env.libWrapper});
    const receiver = Object.assign(new Base(), {tag: 'a'});
    assert.equal(await receiver.later(1), 'bad[other[later(a:1)]]');
    assert.equal(await receiver.later('skip'), 'other[later(a:skip)]');
    assert.equal(errors.filter(message => message.includes('did not call the native later')).length, 1, errors.join(' | '));
    assert.equal(await receiver.later(2), 'other[later(a:2)]');
    broken();
    assert.equal(await receiver.later(3), 'other[later(a:3)]');
  });

  test(`${label}: the original source is read through libWrapper's own toString`, () => {
    const env = create();
    const {name, Sub} = target();
    assert.equal(managedOriginalSource(Sub.prototype, 'm'), null);
    env.register(`${name}.Sub.prototype.m`, function (next, x) { return next(x); });
    const source = managedOriginalSource(Sub.prototype, 'm');
    assert.match(source, /super\.m\(x\)/);
    assert.doesNotMatch(source, /WARNING/);
  });

  test(`${label}: a throwing subscriber leaves the lane usable`, () => {
    const env = create();
    const {name, Sub, receiver} = target();
    env.register(`${name}.Sub.prototype.m`, function (next, x) { return `other[${next(x)}]`; });
    const undo = subscribeManagedMethod(Sub.prototype, 'm', function (next, x) {
      if (x === 'boom') throw new Error('boom');
      return `extra[${next(x)}]`;
    }, {libWrapper: env.libWrapper});
    assert.throws(() => receiver.m('boom'), /boom/);
    assert.equal(receiver.m(1), 'extra[other[sub(base(r:1))]]');
    undo();
  });
}

test('the same body cannot subscribe twice, and a failed registration leaves no lane', () => {
  const mock = createMockLibWrapper();
  const {name, Sub, receiver} = target();
  mock.libWrapper.register('other-module', `${name}.Sub.prototype.m`, function (next, x) { return next(x); }, 'WRAPPER');
  const body = function (next, x) { return `extra[${next(x)}]`; };
  const undo = subscribeManagedMethod(Sub.prototype, 'm', body, {libWrapper: mock.libWrapper});
  assert.throws(() => subscribeManagedMethod(Sub.prototype, 'm', body, {libWrapper: mock.libWrapper}), /Duplicate/);
  assert.equal(receiver.m(1), 'extra[sub(base(r:1))]');
  undo();
  const wrong = {register: () => 999, unregister: (...args) => mock.log.push(['wrong-unregister', ...args])};
  assert.throws(() => subscribeManagedMethod(Sub.prototype, 'm', body, {libWrapper: wrong}), /unexpected target/);
  assert.deepEqual(mock.log.at(-1), ['wrong-unregister', 'pf2e-compendium-extra-cn', 999, false]);
  assert.throws(() => subscribeManagedMethod(Sub.prototype, 'm', body, {libWrapper: {}}), /unavailable/);
  assert.throws(() => subscribeManagedMethod(Sub.prototype, 'other', body, {libWrapper: mock.libWrapper}), /unavailable/);
  // The lane was not left behind by the failed attempts.
  const again = subscribeManagedMethod(Sub.prototype, 'm', body, {libWrapper: mock.libWrapper});
  assert.equal(receiver.m(2), 'extra[sub(base(r:2))]');
  again();
});

test('real libWrapper run was requested', {skip: !REAL && 'set EXTRA_TEST_LIBWRAPPER to lib-wrapper.js 1.13.5.1'}, () => {
  assert.equal(real.libWrapper.version, '1.13.5.1');
  // Function.prototype.toString shows libWrapper's handler, not the original:
  // a guard must use the handler's own toString (managedOriginalSource).
  const {name, Sub} = target();
  real.libWrapper.register('other-module', `${name}.Sub.prototype.m`, function (next, x) { return next(x); }, 'WRAPPER');
  assert.doesNotMatch(Function.prototype.toString.call(Sub.prototype.m), /super\.m\(x\)/);
  assert.match(managedOriginalSource(Sub.prototype, 'm'), /super\.m\(x\)/);
});
