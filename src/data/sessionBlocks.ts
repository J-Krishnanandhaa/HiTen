/**
 * Warm-up, cool-down and conditioning blocks that wrap each session.
 * Every block is a list of timed moves the player steps through.
 */

export interface TimedMove {
  name: string;
  seconds: number;
  cue: string;
  /** Needs a band / bar to do as written. */
  needs?: 'band' | 'bar';
  /** Shown instead when the equipment is missing. */
  fallback?: { name: string; cue: string };
}

export type DayFocus = 'push' | 'pull' | 'legs' | 'core' | 'full';

/** Map a routine category to the warm-up it needs. */
export function focusFor(category?: string): DayFocus {
  const c = (category || '').toLowerCase();
  if (c.includes('push') || c.includes('upper')) return c.includes('upper') ? 'full' : 'push';
  if (c.includes('pull')) return 'pull';
  if (c.includes('leg') || c.includes('lower')) return 'legs';
  if (c.includes('core')) return 'core';
  return 'full';
}

const WRIST_ROCKS: TimedMove = { name: 'Wrist rocks', seconds: 30, cue: 'Hands flat, rock forward and back, then side to side.' };
const ARM_CIRCLES: TimedMove = { name: 'Arm circles', seconds: 30, cue: '10 forward, 10 back. Grow the circles.' };
const DISLOCATES: TimedMove = {
  name: 'Band dislocates',
  seconds: 40,
  cue: 'Wide grip on a light band, straight arms over and behind, slow.',
  needs: 'band',
  fallback: { name: 'Towel dislocates', cue: 'Same move with a towel held wide.' },
};
const SCAP_PULLS: TimedMove = {
  name: 'Scapular pulls',
  seconds: 40,
  cue: 'Hang from the bar, arms straight. Pull shoulders down, then relax.',
  needs: 'bar',
  fallback: { name: 'Prone Y-raises', cue: 'Lie face down, lift arms in a Y, squeeze shoulder blades.' },
};
const DEAD_HANG: TimedMove = {
  name: 'Active dead hang',
  seconds: 20,
  cue: 'Hang with shoulders pulled down and ribs tucked.',
  needs: 'bar',
  fallback: { name: 'Doorframe lat stretch', cue: 'Hold a doorframe, sink the hips back.' },
};
const SCAP_PUSHUPS: TimedMove = { name: 'Scapular push-ups', seconds: 30, cue: 'Arms straight, let the chest sink, then push the floor away.' };
const LEG_SWINGS: TimedMove = { name: 'Leg swings', seconds: 40, cue: '10 front-to-back, 10 side-to-side each leg.' };
const HIP_CIRCLES: TimedMove = { name: 'Hip circles', seconds: 30, cue: 'Hands on hips, big slow circles both ways.' };
const GOOD_MORNINGS: TimedMove = { name: 'Bodyweight good mornings', seconds: 30, cue: 'Hands behind head, hinge until you feel the hamstrings.' };
const AIR_SQUATS: TimedMove = { name: 'Air squats', seconds: 30, cue: 'Slow and deep, knees out.' };
const GLUTE_BRIDGES: TimedMove = { name: 'Glute bridges', seconds: 30, cue: 'Squeeze at the top for a second.' };
const CAT_COW: TimedMove = { name: 'Cat-cow', seconds: 30, cue: 'On all fours, round then arch the spine with your breath.' };
const WORLDS_GREATEST: TimedMove = { name: "World's greatest stretch", seconds: 40, cue: 'Lunge, elbow to instep, rotate the arm up. Alternate.' };
const INCHWORMS: TimedMove = { name: 'Inchworms', seconds: 30, cue: 'Walk hands out to a plank and back.' };

/** About 3 minutes each, built around the joints the day loads. */
export const WARMUPS: Record<DayFocus, TimedMove[]> = {
  push: [WRIST_ROCKS, ARM_CIRCLES, DISLOCATES, SCAP_PUSHUPS, INCHWORMS],
  pull: [WRIST_ROCKS, ARM_CIRCLES, DISLOCATES, SCAP_PULLS, DEAD_HANG],
  legs: [LEG_SWINGS, HIP_CIRCLES, GOOD_MORNINGS, AIR_SQUATS, GLUTE_BRIDGES],
  core: [CAT_COW, WORLDS_GREATEST, HIP_CIRCLES, INCHWORMS, GLUTE_BRIDGES],
  full: [WRIST_ROCKS, DISLOCATES, WORLDS_GREATEST, AIR_SQUATS, INCHWORMS],
};

/** About 3 minutes of static stretches after the session. */
export const COOLDOWN: TimedMove[] = [
  { name: 'Doorway chest stretch', seconds: 30, cue: 'Forearm on the frame, step through gently.' },
  { name: "Child's pose lat reach", seconds: 30, cue: 'Sit back on heels, walk hands to one side, then the other.' },
  { name: 'Seated hamstring stretch', seconds: 40, cue: 'Legs straight, hinge forward from the hips.' },
  { name: 'Couch quad stretch', seconds: 40, cue: 'Back knee down, foot up on a sofa or wall. 20 s each side.' },
  { name: 'Figure-4 glute stretch', seconds: 40, cue: 'Ankle over knee, pull the leg in. 20 s each side.' },
];

/** Resolve equipment fallbacks for the user's gear. */
export function resolveMoves(moves: TimedMove[], gear: { bands: boolean; bar: boolean }): TimedMove[] {
  return moves.map(m => {
    const missing = (m.needs === 'band' && !gear.bands) || (m.needs === 'bar' && !gear.bar);
    return missing && m.fallback ? { ...m, name: m.fallback.name, cue: m.fallback.cue, needs: undefined } : m;
  });
}

export const blockSeconds = (moves: TimedMove[]) => moves.reduce((t, m) => t + m.seconds, 0);

// --- Conditioning finishers ---------------------------------------------------

export interface FinisherMove {
  exerciseId: string;
  name: string;
  reps: number;
}

export interface Finisher {
  kind: 'emom' | 'amrap';
  title: string;
  minutes: number;
  moves: FinisherMove[];
  how: string;
}

type Mode = 'hybrid' | 'bands-only' | 'bar-only' | 'no-equipment';

/**
 * Density blocks for the leanness goal. EMOM: start the listed reps at the top
 * of every minute, alternating moves, and rest for what's left of the minute.
 * AMRAP: as many rounds of the circuit as possible in the time.
 */
export function finishersFor(mode: Mode): Finisher[] {
  const band = mode === 'hybrid' || mode === 'bands-only';
  const bar = mode === 'hybrid' || mode === 'bar-only';
  const emom: FinisherMove[] = band
    ? [
        { exerciseId: 'band-thruster', name: 'Band thrusters', reps: 10 },
        { exerciseId: 'bodyweight-pushup-standard', name: 'Push-ups', reps: 10 },
      ]
    : bar
    ? [
        { exerciseId: 'bar-hanging-leg-raise', name: 'Hanging knee raises', reps: 10 },
        { exerciseId: 'bodyweight-pushup-standard', name: 'Push-ups', reps: 10 },
      ]
    : [
        { exerciseId: 'bodyweight-full-burpees', name: 'Burpees', reps: 8 },
        { exerciseId: 'bodyweight-jump-squats', name: 'Jump squats', reps: 12 },
      ];
  const amrap: FinisherMove[] = [
    { exerciseId: 'bodyweight-mountain-climbers', name: 'Mountain climbers', reps: 20 },
    { exerciseId: 'bodyweight-air-squat', name: 'Air squats', reps: 15 },
    band
      ? { exerciseId: 'band-pull-apart', name: 'Band pull-aparts', reps: 15 }
      : { exerciseId: 'bodyweight-superman-pulses', name: 'Supermans', reps: 10 },
  ];
  return [
    { kind: 'emom', title: 'EMOM 6', minutes: 6, moves: emom, how: 'Every minute: do the reps, rest the remainder. Alternate moves.' },
    { kind: 'amrap', title: 'AMRAP 5', minutes: 5, moves: amrap, how: 'As many rounds as possible in 5 minutes.' },
  ];
}

/** Rowan Row's stretch section (39:48) and warm-up (0:57) as follow-along videos. */
export const COOLDOWN_VIDEO = 'https://youtu.be/cDq-nFmD0rI?t=2388';
export const WARMUP_VIDEO = 'https://youtu.be/cDq-nFmD0rI?t=57';
