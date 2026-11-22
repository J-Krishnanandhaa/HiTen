import React, { useMemo, useState } from 'react';
import { useBackClose } from '../../utils/backStack';
import { Search, SlidersHorizontal, ArrowLeft, X, ExternalLink } from 'lucide-react';
import { Exercise, UserProfile, WorkoutSessionLog } from '../../types';
import {
  EXERCISE_DATABASE, getExerciseById, getExerciseVideoCue, getExerciseYoutubeUrl, VIDEO_SOURCES,
} from '../../data/exerciseDatabase';
import { describeTempo } from '../../data/extraExercises';
import { HOW_TO } from '../../data/howTo';
import { WorkoutAvatar } from '../Common/WorkoutAvatar';

const MUSCLES = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core', 'Full Body'];
type Gear = 'All' | 'Bands' | 'Bar' | 'None';
const GEAR: { id: Gear; label: string }[] = [
  { id: 'All', label: 'Any gear' }, { id: 'Bands', label: 'Bands' }, { id: 'Bar', label: 'Pull-up bar' }, { id: 'None', label: 'No gear' },
];

const LEVEL: Record<Exercise['difficulty'], { label: string; cls: string }> = {
  Beginner: { label: 'Easy', cls: 'text-hy-success bg-hy-success/10' },
  Intermediate: { label: 'Medium', cls: 'text-hy-warning bg-hy-warning/10' },
  Advanced: { label: 'Hard', cls: 'text-hy-danger bg-hy-danger/10' },
};

const gearLine = (ex: Exercise) =>
  ex.requiresBand && ex.requiresBar ? 'Band + pull-up bar'
    : ex.requiresBar ? 'Pull-up bar'
      : ex.requiresBand ? `Band · ${ex.anchorPosition}`
        : 'No equipment';

const Thumb: React.FC<{ ex: Exercise }> = ({ ex }) => (
  <div className="w-14 h-14 rounded-2xl bg-hy-bg-2 overflow-hidden flex items-center justify-center shrink-0">
    <div className="scale-[0.58]">
      <WorkoutAvatar animationType={ex.avatarAnimation} anchorPosition={ex.anchorPosition} exerciseName={ex.name} size="sm" isPaused />
    </div>
  </div>
);

interface Props {
  workoutLogs?: WorkoutSessionLog[];
  userProfile?: UserProfile;
}

/** Best set (reps, or seconds for holds) from each of the last 7 sessions that included the exercise. */
const progressFor = (ex: Exercise, logs: WorkoutSessionLog[]) =>
  logs
    .filter(l => l.exercises.some(e => e.exerciseId === ex.id))
    .slice(0, 7)
    .reverse()
    .map(l => {
      const sets = l.exercises.find(e => e.exerciseId === ex.id)!.sets.filter(s => s.completed);
      const best = Math.max(0, ...sets.map(s => (ex.isTimed ? s.seconds ?? s.reps : s.reps)));
      return { date: new Date(l.date), best };
    });

export const ExerciseLibraryView: React.FC<Props> = ({ workoutLogs = [] }) => {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [showGear, setShowGear] = useState(false);
  const [muscle, setMuscle] = useState('All');
  const [gear, setGear] = useState<Gear>('All');
  const [selected, setSelected] = useState<Exercise | null>(null);

  const list = useMemo(() => EXERCISE_DATABASE.filter(ex => {
    const q = query.trim().toLowerCase();
    if (q && !ex.name.toLowerCase().includes(q) && !ex.targetMuscle.toLowerCase().includes(q)) return false;
    if (muscle !== 'All' && ex.targetMuscle !== muscle) return false;
    if (gear === 'Bands' && !ex.requiresBand) return false;
    if (gear === 'Bar' && !ex.requiresBar) return false;
    if (gear === 'None' && (ex.requiresBand || ex.requiresBar)) return false;
    return true;
  }), [query, muscle, gear]);

  const muscles = MUSCLES.filter(m => m === 'All' || EXERCISE_DATABASE.some(e => e.targetMuscle === m));

  return (
    <div className="space-y-5 animate-fadeIn">
      <header className="flex items-center gap-2 pt-2">
        {searching ? (
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-hy-text-3" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search exercises"
              className="w-full h-11 pl-10 pr-4 rounded-full bg-hy-surface text-sm text-hy-text placeholder:text-hy-text-3 focus:outline-none focus:ring-1 focus:ring-hy-border"
            />
          </div>
        ) : (
          <h1 className="flex-1 text-2xl font-bold text-hy-text">Exercises</h1>
        )}
        <button type="button" onClick={() => { setSearching(!searching); if (searching) setQuery(''); }}
          aria-label={searching ? 'Close search' : 'Search'}
          className="w-11 h-11 rounded-full bg-hy-surface flex items-center justify-center text-hy-text-2">
          {searching ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
        </button>
        <button type="button" onClick={() => setShowGear(!showGear)} aria-label="Filter by equipment" aria-pressed={showGear}
          className={`w-11 h-11 rounded-full flex items-center justify-center ${gear !== 'All' || showGear ? 'bg-hy-primary text-hy-on-primary' : 'bg-hy-surface text-hy-text-2'}`}>
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </header>

      {showGear && (
        <div className="flex gap-2 overflow-x-auto -mx-3 px-3 no-scrollbar">
          {GEAR.map(g => (
            <button key={g.id} type="button" onClick={() => setGear(g.id)}
              className={`h-9 px-4 rounded-full text-xs font-semibold whitespace-nowrap border ${
                gear === g.id ? 'border-hy-text text-hy-text' : 'border-hy-border text-hy-text-2'
              }`}>
              {g.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto -mx-3 px-3 no-scrollbar">
        {muscles.map(m => (
          <button key={m} type="button" onClick={() => setMuscle(m)}
            className={`h-10 px-4 rounded-full text-sm font-semibold whitespace-nowrap ${
              muscle === m ? 'bg-hy-primary text-hy-on-primary' : 'bg-hy-surface text-hy-text-2'
            }`}>
            {m}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {list.map(ex => (
          <li key={ex.id}>
            <button type="button" onClick={() => setSelected(ex)} className="w-full flex items-center gap-3 p-2 pr-3 rounded-3xl bg-hy-surface text-left">
              <Thumb ex={ex} />
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-hy-text truncate">{ex.name}</span>
                <span className="block text-xs text-hy-text-3 truncate">{ex.targetMuscle} · {gearLine(ex)}</span>
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${LEVEL[ex.difficulty].cls}`}>{LEVEL[ex.difficulty].label}</span>
            </button>
          </li>
        ))}
        {list.length === 0 && <li className="text-sm text-hy-text-3 text-center py-10">No matches</li>}
      </ul>

      {selected && <ExerciseDetail ex={selected} logs={workoutLogs} onOpen={setSelected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export const ExerciseDetail: React.FC<{
  ex: Exercise; logs: WorkoutSessionLog[]; onOpen: (e: Exercise) => void; onClose: () => void;
}> = ({ ex, logs, onOpen, onClose }) => {
  useBackClose(true, onClose);
  const [playing, setPlaying] = useState(false);
  const cue = getExerciseVideoCue(ex.id);
  const source = cue ? VIDEO_SOURCES[cue.source] : undefined;
  const progress = progressFor(ex, logs);
  const peak = Math.max(1, ...progress.map(p => p.best));
  const easier = ex.easierId ? getExerciseById(ex.easierId) : undefined;
  const harder = ex.harderId ? getExerciseById(ex.harderId) : undefined;
  const summary = ex.tips || ex.instructions[0];

  return (
    <div className="fixed inset-0 z-50 bg-hy-bg overflow-y-auto animate-fadeIn" role="dialog" aria-modal="true" aria-label={ex.name}>
      <div className="max-w-xl mx-auto pb-16">
        {/* Video / demo */}
        <div className="relative w-full bg-hy-bg-2" style={{ paddingTop: '72%' }}>
          {playing && source && cue ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${source.id}?start=${cue.start}&autoplay=1&playsinline=1&rel=0`}
              title={`${ex.name} demo`}
              allow="autoplay; encrypted-media; picture-in-picture"
              referrerPolicy="strict-origin"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <WorkoutAvatar animationType={ex.avatarAnimation} anchorPosition={ex.anchorPosition} exerciseName={ex.name} size="lg" />
              {source && (
                <button type="button" onClick={() => setPlaying(true)}
                  className="absolute bottom-4 right-4 h-11 px-4 rounded-full bg-hy-primary text-hy-on-primary text-sm font-bold">
                  Play video
                </button>
              )}
            </div>
          )}
          <button type="button" onClick={onClose} aria-label="Back"
            className="absolute top-4 left-4 w-11 h-11 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 pt-5 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-hy-text">{ex.name}</h1>
            <div className="text-sm text-hy-text-3 mt-1">{gearLine(ex)}</div>
            {summary && <p className="text-sm text-hy-text-2 mt-3">{summary}</p>}
          </div>

          <div className="flex gap-2 flex-wrap text-xs">
            <span className="px-3 py-1.5 rounded-full bg-hy-surface text-hy-text-2">{ex.targetMuscle}</span>
            <span className={`px-3 py-1.5 rounded-full ${LEVEL[ex.difficulty].cls}`}>{LEVEL[ex.difficulty].label}</span>
            {ex.tempo && <span className="px-3 py-1.5 rounded-full bg-hy-surface text-hy-text-2" title={describeTempo(ex.tempo)}>Tempo {ex.tempo}</span>}
          </div>

          <section className="rounded-3xl bg-hy-surface p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-base font-bold text-hy-text">My progress</h2>
              {progress.length > 0 && <span className="text-xs text-hy-text-3">best {ex.isTimed ? 'hold' : 'set'}</span>}
            </div>
            {progress.length ? (
              <div className="flex items-end gap-2 h-32 mt-4" aria-label="Best set in recent sessions">
                {progress.map((p, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-xs text-hy-text-2">{p.best}{ex.isTimed ? 's' : ''}</span>
                    <div className="flex-1 w-full flex items-end">
                      <div className={`w-full rounded-xl ${i === progress.length - 1 ? 'bg-hy-primary' : 'bg-hy-elevated'}`}
                        style={{ height: `${Math.max(8, (p.best / peak) * 100)}%` }} />
                    </div>
                    <span className="text-[10px] text-hy-text-3">{p.date.getDate()}/{p.date.getMonth() + 1}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-hy-text-3 mt-2">Log this exercise to see your progress.</p>
            )}
          </section>

          <HowToSteps ex={ex} />

          {ex.commonMistakes?.length ? (
            <section>
              <h2 className="text-base font-bold text-hy-text mb-2">Avoid</h2>
              <ul className="space-y-1.5 text-sm text-hy-text-2">
                {ex.commonMistakes.map((m, i) => <li key={i}>– {m}</li>)}
              </ul>
            </section>
          ) : null}

          {(easier || harder) && (
            <div className="grid grid-cols-2 gap-2">
              {[['Easier', easier], ['Harder', harder]].map(([label, target]) => target ? (
                <button key={label as string} type="button" onClick={() => onOpen(target as Exercise)}
                  className="p-3 rounded-2xl bg-hy-surface text-left">
                  <span className="block text-xs text-hy-text-3">{label as string}</span>
                  <span className="block text-sm font-semibold text-hy-text">{(target as Exercise).name}</span>
                </button>
              ) : <div key={label as string} />)}
            </div>
          )}

          {!source && (
            <a href={getExerciseYoutubeUrl(ex.id, ex.name)} target="_blank" rel="noopener noreferrer"
              className="h-12 rounded-full bg-hy-surface text-hy-text text-sm font-semibold flex items-center justify-center gap-2">
              <ExternalLink className="w-4 h-4" /> Find a video
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

/** Full written instructions: setup, numbered steps, breathing and what you should feel. */
export const HowToSteps: React.FC<{ ex: Exercise; compact?: boolean }> = ({ ex, compact }) => {
  const h = HOW_TO[ex.id];
  const steps = h?.steps ?? ex.instructions;
  return (
    <section className={compact ? 'space-y-3 text-left' : 'space-y-4'}>
      {!compact && <h2 className="text-base font-bold text-hy-text">How to do it</h2>}
      {h?.setup && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-hy-text-3 mb-1">Set up</div>
          <p className="text-sm text-hy-text-2 leading-relaxed">{h.setup}</p>
        </div>
      )}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-hy-text-3 mb-2">Each rep</div>
        <ol className="space-y-2.5">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-hy-text-2 leading-relaxed">
              <span className="w-6 h-6 rounded-full bg-hy-surface text-hy-text text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
      {h && (
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl bg-hy-surface p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-hy-text-3 mb-1">Breathing</div>
            <p className="text-sm text-hy-text-2 leading-relaxed">{h.breathe}</p>
          </div>
          <div className="rounded-2xl bg-hy-surface p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-hy-text-3 mb-1">You should feel it</div>
            <p className="text-sm text-hy-text-2 leading-relaxed">{h.feel}</p>
          </div>
        </div>
      )}
    </section>
  );
};
