import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useBackClose } from '../../utils/backStack';
import { HowToSteps } from '../ExerciseLibrary/ExerciseLibraryView';
import { X, Volume2, VolumeX, Check, Plus, Minus, Shield, SkipForward, SkipBack, Flame, Repeat, Trophy, TrendingUp } from 'lucide-react';
import { Routine, Exercise, LoggedExercise, LoggedSet, WorkoutSessionLog, UserProfile } from '../../types';
import { EXERCISE_DATABASE, getExerciseById, getExerciseTimestampLabel } from '../../data/exerciseDatabase';
import { EXERCISE_SUBSTITUTIONS, isExerciseCompatible } from '../../utils/equipmentManager';
import { sound } from '../../utils/soundEffects';
import { estimateWorkoutCalories, sessionIntensityFor } from '../../utils/nutritionMath';
import { saveWorkoutLog, deleteWorkoutLog } from '../../utils/storage';
import { buildSetQueue, describeStep, QueueStep } from '../../utils/sessionQueue';
import { getPreviousPerformance, suggestNext, bestSetScore, setScore, repRange, Suggestion } from '../../utils/progression';
import { stackLoadLbs, toDisplay, bandRangeLabel, bandsByLoad } from '../../utils/bands';
import { haptic, keepScreenAwake } from '../../utils/device';
import { WorkoutCompleteModal } from './WorkoutCompleteModal';
import { WorkoutAvatar } from '../Common/WorkoutAvatar';
import { YoutubeIcon } from '../Common/YoutubeIcon';
import { ConfirmSheet } from '../Common/ConfirmSheet';
import { VideoDemoSheet } from '../Common/VideoDemoSheet';
import { WARMUPS, COOLDOWN, resolveMoves, focusFor, finishersFor, Finisher, TimedMove, WARMUP_VIDEO, COOLDOWN_VIDEO } from '../../data/sessionBlocks';
import { describeTempo } from '../../data/extraExercises';
import { getEquipmentMode } from '../../utils/equipmentManager';

interface WorkoutPlayerProps {
  routine: Routine;
  userProfile: UserProfile;
  workoutLogs: WorkoutSessionLog[];
  onExit: () => void;
  onFinished: (log: WorkoutSessionLog) => void;
}

type Phase = 'warmup' | 'ready' | 'work' | 'rest' | 'done' | 'finisher' | 'cooldown';

const READY_SECONDS = 10;
const REST_EXTRA_KEY = 'hyten_rest_extra';


const FALLBACK_EXERCISE: Exercise = {
  id: 'unknown',
  name: 'Exercise',
  targetMuscle: 'Full Body',
  bandType: 'None',
  anchorPosition: 'None',
  difficulty: 'Beginner',
  instructions: [],
  formCues: [],
  tips: '',
  estimatedCaloriesPerMin: 5,
};

function loadRestExtras(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(REST_EXTRA_KEY) || '{}');
  } catch {
    return {};
  }
}

const Ring: React.FC<{ fraction: number; size: number; stroke: number }> = ({ fraction, size, stroke }) => {
  const r = size / 2 - stroke;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgb(var(--hy-elevated))" strokeWidth={stroke} fill="transparent" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="rgb(var(--hy-primary))"
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={c * (1 - Math.max(0, Math.min(1, fraction)))}
        strokeLinecap="round"
        fill="transparent"
        style={{ transition: 'stroke-dashoffset 0.25s linear' }}
      />
    </svg>
  );
};

export const WorkoutPlayer: React.FC<WorkoutPlayerProps> = ({ routine, userProfile, workoutLogs, onExit, onFinished }) => {
  const unit = userProfile.unitSystem;
  const bandsOn = userProfile.hasResistanceBands !== false;
  const category = (routine as Routine & { category?: string }).category;

  // Exercises can be swapped mid-workout; overrides map exercise index -> exercise id.
  const [overrides, setOverrides] = useState<Record<number, string>>({});
  const exerciseAt = (i: number): Exercise => {
    const id = overrides[i] ?? routine.exercises[i]?.exerciseId;
    return getExerciseById(id) || { ...FALLBACK_EXERCISE, id };
  };

  // Paired exercises alternate set by set (A1, A2, A1, A2 …).
  const queue = useMemo<QueueStep[]>(() => buildSetQueue(routine, id => !!getExerciseById(id)?.isCompound), [routine]);

  // --- Timing: wall-clock based so a locked screen doesn't stall the timers ---
  const [phase, setPhase] = useState<Phase>('warmup');
  const [phaseEndsAt, setPhaseEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [isPaused, setIsPaused] = useState(false);
  const pausedLeftRef = useRef<number | null>(null);
  const workStartRef = useRef<number | null>(null);
  const pausedTotalRef = useRef(0);
  const pauseStartedRef = useRef<number | null>(null);
  const restTotalRef = useRef(30);
  const announcedRef = useRef<number>(-1);

  const [stepIndex, setStepIndex] = useState(0);
  const step = queue[stepIndex];
  const nextStep = queue[stepIndex + 1];
  const routineEx = routine.exercises[step?.exIndex ?? 0];
  const exercise = exerciseAt(step?.exIndex ?? 0);
  const usesBand = !!exercise.requiresBand && bandsOn;

  const [soundOn, setSoundOn] = useState(() => sound.isEnabled());
  const [showTips, setShowTips] = useState(false);
  const [videoFor, setVideoFor] = useState<Exercise | null>(null);
  const [showSwap, setShowSwap] = useState(false);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const isPostWorkout = phase === 'done' || phase === 'finisher' || phase === 'cooldown';
  // Back during active sets asks before ending it (never drops the session silently).
  // Post-workout back returns cleanly: finisher back ends finisher; cool-down/done back saves cleanly.
  useBackClose(!confirmQuit && !isPostWorkout, () => setConfirmQuit(true));
  useBackClose(phase === 'finisher', () => endFinisher());
  useBackClose(phase === 'cooldown' || phase === 'done', () => finishAndSave());
  useBackClose(showTips, () => setShowTips(false));
  useBackClose(showSwap, () => setShowSwap(false));
  const [prToast, setPrToast] = useState<string | null>(null);
  const [completedLog, setCompletedLog] = useState<WorkoutSessionLog | null>(null);
  const [restExtras, setRestExtras] = useState<Record<string, number>>(loadRestExtras);

  // Warm-up / cool-down: timed moves stepped through one by one.
  const gear = { bands: bandsOn, bar: userProfile.hasPullUpBar !== false };
  const warmMoves = useMemo(() => resolveMoves(WARMUPS[focusFor(category)], gear), [category, gear.bands, gear.bar]);
  const coolMoves = useMemo(() => resolveMoves(COOLDOWN, gear), [gear.bands, gear.bar]);
  const [blockIndex, setBlockIndex] = useState(0);
  const blockMoves: TimedMove[] = phase === 'cooldown' ? coolMoves : warmMoves;

  // Optional conditioning finisher after the last set.
  const finishers = useMemo(() => finishersFor(getEquipmentMode(userProfile)), [userProfile]);
  const [finisher, setFinisher] = useState<Finisher | null>(null);
  const [amrapRounds, setAmrapRounds] = useState(0);
  const [finisherDone, setFinisherDone] = useState<{ f: Finisher; rounds: number } | null>(null);
  const finalLogsRef = useRef<LoggedExercise[] | null>(null);
  const savedLogIdRef = useRef<string | null>(null);

  const [sessionLogs, setSessionLogs] = useState<LoggedExercise[]>(() =>
    routine.exercises.map(re => ({
      exerciseId: re.exerciseId,
      exerciseName: getExerciseById(re.exerciseId)?.name,
      sets: Array.from({ length: re.sets }).map((_, idx) => ({
        setNumber: idx + 1,
        reps: re.targetReps,
        bandIds: [],
        totalResistanceLbs: 0,
        completed: false,
      })),
    }))
  );

  // --- Progression: previous performance and today's suggestion ---
  const previous = useMemo(() => getPreviousPerformance(workoutLogs, exercise.id), [workoutLogs, exercise.id]);
  const suggestion: Suggestion = useMemo(
    () =>
      suggestNext({
        previous,
        targetReps: routineEx?.targetReps ?? 10,
        ownedBands: userProfile.ownedBands,
        usesBand,
        isAssisted: !!exercise.isAssisted,
        isTimed: !!exercise.isTimed,
        harderName: exercise.harderId ? getExerciseById(exercise.harderId)?.name : undefined,
      }),
    [previous, routineEx?.targetReps, userProfile.ownedBands, usesBand, exercise]
  );
  const bestBefore = useMemo(() => bestSetScore(workoutLogs, exercise.id), [workoutLogs, exercise.id]);

  // Active set inputs
  const [inputReps, setInputReps] = useState<number>(routineEx?.targetReps ?? 10);
  const [selectedBands, setSelectedBands] = useState<string[]>([]);
  const [rir, setRir] = useState<0 | 2 | 3 | undefined>(undefined);

  // Prefill each step: a set already logged shows its values; a later set of the
  // same exercise copies today's last set; otherwise use the suggestion.
  useEffect(() => {
    if (!step) return;
    const logged = sessionLogs[step.exIndex]?.sets[step.setIndex];
    const earlierToday = sessionLogs[step.exIndex]?.sets.filter(s => s.completed).slice(-1)[0];
    if (logged?.completed) {
      setInputReps(logged.seconds ?? logged.reps);
      setSelectedBands(logged.bandIds);
    } else if (earlierToday) {
      setInputReps(earlierToday.seconds ?? earlierToday.reps);
      setSelectedBands(earlierToday.bandIds);
    } else {
      setInputReps(suggestion.reps);
      setSelectedBands(usesBand ? suggestion.bandIds : []);
    }
    setRir(undefined);
    setShowTips(false);
    setShowSwap(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, exercise.id]);

  // --- Sound events, wake lock, ticker ---
  useEffect(() => {
    const handle = (e: Event) => setSoundOn((e as CustomEvent<boolean>).detail);
    window.addEventListener('bandfit_sound_change', handle);
    sound.unlockAudio();
    const release = keepScreenAwake();
    return () => {
      window.removeEventListener('bandfit_sound_change', handle);
      sound.stopAll();
      release();
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  const secondsLeft = isPaused
    ? pausedLeftRef.current ?? 0
    : phaseEndsAt
    ? Math.max(0, Math.ceil((phaseEndsAt - now) / 1000))
    : 0;

  const elapsedSeconds = workStartRef.current
    ? Math.max(
        0,
        Math.floor((now - workStartRef.current - pausedTotalRef.current - (pauseStartedRef.current ? now - pauseStartedRef.current : 0)) / 1000)
      )
    : 0;

  const startPhase = (p: Phase, seconds?: number) => {
    setPhase(p);
    announcedRef.current = -1;
    setPhaseEndsAt(seconds ? Date.now() + seconds * 1000 : null);
  };

  const beginWork = () => {
    if (!workStartRef.current) workStartRef.current = Date.now();
    sound.playStartWhistle();
    sound.speak('Start!');
    startPhase('work');
  };

  const advance = () => setStepIndex(i => Math.min(i + 1, queue.length - 1));

  // Countdown cues and transitions
  useEffect(() => {
    if (isPaused || !phaseEndsAt) return;
    if (announcedRef.current === secondsLeft) return;
    announcedRef.current = secondsLeft;

    if (phase === 'ready') {
      if (secondsLeft === READY_SECONDS) sound.speak(`Ready to go! First up: ${exercise.name}`);
      if (secondsLeft <= 3 && secondsLeft > 0) {
        sound.speak(String(secondsLeft));
        sound.playTick();
      }
      if (secondsLeft === 0) beginWork();
    }

    if (phase === 'rest') {
      const upcomingEx = nextStep ? exerciseAt(nextStep.exIndex) : null;
      if (secondsLeft === 5 && upcomingEx && nextStep) {
        const target = routine.exercises[nextStep.exIndex].targetReps;
        sound.speak(`Next: ${upcomingEx.name}, ${target} ${upcomingEx.isTimed ? 'seconds' : 'reps'}`);
      }
      if (secondsLeft <= 3 && secondsLeft > 0) sound.playTick();
      if (secondsLeft === 0) {
        haptic([60, 40, 60]);
        advance();
        beginWork();
      }
    }

    if ((phase === 'warmup' || phase === 'cooldown') && secondsLeft === 0) {
      haptic(40);
      nextBlockMove();
    }

    if (phase === 'finisher' && finisher) {
      const total = finisher.minutes * 60;
      if (finisher.kind === 'emom' && secondsLeft > 0 && secondsLeft < total && secondsLeft % 60 === 0) {
        const minute = (total - secondsLeft) / 60;
        const move = finisher.moves[minute % finisher.moves.length];
        sound.playStartWhistle();
        sound.speak(`${move.name}, ${move.reps}`);
        haptic([60, 40, 60]);
      }
      if (secondsLeft <= 3 && secondsLeft > 0) sound.playTick();
      if (secondsLeft === 0) endFinisher();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, phase, isPaused, phaseEndsAt]);

  // Announce each work set
  useEffect(() => {
    if (phase === 'work' && step) sound.speak(`${exercise.name}. ${describeStep(step)}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, stepIndex]);

  const startBlockMove = (index: number) => {
    setBlockIndex(index);
    const move = blockMoves[index];
    sound.speak(move.name);
    setPhaseEndsAt(Date.now() + move.seconds * 1000);
    announcedRef.current = -1;
  };

  const nextBlockMove = () => {
    if (blockIndex + 1 < blockMoves.length) {
      startBlockMove(blockIndex + 1);
    } else if (phase === 'warmup') {
      sound.speak('Warm-up done.');
      startPhase('ready', READY_SECONDS);
    } else {
      finishAndSave();
    }
  };

  const startFinisher = (f: Finisher) => {
    setFinisher(f);
    setAmrapRounds(0);
    sound.playStartWhistle();
    const first = f.moves[0];
    sound.speak(f.kind === 'emom' ? `${first.name}, ${first.reps}` : 'Go!');
    startPhase('finisher', f.minutes * 60);
  };

  const endFinisher = () => {
    if (finisher) {
      const total = finisher.minutes * 60;
      const elapsed = Math.max(1, Math.min(total, total - secondsLeft));
      const rounds = finisher.kind === 'amrap' ? amrapRounds : Math.min(finisher.minutes, Math.ceil(elapsed / 60));
      setFinisherDone({ f: finisher, rounds });
    }
    sound.speak('Finisher done.');
    setPhase('done');
    setPhaseEndsAt(null);
  };

  const startCooldown = () => {
    setPhase('cooldown');
    setBlockIndex(0);
    const move = coolMoves[0];
    sound.speak(move.name);
    setPhaseEndsAt(Date.now() + move.seconds * 1000);
    announcedRef.current = -1;
  };

  /** Save the session, including any finisher, once the user leaves the done screen. */
  const finishAndSave = () => {
    const base = finalLogsRef.current ?? sessionLogs;
    const extra: LoggedExercise[] = [];
    if (finisherDone) {
      const { f, rounds } = finisherDone;
      f.moves.forEach((m, i) => {
        const setsDone = f.kind === 'emom' ? Math.ceil((rounds - i) / f.moves.length) : rounds > 0 ? 1 : 0;
        const reps = f.kind === 'emom' ? m.reps : m.reps * rounds;
        if (setsDone > 0 && reps > 0) {
          extra.push({
            exerciseId: m.exerciseId,
            exerciseName: `${m.name} (${f.title})`,
            sets: Array.from({ length: setsDone }).map((_, j) => ({ setNumber: j + 1, reps, bandIds: [], totalResistanceLbs: 0, completed: true })),
          });
        }
      });
    }
    finish([...base, ...extra], false, true);
  };

  const togglePause = () => {
    if (isPaused) {
      if (pauseStartedRef.current) pausedTotalRef.current += Date.now() - pauseStartedRef.current;
      pauseStartedRef.current = null;
      if (pausedLeftRef.current !== null && phaseEndsAt) setPhaseEndsAt(Date.now() + pausedLeftRef.current * 1000);
      pausedLeftRef.current = null;
      setIsPaused(false);
    } else {
      pauseStartedRef.current = Date.now();
      pausedLeftRef.current = phaseEndsAt ? Math.max(0, Math.ceil((phaseEndsAt - Date.now()) / 1000)) : null;
      setIsPaused(true);
    }
  };

  const toggleSound = () => {
    if (sound.toggleSound()) {
      sound.playTick();
      sound.speak('Sound on');
    }
  };

  // --- Set logic ---
  const currentLoadLbs = usesBand ? stackLoadLbs(selectedBands, userProfile.ownedBands) : 0;
  const range = repRange(routineEx?.targetReps ?? 10, !!exercise.isTimed);

  const handleToggleBand = (bandId: string) => {
    setSelectedBands(prev => (prev.includes(bandId) ? (prev.length === 1 ? prev : prev.filter(id => id !== bandId)) : [...prev, bandId]));
  };

  const finish = (logs: LoggedExercise[], partial: boolean, showModal: boolean = true) => {
    // Nothing done: leave without saving an empty workout.
    if (!logs.some(l => l.sets.some(s => s.completed))) {
      if (showModal) onExit();
      return;
    }
    if (showModal) sound.playWorkoutComplete();
    const durationSeconds = Math.max(60, elapsedSeconds);
    const doneLogs = partial
      ? logs.map(l => ({ ...l, sets: l.sets.filter(s => s.completed) })).filter(l => l.sets.length)
      : logs;
    const logId = savedLogIdRef.current || ('log-' + Date.now());
    savedLogIdRef.current = logId;

    const log: WorkoutSessionLog = {
      id: logId,
      routineId: routine.id,
      routineName: routine.name,
      date: new Date().toISOString(),
      durationSeconds,
      caloriesBurned: estimateWorkoutCalories(durationSeconds / 60, userProfile.weightKg, sessionIntensityFor(category)),
      exercises: doneLogs,
      totalVolumeLbs: Math.round(
        doneLogs.reduce((t, ex) => t + ex.sets.reduce((a, s) => a + (s.completed ? s.reps * s.totalResistanceLbs : 0), 0), 0)
      ),
      partial: partial || undefined,
      notes: finisherDone ? `Finisher: ${finisherDone.f.title}${finisherDone.f.kind === 'amrap' ? ` · ${finisherDone.rounds} rounds` : ''}` : undefined,
    };
    saveWorkoutLog(log);
    if (showModal) {
      setCompletedLog(log);
    }
  };

  const handleCompleteSet = () => {
    if (!step) return;
    sound.playSetComplete();
    haptic(40);

    // Assisted moves: the band helps, so it's logged as assistance, not load.
    const assisted = !!exercise.isAssisted && usesBand;
    const set: LoggedSet = {
      setNumber: step.setIndex + 1,
      reps: exercise.isTimed ? 1 : inputReps,
      seconds: exercise.isTimed ? inputReps : undefined,
      bandIds: usesBand ? selectedBands : [],
      totalResistanceLbs: assisted ? 0 : currentLoadLbs,
      assistanceLbs: assisted ? currentLoadLbs : undefined,
      completed: true,
      rir,
    };

    const updated = sessionLogs.map((ex, i) =>
      i === step.exIndex
        ? { ...ex, exerciseId: exercise.id, exerciseName: exercise.name, sets: ex.sets.map((s, j) => (j === step.setIndex ? set : s)) }
        : ex
    );
    setSessionLogs(updated);

    // Live personal record against previous sessions and today's earlier sets.
    const todayBest = Math.max(0, ...sessionLogs[step.exIndex].sets.filter(s => s.completed).map(setScore));
    if (bestBefore > 0 && setScore(set) > Math.max(bestBefore, todayBest)) {
      setPrToast(`New best on ${exercise.name}!`);
      haptic([30, 30, 80]);
      setTimeout(() => setPrToast(null), 3000);
    }

    if (stepIndex >= queue.length - 1) {
      finalLogsRef.current = updated;
      sound.speak('All sets done.');
      setPhase('done');
      setPhaseEndsAt(null);
      // Auto-save immediately upon completion of the last set!
      finish(updated, false, false);
      return;
    }

    const rest = step.restAfter + (restExtras[exercise.id] || 0);
    restTotalRef.current = rest;
    sound.speak('Rest.');
    startPhase('rest', rest);
  };

  const addRest = () => {
    if (!phaseEndsAt) return;
    setPhaseEndsAt(phaseEndsAt + 20000);
    restTotalRef.current += 20;
    // Remember the extra rest for this exercise next time (capped at +90 s).
    const updated = { ...restExtras, [exercise.id]: Math.min(90, (restExtras[exercise.id] || 0) + 20) };
    setRestExtras(updated);
    try {
      localStorage.setItem(REST_EXTRA_KEY, JSON.stringify(updated));
    } catch {
      /* ignore */
    }
  };

  const skipRest = () => {
    advance();
    beginWork();
  };

  const completedCount = sessionLogs.reduce((n, ex) => n + ex.sets.filter(s => s.completed).length, 0);

  // Swap options: substitutes, ladder neighbours, same-muscle moves that fit the gear.
  const swapOptions = useMemo(() => {
    const ids = new Set<string>();
    const sub = EXERCISE_SUBSTITUTIONS[exercise.id];
    if (sub) Object.values(sub).forEach(v => v && ids.add(v));
    if (exercise.easierId) ids.add(exercise.easierId);
    if (exercise.harderId) ids.add(exercise.harderId);
    EXERCISE_DATABASE.filter(e => e.targetMuscle === exercise.targetMuscle).forEach(e => ids.add(e.id));
    ids.delete(exercise.id);
    return [...ids]
      .map(id => getExerciseById(id))
      .filter((e): e is Exercise => !!e && isExerciseCompatible(e, userProfile))
      .slice(0, 8);
  }, [exercise, userProfile]);

  const liveCalories = estimateWorkoutCalories(Math.max(0.1, elapsedSeconds / 60), userProfile.weightKg, sessionIntensityFor(category));
  const formatTime = (secs: number) => `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
  const bandColor = userProfile.ownedBands.find(b => selectedBands.includes(b.id))?.colorHex || '#6EA8FF';
  const upcoming = nextStep ? exerciseAt(nextStep.exIndex) : null;
  const unitLabel = exercise.isTimed ? 's' : '';

  if (!step) return null;

  return (
    <div className="fixed inset-0 z-50 bg-hy-bg text-hy-text flex flex-col overflow-y-auto">
      <ConfirmSheet
        open={confirmQuit}
        title="End this workout?"
        message={completedCount ? `You've finished ${completedCount} set${completedCount === 1 ? '' : 's'}.` : 'Nothing has been logged yet.'}
        secondaryLabel={completedCount ? 'Save what I did' : undefined}
        onSecondary={() => {
          setConfirmQuit(false);
          const isComplete = !!finalLogsRef.current;
          finish(sessionLogs, !isComplete);
        }}
        confirmLabel="Discard workout"
        destructive
        onConfirm={() => {
          setConfirmQuit(false);
          if (savedLogIdRef.current) {
            deleteWorkoutLog(savedLogIdRef.current);
            savedLogIdRef.current = null;
          }
          onExit();
        }}
        cancelLabel="Keep going"
        onCancel={() => setConfirmQuit(false)}
      />
      <VideoDemoSheet exerciseId={videoFor?.id ?? null} exerciseName={videoFor?.name} onClose={() => setVideoFor(null)} />

      {prToast && (
        <div role="status" className="fixed top-16 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 rounded-2xl bg-hy-volt text-hy-on-primary text-sm font-black shadow-xl flex items-center gap-2">
          <Trophy className="w-4 h-4" /> {prToast}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-30 bg-hy-surface border-b border-hy-elevated px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button 
            type="button" 
            onClick={() => {
              if (phase === 'finisher') {
                endFinisher();
              } else if (phase === 'cooldown' || phase === 'done') {
                finishAndSave();
              } else {
                setConfirmQuit(true);
              }
            }} 
            aria-label="End workout" 
            className="w-11 h-11 shrink-0 rounded-xl bg-hy-elevated text-hy-text-2 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="text-xs font-black uppercase text-hy-primary truncate">{routine.name}</div>
            <div className="text-xs text-hy-text-2 font-mono flex items-center gap-2">
              <span>{formatTime(elapsedSeconds)}</span>
              <span aria-hidden="true">•</span>
              <span className="text-hy-orange font-bold flex items-center gap-0.5" title="Estimated calories">
                <Flame className="w-3 h-3" />
                {liveCalories} kcal est.
              </span>
              <span aria-hidden="true">•</span>
              <span>
                Set {stepIndex + 1}/{queue.length}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
            className={`w-11 h-11 rounded-xl border flex items-center justify-center ${soundOn ? 'bg-hy-elevated text-hy-primary border-hy-primary/40' : 'bg-hy-elevated text-hy-text-3 border-hy-border'}`}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          {(phase === 'work' || phase === 'rest' || ((phase === 'finisher' || phase === 'warmup' || phase === 'cooldown') && !!phaseEndsAt)) && (
            <button
              type="button"
              onClick={togglePause}
              className={`min-h-[44px] px-3 rounded-xl border text-xs font-bold ${isPaused ? 'bg-hy-warning/20 text-hy-warning border-hy-warning/40' : 'bg-hy-elevated text-hy-text border-hy-border'}`}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          )}
        </div>
      </div>

      {/* 0. WARM-UP and 5. COOL-DOWN: guided timed moves */}
      {(phase === 'warmup' || phase === 'cooldown') && (
        <div className="flex-1 max-w-md mx-auto w-full p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-black">{phase === 'warmup' ? 'Warm-up' : 'Cool-down'}</h2>
            <a href={phase === 'warmup' ? WARMUP_VIDEO : COOLDOWN_VIDEO} target="_blank" rel="noopener noreferrer" aria-label="Follow-along video" className="w-11 h-11 rounded-full bg-hy-surface border border-hy-border flex items-center justify-center">
              <YoutubeIcon className="w-4 h-4 fill-current text-red-500" />
            </a>
          </div>
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="relative flex items-center justify-center">
              <Ring fraction={phaseEndsAt ? secondsLeft / blockMoves[blockIndex].seconds : 1} size={180} stroke={10} />
              <span className="absolute font-heading font-black text-5xl">{phaseEndsAt ? secondsLeft : blockMoves[blockIndex].seconds}</span>
            </div>
            <div className="text-lg font-bold text-center">{blockMoves[blockIndex].name}</div>
            <p className="text-sm text-hy-text-2 text-center max-w-xs">{blockMoves[blockIndex].cue}</p>
          </div>
          <ol className="space-y-1.5" aria-label="Moves">
            {blockMoves.map((m, i) => (
              <li key={m.name} className={`flex items-center justify-between rounded-2xl px-4 min-h-[44px] text-sm ${i === blockIndex ? 'bg-hy-elevated text-hy-text font-bold' : i < blockIndex ? 'text-hy-text-3 line-through' : 'bg-hy-surface text-hy-text-2'}`}>
                <span>{m.name}</span>
                <span className="font-mono text-xs">{m.seconds}s</span>
              </li>
            ))}
          </ol>
          <div className="grid grid-cols-2 gap-2 mt-auto">
            {!phaseEndsAt ? (
              <button type="button" onClick={() => startBlockMove(blockIndex)} className="min-h-[56px] rounded-full bg-hy-primary text-hy-on-primary font-black">
                Start
              </button>
            ) : (
              <button type="button" onClick={nextBlockMove} className="min-h-[56px] rounded-full bg-hy-primary text-hy-on-primary font-black">
                Next
              </button>
            )}
            <button
              type="button"
              onClick={() => (phase === 'warmup' ? startPhase('ready', READY_SECONDS) : finishAndSave())}
              className="min-h-[56px] rounded-full bg-hy-surface border border-hy-border font-bold"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* 4. SESSION DONE: optional finisher and cool-down */}
      {phase === 'done' && (
        <div className="flex-1 max-w-md mx-auto w-full p-4 flex flex-col gap-4">
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-hy-primary text-hy-on-primary flex items-center justify-center">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h2 className="text-2xl font-heading font-black mt-3">All sets done</h2>
            <p className="text-sm text-hy-text-2 mt-1">{formatTime(elapsedSeconds)} · {completedCount} sets</p>
          </div>
          {!finisherDone && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-widest text-hy-text-3 px-1">Finisher</div>
              {finishers.map(f => (
                <button key={f.kind} type="button" onClick={() => startFinisher(f)} className="w-full hy-card p-4 text-left flex items-center justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block font-bold">{f.title}</span>
                    <span className="block text-sm text-hy-text-2 truncate">{f.moves.map(m => `${m.reps} ${m.name.toLowerCase()}`).join(' · ')}</span>
                  </span>
                  <span className="text-xs font-mono text-hy-text-3 shrink-0">{f.minutes} min</span>
                </button>
              ))}
            </div>
          )}
          {finisherDone && (
            <div className="hy-card p-4 text-sm">
              <span className="font-bold">{finisherDone.f.title} done</span>
              {finisherDone.f.kind === 'amrap' && <span className="text-hy-text-2"> · {finisherDone.rounds} rounds</span>}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 mt-auto">
            <button type="button" onClick={startCooldown} className="min-h-[56px] rounded-full bg-hy-surface border border-hy-border font-bold">
              Cool-down
            </button>
            <button type="button" onClick={finishAndSave} className="min-h-[56px] rounded-full bg-hy-primary text-hy-on-primary font-black">
              Finish
            </button>
          </div>
        </div>
      )}

      {/* 4b. FINISHER: EMOM or AMRAP timer */}
      {phase === 'finisher' && finisher && (
        <div className="flex-1 max-w-md mx-auto w-full p-4 flex flex-col items-center gap-4 text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-hy-text-3">{finisher.title}</div>
          <div className="relative flex items-center justify-center">
            <Ring fraction={secondsLeft / (finisher.minutes * 60)} size={200} stroke={12} />
            <span className="absolute font-heading font-black text-5xl">{formatTime(secondsLeft)}</span>
          </div>
          {finisher.kind === 'emom' ? (
            (() => {
              const minute = Math.min(finisher.minutes - 1, Math.floor((finisher.minutes * 60 - secondsLeft) / 60));
              const move = finisher.moves[minute % finisher.moves.length];
              return (
                <div>
                  <div className="text-sm text-hy-text-2">Minute {minute + 1} of {finisher.minutes}</div>
                  <div className="text-2xl font-black mt-1">{move.reps} {move.name}</div>
                  <div className="text-sm text-hy-text-2 mt-1">Rest for the rest of the minute</div>
                </div>
              );
            })()
          ) : (
            <div className="w-full space-y-3">
              <ul className="hy-card p-4 text-left space-y-1.5 text-sm">
                {finisher.moves.map(m => (
                  <li key={m.exerciseId} className="flex justify-between">
                    <span>{m.name}</span>
                    <span className="font-mono text-hy-text-2">{m.reps}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-center gap-4">
                <span className="text-4xl font-black font-heading" aria-live="polite">{amrapRounds}</span>
                <span className="text-sm text-hy-text-2">rounds</span>
                <button type="button" onClick={() => { setAmrapRounds(r => r + 1); haptic(30); }} aria-label="Add a round" className="w-14 h-14 rounded-full bg-hy-primary text-hy-on-primary flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
          <button type="button" onClick={endFinisher} className="mt-auto min-h-[48px] px-6 rounded-full bg-hy-surface border border-hy-border font-bold">
            End finisher
          </button>
        </div>
      )}

      {/* 1. READY */}
      {phase === 'ready' && (
        <div className="flex-1 max-w-md mx-auto w-full p-4 flex flex-col items-center text-center gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-hy-primary">Get ready</div>
            <h2 className="text-3xl font-heading font-black mt-1">Starting in</h2>
          </div>
          <div className="relative flex items-center justify-center">
            <Ring fraction={secondsLeft / READY_SECONDS} size={200} stroke={10} />
            <span className="absolute font-heading font-black text-6xl">{secondsLeft}</span>
          </div>
          <div className="hy-card p-4 w-full text-left flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-black uppercase text-hy-primary">{describeStep(step)}</div>
              <div className="text-lg font-bold truncate">{exercise.name}</div>
              <div className="text-sm text-hy-text-2">
                Target {range.low}–{range.high}
                {exercise.isTimed ? ' s' : ' reps'} · ⚓ {exercise.anchorPosition}
              </div>
            </div>
            <button type="button" onClick={() => setVideoFor(exercise)} aria-label={`Watch ${exercise.name} demo`} className="min-w-[44px] min-h-[44px] px-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center gap-1 text-xs font-bold">
              <YoutubeIcon className="w-4 h-4 fill-current" />
              {getExerciseTimestampLabel(exercise.id)}
            </button>
          </div>
          <button type="button" onClick={beginWork} className="w-full min-h-[56px] rounded-2xl bg-hy-primary text-hy-on-primary font-black text-base">
            Start now
          </button>
        </div>
      )}

      {/* 2. REST */}
      {phase === 'rest' && (
        <div className="flex-1 max-w-md mx-auto w-full p-4 flex flex-col items-center text-center gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-hy-primary">Rest</div>
            <div className="relative flex items-center justify-center mt-2">
              <Ring fraction={secondsLeft / Math.max(1, restTotalRef.current)} size={200} stroke={12} />
              <span className="absolute font-heading font-black text-6xl" aria-live="polite">
                {secondsLeft}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={addRest} className="min-h-[48px] px-5 rounded-2xl bg-hy-surface border border-hy-border font-bold">
              +20 s
            </button>
            <button type="button" onClick={skipRest} className="min-h-[48px] px-7 rounded-2xl bg-hy-primary text-hy-on-primary font-black">
              Skip rest
            </button>
          </div>
          {upcoming && nextStep && (
            <div className="hy-card p-4 w-full text-left flex items-center gap-3">
              <div className="shrink-0 bg-hy-bg p-1.5 rounded-2xl border border-hy-elevated">
                <WorkoutAvatar animationType={upcoming.avatarAnimation} anchorPosition={upcoming.anchorPosition} exerciseName={upcoming.name} size="sm" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black uppercase text-hy-primary">Next · {describeStep(nextStep)}</div>
                <div className="text-base font-bold truncate">{upcoming.name}</div>
                <div className="text-sm text-hy-text-2">
                  {routine.exercises[nextStep.exIndex].targetReps}
                  {upcoming.isTimed ? ' s' : ' reps'} · ⚓ {upcoming.anchorPosition}
                </div>
              </div>
              <button type="button" onClick={() => setVideoFor(upcoming)} aria-label={`Watch ${upcoming.name} demo`} className="w-11 h-11 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center">
                <YoutubeIcon className="w-4 h-4 fill-current" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. WORK */}
      {phase === 'work' && (
        <div className="flex-1 max-w-md landscape:max-w-5xl mx-auto w-full p-3 space-y-3 landscape:grid landscape:grid-cols-2 landscape:gap-4 landscape:space-y-0">
          <div className="space-y-3">
            <div className="rounded-3xl bg-hy-surface border border-hy-elevated p-3 text-center">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-hy-primary/15 text-hy-primary text-xs font-black uppercase">{describeStep(step)}</span>
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => setShowSwap(s => !s)} aria-expanded={showSwap} className="min-h-[44px] px-2.5 rounded-lg bg-hy-elevated text-xs font-semibold flex items-center gap-1">
                    <Repeat className="w-3.5 h-3.5" /> Swap
                  </button>
                  <button type="button" onClick={() => setShowTips(s => !s)} aria-expanded={showTips} className="min-h-[44px] px-2.5 rounded-lg bg-hy-elevated text-xs font-semibold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-hy-primary" /> How to
                  </button>
                </div>
              </div>

              <div className="my-1 flex items-center justify-center">
                <WorkoutAvatar animationType={exercise.avatarAnimation} anchorPosition={exercise.anchorPosition} exerciseName={exercise.name} bandColorHex={bandColor} size="lg" isPaused={isPaused} />
              </div>

              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-heading font-black tracking-tight">{exercise.name}</h2>
                <button type="button" onClick={() => setVideoFor(exercise)} aria-label={`Watch ${exercise.name} demo`} className="min-w-[44px] min-h-[44px] px-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 flex items-center gap-1 text-xs font-bold">
                  <YoutubeIcon className="w-4 h-4 fill-current" />
                  {getExerciseTimestampLabel(exercise.id)}
                </button>
              </div>
              <div className="text-sm text-hy-text-2 mt-0.5">
                {exercise.targetMuscle}
                {(routineEx?.tempo || exercise.tempo) && (
                  <span title={describeTempo(routineEx?.tempo || exercise.tempo || '')}> · Tempo {routineEx?.tempo || exercise.tempo}</span>
                )}
              </div>

              {showTips && (
                <div className="mt-3 p-3 rounded-2xl bg-hy-bg text-left text-sm space-y-3 border border-hy-border max-h-80 overflow-y-auto">
                  <HowToSteps ex={exercise} compact />
                  <div className="font-bold text-hy-primary">Form</div>
                  <ul className="list-disc list-inside text-hy-text space-y-1">
                    {exercise.formCues.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                  {exercise.commonMistakes?.length ? (
                    <>
                      <div className="font-bold text-hy-danger">Avoid</div>
                      <ul className="list-disc list-inside text-hy-text-2 space-y-1">
                        {exercise.commonMistakes.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              )}

              {showSwap && (
                <div className="mt-3 p-2 rounded-2xl bg-hy-bg text-left border border-hy-border space-y-1">
                  <div className="text-xs font-bold text-hy-text-2 px-1">Swap for the rest of this workout</div>
                  {swapOptions.length === 0 && <div className="text-sm text-hy-text-2 px-1 py-2">No alternatives fit your equipment.</div>}
                  {swapOptions.map(o => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => {
                        setOverrides(prev => ({ ...prev, [step.exIndex]: o.id }));
                        setShowSwap(false);
                      }}
                      className="w-full min-h-[44px] px-2 rounded-xl hover:bg-hy-surface text-sm text-left flex items-center justify-between"
                    >
                      <span>{o.name}</span>
                      <span className="text-xs text-hy-text-3">{o.id === exercise.easierId ? 'Easier' : o.id === exercise.harderId ? 'Harder' : o.difficulty}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Suggestion and previous performance */}
            <div className="hy-card p-3 space-y-2">
              <div className={`flex items-start gap-2 text-sm ${suggestion.kind === 'step-up' || suggestion.kind === 'harder-variant' ? 'text-hy-volt' : 'text-hy-text'}`}>
                <TrendingUp className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{suggestion.message}</span>
              </div>
              {previous && (
                <div className="text-xs text-hy-text-2">
                  <span className="font-bold uppercase">Previous</span>{' '}
                  {previous.sets
                    .map(s => {
                      const amount = s.seconds ?? s.reps;
                      const load = s.assistanceLbs
                        ? `assist ${toDisplay(s.assistanceLbs, unit)}${unit}`
                        : s.totalResistanceLbs
                        ? `${toDisplay(s.totalResistanceLbs, unit)}${unit}`
                        : '';
                      return `${amount}${exercise.isTimed ? 's' : ''}${load ? ` @ ${load}` : ''}`;
                    })
                    .join(' · ')}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {/* Bands */}
            {usesBand ? (
              <div className="hy-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase text-hy-text-2">{exercise.isAssisted ? 'Assistance band' : 'Bands (tap to stack)'}</span>
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-hy-primary/15 text-hy-primary" title="Rated load at the midpoint of each band's range">
                    {exercise.isAssisted ? 'Assist' : 'Load'} ≈ {toDisplay(currentLoadLbs, unit)} {unit}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {bandsByLoad(userProfile.ownedBands)
                    .slice(0, 6)
                    .map(band => {
                      const on = selectedBands.includes(band.id);
                      return (
                        <button
                          key={band.id}
                          type="button"
                          onClick={() => handleToggleBand(band.id)}
                          aria-pressed={on}
                          aria-label={`${band.name}, rated ${bandRangeLabel(band, unit)}`}
                          className={`min-h-[44px] p-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${on ? 'bg-hy-elevated border-hy-primary text-hy-text' : 'bg-hy-bg border-hy-elevated text-hy-text-2'}`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20" style={{ backgroundColor: band.colorHex }} />
                          <span className="truncate">{bandRangeLabel(band, unit)}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            ) : (
              <div className="hy-card p-3 text-sm font-bold">{exercise.requiresBar ? 'Pull-up bar' : 'Bodyweight'}: no bands needed</div>
            )}

            {/* Reps or seconds */}
            <div className="hy-card p-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-hy-text-2 block">{exercise.isTimed ? 'Seconds held' : 'Reps done'}</span>
                <span className="font-heading font-black text-5xl" aria-live="polite">
                  {inputReps}
                  {unitLabel}
                </span>
                <span className="text-xs text-hy-text-2 block">
                  Range {range.low}–{range.high}
                  {unitLabel}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setInputReps(p => Math.max(1, p - (exercise.isTimed ? 5 : 1)))} aria-label="Decrease" className="w-14 h-14 rounded-2xl bg-hy-elevated flex items-center justify-center">
                  <Minus className="w-5 h-5" />
                </button>
                <button type="button" onClick={() => setInputReps(p => p + (exercise.isTimed ? 5 : 1))} aria-label="Increase" className="w-14 h-14 rounded-2xl bg-hy-elevated flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Effort */}
            <div className="hy-card p-3">
              <div className="text-xs font-black uppercase text-hy-text-2 mb-2">Reps left in the tank?</div>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Reps left in the tank">
                {([
                  [0, 'None'],
                  [2, '1–2'],
                  [3, '3+'],
                ] as [0 | 2 | 3, string][]).map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={rir === v}
                    onClick={() => setRir(rir === v ? undefined : v)}
                    className={`min-h-[44px] rounded-xl text-sm font-bold border ${rir === v ? 'bg-hy-primary text-hy-on-primary border-hy-primary' : 'bg-hy-bg border-hy-elevated text-hy-text-2'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between px-2 pt-1">
              <button
                type="button"
                onClick={() => setStepIndex(i => Math.max(0, i - 1))}
                disabled={stepIndex === 0}
                aria-label="Previous set"
                className="w-14 h-14 rounded-2xl bg-hy-surface border border-hy-elevated disabled:opacity-30 flex items-center justify-center"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button type="button" onClick={handleCompleteSet} aria-label="Set done" className="w-20 h-20 rounded-full bg-hy-primary text-hy-on-primary flex items-center justify-center shadow-2xl active:scale-95 transition-transform">
                <Check className="w-10 h-10 stroke-[3.5]" />
              </button>
              <button
                type="button"
                onClick={() => (stepIndex >= queue.length - 1 ? finish(sessionLogs, true) : advance())}
                aria-label="Skip set"
                className="w-14 h-14 rounded-2xl bg-hy-surface border border-hy-elevated flex items-center justify-center"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {completedLog && <WorkoutCompleteModal workoutLog={completedLog} unit={unit} onClose={() => onFinished(completedLog)} />}
    </div>
  );
};
