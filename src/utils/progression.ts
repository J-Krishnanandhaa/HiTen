import { LoggedSet, ResistanceBand, WorkoutSessionLog } from '../types';
import { bandsByLoad, stackLoadLbs } from './bands';

/**
 * Progressive overload for elastic and bodyweight training.
 *
 * Light loads build similar muscle to heavy ones when sets are taken close to
 * failure, so the app works within a rep range and steps the setup up once the
 * top of the range is reached with few reps left in the tank.
 */

export interface RepRange {
  low: number;
  high: number;
}

/** Rep range around a routine's target (e.g. 12 → 10–16). Timed targets keep ±20 %. */
export function repRange(target: number, isTimed = false): RepRange {
  if (isTimed) return { low: Math.max(5, Math.round(target * 0.8)), high: Math.round(target * 1.2) };
  return { low: Math.max(1, target - 2), high: target + 4 };
}

export interface PreviousPerformance {
  date: string;
  sets: LoggedSet[];
}

/** Most recent completed sets for an exercise, newest log first in `logs`. */
export function getPreviousPerformance(logs: WorkoutSessionLog[], exerciseId: string): PreviousPerformance | null {
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  for (const log of sorted) {
    const ex = log.exercises.find(e => e.exerciseId === exerciseId);
    const done = ex?.sets.filter(s => s.completed) ?? [];
    if (done.length) return { date: log.date, sets: done };
  }
  return null;
}

/**
 * Comparable score of one set. Band sets: reps × load. Assisted sets: reps
 * scaled down by assistance (less help = higher score). Bodyweight: reps.
 */
export function setScore(set: Pick<LoggedSet, 'reps' | 'totalResistanceLbs' | 'assistanceLbs' | 'seconds'>): number {
  const reps = set.seconds ?? set.reps;
  if (set.assistanceLbs && set.assistanceLbs > 0) return reps * (1000 / (100 + set.assistanceLbs));
  if (set.totalResistanceLbs > 0) return reps * set.totalResistanceLbs;
  return reps;
}

/** Best previous set score for an exercise across all logs. */
export function bestSetScore(logs: WorkoutSessionLog[], exerciseId: string): number {
  let best = 0;
  for (const log of logs) {
    for (const ex of log.exercises) {
      if (ex.exerciseId !== exerciseId) continue;
      for (const s of ex.sets) if (s.completed) best = Math.max(best, setScore(s));
    }
  }
  return best;
}

export type SuggestionKind = 'first-time' | 'step-up' | 'add-reps' | 'repeat' | 'harder-variant';

export interface Suggestion {
  kind: SuggestionKind;
  bandIds: string[];
  reps: number;
  message: string;
}

interface SuggestInput {
  previous: PreviousPerformance | null;
  targetReps: number;
  ownedBands: ResistanceBand[];
  usesBand: boolean;
  isAssisted: boolean;
  isTimed: boolean;
  harderName?: string;
}

/** Next heavier single band, or a stack once the heaviest is reached. */
function stepUpBands(current: string[], owned: ResistanceBand[]): string[] {
  const sorted = bandsByLoad(owned);
  if (!sorted.length) return current;
  const load = stackLoadLbs(current, owned);
  const nextSingle = sorted.find(b => stackLoadLbs([b.id], owned) > load + 0.01);
  if (nextSingle) return [nextSingle.id];
  // Already at or above the heaviest single band: stack the lightest on top.
  const heaviest = sorted[sorted.length - 1];
  const extra = sorted.find(b => !current.includes(b.id) && b.id !== heaviest.id);
  return extra ? Array.from(new Set([...current, extra.id])) : current;
}

/** Next lighter single band, for assisted movements. */
function stepDownBands(current: string[], owned: ResistanceBand[]): string[] {
  const sorted = bandsByLoad(owned);
  const load = stackLoadLbs(current, owned);
  const lighter = [...sorted].reverse().find(b => stackLoadLbs([b.id], owned) < load - 0.01);
  return lighter ? [lighter.id] : current;
}

/** Default starting band: a light-middle band (heaviest for assisted moves). */
export function defaultBands(owned: ResistanceBand[], isAssisted: boolean): string[] {
  const sorted = bandsByLoad(owned);
  if (!sorted.length) return [];
  if (isAssisted) return [sorted[sorted.length - 1].id];
  return [sorted[Math.min(1, sorted.length - 1)].id];
}

export function suggestNext(input: SuggestInput): Suggestion {
  const { previous, targetReps, ownedBands, usesBand, isAssisted, isTimed, harderName } = input;
  const range = repRange(targetReps, isTimed);
  const unit = isTimed ? 's' : ' reps';

  if (!previous || !previous.sets.length) {
    return {
      kind: 'first-time',
      bandIds: usesBand ? defaultBands(ownedBands, isAssisted) : [],
      reps: targetReps,
      message: `First time: aim for ${range.low}–${range.high}${unit}, stopping with 1–2 left in the tank.`,
    };
  }

  const sets = previous.sets;
  const lastBands = sets[sets.length - 1].bandIds;
  const amounts = sets.map(s => (isTimed ? s.seconds ?? s.reps : s.reps));
  const minDone = Math.min(...amounts);
  const bestDone = Math.max(...amounts);
  const rated = sets.filter(s => s.rir !== undefined);
  const nearFailure = rated.length ? rated.every(s => (s.rir as number) <= 2) : true;

  if (minDone >= range.high && nearFailure) {
    if (usesBand && lastBands.length) {
      const next = isAssisted ? stepDownBands(lastBands, ownedBands) : stepUpBands(lastBands, ownedBands);
      if (next.join() !== lastBands.join()) {
        return {
          kind: 'step-up',
          bandIds: next,
          reps: range.low,
          message: isAssisted
            ? `You hit ${range.high}${unit} on every set. Try a lighter band and work back up from ${range.low}.`
            : `You hit ${range.high}${unit} on every set. Step up a band and start again from ${range.low}.`,
        };
      }
    }
    if (harderName) {
      return {
        kind: 'harder-variant',
        bandIds: lastBands,
        reps: range.low,
        message: `Top of the range on every set. Ready to try ${harderName}.`,
      };
    }
    return {
      kind: 'add-reps',
      bandIds: lastBands,
      reps: bestDone + 1,
      message: `Top of the range reached. Add a rep, or slow the lowering to 3 s.`,
    };
  }

  if (minDone >= targetReps) {
    return {
      kind: 'add-reps',
      bandIds: lastBands,
      reps: Math.min(range.high, bestDone + 1),
      message: `Last time: ${amounts.join(' / ')}${unit}. Beat it by 1–2 today.`,
    };
  }

  return {
    kind: 'repeat',
    bandIds: lastBands,
    reps: Math.max(range.low, minDone),
    message: `Last time: ${amounts.join(' / ')}${unit}. Same setup; aim for ${targetReps} on every set.`,
  };
}

/** Number of consecutive ISO weeks (Mon–Sun), up to `now`, that contain a workout. */
export function consecutiveTrainingWeeks(logs: WorkoutSessionLog[], now: Date = new Date()): number {
  const weeks = new Set(logs.map(l => weekKey(new Date(l.date))));
  let count = 0;
  const cursor = startOfWeek(now);
  if (!weeks.has(weekKey(cursor))) cursor.setDate(cursor.getDate() - 7);
  while (weeks.has(weekKey(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return count;
}

/** Suggest a deload after 6 straight training weeks. */
export function shouldSuggestDeload(logs: WorkoutSessionLog[], now: Date = new Date()): boolean {
  return consecutiveTrainingWeeks(logs, now) >= 6;
}

export function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

export function weekKey(d: Date): string {
  const s = startOfWeek(d);
  return `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, '0')}-${String(s.getDate()).padStart(2, '0')}`;
}
