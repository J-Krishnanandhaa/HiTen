import React, { useState, useEffect } from 'react';
import { 
  X, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Check, 
  Plus, Minus, Clock, Shield, ChevronRight, Layers, RotateCcw, Flame
} from 'lucide-react';
import { Routine, Exercise, LoggedExercise, WorkoutSessionLog, UserProfile } from '../../types';
import { EXERCISE_DATABASE, getExerciseYoutubeUrl, getExerciseTimestampLabel } from '../../data/exerciseDatabase';
import { sound } from '../../utils/soundEffects';
import { estimateWorkoutCalories } from '../../utils/nutritionMath';
import { saveWorkoutLog } from '../../utils/storage';
import { WorkoutCompleteModal } from './WorkoutCompleteModal';
import { WorkoutAvatar } from '../Common/WorkoutAvatar';
import { YoutubeIcon } from '../Common/YoutubeIcon';

interface WorkoutPlayerProps {
  routine: Routine;
  userProfile: UserProfile;
  onExit: () => void;
  onFinished: (log: WorkoutSessionLog) => void;
}

export const WorkoutPlayer: React.FC<WorkoutPlayerProps> = ({
  routine,
  userProfile,
  onExit,
  onFinished,
}) => {
  // Session timers
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [soundOn, setSoundOn] = useState(() => sound.isEnabled());

  useEffect(() => {
    const handleSoundChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setSoundOn(customEvent.detail);
    };
    window.addEventListener('bandfit_sound_change', handleSoundChange);
    return () => {
      window.removeEventListener('bandfit_sound_change', handleSoundChange);
      sound.stopAll();
    };
  }, []);

  // Exercise Navigation
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);

  // Phase: 'ready' | 'work' | 'rest' (Authentic Leap Fitness Flow)
  const [phase, setPhase] = useState<'ready' | 'work' | 'rest'>('ready');
  const [readySecondsLeft, setReadySecondsLeft] = useState(10);
  const [restSecondsLeft, setRestSecondsLeft] = useState(25);
  const [initialRestDuration, setInitialRestDuration] = useState(25);

  // Form cues popup
  const [showTips, setShowTips] = useState(false);
  const [completedLog, setCompletedLog] = useState<WorkoutSessionLog | null>(null);

  // Session logs
  const [sessionLogs, setSessionLogs] = useState<LoggedExercise[]>(() => {
    return routine.exercises.map(re => ({
      exerciseId: re.exerciseId,
      sets: Array.from({ length: re.sets }).map((_, idx) => ({
        setNumber: idx + 1,
        reps: re.targetReps,
        bandIds: [],
        totalResistanceLbs: 20,
        completed: false,
      })),
    }));
  });

  const currentRoutineEx = routine.exercises[currentExIndex];
  const currentExercise = EXERCISE_DATABASE.find(e => e.id === currentRoutineEx.exerciseId) || {
    id: currentRoutineEx.exerciseId,
    name: 'Band Exercise',
    targetMuscle: 'Full Body',
    bandType: 'Long Loop Band',
    anchorPosition: 'Door Middle',
    difficulty: 'Beginner',
    instructions: [],
    formCues: [],
    tips: '',
    estimatedCaloriesPerMin: 6.0,
  } as Exercise;

  // Next exercise preview (for Rest screen)
  const isLastSetInExercise = currentSetIndex >= currentRoutineEx.sets - 1;
  const isLastExercise = currentExIndex >= routine.exercises.length - 1;

  const nextExIndex = isLastSetInExercise ? currentExIndex + 1 : currentExIndex;
  const nextSetIndex = isLastSetInExercise ? 0 : currentSetIndex + 1;
  const nextRoutineEx = routine.exercises[nextExIndex];
  const nextExercise = nextRoutineEx ? EXERCISE_DATABASE.find(e => e.id === nextRoutineEx.exerciseId) : null;

  // Active Set inputs
  const activeSet = sessionLogs[currentExIndex]?.sets[currentSetIndex] || {
    setNumber: 1,
    reps: currentRoutineEx.targetReps,
    bandIds: [],
    totalResistanceLbs: 20,
    completed: false,
  };

  const [inputReps, setInputReps] = useState(activeSet.reps || currentRoutineEx.targetReps);
  const [selectedBands, setSelectedBands] = useState<string[]>(
    activeSet.bandIds.length 
      ? activeSet.bandIds 
      : (currentExercise.requiresBand && userProfile.hasResistanceBands !== false)
      ? [userProfile.ownedBands[1]?.id || 'slovic-loop-blue']
      : []
  );

  // Sound sync & interaction unlock
  useEffect(() => {
    sound.unlockAudio();
  }, []);

  const toggleSound = () => {
    const isNowOn = sound.toggleSound();
    if (isNowOn) {
      sound.playTick();
      sound.speak('Sound on');
    }
  };

  // Workout duration clock
  useEffect(() => {
    if (isPaused || completedLog || phase === 'ready') return;
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, completedLog, phase]);

  // READY TO GO COUNTDOWN EFFECT (Leap Fitness Initial Stage)
  useEffect(() => {
    if (phase !== 'ready') return;

    if (readySecondsLeft === 10) {
      sound.speak(`Ready to go! Next exercise: ${currentExercise.name}`);
    } else if (readySecondsLeft === 3) {
      sound.speak('3');
      sound.playTick();
    } else if (readySecondsLeft === 2) {
      sound.speak('2');
      sound.playTick();
    } else if (readySecondsLeft === 1) {
      sound.speak('1');
      sound.playTick();
    } else if (readySecondsLeft <= 0) {
      sound.playStartWhistle();
      sound.speak('Start!');
      setPhase('work');
      return;
    }

    const timer = setInterval(() => {
      setReadySecondsLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, readySecondsLeft, currentExercise.name]);

  // Voice announcement when new exercise starts
  useEffect(() => {
    if (phase === 'work') {
      sound.speak(`Set ${currentSetIndex + 1}. ${currentExercise.name}`);
    }
  }, [currentExIndex, currentSetIndex, phase]);

  // Rest Timer countdown & sound beeps (3, 2, 1)
  useEffect(() => {
    if (phase !== 'rest' || isPaused || completedLog) return;

    if (restSecondsLeft === 3) sound.speak('3');
    else if (restSecondsLeft === 2) sound.speak('2');
    else if (restSecondsLeft === 1) sound.speak('1');

    if (restSecondsLeft <= 3 && restSecondsLeft > 0) {
      sound.playTick();
    } else if (restSecondsLeft === 0) {
      sound.playStartWhistle();
      sound.speak('Start!');
      setPhase('work');
      advanceToNextSet();
      return;
    }

    const timer = setInterval(() => {
      setRestSecondsLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, restSecondsLeft, isPaused, completedLog]);

  // Calculate total stacked resistance
  const currentTotalResistance = selectedBands.reduce((sum, bandId) => {
    const band = userProfile.ownedBands.find(b => b.id === bandId);
    return sum + (band ? (userProfile.unitSystem === 'kg' ? band.weightKg : band.weightLbs) : 0);
  }, 0);

  // Sync inputs on set change
  useEffect(() => {
    const set = sessionLogs[currentExIndex]?.sets[currentSetIndex];
    if (set) {
      setInputReps(set.reps || currentRoutineEx.targetReps);
      if (set.bandIds.length > 0) {
        setSelectedBands(set.bandIds);
      }
    }
  }, [currentExIndex, currentSetIndex]);

  const handleToggleBand = (bandId: string) => {
    setSelectedBands(prev => {
      if (prev.includes(bandId)) {
        if (prev.length === 1) return prev;
        return prev.filter(id => id !== bandId);
      } else {
        return [...prev, bandId];
      }
    });
  };

  // Complete Set Action -> Transitions to REST (Leap Fitness style)
  const handleCompleteSet = () => {
    sound.playSetComplete();

    const updated = [...sessionLogs];
    const exSets = [...updated[currentExIndex].sets];
    exSets[currentSetIndex] = {
      ...exSets[currentSetIndex],
      reps: inputReps,
      bandIds: selectedBands,
      totalResistanceLbs: currentTotalResistance,
      completed: true,
    };
    updated[currentExIndex] = {
      ...updated[currentExIndex],
      sets: exSets,
    };
    setSessionLogs(updated);

    // Check if entire workout routine finished
    if (isLastSetInExercise && isLastExercise) {
      finishEntireWorkout(updated);
      return;
    }

    // Trigger Rest Screen
    const restTime = currentRoutineEx.targetRestSeconds || 25;
    setInitialRestDuration(restTime);
    setRestSecondsLeft(restTime);
    setPhase('rest');
    sound.speak('Take a rest.');
  };

  const advanceToNextSet = () => {
    if (isLastSetInExercise) {
      setCurrentExIndex(prev => prev + 1);
      setCurrentSetIndex(0);
    } else {
      setCurrentSetIndex(prev => prev + 1);
    }
  };

  const finishEntireWorkout = (logs: LoggedExercise[]) => {
    sound.playWorkoutComplete();
    const durationMinutes = Math.max(1, elapsedSeconds / 60);
    const totalCals = estimateWorkoutCalories(durationMinutes, userProfile.weightKg);
    const newLog: WorkoutSessionLog = {
      id: 'log-' + Date.now(),
      routineId: routine.id,
      routineName: routine.name,
      date: new Date().toISOString(),
      durationSeconds: elapsedSeconds,
      caloriesBurned: totalCals,
      exercises: logs,
      totalVolumeLbs: calculateVolume(logs),
    };
    saveWorkoutLog(newLog);
    setCompletedLog(newLog);
  };

  const calculateVolume = (logs: LoggedExercise[]) => {
    return logs.reduce((total, ex) => {
      return total + ex.sets.reduce((sSum, s) => sSum + (s.completed ? s.reps * s.totalResistanceLbs : 0), 0);
    }, 0);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const totalExercisesCount = routine.exercises.length;
  const activePrimaryBand = userProfile.ownedBands.find(b => selectedBands.includes(b.id));
  const activeBandColor = activePrimaryBand ? activePrimaryBand.colorHex : '#2979FF';
  const liveCalories = estimateWorkoutCalories(Math.max(0.1, elapsedSeconds / 60), userProfile.weightKg);

  return (
    <div className="fixed inset-0 z-50 bg-[#12161A] text-white flex flex-col select-none overflow-y-auto">
      {/* TOP APP BAR (Leap Fitness Style Minimal Header) */}
      <div className="sticky top-0 z-30 bg-[#1A2026] border-b border-[#242C35] px-4 py-2.5 landscape:py-1 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.confirm('Quit workout? Your current session progress will be lost.')) {
                onExit();
              }
            }}
            className="p-1.5 rounded-xl bg-[#242C35] hover:bg-[#2D3748] text-slate-300 transition-all"
            title="Exit"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs font-black uppercase text-[#2979FF]">
              {routine.name}
            </div>
            <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <span>{formatTime(elapsedSeconds)}</span>
              <span>•</span>
              <span className="text-[#FF6D00] font-bold flex items-center gap-0.5">
                <Flame className="w-3 h-3 fill-[#FF6D00]" />
                {liveCalories} kcal
              </span>
              <span>•</span>
              <span>Exercise {currentExIndex + 1}/{totalExercisesCount}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-all ${
              soundOn
                ? 'bg-[#242C35] text-[#2979FF] border-[#2979FF]/40'
                : 'bg-[#242C35] text-slate-500 border-[#2D3748]'
            }`}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {phase === 'work' && (
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                isPaused
                  ? 'bg-[#FF9100]/20 text-[#FF9100] border-[#FF9100]/40'
                  : 'bg-[#242C35] text-slate-300 border-[#2D3748]'
              }`}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 1. READY TO GO COUNTDOWN STAGE (Signature Leap Fitness Opening)   */}
      {/* ----------------------------------------------------------------- */}
      {phase === 'ready' && (
        <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 max-w-md landscape:max-w-4xl mx-auto w-full text-center animate-fadeIn landscape:my-auto landscape:justify-center">
          <div className="landscape:grid landscape:grid-cols-2 landscape:gap-8 landscape:items-center landscape:w-full">
            {/* Left Column in Landscape: Big Dial & Avatar */}
            <div className="flex flex-col items-center">
              <div className="mb-2 landscape:mb-3">
                <span className="text-xs font-black uppercase tracking-widest text-[#2979FF]">
                  Get Ready
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-black text-white mt-0.5 tracking-tight">
                  READY TO GO!
                </h2>
              </div>

              {/* Big Countdown Dial with Animated Avatar inside */}
              <div className="relative w-52 h-52 sm:w-64 sm:h-64 flex items-center justify-center my-2">
                <svg className="w-52 h-52 sm:w-64 sm:h-64 transform -rotate-90 absolute">
                  <circle
                    cx="104"
                    cy="104"
                    r="90"
                    stroke="#242C35"
                    strokeWidth="8"
                    fill="transparent"
                    className="sm:hidden"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="110"
                    stroke="#242C35"
                    strokeWidth="10"
                    fill="transparent"
                    className="hidden sm:block"
                  />
                  <circle
                    cx="104"
                    cy="104"
                    r="90"
                    stroke="#2979FF"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 90}
                    strokeDashoffset={2 * Math.PI * 90 * (1 - readySecondsLeft / 10)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-linear sm:hidden"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="110"
                    stroke="#2979FF"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 110}
                    strokeDashoffset={2 * Math.PI * 110 * (1 - readySecondsLeft / 10)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-linear hidden sm:block"
                  />
                </svg>

                {/* Animated Avatar demonstrating the first movement */}
                <div className="z-10 p-2 scale-90 sm:scale-100">
                  <WorkoutAvatar
                    animationType={currentExercise.avatarAnimation}
                    anchorPosition={currentExercise.anchorPosition}
                    exerciseName={currentExercise.name}
                    bandColorHex="#2979FF"
                    size="md"
                  />
                </div>
              </div>

              <div className="mt-2 flex flex-col items-center">
                <span className="font-heading font-black text-4xl sm:text-6xl text-white tracking-tighter">
                  {readySecondsLeft}
                </span>
                <span className="text-[11px] text-slate-400 font-bold uppercase">Seconds</span>
              </div>
            </div>

            {/* Right Column in Landscape: First Exercise Info & Start Button */}
            <div className="space-y-3 mt-4 landscape:mt-0 text-left">
              <div className="leap-card p-4 text-left border border-[#2D3748] flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-black uppercase text-[#2979FF] tracking-wider mb-0.5">
                    EXERCISE 1/{totalExercisesCount}
                  </div>
                  <div className="text-base sm:text-lg font-bold text-white line-clamp-1">
                    {currentExercise.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-2">
                    <span>Target: ×{currentRoutineEx.targetReps} reps</span>
                    <span>•</span>
                    <span>⚓ {currentExercise.anchorPosition}</span>
                  </div>
                </div>

                <a
                  href={getExerciseYoutubeUrl(currentExercise.id, currentExercise.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-500 hover:text-red-400 transition-all shrink-0 flex items-center gap-1.5 text-xs font-bold group/yt"
                  title="Watch demonstration video on YouTube"
                >
                  <YoutubeIcon className="w-4 h-4 fill-current group-hover/yt:scale-110 transition-transform" />
                  {getExerciseTimestampLabel(currentExercise.id) && (
                    <span className="font-mono text-[10px]">{getExerciseTimestampLabel(currentExercise.id)}</span>
                  )}
                </a>
              </div>

              <button
                onClick={() => {
                  sound.playStartWhistle();
                  sound.speak('Start!');
                  setPhase('work');
                }}
                className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#2979FF] hover:bg-[#1C64F2] text-white font-black text-base shadow-xl shadow-[#2979FF]/40 active:scale-95 transition-all text-center"
              >
                START NOW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 2. FULLSCREEN REST SCREEN (Leap Fitness Signature Rest Engine)    */}
      {/* ----------------------------------------------------------------- */}
      {phase === 'rest' && (
        <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 max-w-md landscape:max-w-4xl mx-auto w-full text-center animate-fadeIn landscape:my-auto landscape:justify-center">
          <div className="landscape:grid landscape:grid-cols-2 landscape:gap-8 landscape:items-center landscape:w-full">
            {/* Left Column in Landscape: Next Exercise Preview */}
            <div className="order-2 landscape:order-1 mt-4 landscape:mt-0">
              {nextExercise ? (
                <div className="leap-card p-4 text-left border border-[#2D3748] flex items-center gap-3">
                  <div className="shrink-0 bg-[#12161A] p-1.5 rounded-2xl border border-[#242C35]">
                    <WorkoutAvatar
                      animationType={nextExercise.avatarAnimation}
                      anchorPosition={nextExercise.anchorPosition}
                      exerciseName={nextExercise.name}
                      bandColorHex="#2979FF"
                      size="sm"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black uppercase text-[#2979FF] tracking-wider mb-0.5">
                      NEXT {nextExIndex + 1}/{totalExercisesCount}
                    </div>
                    <div className="text-sm font-bold text-white line-clamp-1">
                      {nextExercise.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Target: ×{nextRoutineEx?.targetReps} reps • ⚓ {nextExercise.anchorPosition}
                    </div>
                    {nextExercise.tips && (
                      <div className="text-[11px] text-[#00E5FF] mt-1 font-medium truncate">
                        💡 {nextExercise.tips}
                      </div>
                    )}
                  </div>

                  <a
                    href={getExerciseYoutubeUrl(nextExercise.id, nextExercise.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-500 hover:text-red-400 transition-all shrink-0 flex items-center justify-center self-center"
                    title="Watch demonstration video on YouTube"
                  >
                    <YoutubeIcon className="w-4 h-4 fill-current" />
                  </a>
                </div>
              ) : (
                <div className="leap-card p-4 text-center text-slate-400 text-xs">
                  Final exercise completed! Prepare for celebration.
                </div>
              )}
            </div>

            {/* Right Column in Landscape: Big Countdown Dial & Rest Buttons */}
            <div className="order-1 landscape:order-2 flex flex-col items-center">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#2979FF]">
                  Take A Rest
                </span>
                <h2 className="text-3xl sm:text-4xl font-heading font-black text-white mt-0.5 tracking-tight">
                  REST
                </h2>
              </div>

              {/* Big Circular Countdown Ring */}
              <div className="my-3 sm:my-6 relative flex items-center justify-center">
                <svg className="w-44 h-44 sm:w-56 sm:h-56 transform -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r="76"
                    stroke="#242C35"
                    strokeWidth="10"
                    fill="transparent"
                    className="sm:hidden"
                  />
                  <circle
                    cx="112"
                    cy="112"
                    r="96"
                    stroke="#242C35"
                    strokeWidth="12"
                    fill="transparent"
                    className="hidden sm:block"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r="76"
                    stroke="#2979FF"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 76}
                    strokeDashoffset={2 * Math.PI * 76 * (1 - restSecondsLeft / initialRestDuration)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-linear sm:hidden"
                  />
                  <circle
                    cx="112"
                    cy="112"
                    r="96"
                    stroke="#2979FF"
                    strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 96}
                    strokeDashoffset={2 * Math.PI * 96 * (1 - restSecondsLeft / initialRestDuration)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-linear hidden sm:block"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-heading font-black text-4xl sm:text-6xl text-white tracking-tighter">
                    {restSecondsLeft}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase mt-0.5 sm:mt-1">Seconds</span>
                </div>
              </div>

              {/* Rest Quick Action Buttons */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setRestSecondsLeft(prev => prev + 20)}
                  className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-[#1A2026] hover:bg-[#242C35] border border-[#2D3748] text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
                >
                  +20s
                </button>
                <button
                  onClick={() => {
                    sound.playStartWhistle();
                    sound.speak('Start!');
                    setPhase('work');
                    advanceToNextSet();
                  }}
                  className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl bg-[#2979FF] hover:bg-[#1C64F2] text-white font-black text-xs sm:text-sm shadow-lg shadow-[#2979FF]/40 active:scale-95 transition-all"
                >
                  SKIP REST
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 3. ACTIVE WORKOUT STAGE (Leap Fitness Signature Active Screen)    */}
      {/* ----------------------------------------------------------------- */}
      {phase === 'work' && (
        <div className="flex-1 flex flex-col justify-between max-w-md landscape:max-w-5xl mx-auto w-full p-3 sm:p-4 overflow-y-auto">
          <div className="landscape:grid landscape:grid-cols-12 landscape:gap-4 landscape:items-center">
            
            {/* Left Side in Landscape (col-span-7): Stage Graphic, Avatar, Exercise Title, Progress */}
            <div className="landscape:col-span-7 space-y-2">
              <div className="relative rounded-3xl bg-[#1A2026] border border-[#242C35] p-3 sm:p-4 text-center shadow-lg overflow-hidden">
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#2979FF]/15 text-[#2979FF] text-[11px] font-black uppercase border border-[#2979FF]/30">
                    {currentExercise.targetMuscle}
                  </span>

                  <button
                    onClick={() => setShowTips(!showTips)}
                    className="px-2.5 py-1 rounded-lg bg-[#242C35] text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#2979FF]" />
                    <span>Tips</span>
                  </button>
                </div>

                {/* Anchor & Band Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#12161A] text-slate-300 text-xs font-bold border border-[#2D3748] mb-1">
                  <span>⚓ {currentExercise.anchorPosition}</span>
                  <span>•</span>
                  <span>{currentExercise.bandType}</span>
                </div>

                {/* ANIMATED AVATAR HERO */}
                <div className="my-1 flex items-center justify-center">
                  <WorkoutAvatar
                    animationType={currentExercise.avatarAnimation}
                    anchorPosition={currentExercise.anchorPosition}
                    exerciseName={currentExercise.name}
                    bandColorHex={activeBandColor}
                    size="md"
                    isPaused={isPaused}
                  />
                </div>

                {/* Big Exercise Title + YouTube Timestamp Icon */}
                <div className="flex items-center justify-center gap-2 mt-1">
                  <h2 className="text-xl sm:text-2xl font-heading font-black text-white tracking-tight">
                    {currentExercise.name}
                  </h2>
                  <a
                    href={getExerciseYoutubeUrl(currentExercise.id, currentExercise.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-500 hover:text-red-400 transition-all flex items-center gap-1 shrink-0 text-xs font-bold"
                    title={`Watch exact demonstration on YouTube (${getExerciseTimestampLabel(currentExercise.id)})`}
                  >
                    <YoutubeIcon className="w-3.5 h-3.5 fill-current" />
                    {getExerciseTimestampLabel(currentExercise.id) && (
                      <span className="font-mono text-[10px]">{getExerciseTimestampLabel(currentExercise.id)}</span>
                    )}
                  </a>
                </div>

                {/* Set Progress Dots */}
                <div className="flex items-center justify-center gap-2 mt-2">
                  {sessionLogs[currentExIndex]?.sets.map((s, idx) => (
                    <div
                      key={idx}
                      className={`w-3 h-3 rounded-full transition-all ${
                        s.completed
                          ? 'bg-[#00E676] shadow-sm shadow-[#00E676]'
                          : idx === currentSetIndex
                          ? 'bg-[#2979FF] ring-4 ring-[#2979FF]/30'
                          : 'bg-[#242C35]'
                      }`}
                    />
                  ))}
                </div>

                {/* Form Tips Collapsible */}
                {showTips && (
                  <div className="mt-3 p-3 rounded-2xl bg-[#12161A] text-left text-xs space-y-1.5 border border-[#2D3748] animate-fadeIn max-h-40 overflow-y-auto">
                    <div className="font-bold text-[#2979FF]">Form Execution:</div>
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                      {currentExercise.formCues.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side in Landscape (col-span-5): Band Selector, Reps, and Checkmark Action Bar */}
            <div className="landscape:col-span-5 space-y-2.5 mt-3 landscape:mt-0">
              {/* BAND STACKING SELECTOR (Only shown for banded exercises when bands are active) */}
              {currentExercise.requiresBand && userProfile.hasResistanceBands !== false ? (
                <div className="leap-card p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                      Select / Stack Bands
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-[#2979FF]/15 text-[#2979FF] border border-[#2979FF]/30">
                      Total: {currentTotalResistance} {userProfile.unitSystem}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    {userProfile.ownedBands.slice(0, 6).map((band) => {
                      const isSelected = selectedBands.includes(band.id);
                      const weight = userProfile.unitSystem === 'kg' ? band.weightKg : band.weightLbs;
                      return (
                        <button
                          key={band.id}
                          onClick={() => handleToggleBand(band.id)}
                          className={`p-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 truncate ${
                            isSelected
                              ? 'bg-[#242C35] border-[#2979FF] text-white shadow-sm'
                              : 'bg-[#12161A] border-[#242C35] text-slate-400'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                            style={{ backgroundColor: band.colorHex }}
                          />
                          <span className="truncate">{weight}{userProfile.unitSystem}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="leap-card p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-white">
                      {currentExercise.requiresBar ? 'Pull-Up Bar Calisthenics' : 'Bodyweight Movement'}
                    </span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {currentExercise.requiresBar ? 'Pull-Up Bar' : 'No Gear Needed'}
                  </span>
                </div>
              )}

              {/* REPS COUNTER & ADJUSTER */}
              <div className="leap-card p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">
                    Reps Done
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-black text-2xl sm:text-3xl text-white">
                      ×{inputReps}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      (Target: {currentRoutineEx.targetReps})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setInputReps(prev => Math.max(1, prev - 1))}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#242C35] hover:bg-[#2D3748] text-white font-bold flex items-center justify-center transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setInputReps(prev => prev + 1)}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#242C35] hover:bg-[#2D3748] text-white font-bold flex items-center justify-center transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ACTION BAR */}
              <div className="pt-2 sm:pt-3 flex items-center justify-between px-2 sm:px-4">
                <button
                  onClick={() => {
                    if (currentExIndex > 0) {
                      setCurrentExIndex(prev => prev - 1);
                      setCurrentSetIndex(0);
                    }
                  }}
                  disabled={currentExIndex === 0}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#1A2026] hover:bg-[#242C35] border border-[#242C35] disabled:opacity-30 text-slate-300 flex items-center justify-center transition-all"
                  title="Previous Exercise"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                {/* GIANT CIRCULAR CHECKMARK BUTTON */}
                <button
                  onClick={handleCompleteSet}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#2979FF] to-[#00E5FF] hover:from-[#1C64F2] hover:to-[#00B0FF] text-white flex items-center justify-center shadow-2xl shadow-[#2979FF]/50 active:scale-95 transition-all ring-6 sm:ring-8 ring-[#2979FF]/20 group"
                  title="Finish Set & Rest"
                >
                  <Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3.5] group-hover:scale-110 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    if (isLastSetInExercise && isLastExercise) {
                      finishEntireWorkout(sessionLogs);
                    } else {
                      advanceToNextSet();
                    }
                  }}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#1A2026] hover:bg-[#242C35] border border-[#242C35] text-slate-300 flex items-center justify-center transition-all"
                  title="Skip Set"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Fullscreen Celebration Modal */}
      {completedLog && (
        <WorkoutCompleteModal
          workoutLog={completedLog}
          onClose={() => onFinished(completedLog)}
        />
      )}
    </div>
  );
};
