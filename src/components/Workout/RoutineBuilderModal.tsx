import React, { useState } from 'react';
import { X, Plus, Trash2, Check } from 'lucide-react';
import { Routine, RoutineExercise, MuscleGroup } from '../../types';
import { EXERCISE_DATABASE } from '../../data/exerciseDatabase';

interface RoutineBuilderModalProps {
  onSave: (routine: Routine) => void;
  onClose: () => void;
  existingRoutine?: Routine | null;
}

export const RoutineBuilderModal: React.FC<RoutineBuilderModalProps> = ({
  onSave,
  onClose,
  existingRoutine,
}) => {
  const [name, setName] = useState(existingRoutine?.name || '');
  const [description, setDescription] = useState(existingRoutine?.description || '');
  const [level, setLevel] = useState<Routine['level']>(existingRoutine?.level || 'Intermediate');
  const [exercises, setExercises] = useState<RoutineExercise[]>(existingRoutine?.exercises || [
    { exerciseId: 'chest-press-standing', sets: 3, targetReps: 12, targetRestSeconds: 45 },
    { exerciseId: 'bent-over-row-feet', sets: 3, targetReps: 12, targetRestSeconds: 45 },
  ]);

  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('All');
  const [showAddDrawer, setShowAddDrawer] = useState(false);

  const muscleFilters = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Glutes', 'Core'];

  const filteredLibrary = EXERCISE_DATABASE.filter(ex => {
    if (selectedMuscleFilter === 'All') return true;
    return ex.targetMuscle === selectedMuscleFilter;
  });

  const handleAddExercise = (exerciseId: string) => {
    setExercises(prev => [
      ...prev,
      { exerciseId, sets: 3, targetReps: 12, targetRestSeconds: 45 }
    ]);
    setShowAddDrawer(false);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof RoutineExercise, value: number) => {
    setExercises(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a routine name.');
      return;
    }
    if (exercises.length === 0) {
      alert('Please add at least one exercise.');
      return;
    }

    const targetMusclesSet = new Set<MuscleGroup>();
    exercises.forEach(re => {
      const ex = EXERCISE_DATABASE.find(e => e.id === re.exerciseId);
      if (ex) targetMusclesSet.add(ex.targetMuscle);
    });

    const newRoutine: Routine = {
      id: existingRoutine?.id || 'custom-' + Date.now(),
      name: name.trim(),
      description: description.trim() || 'Custom home resistance band workout routine.',
      level,
      estimatedDurationMins: Math.max(10, exercises.length * 4),
      targetMuscles: Array.from(targetMusclesSet),
      exercises,
      isCustom: true,
    };

    onSave(newRoutine);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#12161A] border border-[#242C35] rounded-3xl p-5 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[#242C35]">
          <h3 className="text-base font-bold text-white">Create Custom Routine</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-3 space-y-3 overflow-y-auto flex-1 pr-1">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Routine Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Upper Body Blast"
              className="w-full px-3 py-2 bg-[#1A2026] border border-[#242C35] rounded-xl text-white text-xs font-bold focus:border-[#2979FF] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as Routine['level'])}
                className="w-full px-2.5 py-1.5 bg-[#1A2026] border border-[#242C35] rounded-xl text-xs text-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief focus note"
                className="w-full px-2.5 py-1.5 bg-[#1A2026] border border-[#242C35] rounded-xl text-xs text-white"
              />
            </div>
          </div>

          {/* Exercises */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Exercises ({exercises.length})
              </span>
              <button
                type="button"
                onClick={() => setShowAddDrawer(true)}
                className="px-2 py-0.5 rounded-lg bg-[#2979FF] text-white text-[10px] font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>

            <div className="space-y-2">
              {exercises.map((re, index) => {
                const ex = EXERCISE_DATABASE.find(e => e.id === re.exerciseId);
                return (
                  <div key={index} className="p-2.5 rounded-xl bg-[#1A2026] border border-[#242C35] text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white line-clamp-1">{ex?.name || 'Exercise'}</span>
                      <button
                        onClick={() => handleRemoveExercise(index)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block">Sets</span>
                        <input
                          type="number"
                          value={re.sets === undefined || re.sets === null ? '' : re.sets}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleUpdate(index, 'sets', val === '' ? ('' as any) : parseInt(val));
                          }}
                          onBlur={() => {
                            if (!re.sets || isNaN(Number(re.sets)) || Number(re.sets) < 1) {
                              handleUpdate(index, 'sets', 3);
                            }
                          }}
                          className="w-full bg-[#12161A] border border-[#2D3748] rounded px-1.5 py-0.5 text-center font-bold text-white text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block">Reps</span>
                        <input
                          type="number"
                          value={re.targetReps === undefined || re.targetReps === null ? '' : re.targetReps}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleUpdate(index, 'targetReps', val === '' ? ('' as any) : parseInt(val));
                          }}
                          onBlur={() => {
                            if (!re.targetReps || isNaN(Number(re.targetReps)) || Number(re.targetReps) < 1) {
                              handleUpdate(index, 'targetReps', 10);
                            }
                          }}
                          className="w-full bg-[#12161A] border border-[#2D3748] rounded px-1.5 py-0.5 text-center font-bold text-white text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block">Rest (s)</span>
                        <input
                          type="number"
                          value={re.targetRestSeconds === undefined || re.targetRestSeconds === null ? '' : re.targetRestSeconds}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleUpdate(index, 'targetRestSeconds', val === '' ? ('' as any) : parseInt(val));
                          }}
                          onBlur={() => {
                            if (!re.targetRestSeconds || isNaN(Number(re.targetRestSeconds)) || Number(re.targetRestSeconds) < 5) {
                              handleUpdate(index, 'targetRestSeconds', 30);
                            }
                          }}
                          className="w-full bg-[#12161A] border border-[#2D3748] rounded px-1.5 py-0.5 text-center font-bold text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drawer for selecting exercise */}
        {showAddDrawer && (
          <div className="absolute inset-0 bg-[#12161A] rounded-3xl p-4 flex flex-col z-20 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-[#242C35]">
              <span className="text-xs font-bold text-white">Select Exercise</span>
              <button onClick={() => setShowAddDrawer(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-1 py-2 overflow-x-auto">
              {muscleFilters.map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMuscleFilter(m)}
                  className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                    selectedMuscleFilter === m ? 'bg-[#2979FF] text-white' : 'bg-[#1A2026] text-slate-400'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredLibrary.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => handleAddExercise(ex.id)}
                  className="w-full text-left p-2.5 rounded-xl bg-[#1A2026] hover:bg-[#242C35] flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-white">{ex.name}</span>
                  <Plus className="w-3.5 h-3.5 text-[#2979FF]" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-[#242C35] flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 text-xs text-slate-400 font-bold">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#2979FF] text-white text-xs font-bold shadow-md shadow-[#2979FF]/30 flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};
