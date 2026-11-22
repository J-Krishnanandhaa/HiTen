import React, { useState } from 'react';
import { useBackClose } from '../../utils/backStack';
import { 
  Clock, Flame, Trophy, Calendar, ChevronDown, 
  ChevronUp, Scale, Activity, Plus, ChevronLeft, 
  ChevronRight, Dumbbell, ArrowRight, TrendingUp
} from 'lucide-react';
import { WorkoutSessionLog, UserProfile } from '../../types';
import { EXERCISE_DATABASE } from '../../data/exerciseDatabase';
import { getTodayDateString } from '../../utils/storage';
import { toDisplay } from '../../utils/bands';
import { ProgressPanel } from './ProgressPanel';
import { calculateWeeklyCalorieBurn } from '../../utils/nutritionMath';

interface HistoryViewProps {
  workoutLogs: WorkoutSessionLog[];
  userProfile: UserProfile;
  onUpdateWeight?: (newWeightKg: number) => void;
  onNavigateToTraining?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  workoutLogs,
  userProfile,
  onUpdateWeight,
  onNavigateToTraining,
}) => {
  const todayStr = getTodayDateString();
  const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'summary'>('calendar');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [showWeightModal, setShowWeightModal] = useState(false);
  useBackClose(showWeightModal, () => setShowWeightModal(false));
  const [inputWeight, setInputWeight] = useState(userProfile.weightKg);

  // Calendar State: Defaults to current month and today's date
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth(); // 0-11

  // Leap Fitness Tri-Metric Stats
  const totalWorkouts = workoutLogs.length;
  const totalCalories = workoutLogs.reduce((acc, l) => acc + (l.caloriesBurned || 0), 0);
  const totalMinutes = Math.round(workoutLogs.reduce((acc, l) => acc + l.durationSeconds, 0) / 60);

  // Weekly Calorie Burn Stats (Mon - Sun)
  const weeklyStats = calculateWeeklyCalorieBurn(workoutLogs);

  // BMI Calculation: Weight (kg) / [Height (m)]^2
  const heightM = userProfile.heightCm / 100;
  const bmi = heightM > 0 ? (userProfile.weightKg / (heightM * heightM)).toFixed(1) : '22.0';
  const bmiNum = parseFloat(bmi);

  let bmiCategory = 'Normal';
  let bmiColor = '#4ADE80';
  if (bmiNum < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = '#6EA8FF';
  } else if (bmiNum < 25) {
    bmiCategory = 'Normal Weight';
    bmiColor = '#4ADE80';
  } else if (bmiNum < 30) {
    bmiCategory = 'Overweight';
    bmiColor = '#FBBF24';
  } else {
    bmiCategory = 'Obese';
    bmiColor = '#F87171';
  }


  const toggleExpand = (id: string) => {
    setExpandedLogId(prev => prev === id ? null : id);
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(todayStr);
  };

  // Calendar calculations
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthName = monthNames[viewMonth];

  // Starting day of month (0 = Sun, 1 = Mon, ..., 6 = Sat). Shift so 0 = Mon.
  const rawFirstDay = new Date(viewYear, viewMonth, 1).getDay();
  const firstDayOfWeek = (rawFirstDay + 6) % 7; // 0 = Mon, 6 = Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Selected Day Details calculation
  const selectedDayWorkouts = workoutLogs.filter(log => log.date.startsWith(selectedDate));

  // Formatted date string for selected inspector header
  const parsedDate = new Date(selectedDate + 'T00:00:00');
  const formattedSelectedDate = parsedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-5 animate-fadeIn">
      <h1 className="text-2xl font-bold text-hy-text pt-2">Progress</h1>

      {workoutLogs.length === 0 && (
        <div className="rounded-3xl bg-hy-surface p-6 text-center space-y-3">
          <p className="text-sm text-hy-text-2">Finish a workout to see your progress.</p>
          {onNavigateToTraining && (
            <button type="button" onClick={onNavigateToTraining} className="min-h-[48px] px-6 rounded-2xl bg-hy-primary text-hy-on-primary font-black">
              Start a workout
            </button>
          )}
        </div>
      )}

      {/* Strength progress first */}
      <ProgressPanel workoutLogs={workoutLogs} userProfile={userProfile} />

      {/* Totals (calories are estimates) */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Workouts', value: totalWorkouts.toLocaleString() },
          { label: 'Minutes', value: totalMinutes.toLocaleString() },
          { label: 'kcal (est.)', value: totalCalories.toLocaleString() },
        ].map(t => (
          <div key={t.label} className="rounded-3xl bg-hy-surface p-4 text-center">
            <div className="text-2xl font-bold text-hy-text">{t.value}</div>
            <div className="text-xs text-hy-text-3 mt-0.5">{t.label}</div>
          </div>
        ))}
      </div>

      {/* 2. WEEKLY CALORIE BURN ACTIVITY BAR CHART */}
      <div className="hy-card p-4 sm:p-5 border border-hy-elevated">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-hy-orange" />
            <h3 className="text-xs sm:text-sm font-heading font-black text-white uppercase tracking-wider">
              This week
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <span className="text-hy-orange font-black">{weeklyStats.weekTotal.toLocaleString()} kcal</span>
          </div>
        </div>

        {/* 7-Day Bar Visualizer */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-2 items-end">
          {weeklyStats.days.map((day, idx) => {
            const maxCals = Math.max(250, ...weeklyStats.days.map(d => d.calories));
            const barHeightPct = day.calories > 0 ? Math.max(15, Math.round((day.calories / maxCals) * 100)) : 6;

            return (
              <div 
                key={idx} 
                onClick={() => setSelectedDate(day.dateStr)}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
                title={`${day.dayName}: ${day.calories} kcal`}
              >
                {/* Calorie value label */}
                <span className="text-xs sm:text-xs font-bold text-hy-text-2 truncate h-3.5">
                  {day.calories > 0 ? `${day.calories}` : ''}
                </span>

                {/* Vertical Bar */}
                <div className="w-full max-w-[36px] h-20 sm:h-24 bg-hy-bg rounded-xl flex items-end p-1 border border-hy-elevated group-hover:border-hy-primary/50 transition-all">
                  <div 
                    className={`w-full rounded-lg transition-all duration-500 ${
                      day.calories > 0
                        ? day.isToday
                          ? 'bg-gradient-to-t from-hy-orange to-hy-warning shadow-md shadow-hy-orange/30'
                          : 'bg-gradient-to-t from-hy-primary to-hy-volt'
                        : 'bg-hy-elevated'
                    }`}
                    style={{ height: `${barHeightPct}%` }}
                  />
                </div>

                {/* Day label */}
                <span className={`text-xs sm:text-xs font-black ${
                  day.isToday 
                    ? 'text-hy-orange' 
                    : (idx === 5 || idx === 6)
                    ? 'text-amber-400 font-extrabold'
                    : 'text-hy-text-2'
                }`}>
                  {day.shortDay}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SUB-TABS: WORKOUT CALENDAR vs ALL WORKOUTS LOG */}
      <div className="flex border-b border-hy-elevated text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('calendar')}
          className={`pb-2.5 px-4 flex items-center gap-1.5 border-b-2 transition-all ${
            activeSubTab === 'calendar'
              ? 'border-hy-primary text-hy-primary font-black'
              : 'border-transparent text-hy-text-2 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendar</span>
        </button>

        <button
          onClick={() => setActiveSubTab('summary')}
          className={`pb-2.5 px-4 flex items-center gap-1.5 border-b-2 transition-all ${
            activeSubTab === 'summary'
              ? 'border-hy-primary text-hy-primary font-black'
              : 'border-transparent text-hy-text-2 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>History</span>
        </button>
      </div>

      {/* SUB-TAB 1: WORKOUT CALENDAR */}
      {activeSubTab === 'calendar' && (
        <div className="space-y-4">
          
          {/* Calendar Month Navigation Header */}
          <div className="hy-card p-4 sm:p-5 border border-hy-elevated">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-hy-primary" />
                <h3 className="text-base sm:text-lg font-heading font-black text-white">
                  {currentMonthName} {viewYear}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleJumpToToday}
                  className="px-2.5 py-1 rounded-lg bg-hy-elevated hover:bg-hy-border text-white text-xs font-bold transition-all"
                >
                  Today
                </button>
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg bg-hy-elevated hover:bg-hy-border text-slate-300 transition-all"
                  title="Previous Month" aria-label="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg bg-hy-elevated hover:bg-hy-border text-slate-300 transition-all"
                  title="Next Month" aria-label="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week Header (Mon-Sun) */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-black uppercase text-hy-text-3 py-1 border-b border-hy-elevated/60">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span className="text-amber-400 font-black">Sat</span>
              <span className="text-amber-400 font-black">Sun</span>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-2">
              {/* Empty padding cells for start of month */}
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-14 sm:h-18 rounded-xl bg-hy-bg/30 border border-transparent" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isSelected = selectedDate === dateKey;
                const isToday = todayStr === dateKey;
                const dayCol = (firstDayOfWeek + idx) % 7;
                const isWeekend = dayCol === 5 || dayCol === 6; // Sat (5) or Sun (6)

                // Check workouts for this day
                const dayWorkouts = workoutLogs.filter(log => log.date.startsWith(dateKey));
                const hasWorkout = dayWorkouts.length > 0;
                const dayCals = dayWorkouts.reduce((sum, l) => sum + (l.caloriesBurned || 0), 0);

                return (
                  <div
                    key={dateKey}
                    onClick={() => setSelectedDate(dateKey)}
                    className={`h-14 sm:h-18 p-1 sm:p-1.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-hy-primary bg-hy-primary/15 ring-2 ring-hy-primary/40 shadow-lg shadow-hy-primary/20 scale-[1.02]'
                        : isToday
                        ? 'border-hy-success/60 bg-hy-surface hover:bg-hy-elevated'
                        : isWeekend
                        ? 'border-amber-500/40 bg-amber-500/[0.08] hover:bg-amber-500/[0.14]'
                        : 'border-hy-elevated bg-hy-bg-2 hover:bg-hy-elevated'
                    }`}
                  >
                    {/* Day number & indicators */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black ${
                        isSelected 
                          ? 'text-hy-primary' 
                          : isToday 
                          ? 'text-hy-success' 
                          : isWeekend
                          ? 'text-amber-400 font-extrabold'
                          : 'text-slate-300'
                      }`}>
                        {dayNum}
                      </span>
                      {isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-hy-success" title="Today" />
                      )}
                    </div>

                    {/* Workout Calorie Badge */}
                    <div>
                      {hasWorkout ? (
                        <div className="flex items-center gap-1 px-1 py-0.5 rounded bg-hy-orange/20 border border-hy-orange/40 text-xs font-bold text-hy-orange truncate">
                          <Flame className="w-2.5 h-2.5 fill-hy-orange shrink-0" />
                          <span className="truncate">{dayCals} kcal</span>
                        </div>
                      ) : (
                        <div className="h-3" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* DAY DETAILS INSPECTOR CARD */}
          <div className="hy-card p-5 sm:p-6 ">
            
            {/* Inspector Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-hy-elevated">
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white">
                  {formattedSelectedDate}
                </h2>
              </div>

              {selectedDayWorkouts.length === 0 && onNavigateToTraining && (
                <button
                  onClick={onNavigateToTraining}
                  className="px-4 py-2 rounded-xl bg-hy-primary hover:bg-hy-primary-hover text-hy-on-primary text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-hy-primary/20 transition-all self-start sm:self-auto"
                >
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Start a Workout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Completed Workout Details for Selected Day */}
            <div className="space-y-3 pt-2">

              {selectedDayWorkouts.length === 0 ? (
                <div className="p-6 rounded-2xl bg-hy-bg-2 border border-hy-elevated text-center">
                  <p className="text-sm text-hy-text-3">Rest day</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayWorkouts.map((workout) => {
                    const mins = Math.floor(workout.durationSeconds / 60);
                    const secs = workout.durationSeconds % 60;
                    const totalSets = workout.exercises.reduce((sum, e) => sum + e.sets.length, 0);

                    return (
                      <div 
                        key={workout.id}
                        className="p-4 rounded-2xl bg-hy-bg-2 border border-hy-elevated hover:border-hy-primary/40 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-xs font-black uppercase text-hy-primary tracking-wider block">
                              Completed Workout
                            </span>
                            <h5 className="text-base font-heading font-black text-white">
                              {workout.routineName}
                            </h5>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-heading font-black text-hy-orange flex items-center justify-end gap-1">
                              <Flame className="w-3.5 h-3.5 fill-hy-orange" />
                              <span>{workout.caloriesBurned} kcal</span>
                            </div>
                            <div className="text-xs text-hy-text-2 font-mono">
                              {mins}m {secs}s
                            </div>
                          </div>
                        </div>

                        {/* Exercise tags summary */}
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-hy-elevated">
                          <span className="px-2 py-0.5 rounded-md bg-hy-elevated text-xs font-bold text-slate-300">
                            {workout.exercises.length} Exercises ({totalSets} Sets)
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-hy-elevated text-xs font-bold text-hy-volt">
                            {toDisplay(workout.totalVolumeLbs, userProfile.unitSystem).toLocaleString()} {userProfile.unitSystem} volume
                          </span>
                          {workout.exercises.map((ex, exIdx) => {
                            const exName = EXERCISE_DATABASE.find(e => e.id === ex.exerciseId)?.name || ex.exerciseName || ex.exerciseId;
                            return (
                              <span 
                                key={exIdx} 
                                className="px-2 py-0.5 rounded-md bg-hy-bg text-xs text-hy-text-2 border border-hy-elevated"
                              >
                                {exName} ({ex.sets.length}s)
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* BMI & WEIGHT TRACKER (Standard in Home Workout Report) */}
          <div className="hy-card p-5 border border-hy-elevated">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-hy-success" />
                <h3 className="text-sm font-heading font-black text-white uppercase tracking-wider">
                  Weight
                </h3>
              </div>

              <button
                onClick={() => {
                  setInputWeight(userProfile.weightKg);
                  setShowWeightModal(true);
                }}
                className="px-3 py-1 rounded-lg bg-hy-elevated hover:bg-hy-border text-white text-xs font-bold flex items-center gap-1 transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>Log</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-hy-bg border border-hy-elevated">
                <div className="text-xs font-bold text-hy-text-2 uppercase">Weight</div>
                <div className="text-xl font-heading font-black text-white mt-0.5">
                  {userProfile.weightKg} <span className="text-xs font-normal text-hy-text-2">kg</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-hy-bg border border-hy-elevated">
                <div className="text-xs font-bold text-hy-text-2 uppercase">Height</div>
                <div className="text-xl font-heading font-black text-white mt-0.5">
                  {userProfile.heightCm} <span className="text-xs font-normal text-hy-text-2">cm</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-hy-bg border border-hy-elevated col-span-2 sm:col-span-1">
                <div className="text-xs font-bold text-hy-text-2 uppercase">BMI</div>
                <div className="text-xl font-heading font-black mt-0.5" style={{ color: bmiColor }}>
                  {bmi} <span className="text-xs font-bold">({bmiCategory})</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SUB-TAB 2: ALL WORKOUTS LOG SUMMARY */}
      {activeSubTab === 'summary' && (
        <div className="space-y-3">
          {workoutLogs.length === 0 ? (
            <div className="hy-card p-12 text-center border border-hy-elevated">
              <div className="w-16 h-16 rounded-full bg-hy-surface text-hy-text-3 flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-8 h-8 text-hy-text-3" />
              </div>
              <p className="text-sm text-hy-text-2 mb-4">No workouts yet</p>
              {onNavigateToTraining && (
                <button
                  onClick={onNavigateToTraining}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-hy-primary hover:bg-hy-primary-hover text-hy-on-primary text-xs font-bold shadow-lg shadow-hy-primary/30 transition-all"
                >
                  <Dumbbell className="w-4 h-4" />
                  <span>Start a workout</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {workoutLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                const mins = Math.floor(log.durationSeconds / 60);
                const secs = log.durationSeconds % 60;
                const totalSets = log.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
                const logDate = new Date(log.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div 
                    key={log.id} 
                    className="hy-card p-4 border border-hy-elevated hover:border-hy-primary/40 transition-all"
                  >
                    <div 
                      onClick={() => toggleExpand(log.id)}
                      className="cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-black uppercase text-hy-primary tracking-wider">
                            {logDate}
                          </span>
                        </div>
                        <h4 className="text-base font-heading font-black text-white truncate">
                          {log.routineName}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-hy-text-2 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-hy-orange font-bold">
                            <Flame className="w-3.5 h-3.5 fill-hy-orange" />
                            <span>{log.caloriesBurned} kcal</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-hy-volt" />
                            <span>{mins}m {secs}s</span>
                          </span>
                          <span>•</span>
                          <span>{log.exercises.length} Exercises ({totalSets} Sets)</span>
                          <span>•</span>
                          <span className="text-slate-300 font-bold">{toDisplay(log.totalVolumeLbs, userProfile.unitSystem).toLocaleString()} {userProfile.unitSystem}</span>
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-hy-bg-2 border border-hy-elevated flex items-center justify-center text-hy-text-2 shrink-0">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Expanded Exercise Breakdown */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-hy-elevated space-y-2.5 animate-fadeIn">
                        <div className="text-xs font-black uppercase tracking-wider text-hy-text-2">
                          Completed Exercise Breakdown
                        </div>
                        {log.exercises.map((ex, exIdx) => {
                          const exName = EXERCISE_DATABASE.find(e => e.id === ex.exerciseId)?.name || ex.exerciseName || ex.exerciseId;
                          return (
                            <div 
                              key={exIdx}
                              className="p-2.5 rounded-xl bg-hy-bg border border-hy-elevated/60 flex items-center justify-between text-xs"
                            >
                              <div>
                                <div className="font-bold text-white">{exName}</div>
                                <div className="text-xs text-hy-text-2 mt-0.5">
                                  {ex.sets.length} sets completed
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-mono text-slate-300 font-bold">
                                  {ex.sets
                                    .map(s => {
                                      const amount = s.seconds ? `${s.seconds}s` : `${s.reps}r`;
                                      if (s.assistanceLbs) return `${amount} assist ${toDisplay(s.assistanceLbs, userProfile.unitSystem)}${userProfile.unitSystem}`;
                                      return s.totalResistanceLbs ? `${amount} @ ${toDisplay(s.totalResistanceLbs, userProfile.unitSystem)}${userProfile.unitSystem}` : amount;
                                    })
                                    .join(' • ')}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* WEIGHT UPDATE MODAL */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-hy-surface border border-hy-elevated p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading font-black text-white">Body weight</h3>
              <button
                onClick={() => setShowWeightModal(false)}
                className="text-hy-text-2 hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
            </div>


            <div className="flex items-center justify-center gap-3 py-3">
              <button
                onClick={() => setInputWeight(prev => Math.max(30, (Number(prev) || 70) - 0.5))}
                className="w-10 h-10 rounded-xl bg-hy-elevated text-white font-black text-lg hover:bg-hy-border active:scale-95"
              >
                -
              </button>

              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={inputWeight === undefined || inputWeight === null ? '' : inputWeight}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInputWeight(val === '' ? ('' as any) : parseFloat(val));
                  }}
                  onBlur={() => {
                    if (!inputWeight || isNaN(Number(inputWeight)) || Number(inputWeight) < 20) {
                      setInputWeight(userProfile.weightKg || 70);
                    }
                  }}
                  className="w-24 text-center text-3xl font-heading font-black bg-hy-bg border border-hy-elevated rounded-xl text-white px-2 py-1 focus:border-hy-primary outline-none"
                />
                <span className="text-sm font-normal text-hy-text-2">kg</span>
              </div>

              <button
                onClick={() => setInputWeight(prev => Math.min(250, (Number(prev) || 70) + 0.5))}
                className="w-10 h-10 rounded-xl bg-hy-primary text-hy-on-primary font-black text-lg hover:bg-hy-primary-hover active:scale-95"
              >
                +
              </button>
            </div>

            <button
              onClick={() => {
                const finalWeight = Number(inputWeight) > 0 ? Number(inputWeight) : (userProfile.weightKg || 70);
                if (onUpdateWeight) {
                  onUpdateWeight(finalWeight);
                }
                setShowWeightModal(false);
              }}
              className="w-full py-3 rounded-2xl bg-hy-success hover:bg-hy-success text-hy-bg font-black text-xs uppercase tracking-wider shadow-lg shadow-hy-success/30 transition-all active:scale-95"
            >
              Save Weight
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
