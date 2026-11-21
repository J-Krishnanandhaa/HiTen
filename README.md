# HyTen

**Hybrid Tension training: progressive overload for resistance bands, a pull-up bar and bodyweight.**

HyTen is an offline-first workout app for people who train at home with loop bands, a doorway pull-up bar, or nothing at all. It plans the week, runs each session set by set, remembers what you did last time, and tells you when to step up a band.

React 18 · TypeScript · Vite · Tailwind CSS · Capacitor (Android)

---

## What it does

### Plans that fit your gear
- **Four equipment modes:** bands + bar, bands only, bar only, or no equipment. Turning gear on or off swaps every exercise for a compatible one.
- **Three weekly splits:**

  | Split | Days |
  | --- | --- |
  | 4-day | Push, Pull, Legs, Full Body (+ optional Core) |
  | 5-day | Push, Pull, Legs, Upper (push/pull supersets), Lower & Core |
  | 6-day | Push A, Pull A, Legs A, Push B, Pull B, Legs B + Core |

- **Light / Standard / Hard** versions of every day, and a **duration scaler** from 10 to 40 minutes.
- **Balanced weekly volume:** calf work on every legs and full-body day, real rows on no-equipment pull days, and weekly sets per muscle shown against a 12–20 set target.
- **7x4 Challenge:** a 28-day full-body programme with real progress tracking.

### A player built for supersets
- Paired exercises alternate **A1 → A2 → A1 → A2**, with a short transition between them and the full rest after each pair.
- An optional 3-minute warm-up, timed holds, mid-workout exercise swaps, and voice and haptic cues.
- Timers use real end times, so locking your phone doesn't stall them. The screen stays awake where the device supports it.
- Ending early offers **Save what I did** or **Discard**.

### Progressive overload
- A **Previous** line shows last session's reps and band for each exercise.
- After each set, a one-tap **"reps left in the tank"** rating.
- **Suggestions:** reach the top of the rep range with 2 or fewer reps left, and the app suggests the next band. For assisted pull-ups and dips, a *lighter* band counts as progress. You get a banner when you beat your best.
- **Progression ladders** link easier and harder variations (push-up, pull-up, squat, dip and row).
- A **deload reminder** after 6 straight training weeks.

### Verified demo videos
Each exercise links to the second its demonstration starts. Every timestamp was checked against the source videos' chapters and transcripts. Clips are graded *exact*, *close* or *variant*, and play inside the app.

| Source | Video |
| --- | --- |
| THENX | [20 Best Exercises You Can Do With A Resistance Band](https://youtu.be/hQ2lHMP4kco) |
| Fitness My Life | [Full Body Workout With Resistance Bands, Session 7](https://youtu.be/njGZClD94bg) |
| Tom Peto Training | [20 Min Full Body Resistance Band Workout](https://youtu.be/sTueHjRCMaQ) |
| Rowan Row | [The Ultimate 45 Min Full Body Workout](https://youtu.be/cDq-nFmD0rI) |

Exercises with no verified clip open a YouTube search instead of a wrong timestamp.

### Progress and data
- The Report tab shows personal bests, sets per muscle this week, a workout calendar and full history.
- Band loads are shown as **rated**, at the midpoint of each band's printed range, because real tension depends on stretch. Loads are stored in lbs and shown in your unit.
- Calories are **estimates** from the 2024 Compendium of Physical Activities, by session type.
- **No account, no tracking.** Data stays on the device. Export or import a JSON backup from the **Me** tab; backups are validated before anything is replaced.

---

## Project structure

```
src/
├── App.tsx                     # Tabs, first-run setup, player overlay
├── components/
│   ├── Common/                 # Avatar animation, confirm sheet, in-app video sheet
│   ├── ExerciseLibrary/        # Library, ladders, common mistakes
│   ├── History/                # Report tab + progress panel
│   ├── Onboarding/             # First-run setup
│   ├── Settings/               # Profile, equipment, bands, backups
│   └── Workout/                # Today screen, player, routine builder
├── data/
│   ├── exerciseDatabase.ts     # Exercises + verified video cues
│   ├── extraExercises.ts       # Added movements, ladders, form mistakes
│   ├── prebuiltWorkouts.ts     # Hand-written base routines
│   └── routineVariants.ts      # Split variants and programming fixes
└── utils/
    ├── sessionQueue.ts         # Superset set order and rests
    ├── progression.ts          # Rep ranges, suggestions, deloads
    ├── streak.ts               # Weekly streak against the plan
    ├── bands.ts                # Band ranges, stacking, units
    ├── equipmentManager.ts     # Equipment modes, schedules, substitutions
    ├── routineScaler.ts        # 10–40 minute scaling
    └── storage.ts              # Versioned local storage, migration, backups
tests/                          # Node test runner suites
```

---

## Getting started

Requires Node.js 18+ (CI uses 22).

```bash
npm install
npm run dev        # http://localhost:5174 (add -- --host to open on your phone)
npm run build      # typecheck + production build into dist/
npm test           # unit tests for routines, video cues, progression and storage
```

### Android

```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
# android/app/build/outputs/apk/debug/app-debug.apk
```

Install on a connected device with `adb install -r app-debug.apk`.

> The `HyTen.apk` in the repository was built before these changes. Rebuild it, or attach new builds to a GitHub Release instead of committing them.

---

## Upgrading from 1.0

On first launch, 1.1 copies your data from the old `bandfit_*` storage keys to versioned `hyten_*` keys. Workouts logged in kg are converted to the new lbs storage, and the old keys are kept as a fallback. Existing users skip the setup screen.

## License

MIT
