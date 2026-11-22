export type MuscleGroup = 
  | 'Chest' 
  | 'Back' 
  | 'Shoulders' 
  | 'Biceps' 
  | 'Triceps' 
  | 'Forearms'
  | 'Quads' 
  | 'Hamstrings' 
  | 'Glutes' 
  | 'Calves'
  | 'Core' 
  | 'Full Body';

export type BandType = 'Tube with Handles' | 'Loop Band' | 'Long Loop Band' | 'Figure 8' | 'None';
export type AnchorPosition = 
  | 'Bar'
  | 'Pull-Up Bar' 
  | 'Door High' 
  | 'Door Middle' 
  | 'Door Low' 
  | 'Under Feet' 
  | 'Behind Back' 
  | 'Anchor Post' 
  | 'None';

export type AvatarAnimationType =
  | 'pullup-assisted'
  | 'pullup-strict'
  | 'chinup-assisted'
  | 'hanging-leg-raise'
  | 'bicep-curl'
  | 'tricep-pushdown'
  | 'tricep-overhead'
  | 'chest-press'
  | 'chest-fly'
  | 'pushup'
  | 'squat'
  | 'squat-press'
  | 'lat-pulldown'
  | 'bent-over-row'
  | 'overhead-press'
  | 'lateral-raise'
  | 'face-pull'
  | 'glute-bridge'
  | 'deadlift'
  | 'woodchopper'
  | 'lunge'
  | 'calf-raise'
  | 'reverse-fly'
  | 'glute-kickback'
  | 'pallof-press'
  | 'ab-crunch'
  | 'hanging-knee-raise'
  | 'spine-decompression-hang'
  | 'archer-pushup'
  | 'incline-press'
  | 'single-arm-row'
  | 'front-raise'
  | 'mid-face-pull'
  | 'hammer-curl'
  | 'concentration-curl'
  | 'behind-back-curl'
  | 'reverse-curl'
  | 'reverse-lunge'
  | 'rdl'
  | 'good-morning'
  | 'monster-walk'
  | 'burpee'
  | 'mountain-climbers'
  | 'v-up'
  | 'bicycle-crunch'
  | 'plank-shoulder-tap'
  | 'pike-pushup'
  | 'pushup-downward-dog'
  | 'diamond-pushup'
  | 'superman-pulse'
  | 'jump-squat'
  | 'sumo-squat'
  | 'dead-hang'
  | 'chinup-strict'
  | 'archer-pushup-bodyweight'
  | 'pushup-standard'
  | 'air-squat'
  | 'reverse-lunge-bodyweight'
  | 'calf-raise-bodyweight'
  | 'glute-bridge-bodyweight';

export interface ResistanceBand {
  id: string;
  name: string;
  colorHex: string;
  weightLbs: number;
  weightKg: number;
  type: BandType;
  isActive: boolean;
  /** Lower end of the manufacturer's printed range (bands are rated as a range). */
  minKg?: number;
  minLbs?: number;
  brand?: 'Slovic' | 'Standard' | 'Custom';
}

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  bandType: BandType;
  anchorPosition: AnchorPosition;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  instructions: string[];
  formCues: string[];
  tips: string;
  estimatedCaloriesPerMin: number;
  iconType?: string;
  avatarAnimation?: AvatarAnimationType;
  youtubeUrl?: string;
  requiresBand?: boolean;
  requiresBar?: boolean;
  sourceVideo?: {
    title: string;
    channel: string;
    youtubeUrl: string;
  };
  /** Target is held for seconds (targetReps is read as seconds). */
  isTimed?: boolean;
  /** The band reduces load (assisted pull-ups/dips): a lighter band is progress. */
  isAssisted?: boolean;
  /** Multi-joint lift that gets longer rest between rounds. */
  isCompound?: boolean;
  commonMistakes?: string[];
  /** Default tempo, lower-pause-lift seconds (e.g. "3-1-1"); "X" = explosive. */
  tempo?: string;
  /** Calisthenics progression ladder neighbours. */
  easierId?: string;
  harderId?: string;
}

export interface RoutineExercise {
  exerciseId: string;
  sets: number;
  targetReps: number;
  targetRestSeconds: number;
  notes?: string;
  /** Lower-pause-lift seconds, e.g. "3-1-1". "X" = explosive. Overrides the exercise default. */
  tempo?: string;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  category?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDurationMins: number;
  targetMuscles?: MuscleGroup[];
  exercises: RoutineExercise[];
  isCustom?: boolean;
}

export interface LoggedSet {
  setNumber: number;
  reps: number;
  bandIds: string[]; // Supports stacked bands
  /** Always stored in lbs (canonical), whatever the display unit. Band load only, never assistance. */
  totalResistanceLbs: number;
  /** Band assistance in lbs for assisted exercises (not counted as volume). */
  assistanceLbs?: number;
  completed: boolean;
  rpe?: number; // 1-10 (legacy)
  /** Reps left in the tank after the set: 0 = failure, 2 = one or two left, 3 = three or more. */
  rir?: 0 | 2 | 3;
  /** Seconds held, for timed exercises. */
  seconds?: number;
}

export interface LoggedExercise {
  exerciseId: string;
  exerciseName?: string;
  sets: LoggedSet[];
}

export interface WorkoutSessionLog {
  id: string;
  routineId?: string;
  routineName: string;
  date: string; // ISO date string
  durationSeconds: number;
  caloriesBurned: number;
  exercises: LoggedExercise[];
  totalVolumeLbs: number;
  notes?: string;
  /** True when the user ended the workout early and saved what they did. */
  partial?: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  servingSize: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  category: 'High Protein' | 'Protein' | 'Carbs & Grains' | 'Carbs' | 'Healthy Fats' | 'Fats' | 'Fruits & Veggies' | 'Snacks & Drinks' | 'Snacks' | 'Meals' | 'South Indian' | 'Pan-Indian' | string;
}

export interface LoggedMealItem {
  id: string;
  foodId?: string;
  name: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  quantity: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
}

export interface DailyNutritionLog {
  date: string; // YYYY-MM-DD
  meals: LoggedMealItem[];
  waterMl: number;
  waterGoalMl: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
}

export interface UserProfile {
  name: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  weightKg: number;
  heightCm: number;
  unitSystem: 'lbs' | 'kg';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
  fitnessGoal: 'fat_loss' | 'maintenance' | 'muscle_gain';
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbsTarget: number;
  dailyFatTarget: number;
  dailyWaterGoalMl: number;
  ownedBands: ResistanceBand[];
  streakDays: number;
  lastWorkoutDate?: string;
  hasResistanceBands?: boolean;
  hasPullUpBar?: boolean;
  targetWorkoutDurationMins?: number; // default: 20 mins
  /** Planned training sessions per week; the streak counts weeks that hit it. */
  weeklyGoal?: number;
  experience?: 'beginner' | 'intermediate' | 'advanced';
  /** First-run setup completed. */
  onboarded?: boolean;
}
