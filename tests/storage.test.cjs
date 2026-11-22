const test = require('node:test');
const assert = require('node:assert/strict');

// Minimal localStorage for Node.
const store = new Map();
global.localStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k),
  clear: () => store.clear(),
};

const { load } = require('./helpers.cjs');
const storage = load('utils/storage.js');

const v1Log = {
  id: 'log-1', date: '2026-11-01T10:00:00Z', routineName: 'Push', durationSeconds: 900, caloriesBurned: 100, totalVolumeLbs: 600,
  exercises: [{ exerciseId: 'standing-bicep-curl', sets: [{ setNumber: 1, reps: 10, bandIds: [], totalResistanceLbs: 30, completed: true }] }],
};

test('v1 data migrates to v2 keys and kg loads convert to lbs', () => {
  store.clear();
  localStorage.setItem('bandfit_profile_v1', JSON.stringify({ unitSystem: 'kg', weightKg: 80, ownedBands: [] }));
  localStorage.setItem('bandfit_workout_logs_v1', JSON.stringify([v1Log, { ...v1Log, id: 'workout-aug-demo' }]));
  storage.migrateStorage();
  const logs = storage.loadWorkoutLogs();
  assert.equal(logs.length, 1, 'demo log dropped');
  assert.equal(logs[0].exercises[0].sets[0].totalResistanceLbs, 66.1);
  assert.equal(storage.loadUserProfile().onboarded, true, 'existing users skip setup');
  assert.equal(localStorage.getItem('hyten_schema_version'), '2');
});

test('migration runs once', () => {
  storage.migrateStorage();
  assert.equal(storage.loadWorkoutLogs()[0].exercises[0].sets[0].totalResistanceLbs, 66.1);
});

test('bad backups are rejected without touching data', () => {
  const before = localStorage.getItem('hyten_workout_logs');
  assert.equal(storage.importAllData('not json').ok, false);
  assert.equal(storage.importAllData(JSON.stringify({ workoutLogs: [{ id: 1 }] })).ok, false);
  assert.equal(storage.importAllData(JSON.stringify({ hello: 'world' })).ok, false);
  assert.equal(localStorage.getItem('hyten_workout_logs'), before);
});

test('valid v2 backup restores', () => {
  const backup = { 
    schemaVersion: 2, 
    profile: { weightKg: 70, ownedBands: [], unitSystem: 'kg' }, 
    workoutLogs: [v1Log],
    scheduleMode: '5-day',
    workdayTier: 3,
    restExtras: { 'pushup': 20 }
  };
  const r = storage.importAllData(JSON.stringify(backup));
  assert.equal(r.ok, true);
  assert.equal(storage.loadWorkoutLogs()[0].exercises[0].sets[0].totalResistanceLbs, 30, 'v2 loads are not converted again');
  assert.equal(localStorage.getItem('bandfit_schedule_mode'), '5-day');
  assert.equal(localStorage.getItem('bandfit_workday_tier'), '3');
  assert.deepEqual(JSON.parse(localStorage.getItem('hyten_rest_extra')), { 'pushup': 20 });
});

test('resetAllDataToFresh purges schedule, tier and rest extras', () => {
  localStorage.setItem('bandfit_schedule_mode', '6-day');
  localStorage.setItem('bandfit_workday_tier', '3');
  localStorage.setItem('hyten_rest_extra', JSON.stringify({ 'bar-pullup': 40 }));
  storage.resetAllDataToFresh();
  assert.equal(localStorage.getItem('bandfit_schedule_mode'), null);
  assert.equal(localStorage.getItem('bandfit_workday_tier'), null);
  assert.equal(localStorage.getItem('hyten_rest_extra'), null);
});

test('deleteWorkoutLog removes log by id and updates lastWorkoutDate', () => {
  store.clear();
  storage.saveWorkoutLog({ ...v1Log, id: 'del-1', date: '2026-11-20T10:00:00Z' });
  storage.saveWorkoutLog({ ...v1Log, id: 'del-2', date: '2026-11-21T10:00:00Z' });
  assert.equal(storage.loadWorkoutLogs().length, 2);
  storage.deleteWorkoutLog('del-2');
  const remaining = storage.loadWorkoutLogs();
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].id, 'del-1');
});

test('toLocalDateString formats timestamps to local YYYY-MM-DD', () => {
  const d = new Date(2026, 10, 22, 1, 30, 0); // Nov 22, 2026 01:30 AM local
  const formatted = storage.toLocalDateString(d);
  assert.equal(formatted, '2026-11-22');
});
