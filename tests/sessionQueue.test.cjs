const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./helpers.cjs');
const { buildSetQueue } = load('utils/sessionQueue.js');

const routine = {
  id: 'r', name: 'r', description: '', estimatedDurationMins: 20,
  exercises: [
    { exerciseId: 'a1', sets: 3, targetReps: 12, targetRestSeconds: 10 },
    { exerciseId: 'a2', sets: 3, targetReps: 12, targetRestSeconds: 25 },
    { exerciseId: 'solo', sets: 2, targetReps: 12, targetRestSeconds: 30 },
  ],
};

test('paired exercises alternate set by set', () => {
  const q = buildSetQueue(routine);
  assert.deepEqual(q.slice(0, 6).map(s => `${s.exIndex}:${s.setIndex}`), ['0:0', '1:0', '0:1', '1:1', '0:2', '1:2']);
  assert.equal(q[0].group, 'A');
  assert.equal(q[0].slot, 1);
  assert.equal(q[1].slot, 2);
});

test('short transition after A1, full rest after A2', () => {
  const q = buildSetQueue(routine);
  assert.equal(q[0].restAfter, 10);
  assert.equal(q[1].restAfter, 25);
});

test('straight sets rest at least 20 s and the last step has no rest', () => {
  const q = buildSetQueue(routine);
  const solo = q.filter(s => s.exIndex === 2);
  assert.equal(solo.length, 2);
  assert.equal(solo[0].restAfter, 30);
  assert.equal(q[q.length - 1].restAfter, 0);
});

test('compound lifts get extra rest after the pair', () => {
  const q = buildSetQueue(routine, id => id === 'a1');
  assert.equal(q[1].restAfter, 40);
});

test('every set of every exercise is queued once', () => {
  const q = buildSetQueue(routine);
  assert.equal(q.length, 3 + 3 + 2);
});
