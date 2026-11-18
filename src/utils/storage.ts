import { UserProfile, Routine, WorkoutSessionLog, DailyNutritionLog } from '../types';
import { ALL_DEFAULT_BANDS, SLOVIC_LOOP_BANDS } from '../data/defaultBands';
import { PREBUILT_ROUTINES } from '../data/prebuiltWorkouts';

const STORAGE_KEYS = {
  PROFILE: 'bandfit_profile_v1',
  ROUTINES: 'bandfit_routines_v1',
  WORKOUT_LOGS: 'bandfit_workout_logs_v1',
  NUTRITION_LOGS: 'bandfit_nutrition_logs_v1',
};

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  gender: 'male',
  age: 25,
  weightKg: 70,
  heightCm: 175,
  unitSystem: 'kg',
  activityLevel: 'moderate',
  fitnessGoal: 'maintenance',
  dailyCalorieTarget: 2000,
  dailyProteinTarget: 140,
  dailyCarbsTarget: 200,
  dailyFatTarget: 55,
  dailyWaterGoalMl: 2500,
  ownedBands: SLOVIC_LOOP_BANDS,
  streakDays: 0,
  lastWorkoutDate: undefined,
  hasResistanceBands: true,
  hasPullUpBar: true,
  targetWorkoutDurationMins: 20,
};

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// PROFILE
export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    const logsRaw = localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
    const hasLogs = logsRaw ? JSON.parse(logsRaw).length > 0 : false;

    if (raw) {
      const parsed = { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
      // If user hasn't logged any workouts yet, streak is strictly 0
      if (!hasLogs) {
        parsed.streakDays = 0;
        parsed.lastWorkoutDate = undefined;
      }
      if (!parsed.targetWorkoutDurationMins) {
        parsed.targetWorkoutDurationMins = 20;
      }
      parsed.hasResistanceBands = parsed.hasResistanceBands !== false;
      parsed.hasPullUpBar = parsed.hasPullUpBar !== false;
      // Remove 11pc tube set bands if found
      parsed.ownedBands = (parsed.ownedBands || []).filter(
        (b: any) => b.type !== 'Tube with Handles' && !b.id.includes('tube')
      );
      if (!parsed.ownedBands.length) {
        parsed.ownedBands = SLOVIC_LOOP_BANDS;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load user profile:', e);
  }
  return DEFAULT_PROFILE;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile:', e);
  }
}

// ROUTINES
export function loadRoutines(): Routine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROUTINES);
    if (raw) {
      const stored: Routine[] = JSON.parse(raw);
      const prebuiltMap = new Map(PREBUILT_ROUTINES.map(r => [r.id, r]));
      // Update any prebuilt routines with latest definitions, while preserving user-created custom routines
      const updated = stored.map(r => prebuiltMap.get(r.id) || r);
      const existingIds = new Set(updated.map(r => r.id));
      const missingPrebuilts = PREBUILT_ROUTINES.filter(r => !existingIds.has(r.id));
      return [...updated, ...missingPrebuilts];
    }
  } catch (e) {
    console.error('Failed to load routines:', e);
  }
  return PREBUILT_ROUTINES;
}

export function saveRoutines(routines: Routine[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
  } catch (e) {
    console.error('Failed to save routines:', e);
  }
}

// WORKOUT LOGS
export function loadWorkoutLogs(): WorkoutSessionLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
    if (raw) {
      const stored: WorkoutSessionLog[] = JSON.parse(raw);
      // Clean out any demo sample logs
      const cleaned = stored.filter(l => !l.id.startsWith('workout-aug'));
      if (cleaned.length !== stored.length) {
        localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(cleaned));
      }
      return cleaned;
    }
  } catch (e) {
    console.error('Failed to load workout logs:', e);
  }
  return [];
}

export function saveWorkoutLog(log: WorkoutSessionLog): void {
  try {
    const existing = loadWorkoutLogs();
    const updated = [log, ...existing];
    localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(updated));

    // Update streak in profile
    const profile = loadUserProfile();
    const today = getTodayDateString();
    const lastDate = profile.lastWorkoutDate ? profile.lastWorkoutDate.split('T')[0] : null;

    if (lastDate !== today) {
      profile.streakDays = (profile.streakDays || 0) + 1;
      profile.lastWorkoutDate = new Date().toISOString();
      saveUserProfile(profile);
    }
  } catch (e) {
    console.error('Failed to save workout log:', e);
  }
}

// NUTRITION LOGS
export function loadDailyNutrition(dateStr: string = getTodayDateString()): DailyNutritionLog {
  const profile = loadUserProfile();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NUTRITION_LOGS);
    if (raw) {
      const all: Record<string, DailyNutritionLog> = JSON.parse(raw);
      if (all[dateStr]) {
        return all[dateStr];
      }
    }
  } catch (e) {
    console.error('Failed to load daily nutrition:', e);
  }

  // Fallback to fresh day
  return {
    date: dateStr,
    meals: [],
    waterMl: 0,
    waterGoalMl: profile.dailyWaterGoalMl || 2800,
    targetCalories: profile.dailyCalorieTarget || 2150,
    targetProteinG: profile.dailyProteinTarget || 150,
    targetCarbsG: profile.dailyCarbsTarget || 220,
    targetFatG: profile.dailyFatTarget || 60,
  };
}

export function saveDailyNutrition(log: DailyNutritionLog): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NUTRITION_LOGS);
    const all: Record<string, DailyNutritionLog> = raw ? JSON.parse(raw) : {};
    all[log.date] = log;
    localStorage.setItem(STORAGE_KEYS.NUTRITION_LOGS, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save daily nutrition:', e);
  }
}

export function getAllNutritionLogs(): Record<string, DailyNutritionLog> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NUTRITION_LOGS);
    if (raw) {
      const stored: Record<string, DailyNutritionLog> = JSON.parse(raw);
      // Clean out any demo sample dates
      const cleaned: Record<string, DailyNutritionLog> = {};
      let hasChanged = false;
      for (const [date, log] of Object.entries(stored)) {
        if (date === '2026-08-18' || date === '2026-08-19' || date === '2026-08-20') {
          hasChanged = true;
          continue;
        }
        cleaned[date] = log;
      }
      if (hasChanged) {
        localStorage.setItem(STORAGE_KEYS.NUTRITION_LOGS, JSON.stringify(cleaned));
      }
      return cleaned;
    }
    return {};
  } catch (e) {
    console.error('Failed to load all nutrition logs:', e);
    return {};
  }
}

// BACKUP & RESTORE
export function exportAllData(): string {
  const data = {
    profile: loadUserProfile(),
    routines: loadRoutines(),
    workoutLogs: loadWorkoutLogs(),
    nutritionLogs: getAllNutritionLogs(),
    exportDate: new Date().toISOString(),
    version: '1.0.0',
  };
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.profile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(parsed.profile));
    if (parsed.routines) localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(parsed.routines));
    if (parsed.workoutLogs) localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(parsed.workoutLogs));
    if (parsed.nutritionLogs) localStorage.setItem(STORAGE_KEYS.NUTRITION_LOGS, JSON.stringify(parsed.nutritionLogs));
    return true;
  } catch (e) {
    console.error('Failed to import backup:', e);
    return false;
  }
}

export function resetAllDataToFresh(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.WORKOUT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.NUTRITION_LOGS);
    localStorage.removeItem(STORAGE_KEYS.ROUTINES);
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
  } catch (e) {
    console.error('Failed to reset all data:', e);
  }
}
