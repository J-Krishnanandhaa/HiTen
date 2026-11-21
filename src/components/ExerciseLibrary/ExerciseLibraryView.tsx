import React, { useState } from 'react';
import { Search, ChevronRight, X, Shield, Check, ExternalLink } from 'lucide-react';
import { Exercise } from '../../types';
import { EXERCISE_DATABASE, getExerciseById, getExerciseTimestampLabel, getExerciseVideoCue, getExerciseVideoSource } from '../../data/exerciseDatabase';
import { VideoDemoSheet } from '../Common/VideoDemoSheet';
import { WorkoutAvatar } from '../Common/WorkoutAvatar';
import { YoutubeIcon } from '../Common/YoutubeIcon';

export const ExerciseLibraryView: React.FC = () => {
  const [videoFor, setVideoFor] = useState<Exercise | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [selectedAnchor, setSelectedAnchor] = useState<string>('All');
  const [selectedEquipment, setSelectedEquipment] = useState<'All' | 'Bands' | 'Pull-Up Bar' | 'No Equipment'>('All');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const muscleGroups = ['All', 'Back', 'Chest', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Core', 'Full Body'];
  const anchorPositions = ['All', 'Bar', 'Door High', 'Door Middle', 'Door Low', 'Under Feet', 'Behind Back', 'None'];

  const filteredExercises = EXERCISE_DATABASE.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.targetMuscle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || ex.targetMuscle === selectedMuscle;
    const matchesAnchor = selectedAnchor === 'All' || ex.anchorPosition === selectedAnchor || (selectedAnchor === 'Bar' && (ex.anchorPosition === 'Bar' || ex.anchorPosition === 'Pull-Up Bar'));
    const matchesEquipment = 
      selectedEquipment === 'All' ||
      (selectedEquipment === 'Bands' && ex.requiresBand) ||
      (selectedEquipment === 'Pull-Up Bar' && ex.requiresBar) ||
      (selectedEquipment === 'No Equipment' && !ex.requiresBand && !ex.requiresBar);

    return matchesSearch && matchesMuscle && matchesAnchor && matchesEquipment;
  });

  return (
    <div className="space-y-4 pb-24 max-w-xl md:max-w-4xl lg:max-w-5xl landscape:max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-heading font-black text-white tracking-tight">
          Exercise Library
        </h2>
        <p className="text-xs text-hy-text-2 mt-0.5">
          Step-by-step posture guide and animated avatars
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-hy-text-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search pull-ups, squats, curls, chest press..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-hy-surface border border-hy-elevated text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-hy-primary"
        />
      </div>

      {/* Equipment Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {[
          { id: 'All', label: 'All Equipment' },
          { id: 'Bands', label: '⚡ Resistance Bands' },
          { id: 'Pull-Up Bar', label: '🏋️ Pull-Up Bar' },
          { id: 'No Equipment', label: '🔥 No Equipment (Rowan Row)' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedEquipment(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${
              selectedEquipment === tab.id
                ? 'bg-gradient-to-r from-hy-primary to-hy-volt text-hy-on-primary border-transparent shadow-md shadow-hy-primary/20 scale-[1.02]'
                : 'bg-hy-bg text-hy-text-2 border-hy-elevated hover:text-white hover:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Muscle Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {muscleGroups.map(m => (
          <button
            key={m}
            onClick={() => setSelectedMuscle(m)}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedMuscle === m
                ? 'bg-hy-primary text-hy-on-primary shadow-md shadow-hy-primary/30'
                : 'bg-hy-surface text-hy-text-2 border border-hy-elevated hover:text-white'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Anchor Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
        <span className="text-hy-text-3 font-bold uppercase shrink-0">Anchor:</span>
        {anchorPositions.map(a => (
          <button
            key={a}
            onClick={() => setSelectedAnchor(a)}
            className={`px-2.5 py-0.5 rounded-lg whitespace-nowrap font-bold transition-all ${
              selectedAnchor === a
                ? 'bg-hy-primary/20 text-hy-primary border border-hy-primary/40'
                : 'bg-hy-surface text-hy-text-2 border border-hy-elevated'
            }`}
          >
            {a === 'Bar' ? '⚓ Bar' : a}
          </button>
        ))}
      </div>

      {/* Exercises List */}
      <div className="grid grid-cols-1 md:grid-cols-2 landscape:grid-cols-2 gap-2.5">
        {filteredExercises.map(ex => (
          <div
            key={ex.id}
            onClick={() => setSelectedExercise(ex)}
            className="hy-card-interactive p-3.5 cursor-pointer flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Mini Animated Avatar Icon */}
              <div className="w-14 h-14 rounded-2xl bg-hy-bg border border-hy-elevated shrink-0 overflow-hidden flex items-center justify-center group-hover:border-hy-primary/50 transition-colors">
                <WorkoutAvatar
                  animationType={ex.avatarAnimation}
                  anchorPosition={ex.anchorPosition}
                  exerciseName={ex.name}
                  size="sm"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-xs font-black uppercase bg-hy-primary/15 text-hy-primary">
                    {ex.targetMuscle}
                  </span>
                  {ex.requiresBand && ex.requiresBar ? (
                    <span className="px-1.5 py-0.5 rounded text-xs font-black bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      Bands + Bar
                    </span>
                  ) : ex.requiresBar ? (
                    <span className="px-1.5 py-0.5 rounded text-xs font-black bg-hy-danger/20 text-hy-danger border border-hy-danger/30">
                      Pull-Up Bar
                    </span>
                  ) : ex.requiresBand ? (
                    <span className="px-1.5 py-0.5 rounded text-xs font-black bg-hy-volt/20 text-hy-volt border border-hy-volt/30">
                      Bands
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      No Equipment
                    </span>
                  )}
                  <span className="text-xs text-hy-text-2 font-semibold truncate">
                    ⚓ {ex.anchorPosition}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white group-hover:text-hy-primary transition-colors truncate">
                    {ex.name}
                  </h4>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideoFor(ex);
                    }}
                    aria-label={`Watch ${ex.name} demo`}
                    className="min-h-[32px] px-2 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all shrink-0 inline-flex items-center gap-1 text-xs font-bold"
                  >
                    <YoutubeIcon className="w-3.5 h-3.5 fill-current" />
                    {getExerciseTimestampLabel(ex.id) && <span className="font-mono text-xs">{getExerciseTimestampLabel(ex.id)}</span>}
                  </button>
                </div>
                <p className="text-xs text-hy-text-2 line-clamp-1 mt-0.5">
                  {ex.instructions[0]}
                </p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-hy-text-3 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        ))}
      </div>

      <VideoDemoSheet exerciseId={videoFor?.id ?? null} exerciseName={videoFor?.name} onClose={() => setVideoFor(null)} />

      {/* EXERCISE DETAIL MODAL */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md landscape:max-w-3xl bg-hy-bg border border-hy-elevated rounded-3xl p-5 landscape:p-4 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-start justify-between pb-3 border-b border-hy-elevated">
              <div>
                <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-hy-primary/20 text-hy-primary">
                  {selectedExercise.targetMuscle} • {selectedExercise.difficulty}
                </span>
                <h3 className="text-xl font-heading font-black text-white mt-1">
                  {selectedExercise.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExercise(null)}
                aria-label="Close"
                className="w-11 h-11 rounded-xl bg-hy-surface text-hy-text-2 hover:text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 landscape:space-y-0 landscape:grid landscape:grid-cols-12 landscape:gap-4 overflow-y-auto flex-1 pr-1">
              {/* Left Column: Avatar & Quick Info */}
              <div className="space-y-3 landscape:col-span-5">
                {/* ANIMATED AVATAR HERO DISPLAY */}
                <div className="rounded-2xl bg-hy-surface border border-hy-elevated p-3 flex flex-col items-center justify-center">
                  <WorkoutAvatar
                    animationType={selectedExercise.avatarAnimation}
                    anchorPosition={selectedExercise.anchorPosition}
                    exerciseName={selectedExercise.name}
                    bandColorHex="#6EA8FF"
                    size="md"
                  />
                  <span className="text-xs text-hy-text-3 font-bold uppercase mt-1">
                    Technique Demonstration
                  </span>
                </div>

                {/* Verified demo clip (plays in-app) */}
                <button
                  type="button"
                  onClick={() => setVideoFor(selectedExercise)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/15 transition-all text-xs font-bold text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <YoutubeIcon className="w-5 h-5 fill-current text-red-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs uppercase text-red-400 font-black flex items-center gap-2">
                        <span>{getExerciseVideoSource(selectedExercise.id) ? `${getExerciseVideoSource(selectedExercise.id)!.channel} • Video demo` : 'Search YouTube for a demo'}</span>
                        {getExerciseTimestampLabel(selectedExercise.id) && (
                          <span className="px-1.5 rounded bg-red-500 text-white font-mono text-xs">{getExerciseTimestampLabel(selectedExercise.id)}</span>
                        )}
                      </div>
                      <div className="text-hy-text text-xs truncate">
                        {getExerciseVideoCue(selectedExercise.id)
                          ? `${getExerciseVideoCue(selectedExercise.id)!.match === 'exact' ? '' : 'Similar: '}${getExerciseVideoCue(selectedExercise.id)!.label}`
                          : 'No verified clip yet: opens a YouTube search'}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 shrink-0 text-hy-text-2" />
                </button>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-2xl bg-hy-surface border border-hy-elevated">
                    <span className="text-xs uppercase font-bold text-hy-text-3 block">Band Type</span>
                    <span className="text-white font-bold">{selectedExercise.bandType}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-hy-surface border border-hy-elevated">
                    <span className="text-xs uppercase font-bold text-hy-text-3 block">Anchor Setup</span>
                    <span className="text-white font-bold">{selectedExercise.anchorPosition}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Instructions, Cues, Tips */}
              <div className="space-y-3.5 landscape:col-span-7 overflow-y-auto landscape:max-h-[65vh] pr-1">
                <div>
                  <div className="text-xs font-black uppercase text-hy-text-2 mb-2">Instructions</div>
                  <ol className="space-y-2">
                    {selectedExercise.instructions.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-hy-text">
                        <span className="w-5 h-5 rounded-full bg-hy-primary/15 text-hy-primary font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="p-3.5 rounded-2xl bg-hy-surface border border-hy-elevated space-y-2">
                  <div className="text-xs font-bold text-hy-success flex items-center gap-1.5">
                    <Shield className="w-4 h-4" /> Form Cues
                  </div>
                  <ul className="space-y-1 text-sm text-hy-text">
                    {selectedExercise.formCues.map((cue, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-hy-success shrink-0" />
                        <span>{cue}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedExercise.commonMistakes?.length ? (
                  <div className="p-3.5 rounded-2xl bg-hy-surface border border-hy-elevated space-y-2">
                    <div className="text-xs font-bold text-hy-danger">Common mistakes</div>
                    <ul className="space-y-1 text-sm text-hy-text list-disc list-inside">
                      {selectedExercise.commonMistakes.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {(selectedExercise.easierId || selectedExercise.harderId) && (
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ['Easier', selectedExercise.easierId],
                      ['Harder', selectedExercise.harderId],
                    ].map(([label, id]) => {
                      const target = id ? getExerciseById(id) : undefined;
                      return target ? (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setSelectedExercise(target)}
                          className="min-h-[56px] p-3 rounded-2xl bg-hy-surface border border-hy-elevated text-left"
                        >
                          <span className="block text-xs font-bold uppercase text-hy-text-3">{label}</span>
                          <span className="block text-sm font-bold text-hy-text">{target.name}</span>
                        </button>
                      ) : (
                        <div key={label} />
                      );
                    })}
                  </div>
                )}

                {selectedExercise.tips && (
                  <div className="p-3 rounded-2xl bg-hy-primary/10 text-xs text-hy-primary font-medium border border-hy-primary/20">
                    💡 {selectedExercise.tips}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-hy-elevated">
              <button
                onClick={() => setSelectedExercise(null)}
                className="w-full py-3 rounded-2xl bg-hy-primary text-hy-on-primary text-xs font-bold shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
