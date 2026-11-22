import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Download, Upload, RotateCcw, 
  Check, User, Layers, Dumbbell, Sparkles, CheckCircle2
} from 'lucide-react';
import { UserProfile, ResistanceBand, BandType } from '../../types';
import { SLOVIC_LOOP_BANDS } from '../../data/defaultBands';
import { exportAllData, importAllData, resetAllDataToFresh } from '../../utils/storage';
import { getEquipmentMode } from '../../utils/equipmentManager';
import { bandRangeLabel } from '../../utils/bands';
import { ConfirmSheet } from '../Common/ConfirmSheet';

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
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const showNotice = (kind: 'ok' | 'error', text: string) => {
    setNotice({ kind, text });
    setTimeout(() => setNotice(null), 4000);
  };

  useEffect(() => {
    setProfile(userProfile);
  }, [userProfile]);

  // New band form state
  const [showAddBand, setShowAddBand] = useState(false);
  const [bandName, setBandName] = useState('');
  const [bandColor, setBandColor] = useState('#6EA8FF');
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

  const handleAddBand = () => {
    if (!bandName.trim()) {
      showNotice('error', 'Give the band a name first.');
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
    a.download = `hyten-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = (evt.target?.result as string) || '';
      const result = importAllData(content);
      if (result.ok) {
        showNotice('ok', `Backup restored (${result.workouts} workouts). Reloading…`);
        setTimeout(() => window.location.reload(), 1200);
      } else {
        showNotice('error', result.error || 'That file could not be restored.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetToFreshSlate = () => setConfirmReset(true);

  const doReset = () => {
    setConfirmReset(false);
    resetAllDataToFresh();
    window.location.reload();
  };


  return (
    <div className="space-y-5 pb-28 max-w-xl md:max-w-4xl lg:max-w-5xl landscape:max-w-5xl mx-auto animate-fadeIn">
      <ConfirmSheet
        open={confirmReset}
        title="Reset everything?"
        message="This deletes all logged workouts, custom routines and settings on this device. Export a backup first if you might want them."
        confirmLabel="Delete everything"
        destructive
        onConfirm={doReset}
        onCancel={() => setConfirmReset(false)}
      />
      {notice && (
        <div
          role="status"
          className={`fixed top-14 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 rounded-2xl text-sm font-bold shadow-xl ${
            notice.kind === 'ok' ? 'bg-hy-success text-hy-on-primary' : 'bg-hy-danger text-hy-on-primary'
          }`}
        >
          {notice.text}
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-black text-white tracking-tight">
            Profile
          </h2>
        </div>

        {isSavedAlert && (
          <span className="text-xs font-bold text-hy-success flex items-center gap-1 animate-fadeIn">
            <Check className="w-3.5 h-3.5" />
            <span>Saved!</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 landscape:grid-cols-2 gap-4 items-start">
        
        {/* Left Column: Equipment */}
        <div className="space-y-4">

          {/* 2. EQUIPMENT FREEDOM & AVAILABILITY CONTROLS */}
          {(() => {
            const hasBands = profile.hasResistanceBands !== false;
            const mode = getEquipmentMode(profile);

            return (
              <div className="hy-card p-5 space-y-4 border-l-4 border-l-hy-primary">
                <div className="flex items-center justify-between pb-2.5 border-b border-hy-elevated">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-hy-primary" />
                    <h3 className="text-sm font-bold text-white">Equipment</h3>
                  </div>
                </div>


                {/* 1-Click Quick Gear Switcher Presets */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                  {[
                    { id: 'hybrid', label: 'Hybrid', sub: 'Bands + Bar', bands: true, bar: true, color: '#F5F5F5' },
                    { id: 'bands-only', label: 'Bands only', sub: 'Door & Floor', bands: true, bar: false, color: '#F5F5F5' },
                    { id: 'bar-only', label: 'Pull-up bar', sub: 'Bar only', bands: false, bar: true, color: '#F5F5F5' },
                    { id: 'no-equipment', label: 'No equipment', sub: 'Bodyweight', bands: false, bar: false, color: '#F5F5F5' },
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
                            : 'bg-hy-bg/80 text-hy-text-2 border-hy-elevated hover:text-white hover:border-slate-600'
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
                        <div className="text-xs text-hy-text-2 truncate mt-0.5 font-medium">
                          {btn.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Slovic Calibration Quick-Reload (Only visible when bands are enabled) */}
                {hasBands && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span />
                      <button
                        type="button"
                        onClick={handleLoadSlovicLoopBands}
                        className="text-xs font-bold text-hy-volt hover:underline flex items-center gap-1 active:scale-95 transition-transform"
                      >
                        <Sparkles className="w-3 h-3 text-hy-warning" />
                        <span>Load Slovic kit</span>
                      </button>
                    </div>

                    {reloadedToast && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-400 flex items-center gap-2 animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Slovic kit loaded</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* 3. ACTIVE RESISTANCE BANDS KIT */}
          <div className="hy-card p-5 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-hy-elevated">
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-hy-primary" />
                <h3 className="text-sm font-bold text-white">Bands ({profile.ownedBands.length})</h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleResetBands}
                  className="p-1.5 rounded-lg bg-hy-elevated hover:bg-hy-border text-hy-text-2 hover:text-white"
                  title="Reset to Slovic loop bands" aria-label="Reset to Slovic loop bands"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowAddBand(!showAddBand)}
                  className="px-2.5 py-1 rounded-lg bg-hy-primary hover:bg-hy-primary-hover text-hy-on-primary text-xs font-bold flex items-center gap-1 shadow-sm"
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
                  className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30"
                >
                  Turn ON
                </button>
              </div>
            )}

            <div className="space-y-2">
              {profile.ownedBands.map((band) => (
                <div
                  key={band.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-hy-bg border border-hy-elevated hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border border-white/20 shadow-sm shrink-0"
                      style={{ backgroundColor: band.colorHex }}
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{band.name}</span>
                      </div>
                      <div className="text-xs text-hy-text-2 mt-0.5">
                        Rated {bandRangeLabel(band, profile.unitSystem)} • {band.type}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteBand(band.id)}
                    className="p-1.5 rounded-lg text-hy-text-3 hover:text-red-400 hover:bg-hy-surface transition-all"
                    title="Remove band"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Custom Band Adder */}
            {showAddBand && (
              <div className="p-3.5 rounded-xl bg-hy-bg border border-hy-primary/40 space-y-3 animate-fadeIn mt-2">
                <div className="text-xs font-bold text-hy-primary flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Custom Band</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="col-span-2">
                    <label className="text-xs uppercase font-bold text-hy-text-2 block mb-1">Band Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Slovic Orange Loop"
                      value={bandName}
                      onChange={(e) => setBandName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-hy-surface border border-hy-border rounded-lg text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase font-bold text-hy-text-2 block mb-1">Resistance (lbs)</label>
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
                      className="w-full px-3 py-1.5 bg-hy-surface border border-hy-border rounded-lg text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase font-bold text-hy-text-2 block mb-1">Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bandColor}
                        onChange={(e) => setBandColor(e.target.value)}
                        className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-hy-border"
                      />
                      <span className="text-xs text-hy-text-2 font-mono">{bandColor}</span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs uppercase font-bold text-hy-text-2 block mb-1">Type</label>
                    <select
                      value={bandType}
                      onChange={(e) => setBandType(e.target.value as BandType)}
                      className="w-full px-3 py-1.5 bg-hy-surface border border-hy-border rounded-lg text-white font-bold"
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
                    className="px-3 py-1 text-hy-text-2 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddBand}
                    className="px-3.5 py-1 bg-hy-primary text-hy-on-primary text-xs font-bold rounded-lg shadow-sm"
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
          <div className="hy-card p-5 space-y-3">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-hy-elevated">
              <User className="w-4 h-4 text-hy-primary" />
              <h3 className="text-sm font-bold text-white">Body</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-xs uppercase font-bold text-hy-text-2 block mb-1">Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 bg-hy-bg border border-hy-elevated rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-hy-text-2 block mb-1">Unit System</label>
                <div className="grid grid-cols-2 gap-1 bg-hy-bg p-1 rounded-xl border border-hy-elevated">
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, unitSystem: 'kg' })}
                    className={`py-1 text-center rounded-lg text-xs font-bold transition-all ${
                      profile.unitSystem === 'kg' ? 'bg-hy-primary text-hy-on-primary' : 'text-hy-text-2'
                    }`}
                  >
                    Kg
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, unitSystem: 'lbs' })}
                    className={`py-1 text-center rounded-lg text-xs font-bold transition-all ${
                      profile.unitSystem === 'lbs' ? 'bg-hy-primary text-hy-on-primary' : 'text-hy-text-2'
                    }`}
                  >
                    Lbs
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-hy-text-2 block mb-1">Weight (kg)</label>
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
                  className="w-full px-3 py-2 bg-hy-bg border border-hy-elevated rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-hy-text-2 block mb-1">Height (cm)</label>
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
                  className="w-full px-3 py-2 bg-hy-bg border border-hy-elevated rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-hy-text-2 block mb-1">Age</label>
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
                  className="w-full px-3 py-2 bg-hy-bg border border-hy-elevated rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-hy-text-2 block mb-1">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value as any })}
                  className="w-full px-3 py-2 bg-hy-bg border border-hy-elevated rounded-xl text-white font-bold"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full py-2.5 rounded-xl bg-hy-primary hover:bg-hy-primary-hover text-hy-on-primary text-xs font-black shadow-md mt-2 transition-all"
            >
              Save Profile Changes
            </button>
          </div>

          {/* 6. DATA PORTABILITY (EXPORT / IMPORT JSON BACKUP) */}
          <div className="hy-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">Data</h3>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleExportBackup}
                className="p-2.5 rounded-xl bg-hy-bg hover:bg-hy-elevated border border-hy-elevated text-xs font-bold text-slate-300 flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4 text-hy-primary" />
                <span>Export Backup</span>
              </button>

              <label className="p-2.5 rounded-xl bg-hy-bg hover:bg-hy-elevated border border-hy-elevated text-xs font-bold text-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer">
                <Upload className="w-4 h-4 text-hy-success" />
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
