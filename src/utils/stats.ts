import { MuscleGroup, WorkoutSessionLog } from '../types';
import { setScore, startOfWeek } from './progression';

export interface PersonalBest {
  exerciseId: string;
  exerciseName: string;
  date: string;
  reps: number;
  seconds?: number;
  loadLbs: number;
  assistanceLbs?: number;
}

/** Best set per exercise (highest set score), most recently achieved first. */
export function personalBests(logs: WorkoutSessionLog[], nameOf: (id: string) => string | undefined): PersonalBest[] {
  const best = new Map<string, { score: number; pb: PersonalBest }>();
  for (const log of logs) {
    for (const ex of log.exercises) {
      for (const s of ex.sets) {
        if (!s.completed) continue;
        const score = setScore(s);
        const cur = best.get(ex.exerciseId);
        if (!cur || score > cur.score) {
          best.set(ex.exerciseId, {
            score,
            pb: {
              exerciseId: ex.exerciseId,
              exerciseName: nameOf(ex.exerciseId) || ex.exerciseName || ex.exerciseId,
              date: log.date,
              reps: s.reps,
              seconds: s.seconds,
              loadLbs: s.totalResistanceLbs,
              assistanceLbs: s.assistanceLbs,
            },
          });
        }
      }
    }
  }
  return [...best.values()].map(v => v.pb).sort((a, b) => b.date.localeCompare(a.date));
}

export const TRACKED_MUSCLES: MuscleGroup[] = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core'];

/**
 * Completed sets per muscle this week (Mon–Sun). A set counts fully for the
 * exercise's target muscle and half for each secondary muscle.
 */
export function weeklySetsPerMuscle(
  logs: WorkoutSessionLog[],
  musclesOf: (id: string) => { target: MuscleGroup; secondary: MuscleGroup[] } | undefined,
  now: Date = new Date()
): Record<string, number> {
  const start = startOfWeek(now).getTime();
  const out: Record<string, number> = {};
  TRACKED_MUSCLES.forEach(m => (out[m] = 0));
  for (const log of logs) {
    if (new Date(log.date).getTime() < start) continue;
    for (const ex of log.exercises) {
      const m = musclesOf(ex.exerciseId);
      if (!m) continue;
      const done = ex.sets.filter(s => s.completed).length;
      if (m.target in out) out[m.target] += done;
      m.secondary.forEach(sm => {
        if (sm in out) out[sm] += done * 0.5;
      });
    }
  }
  return out;
}
