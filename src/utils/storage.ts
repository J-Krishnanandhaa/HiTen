import { UserProfile, Routine, WorkoutSessionLog, DailyNutritionLog } from '../types';
import { SLOVIC_LOOP_BANDS } from '../data/defaultBands';
import { PREBUILT_ROUTINES } from '../data/prebuiltWorkouts';
import { KG_TO_LBS } from './bands';

/**
 * Local persistence (offline, no account).
 *
 * Schema history:
 *  v1  `bandfit_*_v1` keys; set loads saved in the display unit under a field
 *      called totalResistanceLbs (kg users stored kg).
 *  v2  `hyten_*` keys; set loads always stored in lbs; schema version tracked.
 */
export const SCHEMA_VERSION = 2;

const KEYS = {
  PROFILE: 'hyten_profile',
  ROUTINES: 'hyten_routines',
  WORKOUT_LOGS: 'hyten_workout_logs',
  NUTRITION_LOGS: 'hyten_nutrition_logs',
  SCHEMA: 'hyten_schema_version',
};

const LEGACY_KEYS = {
  PROFILE: 'bandfit_profile_v1',
  ROUTINES: 'bandfit_routines_v1',
  WORKOUT_LOGS: 'bandfit_workout_logs_v1',
  NUTRITION_LOGS: 'bandfit_nutrition_logs_v1',
};

export const DEFAULT_PROFILE: UserProfile = {
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
  weeklyGoal: 4,
  experience: 'beginner',
  onboarded: false,
};

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (e) {
    console.error(`Failed to read ${key}:`, e);
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to write ${key}:`, e);
  }
}

/**
 * One-time migration from v1 (`bandfit_*`) to v2. Copies data to the new keys,
 * converts kg users' set loads to lbs, and keeps the old keys untouched as a
 * fallback. Safe to call on every start.
 */
export function migrateStorage(): void {
  try {
    const current = Number(localStorage.getItem(KEYS.SCHEMA) || 0);
    if (current >= SCHEMA_VERSION) return;

    const hasNew = localStorage.getItem(KEYS.PROFILE) !== null;
    if (!hasNew) {
      const legacyProfile = read<Partial<UserProfile>>(LEGACY_KEYS.PROFILE);
      const legacyLogs = read<WorkoutSessionLog[]>(LEGACY_KEYS.WORKOUT_LOGS) || [];
      const legacyRoutines = read<Routine[]>(LEGACY_KEYS.ROUTINES);
      const legacyNutrition = read<Record<string, DailyNutritionLog>>(LEGACY_KEYS.NUTRITION_LOGS);

      const wasKg = (legacyProfile?.unitSystem ?? 'kg') === 'kg';
      const logs = legacyLogs
        .filter(l => !String(l.id).startsWith('workout-aug')) // old demo entries
        .map(l => (wasKg ? convertLogKgToLbs(l) : l));

      if (legacyProfile) {
        // Existing users skip first-run setup.
        write(KEYS.PROFILE, { ...legacyProfile, onboarded: true });
      }
      if (legacyLogs.length) write(KEYS.WORKOUT_LOGS, logs);
      if (legacyRoutines) write(KEYS.ROUTINES, legacyRoutines);
      if (legacyNutrition) write(KEYS.NUTRITION_LOGS, legacyNutrition);
    }
    localStorage.setItem(KEYS.SCHEMA, String(SCHEMA_VERSION));
  } catch (e) {
    console.error('Storage migration failed:', e);
  }
}

function convertLogKgToLbs(log: WorkoutSessionLog): WorkoutSessionLog {
  const exercises = log.exercises.map(ex => ({
    ...ex,
    sets: ex.sets.map(s => ({ ...s, totalResistanceLbs: Math.round(s.totalResistanceLbs * KG_TO_LBS * 10) / 10 })),
  }));
  const totalVolumeLbs = exercises.reduce(
    (t, ex) => t + ex.sets.reduce((a, s) => a + (s.completed ? s.reps * s.totalResistanceLbs : 0), 0),
    0
  );
  return { ...log, exercises, totalVolumeLbs: Math.round(totalVolumeLbs) };
}

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Formats any ISO/timestamp or Date object into a local 'YYYY-MM-DD' string to avoid UTC day-shift bugs. */
export function toLocalDateString(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// PROFILE
export function loadUserProfile(): UserProfile {
  const stored = read<Partial<UserProfile>>(KEYS.PROFILE);
  if (!stored) return { ...DEFAULT_PROFILE };
  const parsed: UserProfile = { ...DEFAULT_PROFILE, ...stored };
  parsed.targetWorkoutDurationMins = parsed.targetWorkoutDurationMins || 20;
  parsed.hasResistanceBands = parsed.hasResistanceBands !== false;
  parsed.hasPullUpBar = parsed.hasPullUpBar !== false;
  parsed.weeklyGoal = parsed.weeklyGoal || 4;
  // Only loop bands are supported; restore the defaults' printed ranges.
  const owned = (parsed.ownedBands || []).filter(b => b.type !== 'Tube with Handles' && !b.id.includes('tube'));
  parsed.ownedBands = owned.length
    ? owned.map(b => {
        const def = SLOVIC_LOOP_BANDS.find(d => d.id === b.id);
        return def ? { ...def, ...b, minKg: b.minKg ?? def.minKg, minLbs: b.minLbs ?? def.minLbs } : b;
      })
    : SLOVIC_LOOP_BANDS;
  return parsed;
}

export function saveUserProfile(profile: UserProfile): void {
  write(KEYS.PROFILE, profile);
}

// ROUTINES
export function loadRoutines(): Routine[] {
  const stored = read<Routine[]>(KEYS.ROUTINES);
  if (!stored) return PREBUILT_ROUTINES;
  const prebuiltMap = new Map(PREBUILT_ROUTINES.map(r => [r.id, r]));
  // Prebuilt routines always take their latest definition; custom routines are kept.
  const updated = stored.map(r => prebuiltMap.get(r.id) || r);
  const existing = new Set(updated.map(r => r.id));
  return [...updated, ...PREBUILT_ROUTINES.filter(r => !existing.has(r.id))];
}

export function saveRoutines(routines: Routine[]): void {
  write(KEYS.ROUTINES, routines);
}

// WORKOUT LOGS
export function loadWorkoutLogs(): WorkoutSessionLog[] {
  return read<WorkoutSessionLog[]>(KEYS.WORKOUT_LOGS) || [];
}

export function saveWorkoutLog(log: WorkoutSessionLog): void {
  const existing = loadWorkoutLogs();
  // If log with same id exists, replace it, otherwise prepend
  const exists = existing.some(l => l.id === log.id);
  const updated = exists ? existing.map(l => (l.id === log.id ? log : l)) : [log, ...existing];
  write(KEYS.WORKOUT_LOGS, updated);
  const profile = loadUserProfile();
  profile.lastWorkoutDate = log.date;
  saveUserProfile(profile);
}

export function deleteWorkoutLog(id: string): void {
  const existing = loadWorkoutLogs();
  const filtered = existing.filter(l => l.id !== id);
  write(KEYS.WORKOUT_LOGS, filtered);
  const profile = loadUserProfile();
  profile.lastWorkoutDate = filtered[0]?.date;
  saveUserProfile(profile);
}

// NUTRITION LOGS (kept for backups and a future nutrition tab)
export function getAllNutritionLogs(): Record<string, DailyNutritionLog> {
  return read<Record<string, DailyNutritionLog>>(KEYS.NUTRITION_LOGS) || {};
}

// BACKUP & RESTORE
export function exportAllData(): string {
  let scheduleMode: string | undefined;
  let workdayTier: number | undefined;
  let restExtras: Record<string, number> | undefined;
  try {
    scheduleMode = localStorage.getItem('bandfit_schedule_mode') || undefined;
    const tierRaw = localStorage.getItem('bandfit_workday_tier');
    workdayTier = tierRaw ? Number(tierRaw) : undefined;
    const restRaw = localStorage.getItem('hyten_rest_extra');
    restExtras = restRaw ? JSON.parse(restRaw) : undefined;
  } catch {}

  return JSON.stringify(
    {
      app: 'HyTen',
      schemaVersion: SCHEMA_VERSION,
      exportDate: new Date().toISOString(),
      profile: loadUserProfile(),
      routines: loadRoutines().filter(r => (r as Routine).isCustom),
      workoutLogs: loadWorkoutLogs(),
      nutritionLogs: getAllNutritionLogs(),
      scheduleMode,
      workdayTier,
      restExtras,
    },
    null,
    2
  );
}

export interface ImportResult {
  ok: boolean;
  error?: string;
  workouts?: number;
}

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

/** Check a backup's shape before touching any stored data. */
export function validateBackup(parsed: unknown): string | null {
  if (!isObj(parsed)) return 'This file is not a HyTen backup.';
  if (parsed.profile !== undefined) {
    const p = parsed.profile;
    if (!isObj(p) || typeof p.weightKg !== 'number' || !Array.isArray(p.ownedBands)) return 'The profile in this backup is incomplete.';
  }
  if (parsed.workoutLogs !== undefined) {
    if (!Array.isArray(parsed.workoutLogs)) return 'The workout history in this backup is damaged.';
    const bad = parsed.workoutLogs.find(
      (l: unknown) => !isObj(l) || typeof l.id !== 'string' || typeof l.date !== 'string' || !Array.isArray(l.exercises)
    );
    if (bad) return 'Some workouts in this backup are damaged.';
  }
  if (parsed.routines !== undefined && !Array.isArray(parsed.routines)) return 'The routines in this backup are damaged.';
  if (parsed.profile === undefined && parsed.workoutLogs === undefined) return 'This backup has no profile or workouts.';
  return null;
}

export function importAllData(jsonStr: string): ImportResult {
  let parsed: any;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return { ok: false, error: 'This file is not valid JSON.' };
  }
  const error = validateBackup(parsed);
  if (error) return { ok: false, error };

  // v1 backups stored kg loads in the lbs field for kg users.
  const fromV1 = !parsed.schemaVersion || parsed.schemaVersion < 2;
  const wasKg = (parsed.profile?.unitSystem ?? 'kg') === 'kg';
  const logs: WorkoutSessionLog[] | undefined = parsed.workoutLogs?.map((l: WorkoutSessionLog) =>
    fromV1 && wasKg ? convertLogKgToLbs(l) : l
  );

  if (parsed.profile) write(KEYS.PROFILE, { ...parsed.profile, onboarded: true });
  if (parsed.routines) write(KEYS.ROUTINES, parsed.routines);
  if (logs) write(KEYS.WORKOUT_LOGS, logs);
  if (parsed.nutritionLogs) write(KEYS.NUTRITION_LOGS, parsed.nutritionLogs);
  if (parsed.scheduleMode) {
    try { localStorage.setItem('bandfit_schedule_mode', parsed.scheduleMode); } catch {}
  }
  if (parsed.workdayTier) {
    try { localStorage.setItem('bandfit_workday_tier', String(parsed.workdayTier)); } catch {}
  }
  if (parsed.restExtras) {
    try { localStorage.setItem('hyten_rest_extra', JSON.stringify(parsed.restExtras)); } catch {}
  }
  localStorage.setItem(KEYS.SCHEMA, String(SCHEMA_VERSION));
  return { ok: true, workouts: logs?.length ?? 0 };
}

export function resetAllDataToFresh(): void {
  try {
    [
      KEYS.WORKOUT_LOGS,
      KEYS.NUTRITION_LOGS,
      KEYS.ROUTINES,
      'bandfit_schedule_mode',
      'bandfit_workday_tier',
      'hyten_rest_extra',
    ].forEach(k => localStorage.removeItem(k));
    Object.values(LEGACY_KEYS).forEach(k => localStorage.removeItem(k));
    write(KEYS.PROFILE, { ...DEFAULT_PROFILE, onboarded: true });
    localStorage.setItem(KEYS.SCHEMA, String(SCHEMA_VERSION));
  } catch (e) {
    console.error('Failed to reset data:', e);
  }
}
