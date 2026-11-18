import React, { useState, useRef } from 'react';
import { 
  Camera, Upload, Sparkles, X, Check, AlertCircle, RefreshCw, 
  Flame, ShieldCheck, ChevronDown, ChevronUp, Key, ArrowRight, Sliders,
  Utensils, Search, Plus, Minus
} from 'lucide-react';
import { LoggedMealItem, FoodItem } from '../../types';
import { COMMON_FOODS } from '../../data/commonFoods';
import { 
  FoodVisionAnalysisResult, 
  SAMPLE_TEST_MEALS, 
  analyzeFoodImageLocally, 
  analyzeFoodWithGemini 
} from '../../utils/aiFoodVision';

interface AIFoodScannerModalProps {
  initialMealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  onAddFood: (meal: LoggedMealItem) => void;
  onClose: () => void;
  savedApiKey?: string;
  onSaveApiKey?: (key: string) => void;
}

export const AIFoodScannerModal: React.FC<AIFoodScannerModalProps> = ({
  initialMealType = 'lunch',
  onAddFood,
  onClose,
  savedApiKey = '',
  onSaveApiKey,
}) => {
  const [activeTab, setActiveTab] = useState<'dishes' | 'camera'>('dishes');
  const [mealType, setMealType] = useState<LoggedMealItem['mealType']>(initialMealType);
  
  // Dishes Menu state
  const [dishSearch, setDishSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDish, setSelectedDish] = useState<FoodItem | null>(() => COMMON_FOODS[0] || null);
  const [dishQuantity, setDishQuantity] = useState<number>(1);

  // Photo & AI state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<FoodVisionAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Gemini API Key config
  const [apiKey, setApiKey] = useState<string>(() => {
    return savedApiKey || localStorage.getItem('gemini_vision_api_key') || '';
  });
  const [showApiConfig, setShowApiConfig] = useState<boolean>(false);
  const [showAccuracyDetails, setShowAccuracyDetails] = useState<boolean>(false);

  // Portion multiplier for user fine-tuning in camera mode
  const [portionScale, setPortionScale] = useState<number>(1.0);
  const [sampleCategory, setSampleCategory] = useState<'all' | 'south-indian' | 'pan-indian' | 'fitness-plates'>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_vision_api_key', key);
    if (onSaveApiKey) onSaveApiKey(key);
  };

  // Filtered dishes for menu
  const dishCategories = ['All', 'High Protein', 'South Indian', 'Pan-Indian', 'Snacks & Drinks', 'Carbs & Grains', 'Fruits & Veggies', 'Healthy Fats'];
  const filteredDishes = COMMON_FOODS.filter(food => {
    const q = dishSearch.toLowerCase().trim();
    const words = q.split(/\s+/).filter(Boolean);
    const matchesSearch = words.length === 0 || words.every(w =>
      food.name.toLowerCase().includes(w) || food.category.toLowerCase().includes(w)
    );
    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Run AI food analysis
  const processImage = async (dataUrl: string, sampleId?: string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setPortionScale(1.0);

    try {
      let result: FoodVisionAnalysisResult;
      if (apiKey && apiKey.trim().length > 15 && !sampleId) {
        result = await analyzeFoodWithGemini(dataUrl, apiKey.trim());
      } else {
        result = await analyzeFoodImageLocally(sampleId || dataUrl);
      }
      setAnalysisResult(result);
    } catch (err: any) {
      console.error('AI Food analysis error:', err);
      setAnalysisError(err.message || 'Failed to analyze food image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      processImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: typeof SAMPLE_TEST_MEALS[0]) => {
    setImagePreview(sample.imageUrl);
    processImage(sample.imageUrl, sample.id);
  };

  // Scaled calculations based on user portion adjustment
  const scaledCalories = analysisResult ? Math.round(analysisResult.totalCalories * portionScale) : 0;
  const scaledProtein = analysisResult ? Math.round(analysisResult.totalProteinG * portionScale) : 0;
  const scaledCarbs = analysisResult ? Math.round(analysisResult.totalCarbsG * portionScale) : 0;
  const scaledFat = analysisResult ? Math.round(analysisResult.totalFatG * portionScale) : 0;
  const scaledWeight = analysisResult ? Math.round(analysisResult.estimatedTotalWeightG * portionScale) : 0;

  // Log meal from AI scan
  const handleLogAiMeal = () => {
    if (!analysisResult || analysisResult.isFood === false) return;

    const item: LoggedMealItem = {
      id: 'meal-ai-' + Date.now(),
      name: `${analysisResult.dishTitle} ${portionScale !== 1 ? `(${Math.round(portionScale * 100)}% portion)` : ''}`.trim(),
      calories: scaledCalories,
      proteinGrams: scaledProtein,
      carbsGrams: scaledCarbs,
      fatGrams: scaledFat,
      quantity: 1,
      mealType,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onAddFood(item);
    onClose();
  };

  // Log meal from Verified Dishes Menu
  const handleLogDish = () => {
    if (!selectedDish) return;

    const item: LoggedMealItem = {
      id: 'meal-dish-' + Date.now(),
      foodId: selectedDish.id,
      name: `${selectedDish.name} (${dishQuantity}x)`,
      calories: Math.round(selectedDish.calories * dishQuantity),
      proteinGrams: Math.round(selectedDish.proteinGrams * dishQuantity),
      carbsGrams: Math.round(selectedDish.carbsGrams * dishQuantity),
      fatGrams: Math.round(selectedDish.fatGrams * dishQuantity),
      quantity: dishQuantity,
      mealType,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onAddFood(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-lg landscape:max-w-4xl bg-[#12161A] border border-[#242C35] rounded-3xl p-5 landscape:p-4 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#242C35] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2979FF] to-[#00E5FF] flex items-center justify-center shadow-md shadow-[#2979FF]/30">
              <Utensils className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-heading font-black text-white flex items-center gap-1.5">
                <span>Food Logger & Verified Dishes Menu</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Choose from 70+ authentic South Indian & Pan-Indian dishes with verified metrics, or scan food photos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#1A2026] text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Mode: Verified Dishes Menu vs AI Photo Scanner */}
        <div className="grid grid-cols-2 gap-2 mt-3 p-1 rounded-2xl bg-[#161D24] border border-[#242C35] shrink-0">
          <button
            onClick={() => setActiveTab('dishes')}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'dishes'
                ? 'bg-[#2979FF] text-white shadow-md shadow-[#2979FF]/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Verified Dishes Menu ({COMMON_FOODS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('camera')}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'camera'
                ? 'bg-gradient-to-r from-[#2979FF] to-[#00E5FF] text-white shadow-md shadow-[#00E5FF]/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>AI Photo Scanner</span>
          </button>
        </div>

        {/* ============================================================= */}
        {/* TAB 1: VERIFIED DISHES MENU (Direct 1-Tap Selection & Metrics) */}
        {/* ============================================================= */}
        {activeTab === 'dishes' ? (
          <div className="py-3 flex-1 flex flex-col landscape:grid landscape:grid-cols-12 landscape:gap-4 overflow-hidden">
            
            {/* Left Column: Search & Filterable Dishes List (5 cols in Landscape) */}
            <div className="landscape:col-span-6 flex flex-col space-y-2.5 overflow-hidden flex-1">
              
              {/* Search Bar */}
              <div className="relative shrink-0">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={dishSearch}
                  onChange={(e) => setDishSearch(e.target.value)}
                  placeholder="Search Dosa, Idli, Paneer, Chicken, Biryani, Roti..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1A2026] border border-[#242C35] text-white text-xs font-semibold focus:border-[#2979FF] outline-none"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
                {dishCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#2979FF] text-white shadow-sm shadow-[#2979FF]/30'
                        : 'bg-[#1A2026] text-slate-400 hover:text-white border border-[#242C35]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Scrollable Dish List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[50vh] landscape:max-h-[64vh]">
                {filteredDishes.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No dishes found matching "{dishSearch}". Try another name.
                  </div>
                ) : (
                  filteredDishes.map(dish => {
                    const isSelected = selectedDish?.id === dish.id;
                    return (
                      <div
                        key={dish.id}
                        onClick={() => setSelectedDish(dish)}
                        className={`p-2.5 rounded-2xl border cursor-pointer flex items-center justify-between text-xs transition-all group ${
                          isSelected
                            ? 'bg-[#1A2332] border-[#2979FF] text-white shadow-md'
                            : 'bg-[#161B22] border-[#242C35] text-slate-300 hover:bg-[#1A2026] hover:border-slate-600'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-[#242C35] text-slate-400 truncate">
                              {dish.category}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate">
                              {dish.servingSize}
                            </span>
                          </div>
                          <div className="font-bold text-white text-xs truncate mt-0.5 group-hover:text-[#2979FF] transition-colors">
                            {dish.name}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="text-[#00E5FF] font-bold">{dish.proteinGrams}g P</span>
                            <span>•</span>
                            <span className="text-[#FF9100]">{dish.carbsGrams}g C</span>
                            <span>•</span>
                            <span className="text-[#FF5252]">{dish.fatGrams}g F</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-black text-sm text-[#FF6D00] block">
                            {dish.calories}
                          </span>
                          <span className="text-[9px] text-slate-500 uppercase font-bold">kcal</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Selected Dish Nutrients & 1-Tap Log (6 cols in Landscape) */}
            <div className="landscape:col-span-6 flex flex-col justify-between pt-3 landscape:pt-0 border-t landscape:border-t-0 landscape:border-l border-[#242C35] landscape:pl-4 overflow-y-auto">
              {selectedDish ? (
                <div className="space-y-3.5">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#2979FF] tracking-wider px-2 py-0.5 rounded bg-[#2979FF]/15">
                      Selected Dish
                    </span>
                    <h4 className="text-lg font-heading font-black text-white mt-1 leading-snug">
                      {selectedDish.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Standard serving: <span className="text-white font-semibold">{selectedDish.servingSize}</span>
                    </p>
                  </div>

                  {/* Macro Cards Preview for Selected Dish */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2.5 rounded-2xl bg-[#1A2026] border border-[#242C35]">
                      <span className="text-[9px] font-black uppercase text-[#FF6D00] block">Calories</span>
                      <span className="text-base font-black text-white">
                        {Math.round(selectedDish.calories * dishQuantity)}
                      </span>
                      <span className="text-[9px] text-slate-500 block">kcal</span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-[#1A2026] border border-[#242C35]">
                      <span className="text-[9px] font-black uppercase text-[#00E5FF] block">Protein</span>
                      <span className="text-base font-black text-white">
                        {Math.round(selectedDish.proteinGrams * dishQuantity * 10) / 10}g
                      </span>
                      <span className="text-[9px] text-slate-500 block">protein</span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-[#1A2026] border border-[#242C35]">
                      <span className="text-[9px] font-black uppercase text-[#FF9100] block">Carbs</span>
                      <span className="text-base font-black text-white">
                        {Math.round(selectedDish.carbsGrams * dishQuantity * 10) / 10}g
                      </span>
                      <span className="text-[9px] text-slate-500 block">carbs</span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-[#1A2026] border border-[#242C35]">
                      <span className="text-[9px] font-black uppercase text-[#FF5252] block">Fats</span>
                      <span className="text-base font-black text-white">
                        {Math.round(selectedDish.fatGrams * dishQuantity * 10) / 10}g
                      </span>
                      <span className="text-[9px] text-slate-500 block">fat</span>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="p-3 rounded-2xl bg-[#1A2026] border border-[#242C35] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Serving Quantity</span>
                      <span className="text-[10px] text-slate-400">
                        {dishQuantity} × standard portion ({selectedDish.servingSize})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDishQuantity(prev => Math.max(0.5, prev - 0.5))}
                        className="w-8 h-8 rounded-xl bg-[#242C35] hover:bg-[#2D3748] text-white font-bold flex items-center justify-center transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono font-black text-base text-white px-2">
                        {dishQuantity}x
                      </span>
                      <button
                        onClick={() => setDishQuantity(prev => prev + 0.5)}
                        className="w-8 h-8 rounded-xl bg-[#242C35] hover:bg-[#2D3748] text-white font-bold flex items-center justify-center transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Meal Slot Picker (Breakfast, Lunch, Dinner, Snack) */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                      Log To Meal Slot:
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setMealType(slot)}
                          className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                            mealType === slot
                              ? 'bg-[#2979FF] text-white shadow-md shadow-[#2979FF]/30'
                              : 'bg-[#1A2026] text-slate-400 hover:text-white border border-[#242C35]'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 1-Tap Log Meal Button */}
                  <button
                    onClick={handleLogDish}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#2979FF] to-[#00E5FF] hover:from-[#1C64F2] hover:to-[#00B0FF] text-white font-black text-sm shadow-xl shadow-[#2979FF]/40 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <Check className="w-5 h-5 stroke-[2.5]" />
                    <span>LOG DISH ({Math.round(selectedDish.calories * dishQuantity)} KCAL)</span>
                  </button>

                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 my-auto">
                  Select any dish on the left to view metrics and log into your meal.
                </div>
              )}
            </div>

          </div>
        ) : (
          /* ============================================================= */
          /* TAB 2: AI PHOTO SCANNER (WITH STRICT FOOD VALIDATION)         */
          /* ============================================================= */
          <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">

            {!imagePreview ? (
              <div className="space-y-4 landscape:space-y-0 landscape:grid landscape:grid-cols-12 landscape:gap-4">
                
                {/* Left Column: Camera / Upload / Cloud API config */}
                <div className="space-y-3 landscape:col-span-5 flex flex-col">
                  <div className="grid grid-cols-2 landscape:grid-cols-1 gap-2.5">
                    {/* Device Camera Input */}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      ref={cameraInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="py-5 px-3 rounded-2xl bg-gradient-to-br from-[#1A2026] to-[#161D24] border border-[#2979FF]/40 hover:border-[#2979FF] text-white flex flex-row items-center justify-center gap-3 group transition-all shadow-lg active:scale-98"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#2979FF]/15 text-[#2979FF] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-black text-white">Click Meal Photo</div>
                        <div className="text-[10px] text-slate-400">Device Camera</div>
                      </div>
                    </button>

                    {/* Upload from Gallery */}
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="py-5 px-3 rounded-2xl bg-gradient-to-br from-[#1A2026] to-[#161D24] border border-[#242C35] hover:border-slate-500 text-white flex flex-row items-center justify-center gap-3 group transition-all shadow-lg active:scale-98"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#242C35] text-slate-300 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-black text-white">Upload from Gallery</div>
                        <div className="text-[10px] text-slate-400">JPEG, PNG, WebP</div>
                      </div>
                    </button>
                  </div>

                  {/* Optional Gemini Live API Toggle */}
                  <div className="pt-2 border-t border-[#242C35]">
                    <button
                      onClick={() => setShowApiConfig(!showApiConfig)}
                      className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-white font-bold"
                    >
                      <span className="flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-[#2979FF]" />
                        <span>Gemini Vision API Key (Optional)</span>
                      </span>
                      {showApiConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showApiConfig && (
                      <div className="mt-2.5 p-3 rounded-2xl bg-[#161B22] border border-[#242C35] space-y-2 text-xs animate-fadeIn">
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Enter your free Gemini API Key from Google AI Studio for live multimodal vision on custom meal photos.
                        </p>
                        <input
                          type="password"
                          value={apiKey}
                          onChange={(e) => handleSaveKey(e.target.value)}
                          placeholder="AIzaSy..."
                          className="w-full px-3 py-2 rounded-xl bg-[#12161A] border border-[#2D3748] text-white text-xs font-mono focus:outline-none focus:border-[#2979FF]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: INSTANT ACCURACY TEST BENCHMARKS */}
                <div className="landscape:col-span-7 flex flex-col min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                      Instant Accuracy Test Meals
                    </span>
                    <span className="text-[10px] text-[#2979FF] font-bold">
                      {SAMPLE_TEST_MEALS.length} Authentic Benchmark Dishes
                    </span>
                  </div>

                  {/* Regional Category Filter Pills */}
                  <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
                    {[
                      { id: 'all', label: 'All Dishes', count: SAMPLE_TEST_MEALS.length },
                      { id: 'south-indian', label: '🌴 South Indian', count: SAMPLE_TEST_MEALS.filter(s => s.category === 'south-indian').length },
                      { id: 'pan-indian', label: '🍛 Pan-Indian', count: SAMPLE_TEST_MEALS.filter(s => s.category === 'pan-indian').length },
                      { id: 'fitness-plates', label: '🥗 Fitness Plates', count: SAMPLE_TEST_MEALS.filter(s => s.category === 'fitness-plates').length },
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSampleCategory(cat.id as any)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                          sampleCategory === cat.id
                            ? 'bg-[#2979FF] text-white shadow-sm shadow-[#2979FF]/30'
                            : 'bg-[#1A2026] text-slate-400 hover:text-white border border-[#242C35]'
                        }`}
                      >
                        {cat.label} ({cat.count})
                      </button>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 landscape:max-h-72 overflow-y-auto pr-1">
                    {SAMPLE_TEST_MEALS.filter(s => sampleCategory === 'all' || s.category === sampleCategory).map(sample => (
                      <div
                        key={sample.id}
                        onClick={() => handleSelectSample(sample)}
                        className="p-2.5 rounded-2xl bg-[#1A2026] hover:bg-[#1E252D] border border-[#242C35] hover:border-[#2979FF]/50 cursor-pointer flex items-center gap-2.5 transition-all group"
                      >
                        <img
                          src={sample.imageUrl}
                          alt={sample.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#242C35]"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] px-1 py-0.2 rounded font-bold uppercase bg-[#242C35] text-slate-400 truncate">
                              {sample.regionBadge}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-white truncate group-hover:text-[#2979FF] transition-colors mt-0.5">
                            {sample.title}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="text-[#FF6D00] font-bold">~{sample.expectedKcal} kcal</span>
                            <span>•</span>
                            <span className="text-[#00E5FF] font-bold">{sample.expectedProtein}g P</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              /* ACTIVE IMAGE PREVIEW & SCANNING / RESULT STAGE */
              <div className="space-y-4 landscape:space-y-0 landscape:grid landscape:grid-cols-12 landscape:gap-4">
                
                {/* Left Column: Photo Preview Card & Retake */}
                <div className="space-y-3 landscape:col-span-5 flex flex-col">
                  <div className="relative rounded-3xl overflow-hidden border border-[#242C35] bg-black max-h-56 landscape:max-h-52 flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Scanned Food"
                      className="w-full h-56 landscape:h-52 object-cover object-center opacity-90"
                    />

                    {/* Scanner Overlay while analyzing */}
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-[2px] animate-fadeIn">
                        <div className="w-16 h-16 rounded-full border-2 border-[#2979FF] border-t-transparent animate-spin mb-3 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-[#00E5FF] animate-pulse" />
                        </div>
                        <span className="text-xs font-black text-white tracking-wider uppercase">
                          Validating Food Content...
                        </span>
                        <span className="text-[10px] text-slate-300 mt-1">
                          Checking plate, dish boundaries & macros
                        </span>
                      </div>
                    )}

                    {!isAnalyzing && (
                      <button
                        onClick={() => {
                          setImagePreview(null);
                          setAnalysisResult(null);
                          setAnalysisError(null);
                        }}
                        className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-[#12161A]/85 backdrop-blur-md border border-[#242C35] text-xs font-bold text-white hover:bg-black transition-all flex items-center gap-1.5 shadow-lg"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retake</span>
                      </button>
                    )}

                    {analysisResult && (
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-[#12161A]/90 backdrop-blur-md border border-[#2979FF]/40 text-[10px] font-black text-[#2979FF] flex items-center gap-1 shadow-md">
                        <Sparkles className="w-3 h-3 text-[#00E5FF]" />
                        <span>{analysisResult.analyzedVia}</span>
                      </div>
                    )}
                  </div>

                  {/* Error Message if analysis failed */}
                  {analysisError && (
                    <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{analysisError}</span>
                    </div>
                  )}

                  {/* Portion Slider Adjuster (Only if real food is detected) */}
                  {analysisResult && analysisResult.isFood !== false && (
                    <div className="p-3 rounded-2xl bg-[#1A2026] border border-[#242C35] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-bold flex items-center gap-1">
                          <Sliders className="w-3.5 h-3.5 text-[#2979FF]" />
                          <span>Fine-Tune Portion:</span>
                        </span>
                        <span className="font-mono font-black text-[#2979FF]">
                          {Math.round(portionScale * 100)}% ({scaledWeight}g)
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.05"
                        value={portionScale}
                        onChange={(e) => setPortionScale(parseFloat(e.target.value))}
                        className="w-full accent-[#2979FF] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                        <span>Small (50%)</span>
                        <span>Standard (100%)</span>
                        <span>Large (200%)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: RESULTS OR NON-FOOD DETECTION NOTICE */}
                <div className="space-y-3.5 landscape:col-span-7 overflow-y-auto landscape:max-h-[68vh] pr-1 animate-fadeIn">
                  
                  {/* NON-FOOD / PORTRAIT DETECTION WARNING */}
                  {analysisResult && analysisResult.isFood === false ? (
                    <div className="p-5 rounded-3xl bg-[#1A2026] border border-amber-500/30 text-left space-y-3.5 shadow-xl">
                      <div className="flex items-center gap-2.5 text-amber-400 font-black text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
                        <span>No Edible Food Detected in Image</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        This image appears to be a portrait, person, or non-food photo. 
                        To keep your daily nutrition metrics accurate, calories will not be assigned to non-food photos.
                      </p>
                      <div className="p-3 rounded-2xl bg-[#12161A] border border-[#242C35] text-xs text-slate-400">
                        👉 <span className="text-white font-bold">Looking to log your meal?</span> Select from our 70+ authentic South Indian & Pan-Indian dishes with verified lab metrics below:
                      </div>

                      <button
                        onClick={() => setActiveTab('dishes')}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#2979FF] to-[#00E5FF] text-white font-black text-xs shadow-lg shadow-[#2979FF]/30 flex items-center justify-center gap-2 transition-all active:scale-98"
                      >
                        <Utensils className="w-4 h-4" />
                        <span>CHOOSE FROM VERIFIED DISHES MENU (70+ DISHES)</span>
                      </button>
                    </div>
                  ) : analysisResult && (
                    /* VERIFIED FOOD RESULT METRICS */
                    <div className="space-y-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-lg font-heading font-black text-white leading-tight">
                            {analysisResult.dishTitle}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              <span>{analysisResult.confidenceScore}% Confidence</span>
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Est. Total: ~{scaledWeight}g
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-2xl font-heading font-black text-white tracking-tight flex items-center gap-1 justify-end">
                            <Flame className="w-5 h-5 fill-[#FF6D00] text-[#FF6D00]" />
                            <span>{scaledCalories}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Calories (kcal)
                          </span>
                        </div>
                      </div>

                      {/* Smart Alternative Dishes / Candidate Pills */}
                      {analysisResult.candidates && analysisResult.candidates.length > 0 && (
                        <div className="p-3 rounded-2xl bg-[#161B22] border border-[#242C35] space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                            <span className="flex items-center gap-1.5 text-[#2979FF]">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Did you mean? (Tap to switch):</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setActiveTab('dishes')}
                              className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                            >
                              Browse 315+ menu
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {analysisResult.candidates.map(candidate => (
                              <button
                                key={candidate.id}
                                type="button"
                                onClick={() => {
                                  const weightNum = parseInt(candidate.servingSize.match(/\d+/)?.[0] || '150', 10);
                                  setAnalysisResult({
                                    ...analysisResult,
                                    dishTitle: candidate.name,
                                    totalCalories: candidate.calories,
                                    totalProteinG: candidate.proteinGrams,
                                    totalCarbsG: candidate.carbsGrams,
                                    totalFatG: candidate.fatGrams,
                                    estimatedTotalWeightG: weightNum,
                                    confidenceScore: 98,
                                    components: [
                                      {
                                        id: 'comp-' + candidate.id,
                                        name: candidate.name,
                                        weightGrams: weightNum,
                                        calories: candidate.calories,
                                        proteinG: candidate.proteinGrams,
                                        carbsG: candidate.carbsGrams,
                                        fatG: candidate.fatGrams,
                                        confidence: 98
                                      }
                                    ]
                                  });
                                }}
                                className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all text-left flex items-center gap-1.5 ${
                                  analysisResult.dishTitle === candidate.name
                                    ? 'bg-[#2979FF]/20 border-[#2979FF] text-[#2979FF] font-black shadow-md'
                                    : 'bg-[#12161A] border-[#242C35] text-slate-300 hover:text-white hover:border-slate-500 font-semibold'
                                }`}
                              >
                                <span>{candidate.name}</span>
                                <span className="text-[10px] opacity-75 font-normal">({candidate.calories} kcal)</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Macro Cards Grid */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2.5 rounded-2xl bg-[#1A2026] border border-[#242C35]">
                          <span className="text-[10px] font-bold uppercase text-[#00E5FF] block">Protein</span>
                          <span className="text-lg font-black text-white">{scaledProtein}g</span>
                        </div>

                        <div className="p-2.5 rounded-2xl bg-[#1A2026] border border-[#242C35]">
                          <span className="text-[10px] font-bold uppercase text-[#FF9100] block">Carbs</span>
                          <span className="text-lg font-black text-white">{scaledCarbs}g</span>
                        </div>

                        <div className="p-2.5 rounded-2xl bg-[#1A2026] border border-[#242C35]">
                          <span className="text-[10px] font-bold uppercase text-[#FF5252] block">Fats</span>
                          <span className="text-lg font-black text-white">{scaledFat}g</span>
                        </div>
                      </div>

                      {/* Detected Components List */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                          Identified Components ({analysisResult.components.length})
                        </span>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {analysisResult.components.map((comp) => {
                            const compWeight = Math.round(comp.weightGrams * portionScale);
                            const compKcal = Math.round(comp.calories * portionScale);
                            const compProtein = Math.round(comp.proteinG * portionScale);
                            return (
                              <div
                                key={comp.id}
                                className="p-2 rounded-xl bg-[#161B22] border border-[#242C35] flex items-center justify-between text-xs"
                              >
                                <div>
                                  <div className="font-bold text-white text-xs">{comp.name}</div>
                                  <div className="text-[10px] text-slate-400">
                                    ~{compWeight}g • {compProtein}g Protein • {comp.confidence}% confidence
                                  </div>
                                </div>
                                <span className="font-mono font-bold text-white text-xs shrink-0">
                                  {compKcal} kcal
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Meal Slot Picker */}
                      <div className="space-y-1.5 pt-2 border-t border-[#242C35]">
                        <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                          Add to Meal Slot:
                        </span>
                        <div className="grid grid-cols-4 gap-1.5">
                          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(slot => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setMealType(slot)}
                              className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                                mealType === slot
                                  ? 'bg-[#2979FF] text-white shadow-md shadow-[#2979FF]/30'
                                  : 'bg-[#1A2026] text-slate-400 hover:text-white border border-[#242C35]'
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 1-Tap Log Meal Button */}
                      <button
                        onClick={handleLogAiMeal}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#2979FF] to-[#00E5FF] hover:from-[#1C64F2] hover:to-[#00B0FF] text-white font-black text-sm shadow-xl shadow-[#2979FF]/40 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2"
                      >
                        <Check className="w-5 h-5 stroke-[2.5]" />
                        <span>LOG TO DAILY NUTRITION ({scaledCalories} KCAL)</span>
                      </button>
                    </div>
                  )}

                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
