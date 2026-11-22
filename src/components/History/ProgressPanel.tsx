import React from 'react';
import { Trophy } from 'lucide-react';
import { WorkoutSessionLog, UserProfile } from '../../types';
import { getExerciseById } from '../../data/exerciseDatabase';
import { personalBests, weeklySetsPerMuscle, TRACKED_MUSCLES } from '../../utils/stats';
import { toDisplay } from '../../utils/bands';

interface ProgressPanelProps {
  workoutLogs: WorkoutSessionLog[];
  userProfile: UserProfile;
}

const TARGET_LOW = 12;
const TARGET_HIGH = 20;
const SCALE_MAX = 24;

/** Strength-first progress: personal bests and this week's sets per muscle vs the 12–20 target. */
export const ProgressPanel: React.FC<ProgressPanelProps> = ({ workoutLogs, userProfile }) => {
  const unit = userProfile.unitSystem;
  const bests = personalBests(workoutLogs, id => getExerciseById(id)?.name).slice(0, 8);
  const sets = weeklySetsPerMuscle(workoutLogs, id => {
    const e = getExerciseById(id);
    return e ? { target: e.targetMuscle, secondary: e.secondaryMuscles || [] } : undefined;
  });

  if (!workoutLogs.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <section className="hy-card p-4" aria-labelledby="pb-heading">
        <h3 id="pb-heading" className="text-sm font-black uppercase text-hy-text-2 flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-hy-volt" /> Personal bests
        </h3>
        <ul className="divide-y divide-hy-elevated">
          {bests.map(pb => (
            <li key={pb.exerciseId} className="py-2 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold truncate">{pb.exerciseName}</span>
              <span className="text-sm font-mono text-hy-text shrink-0">
                {pb.seconds ? `${pb.seconds}s` : `${pb.reps} reps`}
                {pb.assistanceLbs
                  ? ` · assist ${toDisplay(pb.assistanceLbs, unit)}${unit}`
                  : pb.loadLbs
                  ? ` @ ${toDisplay(pb.loadLbs, unit)}${unit}`
                  : ''}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="hy-card p-4" aria-labelledby="sets-heading">
        <h3 id="sets-heading" className="text-sm font-black uppercase text-hy-text-2 mb-1">Weekly sets</h3>
        <p className="text-xs text-hy-text-3 mb-3">Target 12–20</p>
        <div className="space-y-1.5">
          {TRACKED_MUSCLES.map(m => {
            const v = Math.round(sets[m] * 10) / 10;
            const pct = Math.min(100, (v / SCALE_MAX) * 100);
            const inRange = v >= TARGET_LOW && v <= TARGET_HIGH;
            return (
              <div key={m} className="flex items-center gap-2 text-xs">
                <span className="w-20 shrink-0 text-hy-text-2">{m}</span>
                <div className="relative flex-1 h-4 rounded bg-hy-bg overflow-hidden" role="img" aria-label={`${m}: ${v} sets`}>
                  <div
                    className="absolute inset-y-0 bg-hy-elevated"
                    style={{ left: `${(TARGET_LOW / SCALE_MAX) * 100}%`, width: `${((TARGET_HIGH - TARGET_LOW) / SCALE_MAX) * 100}%` }}
                  />
                  <div className={`absolute inset-y-0.5 left-0 rounded-sm ${inRange ? 'bg-hy-success' : 'bg-hy-primary'}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right font-mono text-hy-text">{v}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
