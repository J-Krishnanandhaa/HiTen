import React, { useState } from 'react';
import { Check, ChevronLeft } from 'lucide-react';
import { UserProfile } from '../../types';
import { SLOVIC_LOOP_BANDS } from '../../data/defaultBands';
import { SCHEDULE_WEEKLY_GOAL } from '../../utils/equipmentManager';
import { bandRangeLabel, KG_TO_LBS } from '../../utils/bands';

interface OnboardingFlowProps {
  profile: UserProfile;
  onComplete: (profile: UserProfile) => void;
}

type Schedule = '4-day' | '5-day' | '6-day';

const TIER_BY_EXPERIENCE: Record<NonNullable<UserProfile['experience']>, 1 | 2 | 3> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

/** One-minute first-run setup that picks the split, difficulty and session length. */
export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ profile, onComplete }) => {
  const [step, setStep] = useState(0);
  const [hasBands, setHasBands] = useState(profile.hasResistanceBands !== false);
  const [hasBar, setHasBar] = useState(profile.hasPullUpBar !== false);
  const [bandIds, setBandIds] = useState<string[]>(SLOVIC_LOOP_BANDS.map(b => b.id));
  const [goal, setGoal] = useState<UserProfile['fitnessGoal']>(profile.fitnessGoal);
  const [schedule, setSchedule] = useState<Schedule>('4-day');
  const [minutes, setMinutes] = useState(profile.targetWorkoutDurationMins || 20);
  const [experience, setExperience] = useState<NonNullable<UserProfile['experience']>>(profile.experience || 'beginner');
  const [unit, setUnit] = useState<'kg' | 'lbs'>(profile.unitSystem);
  const [weightInput, setWeightInput] = useState<string>(
    String(profile.unitSystem === 'lbs' ? Math.round(profile.weightKg * KG_TO_LBS) : profile.weightKg)
  );

  const finish = (skip = false) => {
    const weight = parseFloat(weightInput);
    const weightKg = weight > 0 ? (unit === 'lbs' ? Math.round((weight / KG_TO_LBS) * 10) / 10 : weight) : profile.weightKg;
    try {
      localStorage.setItem('bandfit_schedule_mode', schedule);
      localStorage.setItem('bandfit_workday_tier', String(TIER_BY_EXPERIENCE[experience]));
    } catch {
      /* ignore */
    }
    onComplete(
      skip
        ? { ...profile, onboarded: true }
        : {
            ...profile,
            onboarded: true,
            hasResistanceBands: hasBands,
            hasPullUpBar: hasBar,
            ownedBands: hasBands
              ? SLOVIC_LOOP_BANDS.filter(b => bandIds.includes(b.id)).map(b => ({ ...b })).concat(
                  profile.ownedBands.filter(b => b.brand === 'Custom')
                )
              : profile.ownedBands,
            fitnessGoal: goal,
            weeklyGoal: SCHEDULE_WEEKLY_GOAL[schedule],
            targetWorkoutDurationMins: minutes,
            experience,
            unitSystem: unit,
            weightKg,
          }
    );
  };

  const steps = [
    {
      title: 'What equipment do you have?',
      body: (
        <div className="grid grid-cols-1 gap-2">
          <Toggle on={hasBands} onClick={() => setHasBands(v => !v)} label="Loop resistance bands" sub="Door anchor or under-foot" />
          <Toggle on={hasBar} onClick={() => setHasBar(v => !v)} label="Pull-up bar" sub="Doorway or wall-mounted" />
          <p className="text-sm text-hy-text-2">No equipment? Leave both off: you'll get bodyweight workouts.</p>
        </div>
      ),
      skip: false,
    },
    {
      title: 'Which bands do you own?',
      body: (
        <div className="space-y-2">
          {SLOVIC_LOOP_BANDS.map(b => (
            <Toggle
              key={b.id}
              on={bandIds.includes(b.id)}
              onClick={() => setBandIds(ids => (ids.includes(b.id) ? ids.filter(i => i !== b.id) : [...ids, b.id]))}
              label={b.name.replace(/\s*\(.*\)/, '')}
              sub={`Rated ${bandRangeLabel(b, unit)}`}
              swatch={b.colorHex}
            />
          ))}
          <p className="text-sm text-hy-text-2">Tip: try 10 slow curls with each band. You can add other bands later under Me.</p>
        </div>
      ),
      skip: !hasBands,
    },
    {
      title: "What's your main goal?",
      body: (
        <div className="grid grid-cols-1 gap-2">
          <Choice on={goal === 'muscle_gain'} onClick={() => setGoal('muscle_gain')} label="Build muscle" />
          <Choice on={goal === 'maintenance'} onClick={() => setGoal('maintenance')} label="Get stronger and stay fit" />
          <Choice on={goal === 'fat_loss'} onClick={() => setGoal('fat_loss')} label="Lose fat" />
        </div>
      ),
      skip: false,
    },
    {
      title: 'How often can you train?',
      body: (
        <div className="grid grid-cols-1 gap-2">
          <Choice on={schedule === '4-day'} onClick={() => setSchedule('4-day')} label="4 days a week" sub="Push, Pull, Legs, Full Body (+ optional core)" />
          <Choice on={schedule === '5-day'} onClick={() => setSchedule('5-day')} label="5 days a week" sub="Push, Pull, Legs, Upper, Lower" />
          <Choice on={schedule === '6-day'} onClick={() => setSchedule('6-day')} label="6 days a week" sub="Push, Pull, Legs, twice" />
        </div>
      ),
      skip: false,
    },
    {
      title: 'How long per session?',
      body: (
        <div className="grid grid-cols-3 gap-2">
          {[10, 15, 20, 25, 30, 40].map(m => (
            <Choice key={m} on={minutes === m} onClick={() => setMinutes(m)} label={`${m} min`} />
          ))}
        </div>
      ),
      skip: false,
    },
    {
      title: 'How experienced are you?',
      body: (
        <div className="grid grid-cols-1 gap-2">
          <Choice on={experience === 'beginner'} onClick={() => setExperience('beginner')} label="New or returning" sub="Starts on Light workouts" />
          <Choice on={experience === 'intermediate'} onClick={() => setExperience('intermediate')} label="Training regularly for 6+ months" sub="Starts on Standard" />
          <Choice on={experience === 'advanced'} onClick={() => setExperience('advanced')} label="2+ years of consistent training" sub="Starts on Hard" />
        </div>
      ),
      skip: false,
    },
    {
      title: 'Your body weight',
      body: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Choice on={unit === 'kg'} onClick={() => setUnit('kg')} label="kg" />
            <Choice on={unit === 'lbs'} onClick={() => setUnit('lbs')} label="lbs" />
          </div>
          <label className="block">
            <span className="text-sm text-hy-text-2">Weight ({unit})</span>
            <input
              type="number"
              inputMode="decimal"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              className="mt-1 w-full min-h-[48px] rounded-2xl bg-hy-surface border border-hy-border px-4 text-lg font-bold text-hy-text"
            />
          </label>
          <p className="text-sm text-hy-text-2">Only used to estimate calories. It stays on this device.</p>
        </div>
      ),
      skip: false,
    },
  ];

  const visible = steps.filter(s => !s.skip);
  const current = visible[Math.min(step, visible.length - 1)];
  const isLast = step >= visible.length - 1;

  return (
    <div className="fixed inset-0 z-[60] bg-hy-bg text-hy-text overflow-y-auto">
      <div className="max-w-md mx-auto min-h-full p-5 flex flex-col">
        <div className="flex items-center justify-between">
          {step > 0 ? (
            <button type="button" onClick={() => setStep(s => s - 1)} aria-label="Back" className="w-11 h-11 rounded-xl bg-hy-surface flex items-center justify-center">
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <span className="text-sm font-black text-hy-volt">Welcome to HyTen</span>
          )}
          <button type="button" onClick={() => finish(true)} className="min-h-[44px] px-3 text-sm text-hy-text-2 font-semibold">
            Skip setup
          </button>
        </div>

        <div className="flex gap-1.5 mt-4" aria-hidden="true">
          {visible.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-hy-primary' : 'bg-hy-elevated'}`} />
          ))}
        </div>

        <h1 className="text-2xl font-heading font-black mt-6 mb-4">{current.title}</h1>
        <div className="flex-1">{current.body}</div>

        <button
          type="button"
          onClick={() => (isLast ? finish() : setStep(s => s + 1))}
          className="mt-6 w-full min-h-[56px] rounded-2xl bg-hy-primary text-hy-on-primary font-black text-base"
        >
          {isLast ? 'Build my plan' : 'Next'}
        </button>
      </div>
    </div>
  );
};

const Toggle: React.FC<{ on: boolean; onClick: () => void; label: string; sub?: string; swatch?: string }> = ({ on, onClick, label, sub, swatch }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={on}
    onClick={onClick}
    className={`w-full min-h-[56px] rounded-2xl border px-4 py-3 text-left flex items-center gap-3 ${on ? 'bg-hy-elevated border-hy-primary' : 'bg-hy-surface border-hy-elevated'}`}
  >
    {swatch && <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: swatch }} />}
    <span className="flex-1">
      <span className="block font-bold">{label}</span>
      {sub && <span className="block text-sm text-hy-text-2">{sub}</span>}
    </span>
    <span className={`w-6 h-6 rounded-md flex items-center justify-center ${on ? 'bg-hy-primary text-hy-on-primary' : 'border border-hy-border'}`}>
      {on && <Check className="w-4 h-4" />}
    </span>
  </button>
);

const Choice: React.FC<{ on: boolean; onClick: () => void; label: string; sub?: string }> = ({ on, onClick, label, sub }) => (
  <button
    type="button"
    role="radio"
    aria-checked={on}
    onClick={onClick}
    className={`w-full min-h-[52px] rounded-2xl border px-4 py-3 text-left ${on ? 'bg-hy-elevated border-hy-primary' : 'bg-hy-surface border-hy-elevated'}`}
  >
    <span className="block font-bold">{label}</span>
    {sub && <span className="block text-sm text-hy-text-2">{sub}</span>}
  </button>
);
