import { Routine } from '../types';

/** One set to perform, in the order the player runs them. */
export interface QueueStep {
  exIndex: number;
  setIndex: number;
  /** Rest after this step, in seconds (0 for the final step). */
  restAfter: number;
  /** "A", "B", "C"… for supersets; undefined for straight sets. */
  group?: string;
  /** Position inside a superset pair: 1 = A1, 2 = A2. */
  slot?: 1 | 2;
  round: number;
  totalRounds: number;
}

/** A pair is a superset when its first exercise has a short transition rest. */
const TRANSITION_MAX_SECONDS = 15;

/** Extra recovery after a superset round that contains a compound lift. */
const COMPOUND_BONUS_SECONDS = 15;

/**
 * Build the set order for a routine.
 *
 * Routines are written as pairs (A1 → A2) where A1 has a ~10 s transition and
 * A2 carries the real rest. Paired exercises alternate set by set
 * (A1 s1, A2 s1, A1 s2, A2 s2 …). Unpaired exercises run as straight sets.
 */
export function buildSetQueue(
  routine: Routine,
  isCompound: (exerciseId: string) => boolean = () => false
): QueueStep[] {
  const ex = routine.exercises;
  const steps: QueueStep[] = [];
  let groupCode = 65; // 'A'
  let i = 0;

  while (i < ex.length) {
    const a = ex[i];
    const b = ex[i + 1];
    const isPair = !!b && a.targetRestSeconds <= TRANSITION_MAX_SECONDS;

    if (isPair) {
      const group = String.fromCharCode(groupCode++);
      const rounds = Math.max(a.sets, b.sets);
      const bonus = isCompound(a.exerciseId) || isCompound(b.exerciseId) ? COMPOUND_BONUS_SECONDS : 0;
      const pairRest = Math.max(20, b.targetRestSeconds) + bonus;
      for (let r = 0; r < rounds; r++) {
        const doA = r < a.sets;
        const doB = r < b.sets;
        if (doA) {
          steps.push({
            exIndex: i, setIndex: r, group, slot: 1, round: r + 1, totalRounds: rounds,
            restAfter: doB ? Math.max(5, a.targetRestSeconds) : pairRest,
          });
        }
        if (doB) {
          steps.push({ exIndex: i + 1, setIndex: r, group, slot: 2, round: r + 1, totalRounds: rounds, restAfter: pairRest });
        }
      }
      i += 2;
    } else {
      // Straight sets: never rest less than 20 s between sets of the same exercise.
      const rest = Math.max(20, a.targetRestSeconds) + (isCompound(a.exerciseId) ? COMPOUND_BONUS_SECONDS : 0);
      for (let r = 0; r < a.sets; r++) {
        steps.push({ exIndex: i, setIndex: r, round: r + 1, totalRounds: a.sets, restAfter: rest });
      }
      i += 1;
    }
  }

  if (steps.length) steps[steps.length - 1].restAfter = 0;
  return steps;
}

/** "Superset A · round 2 of 3" or "Set 2 of 3". */
export function describeStep(step: QueueStep): string {
  return step.group
    ? `Superset ${step.group}${step.slot} · round ${step.round} of ${step.totalRounds}`
    : `Set ${step.round} of ${step.totalRounds}`;
}
