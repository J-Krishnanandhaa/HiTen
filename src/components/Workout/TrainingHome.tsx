import React, { useState } from 'react';
import { Play, Plus, Clock, Trophy, SlidersHorizontal, Volume2, VolumeX, ArrowLeft, X, Moon } from 'lucide-react';
import { Routine, UserProfile, WorkoutSessionLog } from '../../types';
import { getExerciseById } from '../../data/exerciseDatabase';
import { LeapRoutine, PREBUILT_ROUTINES } from '../../data/prebuiltWorkouts';
import { RoutineBuilderModal } from './RoutineBuilderModal';
import { WorkoutAvatar } from '../Common/WorkoutAvatar';
import { scaleRoutineToDuration, DURATION_PRESETS } from '../../utils/routineScaler';
import {
  getEquipmentMode,
  getRoutinesForEquipment,
  getChallengeRoutineForEquipment,
  getWorkdayTierRoutineMap,
  SCHEDULE_WEEKLY_GOAL,
} from '../../utils/equipmentManager';
import { computeWeeklyStreak } from '../../utils/streak';
import { shouldSuggestDeload } from '../../utils/progression';
import { sound } from '../../utils/soundEffects';

type Schedule = '4-day' | '5-day' | '6-day';
type Tier = 1 | 2 | 3;

const TIER_LABEL: Record<Tier, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
const TIER_PILL: Record<Tier, string> = {
  1: 'text-hy-success bg-hy-success/10',
  2: 'text-hy-warning bg-hy-warning/10',
  3: 'text-hy-danger bg-hy-danger/10',
};
const CATEGORIES = ['All', 'Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Core', 'Full Body Flow', 'Mine'];
const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Strip emoji and decoration from routine names. */
export const cleanName = (name: string) =>
  name.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/\s{2,}/g, ' ').trim();

const readLS = <T extends string>(key: string, allowed: readonly T[], fallback: T): T => {
  try {
    const v = localStorage.getItem(key) as T | null;
    if (v && allowed.includes(v)) return v;
  } catch { /* storage unavailable */ }
  return fallback;
};
const writeLS = (key: string, value: string) => {
  try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
};

interface TrainingHomeProps {
  routines: Routine[];
  userProfile: UserProfile;
  recentLogs: WorkoutSessionLog[];
  onStartRoutine: (routine: Routine) => void;
  onSaveRoutine: (routine: Routine) => void;
  onUpdateUserProfile: (updated: UserProfile) => void;
}

const Thumb: React.FC<{ exerciseId?: string; big?: boolean }> = ({ exerciseId, big }) => {
  const ex = exerciseId ? getExerciseById(exerciseId) : undefined;
  return (
    <div className={`${big ? 'h-28' : 'w-14 h-14'} rounded-2xl bg-hy-bg-2 overflow-hidden flex items-center justify-center shrink-0`}>
      <div className={big ? 'scale-[1.05]' : 'scale-[0.58]'}>
        <WorkoutAvatar animationType={ex?.avatarAnimation} anchorPosition={ex?.anchorPosition} exerciseName={ex?.name} size="sm" isPaused={!big} />
      </div>
    </div>
  );
};

const Segment = <T extends string | number>({ options, value, onChange, label }: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string;
}) => (
  <div>
    <div className="text-xs text-hy-text-3 mb-2">{label}</div>
    <div className="flex gap-1.5 flex-wrap">
      {options.map(o => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={`min-h-[40px] px-4 rounded-full text-sm font-semibold transition-colors ${
            value === o.value ? 'bg-hy-primary text-hy-on-primary' : 'bg-hy-elevated text-hy-text-2'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  </div>
);

export const TrainingHome: React.FC<TrainingHomeProps> = ({
  routines, userProfile, recentLogs, onStartRoutine, onSaveRoutine, onUpdateUserProfile,
}) => {
  const [schedule, setScheduleState] = useState<Schedule>(() => readLS('bandfit_schedule_mode', ['4-day', '5-day', '6-day'] as const, '4-day'));
  const [tier, setTierState] = useState<Tier>(() => Number(readLS('bandfit_workday_tier', ['1', '2', '3'] as const, '2')) as Tier);
  const [category, setCategory] = useState('All');
  const [open, setOpen] = useState<LeapRoutine | null>(null);
  const [showPlan, setShowPlan] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [soundOn, setSoundOn] = useState(() => sound.isEnabled());

  const minutes = userProfile.targetWorkoutDurationMins || 20;
  const mode = getEquipmentMode(userProfile);
  const pool = getRoutinesForEquipment(mode);
  const challenge = getChallengeRoutineForEquipment(mode);
  const challengeDone = Math.min(28, recentLogs.filter(l => l.routineId === challenge.id && !l.partial).length);
  const streak = computeWeeklyStreak(recentLogs, userProfile.weeklyGoal || 4);
  const deloadDue = shouldSuggestDeload(recentLogs);

  const setSchedule = (s: Schedule) => {
    setScheduleState(s);
    writeLS('bandfit_schedule_mode', s);
    onUpdateUserProfile({ ...userProfile, weeklyGoal: SCHEDULE_WEEKLY_GOAL[s] });
  };
  const setTier = (t: Tier) => { setTierState(t); writeLS('bandfit_workday_tier', String(t)); };
  const setMinutes = (m: number) => onUpdateUserProfile({ ...userProfile, targetWorkoutDurationMins: m });
  const toggleSound = () => {
    const on = sound.toggleSound();
    setSoundOn(on);
    if (on) sound.playTick();
  };

  const scale = (r: Routine) => scaleRoutineToDuration(r, minutes, userProfile) as LeapRoutine;
  const findRoutine = (id: string) => pool.find(r => r.id === id) || PREBUILT_ROUTINES.find(r => r.id === id);

  // Week strip (Mon-first)
  const now = new Date();
  const todayIdx = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - todayIdx);
  monday.setHours(0, 0, 0, 0);
  const week = DAY_LETTERS.map((letter, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const done = recentLogs.some(l => new Date(l.date).toDateString() === d.toDateString());
    return { letter, date: d.getDate(), done, isToday: i === todayIdx };
  });

  const plan = getWorkdayTierRoutineMap(mode, schedule);
  const todayId = plan[todayIdx]?.[tier] || '';
  const todayBase = todayId ? findRoutine(todayId) : undefined;
  const today = todayBase ? scale(todayBase) : null;

  const custom = routines.filter(r => r.isCustom) as LeapRoutine[];
  const list: LeapRoutine[] = category === 'Mine'
    ? custom
    : pool.filter(r => r.category !== '7x4 Challenge' && (category === 'All' || r.category === category));
  const chips = custom.length ? CATEGORIES : CATEGORIES.filter(c => c !== 'Mine');

  const name = userProfile.name?.trim() || 'Athlete';

  return (
    <div className="space-y-6 pb-28 animate-fadeIn">
      {/* Header */}
      <header className="flex items-center gap-3 pt-2">
        <div className="w-11 h-11 rounded-full bg-hy-elevated flex items-center justify-center text-base font-bold text-hy-text">
          {name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-lg font-bold text-hy-text truncate">Hi, {name}</div>
          {streak.weeks > 0 && <div className="text-xs text-hy-text-3">{streak.weeks}-week streak</div>}
        </div>
        <button type="button" onClick={toggleSound} aria-label={soundOn ? 'Mute voice coach' : 'Unmute voice coach'}
          className="w-11 h-11 rounded-full bg-hy-surface flex items-center justify-center text-hy-text-2">
          {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
        <button type="button" onClick={() => setShowPlan(true)} aria-label="Plan settings"
          className="w-11 h-11 rounded-full bg-hy-surface flex items-center justify-center text-hy-text-2">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </header>

      {/* Challenge pill */}
      <button type="button" onClick={() => setOpen(scale(challenge))}
        className="w-full flex items-center gap-3 p-2 pr-2 rounded-full bg-hy-surface text-left">
        <span className="w-11 h-11 rounded-full bg-hy-elevated flex items-center justify-center shrink-0">
          <Trophy className="w-5 h-5 text-hy-text" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-bold text-hy-text">28-day challenge</span>
          <span className="block text-xs text-hy-text-3">Day {Math.min(28, challengeDone + 1)} of 28</span>
        </span>
        <span className="px-5 h-11 rounded-full bg-hy-primary text-hy-on-primary text-sm font-bold flex items-center">Start</span>
      </button>

      {/* Week strip */}
      <div className="grid grid-cols-7 gap-1 text-center" aria-label="This week">
        {week.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-xs text-hy-text-3">{d.letter}</span>
            <span className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold relative ${
              d.isToday ? 'bg-hy-primary text-hy-on-primary' : d.done ? 'bg-hy-elevated text-hy-text' : 'text-hy-text-2'
            }`}>
              {d.date}
              {d.done && <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-hy-success" />}
            </span>
          </div>
        ))}
      </div>

      {/* Today */}
      {today ? (
        <div className="rounded-3xl bg-hy-surface p-4 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-hy-text-3">Today</div>
            <div className="text-xl font-bold text-hy-text mt-0.5 line-clamp-2">{cleanName(today.name)}</div>
            <div className="text-xs text-hy-text-2 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {today.estimatedDurationMins} min · {today.exercises.length} exercises
            </div>
            {deloadDue && tier !== 1 && (
              <button type="button" onClick={() => setTier(1)} className="mt-2 text-xs text-hy-warning underline underline-offset-2">
                Tired? Switch to an easy week
              </button>
            )}
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => onStartRoutine(today)}
                className="h-11 px-5 rounded-full bg-hy-primary text-hy-on-primary text-sm font-bold flex items-center gap-1.5">
                <Play className="w-4 h-4 fill-current" /> Start
              </button>
              <button type="button" onClick={() => setOpen(today)} className="h-11 px-5 rounded-full bg-hy-elevated text-hy-text text-sm font-semibold">
                View
              </button>
            </div>
          </div>
          <div className="w-28 shrink-0"><Thumb exerciseId={today.exercises[0]?.exerciseId} big /></div>
        </div>
      ) : (
        <div className="rounded-3xl bg-hy-surface p-4 flex items-center gap-3">
          <span className="w-11 h-11 rounded-full bg-hy-elevated flex items-center justify-center"><Moon className="w-5 h-5 text-hy-text-2" /></span>
          <div>
            <div className="text-base font-bold text-hy-text">Rest day</div>
            <div className="text-xs text-hy-text-3">Or pick any workout below</div>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto -mx-3 px-3 no-scrollbar">
        {chips.map(c => (
          <button key={c} type="button" onClick={() => setCategory(c)}
            className={`h-10 px-4 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              category === c ? 'bg-hy-primary text-hy-on-primary' : 'bg-hy-surface text-hy-text-2'
            }`}>
            {c === 'Full Body Flow' ? 'Full body' : c}
          </button>
        ))}
      </div>

      {/* Workouts */}
      <section>
        <h2 className="text-base font-bold text-hy-text mb-3">Workouts</h2>
        <div className="flex gap-3 overflow-x-auto -mx-3 px-3 pb-1 no-scrollbar snap-x">
          {list.map(r => {
            const s = scale(r);
            const t = (r.tier || 1) as Tier;
            return (
              <button key={r.id} type="button" onClick={() => setOpen(s)}
                className="w-40 shrink-0 snap-start rounded-3xl bg-hy-surface p-2 text-left">
                <Thumb exerciseId={r.exercises[0]?.exerciseId} big />
                <div className="px-1.5 pt-2 pb-1">
                  <div className="text-sm font-bold text-hy-text line-clamp-2 min-h-[2.5rem]">{cleanName(r.name)}</div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-hy-text-3 flex items-center gap-1"><Clock className="w-3 h-3" />{s.estimatedDurationMins} min</span>
                    {!r.isCustom && <span className={`text-xs px-2 py-0.5 rounded-full ${TIER_PILL[t]}`}>{TIER_LABEL[t]}</span>}
                  </div>
                </div>
              </button>
            );
          })}
          <button type="button" onClick={() => setShowBuilder(true)}
            className="w-40 shrink-0 snap-start rounded-3xl border border-dashed border-hy-border flex flex-col items-center justify-center gap-2 text-hy-text-2 min-h-[11rem]">
            <Plus className="w-6 h-6" />
            <span className="text-sm font-semibold">Build your own</span>
          </button>
        </div>
      </section>

      {/* Routine detail */}
      {open && (
        <div className="fixed inset-0 z-50 bg-hy-bg overflow-y-auto animate-fadeIn" role="dialog" aria-modal="true" aria-label={cleanName(open.name)}>
          <div className="max-w-xl mx-auto px-4 pt-4 pb-32">
            <button type="button" onClick={() => setOpen(null)} aria-label="Back"
              className="w-11 h-11 rounded-full bg-hy-surface flex items-center justify-center text-hy-text">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-hy-text mt-4">{cleanName(open.name)}</h1>
            <div className="flex gap-2 mt-3 flex-wrap text-xs">
              <span className="px-3 py-1.5 rounded-full bg-hy-surface text-hy-text-2">{open.estimatedDurationMins} min</span>
              <span className="px-3 py-1.5 rounded-full bg-hy-surface text-hy-text-2">{open.exercises.length} exercises</span>
              {open.tier && <span className={`px-3 py-1.5 rounded-full ${TIER_PILL[open.tier]}`}>{TIER_LABEL[open.tier]}</span>}
            </div>

            {!open.isCustom && (
              <div className="flex gap-1.5 mt-5 overflow-x-auto no-scrollbar">
                {DURATION_PRESETS.map(m => (
                  <button key={m} type="button"
                    onClick={() => {
                      setMinutes(m);
                      const base = findRoutine(open.id) || open;
                      setOpen(scaleRoutineToDuration(base, m, userProfile) as LeapRoutine);
                    }}
                    className={`h-9 px-3.5 rounded-full text-xs font-semibold shrink-0 ${
                      open.estimatedDurationMins === m ? 'bg-hy-primary text-hy-on-primary' : 'bg-hy-surface text-hy-text-2'
                    }`}>
                    {m}m
                  </button>
                ))}
              </div>
            )}

            <ul className="mt-5 space-y-2">
              {open.exercises.map((re, i) => {
                const ex = getExerciseById(re.exerciseId);
                const amount = ex?.isTimed ? `${re.targetReps} s` : `${re.targetReps}`;
                const tempo = re.tempo || ex?.tempo;
                return (
                  <li key={`${re.exerciseId}-${i}`} className="flex items-center gap-3 p-2 rounded-2xl bg-hy-surface">
                    <Thumb exerciseId={re.exerciseId} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-hy-text truncate">{ex?.name || re.exerciseId}</div>
                      <div className="text-xs text-hy-text-3">{re.sets} × {amount}{tempo ? ` · tempo ${tempo}` : ''}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="fixed bottom-0 inset-x-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-hy-bg via-hy-bg to-transparent">
            <button type="button" onClick={() => { const r = open; setOpen(null); onStartRoutine(r); }}
              className="max-w-xl mx-auto w-full h-14 rounded-full bg-hy-primary text-hy-on-primary text-base font-bold flex items-center justify-center gap-2">
              <Play className="w-5 h-5 fill-current" /> Start
            </button>
          </div>
        </div>
      )}

      {/* Plan settings */}
      {showPlan && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center" role="dialog" aria-modal="true" aria-label="Plan" onClick={() => setShowPlan(false)}>
          <div className="w-full max-w-xl rounded-t-3xl bg-hy-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-hy-text">Plan</h2>
              <button type="button" onClick={() => setShowPlan(false)} aria-label="Close" className="w-10 h-10 rounded-full bg-hy-elevated flex items-center justify-center text-hy-text-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <Segment label="Days per week" value={schedule} onChange={setSchedule}
              options={[{ value: '4-day', label: '4' }, { value: '5-day', label: '5' }, { value: '6-day', label: '6' }]} />
            <Segment label="Intensity" value={tier} onChange={setTier}
              options={[{ value: 1, label: 'Easy' }, { value: 2, label: 'Medium' }, { value: 3, label: 'Hard' }]} />
            <Segment label="Minutes" value={minutes} onChange={setMinutes}
              options={DURATION_PRESETS.map(m => ({ value: m, label: String(m) }))} />
          </div>
        </div>
      )}

      {showBuilder && <RoutineBuilderModal onSave={onSaveRoutine} onClose={() => setShowBuilder(false)} />}
    </div>
  );
};
