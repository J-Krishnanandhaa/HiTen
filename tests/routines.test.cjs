const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./helpers.cjs');
const { PREBUILT_ROUTINES } = load('data/prebuiltWorkouts.js');
const db = load('data/exerciseDatabase.js');
const em = load('utils/equipmentManager.js');
const { scaleRoutineToDuration } = load('utils/routineScaler.js');

const byId = new Map(PREBUILT_ROUTINES.map(r => [r.id, r]));
const modes = ['hybrid', 'bands-only', 'bar-only', 'no-equipment'];
const CALVES = new Set(['tube-calf-raise', 'bodyweight-standing-calf-raise', 'bodyweight-single-leg-calf-raise']);

test('every routine uses known exercises', () => {
  for (const r of PREBUILT_ROUTINES) for (const e of r.exercises) assert.ok(db.getExerciseById(e.exerciseId), `${r.id}: ${e.exerciseId}`);
});

test('every scheduled day resolves to a routine', () => {
  for (const mode of modes) for (const sched of ['4-day', '5-day', '6-day']) {
    const map = em.getWorkdayTierRoutineMap(mode, sched);
    for (let d = 0; d < 7; d++) for (const t of [1, 2, 3]) {
      const id = map[d][t];
      if (id) assert.ok(byId.has(id), `${mode} ${sched} day ${d} tier ${t}: ${id}`);
    }
  }
});

test('5-day and 6-day splits are not copies of the 4-day split', () => {
  for (const mode of modes) {
    const four = Object.values(em.getWorkdayTierRoutineMap(mode, '4-day')).map(d => d[2]).filter(Boolean);
    const five = Object.values(em.getWorkdayTierRoutineMap(mode, '5-day')).map(d => d[2]).filter(Boolean);
    const six = Object.values(em.getWorkdayTierRoutineMap(mode, '6-day')).map(d => d[2]).filter(Boolean);
    assert.ok(five.some(id => !four.includes(id)), `${mode} 5-day adds new sessions`);
    assert.equal(new Set(six).size, six.length, `${mode} 6-day has no repeated routine`);
  }
});

test('legs and full-body days include calf work', () => {
  for (const r of PREBUILT_ROUTINES) {
    if (r.category === 'Legs' || r.category === 'Full Body Flow' || r.category === 'Lower') {
      assert.ok(r.exercises.some(e => CALVES.has(e.exerciseId)), `${r.id} has no calves`);
    }
  }
});

test('plank shoulder taps only remain where core work is planned', () => {
  // Core days, plus the core finishers on Lower and Legs B days.
  for (const r of PREBUILT_ROUTINES) {
    if (!['Core', 'Lower', 'Legs'].includes(r.category)) {
      assert.ok(!r.exercises.some(e => e.exerciseId === 'bodyweight-plank-shoulder-taps'), `${r.id}`);
    }
  }
});

test('no-equipment pull days include a real row', () => {
  for (const r of PREBUILT_ROUTINES.filter(r => r.equipmentCategory === 'no-equipment' && r.category === 'Pull')) {
    assert.ok(r.exercises.some(e => ['bodyweight-table-row', 'bodyweight-doorframe-row'].includes(e.exerciseId)), r.id);
  }
});

test('equipment substitution never leaves an incompatible exercise', () => {
  const profiles = [
    { hasResistanceBands: false, hasPullUpBar: false },
    { hasResistanceBands: true, hasPullUpBar: false },
    { hasResistanceBands: false, hasPullUpBar: true },
  ];
  for (const profile of profiles) {
    for (const r of PREBUILT_ROUTINES.filter(r => r.equipmentCategory === em.getEquipmentMode(profile))) {
      const scaled = scaleRoutineToDuration(r, 20, profile);
      for (const e of scaled.exercises) {
        const ex = db.getExerciseById(e.exerciseId);
        assert.ok(em.isExerciseCompatible(ex, profile), `${r.id}: ${e.exerciseId} needs gear`);
      }
    }
  }
});

test('bodyweight and bar leg days train hamstrings', () => {
  for (const r of PREBUILT_ROUTINES.filter(r => ['no-equipment', 'bar-only'].includes(r.equipmentCategory) && r.category === 'Legs')) {
    assert.ok(r.exercises.some(e => db.getExerciseById(e.exerciseId).targetMuscle === 'Hamstrings'), r.id);
  }
});
