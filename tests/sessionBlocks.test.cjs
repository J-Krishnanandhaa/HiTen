const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./helpers.cjs');
const b = load('data/sessionBlocks.js');
const x = load('data/extraExercises.js');
const db = load('data/exerciseDatabase.js');

test('pull days warm up the shoulders with bar work when a bar is available', () => {
  const withBar = b.resolveMoves(b.WARMUPS[b.focusFor('Pull')], { bands: true, bar: true }).map(m => m.name);
  assert.ok(withBar.includes('Scapular pulls') && withBar.includes('Active dead hang'));
  const noGear = b.resolveMoves(b.WARMUPS.pull, { bands: false, bar: false }).map(m => m.name);
  assert.ok(noGear.includes('Towel dislocates') && !noGear.includes('Active dead hang'));
});

test('warm-ups and cool-down run about three minutes', () => {
  for (const moves of [...Object.values(b.WARMUPS), b.COOLDOWN]) {
    const s = b.blockSeconds(moves);
    assert.ok(s >= 150 && s <= 210, `${s}s`);
  }
});

test('finishers use known exercises for every equipment mode', () => {
  for (const mode of ['hybrid', 'bands-only', 'bar-only', 'no-equipment']) {
    for (const f of b.finishersFor(mode)) for (const m of f.moves) assert.ok(db.getExerciseById(m.exerciseId), `${mode}: ${m.exerciseId}`);
  }
});

test('tempo defaults and descriptions', () => {
  assert.equal(db.getExerciseById('chris-heria-deadlift').tempo, '3-1-1');
  assert.equal(db.getExerciseById('standing-bicep-curl').tempo, '2-1-2');
  assert.equal(db.getExerciseById('bodyweight-jump-squats').tempo, 'X');
  assert.equal(db.getExerciseById('bar-dead-hang').tempo, undefined);
  assert.equal(x.describeTempo('3-1-1'), '3 s down · 1 s pause · 1 s up');
});
