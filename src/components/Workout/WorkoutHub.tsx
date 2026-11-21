import React, { useState } from 'react';
import { 
  Play, Plus, Dumbbell, Flame, Clock, Trophy, ChevronRight, 
  Check, Info, X, Zap, ArrowLeft, Layers, Sliders, ExternalLink, Calendar, Coffee 
} from 'lucide-react';
import { Routine, Exercise, UserProfile, WorkoutSessionLog } from '../../types';
import { EXERCISE_DATABASE, getExerciseYoutubeUrl, getExerciseTimestampLabel } from '../../data/exerciseDatabase';
import { LeapRoutine, PREBUILT_ROUTINES } from '../../data/prebuiltWorkouts';
import { RoutineBuilderModal } from './RoutineBuilderModal';
import { WorkoutAvatar } from '../Common/WorkoutAvatar';
import { YoutubeIcon } from '../Common/YoutubeIcon';
import { scaleRoutineToDuration, getDurationPresetInfo } from '../../utils/routineScaler';
import { 
  getEquipmentMode, 
  getRoutinesForEquipment, 
  getChallengeRoutineForEquipment, 
  getWorkdayTierRoutineMap 
} from '../../utils/equipmentManager';

interface WorkoutHubProps {
  routines: Routine[];
  userProfile: UserProfile;
  recentLogs: WorkoutSessionLog[];
  onStartRoutine: (routine: Routine) => void;
  onSaveRoutine: (routine: Routine) => void;
  onOpenBandsSetup: () => void;
  onUpdateUserProfile?: (updated: UserProfile) => void;
}

export const WorkoutHub: React.FC<WorkoutHubProps> = ({
  routines,
  userProfile,
  recentLogs,
  onStartRoutine,
  onSaveRoutine,
  onOpenBandsSetup,
  onUpdateUserProfile,
}) => {
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<LeapRoutine | null>(null);
  const [inspectingExercise, setInspectingExercise] = useState<Exercise | null>(null);
  const [showChallengeMatrix, setShowChallengeMatrix] = useState(false);
  const [showWorkdayScheduleModal, setShowWorkdayScheduleModal] = useState(false);

  // Filter states (Split by Experience & Body Parts)
  const [selectedTier, setSelectedTier] = useState<number | 'all'>('all'); // 1, 2, 3, 'all'
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Weekly Goal calculation: Mon-Sun
  const today = new Date();
  const currentDayOfWeek = (today.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const thisWeekCompletedDays = [false, false, false, false, false, false, false];
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - currentDayOfWeek);
  thisWeekStart.setHours(0, 0, 0, 0);

  recentLogs.forEach(log => {
    const logDate = new Date(log.date);
    if (logDate >= thisWeekStart) {
      const dayIdx = (logDate.getDay() + 6) % 7;
      thisWeekCompletedDays[dayIdx] = true;
    }
  });

  const completedCount = thisWeekCompletedDays.filter(Boolean).length;
  const totalCaloriesBurned = recentLogs.reduce((acc, log) => acc + (log.caloriesBurned || 0), 0);

  // Master Program PPL Workday Split Architectures (Push / Pull / Legs)
  const [scheduleMode, setScheduleModeState] = useState<'4-day' | '5-day' | '6-day'>(() => {
    try {
      const saved = localStorage.getItem('bandfit_schedule_mode');
      if (saved === '4-day' || saved === '5-day' || saved === '6-day') {
        return saved as '4-day' | '5-day' | '6-day';
      }
    } catch (e) {}
    return '4-day';
  });

  const setScheduleMode = (mode: '4-day' | '5-day' | '6-day') => {
    setScheduleModeState(mode);
    try {
      localStorage.setItem('bandfit_schedule_mode', mode);
    } catch (e) {}
  };

  const getWorkdaySchedule = (mode: '4-day' | '5-day' | '6-day') => {
    if (mode === '4-day') {
      return [
        {
          dayIndex: 0,
          dayName: 'Monday',
          shortDay: 'Mon',
          focus: 'Push (Chest, Delts, Triceps)',
          cues: 'Horizontal & Vertical Push • Pecs, deltoids & tricep extension',
          science: 'Fresh start of the week; taxes anterior pushing chain while back and legs rest.',
          icon: '⚡',
          isRest: false,
        },
        {
          dayIndex: 1,
          dayName: 'Tuesday',
          shortDay: 'Tue',
          focus: 'Pull (Lats, Rear Delts, Biceps)',
          cues: 'Pulling & Posture • Desk slouch antidote, lats, traps & bicep hypertrophy',
          science: 'Antagonistic pulling pairs perfectly after push; fixes posture and decompresses spine.',
          icon: '⚡',
          isRest: false,
        },
        {
          dayIndex: 2,
          dayName: 'Wednesday',
          shortDay: 'Wed',
          focus: 'Rest & Active Recovery',
          cues: 'Mid-Week Decompression • Spine hang, light walk & systemic recovery',
          science: '48-hour upper body recovery before lower body training keeps CNS primed.',
          icon: '☕',
          isRest: true,
        },
        {
          dayIndex: 3,
          dayName: 'Thursday',
          shortDay: 'Thu',
          focus: 'Legs (Quads, Hamstrings, Glutes)',
          cues: 'Lower Body Drive • Squats, RDLs, lunges & calf burnouts',
          science: 'Upper body completely rests while lower body power & metabolic drive peak.',
          icon: '⚡',
          isRest: false,
        },
        {
          dayIndex: 4,
          dayName: 'Friday',
          shortDay: 'Fri',
          focus: 'Full Body Flow',
          cues: 'Metabolic Conditioning • Total body compound flow & calorie burn',
          science: 'High-tempo weekend metabolic circuit boosting dopamine without CNS exhaustion.',
          icon: '⚡',
          isRest: false,
        },
        {
          dayIndex: 5,
          dayName: 'Saturday',
          shortDay: 'Sat',
          focus: 'Core & Mobility (Optional)',
          cues: 'Midline Stability • Hanging knee raises, obliques & core decompression',
          science: 'Bulletproofs the core & spine with low CNS strain before Sunday recharge.',
          icon: '☕',
          isRest: true,
        },
        {
          dayIndex: 6,
          dayName: 'Sunday',
          shortDay: 'Sun',
          focus: 'Rest & Recharge',
          cues: 'Active Recovery • Hydrate, stretch, sleep & prepare for the week',
          science: 'Full neuromuscular recovery and psychological reset for the new cycle.',
          icon: '☕',
          isRest: true,
        },
      ];
    } else if (mode === '5-day') {
      return [
        {
          dayIndex: 0,
          dayName: 'Monday',
          shortDay: 'Mon',
          focus: 'Push (Chest, Delts, Triceps)',
          cues: 'Horizontal & Vertical Push • Pecs, deltoids & tricep extension',
          science: 'Fresh start of the week; taxes anterior pushing chain.',
          icon: '⚡',
          isRest: false,
        },
        {
          dayIndex: 1,
          dayName: 'Tuesday',
          shortDay: 'Tue',
          focus: 'Pull (Lats, Rear Delts, Biceps)',
          cues: 'Pulling & Posture • Lats, traps & bicep hypertrophy',
          science: 'Antagonistic pulling pairs smoothly after push.',
          icon: '⚡',
          isRest: false,
        },
        {
          dayIndex: 2,
          dayName: 'Wednesday',
          shortDay: 'Wed',
          focus: 'Legs (Quads, Hamstrings, Glutes)',
          cues: 'Lower Body Drive • Squats, RDLs & lunges',
          science: 'Complete lower body stimulus while upper body recovers.',
          icon: '⚡',
          isRest: false,
        },
        {
          dayIndex: 3,
          dayName: 'Thursday',
          shortDay: 'Thu',
          focus: 'Rest & Active Recovery',
          cues: 'Mid-Week Rest • Spine decompression & walking',
          science: 'Protects connective tissue and prevents CNS fatigue accumulation.',
          icon: '☕',
          isRest: true,
        },
        {
          dayIndex: 4,
          dayName: 'Friday',
          shortDay: 'Fri',
          focus: 'Full Body Flow',
          cues: 'Metabolic Conditioning • Total body compound flow',
          science: 'High-tempo circuit boosting dopamine before the weekend.',
          icon: '⚡',
          isRest: false,
        },
        {
          dayIndex: 5,
          dayName: 'Saturday',
          shortDay: 'Sat',
          focus: 'Core & Conditioning',
          cues: 'Midline Stability • Hanging raises & obliques',
          science: 'Targeted trunk armor before Sunday rest.',
          icon: '⚡',
          isRest: false,
        },
        {
          dayIndex: 6,
          dayName: 'Sunday',
          shortDay: 'Sun',
          focus: 'Rest & Recharge',
          cues: 'Active Recovery • Hydrate & sleep',
          science: 'Complete rest before the next training block.',
          icon: '☕',
          isRest: true,
        },
      ];
    } else {
      return [
        {
          dayIndex: 0,
          dayName: 'Monday',
          shortDay: 'Mon',
          focus: 'Push 1 (Strength Focus)',
          cues: 'Horizontal & Vertical Push • Pecs, deltoids & triceps',
          science: 'First push session focusing on compound progressive overload.',
          icon: '⚡',
          isRest: false,
        },
        {
          dayIndex: 1,
          dayName: 'Tuesday',
          shortDay: 'Tue',
          focus: 'Pull 1 (Strength Focus)',
          cues: 'Pulling & Posture • Lats, rear delts & bicep hypertrophy',
          science: 'First pull session with vertical & horizontal lat recruitment.',
          icon: '⚡',
          isRest: false,
        },
        {
          dayIndex: 2,
          dayName: 'Wednesday',
          shortDay: 'Wed',
          focus: 'Legs 1 (Quad & Glute Drive)',
          cues: 'Lower Body Drive • Squats, lunges & knee flexion',
          science: 'Lower body foundation with upper body in recovery mode.',
          icon: '⚡',
          isRest: false,
        },
        {
          dayIndex: 3,
          dayName: 'Thursday',
          shortDay: 'Thu',
          focus: 'Push 2 (Hypertrophy Focus)',
          cues: 'Pushing Hypertrophy • Incline angles & tricep pump',
          science: 'Second push rotation with 72-hour recovery from Monday.',
          icon: '⚡',
          isRest: false,
        },
        {
          dayIndex: 4,
          dayName: 'Friday',
          shortDay: 'Fri',
          focus: 'Pull 2 (Width & Density)',
          cues: 'Pulling Hypertrophy • Rear delts, rows & arm burnout',
          science: 'High-volume back training before the weekend.',
          icon: '⚡',
          isRest: false,
        },
        {
          dayIndex: 5,
          dayName: 'Saturday',
          shortDay: 'Sat',
          focus: 'Core & Conditioning',
          cues: 'Midline & Posterior Chain • Core stability & conditioning',
          science: 'Ties together the 6-day cycle before Sunday total rest.',
          icon: '⚡',
          isRest: false,
        },
        {
          dayIndex: 6,
          dayName: 'Sunday',
          shortDay: 'Sun',
          focus: 'Rest & Recharge',
          cues: 'Active Recovery • Hydrate, sleep & prepare for the week',
          science: 'Full systemic recovery across all muscle groups.',
          icon: '☕',
          isRest: true,
        },
      ];
    }
  };

  const WORKDAY_SPLIT = getWorkdaySchedule(scheduleMode);
  const weeklyTarget = WORKDAY_SPLIT.filter(d => !d.isRest).length;

  const [workdayTier, setWorkdayTierState] = useState<1 | 2 | 3>(() => {
    try {
      const saved = localStorage.getItem('bandfit_workday_tier');
      if (saved === '1' || saved === '2' || saved === '3') {
        return parseInt(saved) as 1 | 2 | 3;
      }
    } catch (e) {}
    return 2;
  });

  const setWorkdayTier = (tier: 1 | 2 | 3) => {
    setWorkdayTierState(tier);
    try {
      localStorage.setItem('bandfit_workday_tier', tier.toString());
    } catch (e) {}
  };

  const equipmentMode = getEquipmentMode(userProfile);

  // 1. Get routines for this equipment mode
  const activeEquipmentRoutines = getRoutinesForEquipment(equipmentMode);

  // 2. Get the workday split routine mapping for this equipment mode and schedule mode
  const resolvedTierRoutines = getWorkdayTierRoutineMap(equipmentMode, scheduleMode);

  // 3. Get the challenge routine for this equipment mode
  const challengeRoutine = getChallengeRoutineForEquipment(equipmentMode);

  const targetDuration = userProfile.targetWorkoutDurationMins || 20;

  const handleUpdateGlobalDuration = (mins: number) => {
    if (onUpdateUserProfile) {
      onUpdateUserProfile({
        ...userProfile,
        targetWorkoutDurationMins: mins,
      });
    }
  };
  const currentPlan = WORKDAY_SPLIT[currentDayOfWeek];
  const activeRoutineId = resolvedTierRoutines[currentDayOfWeek]?.[workdayTier] || '';
  const isRestDay = !activeRoutineId || currentPlan.isRest;
  const rawTodayRoutine = !isRestDay
    ? (activeEquipmentRoutines.find(p => p.id === activeRoutineId) || PREBUILT_ROUTINES.find(p => p.id === activeRoutineId))
    : null;
  const todayRoutine = rawTodayRoutine ? (scaleRoutineToDuration(rawTodayRoutine, targetDuration, userProfile) as LeapRoutine) : null;
  const todayTotalSets = todayRoutine?.exercises.reduce((acc, e) => acc + e.sets, 0) || 0;
  const durationPreset = getDurationPresetInfo(targetDuration);

  // Filtered routines based on equipment, level and category selection
  const filteredRoutines = activeEquipmentRoutines.filter(r => {
    if (r.category === '7x4 Challenge') return false; // Handled in hero
    const matchesTier = selectedTier === 'all' || r.tier === selectedTier;
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    return matchesTier && matchesCategory;
  });

  const bodyCategories = [
    { id: 'all', name: 'All' },
    { id: 'Push', name: 'Push' },
    { id: 'Pull', name: 'Pull' },
    { id: 'Legs', name: 'Legs' },
    { id: 'Core', name: 'Core' },
    { id: 'Full Body Flow', name: 'Full Body Flow' },
  ];

  // Leap Fitness Routine Card Component
  const renderRoutineCard = (routine: LeapRoutine) => {
    const tier = routine.tier || 1;
    const tierColor = tier === 1 ? '#00E676' : tier === 2 ? '#FF9100' : '#FF3D00';
    const scaled = scaleRoutineToDuration(routine, targetDuration, userProfile) as LeapRoutine;
    const totalSets = scaled.exercises.reduce((acc, e) => acc + e.sets, 0);

    return (
      <div
        key={routine.id}
        onClick={() => setSelectedRoutine(scaled)}
        className="leap-card-interactive p-4 cursor-pointer flex items-center justify-between gap-3 group"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {/* Lightning bolt tier badge (Symbols only to optimize space) */}
            <span
              className="px-1.5 py-0.5 rounded text-[11px] font-black border tracking-tighter"
              style={{
                color: tierColor,
                backgroundColor: `${tierColor}15`,
                borderColor: `${tierColor}30`,
              }}
            >
              {'⚡'.repeat(tier)}
            </span>

            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#00E5FF]" />
              <span>{targetDuration} mins</span>
            </span>

            <span className="text-[11px] text-slate-300 font-semibold">
              {scaled.exercises.length} Exercises ({totalSets} Sets)
            </span>
          </div>

          <h4 className="text-base font-heading font-black text-white group-hover:text-[#2979FF] transition-colors truncate">
            {routine.name}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
            {routine.description}
          </p>
        </div>

        {/* Chevron forward icon */}
        <div className="w-8 h-8 rounded-full bg-[#242C35] group-hover:bg-[#2979FF] text-slate-400 group-hover:text-white flex items-center justify-center shrink-0 transition-all">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // FULLSCREEN ROUTINE OVERVIEW VIEW (LEAP FITNESS APP STYLE)
  // ---------------------------------------------------------------------------
  if (selectedRoutine) {
    return (
      <div className="min-h-screen bg-[#12161A] text-white flex flex-col max-w-xl md:max-w-4xl lg:max-w-5xl landscape:max-w-5xl mx-auto animate-fadeIn select-none">
        {/* Top Header Banner with Back Button */}
        <div className="sticky top-0 z-30 bg-[#1A2026] border-b border-[#242C35] px-4 py-2.5 landscape:py-2 flex items-center justify-between">
          <button
            onClick={() => setSelectedRoutine(null)}
            className="p-2 rounded-xl bg-[#242C35] hover:bg-[#2D3748] text-slate-200 flex items-center gap-1 text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <span className="text-xs font-black uppercase text-[#2979FF] tracking-wider truncate max-w-[200px]">
            {selectedRoutine.name}
          </span>

          <div className="w-8" />
        </div>

        {/* Content Area with Landscape 2-Column Split */}
        <div className="flex-1 landscape:grid landscape:grid-cols-12 landscape:gap-5 landscape:p-4 pb-20">
          {/* Routine Banner Info & Summary Card */}
          <div className="landscape:col-span-5 p-5 bg-gradient-to-br from-[#1E3C72] to-[#12161A] border-b landscape:border border-[#242C35] landscape:rounded-3xl landscape:h-fit landscape:sticky landscape:top-14">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className="text-xs font-black px-2 py-0.5 rounded-full border tracking-tighter"
                style={{
                  color: (selectedRoutine.tier || 1) === 1 ? '#00E676' : (selectedRoutine.tier || 1) === 2 ? '#FF9100' : '#FF3D00',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                }}
              >
                {'⚡'.repeat(selectedRoutine.tier || 1)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
              {selectedRoutine.name}
            </h1>
            <p className="text-xs text-white/80 mt-1 max-w-md">
              {selectedRoutine.description}
            </p>

            <div className="flex items-center gap-4 text-xs font-bold text-white/90 mt-4 pt-3 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>{selectedRoutine.estimatedDurationMins} Mins</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-[#2979FF]" />
                <span>{selectedRoutine.exercises.length} Exercises ({selectedRoutine.exercises.reduce((acc, e) => acc + e.sets, 0)} Total Sets)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#FF6D00]" />
                <span>~{selectedRoutine.estimatedDurationMins * 7} Kcal</span>
              </div>
            </div>

            {/* Quick Session Duration Adjuster */}
            <div className="mt-3.5 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-white/80 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Session Duration:</span>
                </span>
                <span className="text-[11px] font-black text-[#00E5FF]">
                  {selectedRoutine.estimatedDurationMins} Mins
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {[10, 15, 20, 25, 30, 40].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      handleUpdateGlobalDuration(mins);
                      const base = PREBUILT_ROUTINES.find(r => r.id === selectedRoutine.id) || selectedRoutine;
                      setSelectedRoutine(scaleRoutineToDuration(base, mins, userProfile) as LeapRoutine);
                    }}
                    className={`py-1 rounded-lg text-[10px] font-black border transition-all ${
                      selectedRoutine.estimatedDurationMins === mins
                        ? 'bg-[#00E5FF] text-slate-950 border-[#00E5FF] shadow-sm font-black'
                        : 'bg-black/30 text-white/70 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop / Landscape Quick Start Button inside Banner */}
            <button
              onClick={() => onStartRoutine(selectedRoutine)}
              className="hidden landscape:flex mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#2979FF] to-[#00E5FF] hover:from-[#1C64F2] hover:to-[#00B0FF] text-white font-bold text-xs shadow-md shadow-[#2979FF]/30 items-center justify-center gap-1.5 active:scale-[0.99] transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>START WORKOUT</span>
            </button>
          </div>

          {/* Exercise Sequence List (Leap Fitness Animated Thumbnails) */}
          <div className="landscape:col-span-7 p-4 landscape:p-0 space-y-2.5">
          <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2">
            Exercises ({selectedRoutine.exercises.length})
          </div>

          {selectedRoutine.exercises.map((re, idx) => {
            const ex = EXERCISE_DATABASE.find(e => e.id === re.exerciseId);
            const pairMatch = re.notes?.match(/^(Pair [A-C][1-2])/i);
            const pairTag = pairMatch ? pairMatch[1] : null;
            const noteContent = pairMatch && re.notes ? re.notes.replace(pairMatch[0], '').replace(/^[:\s\-•]+/, '').trim() : re.notes;

            return (
              <div
                key={idx}
                onClick={() => ex && setInspectingExercise(ex)}
                className="p-3 rounded-2xl bg-[#1A2026] hover:bg-[#1E252D] border border-[#242C35] cursor-pointer flex items-center justify-between gap-3 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* ANIMATED AVATAR THUMBNAIL (Leap Fitness Style) */}
                  <div className="w-14 h-14 rounded-2xl bg-[#12161A] border border-[#242C35] shrink-0 overflow-hidden flex items-center justify-center group-hover:border-[#2979FF]/50 transition-colors">
                    <WorkoutAvatar
                      animationType={ex?.avatarAnimation}
                      anchorPosition={ex?.anchorPosition}
                      exerciseName={ex?.name}
                      size="sm"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {pairTag && (
                        <span className="px-1.5 py-0.5 rounded bg-[#2979FF]/20 text-[#2979FF] font-black text-[10px] border border-[#2979FF]/40">
                          {pairTag}
                        </span>
                      )}
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-[#2979FF] transition-colors">
                        {ex?.name || 'Exercise'}
                      </h4>
                    </div>

                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded bg-[#00E5FF]/15 text-[#00E5FF] font-black text-[11px] border border-[#00E5FF]/30">
                        {re.sets} SETS
                      </span>
                      <span className="text-white font-bold text-xs">
                        ×{re.targetReps} reps
                      </span>
                      <span>•</span>
                      <span className="text-slate-300 font-medium text-[11px]">
                        ⏱ {re.targetRestSeconds === 10 ? '10s transition' : `${re.targetRestSeconds}s rest`}
                      </span>
                      {ex?.anchorPosition && (
                        <>
                          <span>•</span>
                          <span className="text-[11px] truncate text-slate-400">
                            ⚓ {ex?.anchorPosition}
                          </span>
                        </>
                      )}
                    </div>

                    {noteContent && (
                      <p className="text-[11px] text-slate-400/90 mt-0.5 italic line-clamp-1">
                        • {noteContent}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Small YouTube Symbol for exact form demonstration */}
                  <a
                    href={getExerciseYoutubeUrl(ex?.id || '', ex?.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-2 py-1 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border border-red-500/25 transition-all flex items-center gap-1 shrink-0 group/yt text-xs font-bold"
                    title={`Watch exact exercise video on YouTube (${getExerciseTimestampLabel(ex?.id || '')})`}
                  >
                    <YoutubeIcon className="w-3.5 h-3.5 fill-current group-hover/yt:scale-110 transition-transform" />
                    {ex?.id && getExerciseTimestampLabel(ex.id) && (
                      <span className="font-mono text-[9px]">{getExerciseTimestampLabel(ex.id)}</span>
                    )}
                  </a>

                  <div className="p-2 text-slate-500 group-hover:text-white">
                    <Info className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>

        {/* Sticky START Floating Button (Mobile Portrait) */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#12161A]/95 backdrop-blur-md border-t border-[#242C35] px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] landscape:hidden">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => onStartRoutine(selectedRoutine)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#2979FF] to-[#00E5FF] hover:from-[#1C64F2] hover:to-[#00B0FF] text-white font-bold text-xs shadow-md shadow-[#2979FF]/30 flex items-center justify-center gap-1.5 active:scale-[0.99] transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>START WORKOUT</span>
            </button>
          </div>
        </div>

        {/* Form Cue Modal if user taps an exercise in sequence */}
        {inspectingExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-md landscape:max-w-2xl bg-[#12161A] border border-[#242C35] rounded-3xl p-4 sm:p-5 shadow-2xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-[#242C35]">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-white truncate">{inspectingExercise.name}</h3>
                  <a
                    href={getExerciseYoutubeUrl(inspectingExercise.id, inspectingExercise.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-500 hover:text-red-400 shrink-0 flex items-center gap-1 text-xs font-bold"
                    title={`Watch exact demonstration on YouTube (${getExerciseTimestampLabel(inspectingExercise.id)})`}
                  >
                    <YoutubeIcon className="w-3.5 h-3.5 fill-current" />
                    {getExerciseTimestampLabel(inspectingExercise.id) && (
                      <span className="font-mono text-[9px]">{getExerciseTimestampLabel(inspectingExercise.id)}</span>
                    )}
                  </a>
                </div>
                <button
                  onClick={() => setInspectingExercise(null)}
                  className="p-1 rounded-lg bg-[#1A2026] text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-3 overflow-y-auto landscape:grid landscape:grid-cols-2 landscape:gap-4 space-y-3 landscape:space-y-0">
                <div className="rounded-2xl bg-[#1A2026] border border-[#242C35] p-3 flex justify-center items-center">
                  <WorkoutAvatar
                    animationType={inspectingExercise.avatarAnimation}
                    anchorPosition={inspectingExercise.anchorPosition}
                    exerciseName={inspectingExercise.name}
                    size="md"
                  />
                </div>

                <div className="text-xs text-slate-300 space-y-1.5 overflow-y-auto max-h-56 landscape:max-h-48 pr-1">
                  <div className="font-bold text-[#2979FF]">Instructions:</div>
                  <ol className="list-decimal list-inside space-y-1">
                    {inspectingExercise.instructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <button
                onClick={() => setInspectingExercise(null)}
                className="w-full py-2.5 rounded-xl bg-[#2979FF] text-white text-xs font-bold mt-2 shrink-0"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN TRAINING SCREEN (LEAP FITNESS APP STRUCTURE)
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-4 pb-24 max-w-xl md:max-w-4xl lg:max-w-5xl landscape:max-w-5xl mx-auto animate-fadeIn select-none">
      {/* Top Trackers & Hero Grid in Landscape */}
      <div className="grid grid-cols-1 md:grid-cols-2 landscape:grid-cols-2 gap-4">
        {/* 1. WEEK GOAL CARD (PPL Schedule-Aware Target & Tracker) */}
        <div className="leap-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  Week Goal
                </span>
                <span className="px-1.5 py-0.2 rounded bg-[#2979FF]/15 text-[#2979FF] text-[10px] font-black border border-[#2979FF]/30">
                  {scheduleMode === '4-day' ? '4-Day Split' : scheduleMode === '5-day' ? '5-Day Split' : '6-Day Split'}
                </span>
              </div>
              <div className="text-sm font-black text-white mt-0.5 flex items-center gap-2 flex-wrap">
                <span>{completedCount}/{weeklyTarget} Days</span>
                <span className="text-xs font-semibold text-slate-400 font-normal">Completed</span>
                {completedCount >= weeklyTarget && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00E676]/20 text-[#00E676] font-black border border-[#00E676]/40">
                    🎯 GOAL HIT!
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {totalCaloriesBurned > 0 && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FF6D00]/15 border border-[#FF6D00]/30 text-xs font-black text-[#FF6D00]">
                  <Flame className="w-3.5 h-3.5 fill-[#FF6D00]" />
                  <span>{totalCaloriesBurned.toLocaleString()} kcal</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2979FF]/15 border border-[#2979FF]/30 text-xs font-black text-[#2979FF]">
                <Zap className="w-3.5 h-3.5" />
                <span>Streak {userProfile.streakDays}d</span>
              </div>
            </div>
          </div>

          {/* 7 Days Row Styled by PPL Schedule Plan */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-1">
            {weekDays.map((day, idx) => {
              const isCompleted = thisWeekCompletedDays[idx];
              const isToday = idx === currentDayOfWeek;
              const planDay = WORKDAY_SPLIT[idx];
              const isRest = planDay.isRest;

              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className={`text-[10px] font-black ${isToday ? 'text-[#2979FF]' : isRest ? 'text-slate-500' : 'text-slate-300'}`}>
                    {day}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-[#00E676] text-[#12161A] shadow-md shadow-[#00E676]/30 font-black'
                        : isToday
                        ? isRest
                          ? 'border-2 border-amber-500 bg-[#1A2026] text-amber-400'
                          : 'border-2 border-[#2979FF] bg-[#1A2026] text-[#2979FF] font-black'
                        : isRest
                        ? 'bg-[#12161A]/80 border border-[#242C35]/60 text-slate-600'
                        : 'bg-[#242C35] text-slate-300 border border-[#2D3748]'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : isRest ? (
                      <Coffee className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <span className="text-[10px] font-bold">{planDay.focus.charAt(0)}</span>
                    )}
                  </div>
                  <span className={`text-[9px] font-semibold truncate max-w-[38px] text-center ${isToday ? 'text-[#00E5FF] font-bold' : isRest ? 'text-slate-600' : 'text-slate-400'}`}>
                    {isRest ? 'Rest' : planDay.focus.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. TODAY'S PPL WORKDAY SCHEDULE HERO CARD */}
        <div className="leap-card p-4 bg-gradient-to-br from-[#1A2026] via-[#161D24] to-[#12161A] border border-[#2979FF]/35 relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isRestDay ? 'bg-amber-400' : 'bg-[#00E676]'} animate-pulse`} />
              <span className="text-[11px] font-black uppercase text-[#2979FF] tracking-wider">
                Workday PPL • {currentPlan.dayName}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-[#242C35] text-slate-300 text-[10px] font-bold">
                {scheduleMode.toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => setShowWorkdayScheduleModal(true)}
              className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-[#2979FF]" />
              <span>PPL Plan</span>
            </button>
          </div>

          <div className="flex items-start justify-between gap-3 my-2">
            <div className="min-w-0">
              <h3 className="text-xl font-heading font-black text-white flex items-center gap-2 flex-wrap">
                <span>{todayRoutine ? todayRoutine.name : currentPlan.focus}</span>
                {!isRestDay && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full border font-black tracking-tight"
                    style={{
                      color: workdayTier === 1 ? '#00E676' : workdayTier === 2 ? '#FF9100' : '#FF3D00',
                      backgroundColor: workdayTier === 1 ? '#00E67615' : workdayTier === 2 ? '#FF910015' : '#FF3D0015',
                      borderColor: workdayTier === 1 ? '#00E67640' : workdayTier === 2 ? '#FF910040' : '#FF3D0040',
                    }}
                  >
                    {'⚡'.repeat(workdayTier)}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-sm line-clamp-1">
                {todayRoutine?.description || currentPlan.cues}
              </p>
              <div className="text-[11px] text-slate-400 font-semibold mt-1 flex items-center gap-2 flex-wrap">
                <span className="text-[#00E5FF] font-black">⏱ {isRestDay ? '0 Mins' : `${targetDuration} Mins`}</span>
                {todayRoutine && (
                  <>
                    <span>•</span>
                    <span className="text-white font-bold">{todayRoutine.exercises.length} Exercises ({todayTotalSets} Sets)</span>
                    <span>•</span>
                    <span className="text-slate-400">{durationPreset.badge}</span>
                  </>
                )}
              </div>
            </div>

            {!isRestDay && todayRoutine ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setSelectedRoutine(todayRoutine)}
                  className="px-2.5 py-2.5 rounded-xl bg-[#242C35] hover:bg-[#2D3748] text-slate-200 font-bold text-xs flex items-center gap-1 transition-all"
                  title="Preview exercises & form cues"
                >
                  <Info className="w-3.5 h-3.5 text-[#2979FF]" />
                  <span className="hidden sm:inline">Preview</span>
                </button>
                <button
                  onClick={() => onStartRoutine(todayRoutine)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2979FF] to-[#00E5FF] hover:from-[#1C64F2] hover:to-[#00B0FF] text-white font-black text-xs shadow-lg shadow-[#2979FF]/30 flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>START</span>
                </button>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold flex items-center gap-1.5 shrink-0">
                <Coffee className="w-4 h-4" />
                <span>Rest & Recovery</span>
              </div>
            )}
          </div>

          {/* Today's Exercise Preview Chips */}
          {todayRoutine && todayRoutine.exercises.length > 0 && (
            <div className="mt-1 pt-2 border-t border-[#242C35]/60">
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1 flex items-center justify-between">
                <span>Today's Exercises ({todayRoutine.exercises.length})</span>
                <span className="text-[10px] text-[#00E5FF] font-bold">{durationPreset.setsDescription}</span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
                {todayRoutine.exercises.map((re, idx) => {
                  const ex = EXERCISE_DATABASE.find(e => e.id === re.exerciseId);
                  const pairTag = re.notes?.match(/^(Pair [A-C][1-2])/i)?.[1];
                  return (
                    <div
                      key={idx}
                      onClick={() => ex && setInspectingExercise(ex)}
                      className="px-2.5 py-1 rounded-xl bg-[#12161A] border border-[#242C35] text-[11px] font-semibold text-slate-300 hover:text-white hover:border-[#2979FF] cursor-pointer flex items-center gap-1.5 shrink-0 transition-all group/chip"
                    >
                      {pairTag && (
                        <span className="text-[#2979FF] font-black text-[9px]">{pairTag}</span>
                      )}
                      <span className="text-[#00E5FF] font-black text-[10px]">{re.sets}×</span>
                      <span className="truncate max-w-[130px] group-hover/chip:text-white">{ex?.name || 'Exercise'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Duration & Intensity Selector Controls */}
          {!isRestDay && (
            <div className="mt-2 pt-2 border-t border-[#242C35]/60 space-y-2">
              {/* Duration Selector */}
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Duration:
                </span>
                <div className="flex items-center gap-1">
                  {[10, 15, 20, 25, 30, 40].map(mins => {
                    const isSelected = targetDuration === mins;
                    return (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => handleUpdateGlobalDuration(mins)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all border ${
                          isSelected
                            ? 'bg-[#00E5FF] text-slate-950 border-[#00E5FF] shadow-sm font-black'
                            : 'bg-[#12161A] text-slate-400 border-[#242C35] hover:border-slate-600 hover:text-white'
                        }`}
                      >
                        {mins}m
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Intensity Selector */}
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Intensity:
                </span>
                <div className="flex items-center gap-1">
                  {[
                    { tier: 1 as const, label: '⚡ Light', activeBg: '#00E676', activeColor: '#12161A' },
                    { tier: 2 as const, label: '⚡⚡ Standard', activeBg: '#FF9100', activeColor: '#12161A' },
                    { tier: 3 as const, label: '⚡⚡⚡ Hard', activeBg: '#FF3D00', activeColor: '#ffffff' },
                  ].map(({ tier, label, activeBg, activeColor }) => {
                    const isSelected = workdayTier === tier;
                    return (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setWorkdayTier(tier)}
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black transition-all border ${
                          isSelected
                            ? 'border-transparent shadow-md scale-[1.02]'
                            : 'bg-[#12161A] text-slate-400 border-[#242C35] hover:border-slate-600 hover:text-white'
                        }`}
                        style={isSelected ? { backgroundColor: activeBg, color: activeColor } : {}}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 7-Day Mini Timeline Bar */}
          <div className="mt-3 pt-3 border-t border-[#242C35] grid grid-cols-7 gap-1 text-center">
            {WORKDAY_SPLIT.map((item, idx) => {
              const isToday = idx === currentDayOfWeek;
              const dayRoutineId = resolvedTierRoutines[idx]?.[workdayTier];
              const isRest = !dayRoutineId || item.isRest;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (!isRest && dayRoutineId) {
                      const r = activeEquipmentRoutines.find(p => p.id === dayRoutineId) || PREBUILT_ROUTINES.find(p => p.id === dayRoutineId);
                      if (r) setSelectedRoutine(scaleRoutineToDuration(r, targetDuration, userProfile) as LeapRoutine);
                    }
                  }}
                  className={`p-1.5 rounded-xl transition-all ${
                    isToday
                      ? 'bg-[#2979FF]/25 border border-[#2979FF] text-white shadow-sm'
                      : isRest
                      ? 'bg-[#12161A]/50 text-slate-500'
                      : 'hover:bg-[#242C35] text-slate-400 cursor-pointer'
                  }`}
                  title={`${item.dayName}: ${item.focus}`}
                >
                  <div className={`text-[10px] font-black ${isToday ? 'text-[#2979FF]' : isRest ? 'text-slate-500' : 'text-slate-400'}`}>
                    {item.shortDay}
                  </div>
                  <div className="text-[10px] font-bold truncate mt-0.5">
                    {isRest ? '☕' : item.focus.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. 7X4 CHALLENGE HERO CARD (28-Day Progressive Program) */}
      <div 
        onClick={() => setShowChallengeMatrix(true)}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E1B4B] via-[#1E3C72] to-[#2563EB] p-5 shadow-xl cursor-pointer hover:opacity-95 transition-all group"
      >
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black tracking-wider uppercase mb-2">
            <Zap className="w-3 h-3 fill-white" />
            <span>7X4 Challenge • 28 Days</span>
          </div>

          <h2 className="text-2xl font-heading font-black text-white tracking-tight">
            {challengeRoutine.name.toUpperCase()}
          </h2>
          <p className="text-xs text-white/80 mt-1 max-w-md line-clamp-1">
            {challengeRoutine.description}
          </p>

          <div className="mt-3 w-full bg-black/30 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-[#00E5FF] to-[#00E676] h-full w-[14%] rounded-full transition-all duration-500" />
          </div>
          <div className="flex items-center justify-between text-[11px] text-white/80 mt-1 font-bold">
            <span>Day 1 / 28</span>
            <span>Week 1 Active</span>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-xs font-bold text-white/90">
              {challengeRoutine.exercises.length} Exercises • ~{challengeRoutine.estimatedDurationMins} Mins
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRoutine(scaleRoutineToDuration(challengeRoutine, targetDuration, userProfile) as LeapRoutine);
              }}
              className="px-4 py-2 rounded-xl bg-white text-[#1E3C72] font-black text-xs shadow-lg flex items-center gap-1.5 group-hover:scale-105 transition-transform"
            >
              <Play className="w-3.5 h-3.5 fill-[#1E3C72]" />
              <span>START</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. EXPERIENCE LEVEL FILTER TABS (Leap Fitness Signature Split) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
            Split By Experience Level
          </span>
          <span className="text-[10px] text-slate-500 font-bold">Progressive Overload</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 bg-[#1A2026] p-1 rounded-2xl border border-[#242C35]">
          <button
            onClick={() => setSelectedTier('all')}
            className={`py-2 rounded-xl text-xs font-bold transition-all text-center ${
              selectedTier === 'all'
                ? 'bg-[#2979FF] text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedTier(1)}
            className={`py-2 rounded-xl text-xs font-black transition-all text-center flex items-center justify-center ${
              selectedTier === 1
                ? 'bg-[#00E676] text-[#12161A] shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Tier 1"
          >
            ⚡
          </button>
          <button
            onClick={() => setSelectedTier(2)}
            className={`py-2 rounded-xl text-xs font-black transition-all text-center flex items-center justify-center tracking-tighter ${
              selectedTier === 2
                ? 'bg-[#FF9100] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Tier 2"
          >
            ⚡⚡
          </button>
          <button
            onClick={() => setSelectedTier(3)}
            className={`py-2 rounded-xl text-xs font-black transition-all text-center flex items-center justify-center tracking-tighter ${
              selectedTier === 3
                ? 'bg-[#FF3D00] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Tier 3"
          >
            ⚡⚡⚡
          </button>
        </div>
      </div>

      {/* 4. BODY PARTS FILTER CHIPS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
            Target Focus Area
          </span>
          <button
            onClick={() => setShowBuilder(true)}
            className="text-xs font-bold text-[#2979FF] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Custom</span>
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {bodyCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-white text-[#12161A] shadow-md font-black'
                  : 'bg-[#1A2026] text-slate-400 border border-[#242C35] hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 5. ACTIVE ROUTINE LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 landscape:grid-cols-2 gap-3">
        {filteredRoutines.map(renderRoutineCard)}
      </div>

      {/* 6. 28-DAY PROGRAM MATRIX MODAL (7X4 CHALLENGE DETAILS) */}
      {showChallengeMatrix && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md landscape:max-w-3xl bg-[#12161A] border border-[#242C35] rounded-3xl p-5 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#242C35]">
              <div>
                <span className="text-[10px] font-black uppercase text-[#2979FF]">
                  4-Week Systematic Progression
                </span>
                <h3 className="text-lg font-heading font-black text-white">
                  7X4 Full Body Challenge Plan
                </h3>
              </div>
              <button
                onClick={() => setShowChallengeMatrix(false)}
                className="p-1 rounded-lg bg-[#1A2026] text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 overflow-y-auto space-y-4">
              {[1, 2, 3, 4].map(week => (
                <div key={week} className="p-3 rounded-2xl bg-[#1A2026] border border-[#242C35]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase text-white">
                      Week {week}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      5 Workouts • 2 Rest Days
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 text-center">
                    {[1, 2, 3, 4, 5, 6, 7].map(d => {
                      const isRest = d === 4 || d === 7;
                      const dayNumber = (week - 1) * 7 + d;
                      return (
                        <div
                          key={d}
                          onClick={() => {
                            if (!isRest) {
                              setShowChallengeMatrix(false);
                              setSelectedRoutine(challengeRoutine);
                            }
                          }}
                          className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                            isRest
                              ? 'bg-[#12161A] border border-[#242C35] text-slate-500'
                              : 'bg-[#242C35] hover:bg-[#2979FF] text-white cursor-pointer group'
                          }`}
                        >
                          <span className="text-[9px] font-bold block mb-0.5">
                            {isRest ? 'Rest' : `D${dayNumber}`}
                          </span>
                          {isRest ? (
                            <Coffee className="w-3.5 h-3.5 text-slate-500" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current text-[#2979FF] group-hover:text-white" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setShowChallengeMatrix(false);
                setSelectedRoutine(scaleRoutineToDuration(challengeRoutine, targetDuration, userProfile) as LeapRoutine);
              }}
              className="w-full py-3 rounded-2xl bg-[#2979FF] text-white text-xs font-black shadow-lg"
            >
              Start Today's Workout
            </button>
          </div>
        </div>
      )}

      {/* PPL Master Workday Schedule Details Modal */}
      {showWorkdayScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg landscape:max-w-3xl bg-[#12161A] border border-[#242C35] rounded-3xl p-5 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#242C35]">
              <div>
                <h3 className="text-lg font-heading font-black text-white">Push / Pull / Legs Master Split</h3>
                <p className="text-xs text-slate-400">Scientific Antagonistic Rotation & CNS Preservation</p>
              </div>
              <button
                onClick={() => setShowWorkdayScheduleModal(false)}
                className="p-1 rounded-lg bg-[#1A2026] text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Schedule Mode Selector (4-Day Default, 5-Day, 6-Day) */}
            <div className="pt-3 pb-2">
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5 flex items-center justify-between">
                <span>Select Weekly Split Schedule:</span>
                <span className="text-[#00E5FF] font-bold">{scheduleMode === '4-day' ? '4-Day (Default Sweet Spot)' : scheduleMode === '5-day' ? '5-Day High-Frequency' : '6-Day PPLx2'}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 bg-[#161B22] p-1 rounded-2xl border border-[#242C35]">
                {[
                  { id: '4-day' as const, label: '🎯 4-Day (Sweet Spot)', desc: 'Recommended' },
                  { id: '5-day' as const, label: '⚡ 5-Day High Freq', desc: 'Active Desk' },
                  { id: '6-day' as const, label: '🔥 6-Day Athlete', desc: 'PPL Cycle x2' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setScheduleMode(opt.id)}
                    className={`py-2 px-1 rounded-xl text-center transition-all ${
                      scheduleMode === opt.id
                        ? 'bg-[#2979FF] text-white font-black shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-[#242C35]'
                    }`}
                  >
                    <div className="text-xs font-black">{opt.label}</div>
                    <div className="text-[9px] opacity-80">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="py-2 overflow-y-auto space-y-2 flex-1 pr-1">
              <div className="p-3 rounded-2xl bg-[#2979FF]/10 border border-[#2979FF]/20 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-[#2979FF] flex items-center gap-1">
                  <span>💡 Why Push / Pull / Legs is Scientifically Superior:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  Unlike traditional body-part splits that cause recovery conflicts, PPL groups synergists together: <strong>Push</strong> (Chest, Front Delts, Triceps), <strong>Pull</strong> (Lats, Rear Delts, Biceps), and <strong>Legs</strong>. Each movement utilizes paired supersets (A1/A2, B1/B2, C1/C2) with 10s transitions and 25s pair rests to hit maximum muscular stimulus in under 20 minutes without central nervous system burnout.
                </p>
              </div>

              {WORKDAY_SPLIT.map((item, idx) => {
                const isToday = idx === currentDayOfWeek;
                const rId = resolvedTierRoutines[item.dayIndex]?.[workdayTier];
                const isRest = !rId || item.isRest;

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition-all ${
                      isToday
                        ? 'bg-[#1A2026] border-[#2979FF]'
                        : isRest
                        ? 'bg-[#12161A]/80 border-[#242C35]'
                        : 'bg-[#161B22] border-[#242C35]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black uppercase ${isToday ? 'text-[#2979FF]' : isRest ? 'text-slate-500' : 'text-slate-300'}`}>
                          {item.dayName}
                        </span>
                        {isToday && (
                          <span className="text-[10px] px-2 py-0.2 rounded bg-[#2979FF] text-white font-black">
                            TODAY
                          </span>
                        )}
                        {isRest && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                            RECOVERY
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-400">{isRest ? '0 Mins' : `${targetDuration} Mins`}</span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <div className="min-w-0 pr-2">
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span>{item.focus}</span>
                          <span className="text-xs">{item.icon}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.science}</div>
                      </div>

                      {!isRest && rId ? (
                        <button
                          onClick={() => {
                            const r = activeEquipmentRoutines.find(p => p.id === rId) || PREBUILT_ROUTINES.find(p => p.id === rId);
                            if (r) {
                              setShowWorkdayScheduleModal(false);
                              setSelectedRoutine(scaleRoutineToDuration(r, targetDuration, userProfile) as LeapRoutine);
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#242C35] hover:bg-[#2979FF] text-white text-xs font-bold transition-colors shrink-0"
                        >
                          Preview
                        </button>
                      ) : (
                        <div className="p-1.5 rounded-xl bg-[#1A2026] text-amber-400 shrink-0">
                          <Coffee className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowWorkdayScheduleModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#2979FF] text-white text-xs font-bold mt-2"
            >
              Close Plan
            </button>
          </div>
        </div>
      )}

      {/* Routine Builder Modal */}
      {showBuilder && (
        <RoutineBuilderModal
          onSave={onSaveRoutine}
          onClose={() => setShowBuilder(false)}
        />
      )}
    </div>
  );
};
