import React, { useEffect } from 'react';
import { useBackClose } from '../../utils/backStack';
import confetti from 'canvas-confetti';
import { Trophy, Clock, Flame, Weight, ArrowRight } from 'lucide-react';
import { WorkoutSessionLog } from '../../types';
import { toDisplay } from '../../utils/bands';

interface WorkoutCompleteModalProps {
  unit?: 'kg' | 'lbs';
  workoutLog: WorkoutSessionLog;
  onClose: () => void;
}

export const WorkoutCompleteModal: React.FC<WorkoutCompleteModalProps> = ({
  workoutLog,
  onClose,
  unit = 'lbs',
}) => {
  useBackClose(true, onClose);
  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6EA8FF', '#C8F25A', '#FB923C', '#4ADE80'],
    });

    const timeout = setTimeout(() => {
      confetti({
        particleCount: 45,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 45,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 350);

    return () => clearTimeout(timeout);
  }, []);

  const mins = Math.floor(workoutLog.durationSeconds / 60);
  const secs = workoutLog.durationSeconds % 60;
  const timeFormatted = `${mins}m ${secs}s`;
  const totalSets = workoutLog.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm landscape:max-w-md bg-hy-surface border border-hy-border rounded-3xl p-6 landscape:p-4 shadow-2xl text-center overflow-y-auto max-h-[95vh]">
        {/* Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-hy-primary/20 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy icon */}
        <div className="mx-auto w-14 h-14 landscape:w-12 landscape:h-12 rounded-2xl bg-gradient-to-tr from-hy-primary to-hy-volt p-0.5 shadow-xl shadow-hy-primary/30 mb-3">
          <div className="w-full h-full bg-hy-bg rounded-2xl flex items-center justify-center">
            <Trophy className="w-7 h-7 landscape:w-6 landscape:h-6 text-hy-volt" />
          </div>
        </div>

        <h2 className="text-2xl landscape:text-xl font-black font-heading text-white tracking-tight">
          YOU ROCK! 🎉
        </h2>
        <p className="text-xs text-hy-text-2 mt-0.5 mb-3 landscape:mb-2">
          You finished <span className="text-hy-primary font-bold">{workoutLog.routineName}</span>
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-3 landscape:mb-2">
          <div className="bg-hy-bg border border-hy-elevated rounded-2xl p-2">
            <div className="text-xs text-hy-text-2 uppercase font-bold mb-0.5">Exercises</div>
            <div className="text-sm font-black text-white">{totalSets} sets</div>
          </div>

          <div className="bg-hy-bg border border-hy-elevated rounded-2xl p-2">
            <div className="text-xs text-hy-orange uppercase font-bold mb-0.5">Kcal</div>
            <div className="text-sm font-black text-hy-orange">{workoutLog.caloriesBurned}</div>
          </div>

          <div className="bg-hy-bg border border-hy-elevated rounded-2xl p-2">
            <div className="text-xs text-hy-primary uppercase font-bold mb-0.5">Duration</div>
            <div className="text-sm font-black text-white">{timeFormatted}</div>
          </div>
        </div>

        {/* Total Resistance Volume */}
        <div className="p-2.5 rounded-2xl bg-hy-bg border border-hy-elevated flex items-center justify-between text-left mb-4 landscape:mb-3">
          <div>
            <span className="text-xs font-black uppercase text-hy-text-3 block">Total Band Load</span>
            <span className="font-heading font-black text-base text-white">{toDisplay(workoutLog.totalVolumeLbs, unit).toLocaleString()} {unit}</span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-hy-success/15 text-hy-success text-xs font-bold border border-hy-success/30">
            +1 Streak Day
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 landscape:py-2.5 rounded-2xl bg-hy-primary hover:bg-hy-primary-hover text-hy-on-primary font-black text-sm shadow-xl shadow-hy-primary/40 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
        >
          <span>CONTINUE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
