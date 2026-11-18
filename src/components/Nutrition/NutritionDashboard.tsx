import React, { useState } from 'react';
import { 
  Flame, Plus, Minus, Droplets, Trash2, Calculator, ArrowRight, Camera, Sparkles, Utensils,
  Calendar, ChevronLeft, ChevronRight, Clock
} from 'lucide-react';
import { DailyNutritionLog, LoggedMealItem, UserProfile, WorkoutSessionLog } from '../../types';
import { getTodayDateString } from '../../utils/storage';
import { AddFoodModal } from './AddFoodModal';
import { CalorieCalculatorModal } from './CalorieCalculatorModal';
import { AIFoodScannerModal } from './AIFoodScannerModal';

interface NutritionDashboardProps {
  currentLog: DailyNutritionLog;
  userProfile: UserProfile;
  todayWorkoutLogs: WorkoutSessionLog[];
  onUpdateDailyLog: (log: DailyNutritionLog) => void;
  onUpdateUserProfile: (profile: UserProfile) => void;
  selectedDate?: string;
  onSelectDate?: (dateStr: string) => void;
}

export const NutritionDashboard: React.FC<NutritionDashboardProps> = ({
  currentLog,
  userProfile,
  todayWorkoutLogs,
  onUpdateDailyLog,
  onUpdateUserProfile,
  selectedDate,
  onSelectDate,
}) => {
  const [selectedMealSlot, setSelectedMealSlot] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showAiScanner, setShowAiScanner] = useState(false);
  const [aiScannerMealType, setAiScannerMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');

  const todayStr = getTodayDateString();
  const activeDate = selectedDate || currentLog.date || todayStr;
  const isViewingToday = activeDate === todayStr;

  const handlePrevDay = () => {
    if (!onSelectDate) return;
    const [y, m, d] = activeDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    const yStr = date.getFullYear();
    const mStr = String(date.getMonth() + 1).padStart(2, '0');
    const dStr = String(date.getDate()).padStart(2, '0');
    onSelectDate(`${yStr}-${mStr}-${dStr}`);
  };

  const handleNextDay = () => {
    if (!onSelectDate) return;
    const [y, m, d] = activeDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    const yStr = date.getFullYear();
    const mStr = String(date.getMonth() + 1).padStart(2, '0');
    const dStr = String(date.getDate()).padStart(2, '0');
    onSelectDate(`${yStr}-${mStr}-${dStr}`);
  };

  const handleJumpToToday = () => {
    if (onSelectDate) onSelectDate(todayStr);
  };

  const [ay, am, ad] = activeDate.split('-').map(Number);
  const activeDateObj = new Date(ay, am - 1, ad);
  const activeDateLabel = activeDateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Workout Calories Burned Today
  const workoutCaloriesBurned = todayWorkoutLogs.reduce((acc, log) => acc + (log.caloriesBurned || 0), 0);

  // Totals from meals
  const totalCaloriesConsumed = currentLog.meals.reduce((acc, m) => acc + m.calories, 0);
  const totalProteinConsumed = currentLog.meals.reduce((acc, m) => acc + m.proteinGrams, 0);
  const totalCarbsConsumed = currentLog.meals.reduce((acc, m) => acc + m.carbsGrams, 0);
  const totalFatConsumed = currentLog.meals.reduce((acc, m) => acc + m.fatGrams, 0);

  const targetCalories = currentLog.targetCalories || userProfile.dailyCalorieTarget || 2150;
  const remainingCalories = targetCalories - totalCaloriesConsumed + workoutCaloriesBurned;

  const proteinTarget = currentLog.targetProteinG || userProfile.dailyProteinTarget || 150;
  const carbsTarget = currentLog.targetCarbsG || userProfile.dailyCarbsTarget || 220;
  const fatTarget = currentLog.targetFatG || userProfile.dailyFatTarget || 60;

  // Hydration metrics
  const waterGoal = currentLog.waterGoalMl || userProfile.dailyWaterGoalMl || 2800;
  const waterPercent = Math.min(100, Math.round((currentLog.waterMl / waterGoal) * 100));
  const waterGlasses = Math.round(currentLog.waterMl / 250);
  const goalGlasses = Math.round(waterGoal / 250);

  const mealSections: { type: 'breakfast' | 'lunch' | 'dinner' | 'snack'; label: string; icon: string }[] = [
    { type: 'breakfast', label: 'Breakfast', icon: '🍳' },
    { type: 'lunch', label: 'Lunch', icon: '🥗' },
    { type: 'dinner', label: 'Dinner', icon: '🥩' },
    { type: 'snack', label: 'Snacks & Supplements', icon: '🍎' },
  ];

  const handleAddMealItem = (item: LoggedMealItem) => {
    const updatedMeals = [...currentLog.meals, item];
    onUpdateDailyLog({
      ...currentLog,
      meals: updatedMeals,
    });
  };

  const handleDeleteMealItem = (itemId: string) => {
    const updatedMeals = currentLog.meals.filter(m => m.id !== itemId);
    onUpdateDailyLog({
      ...currentLog,
      meals: updatedMeals,
    });
  };

  const handleAdjustWater = (deltaMl: number) => {
    const newWater = Math.max(0, currentLog.waterMl + deltaMl);
    onUpdateDailyLog({
      ...currentLog,
      waterMl: newWater,
    });
  };

  const handleApplyCalculatedTargets = (targets: {
    dailyCalorieTarget: number;
    dailyProteinTarget: number;
    dailyCarbsTarget: number;
    dailyFatTarget: number;
    activityLevel: UserProfile['activityLevel'];
    fitnessGoal: UserProfile['fitnessGoal'];
    age: number;
    weightKg: number;
    heightCm: number;
    gender: UserProfile['gender'];
  }) => {
    const updatedProfile: UserProfile = {
      ...userProfile,
      ...targets,
    };
    onUpdateUserProfile(updatedProfile);

    onUpdateDailyLog({
      ...currentLog,
      targetCalories: targets.dailyCalorieTarget,
      targetProteinG: targets.dailyProteinTarget,
      targetCarbsG: targets.dailyCarbsTarget,
      targetFatG: targets.dailyFatTarget,
    });
  };

  return (
    <div className="space-y-5 pb-24 max-w-xl md:max-w-4xl lg:max-w-5xl landscape:max-w-5xl mx-auto animate-fadeIn select-none">
      {/* 1. TOP HEADER & CALCULATOR TRIGGER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-black text-white tracking-tight">
            Calories & Nutrition
          </h2>
          <span className="text-xs text-slate-400 font-semibold capitalize">
            Goal: {userProfile.fitnessGoal.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAiScannerMealType('lunch');
              setShowAiScanner(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#2979FF] to-[#00E5FF] hover:opacity-90 text-xs font-black text-[#12161A] flex items-center gap-1.5 transition-all shadow-md shadow-[#2979FF]/20"
          >
            <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>AI Snap</span>
          </button>

          <button
            onClick={() => setShowCalculator(true)}
            className="px-3 py-1.5 rounded-xl bg-[#1A2026] hover:bg-[#242C35] border border-[#2D3748] text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-all"
          >
            <Calculator className="w-3.5 h-3.5 text-[#2979FF]" />
            <span>TDEE</span>
          </button>
        </div>
      </div>

      {/* Date Switcher Bar */}
      <div className="leap-card p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            className="p-1.5 rounded-lg bg-[#242C35] hover:bg-[#2D3748] text-white transition-all"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#12161A] border border-[#242C35]">
            <Calendar className="w-3.5 h-3.5 text-[#2979FF]" />
            <span className="text-xs font-black text-white">
              {activeDateLabel}
            </span>
            {isViewingToday && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-[#00E676]/20 text-[#00E676]">
                Today
              </span>
            )}
          </div>

          <button
            onClick={handleNextDay}
            className="p-1.5 rounded-lg bg-[#242C35] hover:bg-[#2D3748] text-white transition-all"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {!isViewingToday && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-amber-400 font-bold">
              Viewing Historical Log ({activeDate})
            </span>
            <button
              onClick={handleJumpToToday}
              className="px-2.5 py-1 rounded-lg bg-[#2979FF]/20 hover:bg-[#2979FF]/30 border border-[#2979FF]/40 text-[#2979FF] text-xs font-bold transition-all"
            >
              Back to Today
            </button>
          </div>
        )}
      </div>

      {/* Top Nutrition & Hydration Grid in Landscape */}
      <div className="grid grid-cols-1 md:grid-cols-2 landscape:grid-cols-2 gap-4">
        {/* 2. CALORIE SUMMARY CARD (Leap Fitness Style) */}
        <div className="leap-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  Remaining
                </span>
                <div className="font-heading font-black text-4xl text-white mt-0.5">
                  {remainingCalories.toLocaleString()} <span className="text-lg font-bold text-[#2979FF]">kcal</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Daily Target</span>
                <span className="font-heading font-black text-lg text-slate-300 font-mono">
                  {targetCalories} kcal
                </span>
              </div>
            </div>

            {/* Calculation equation pills */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#12161A] text-xs font-semibold mb-4 border border-[#242C35]">
              <div className="text-center flex-1">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Base Goal</span>
                <span className="font-bold text-white font-mono">{targetCalories}</span>
              </div>
              <span className="text-slate-600 font-bold">-</span>
              <div className="text-center flex-1">
                <span className="text-[10px] text-[#FF6D00] font-bold block uppercase">Food Logged</span>
                <span className="font-bold text-[#FF6D00] font-mono">{totalCaloriesConsumed}</span>
              </div>
              <span className="text-slate-600 font-bold">+</span>
              <div className="text-center flex-1">
                <span className="text-[10px] text-[#2979FF] font-bold block uppercase">Exercise Burn</span>
                <span className="font-bold text-[#2979FF] font-mono">{workoutCaloriesBurned}</span>
              </div>
            </div>
          </div>

          {/* MACRO PROGRESS BARS */}
          <div className="space-y-2.5">
            {/* Protein */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#2979FF]">Protein</span>
                <span className="text-white font-mono">{totalProteinConsumed}g / {proteinTarget}g</span>
              </div>
              <div className="h-2 w-full bg-[#12161A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2979FF] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (totalProteinConsumed / proteinTarget) * 100)}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#FF9100]">Carbs</span>
                <span className="text-white font-mono">{totalCarbsConsumed}g / {carbsTarget}g</span>
              </div>
              <div className="h-2 w-full bg-[#12161A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF9100] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (totalCarbsConsumed / carbsTarget) * 100)}%` }}
                />
              </div>
            </div>

            {/* Fats */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#00E5FF]">Healthy Fats</span>
                <span className="text-white font-mono">{totalFatConsumed}g / {fatTarget}g</span>
              </div>
              <div className="h-2 w-full bg-[#12161A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00E5FF] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (totalFatConsumed / fatTarget) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column in Landscape: Water Tracker + AI Photo Scanner Banner */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* 3. WATER HYDRATION TRACKER */}
          <div className="leap-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00B0FF]/15 text-[#00B0FF] flex items-center justify-center shrink-0 shadow-sm shadow-[#00B0FF]/20">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">Water Intake</span>
                    <span className="text-[10px] font-mono font-bold text-[#00B0FF] px-1.5 py-0.5 rounded bg-[#00B0FF]/15">
                      {waterGlasses} / {goalGlasses} glasses
                    </span>
                  </div>
                  <div className="text-sm font-heading font-black text-[#00B0FF] mt-0.5">
                    {currentLog.waterMl.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ {waterGoal.toLocaleString()} ml</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-heading font-black text-white">{waterPercent}%</span>
                <span className="text-[10px] text-slate-400 block font-semibold">of daily goal</span>
              </div>
            </div>

            {/* Hydration Fill Progress Bar */}
            <div className="w-full bg-[#161D24] h-2 rounded-full overflow-hidden border border-[#242C35]">
              <div 
                className="h-full bg-gradient-to-r from-[#00B0FF] to-[#00E5FF] transition-all duration-300 rounded-full"
                style={{ width: `${waterPercent}%` }}
              />
            </div>

            {/* Symmetrical Uniform -250ml and +250ml Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                onClick={() => handleAdjustWater(-250)}
                disabled={currentLog.waterMl <= 0}
                className="py-2.5 px-3 rounded-xl bg-[#1A2026] hover:bg-[#242C35] disabled:opacity-30 disabled:hover:bg-[#1A2026] border border-[#242C35] text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98"
                title="Subtract 1 glass (250 ml)"
              >
                <Minus className="w-3.5 h-3.5" />
                <span>- 250 ml</span>
              </button>

              <button
                onClick={() => handleAdjustWater(250)}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#00B0FF]/20 to-[#00E5FF]/20 hover:from-[#00B0FF]/30 hover:to-[#00E5FF]/30 border border-[#00B0FF]/40 text-[#00B0FF] hover:text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-[#00B0FF]/20 active:scale-98"
                title="Add 1 glass (250 ml)"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ 250 ml</span>
              </button>
            </div>
          </div>

          {/* 4. DISHES MENU & AI SCANNER BANNER */}
          <div 
            onClick={() => {
              setAiScannerMealType('lunch');
              setShowAiScanner(true);
            }}
            className="p-4 rounded-2xl bg-gradient-to-r from-[#1A2332] via-[#16202A] to-[#12161A] border border-[#2979FF]/40 cursor-pointer hover:border-[#00E5FF]/60 transition-all group shadow-lg flex-1 flex flex-col justify-center"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2979FF] to-[#00E5FF] flex items-center justify-center text-[#12161A] shadow-md shadow-[#2979FF]/30 group-hover:scale-105 transition-transform shrink-0">
                  <Utensils className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-black text-white">Dishes Menu & AI Food Logger</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> 70+ Dishes
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Browse 70+ authentic South Indian & Pan-Indian dishes with verified lab calories & macros, or scan your meal photo.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#2979FF] group-hover:translate-x-1 transition-transform shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. MEAL BREAKDOWN CARDS (2-Column Grid in Landscape) */}
      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">
          Daily Meals
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 landscape:grid-cols-2 gap-3.5">
          {mealSections.map(({ type, label, icon }) => {
            const mealsInSlot = currentLog.meals.filter(m => m.mealType === type);
            const slotCalories = mealsInSlot.reduce((s, m) => s + m.calories, 0);

            return (
              <div key={type} className="leap-card p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#242C35]">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{icon}</span>
                      <span className="text-sm font-bold text-white">{label}</span>
                    </div>
                    <div className="text-sm font-heading font-black text-[#FF6D00]">
                      {slotCalories} <span className="text-[10px] text-slate-400 font-normal">kcal</span>
                    </div>
                  </div>

                  {/* Logged Foods */}
                  <div className="py-2 space-y-1.5">
                    {mealsInSlot.length === 0 ? (
                      <div className="text-[11px] text-slate-500 py-1">No items logged yet</div>
                    ) : (
                      mealsInSlot.map(m => (
                        <div
                          key={m.id}
                          className="p-2 rounded-xl bg-[#12161A] flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-white">{m.name}</div>
                            <div className="text-[10px] text-slate-400">
                              P: {m.proteinGrams}g • C: {m.carbsGrams}g • F: {m.fatGrams}g
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#FF6D00]">{m.calories} kcal</span>
                            <button
                              onClick={() => handleDeleteMealItem(m.id)}
                              className="p-1 text-slate-500 hover:text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedMealSlot(type)}
                  className="w-full py-2 rounded-xl bg-[#242C35] hover:bg-[#2D3748] text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1 transition-all mt-2"
                >
                  <Plus className="w-3.5 h-3.5 text-[#2979FF]" />
                  <span>Add Food</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Food Scanner Modal */}
      {showAiScanner && (
        <AIFoodScannerModal
          initialMealType={aiScannerMealType}
          onAddFood={handleAddMealItem}
          onClose={() => setShowAiScanner(false)}
        />
      )}

      {/* Add Food Modal */}
      {selectedMealSlot && (
        <AddFoodModal
          initialMealType={selectedMealSlot}
          onAddFood={handleAddMealItem}
          onClose={() => setSelectedMealSlot(null)}
        />
      )}

      {/* Calorie Calculator Modal */}
      {showCalculator && (
        <CalorieCalculatorModal
          currentProfile={userProfile}
          onApply={handleApplyCalculatedTargets}
          onClose={() => setShowCalculator(false)}
        />
      )}
    </div>
  );
};
