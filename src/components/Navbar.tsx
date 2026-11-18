import React from 'react';
import { Dumbbell, BookOpen, BarChart3, User, Volume2, VolumeX, Flame } from 'lucide-react';
import { sound } from '../utils/soundEffects';

export type ActiveTab = 'training' | 'exercises' | 'report' | 'me';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isWorkoutActive?: boolean;
  onOpenActiveWorkout?: () => void;
  streakDays: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  isWorkoutActive,
  onOpenActiveWorkout,
  streakDays,
}) => {
  const [soundOn, setSoundOn] = React.useState(() => sound.isEnabled());

  React.useEffect(() => {
    const handleSoundChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setSoundOn(customEvent.detail);
    };
    window.addEventListener('bandfit_sound_change', handleSoundChange);
    return () => window.removeEventListener('bandfit_sound_change', handleSoundChange);
  }, []);

  const toggleSound = () => {
    const isNowOn = sound.toggleSound();
    if (isNowOn) {
      sound.playTick();
      sound.speak('Sound on');
    }
  };

  return (
    <>
      {/* Top App Header (Both Mobile & Desktop) */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-[#12161A]/95 backdrop-blur-md border-b border-[#242C35]">
        <div className="max-w-5xl mx-auto px-4 h-11 landscape:h-9 flex items-center justify-between transition-all">
          {/* Sleek Minimal App Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 landscape:w-5 landscape:h-5 rounded-lg bg-gradient-to-br from-[#2979FF] to-[#00E5FF] flex items-center justify-center shadow-sm">
              <Dumbbell className="w-3.5 h-3.5 landscape:w-3 landscape:h-3 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-black tracking-tight text-white">
                HyTen
              </span>
              <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline">
                • Hybrid Tension
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-1.5 landscape:p-1 rounded-lg border transition-all ${
                soundOn
                  ? 'bg-[#1A2026] text-[#2979FF] border-[#2979FF]/40'
                  : 'bg-[#1A2026] text-slate-500 border-[#2D3748]'
              }`}
              title="Voice Coach & Audio Cues"
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5 landscape:w-3 landscape:h-3" /> : <VolumeX className="w-3.5 h-3.5 landscape:w-3 landscape:h-3" />}
            </button>

            {/* Streak Badge */}
            <div className="flex items-center gap-1 px-2.5 landscape:px-2 py-1 landscape:py-0.5 rounded-lg bg-[#1A2026] border border-[#2D3748] text-[11px] landscape:text-[10px] font-bold text-[#FF6D00]">
              <Flame className="w-3 h-3 fill-[#FF6D00] text-[#FF6D00]" />
              <span>{streakDays}d</span>
            </div>

            {/* Active Workout Resume pill */}
            {isWorkoutActive && (
              <button
                onClick={onOpenActiveWorkout}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2979FF] text-white text-[11px] font-bold shadow-sm shadow-[#2979FF]/30 animate-pulse hover:bg-[#1C64F2]"
              >
                <span>Workout Active</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Floating Resume Banner on Mobile */}
      {isWorkoutActive && (
        <div className="fixed top-14 landscape:top-11 left-3 right-3 z-40 max-w-md mx-auto">
          <button
            onClick={onOpenActiveWorkout}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-[#2979FF] text-white shadow-xl shadow-[#2979FF]/40 font-bold border border-white/20 animate-pulse-slow"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              <span className="text-xs uppercase tracking-wider">Workout In Progress</span>
            </div>
            <span className="text-xs bg-black/25 px-2.5 py-1 rounded-full font-semibold">Resume →</span>
          </button>
        </div>
      )}

      {/* Bottom Navigation Bar (Leap Fitness style) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#1A2026] border-t border-[#242C35] px-2 py-1 landscape:py-0.5 pb-[max(0.25rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="max-w-md landscape:max-w-xl mx-auto grid grid-cols-4 gap-1">
          <button
            onClick={() => onTabChange('training')}
            className={`flex flex-col items-center justify-center py-2 landscape:py-1 px-1 rounded-xl transition-all ${
              activeTab === 'training'
                ? 'text-[#2979FF] font-black'
                : 'text-[#94A3B8] font-semibold hover:text-white'
            }`}
          >
            <Dumbbell className="w-5 h-5 landscape:w-4 landscape:h-4 mb-0.5 landscape:mb-0" />
            <span className="text-[10px] landscape:text-[9px] tracking-tight uppercase">Training</span>
          </button>

          <button
            onClick={() => onTabChange('exercises')}
            className={`flex flex-col items-center justify-center py-2 landscape:py-1 px-1 rounded-xl transition-all ${
              activeTab === 'exercises'
                ? 'text-[#2979FF] font-black'
                : 'text-[#94A3B8] font-semibold hover:text-white'
            }`}
          >
            <BookOpen className="w-5 h-5 landscape:w-4 landscape:h-4 mb-0.5 landscape:mb-0" />
            <span className="text-[10px] landscape:text-[9px] tracking-tight uppercase">Library</span>
          </button>

          <button
            onClick={() => onTabChange('report')}
            className={`flex flex-col items-center justify-center py-2 landscape:py-1 px-1 rounded-xl transition-all ${
              activeTab === 'report'
                ? 'text-[#2979FF] font-black'
                : 'text-[#94A3B8] font-semibold hover:text-white'
            }`}
          >
            <BarChart3 className="w-5 h-5 landscape:w-4 landscape:h-4 mb-0.5 landscape:mb-0" />
            <span className="text-[10px] landscape:text-[9px] tracking-tight uppercase">Report</span>
          </button>

          <button
            onClick={() => onTabChange('me')}
            className={`flex flex-col items-center justify-center py-2 landscape:py-1 px-1 rounded-xl transition-all ${
              activeTab === 'me'
                ? 'text-[#2979FF] font-black'
                : 'text-[#94A3B8] font-semibold hover:text-white'
            }`}
          >
            <User className="w-5 h-5 landscape:w-4 landscape:h-4 mb-0.5 landscape:mb-0" />
            <span className="text-[10px] landscape:text-[9px] tracking-tight uppercase">Me</span>
          </button>
        </div>
      </nav>
    </>
  );
};
