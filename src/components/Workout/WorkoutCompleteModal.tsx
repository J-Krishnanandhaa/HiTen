import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, Flame, Weight, ArrowRight } from 'lucide-react';
import { WorkoutSessionLog } from '../../types';

interface WorkoutCompleteModalProps {
  workoutLog: WorkoutSessionLog;
  onClose: () => void;
}

export const WorkoutCompleteModal: React.FC<WorkoutCompleteModalProps> = ({
  workoutLog,
  onClose,
}) => {
  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2979FF', '#00E5FF', '#FF6D00', '#00E676'],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-sm landscape:max-w-md bg-[#1A2026] border border-[#2D3748] rounded-3xl p-6 landscape:p-4 shadow-2xl text-center overflow-y-auto max-h-[95vh]">
        {/* Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#2979FF]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy icon */}
        <div className="mx-auto w-14 h-14 landscape:w-12 landscape:h-12 rounded-2xl bg-gradient-to-tr from-[#2979FF] to-[#00E5FF] p-0.5 shadow-xl shadow-[#2979FF]/30 mb-3">
          <div className="w-full h-full bg-[#12161A] rounded-2xl flex items-center justify-center">
            <Trophy className="w-7 h-7 landscape:w-6 landscape:h-6 text-[#00E5FF]" />
          </div>
        </div>

        <h2 className="text-2xl landscape:text-xl font-black font-heading text-white tracking-tight">
          YOU ROCK! 🎉
        </h2>
        <p className="text-xs text-slate-400 mt-0.5 mb-3 landscape:mb-2">
          You finished <span className="text-[#2979FF] font-bold">{workoutLog.routineName}</span>
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-3 landscape:mb-2">
          <div className="bg-[#12161A] border border-[#242C35] rounded-2xl p-2">
            <div className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Exercises</div>
            <div className="text-sm font-black text-white">{totalSets} sets</div>
          </div>

          <div className="bg-[#12161A] border border-[#242C35] rounded-2xl p-2">
            <div className="text-[10px] text-[#FF6D00] uppercase font-bold mb-0.5">Kcal</div>
            <div className="text-sm font-black text-[#FF6D00]">{workoutLog.caloriesBurned}</div>
          </div>

          <div className="bg-[#12161A] border border-[#242C35] rounded-2xl p-2">
            <div className="text-[10px] text-[#2979FF] uppercase font-bold mb-0.5">Duration</div>
            <div className="text-sm font-black text-white">{timeFormatted}</div>
          </div>
        </div>

        {/* Total Resistance Volume */}
        <div className="p-2.5 rounded-2xl bg-[#12161A] border border-[#242C35] flex items-center justify-between text-left mb-4 landscape:mb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 block">Total Band Load</span>
            <span className="font-heading font-black text-base text-white">{workoutLog.totalVolumeLbs.toLocaleString()} lbs</span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-[#00E676]/15 text-[#00E676] text-xs font-bold border border-[#00E676]/30">
            +1 Streak Day
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 landscape:py-2.5 rounded-2xl bg-[#2979FF] hover:bg-[#1C64F2] text-white font-black text-sm shadow-xl shadow-[#2979FF]/40 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
        >
          <span>CONTINUE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
