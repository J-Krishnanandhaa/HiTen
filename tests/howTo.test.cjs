const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./helpers.cjs');
const db = load('data/exerciseDatabase.js');
const { HOW_TO } = load('data/howTo.js');

test('every exercise has complete written instructions', () => {
  for (const e of db.EXERCISE_DATABASE) {
    const h = HOW_TO[e.id];
    assert.ok(h, `${e.id} has no how-to`);
    assert.ok(h.setup.length >= 60, `${e.id}: setup too short`);
    assert.ok(h.steps.length >= 4, `${e.id}: needs at least 4 steps`);
    assert.ok(h.breathe && h.feel, `${e.id}: breathing and feel cues`);
  }
});

test('core days open with a forearm plank', () => {
  const r = load('data/prebuiltWorkouts.js');
  const all = (r.PREBUILT_ROUTINES || []).filter(x => x.category === 'Core');
  assert.ok(all.length > 0);
  for (const x of all) assert.equal(x.exercises[0].exerciseId, 'bodyweight-plank', x.id);
});
