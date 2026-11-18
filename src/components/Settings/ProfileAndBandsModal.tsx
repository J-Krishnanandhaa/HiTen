import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Download, Upload, RotateCcw, 
  Check, User, Layers, ShieldCheck, Dumbbell, Sparkles, Clock,
  ExternalLink, CheckCircle2, XCircle
} from 'lucide-react';
import { UserProfile, ResistanceBand, BandType } from '../../types';
import { ALL_DEFAULT_BANDS, SLOVIC_LOOP_BANDS } from '../../data/defaultBands';
import { exportAllData, importAllData, resetAllDataToFresh } from '../../utils/storage';
import { getDurationPresetInfo } from '../../utils/routineScaler';
import { getEquipmentMode, getEquipmentModeDetails } from '../../utils/equipmentManager';

interface ProfileAndBandsModalProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const ProfileAndBandsModal: React.FC<ProfileAndBandsModalProps> = ({
  userProfile,
  onUpdateProfile,
}) => {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [isSavedAlert, setIsSavedAlert] = useState(false);
  const [reloadedToast, setReloadedToast] = useState(false);

  useEffect(() => {
    setProfile(userProfile);
  }, [userProfile]);

  // New band form state
  const [showAddBand, setShowAddBand] = useState(false);
  const [bandName, setBandName] = useState('');
  const [bandColor, setBandColor] = useState('#2979FF');
  const [bandWeightLbs, setBandWeightLbs] = useState<number>(30);
  const [bandType, setBandType] = useState<BandType>('Long Loop Band');

  const handleSaveProfile = () => {
    const sanitized: UserProfile = {
      ...profile,
      weightKg: Number(profile.weightKg) > 0 ? Number(profile.weightKg) : 70,
      heightCm: Number(profile.heightCm) > 0 ? Number(profile.heightCm) : 175,
      age: Number(profile.age) > 0 ? Number(profile.age) : 25,
    };
    setProfile(sanitized);
    onUpdateProfile(sanitized);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 2500);
  };

  const handleUpdateDuration = (mins: number) => {
    const updated = { ...profile, targetWorkoutDurationMins: mins };
    setProfile(updated);
    onUpdateProfile(updated);
  };

  const handleAddBand = () => {
    if (!bandName.trim()) {
      alert('Please enter a band name');
      return;
    }
    const newBand: ResistanceBand = {
      id: 'band-' + Date.now(),
      name: bandName.trim(),
      colorHex: bandColor,
      weightLbs: bandWeightLbs,
      weightKg: Math.round(bandWeightLbs * 0.453592 * 10) / 10,
      type: bandType,
      isActive: true,
      brand: 'Custom',
    };
    const updatedBands = [...profile.ownedBands, newBand];
    const updated = { ...profile, ownedBands: updatedBands };
    setProfile(updated);
    onUpdateProfile(updated);
    setShowAddBand(false);
    setBandName('');
  };

  const handleDeleteBand = (bandId: string) => {
    const updatedBands = profile.ownedBands.filter(b => b.id !== bandId);
    const updated = { ...profile, ownedBands: updatedBands };
    setProfile(updated);
    onUpdateProfile(updated);
  };

  // Preset for Slovic Loop Bands (Natural Latex Pull-Up & Loop Bands)
  const handleLoadSlovicLoopBands = () => {
    const updated: UserProfile = {
      ...profile,
      hasResistanceBands: true,
      ownedBands: SLOVIC_LOOP_BANDS.map(b => ({ ...b })),
    };
    setProfile(updated);
    onUpdateProfile(updated);
    setReloadedToast(true);
    setTimeout(() => setReloadedToast(false), 3000);
  };

  const handleResetBands = () => {
    const updated: UserProfile = {
      ...profile,
      hasResistanceBands: true,
      ownedBands: SLOVIC_LOOP_BANDS.map(b => ({ ...b })),
    };
    setProfile(updated);
    onUpdateProfile(updated);
    setReloadedToast(true);
    setTimeout(() => setReloadedToast(false), 3000);
  };

  const handleExportBackup = () => {
    const jsonStr = exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `home-workout-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content && importAllData(content)) {
        alert('Data restored successfully! Refreshing...');
        window.location.reload();
      } else {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToFreshSlate = () => {
    if (window.confirm('Reset app to a fresh slate? This will clear all logged workouts, custom routines, and personal settings back to factory defaults.')) {
      resetAllDataToFresh();
      alert('App has been reset to a fresh state.');
      window.location.reload();
    }
  };

  const currentDuration = profile.targetWorkoutDurationMins || 20;

  return (
    <div className="space-y-5 pb-24 max-w-xl md:max-w-4xl lg:max-w-5xl landscape:max-w-5xl mx-auto animate-fadeIn select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-black text-white tracking-tight">
            Profile & Equipment
          </h2>
          <span className="text-xs text-slate-400 font-semibold">
            Calibrate your workout time, bands, and body stats
          </span>
        </div>

        {isSavedAlert && (
          <span className="text-xs font-bold text-[#00E676] flex items-center gap-1 animate-fadeIn">
            <Check className="w-3.5 h-3.5" />
            <span>Saved!</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 landscape:grid-cols-2 gap-4 items-start">
        
        {/* Left Column: Duration Control & Equipment */}
        <div className="space-y-4">

          {/* 1. WORKOUT SESSION DURATION SELECTOR & AUTO-SCALING */}
          <div className="leap-card p-5 space-y-3 border-l-4 border-l-[#00E5FF]">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#242C35]">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#00E5FF]" />
                <h3 className="text-sm font-bold text-white">Workout Session Duration</h3>
              </div>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                {currentDuration} Mins
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Decide how long you want to workout. The app automatically scales exercises, set volumes, and rest timers to match your exact duration.
            </p>

            {/* Quick Pills */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
              {[10, 15, 20, 25, 30, 40].map((mins) => {
                const isSelected = currentDuration === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleUpdateDuration(mins)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-black transition-all border ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#2979FF] to-[#00E5FF] text-white border-transparent shadow-lg shadow-[#2979FF]/30 scale-[1.02]'
                        : 'bg-[#12161A] text-slate-400 border-[#242C35] hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    <div>{mins}m</div>
                  </button>
                );
              })}
            </div>

            {/* Duration Stepper Controls */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#12161A] border border-[#242C35] mt-1">
              <span className="text-xs text-slate-400 font-semibold">Fine-tune time:</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleUpdateDuration(Math.max(5, currentDuration - 5))}
                  className="w-8 h-8 rounded-lg bg-[#1A2026] hover:bg-[#242C35] border border-[#2D3748] text-white font-bold flex items-center justify-center active:scale-95 transition-transform"
                >
                  -
                </button>
                <span className="text-sm font-black text-white w-14 text-center">
                  {currentDuration} min
                </span>
                <button
                  type="button"
                  onClick={() => handleUpdateDuration(Math.min(60, currentDuration + 5))}
                  className="w-8 h-8 rounded-lg bg-[#1A2026] hover:bg-[#242C35] border border-[#2D3748] text-white font-bold flex items-center justify-center active:scale-95 transition-transform"
                >
                  +
                </button>
              </div>
            </div>

            {/* Dynamic Preset Preview Badge */}
            {(() => {
              const info = getDurationPresetInfo(currentDuration);
              return (
                <div className="p-3 rounded-xl bg-[#00E5FF]/5 border border-[#00E5FF]/20 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#00E5FF]">{info.badge}</span>
                    <span className="text-[11px] text-slate-400 font-semibold">{info.setsDescription} • {info.restDescription}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {info.summary}
                  </p>
                </div>
              );
            })()}
          </div>

          {/* 2. EQUIPMENT FREEDOM & AVAILABILITY CONTROLS */}
          {(() => {
            const hasBands = profile.hasResistanceBands !== false;
            const hasBar = profile.hasPullUpBar !== false;
            const mode = getEquipmentMode(profile);
            const modeDetails = getEquipmentModeDetails(mode);

            const handleToggleBands = () => {
              const updated = { ...profile, hasResistanceBands: !hasBands };
              setProfile(updated);
              onUpdateProfile(updated);
            };

            const handleToggleBar = () => {
              const updated = { ...profile, hasPullUpBar: !hasBar };
              setProfile(updated);
              onUpdateProfile(updated);
            };

            return (
              <div className="leap-card p-5 space-y-4 border-l-4 border-l-[#2979FF]">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#242C35]">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-[#2979FF]" />
                    <h3 className="text-sm font-bold text-white">Equipments</h3>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#2979FF]/10 text-[#2979FF] border border-[#2979FF]/30">
                    Customizable Gear
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Turn your equipment ON or OFF. All workouts in the app will automatically filter and adapt to your available gear.
                </p>

                {/* 1-Click Quick Gear Switcher Presets */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                  {[
                    { id: 'hybrid', label: '✨ Hybrid', sub: 'Bands + Bar', bands: true, bar: true, color: '#2979FF' },
                    { id: 'bands-only', label: '⚡ Bands Only', sub: 'Door & Floor', bands: true, bar: false, color: '#00E5FF' },
                    { id: 'bar-only', label: '🏋️ Pull-Up Bar', sub: 'Bar Calisthenics', bands: false, bar: true, color: '#E53935' },
                    { id: 'no-equipment', label: '🔥 No Equipment', sub: 'Rowan Row Moves', bands: false, bar: false, color: '#00E676' },
                  ].map(btn => {
                    const isCurrent = mode === btn.id;
                    return (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => {
                          const updated = {
                            ...profile,
                            hasResistanceBands: btn.bands,
                            hasPullUpBar: btn.bar,
                          };
                          setProfile(updated);
                          onUpdateProfile(updated);
                        }}
                        className={`p-2.5 rounded-2xl text-left transition-all border ${
                          isCurrent
                            ? 'shadow-lg scale-[1.01]'
                            : 'bg-[#12161A]/80 text-slate-400 border-[#242C35] hover:text-white hover:border-slate-600'
                        }`}
                        style={
                          isCurrent
                            ? { backgroundColor: `${btn.color}25`, borderColor: btn.color }
                            : {}
                        }
                      >
                        <div 
                          className="text-xs font-black truncate flex items-center justify-between"
                          style={{ color: isCurrent ? btn.color : '#f1f5f9' }}
                        >
                          <span>{btn.label}</span>
                          {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                          {btn.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Independent Toggle Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Resistance Bands Toggle */}
                  <button
                    type="button"
                    onClick={handleToggleBands}
                    className={`p-3.5 rounded-xl border text-left transition-all group flex flex-col justify-between relative overflow-hidden ${
                      hasBands
                        ? 'bg-[#12161A] border-[#2979FF]/50 hover:border-[#2979FF] shadow-md shadow-[#2979FF]/5'
                        : 'bg-[#12161A]/60 border-[#242C35] text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className="flex items-center gap-2">
                        <Layers className={`w-4 h-4 ${hasBands ? 'text-[#2979FF]' : 'text-slate-500'}`} />
                        <span className={`text-xs font-bold ${hasBands ? 'text-white' : 'text-slate-400'}`}>
                          Resistance Bands
                        </span>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                        hasBands
                          ? 'bg-[#2979FF]/20 text-[#2979FF] border-[#2979FF]/40'
                          : 'bg-[#242C35] text-slate-400 border-[#2D3748]'
                      }`}>
                        {hasBands ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {hasBands ? 'ON' : 'OFF'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 leading-tight">
                      {hasBands 
                        ? `${profile.ownedBands.length} Loop Bands active in workouts`
                        : 'Turned off • Band exercises excluded'}
                    </div>
                  </button>

                  {/* Pull-Up Bar Toggle */}
                  <button
                    type="button"
                    onClick={handleToggleBar}
                    className={`p-3.5 rounded-xl border text-left transition-all group flex flex-col justify-between relative overflow-hidden ${
                      hasBar
                        ? 'bg-[#12161A] border-[#E53935]/50 hover:border-[#E53935] shadow-md shadow-[#E53935]/5'
                        : 'bg-[#12161A]/60 border-[#242C35] text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className="flex items-center gap-2">
                        <Dumbbell className={`w-4 h-4 ${hasBar ? 'text-[#E53935]' : 'text-slate-500'}`} />
                        <span className={`text-xs font-bold ${hasBar ? 'text-white' : 'text-slate-400'}`}>
                          Pull-Up Bar
                        </span>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                        hasBar
                          ? 'bg-[#E53935]/20 text-[#E53935] border-[#E53935]/40'
                          : 'bg-[#242C35] text-slate-400 border-[#2D3748]'
                      }`}>
                        {hasBar ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {hasBar ? 'ON' : 'OFF'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 leading-tight">
                      {hasBar 
                        ? 'Pull-ups, chin-ups & hanging core active'
                        : 'Turned off • Bar exercises excluded'}
                    </div>
                  </button>
                </div>

                {/* Dynamic Mode Preview Banner */}
                <div 
                  className="p-3.5 rounded-xl border space-y-2 transition-all"
                  style={{
                    backgroundColor: `${modeDetails.color}0D`,
                    borderColor: `${modeDetails.color}33`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-xs font-black tracking-wide"
                      style={{ color: modeDetails.color }}
                    >
                      {modeDetails.badge}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {modeDetails.gearSummary}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {modeDetails.description}
                  </p>

                  {mode === 'no-equipment' && (
                    <div className="pt-1 border-t border-emerald-500/20 flex items-center justify-between">
                      <span className="text-[10px] text-emerald-400 font-semibold">
                        Rowan Row 45-Min Full Body Workout
                      </span>
                      <a
                        href="https://youtu.be/cDq-nFmD0rI?si=hdyLbUNXDfW-K79f"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-emerald-600/30 hover:bg-emerald-600/50 px-2 py-0.5 rounded border border-emerald-500/40 transition-colors"
                      >
                        <span>View Source Video</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Slovic Calibration Quick-Reload (Only visible when bands are enabled) */}
                {hasBands && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">Slovic Calibration:</span>
                      <button
                        type="button"
                        onClick={handleLoadSlovicLoopBands}
                        className="text-[11px] font-bold text-[#00E5FF] hover:underline flex items-center gap-1 active:scale-95 transition-transform"
                      >
                        <Sparkles className="w-3 h-3 text-[#FF9100]" />
                        <span>Reload Slovic 5-Band Kit</span>
                      </button>
                    </div>

                    {reloadedToast && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-400 flex items-center gap-2 animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>All 5 Slovic Natural Latex Loop Bands (3 to 60 kg) loaded!</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* 3. ACTIVE RESISTANCE BANDS KIT */}
          <div className="leap-card p-5 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#242C35]">
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-[#2979FF]" />
                <h3 className="text-sm font-bold text-white">Active Band Kit ({profile.ownedBands.length})</h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleResetBands}
                  className="p-1.5 rounded-lg bg-[#242C35] hover:bg-[#2D3748] text-slate-400 hover:text-white"
                  title="Reset to Slovic loop bands"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowAddBand(!showAddBand)}
                  className="px-2.5 py-1 rounded-lg bg-[#2979FF] hover:bg-[#1C64F2] text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Band</span>
                </button>
              </div>
            </div>

            {profile.hasResistanceBands === false && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
                <span>Resistance bands are turned OFF. Band exercises are hidden in routines.</span>
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...profile, hasResistanceBands: true };
                    setProfile(updated);
                    onUpdateProfile(updated);
                  }}
                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30"
                >
                  Turn ON
                </button>
              </div>
            )}

            <div className="space-y-2">
              {profile.ownedBands.map((band) => (
                <div
                  key={band.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#12161A] border border-[#242C35] hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border border-white/20 shadow-sm shrink-0"
                      style={{ backgroundColor: band.colorHex }}
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{band.name}</span>
                        {band.brand === 'Slovic' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black">
                            SLOVIC
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {band.weightKg} kg ({band.weightLbs} lbs) • {band.type}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteBand(band.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-[#1A2026] transition-all"
                    title="Remove band"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Custom Band Adder */}
            {showAddBand && (
              <div className="p-3.5 rounded-xl bg-[#12161A] border border-[#2979FF]/40 space-y-3 animate-fadeIn mt-2">
                <div className="text-xs font-bold text-[#2979FF] flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Custom Band</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Band Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Slovic Orange Loop"
                      value={bandName}
                      onChange={(e) => setBandName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#1A2026] border border-[#2D3748] rounded-lg text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Resistance (lbs)</label>
                    <input
                      type="number"
                      value={bandWeightLbs === undefined || bandWeightLbs === null ? '' : bandWeightLbs}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBandWeightLbs(val === '' ? ('' as any) : parseInt(val));
                      }}
                      onBlur={() => {
                        if (!bandWeightLbs || isNaN(Number(bandWeightLbs))) {
                          setBandWeightLbs(30);
                        }
                      }}
                      className="w-full px-3 py-1.5 bg-[#1A2026] border border-[#2D3748] rounded-lg text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bandColor}
                        onChange={(e) => setBandColor(e.target.value)}
                        className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-[#2D3748]"
                      />
                      <span className="text-xs text-slate-400 font-mono">{bandColor}</span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Type</label>
                    <select
                      value={bandType}
                      onChange={(e) => setBandType(e.target.value as BandType)}
                      className="w-full px-3 py-1.5 bg-[#1A2026] border border-[#2D3748] rounded-lg text-white font-bold"
                    >
                      <option value="Long Loop Band">Long Loop Band (Slovic Pull-Up)</option>
                      <option value="Loop Band">Mini Loop Band</option>
                      <option value="Figure 8">Figure 8 Band</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowAddBand(false)}
                    className="px-3 py-1 text-slate-400 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddBand}
                    className="px-3.5 py-1 bg-[#2979FF] text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    Save Band
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Personal Metrics & Data Management */}
        <div className="space-y-4">
          {/* 4. BODY METRICS & UNITS */}
          <div className="leap-card p-5 space-y-3">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#242C35]">
              <User className="w-4 h-4 text-[#2979FF]" />
              <h3 className="text-sm font-bold text-white">Personal Metrics</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#12161A] border border-[#242C35] rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Unit System</label>
                <div className="grid grid-cols-2 gap-1 bg-[#12161A] p-1 rounded-xl border border-[#242C35]">
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, unitSystem: 'kg' })}
                    className={`py-1 text-center rounded-lg text-xs font-bold transition-all ${
                      profile.unitSystem === 'kg' ? 'bg-[#2979FF] text-white' : 'text-slate-400'
                    }`}
                  >
                    Kg
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, unitSystem: 'lbs' })}
                    className={`py-1 text-center rounded-lg text-xs font-bold transition-all ${
                      profile.unitSystem === 'lbs' ? 'bg-[#2979FF] text-white' : 'text-slate-400'
                    }`}
                  >
                    Lbs
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.weightKg === undefined || profile.weightKg === null ? '' : profile.weightKg}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProfile({ ...profile, weightKg: val === '' ? ('' as any) : parseFloat(val) });
                  }}
                  onBlur={() => {
                    if (!profile.weightKg || isNaN(Number(profile.weightKg)) || Number(profile.weightKg) <= 0) {
                      setProfile({ ...profile, weightKg: 70 });
                    }
                  }}
                  className="w-full px-3 py-2 bg-[#12161A] border border-[#242C35] rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Height (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={profile.heightCm === undefined || profile.heightCm === null ? '' : profile.heightCm}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProfile({ ...profile, heightCm: val === '' ? ('' as any) : parseFloat(val) });
                  }}
                  onBlur={() => {
                    if (!profile.heightCm || isNaN(Number(profile.heightCm)) || Number(profile.heightCm) <= 0) {
                      setProfile({ ...profile, heightCm: 175 });
                    }
                  }}
                  className="w-full px-3 py-2 bg-[#12161A] border border-[#242C35] rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Age</label>
                <input
                  type="number"
                  step="1"
                  value={profile.age === undefined || profile.age === null ? '' : profile.age}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProfile({ ...profile, age: val === '' ? ('' as any) : parseInt(val) });
                  }}
                  onBlur={() => {
                    if (!profile.age || isNaN(Number(profile.age)) || Number(profile.age) <= 0) {
                      setProfile({ ...profile, age: 25 });
                    }
                  }}
                  className="w-full px-3 py-2 bg-[#12161A] border border-[#242C35] rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#12161A] border border-[#242C35] rounded-xl text-white font-bold"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full py-2.5 rounded-xl bg-[#2979FF] hover:bg-[#1C64F2] text-white text-xs font-black shadow-md mt-2 transition-all"
            >
              Save Profile Changes
            </button>
          </div>

          {/* 5. DATA PORTABILITY (EXPORT / IMPORT JSON BACKUP) */}
          <div className="leap-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">Data Management</h3>
            <p className="text-xs text-slate-400">
              Export your entire workout history, custom routines, and band settings as JSON for safe keeping.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleExportBackup}
                className="p-2.5 rounded-xl bg-[#12161A] hover:bg-[#242C35] border border-[#242C35] text-xs font-bold text-slate-300 flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4 text-[#2979FF]" />
                <span>Export Backup</span>
              </button>

              <label className="p-2.5 rounded-xl bg-[#12161A] hover:bg-[#242C35] border border-[#242C35] text-xs font-bold text-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer">
                <Upload className="w-4 h-4 text-[#00E676]" />
                <span>Restore Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleResetToFreshSlate}
                className="col-span-2 p-2.5 rounded-xl bg-red-950/20 hover:bg-red-900/30 border border-red-800/40 text-xs font-bold text-red-300 flex items-center justify-center gap-2 transition-all"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>Reset to Fresh Slate (Clear All Data)</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
