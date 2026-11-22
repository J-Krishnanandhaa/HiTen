import type { RoutineExercise } from '../types';
import type { LeapRoutine } from './prebuiltWorkouts';

/**
 * Programming fixes applied on top of the hand-written base routines.
 *
 * 1. Calf work on every legs and full-body day (it was 0–3 sets a week).
 * 2. Plank shoulder taps (in 23 routines) replaced outside core days by a move
 *    for the day's actual target, cutting excess shoulder/core volume.
 * 3. No-equipment pull days get real horizontal pulling.
 * 4. New routines for the 5-day split (Upper, Lower) and the 6-day split
 *    (Push B, Pull B, Legs B), so each split is what its label says.
 */

type Mode = NonNullable<LeapRoutine['equipmentCategory']>;
type Tier = 1 | 2 | 3;

const PREFIX: Record<Mode, string> = { hybrid: 'hybrid', 'bands-only': 'bands', 'bar-only': 'bar', 'no-equipment': 'ne' };
const MODE_LABEL: Record<Mode, string> = { hybrid: 'Hybrid', 'bands-only': 'Bands', 'bar-only': 'Bar', 'no-equipment': 'Bodyweight' };
const CALF_IDS = new Set(['tube-calf-raise', 'bodyweight-standing-calf-raise', 'bodyweight-single-leg-calf-raise']);
const usesBands = (m: Mode) => m === 'hybrid' || m === 'bands-only';

const TAP_REPLACEMENT: Record<string, Partial<Record<Mode, string>> & { default: string }> = {
  Push: { default: 'bodyweight-bench-dip', hybrid: 'band-tricep-kickback', 'bands-only': 'band-tricep-kickback' },
  Pull: { default: 'bodyweight-doorframe-row' },
  Legs: { default: 'bodyweight-side-lunge' },
  'Full Body Flow': { default: 'bodyweight-doorframe-row' },
  '7x4 Challenge': { default: 'bodyweight-doorframe-row' },
};

function calfFor(mode: Mode): RoutineExercise {
  return usesBands(mode)
    ? { exerciseId: 'tube-calf-raise', sets: 3, targetReps: 16, targetRestSeconds: 30, notes: 'Calves: full stretch, 1 s squeeze' }
    : { exerciseId: 'bodyweight-single-leg-calf-raise', sets: 3, targetReps: 12, targetRestSeconds: 30, notes: 'Calves: each leg, full stretch' };
}

function fixBase(r: LeapRoutine): LeapRoutine {
  const mode = r.equipmentCategory as Mode;
  const cat = r.category || '';
  let exercises = r.exercises.map(e => ({ ...e }));

  if (cat !== 'Core' && TAP_REPLACEMENT[cat]) {
    const rep = TAP_REPLACEMENT[cat][mode] || TAP_REPLACEMENT[cat].default;
    exercises = exercises.map(e => (e.exerciseId === 'bodyweight-plank-shoulder-taps' ? { ...e, exerciseId: rep, notes: e.notes } : e));
  }

  if (mode === 'no-equipment' && cat === 'Pull') {
    // Supermans were the only "pull". Swap the glute bridge for a real row.
    exercises = exercises.map(e => (e.exerciseId === 'bodyweight-glute-bridge' ? { ...e, exerciseId: 'bodyweight-table-row', targetReps: 10 } : e));
  }

  if ((mode === 'no-equipment' || mode === 'bar-only') && cat === 'Legs') {
    // Bodyweight legs had no hamstring work: swap the glute bridge for slider curls.
    exercises = exercises.map(e =>
      e.exerciseId === 'bodyweight-glute-bridge' ? { ...e, exerciseId: 'bodyweight-slider-leg-curl', targetReps: Math.min(e.targetReps, 12) } : e
    );
  }

  if ((cat === 'Legs' || cat === 'Full Body Flow') && !exercises.some(e => CALF_IDS.has(e.exerciseId))) {
    exercises.push(calfFor(mode));
  }

  return { ...r, exercises };
}

const pick = (r: LeapRoutine | undefined, i: number) => (r && r.exercises[i] ? { ...r.exercises[i] } : undefined);

function withRest(list: (RoutineExercise | undefined)[]): RoutineExercise[] {
  // Re-apply the A1/A2 pattern: short transition after the first of each pair.
  const clean = list.filter((e): e is RoutineExercise => !!e);
  return clean.map((e, i) => ({ ...e, targetRestSeconds: i % 2 === 0 && i + 1 < clean.length ? 10 : Math.max(30, e.targetRestSeconds) }));
}

/** Higher-rep version of a day with the pair order rotated (C, A, B). */
function rotateHigherReps(base: LeapRoutine): RoutineExercise[] {
  const ex = base.exercises.filter(e => !CALF_IDS.has(e.exerciseId));
  const pairs: RoutineExercise[][] = [];
  for (let i = 0; i < ex.length; i += 2) pairs.push(ex.slice(i, i + 2));
  const rotated = pairs.length > 1 ? [pairs[pairs.length - 1], ...pairs.slice(0, -1)] : pairs;
  return withRest(
    rotated.flat().map(e => ({
      ...e,
      targetReps: e.targetReps >= 30 ? e.targetReps : Math.min(25, e.targetReps + 4),
      notes: 'Higher-rep day: same moves, closer to failure',
    }))
  );
}

function makeVariants(base: LeapRoutine[], mode: Mode, tier: Tier): LeapRoutine[] {
  const p = PREFIX[mode];
  const get = (day: string) => base.find(r => r.id === `routine-${p}-${day}-${tier}`);
  const push = get('push'), pull = get('pull'), legs = get('legs'), core = get('core');
  if (!push || !pull || !legs || !core) return [];
  const label = MODE_LABEL[mode];
  const common = { equipmentCategory: mode, tier, estimatedDurationMins: 20 } as const;

  const upper: LeapRoutine = {
    ...common,
    id: `routine-${p}-upper-${tier}`,
    name: `${label} Upper (Push/Pull Supersets)`,
    category: 'Upper',
    description: 'Antagonist supersets: each push paired with a pull for chest, back, shoulders and arms.',
    exercises: withRest([pick(push, 0), pick(pull, 0), pick(push, 2), pick(pull, 2), pick(push, 4), pick(pull, 4)]),
  };

  const lower: LeapRoutine = {
    ...common,
    id: `routine-${p}-lower-${tier}`,
    name: `${label} Lower & Core`,
    category: 'Lower',
    description: 'Quads, hamstrings and glutes, finished with core and calves.',
    exercises: (() => {
      const main = withRest([pick(legs, 0), pick(legs, 1), pick(legs, 2), pick(legs, 3), pick(core, 0), pick(core, 1)]);
      return main.some(e => CALF_IDS.has(e.exerciseId)) ? main : [...main, calfFor(mode)];
    })(),
  };

  const pushB: LeapRoutine = {
    ...common,
    id: `routine-${p}-pushb-${tier}`,
    name: `${label} Push B (Higher Reps)`,
    category: 'Push',
    description: 'Second push day of the week: pairs rotated and reps raised for a different stimulus.',
    exercises: rotateHigherReps(push).map(e =>
      mode === 'hybrid' && e.exerciseId === 'overhead-tricep-extension' ? { ...e, exerciseId: 'bar-band-tricep-pushdown' }
        : usesBands(mode) && e.exerciseId === 'lateral-deltoid-raise' ? { ...e, exerciseId: 'front-raise-band' }
        : e
    ),
  };

  const pullB: LeapRoutine = {
    ...common,
    id: `routine-${p}-pullb-${tier}`,
    name: `${label} Pull B (Higher Reps)`,
    category: 'Pull',
    description: 'Second pull day of the week: pairs rotated and reps raised for a different stimulus.',
    exercises: rotateHigherReps(pull),
  };

  const legsB: LeapRoutine = {
    ...common,
    id: `routine-${p}-legsb-${tier}`,
    name: `${label} Legs B + Core`,
    category: 'Legs',
    description: 'Second legs day: new squat and single-leg variations, hamstrings, then core and calves.',
    exercises: [
      ...withRest(
        usesBands(mode)
          ? [
              { exerciseId: 'band-overhead-squat', sets: 3, targetReps: 12, targetRestSeconds: 10 },
              pick(legs, 3),
              { exerciseId: 'band-single-leg-rdl', sets: 3, targetReps: 10, targetRestSeconds: 10, notes: 'Each leg' },
              { exerciseId: 'band-lying-leg-curl', sets: 3, targetReps: 14, targetRestSeconds: 30 },
              pick(core, 2),
              pick(core, 3),
            ]
          : [
              { exerciseId: 'bodyweight-bulgarian-split-squat', sets: 3, targetReps: 10, targetRestSeconds: 10, notes: 'Each leg' },
              { exerciseId: 'bodyweight-nordic-negative', sets: 3, targetReps: 5, targetRestSeconds: 10, notes: 'Lower over 5 s' },
              { exerciseId: 'bodyweight-step-up', sets: 3, targetReps: 12, targetRestSeconds: 10, notes: 'Each leg' },
              { exerciseId: 'bodyweight-side-lunge', sets: 3, targetReps: 12, targetRestSeconds: 30 },
              pick(core, 2),
              pick(core, 3),
            ]
      ),
      calfFor(mode),
    ],
  };

  return [upper, lower, pushB, pullB, legsB];
}

export function expandRoutines(base: LeapRoutine[]): LeapRoutine[] {
  const fixed = base.map(fixBase);
  const extra: LeapRoutine[] = [];
  (['hybrid', 'bands-only', 'bar-only', 'no-equipment'] as Mode[]).forEach(mode => {
    ([1, 2, 3] as Tier[]).forEach(tier => extra.push(...makeVariants(fixed, mode, tier)));
  });
  return [...fixed, ...extra];
}
