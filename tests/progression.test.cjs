const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./helpers.cjs');
const p = load('utils/progression.js');
const { SLOVIC_LOOP_BANDS: bands } = load('data/defaultBands.js');

const set = (reps, bandIds, rir) => ({ setNumber: 1, reps, bandIds, totalResistanceLbs: 30, completed: true, rir });
const base = { targetReps: 12, ownedBands: bands, usesBand: true, isAssisted: false, isTimed: false };

test('rep range around the target', () => {
  assert.deepEqual(p.repRange(12), { low: 10, high: 16 });
});

test('first time: light-middle band and the target', () => {
  const s = p.suggestNext({ ...base, previous: null });
  assert.equal(s.kind, 'first-time');
  assert.deepEqual(s.bandIds, ['slovic-loop-red']);
});

test('top of range near failure: step up a band', () => {
  const prev = { date: '2026-11-20', sets: [set(16, ['slovic-loop-red'], 2), set(16, ['slovic-loop-red'], 0)] };
  const s = p.suggestNext({ ...base, previous: prev });
  assert.equal(s.kind, 'step-up');
  assert.deepEqual(s.bandIds, ['slovic-loop-blue']);
  assert.equal(s.reps, 10);
});

test('top of range but easy (3+ in the tank): still step up only when near failure', () => {
  const prev = { date: '2026-11-20', sets: [set(16, ['slovic-loop-red'], 3)] };
  const s = p.suggestNext({ ...base, previous: prev });
  assert.notEqual(s.kind, 'step-up');
});

test('assisted moves step down to a lighter band', () => {
  const prev = { date: '2026-11-20', sets: [set(16, ['slovic-loop-blue'], 1)] };
  const s = p.suggestNext({ ...base, isAssisted: true, previous: prev });
  assert.equal(s.kind, 'step-up');
  assert.deepEqual(s.bandIds, ['slovic-loop-red']);
});

test('heaviest band: stack another band on top', () => {
  const prev = { date: '2026-11-20', sets: [set(16, ['slovic-loop-orange'], 1)] };
  const s = p.suggestNext({ ...base, previous: prev });
  assert.equal(s.kind, 'step-up');
  assert.equal(s.bandIds.length, 2);
});

test('below target: repeat the setup', () => {
  const prev = { date: '2026-11-20', sets: [set(9, ['slovic-loop-red'])] };
  assert.equal(p.suggestNext({ ...base, previous: prev }).kind, 'repeat');
});

test('previous performance is the newest log with that exercise', () => {
  const logs = [
    { id: '1', date: '2026-11-01T10:00:00Z', exercises: [{ exerciseId: 'x', sets: [set(8, [])] }] },
    { id: '2', date: '2026-11-10T10:00:00Z', exercises: [{ exerciseId: 'x', sets: [set(11, [])] }] },
  ];
  assert.equal(p.getPreviousPerformance(logs, 'x').sets[0].reps, 11);
});

test('less assistance scores higher', () => {
  assert.ok(p.setScore({ reps: 8, totalResistanceLbs: 0, assistanceLbs: 20 }) > p.setScore({ reps: 8, totalResistanceLbs: 0, assistanceLbs: 50 }));
});

test('deload after six straight training weeks', () => {
  const now = new Date('2026-11-21T12:00:00');
  const logs = Array.from({ length: 6 }, (_, i) => ({ id: String(i), date: new Date(now.getTime() - i * 7 * 864e5).toISOString(), exercises: [] }));
  assert.equal(p.shouldSuggestDeload(logs, now), true);
  assert.equal(p.shouldSuggestDeload(logs.slice(0, 5), now), false);
});
