import { WorkoutSessionLog } from '../types';
import { startOfWeek, weekKey } from './progression';

export interface WeeklyStreak {
  /** Consecutive weeks that hit the weekly goal. */
  weeks: number;
  /** Sessions logged this week so far. */
  thisWeek: number;
  goal: number;
}

/**
 * Streak counted against the plan: a week counts when it reaches `goal`
 * sessions. Scheduled rest days never break it; skipped sessions do.
 * The current week only adds to the streak once its goal is met, and an
 * unfinished current week doesn't break it.
 */
export function computeWeeklyStreak(logs: WorkoutSessionLog[], goal: number, now: Date = new Date()): WeeklyStreak {
  const safeGoal = Math.max(1, Math.round(goal));
  const perWeek = new Map<string, number>();
  for (const l of logs) {
    if (l.partial) continue;
    const k = weekKey(new Date(l.date));
    perWeek.set(k, (perWeek.get(k) ?? 0) + 1);
  }

  const cursor = startOfWeek(now);
  const thisWeek = perWeek.get(weekKey(cursor)) ?? 0;
  let weeks = 0;
  if (thisWeek >= safeGoal) weeks++;
  cursor.setDate(cursor.getDate() - 7);
  while ((perWeek.get(weekKey(cursor)) ?? 0) >= safeGoal) {
    weeks++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return { weeks, thisWeek, goal: safeGoal };
}
