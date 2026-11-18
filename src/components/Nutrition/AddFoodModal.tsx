import React, { useState } from 'react';
import { X, Search, Plus, Check, Camera, Sparkles } from 'lucide-react';
import { FoodItem, LoggedMealItem } from '../../types';
import { COMMON_FOODS } from '../../data/commonFoods';
import { AIFoodScannerModal } from './AIFoodScannerModal';

interface AddFoodModalProps {
  initialMealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  onAddFood: (meal: LoggedMealItem) => void;
  onClose: () => void;
}

export const AddFoodModal: React.FC<AddFoodModalProps> = ({
  initialMealType,
  onAddFood,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'custom'>('search');
  const [showAiScanner, setShowAiScanner] = useState<boolean>(false);
  const [mealType, setMealType] = useState<LoggedMealItem['mealType']>(initialMealType);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState<string>('');
  const [customProtein, setCustomProtein] = useState<string>('');
  const [customCarbs, setCustomCarbs] = useState<string>('');
  const [customFat, setCustomFat] = useState<string>('');

  const categories = ['All', 'High Protein', 'South Indian', 'Pan-Indian', 'Snacks & Drinks', 'Carbs & Grains', 'Fruits & Veggies', 'Healthy Fats'];

  const filteredFoods = COMMON_FOODS.filter(food => {
    const q = searchQuery.toLowerCase().trim();
    const words = q.split(/\s+/).filter(Boolean);
    const matchesSearch = words.length === 0 || words.every(w =>
      food.name.toLowerCase().includes(w) || food.category.toLowerCase().includes(w)
    );
    const matchesCat = selectedCategory === 'All' || food.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleAddPrebuiltFood = () => {
    if (!selectedFood) return;
    const item: LoggedMealItem = {
      id: 'meal-' + Date.now(),
      foodId: selectedFood.id,
      name: `${selectedFood.name} (${quantity}x)`,
      calories: Math.round(selectedFood.calories * quantity),
      proteinGrams: Math.round(selectedFood.proteinGrams * quantity),
      carbsGrams: Math.round(selectedFood.carbsGrams * quantity),
      fatGrams: Math.round(selectedFood.fatGrams * quantity),
      quantity,
      mealType,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onAddFood(item);
    onClose();
  };

  const handleAddCustomFood = () => {
    if (!customName.trim()) {
      alert('Please enter a food name');
      return;
    }
    const calories = parseInt(customCalories) || 0;
    if (calories <= 0) {
      alert('Please enter calories');
      return;
    }

    const item: LoggedMealItem = {
      id: 'meal-' + Date.now(),
      name: customName.trim(),
      calories,
      proteinGrams: parseFloat(customProtein) || 0,
      carbsGrams: parseFloat(customCarbs) || 0,
      fatGrams: parseFloat(customFat) || 0,
      quantity: 1,
      mealType,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onAddFood(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md landscape:max-w-xl bg-[#12161A] border border-[#242C35] rounded-3xl p-5 landscape:p-4 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[#242C35]">
          <div>
            <h3 className="text-base font-bold text-white">Log Food</h3>
            <div className="flex gap-1 mt-1">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setMealType(type)}
                  className={`text-[10px] font-bold capitalize px-2 py-0.5 rounded-full ${
                    mealType === type
                      ? 'bg-[#2979FF] text-white'
                      : 'bg-[#1A2026] text-slate-500 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-3 gap-1.5 mt-3 p-1 bg-[#1A2026] rounded-xl">
          <button
            onClick={() => setActiveTab('search')}
            className={`py-1.5 rounded-lg text-xs font-bold ${
              activeTab === 'search' ? 'bg-[#2979FF] text-white' : 'text-slate-400'
            }`}
          >
            Database
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`py-1.5 rounded-lg text-xs font-bold ${
              activeTab === 'custom' ? 'bg-[#2979FF] text-white' : 'text-slate-400'
            }`}
          >
            Custom
          </button>
          <button
            onClick={() => setShowAiScanner(true)}
            className="py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-[#2979FF]/20 to-[#00E5FF]/20 text-[#00E5FF] hover:from-[#2979FF]/30 hover:to-[#00E5FF]/30 border border-[#00E5FF]/30 flex items-center justify-center gap-1 transition-all"
          >
            <Camera className="w-3 h-3 stroke-[2.5]" />
            <span>AI Snap</span>
          </button>
        </div>

        {activeTab === 'search' ? (
          <div className="py-3 space-y-2 flex-1 flex flex-col overflow-hidden">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food item..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1A2026] border border-[#242C35] text-white text-xs font-semibold focus:border-[#2979FF] outline-none"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1 shrink-0">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${
                    selectedCategory === c ? 'bg-[#2979FF] text-white' : 'bg-[#1A2026] text-slate-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredFoods.map(food => (
                <div
                  key={food.id}
                  onClick={() => setSelectedFood(food)}
                  className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-all ${
                    selectedFood?.id === food.id
                      ? 'bg-[#242C35] border-[#2979FF] text-white'
                      : 'bg-[#1A2026] border-[#242C35] text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-bold text-white">{food.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {food.servingSize} • P: {food.proteinGrams}g | C: {food.carbsGrams}g | F: {food.fatGrams}g
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[#FF6D00]">{food.calories} kcal</span>
                </div>
              ))}
            </div>

            {selectedFood && (
              <div className="pt-2 border-t border-[#242C35] flex items-center justify-between gap-2 shrink-0">
                <div className="text-xs">
                  <span className="font-bold text-white block">{selectedFood.name}</span>
                  <span className="text-[10px] text-[#FF6D00] font-mono">
                    Total: {Math.round(selectedFood.calories * quantity)} kcal
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(0.5, parseFloat(e.target.value) || 1))}
                    className="w-12 bg-[#1A2026] border border-[#2D3748] rounded px-1 text-center text-xs font-bold text-white"
                  />
                  <button
                    onClick={handleAddPrebuiltFood}
                    className="px-3 py-1.5 rounded-xl bg-[#2979FF] text-white font-bold text-xs"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-3 space-y-3 flex-1 overflow-y-auto text-xs">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Food Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Scrambled Eggs & Toast"
                className="w-full px-3 py-2 rounded-xl bg-[#1A2026] border border-[#242C35] text-white font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Calories (kcal)</label>
                <input
                  type="number"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(e.target.value)}
                  placeholder="350"
                  className="w-full px-3 py-2 rounded-xl bg-[#1A2026] border border-[#242C35] text-white font-bold font-mono text-[#FF6D00]"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-[#2979FF] block mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(e.target.value)}
                  placeholder="25"
                  className="w-full px-3 py-2 rounded-xl bg-[#1A2026] border border-[#242C35] text-white font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase font-bold text-[#FF9100] block mb-1">Carbs (g)</label>
                <input
                  type="number"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(e.target.value)}
                  placeholder="30"
                  className="w-full px-3 py-2 rounded-xl bg-[#1A2026] border border-[#242C35] text-white font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-[#00E5FF] block mb-1">Fat (g)</label>
                <input
                  type="number"
                  value={customFat}
                  onChange={(e) => setCustomFat(e.target.value)}
                  placeholder="10"
                  className="w-full px-3 py-2 rounded-xl bg-[#1A2026] border border-[#242C35] text-white font-bold"
                />
              </div>
            </div>

            <button
              onClick={handleAddCustomFood}
              className="w-full py-3 rounded-2xl bg-[#2979FF] text-white font-bold text-xs shadow-md shadow-[#2979FF]/30 mt-2"
            >
              Log Food
            </button>
          </div>
        )}
      </div>

      {showAiScanner && (
        <AIFoodScannerModal
          initialMealType={mealType}
          onAddFood={(meal) => {
            onAddFood(meal);
            setShowAiScanner(false);
            onClose();
          }}
          onClose={() => setShowAiScanner(false)}
        />
      )}
    </div>
  );
};
