const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./helpers.cjs');
const { computeWeeklyStreak } = load('utils/streak.js');
const bands = load('utils/bands.js');
const nm = load('utils/nutritionMath.js');
const { SLOVIC_LOOP_BANDS } = load('data/defaultBands.js');

const at = d => ({ id: d, date: new Date(d).toISOString(), exercises: [] });

test('streak counts weeks that hit the goal and resets after a missed week', () => {
  const now = new Date('2026-11-21T12:00:00'); // Saturday
  const logs = [
    // this week: 2 so far (goal 3) -> not counted yet, not broken
    at('2026-11-17T09:00:00'), at('2026-11-19T09:00:00'),
    // last week: 3
    at('2026-11-10T09:00:00'), at('2026-11-12T09:00:00'), at('2026-11-14T09:00:00'),
    // two weeks ago: 3
    at('2026-11-03T09:00:00'), at('2026-11-05T09:00:00'), at('2026-11-07T09:00:00'),
    // three weeks ago: 1 (missed) ; four weeks ago: 3 (should not count)
    at('2026-10-27T09:00:00'),
    at('2026-10-20T09:00:00'), at('2026-10-22T09:00:00'), at('2026-10-24T09:00:00'),
  ];
  const s = computeWeeklyStreak(logs, 3, now);
  assert.equal(s.weeks, 2);
  assert.equal(s.thisWeek, 2);
});

test('band load uses the midpoint of the printed range', () => {
  const yellow = SLOVIC_LOOP_BANDS[0]; // 3-7 kg
  assert.equal(bands.bandLoadKg(yellow), 5);
  assert.equal(bands.toDisplay(bands.stackLoadLbs(['slovic-loop-yellow', 'slovic-loop-red'], SLOVIC_LOOP_BANDS), 'kg'), 16);
  assert.equal(bands.bandRangeLabel(yellow, 'kg'), '3–7 kg');
});

test('calories use the session type', () => {
  assert.equal(nm.sessionIntensityFor('Core'), 'core');
  assert.equal(nm.sessionIntensityFor('Full Body Flow'), 'circuit');
  assert.equal(nm.sessionIntensityFor('Push'), 'strength');
  assert.equal(nm.estimateWorkoutCalories(60, 70, 'strength'), 350);
});
