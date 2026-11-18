import { Routine, RoutineExercise } from '../types';
import { PREBUILT_ROUTINES } from '../data/prebuiltWorkouts';
import { substituteExerciseIfNeeded } from './equipmentManager';

/**
 * Metadata for duration presets
 */
export interface DurationPresetInfo {
  minutes: number;
  label: string;
  badge: string;
  setsDescription: string;
  restDescription: string;
  summary: string;
}

export const DURATION_PRESETS: number[] = [10, 15, 20, 25, 30, 40];

export function getDurationPresetInfo(minutes: number): DurationPresetInfo {
  if (minutes <= 12) {
    return {
      minutes,
      label: 'Express',
      badge: '⚡ Express Blitz',
      setsDescription: '2 sets × 4 exercises (8 sets)',
      restDescription: '10s transition / 20s pair rest',
      summary: 'High-density superset blitz. Perfect for tight lunch breaks or morning rush.',
    };
  }
  if (minutes <= 17) {
    return {
      minutes,
      label: 'Quick',
      badge: '⚡ Quick Focus',
      setsDescription: '2-3 sets × 5 exercises (11 sets)',
      restDescription: '10s transition / 25s pair rest',
      summary: 'Efficient compound muscle stimulus with brisk superset tempo.',
    };
  }
  if (minutes <= 24) {
    return {
      minutes,
      label: 'Standard',
      badge: '🎯 Master Sweet Spot',
      setsDescription: '3 sets × 6 exercises (18 sets)',
      restDescription: '10s transition / 25s pair rest',
      summary: 'The proven 20-minute PPL sweet spot for maximum hypertrophy and tone.',
    };
  }
  if (minutes <= 29) {
    return {
      minutes,
      label: 'High Volume',
      badge: '🔥 High Volume',
      setsDescription: '3-4 sets × 6 exercises (20 sets)',
      restDescription: '10s transition / 30s pair rest',
      summary: 'Progressive overload with heavier compound focus and isolated pump.',
    };
  }
  if (minutes <= 36) {
    return {
      minutes,
      label: 'Hypertrophy',
      badge: '🔥 Hypertrophy Burnout',
      setsDescription: '4 sets × 6 exercises (24 sets)',
      restDescription: '12s transition / 35s pair rest',
      summary: 'Maximum localized muscular exhaustion across all superset pairs.',
    };
  }
  return {
    minutes,
    label: 'Athlete',
    badge: '🏆 Athlete Volume',
    setsDescription: '5 sets × 6 exercises (30 sets)',
    restDescription: '15s transition / 40s pair rest',
    summary: 'Full athletic volume with 30 total sets for elite conditioning.',
  };
}

/**
 * Dynamically scales any routine's sets, rest intervals, and exercise count
 * to precisely hit the user's targeted workout duration in minutes.
 * Always resolves against the un-truncated base routine to allow seamless back-and-forth scaling.
 */
export function scaleRoutineToDuration(
  routine: Routine, 
  targetMinutes: number = 20,
  profile?: { hasResistanceBands?: boolean; hasPullUpBar?: boolean }
): Routine {
  const safeMinutes = Math.max(5, Math.min(60, Math.round(targetMinutes)));

  // Always look up the pristine canonical routine definition to avoid losing exercises
  const canonical = PREBUILT_ROUTINES.find(r => r.id === routine.id);
  const baseExercises = canonical ? canonical.exercises.map(e => ({ ...e })) : routine.exercises.map(e => ({ ...e }));

  let scaledExercises: RoutineExercise[] = [];

  if (safeMinutes <= 12) {
    // 10-minute Express Blitz: Focus on Pairs A & B (4 exercises), 2 sets each
    const selectedCount = Math.min(4, baseExercises.length);
    scaledExercises = baseExercises.slice(0, selectedCount).map((ex, idx) => ({
      ...ex,
      sets: 2,
      targetRestSeconds: idx % 2 === 0 ? 10 : 20,
    }));
  } else if (safeMinutes <= 17) {
    // 15-minute Quick Focus: Top 5 exercises, 2-3 sets
    const selectedCount = Math.min(5, baseExercises.length);
    scaledExercises = baseExercises.slice(0, selectedCount).map((ex, idx) => ({
      ...ex,
      sets: idx === 0 ? 3 : 2,
      targetRestSeconds: idx % 2 === 0 ? 10 : 25,
    }));
  } else if (safeMinutes <= 24) {
    // 20-minute Standard (Default Master Sweet Spot): Full 6 exercises, 3 sets each
    scaledExercises = baseExercises.map((ex, idx) => ({
      ...ex,
      sets: 3,
      targetRestSeconds: idx % 2 === 0 ? 10 : 25,
    }));
  } else if (safeMinutes <= 29) {
    // 25-minute Volume: 4 sets on first 2 exercises, 3 sets on accessories
    scaledExercises = baseExercises.map((ex, idx) => ({
      ...ex,
      sets: idx < 2 ? 4 : 3,
      targetRestSeconds: idx % 2 === 0 ? 10 : 30,
    }));
  } else if (safeMinutes <= 36) {
    // 30-minute Hypertrophy: 4 sets across all exercises (24 sets)
    scaledExercises = baseExercises.map((ex, idx) => ({
      ...ex,
      sets: 4,
      targetRestSeconds: idx % 2 === 0 ? 12 : 35,
    }));
  } else {
    // 40+ minute Athlete Volume: 5 sets across all 6 exercises (30 sets)
    scaledExercises = baseExercises.map((ex, idx) => ({
      ...ex,
      sets: 5,
      targetRestSeconds: idx % 2 === 0 ? 15 : 40,
    }));
  }

  // If equipment profile is provided, adapt exercise IDs to compatible equipment
  if (profile) {
    scaledExercises = scaledExercises.map(ex => ({
      ...ex,
      exerciseId: substituteExerciseIfNeeded(ex.exerciseId, profile),
    }));
  } else {
    // Check if the input routine had already substituted exercises and preserve them
    const routineExMap = new Map(routine.exercises.map(e => [canonical?.exercises.find(ce => ce.exerciseId === e.exerciseId)?.exerciseId || e.exerciseId, e.exerciseId]));
    scaledExercises = scaledExercises.map(ex => {
      const existingSub = routineExMap.get(ex.exerciseId);
      return existingSub ? { ...ex, exerciseId: existingSub } : ex;
    });
  }

  return {
    ...routine,
    estimatedDurationMins: safeMinutes,
    exercises: scaledExercises,
  };
}
