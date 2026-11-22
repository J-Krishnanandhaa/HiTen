const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./helpers.cjs');
const db = load('data/exerciseDatabase.js');

test('every video cue points at a real exercise and inside its video', () => {
  const ids = new Set(db.EXERCISE_DATABASE.map(e => e.id));
  for (const [id, cue] of Object.entries(db.EXERCISE_VIDEO_CUES)) {
    assert.ok(ids.has(id), `cue for unknown exercise ${id}`);
    const src = db.VIDEO_SOURCES[cue.source];
    assert.ok(src, `unknown source ${cue.source}`);
    assert.ok(cue.start >= 0 && cue.start < src.lengthSec, `${id} starts at ${cue.start}s, video is ${src.lengthSec}s`);
    assert.ok(['exact', 'close', 'variant'].includes(cue.match));
  }
});

test('known verified timestamps', () => {
  assert.equal(db.getExerciseYoutubeUrl('band-thruster'), 'https://youtu.be/sTueHjRCMaQ?t=34');
  assert.equal(db.getExerciseTimestampLabel('bodyweight-full-burpees'), '37:30');
  assert.equal(db.getExerciseTimestampLabel('chest-fly-middle'), '00:46');
});

test('exercises without a clip fall back to a search, never a bare video', () => {
  const url = db.getExerciseYoutubeUrl('behind-back-bicep-curl', 'Behind-the-Back Bicep Curl');
  assert.match(url, /^https:\/\/www\.youtube\.com\/results\?search_query=/);
  for (const e of db.EXERCISE_DATABASE) {
    assert.ok(/\?t=\d+$/.test(e.youtubeUrl) || e.youtubeUrl.includes('/results?'), `${e.id}: ${e.youtubeUrl}`);
  }
});

test('ladders link both ways', () => {
  for (const e of db.EXERCISE_DATABASE) {
    if (e.harderId) assert.ok(db.getExerciseById(e.harderId), `${e.id} -> missing ${e.harderId}`);
    if (e.easierId) assert.ok(db.getExerciseById(e.easierId), `${e.id} -> missing ${e.easierId}`);
  }
  assert.equal(db.getExerciseById('bodyweight-pushup-standard').harderId, 'chest-pushup-banded');
});

test('tutorial clips start at the beginning and almost every exercise has a clip', () => {
  assert.equal(db.getExerciseYoutubeUrl('bar-pullup-strict'), 'https://youtu.be/eGo4IYlbE5g?t=0');
  const without = db.EXERCISE_DATABASE.filter(e => !db.EXERCISE_VIDEO_CUES[e.id]);
  assert.ok(without.length <= 1, `exercises without a clip: ${without.map(e => e.id).join(', ')}`);
});
