import React from 'react';
import { Dumbbell, BookOpen, BarChart3, User, Volume2, VolumeX, Flame } from 'lucide-react';
import { sound } from '../utils/soundEffects';

export type ActiveTab = 'training' | 'exercises' | 'report' | 'me';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isWorkoutActive?: boolean;
  onOpenActiveWorkout?: () => void;
  /** Consecutive weeks that hit the weekly goal. */
  streakWeeks: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  isWorkoutActive,
  onOpenActiveWorkout,
  streakWeeks,
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
      <header className="sticky top-0 left-0 right-0 z-40 bg-hy-bg/95 backdrop-blur-md border-b border-hy-elevated">
        <div className="max-w-5xl mx-auto px-4 h-11 landscape:h-9 flex items-center justify-between transition-all">
          {/* Sleek Minimal App Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 landscape:w-5 landscape:h-5 rounded-lg bg-gradient-to-br from-hy-primary to-hy-volt flex items-center justify-center shadow-sm">
              <Dumbbell className="w-3.5 h-3.5 landscape:w-3 landscape:h-3 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-black tracking-tight text-white">
                HyTen
              </span>
              <span className="text-xs text-hy-text-2 font-semibold hidden sm:inline">
                • Hybrid Tension
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`w-11 h-11 landscape:w-9 landscape:h-9 flex items-center justify-center rounded-lg border transition-all ${
                soundOn
                  ? 'bg-hy-surface text-hy-primary border-hy-primary/40'
                  : 'bg-hy-surface text-hy-text-3 border-hy-border'
              }`}
              title="Voice coach and audio cues"
              aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5 landscape:w-3 landscape:h-3" /> : <VolumeX className="w-3.5 h-3.5 landscape:w-3 landscape:h-3" />}
            </button>

            {/* Streak Badge */}
            <div
              className="flex items-center gap-1 px-2.5 landscape:px-2 py-1 landscape:py-0.5 rounded-lg bg-hy-surface border border-hy-border text-xs font-bold text-hy-orange"
              aria-label={`${streakWeeks} week streak`}
              title="Weeks in a row that hit your weekly goal"
            >
              <Flame className="w-3 h-3 fill-hy-orange text-hy-orange" />
              <span>{streakWeeks} wk</span>
            </div>

            {/* Active Workout Resume pill */}
            {isWorkoutActive && (
              <button
                onClick={onOpenActiveWorkout}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-hy-primary text-hy-on-primary text-xs font-bold shadow-sm shadow-hy-primary/30 animate-pulse hover:bg-hy-primary-hover"
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
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-hy-primary text-hy-on-primary shadow-xl shadow-hy-primary/40 font-bold border border-white/20 animate-pulse-slow"
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
      <nav aria-label="Main" className="fixed bottom-0 left-0 right-0 z-40 bg-hy-surface border-t border-hy-elevated px-2 py-1 landscape:py-0.5 pb-[max(0.25rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="max-w-md landscape:max-w-xl mx-auto grid grid-cols-4 gap-1">
          <button
            onClick={() => onTabChange('training')}
            aria-current={activeTab === 'training' ? 'page' : undefined}
            className={`min-h-[48px] flex flex-col items-center justify-center py-2 landscape:py-1 px-1 rounded-xl transition-all ${
              activeTab === 'training'
                ? 'text-hy-primary font-black'
                : 'text-hy-text-2 font-semibold hover:text-white'
            }`}
          >
            <Dumbbell className="w-5 h-5 landscape:w-4 landscape:h-4 mb-0.5 landscape:mb-0" />
            <span className="text-xs landscape:text-xs tracking-tight uppercase">Training</span>
          </button>

          <button
            onClick={() => onTabChange('exercises')}
            aria-current={activeTab === 'exercises' ? 'page' : undefined}
            className={`min-h-[48px] flex flex-col items-center justify-center py-2 landscape:py-1 px-1 rounded-xl transition-all ${
              activeTab === 'exercises'
                ? 'text-hy-primary font-black'
                : 'text-hy-text-2 font-semibold hover:text-white'
            }`}
          >
            <BookOpen className="w-5 h-5 landscape:w-4 landscape:h-4 mb-0.5 landscape:mb-0" />
            <span className="text-xs landscape:text-xs tracking-tight uppercase">Library</span>
          </button>

          <button
            onClick={() => onTabChange('report')}
            aria-current={activeTab === 'report' ? 'page' : undefined}
            className={`min-h-[48px] flex flex-col items-center justify-center py-2 landscape:py-1 px-1 rounded-xl transition-all ${
              activeTab === 'report'
                ? 'text-hy-primary font-black'
                : 'text-hy-text-2 font-semibold hover:text-white'
            }`}
          >
            <BarChart3 className="w-5 h-5 landscape:w-4 landscape:h-4 mb-0.5 landscape:mb-0" />
            <span className="text-xs landscape:text-xs tracking-tight uppercase">Report</span>
          </button>

          <button
            onClick={() => onTabChange('me')}
            aria-current={activeTab === 'me' ? 'page' : undefined}
            className={`min-h-[48px] flex flex-col items-center justify-center py-2 landscape:py-1 px-1 rounded-xl transition-all ${
              activeTab === 'me'
                ? 'text-hy-primary font-black'
                : 'text-hy-text-2 font-semibold hover:text-white'
            }`}
          >
            <User className="w-5 h-5 landscape:w-4 landscape:h-4 mb-0.5 landscape:mb-0" />
            <span className="text-xs landscape:text-xs tracking-tight uppercase">Me</span>
          </button>
        </div>
      </nav>
    </>
  );
};
