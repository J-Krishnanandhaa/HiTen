import React, { useState } from 'react';
import { X, Calculator, Check } from 'lucide-react';
import { UserProfile } from '../../types';
import { calculateBMR, calculateTDEE, calculateMacroTargets } from '../../utils/nutritionMath';

interface CalorieCalculatorModalProps {
  currentProfile: UserProfile;
  onApply: (newTargets: {
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
  }) => void;
  onClose: () => void;
}

export const CalorieCalculatorModal: React.FC<CalorieCalculatorModalProps> = ({
  currentProfile,
  onApply,
  onClose,
}) => {
  const [gender, setGender] = useState<UserProfile['gender']>(currentProfile.gender || 'male');
  const [age, setAge] = useState(currentProfile.age || 28);
  const [weightKg, setWeightKg] = useState(currentProfile.weightKg || 75);
  const [heightCm, setHeightCm] = useState(currentProfile.heightCm || 178);
  const [activityLevel, setActivityLevel] = useState<UserProfile['activityLevel']>(currentProfile.activityLevel || 'moderate');
  const [fitnessGoal, setFitnessGoal] = useState<UserProfile['fitnessGoal']>(currentProfile.fitnessGoal || 'fat_loss');

  const bmr = calculateBMR({ gender, age, weightKg, heightCm });
  const tdee = calculateTDEE({ gender, age, weightKg, heightCm, activityLevel });
  const macros = calculateMacroTargets(tdee, weightKg, fitnessGoal);

  const handleApply = () => {
    onApply({
      dailyCalorieTarget: macros.calories,
      dailyProteinTarget: macros.proteinG,
      dailyCarbsTarget: macros.carbsG,
      dailyFatTarget: macros.fatG,
      activityLevel,
      fitnessGoal,
      age,
      weightKg,
      heightCm,
      gender,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#12161A] border border-[#242C35] rounded-3xl p-5 shadow-2xl max-h-[90vh] flex flex-col text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#242C35]">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#2979FF]" />
            <h3 className="text-base font-bold text-white">TDEE & Macro Calculator</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-3 space-y-3 overflow-y-auto flex-1 pr-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Gender</label>
              <div className="grid grid-cols-2 gap-1 bg-[#1A2026] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-1 rounded-lg font-bold ${gender === 'male' ? 'bg-[#2979FF] text-white' : 'text-slate-400'}`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-1 rounded-lg font-bold ${gender === 'female' ? 'bg-[#2979FF] text-white' : 'text-slate-400'}`}
                >
                  Female
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Math.max(14, parseInt(e.target.value) || 25))}
                className="w-full px-3 py-1.5 bg-[#1A2026] border border-[#242C35] rounded-xl text-white font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Weight (kg)</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(Math.max(30, parseFloat(e.target.value) || 70))}
                className="w-full px-3 py-1.5 bg-[#1A2026] border border-[#242C35] rounded-xl text-white font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Height (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Math.max(100, parseInt(e.target.value) || 170))}
                className="w-full px-3 py-1.5 bg-[#1A2026] border border-[#242C35] rounded-xl text-white font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Activity Level</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as UserProfile['activityLevel'])}
              className="w-full px-2.5 py-1.5 bg-[#1A2026] border border-[#242C35] rounded-xl text-white font-semibold"
            >
              <option value="sedentary">Sedentary (Desk job)</option>
              <option value="light">Light (1-3 days/week)</option>
              <option value="moderate">Moderate (3-5 days/week)</option>
              <option value="very_active">Very Active (6-7 days/week)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Goal</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setFitnessGoal('fat_loss')}
                className={`p-2 rounded-xl border text-center ${
                  fitnessGoal === 'fat_loss' ? 'bg-[#FF6D00]/15 border-[#FF6D00] text-[#FF6D00] font-bold' : 'bg-[#1A2026] border-[#242C35] text-slate-400'
                }`}
              >
                Fat Loss
              </button>
              <button
                type="button"
                onClick={() => setFitnessGoal('maintenance')}
                className={`p-2 rounded-xl border text-center ${
                  fitnessGoal === 'maintenance' ? 'bg-[#00E676]/15 border-[#00E676] text-[#00E676] font-bold' : 'bg-[#1A2026] border-[#242C35] text-slate-400'
                }`}
              >
                Maintain
              </button>
              <button
                type="button"
                onClick={() => setFitnessGoal('muscle_gain')}
                className={`p-2 rounded-xl border text-center ${
                  fitnessGoal === 'muscle_gain' ? 'bg-[#2979FF]/15 border-[#2979FF] text-[#2979FF] font-bold' : 'bg-[#1A2026] border-[#242C35] text-slate-400'
                }`}
              >
                Lean Bulk
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#1A2026] border border-[#2D3748]">
            <div className="text-[10px] uppercase font-bold text-slate-400">Target Budget</div>
            <div className="text-2xl font-heading font-black text-white font-mono">
              {macros.calories} <span className="text-xs text-[#2979FF] font-normal">kcal/day</span>
            </div>
            <div className="flex gap-2 mt-2 pt-2 border-t border-[#242C35] text-center text-[11px]">
              <div className="flex-1">
                <span className="text-[#2979FF] font-bold block">Protein</span>
                <span className="text-white font-bold">{macros.proteinG}g</span>
              </div>
              <div className="flex-1">
                <span className="text-[#FF9100] font-bold block">Carbs</span>
                <span className="text-white font-bold">{macros.carbsG}g</span>
              </div>
              <div className="flex-1">
                <span className="text-[#00E5FF] font-bold block">Fat</span>
                <span className="text-white font-bold">{macros.fatG}g</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[#242C35] flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 text-slate-400 font-bold">
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2 rounded-xl bg-[#2979FF] text-white font-bold shadow-md shadow-[#2979FF]/30 flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Targets</span>
          </button>
        </div>
      </div>
    </div>
  );
};
