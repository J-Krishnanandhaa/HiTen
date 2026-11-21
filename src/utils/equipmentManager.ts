import { Exercise, Routine, RoutineExercise, UserProfile } from '../types';
import { EXERCISE_DATABASE } from '../data/exerciseDatabase';
import { PREBUILT_ROUTINES, LeapRoutine } from '../data/prebuiltWorkouts';

export type EquipmentMode = 'hybrid' | 'bands-only' | 'bar-only' | 'no-equipment';

export interface EquipmentModeDetails {
  mode: EquipmentMode;
  title: string;
  badge: string;
  color: string;
  description: string;
  gearSummary: string;
}

export function getEquipmentMode(profile: { hasResistanceBands?: boolean; hasPullUpBar?: boolean }): EquipmentMode {
  const hasBands = profile.hasResistanceBands !== false;
  const hasBar = profile.hasPullUpBar !== false;

  if (hasBands && hasBar) return 'hybrid';
  if (hasBands && !hasBar) return 'bands-only';
  if (!hasBands && hasBar) return 'bar-only';
  return 'no-equipment';
}

export function getEquipmentModeDetails(mode: EquipmentMode): EquipmentModeDetails {
  switch (mode) {
    case 'hybrid':
      return {
        mode: 'hybrid',
        title: 'Full Hybrid System',
        badge: '✨ Bands + Bar + Bodyweight',
        color: '#2979FF',
        description: 'Every exercise and routine is unlocked.',
        gearSummary: 'Slovic Loop Bands + Door / Wall Pull-Up Bar',
      };
    case 'bands-only':
      return {
        mode: 'bands-only',
        title: 'Resistance Bands Kit Only',
        badge: '⚡ Bands & Floor Only',
        color: '#00E5FF',
        description: 'Bar-specific exercises are replaced with band & floor movements. No doorway bar needed.',
        gearSummary: 'Slovic Loop Bands (Door Anchor & Floor)',
      };
    case 'bar-only':
      return {
        mode: 'bar-only',
        title: 'Pull-Up Bar & Calisthenics',
        badge: '🏋️ Bar & Bodyweight Only',
        color: '#E53935',
        description: 'Bands are turned off. Strictly calisthenics pull-ups, hanging core, and Rowan Row bodyweight moves.',
        gearSummary: 'Pull-Up Bar + Bodyweight',
      };
    case 'no-equipment':
      return {
        mode: 'no-equipment',
        title: 'Zero Equipment (Rowan Row Bodyweight)',
        badge: '🔥 100% No Equipment',
        color: '#00E676',
        description: 'Zero gear needed! Powered by Rowan Row’s proven 45-min full body bodyweight calisthenics system.',
        gearSummary: 'Zero Gear • 100% Bodyweight & Gravity',
      };
  }
}

/**
 * Returns all prebuilt routines tailored specifically for the user's active equipment configuration.
 */
export function getRoutinesForEquipment(mode: EquipmentMode): LeapRoutine[] {
  return PREBUILT_ROUTINES.filter(r => r.equipmentCategory === mode);
}

/**
 * Returns the signature 7x4 challenge routine for the active equipment configuration.
 */
export function getChallengeRoutineForEquipment(mode: EquipmentMode): LeapRoutine {
  const routines = getRoutinesForEquipment(mode);
  return routines.find(r => r.category === '7x4 Challenge') || routines[0];
}

/**
 * Returns the Workday routine mapping (Tiers 1-3) tailored to the active equipment configuration
 * and schedule mode (4-Day Default, 5-Day, or 6-Day Push/Pull/Legs).
 */
export function getWorkdayTierRoutineMap(
  mode: EquipmentMode,
  scheduleMode: '4-day' | '5-day' | '6-day' = '4-day'
): Record<number, Record<1 | 2 | 3, string>> {
  const prefix = mode === 'hybrid' ? 'hybrid' : mode === 'bands-only' ? 'bands' : mode === 'bar-only' ? 'bar' : 'ne';

  if (scheduleMode === '4-day') {
    // 4-Day Master Schedule: Mon: Push, Tue: Pull, Wed: Rest, Thu: Legs, Fri: Full Body Flow, Sat: Core / Rest, Sun: Rest
    return {
      0: { 1: `routine-${prefix}-push-1`, 2: `routine-${prefix}-push-2`, 3: `routine-${prefix}-push-3` },
      1: { 1: `routine-${prefix}-pull-1`, 2: `routine-${prefix}-pull-2`, 3: `routine-${prefix}-pull-3` },
      2: { 1: ``, 2: ``, 3: `` }, // Wed: Rest
      3: { 1: `routine-${prefix}-legs-1`, 2: `routine-${prefix}-legs-2`, 3: `routine-${prefix}-legs-3` },
      4: { 1: `routine-${prefix}-fullbody-1`, 2: `routine-${prefix}-fullbody-2`, 3: `routine-${prefix}-fullbody-3` },
      5: { 1: `routine-${prefix}-core-1`, 2: `routine-${prefix}-core-2`, 3: `routine-${prefix}-core-3` }, // Sat optional Core
      6: { 1: ``, 2: ``, 3: `` }, // Sun: Rest
    };
  } else if (scheduleMode === '5-day') {
    // 5-Day: Mon Push, Tue Pull, Wed Legs, Thu Rest, Fri Upper, Sat Lower & Core, Sun Rest
    return {
      0: { 1: `routine-${prefix}-push-1`, 2: `routine-${prefix}-push-2`, 3: `routine-${prefix}-push-3` },
      1: { 1: `routine-${prefix}-pull-1`, 2: `routine-${prefix}-pull-2`, 3: `routine-${prefix}-pull-3` },
      2: { 1: `routine-${prefix}-legs-1`, 2: `routine-${prefix}-legs-2`, 3: `routine-${prefix}-legs-3` },
      3: { 1: ``, 2: ``, 3: `` },
      4: { 1: `routine-${prefix}-upper-1`, 2: `routine-${prefix}-upper-2`, 3: `routine-${prefix}-upper-3` },
      5: { 1: `routine-${prefix}-lower-1`, 2: `routine-${prefix}-lower-2`, 3: `routine-${prefix}-lower-3` },
      6: { 1: ``, 2: ``, 3: `` },
    };
  } else {
    // 6-Day: Push A, Pull A, Legs A, Push B, Pull B, Legs B + Core, Sun Rest
    return {
      0: { 1: `routine-${prefix}-push-1`, 2: `routine-${prefix}-push-2`, 3: `routine-${prefix}-push-3` },
      1: { 1: `routine-${prefix}-pull-1`, 2: `routine-${prefix}-pull-2`, 3: `routine-${prefix}-pull-3` },
      2: { 1: `routine-${prefix}-legs-1`, 2: `routine-${prefix}-legs-2`, 3: `routine-${prefix}-legs-3` },
      3: { 1: `routine-${prefix}-pushb-1`, 2: `routine-${prefix}-pushb-2`, 3: `routine-${prefix}-pushb-3` },
      4: { 1: `routine-${prefix}-pullb-1`, 2: `routine-${prefix}-pullb-2`, 3: `routine-${prefix}-pullb-3` },
      5: { 1: `routine-${prefix}-legsb-1`, 2: `routine-${prefix}-legsb-2`, 3: `routine-${prefix}-legsb-3` },
      6: { 1: ``, 2: ``, 3: `` },
    };
  }
}

/** Training sessions per week for each schedule (optional core day not counted). */
export const SCHEDULE_WEEKLY_GOAL: Record<'4-day' | '5-day' | '6-day', number> = { '4-day': 4, '5-day': 5, '6-day': 6 };

/**
 * Intelligent exercise substitution mapping when user lacks certain equipment.
 */
export const EXERCISE_SUBSTITUTIONS: Record<
  string,
  { bandOnly?: string; bodyweightOnly?: string; barOnly?: string }
> = {
  // Bar Exercises -> Substitutes
  'bar-pullup-assisted': {
    bandOnly: 'bent-over-row-feet',
    bodyweightOnly: 'bodyweight-table-row',
    barOnly: 'bar-pullup-strict',
  },
  'bar-chinup-assisted': {
    bandOnly: 'standing-bicep-curl',
    bodyweightOnly: 'bodyweight-diamond-pushup',
    barOnly: 'bar-pullup-strict',
  },
  'bar-pullup-strict': {
    bandOnly: 'bent-over-row-feet',
    bodyweightOnly: 'bodyweight-table-row',
  },
  'bar-hanging-leg-raise': {
    bandOnly: 'kneeling-cable-crunch-band',
    bodyweightOnly: 'bodyweight-v-ups',
  },
  'bar-band-lat-pulldown': {
    bandOnly: 'single-arm-lat-row',
    bodyweightOnly: 'bodyweight-table-row',
    barOnly: 'bar-pullup-strict',
  },
  'bar-band-face-pull': {
    bandOnly: 'seated-face-pull',
    bodyweightOnly: 'bodyweight-superman-pulses',
  },
  'bar-band-tricep-pushdown': {
    bandOnly: 'tricep-pushdown-band',
    bodyweightOnly: 'bodyweight-diamond-pushup',
  },

  // Band Exercises -> Bodyweight or Bar Substitutes
  'chest-press-standing': {
    bodyweightOnly: 'bodyweight-pushup-standard',
    barOnly: 'bodyweight-pushup-standard',
  },
  'chest-fly-middle': {
    bodyweightOnly: 'bodyweight-pushup-standard',
    barOnly: 'bodyweight-pushup-standard',
  },
  'chest-pushup-banded': {
    bodyweightOnly: 'bodyweight-pushup-standard',
    barOnly: 'bodyweight-pushup-standard',
  },
  'banded-archer-pushup': {
    bodyweightOnly: 'bodyweight-diamond-pushup',
    barOnly: 'bodyweight-diamond-pushup',
  },
  'incline-chest-press': {
    bodyweightOnly: 'bodyweight-pushup-downward-dog',
    barOnly: 'bodyweight-pushup-downward-dog',
  },
  'bent-over-row-feet': {
    bodyweightOnly: 'bodyweight-table-row',
    barOnly: 'bar-pullup-strict',
  },
  'single-arm-lat-row': {
    bodyweightOnly: 'bodyweight-doorframe-row',
    barOnly: 'bar-pullup-strict',
  },
  'seated-face-pull': {
    bodyweightOnly: 'bodyweight-superman-pulses',
    barOnly: 'bodyweight-superman-pulses',
  },
  'overhead-shoulder-press': {
    bodyweightOnly: 'bodyweight-pike-pushup',
    barOnly: 'bodyweight-pike-pushup',
  },
  'lateral-deltoid-raise': {
    bodyweightOnly: 'bodyweight-pike-pushup',
    barOnly: 'bodyweight-pike-pushup',
  },
  'front-raise-band': {
    bodyweightOnly: 'bodyweight-pike-pushup',
    barOnly: 'bodyweight-pike-pushup',
  },
  'standing-bicep-curl': {
    bodyweightOnly: 'bodyweight-diamond-pushup',
    barOnly: 'bar-pullup-strict',
  },
  'hammer-curl-band': {
    bodyweightOnly: 'bodyweight-diamond-pushup',
    barOnly: 'bar-pullup-strict',
  },
  'tube-concentration-curl': {
    bodyweightOnly: 'bodyweight-diamond-pushup',
    barOnly: 'bar-pullup-strict',
  },
  'overhead-tricep-extension': {
    bodyweightOnly: 'bodyweight-diamond-pushup',
    barOnly: 'bodyweight-diamond-pushup',
  },
  'tricep-pushdown-band': {
    bodyweightOnly: 'bodyweight-diamond-pushup',
    barOnly: 'bodyweight-diamond-pushup',
  },
  'band-thruster': {
    bodyweightOnly: 'bodyweight-jump-squats',
    barOnly: 'bodyweight-jump-squats',
  },
  'banded-squat-front': {
    bodyweightOnly: 'bodyweight-air-squat',
    barOnly: 'bodyweight-air-squat',
  },
  'romanian-deadlift-band': {
    bodyweightOnly: 'bodyweight-glute-bridge',
    barOnly: 'bodyweight-glute-bridge',
  },
  'chris-heria-deadlift': {
    bodyweightOnly: 'bodyweight-glute-bridge',
    barOnly: 'bodyweight-glute-bridge',
  },
  'band-good-morning': {
    bodyweightOnly: 'bodyweight-glute-bridge',
    barOnly: 'bodyweight-glute-bridge',
  },
  'banded-lunges': {
    bodyweightOnly: 'bodyweight-reverse-lunge',
    barOnly: 'bodyweight-reverse-lunge',
  },
  'glute-bridge-loop': {
    bodyweightOnly: 'bodyweight-glute-bridge',
    barOnly: 'bodyweight-glute-bridge',
  },
  'lateral-band-walk': {
    bodyweightOnly: 'bodyweight-sumo-squat-pulse',
    barOnly: 'bodyweight-sumo-squat-pulse',
  },
  'standing-glute-kickback': {
    bodyweightOnly: 'bodyweight-glute-bridge',
    barOnly: 'bodyweight-glute-bridge',
  },
  'tube-calf-raise': {
    bodyweightOnly: 'bodyweight-standing-calf-raise',
    barOnly: 'bodyweight-standing-calf-raise',
  },
  'band-woodchopper-high-low': {
    bodyweightOnly: 'bodyweight-plank-shoulder-taps',
    barOnly: 'bar-hanging-leg-raise',
  },
  'pallof-press-anti-rotation': {
    bodyweightOnly: 'bodyweight-plank-shoulder-taps',
    barOnly: 'bar-hanging-leg-raise',
  },
  'kneeling-cable-crunch-band': {
    bodyweightOnly: 'bodyweight-bicycle-crunches',
    barOnly: 'bar-hanging-leg-raise',
  },
  'reverse-fly-band': {
    bodyweightOnly: 'bodyweight-superman-pulses',
    barOnly: 'bodyweight-superman-pulses',
  },
  'behind-back-bicep-curl': {
    bodyweightOnly: 'bodyweight-diamond-pushup',
    barOnly: 'bar-pullup-strict',
  },
  'reverse-bicep-curl-band': {
    bodyweightOnly: 'bodyweight-diamond-pushup',
    barOnly: 'bar-pullup-strict',
  },

  // Added exercises
  'band-lying-leg-curl': { bodyweightOnly: 'bodyweight-glute-bridge', barOnly: 'bodyweight-glute-bridge' },
  'band-single-leg-rdl': { bodyweightOnly: 'bodyweight-bulgarian-split-squat', barOnly: 'bodyweight-bulgarian-split-squat' },
  'band-upright-row': { bodyweightOnly: 'bodyweight-pike-pushup', barOnly: 'bodyweight-pike-pushup' },
  'band-pull-apart': { bodyweightOnly: 'bodyweight-superman-pulses', barOnly: 'bodyweight-superman-pulses' },
  'band-overhead-squat': { bodyweightOnly: 'bodyweight-air-squat', barOnly: 'bodyweight-air-squat' },
  'band-tricep-kickback': { bodyweightOnly: 'bodyweight-bench-dip', barOnly: 'bodyweight-bench-dip' },
  'bar-band-assisted-dip': { bandOnly: 'band-tricep-kickback', bodyweightOnly: 'bodyweight-bench-dip', barOnly: 'bodyweight-bench-dip' },
  'bar-band-front-lever-raise': { bandOnly: 'single-arm-lat-row', bodyweightOnly: 'bodyweight-table-row', barOnly: 'bar-hanging-leg-raise' },
  'bar-band-planche-lean': { bodyweightOnly: 'bodyweight-pike-pushup', barOnly: 'bodyweight-pike-pushup' },
  'bar-negative-pullup': { bandOnly: 'bent-over-row-feet', bodyweightOnly: 'bodyweight-table-row' },
  'bar-dead-hang': { bandOnly: 'band-pull-apart', bodyweightOnly: 'bodyweight-pushup-downward-dog' },
};

/**
 * Checks if a specific exercise is directly compatible with the user's active equipment
 */
export function isExerciseCompatible(
  exercise: Exercise,
  profile: { hasResistanceBands?: boolean; hasPullUpBar?: boolean }
): boolean {
  const hasBands = profile.hasResistanceBands !== false;
  const hasBar = profile.hasPullUpBar !== false;

  if (exercise.requiresBand && !hasBands) return false;
  if (exercise.requiresBar && !hasBar) return false;
  return true;
}

/**
 * Dynamically resolves an exercise ID to a compatible version based on the user's active equipment
 */
export function substituteExerciseIfNeeded(
  exerciseId: string,
  profile: { hasResistanceBands?: boolean; hasPullUpBar?: boolean }
): string {
  const ex = EXERCISE_DATABASE.find(e => e.id === exerciseId);
  if (!ex) return exerciseId;

  const mode = getEquipmentMode(profile);

  if (isExerciseCompatible(ex, profile)) {
    return exerciseId;
  }

  const sub = EXERCISE_SUBSTITUTIONS[exerciseId];
  if (!sub) return exerciseId;

  if (mode === 'no-equipment') {
    return sub.bodyweightOnly || exerciseId;
  }
  if (mode === 'bar-only') {
    return sub.barOnly || sub.bodyweightOnly || exerciseId;
  }
  if (mode === 'bands-only') {
    return sub.bandOnly || exerciseId;
  }

  return exerciseId;
}

/**
 * Adapts an entire routine's exercise list, replacing any incompatible exercise with its compatible alternative
 */
export function adaptRoutineForEquipment(
  routine: Routine,
  profile: { hasResistanceBands?: boolean; hasPullUpBar?: boolean }
): Routine {
  const adaptedExercises: RoutineExercise[] = routine.exercises.map(re => {
    const substitutedId = substituteExerciseIfNeeded(re.exerciseId, profile);
    return {
      ...re,
      exerciseId: substitutedId,
    };
  });

  return {
    ...routine,
    exercises: adaptedExercises,
  };
}

/**
 * Checks if a routine is compatible with the active equipment configuration
 */
export function isRoutineCompatible(
  routine: Routine,
  profile: { hasResistanceBands?: boolean; hasPullUpBar?: boolean }
): boolean {
  const mode = getEquipmentMode(profile);
  const leap = routine as LeapRoutine;
  if (leap.equipmentCategory) {
    return leap.equipmentCategory === mode;
  }

  // Fallback for custom routines: verify every exercise is compatible
  return routine.exercises.every(re => {
    const ex = EXERCISE_DATABASE.find(e => e.id === re.exerciseId);
    return !ex || isExerciseCompatible(ex, profile);
  });
}
