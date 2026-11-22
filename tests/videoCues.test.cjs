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

test('THENX cues sit on the video\'s own chapter markers', () => {
  assert.equal(db.getExerciseYoutubeUrl('bar-pullup-assisted'), 'https://youtu.be/hQ2lHMP4kco?t=290');
  assert.equal(db.getExerciseTimestampLabel('bar-band-front-lever-raise'), '07:40');
});

test('every exercise has an exact clip: no estimated or near-miss timestamps', () => {
  for (const e of db.EXERCISE_DATABASE) {
    const c = db.EXERCISE_VIDEO_CUES[e.id];
    assert.ok(c, `${e.id} has no clip`);
    assert.equal(c.match, 'exact', `${e.id} is only a ${c.match} match`);
    assert.ok(c.source === 'thenx' || c.source.startsWith('tut_'), `${e.id} uses ${c.source}`);
    assert.match(e.youtubeUrl, /\?t=\d+$/);
  }
  const ids = Object.values(db.VIDEO_SOURCES).map(s => s.id);
  assert.equal(new Set(ids).size, ids.length - 0, 'a video is listed twice');
});

test('ladders link both ways', () => {
  for (const e of db.EXERCISE_DATABASE) {
    if (e.harderId) assert.ok(db.getExerciseById(e.harderId), `${e.id} -> missing ${e.harderId}`);
    if (e.easierId) assert.ok(db.getExerciseById(e.easierId), `${e.id} -> missing ${e.easierId}`);
  }
  assert.equal(db.getExerciseById('bodyweight-pushup-standard').harderId, 'chest-pushup-banded');
});

test('tutorial clips start at the beginning', () => {
  assert.equal(db.getExerciseYoutubeUrl('bar-pullup-strict'), 'https://youtu.be/eGo4IYlbE5g?t=0');
});
