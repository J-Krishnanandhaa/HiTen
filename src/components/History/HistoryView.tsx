import React, { useState } from 'react';
import { 
  Clock, Flame, Trophy, Calendar, ChevronDown, 
  ChevronUp, Scale, Activity, Plus, ChevronLeft, 
  ChevronRight, Dumbbell, ArrowRight, Zap, TrendingUp, CheckCircle2
} from 'lucide-react';
import { WorkoutSessionLog, UserProfile } from '../../types';
import { EXERCISE_DATABASE } from '../../data/exerciseDatabase';
import { getTodayDateString } from '../../utils/storage';
import { 
  calculateAverageCaloriesPerWorkout, 
  calculateAverageCaloriesPerMinute,
  calculateWeeklyCalorieBurn 
} from '../../utils/nutritionMath';

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
  const avgCaloriesPerWorkout = calculateAverageCaloriesPerWorkout(workoutLogs);
  const avgCaloriesPerMinute = calculateAverageCaloriesPerMinute(workoutLogs);

  // Weekly Calorie Burn Stats (Mon - Sun)
  const weeklyStats = calculateWeeklyCalorieBurn(workoutLogs);

  // BMI Calculation: Weight (kg) / [Height (m)]^2
  const heightM = userProfile.heightCm / 100;
  const bmi = heightM > 0 ? (userProfile.weightKg / (heightM * heightM)).toFixed(1) : '22.0';
  const bmiNum = parseFloat(bmi);

  let bmiCategory = 'Normal';
  let bmiColor = '#00E676';
  if (bmiNum < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = '#2979FF';
  } else if (bmiNum < 25) {
    bmiCategory = 'Normal Weight';
    bmiColor = '#00E676';
  } else if (bmiNum < 30) {
    bmiCategory = 'Overweight';
    bmiColor = '#FF9100';
  } else {
    bmiCategory = 'Obese';
    bmiColor = '#FF3D00';
  }

  const needlePercent = Math.min(100, Math.max(0, ((bmiNum - 15) / (35 - 15)) * 100));

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
  const dayWorkoutCaloriesBurned = selectedDayWorkouts.reduce((acc, log) => acc + (log.caloriesBurned || 0), 0);
  const dayWorkoutSeconds = selectedDayWorkouts.reduce((acc, log) => acc + (log.durationSeconds || 0), 0);
  const dayWorkoutMinutes = Math.round(dayWorkoutSeconds / 60);
  const dayTotalVolumeLbs = selectedDayWorkouts.reduce((acc, log) => acc + (log.totalVolumeLbs || 0), 0);

  // Formatted date string for selected inspector header
  const parsedDate = new Date(selectedDate + 'T00:00:00');
  const formattedSelectedDate = parsedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-5 animate-fadeIn select-none">
      
      {/* 1. TRI-METRIC STATS (Home Workout Standard Banner) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Total Workouts */}
        <div className="leap-card p-3 sm:p-4 text-center border-t-2 border-t-[#2979FF] flex flex-col justify-between">
          <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
            Workouts
          </div>
          <div className="font-heading font-black text-2xl sm:text-3xl text-white my-0.5">
            {totalWorkouts}
          </div>
          <div className="text-[10px] text-[#2979FF] font-bold flex items-center justify-center gap-1">
            <Trophy className="w-3 h-3" />
            <span>Completed</span>
          </div>
        </div>

        {/* Total Calories Burned */}
        <div className="leap-card p-3 sm:p-4 text-center border-t-2 border-t-[#FF6D00] flex flex-col justify-between">
          <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
            Calories
          </div>
          <div className="font-heading font-black text-2xl sm:text-3xl text-[#FF6D00] my-0.5">
            {totalCalories.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1">
            <Flame className="w-3 h-3 text-[#FF6D00] fill-[#FF6D00]" />
            <span>kcal burnt</span>
          </div>
        </div>

        {/* Total Minutes */}
        <div className="leap-card p-3 sm:p-4 text-center border-t-2 border-t-[#00E5FF] flex flex-col justify-between">
          <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
            Minutes
          </div>
          <div className="font-heading font-black text-2xl sm:text-3xl text-white my-0.5">
            {totalMinutes}
          </div>
          <div className="text-[10px] text-[#00E5FF] font-bold flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Time active</span>
          </div>
        </div>

        {/* Average Calorie Burn */}
        <div className="leap-card p-3 sm:p-4 text-center border-t-2 border-t-[#00E676] flex flex-col justify-between">
          <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
            Avg Burn
          </div>
          <div className="font-heading font-black text-2xl sm:text-3xl text-[#00E676] my-0.5">
            {avgCaloriesPerWorkout}
          </div>
          <div className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-[#00E676]" />
            <span>{avgCaloriesPerMinute > 0 ? `~${avgCaloriesPerMinute} kcal/min` : 'kcal / workout'}</span>
          </div>
        </div>
      </div>

      {/* 2. WEEKLY CALORIE BURN ACTIVITY BAR CHART */}
      <div className="leap-card p-4 sm:p-5 border border-[#242C35]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#FF6D00]" />
            <h3 className="text-xs sm:text-sm font-heading font-black text-white uppercase tracking-wider">
              This Week's Calorie Burn
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <span className="text-[#FF6D00] font-black">{weeklyStats.weekTotal.toLocaleString()} kcal</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 text-[11px]">Avg {weeklyStats.dailyAverage} kcal/active day</span>
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
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 truncate h-3.5">
                  {day.calories > 0 ? `${day.calories}` : ''}
                </span>

                {/* Vertical Bar */}
                <div className="w-full max-w-[36px] h-20 sm:h-24 bg-[#12161A] rounded-xl flex items-end p-1 border border-[#242C35] group-hover:border-[#2979FF]/50 transition-all">
                  <div 
                    className={`w-full rounded-lg transition-all duration-500 ${
                      day.calories > 0
                        ? day.isToday
                          ? 'bg-gradient-to-t from-[#FF6D00] to-[#FF9100] shadow-md shadow-[#FF6D00]/30'
                          : 'bg-gradient-to-t from-[#2979FF] to-[#00E5FF]'
                        : 'bg-[#1E252D]'
                    }`}
                    style={{ height: `${barHeightPct}%` }}
                  />
                </div>

                {/* Day label */}
                <span className={`text-[10px] sm:text-xs font-black ${
                  day.isToday ? 'text-[#FF6D00]' : 'text-slate-400'
                }`}>
                  {day.shortDay}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SUB-TABS: WORKOUT CALENDAR vs ALL WORKOUTS LOG */}
      <div className="flex border-b border-[#242C35] text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('calendar')}
          className={`pb-2.5 px-4 flex items-center gap-1.5 border-b-2 transition-all ${
            activeSubTab === 'calendar'
              ? 'border-[#2979FF] text-[#2979FF] font-black'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Workout Calendar</span>
        </button>

        <button
          onClick={() => setActiveSubTab('summary')}
          className={`pb-2.5 px-4 flex items-center gap-1.5 border-b-2 transition-all ${
            activeSubTab === 'summary'
              ? 'border-[#2979FF] text-[#2979FF] font-black'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>All Workouts ({workoutLogs.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: WORKOUT CALENDAR */}
      {activeSubTab === 'calendar' && (
        <div className="space-y-4">
          
          {/* Calendar Month Navigation Header */}
          <div className="leap-card p-4 sm:p-5 border border-[#242C35]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2979FF]" />
                <h3 className="text-base sm:text-lg font-heading font-black text-white">
                  {currentMonthName} {viewYear}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleJumpToToday}
                  className="px-2.5 py-1 rounded-lg bg-[#242C35] hover:bg-[#2D3748] text-white text-[11px] font-bold transition-all"
                >
                  Today
                </button>
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg bg-[#242C35] hover:bg-[#2D3748] text-slate-300 transition-all"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg bg-[#242C35] hover:bg-[#2D3748] text-slate-300 transition-all"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week Header (Mon-Sun) */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-black uppercase text-slate-500 py-1 border-b border-[#242C35]/60">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span className="text-blue-400">Sat</span>
              <span className="text-blue-400">Sun</span>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-2">
              {/* Empty padding cells for start of month */}
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-14 sm:h-18 rounded-xl bg-[#12161A]/30 border border-transparent" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isSelected = selectedDate === dateKey;
                const isToday = todayStr === dateKey;

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
                        ? 'border-[#2979FF] bg-[#2979FF]/15 ring-2 ring-[#2979FF]/40 shadow-lg shadow-[#2979FF]/20 scale-[1.02]'
                        : isToday
                        ? 'border-[#00E676]/60 bg-[#1A2026] hover:bg-[#242C35]'
                        : 'border-[#242C35] bg-[#161B22] hover:bg-[#202731]'
                    }`}
                  >
                    {/* Day number & indicators */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black ${
                        isSelected 
                          ? 'text-[#2979FF]' 
                          : isToday 
                          ? 'text-[#00E676]' 
                          : 'text-slate-300'
                      }`}>
                        {dayNum}
                      </span>
                      {isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]" title="Today" />
                      )}
                    </div>

                    {/* Workout Calorie Badge */}
                    <div>
                      {hasWorkout ? (
                        <div className="flex items-center gap-1 px-1 py-0.5 rounded bg-[#FF6D00]/20 border border-[#FF6D00]/40 text-[9px] font-bold text-[#FF6D00] truncate">
                          <Flame className="w-2.5 h-2.5 fill-[#FF6D00] shrink-0" />
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

            {/* Legend */}
            <div className="flex items-center justify-center gap-5 text-[10px] font-bold text-slate-400 mt-4 pt-3 border-t border-[#242C35]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#FF6D00]/20 border border-[#FF6D00]/50 flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-[#FF6D00]" />
                </span>
                <span>Workout Done (Calories Burnt)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#00E676]/20 border border-[#00E676]/50 flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-[#00E676]" />
                </span>
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* DAY DETAILS INSPECTOR CARD */}
          <div className="leap-card p-5 sm:p-6 border-2 border-[#2979FF]/40 shadow-xl bg-gradient-to-b from-[#1A2026] to-[#12161A]">
            
            {/* Inspector Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#242C35]">
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-[#2979FF] mb-0.5">
                  Workout & Calorie Burn Inspector
                </div>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white">
                  {formattedSelectedDate}
                </h2>
              </div>

              {selectedDayWorkouts.length === 0 && onNavigateToTraining && (
                <button
                  onClick={onNavigateToTraining}
                  className="px-4 py-2 rounded-xl bg-[#2979FF] hover:bg-[#1E6BEE] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#2979FF]/20 transition-all self-start sm:self-auto"
                >
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Start a Workout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 4-Card Day Workout Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
              
              {/* 1. Calories Burned */}
              <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#242C35]">
                <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-400 mb-1">
                  <span>Calories Burnt</span>
                  <Flame className="w-3.5 h-3.5 text-[#FF6D00] fill-[#FF6D00]" />
                </div>
                <div className="font-heading font-black text-xl text-[#FF6D00]">
                  {dayWorkoutCaloriesBurned.toLocaleString()} <span className="text-xs font-normal text-slate-400">kcal</span>
                </div>
                <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                  {selectedDayWorkouts.length} workout{selectedDayWorkouts.length !== 1 ? 's' : ''} completed
                </div>
              </div>

              {/* 2. Active Training Time */}
              <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#242C35]">
                <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-400 mb-1">
                  <span>Active Time</span>
                  <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
                </div>
                <div className="font-heading font-black text-xl text-white">
                  {dayWorkoutMinutes} <span className="text-xs font-normal text-slate-400">mins</span>
                </div>
                <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                  {dayWorkoutSeconds > 0 ? `${dayWorkoutSeconds} total seconds` : 'No active timer'}
                </div>
              </div>

              {/* 3. Total Resistance Volume */}
              <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#242C35]">
                <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-400 mb-1">
                  <span>Band Load</span>
                  <Dumbbell className="w-3.5 h-3.5 text-[#2979FF]" />
                </div>
                <div className="font-heading font-black text-xl text-[#2979FF]">
                  {dayTotalVolumeLbs.toLocaleString()} <span className="text-xs font-normal text-slate-400">lbs</span>
                </div>
                <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                  Total resistance moved
                </div>
              </div>

              {/* 4. Burn Rate / Intensity */}
              <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#242C35]">
                <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-400 mb-1">
                  <span>Burn Rate</span>
                  <Zap className="w-3.5 h-3.5 text-[#00E676]" />
                </div>
                <div className="font-heading font-black text-xl text-[#00E676]">
                  {dayWorkoutMinutes > 0 ? (dayWorkoutCaloriesBurned / dayWorkoutMinutes).toFixed(1) : '0'} <span className="text-xs font-normal text-slate-400">kcal/min</span>
                </div>
                <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                  {dayWorkoutCaloriesBurned > 0 ? 'Optimal Progressive Load' : 'Rest day'}
                </div>
              </div>

            </div>

            {/* Completed Workout Details for Selected Day */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-[#2979FF]" />
                <span>Workouts Logged ({selectedDayWorkouts.length})</span>
              </h4>

              {selectedDayWorkouts.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#161B22] border border-[#242C35] text-center">
                  <div className="w-10 h-10 rounded-full bg-[#242C35] text-slate-400 flex items-center justify-center mx-auto mb-2">
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </div>
                  <h5 className="text-sm font-bold text-white mb-1">Rest & Recovery Day</h5>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-3">
                    No workout recorded on this date. Rest days allow muscle tissues to rebuild and adapt to tension overload.
                  </p>
                  {onNavigateToTraining && (
                    <button
                      onClick={onNavigateToTraining}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2979FF] text-white text-xs font-bold hover:bg-[#1E6BEE] transition-all"
                    >
                      <Dumbbell className="w-3.5 h-3.5" />
                      <span>Start Today's Workout</span>
                    </button>
                  )}
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
                        className="p-4 rounded-2xl bg-[#161B22] border border-[#242C35] hover:border-[#2979FF]/40 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-[10px] font-black uppercase text-[#2979FF] tracking-wider block">
                              Completed Workout
                            </span>
                            <h5 className="text-base font-heading font-black text-white">
                              {workout.routineName}
                            </h5>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-heading font-black text-[#FF6D00] flex items-center justify-end gap-1">
                              <Flame className="w-3.5 h-3.5 fill-[#FF6D00]" />
                              <span>{workout.caloriesBurned} kcal</span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {mins}m {secs}s
                            </div>
                          </div>
                        </div>

                        {/* Exercise tags summary */}
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#242C35]">
                          <span className="px-2 py-0.5 rounded-md bg-[#242C35] text-[10px] font-bold text-slate-300">
                            {workout.exercises.length} Exercises ({totalSets} Sets)
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#242C35] text-[10px] font-bold text-[#00E5FF]">
                            {workout.totalVolumeLbs.toLocaleString()} lbs Volume
                          </span>
                          {workout.exercises.map((ex, exIdx) => {
                            const exName = EXERCISE_DATABASE.find(e => e.id === ex.exerciseId)?.name || ex.exerciseName || ex.exerciseId;
                            return (
                              <span 
                                key={exIdx} 
                                className="px-2 py-0.5 rounded-md bg-[#12161A] text-[10px] text-slate-400 border border-[#242C35]"
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
          <div className="leap-card p-5 border border-[#242C35]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#00E676]" />
                <h3 className="text-sm font-heading font-black text-white uppercase tracking-wider">
                  Weight & Body Mass Index (BMI)
                </h3>
              </div>

              <button
                onClick={() => {
                  setInputWeight(userProfile.weightKg);
                  setShowWeightModal(true);
                }}
                className="px-3 py-1 rounded-lg bg-[#242C35] hover:bg-[#2D3748] text-white text-xs font-bold flex items-center gap-1 transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>Log Weight</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-[#12161A] border border-[#242C35]">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Current Weight</div>
                <div className="text-xl font-heading font-black text-white mt-0.5">
                  {userProfile.weightKg} <span className="text-xs font-normal text-slate-400">kg</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#12161A] border border-[#242C35]">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Height</div>
                <div className="text-xl font-heading font-black text-white mt-0.5">
                  {userProfile.heightCm} <span className="text-xs font-normal text-slate-400">cm</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#12161A] border border-[#242C35] col-span-2 sm:col-span-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">BMI Index</div>
                <div className="text-xl font-heading font-black mt-0.5" style={{ color: bmiColor }}>
                  {bmi} <span className="text-xs font-bold">({bmiCategory})</span>
                </div>
              </div>
            </div>

            {/* BMI Bar Gauge */}
            <div className="space-y-1.5">
              <div className="relative h-2.5 rounded-full bg-[#12161A] border border-[#242C35] overflow-hidden flex">
                <div className="h-full bg-[#2979FF] w-[20%]" title="Underweight (< 18.5)" />
                <div className="h-full bg-[#00E676] w-[35%]" title="Normal (18.5 - 24.9)" />
                <div className="h-full bg-[#FF9100] w-[25%]" title="Overweight (25 - 29.9)" />
                <div className="h-full bg-[#FF3D00] w-[20%]" title="Obese (≥ 30)" />
              </div>

              <div className="flex justify-between text-[10px] font-bold text-slate-500 px-0.5">
                <span>15.0</span>
                <span>18.5 (Normal)</span>
                <span>25.0 (Overweight)</span>
                <span>35.0+</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: ALL WORKOUTS LOG SUMMARY */}
      {activeSubTab === 'summary' && (
        <div className="space-y-3">
          {workoutLogs.length === 0 ? (
            <div className="leap-card p-12 text-center border border-[#242C35]">
              <div className="w-16 h-16 rounded-full bg-[#1A2026] text-slate-500 flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">No Workouts Recorded Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                Complete your first workout in the Training tab to start tracking your calories burned, resistance volume, and personal records.
              </p>
              {onNavigateToTraining && (
                <button
                  onClick={onNavigateToTraining}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2979FF] hover:bg-[#1E6BEE] text-white text-xs font-bold shadow-lg shadow-[#2979FF]/30 transition-all"
                >
                  <Dumbbell className="w-4 h-4" />
                  <span>Go to Training</span>
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
                    className="leap-card p-4 border border-[#242C35] hover:border-[#2979FF]/40 transition-all"
                  >
                    <div 
                      onClick={() => toggleExpand(log.id)}
                      className="cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-black uppercase text-[#2979FF] tracking-wider">
                            {logDate}
                          </span>
                        </div>
                        <h4 className="text-base font-heading font-black text-white truncate">
                          {log.routineName}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-[#FF6D00] font-bold">
                            <Flame className="w-3.5 h-3.5 fill-[#FF6D00]" />
                            <span>{log.caloriesBurned} kcal</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
                            <span>{mins}m {secs}s</span>
                          </span>
                          <span>•</span>
                          <span>{log.exercises.length} Exercises ({totalSets} Sets)</span>
                          <span>•</span>
                          <span className="text-slate-300 font-bold">{log.totalVolumeLbs.toLocaleString()} lbs</span>
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-[#161B22] border border-[#242C35] flex items-center justify-center text-slate-400 shrink-0">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Expanded Exercise Breakdown */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-[#242C35] space-y-2.5 animate-fadeIn">
                        <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                          Completed Exercise Breakdown
                        </div>
                        {log.exercises.map((ex, exIdx) => {
                          const exName = EXERCISE_DATABASE.find(e => e.id === ex.exerciseId)?.name || ex.exerciseName || ex.exerciseId;
                          return (
                            <div 
                              key={exIdx}
                              className="p-2.5 rounded-xl bg-[#12161A] border border-[#242C35]/60 flex items-center justify-between text-xs"
                            >
                              <div>
                                <div className="font-bold text-white">{exName}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {ex.sets.length} sets completed
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-mono text-slate-300 font-bold">
                                  {ex.sets.map(s => `${s.reps}r @ ${s.totalResistanceLbs}lbs`).join(' • ')}
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
          <div className="w-full max-w-sm rounded-3xl bg-[#1A2026] border border-[#242C35] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading font-black text-white">Log Today's Weight</h3>
              <button
                onClick={() => setShowWeightModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Updating your body weight automatically recalibrates your calorie burn expenditure for all future workouts.
            </p>

            <div className="flex items-center justify-center gap-3 py-3">
              <button
                onClick={() => setInputWeight(prev => Math.max(30, (Number(prev) || 70) - 0.5))}
                className="w-10 h-10 rounded-xl bg-[#242C35] text-white font-black text-lg hover:bg-[#2D3748] active:scale-95"
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
                  className="w-24 text-center text-3xl font-heading font-black bg-[#12161A] border border-[#242C35] rounded-xl text-white px-2 py-1 focus:border-[#2979FF] outline-none"
                />
                <span className="text-sm font-normal text-slate-400">kg</span>
              </div>

              <button
                onClick={() => setInputWeight(prev => Math.min(250, (Number(prev) || 70) + 0.5))}
                className="w-10 h-10 rounded-xl bg-[#2979FF] text-white font-black text-lg hover:bg-[#1E6BEE] active:scale-95"
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
              className="w-full py-3 rounded-2xl bg-[#00E676] hover:bg-[#00C853] text-[#12161A] font-black text-xs uppercase tracking-wider shadow-lg shadow-[#00E676]/30 transition-all active:scale-95"
            >
              Save Weight
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
