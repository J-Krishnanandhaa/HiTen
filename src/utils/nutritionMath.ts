import { UserProfile, WorkoutSessionLog } from '../types';
import { toLocalDateString } from './storage';

/**
 * MET values from the 2024 Adult Compendium of Physical Activities.
 *  - 02035  5.0  Circuit training, moderate effort   → band/bar supersets with short rests
 *  - 02032  6.0  Circuit training, body weight       → full-body flows and challenges
 *  - 02030  3.5  Calisthenics, light/moderate (core) → core and mobility sessions
 *  - 02054  3.5  Resistance training, 8–15 reps      → straight sets with longer rests
 * The result is an estimate: shown as "est." in the UI.
 */
export type SessionIntensity = 'core' | 'strength' | 'circuit' | 'conditioning';

export const SESSION_MET: Record<SessionIntensity, number> = {
  core: 3.5,
  strength: 5.0,
  circuit: 6.0,
  conditioning: 8.0,
};

/** Pick the session's intensity class from its routine category. */
export function sessionIntensityFor(category?: string): SessionIntensity {
  const c = (category || '').toLowerCase();
  if (c.includes('core')) return 'core';
  if (c.includes('full body') || c.includes('7x4') || c.includes('challenge')) return 'circuit';
  if (c.includes('hiit') || c.includes('conditioning')) return 'conditioning';
  return 'strength';
}

/** Calories = MET × body weight (kg) × hours. */
export function estimateWorkoutCalories(
  durationMinutes: number,
  userWeightKg: number,
  intensity: SessionIntensity = 'strength'
): number {
  const safeWeight = userWeightKg > 0 ? userWeightKg : 70;
  const safeMinutes = Math.max(0.1, durationMinutes);
  return Math.max(1, Math.round(SESSION_MET[intensity] * safeWeight * (safeMinutes / 60)));
}

/**
 * Calculates average calories burned per workout session across all logged workouts.
 */
export function calculateAverageCaloriesPerWorkout(workoutLogs: WorkoutSessionLog[]): number {
  if (!workoutLogs || workoutLogs.length === 0) return 0;
  const totalCals = workoutLogs.reduce((acc, log) => acc + (log.caloriesBurned || 0), 0);
  return Math.round(totalCals / workoutLogs.length);
}

/**
 * Calculates average calories burned per minute of active training.
 */
export function calculateAverageCaloriesPerMinute(workoutLogs: WorkoutSessionLog[]): number {
  if (!workoutLogs || workoutLogs.length === 0) return 0;
  const totalCals = workoutLogs.reduce((acc, log) => acc + (log.caloriesBurned || 0), 0);
  const totalSeconds = workoutLogs.reduce((acc, log) => acc + (log.durationSeconds || 0), 0);
  const totalMinutes = totalSeconds / 60;
  if (totalMinutes <= 0) return 0;
  return parseFloat((totalCals / totalMinutes).toFixed(1));
}

/**
 * Calculates weekly calorie burn distribution for Mon-Sun of the current week.
 */
export function calculateWeeklyCalorieBurn(workoutLogs: WorkoutSessionLog[]): {
  days: { dayName: string; shortDay: string; dateStr: string; calories: number; isToday: boolean }[];
  weekTotal: number;
  dailyAverage: number;
} {
  const today = new Date();
  const currentDayOfWeek = (today.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const weekDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weekShortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const monday = new Date(today);
  monday.setDate(today.getDate() - currentDayOfWeek);
  monday.setHours(0, 0, 0, 0);

  const days = [];
  let weekTotal = 0;

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);
    const dateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
    
    // Sum workout calories for this day using local calendar date
    const dayWorkouts = workoutLogs.filter(log => toLocalDateString(log.date) === dateStr);
    const dayCals = dayWorkouts.reduce((sum, log) => sum + (log.caloriesBurned || 0), 0);
    weekTotal += dayCals;

    days.push({
      dayName: weekDayNames[i],
      shortDay: weekShortDays[i],
      dateStr,
      calories: dayCals,
      isToday: i === currentDayOfWeek,
    });
  }

  const activeDaysCount = days.filter(d => d.calories > 0).length;
  const dailyAverage = activeDaysCount > 0 ? Math.round(weekTotal / activeDaysCount) : 0;

  return {
    days,
    weekTotal,
    dailyAverage,
  };
}

/**
 * Basic BMR calculation (Mifflin-St Jeor) for profile reference
 */
export function calculateBMR(profile: Pick<UserProfile, 'gender' | 'weightKg' | 'heightCm' | 'age'>): number {
  const { gender, weightKg, heightCm, age } = profile;
  if (gender === 'female') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  } else {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  }
}

export function getActivityMultiplier(activityLevel: UserProfile['activityLevel']): number {
  switch (activityLevel) {
    case 'sedentary':
      return 1.2;
    case 'light':
      return 1.375;
    case 'moderate':
      return 1.55;
    case 'very_active':
      return 1.725;
    case 'extra_active':
      return 1.9;
    default:
      return 1.4;
  }
}

export function calculateTDEE(profile: Pick<UserProfile, 'gender' | 'weightKg' | 'heightCm' | 'age' | 'activityLevel'>): number {
  const bmr = calculateBMR(profile);
  const mult = getActivityMultiplier(profile.activityLevel);
  return Math.round(bmr * mult);
}

export function calculateMacroTargets(
  tdee: number,
  weightKg: number,
  fitnessGoal: UserProfile['fitnessGoal']
): { calories: number; proteinG: number; carbsG: number; fatG: number } {
  let targetCalories = tdee;

  if (fitnessGoal === 'fat_loss') {
    targetCalories = Math.max(1200, Math.round(tdee - 450));
  } else if (fitnessGoal === 'muscle_gain') {
    targetCalories = Math.round(tdee + 300);
  }

  const proteinG = Math.round(weightKg * 2.0);
  const proteinCalories = proteinG * 4;
  const fatCalories = targetCalories * 0.25;
  const fatG = Math.round(fatCalories / 9);
  const carbCalories = Math.max(0, targetCalories - proteinCalories - fatCalories);
  const carbsG = Math.round(carbCalories / 4);

  return {
    calories: targetCalories,
    proteinG,
    carbsG,
    fatG,
  };
}
