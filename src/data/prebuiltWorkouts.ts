import { Routine } from '../types';
import { expandRoutines } from './routineVariants';

export interface LeapRoutine extends Routine {
  category?: string;
  tier?: 1 | 2 | 3;
  equipmentCategory?: 'hybrid' | 'bands-only' | 'bar-only' | 'no-equipment';
  isPPL?: boolean;
}

const BASE_ROUTINES: LeapRoutine[] = [
  {
    "id": "routine-hybrid-push-1",
    "name": "Hybrid Push Hypertrophy \u26a1",
    "category": "Push",
    "equipmentCategory": "hybrid",
    "tier": 1,
    "description": "Chest, front delts & triceps foundation with paired supersets.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "chest-press-standing",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Controlled 2s lowering"
      },
      {
        "exerciseId": "lateral-deltoid-raise",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Peak delt hold \u2022 25s rest"
      },
      {
        "exerciseId": "incline-chest-press",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Low-to-high clavicular push"
      },
      {
        "exerciseId": "tricep-pushdown-band",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Full elbow extension \u2022 25s rest"
      },
      {
        "exerciseId": "overhead-shoulder-press",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Vertical delt pressing"
      },
      {
        "exerciseId": "chest-fly-middle",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Sternal pec stretch \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-hybrid-push-2",
    "name": "Hybrid Push Hypertrophy \u26a1\u26a1",
    "category": "Push",
    "equipmentCategory": "hybrid",
    "tier": 2,
    "description": "Banded push-up overload, heavy standing press & tricep burnout.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "chest-pushup-banded",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Banded floor push overload"
      },
      {
        "exerciseId": "lateral-deltoid-raise",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Strict lateral delt pump \u2022 25s rest"
      },
      {
        "exerciseId": "chest-press-standing",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Squeeze pecs hard at lockout"
      },
      {
        "exerciseId": "overhead-tricep-extension",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Deep tricep long-head stretch \u2022 25s rest"
      },
      {
        "exerciseId": "overhead-shoulder-press",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Controlled 2s descent"
      },
      {
        "exerciseId": "incline-chest-press",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Upper chest fly/press finish \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-hybrid-push-3",
    "name": "Hybrid Push Power & Levers \u26a1\u26a1\u26a1",
    "category": "Push",
    "equipmentCategory": "hybrid",
    "tier": 3,
    "description": "Unilateral archer push-ups, heavy pike presses & explosive overload.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "banded-archer-pushup",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Asymmetric unilateral overload"
      },
      {
        "exerciseId": "lateral-deltoid-raise",
        "sets": 3,
        "targetReps": 15,
        "targetRestSeconds": 25,
        "notes": "Pair A2: High-density delt burn \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-pike-pushup",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Vertical pressing strength"
      },
      {
        "exerciseId": "overhead-tricep-extension",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Heavy tricep stretch \u2022 25s rest"
      },
      {
        "exerciseId": "chest-pushup-banded",
        "sets": 3,
        "targetReps": 15,
        "targetRestSeconds": 10,
        "notes": "Pair C1: High-rep banded push-up burnout"
      },
      {
        "exerciseId": "incline-chest-press",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Upper chest hypertrophy finish \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-hybrid-pull-1",
    "name": "Hybrid Pull & Posture \u26a1",
    "category": "Pull",
    "equipmentCategory": "hybrid",
    "tier": 1,
    "description": "Bar lat pulldowns, double band rows & bicep foundation.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bar-band-lat-pulldown",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Vertical lat activation"
      },
      {
        "exerciseId": "reverse-fly-band",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Rear delt posture builder \u2022 25s rest"
      },
      {
        "exerciseId": "bent-over-row-feet",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Horizontal back thickness"
      },
      {
        "exerciseId": "standing-bicep-curl",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Supinated bicep curls \u2022 25s rest"
      },
      {
        "exerciseId": "bar-band-face-pull",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair C1: External rotator cuff health"
      },
      {
        "exerciseId": "hammer-curl-band",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Brachialis forearm builder \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-hybrid-pull-2",
    "name": "Hybrid Pull Overload \u26a1\u26a1",
    "category": "Pull",
    "equipmentCategory": "hybrid",
    "tier": 2,
    "description": "Band-assisted pull-ups, heavy rowing & chin-up supersets.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bar-pullup-assisted",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Strict vertical bar pull"
      },
      {
        "exerciseId": "reverse-fly-band",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Rear delt retraction \u2022 25s rest"
      },
      {
        "exerciseId": "bent-over-row-feet",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Double band heavy row"
      },
      {
        "exerciseId": "bar-chinup-assisted",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Underhand bicep & lat pull \u2022 25s rest"
      },
      {
        "exerciseId": "seated-face-pull",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Rotator cuff stability"
      },
      {
        "exerciseId": "hammer-curl-band",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Forearm & bicep peak pump \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-hybrid-pull-3",
    "name": "Hybrid Strict Pull-Up Mastery \u26a1\u26a1\u26a1",
    "category": "Pull",
    "equipmentCategory": "hybrid",
    "tier": 3,
    "description": "Strict bodyweight pull-ups, single-arm lat rows & long-head bicep stretch.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bar-pullup-strict",
        "sets": 3,
        "targetReps": 8,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Strict dead-stop pull-ups"
      },
      {
        "exerciseId": "bar-band-face-pull",
        "sets": 3,
        "targetReps": 15,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Scapular retraction \u2022 25s rest"
      },
      {
        "exerciseId": "single-arm-lat-row",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Unilateral lat extension"
      },
      {
        "exerciseId": "behind-back-bicep-curl",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Long-head bicep stretch \u2022 25s rest"
      },
      {
        "exerciseId": "bar-chinup-assisted",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair C1: High-tempo chin-up burn"
      },
      {
        "exerciseId": "reverse-fly-band",
        "sets": 3,
        "targetReps": 15,
        "targetRestSeconds": 20,
        "notes": "Pair C2: Rear delt exhaustion \u2022 20s rest"
      },
      {
        "exerciseId": "bar-dead-hang",
        "sets": 3,
        "targetReps": 45,
        "targetRestSeconds": 25,
        "notes": "Finisher: Passive spinal decompression hang"
      }
    ]
  },
  {
    "id": "routine-hybrid-legs-1",
    "name": "Hybrid Legs & Glutes Foundation \u26a1",
    "category": "Legs",
    "equipmentCategory": "hybrid",
    "tier": 1,
    "description": "Front-rack squats, Romanian deadlifts & glute activation.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "banded-squat-front",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Quad & core stability"
      },
      {
        "exerciseId": "tube-calf-raise",
        "sets": 3,
        "targetReps": 15,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Standing calf drive \u2022 25s rest"
      },
      {
        "exerciseId": "romanian-deadlift-band",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Posterior chain hinge"
      },
      {
        "exerciseId": "standing-glute-kickback",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Isolated glute peak \u2022 25s rest"
      },
      {
        "exerciseId": "glute-bridge-loop",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Glute bridge drive"
      },
      {
        "exerciseId": "lateral-band-walk",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Glute medius burn \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-hybrid-legs-2",
    "name": "Hybrid Legs & Posterior Overload \u26a1\u26a1",
    "category": "Legs",
    "equipmentCategory": "hybrid",
    "tier": 2,
    "description": "Front squats, heavy RDLs, lunges & monster walks.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "banded-squat-front",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Deep front-rack squat"
      },
      {
        "exerciseId": "lateral-band-walk",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Abductor fire \u2022 25s rest"
      },
      {
        "exerciseId": "romanian-deadlift-band",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Hamstring stretch & squeeze"
      },
      {
        "exerciseId": "banded-lunges",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Unilateral quad drive \u2022 25s rest"
      },
      {
        "exerciseId": "glute-bridge-loop",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Gluteus maximus burnout"
      },
      {
        "exerciseId": "tube-calf-raise",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Full dorsiflexion calf raise \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-hybrid-legs-3",
    "name": "Hybrid Lower Body Power \u26a1\u26a1\u26a1",
    "category": "Legs",
    "equipmentCategory": "hybrid",
    "tier": 3,
    "description": "Heavy deadlifts, explosive jump squats & good mornings.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "chris-heria-deadlift",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Heavy triple-band deadlift"
      },
      {
        "exerciseId": "bodyweight-jump-squats",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Plyometric power output \u2022 25s rest"
      },
      {
        "exerciseId": "banded-squat-front",
        "sets": 3,
        "targetReps": 15,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Maximum quad endurance"
      },
      {
        "exerciseId": "band-good-morning",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Deep hamstring hinge \u2022 25s rest"
      },
      {
        "exerciseId": "banded-lunges",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Heavy deficit reverse lunge"
      },
      {
        "exerciseId": "tube-calf-raise",
        "sets": 3,
        "targetReps": 18,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Single-leg calf burnout \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-hybrid-core-1",
    "name": "Hybrid Core & Stability \u26a1",
    "category": "Core",
    "equipmentCategory": "hybrid",
    "tier": 1,
    "description": "Cable crunches, Pallof anti-rotation & spinal decompression.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "kneeling-cable-crunch-band",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Deep rectus abdominis flex"
      },
      {
        "exerciseId": "bodyweight-plank-shoulder-taps",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Anti-rotation plank \u2022 25s rest"
      },
      {
        "exerciseId": "pallof-press-anti-rotation",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Core lateral stabilization"
      },
      {
        "exerciseId": "bodyweight-bicycle-crunches",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Oblique rotation \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-superman-pulses",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Lower back erector support"
      },
      {
        "exerciseId": "bar-dead-hang",
        "sets": 3,
        "targetReps": 35,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Spine decompression hang \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-hybrid-core-2",
    "name": "Hybrid Core & Hanging Flexion \u26a1\u26a1",
    "category": "Core",
    "equipmentCategory": "hybrid",
    "tier": 2,
    "description": "Hanging knee raises, woodchoppers & mountain climbers.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bar-hanging-leg-raise",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Lower abdominal flexion on bar"
      },
      {
        "exerciseId": "pallof-press-anti-rotation",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Sustained 3s anti-rotation \u2022 25s rest"
      },
      {
        "exerciseId": "band-woodchopper-high-low",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Diagonal rotational power"
      },
      {
        "exerciseId": "bodyweight-plank-shoulder-taps",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Rigid trunk stabilization \u2022 25s rest"
      },
      {
        "exerciseId": "kneeling-cable-crunch-band",
        "sets": 3,
        "targetReps": 15,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Kneeling band crunch"
      },
      {
        "exerciseId": "bodyweight-mountain-climbers",
        "sets": 3,
        "targetReps": 20,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Cross-body tempo drive \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-hybrid-core-3",
    "name": "Hybrid Advanced Core Strength \u26a1\u26a1\u26a1",
    "category": "Core",
    "equipmentCategory": "hybrid",
    "tier": 3,
    "description": "Hanging straight leg raises, V-up jackknifes & heavy woodchoppers.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bar-hanging-leg-raise",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Strict straight-leg toes-to-bar"
      },
      {
        "exerciseId": "pallof-press-anti-rotation",
        "sets": 3,
        "targetReps": 15,
        "targetRestSeconds": 25,
        "notes": "Pair A2: 3s hold at full reach \u2022 25s rest"
      },
      {
        "exerciseId": "band-woodchopper-high-low",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Heavy oblique rotation"
      },
      {
        "exerciseId": "bodyweight-v-ups",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Complete abdominal fold \u2022 25s rest"
      },
      {
        "exerciseId": "kneeling-cable-crunch-band",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 10,
        "notes": "Pair C1: High-resistance crunch"
      },
      {
        "exerciseId": "bodyweight-mountain-climbers",
        "sets": 3,
        "targetReps": 24,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Sprint-pace cross-body drive \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-hybrid-fullbody-1",
    "name": "Hybrid Full Body Flow \u26a1",
    "category": "Full Body Flow",
    "equipmentCategory": "hybrid",
    "tier": 1,
    "description": "Full body metabolic flow combining thrusters, rows & core conditioning.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "band-thruster",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Squat-to-press compound"
      },
      {
        "exerciseId": "bent-over-row-feet",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Horizontal back row \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-pushup-standard",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Clean chest push"
      },
      {
        "exerciseId": "romanian-deadlift-band",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Hamstring & glute hinge \u2022 25s rest"
      },
      {
        "exerciseId": "bar-band-face-pull",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Scapular posture reset"
      },
      {
        "exerciseId": "bodyweight-bicycle-crunches",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Core burnout \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-hybrid-fullbody-2",
    "name": "Hybrid Full Body Flow \u26a1\u26a1",
    "category": "Full Body Flow",
    "equipmentCategory": "hybrid",
    "tier": 2,
    "description": "Thrusters, band-assisted pull-ups, push-ups & deadlifts.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "band-thruster",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Compound metabolic stimulus"
      },
      {
        "exerciseId": "bar-pullup-assisted",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Assisted vertical pull \u2022 25s rest"
      },
      {
        "exerciseId": "chest-pushup-banded",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Banded floor push"
      },
      {
        "exerciseId": "romanian-deadlift-band",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Posterior chain hinge \u2022 25s rest"
      },
      {
        "exerciseId": "seated-face-pull",
        "sets": 3,
        "targetReps": 15,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Rear delt pump"
      },
      {
        "exerciseId": "pallof-press-anti-rotation",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Anti-rotation core hold \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-hybrid-fullbody-3",
    "name": "Hybrid Full Body Flow \u26a1\u26a1\u26a1",
    "category": "Full Body Flow",
    "equipmentCategory": "hybrid",
    "tier": 3,
    "description": "Thrusters, strict pull-ups, archer push-ups, burpees & V-ups.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "band-thruster",
        "sets": 3,
        "targetReps": 15,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Maximum metabolic density"
      },
      {
        "exerciseId": "bar-pullup-strict",
        "sets": 3,
        "targetReps": 8,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Strict pull-ups \u2022 25s rest"
      },
      {
        "exerciseId": "banded-archer-pushup",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Unilateral archer chest press"
      },
      {
        "exerciseId": "chris-heria-deadlift",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Heavy deadlift overload \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-full-burpees",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair C1: High-intensity full burpees"
      },
      {
        "exerciseId": "bodyweight-v-ups",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Core jackknife finish \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-hybrid-7x4",
    "name": "Hybrid 7x4 Full Body Challenge",
    "category": "7x4 Challenge",
    "equipmentCategory": "hybrid",
    "tier": 2,
    "description": "28-Day progressive PPL transformation for resistance bands & pull-up bar.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "band-thruster",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Phase 1: Metabolic Compound"
      },
      {
        "exerciseId": "bar-pullup-assisted",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 25,
        "notes": "Phase 2: Vertical Pull"
      },
      {
        "exerciseId": "chest-pushup-banded",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Phase 3: Horizontal Push"
      },
      {
        "exerciseId": "chris-heria-deadlift",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Phase 4: Posterior Overload"
      },
      {
        "exerciseId": "bar-hanging-leg-raise",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Phase 5: Core Flexion"
      },
      {
        "exerciseId": "bar-dead-hang",
        "sets": 3,
        "targetReps": 40,
        "targetRestSeconds": 25,
        "notes": "Phase 6: Spinal Decompression"
      }
    ]
  },
  {
    "id": "routine-bands-push-1",
    "name": "Bands Push Hypertrophy \u26a1",
    "category": "Push",
    "equipmentCategory": "bands-only",
    "tier": 1,
    "description": "Chest, front delts & triceps foundation.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "chest-press-standing",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Controlled 2s lowering"
      },
      {
        "exerciseId": "lateral-deltoid-raise",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Peak delt hold \u2022 25s rest"
      },
      {
        "exerciseId": "incline-chest-press",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Low-to-high clavicular push"
      },
      {
        "exerciseId": "tricep-pushdown-band",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Full elbow extension \u2022 25s rest"
      },
      {
        "exerciseId": "overhead-shoulder-press",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Vertical delt pressing"
      },
      {
        "exerciseId": "chest-fly-middle",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Sternal pec stretch \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bands-push-2",
    "name": "Bands Push Hypertrophy \u26a1\u26a1",
    "category": "Push",
    "equipmentCategory": "bands-only",
    "tier": 2,
    "description": "Banded push-up overload & overhead triceps.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "chest-pushup-banded",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Banded floor push overload"
      },
      {
        "exerciseId": "lateral-deltoid-raise",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Strict lateral delt pump \u2022 25s rest"
      },
      {
        "exerciseId": "chest-press-standing",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Squeeze pecs hard at lockout"
      },
      {
        "exerciseId": "overhead-tricep-extension",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Deep tricep long-head stretch \u2022 25s rest"
      },
      {
        "exerciseId": "overhead-shoulder-press",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Controlled 2s descent"
      },
      {
        "exerciseId": "incline-chest-press",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Upper chest fly/press finish \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bands-push-3",
    "name": "Bands Push Power & Levers \u26a1\u26a1\u26a1",
    "category": "Push",
    "equipmentCategory": "bands-only",
    "tier": 3,
    "description": "Banded archer push-ups & pike push-ups.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "banded-archer-pushup",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Asymmetric unilateral overload"
      },
      {
        "exerciseId": "lateral-deltoid-raise",
        "sets": 3,
        "targetReps": 15,
        "targetRestSeconds": 25,
        "notes": "Pair A2: High-density delt burn \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-pike-pushup",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Vertical pressing strength"
      },
      {
        "exerciseId": "overhead-tricep-extension",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Heavy tricep stretch \u2022 25s rest"
      },
      {
        "exerciseId": "chest-pushup-banded",
        "sets": 3,
        "targetReps": 15,
        "targetRestSeconds": 10,
        "notes": "Pair C1: High-rep banded push-up burnout"
      },
      {
        "exerciseId": "incline-chest-press",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Upper chest hypertrophy finish \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bands-pull-1",
    "name": "Bands Pull & Back Thickness \u26a1",
    "category": "Pull",
    "equipmentCategory": "bands-only",
    "tier": 1,
    "description": "Single-arm lat rows, double band rows & bicep foundation.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "single-arm-lat-row",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Lat isolation stretch"
      },
      {
        "exerciseId": "reverse-fly-band",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Rear delt posture builder \u2022 25s rest"
      },
      {
        "exerciseId": "bent-over-row-feet",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Double band back row"
      },
      {
        "exerciseId": "standing-bicep-curl",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Supinated bicep curls \u2022 25s rest"
      },
      {
        "exerciseId": "seated-face-pull",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair C1: External rotation health"
      },
      {
        "exerciseId": "hammer-curl-band",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Neutral hammer curl \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bands-pull-2",
    "name": "Bands Pull & Lat Overload \u26a1\u26a1",
    "category": "Pull",
    "equipmentCategory": "bands-only",
    "tier": 2,
    "description": "Door high lat pulldowns, heavy bent-over rows & concentration curls.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "door-high-lat-pulldown",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Kneeling door lat pulldown"
      },
      {
        "exerciseId": "reverse-fly-band",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Rear delt retraction \u2022 25s rest"
      },
      {
        "exerciseId": "bent-over-row-feet",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Double band row overload"
      },
      {
        "exerciseId": "tube-concentration-curl",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Isolated inner-thigh bicep curl \u2022 25s rest"
      },
      {
        "exerciseId": "seated-face-pull",
        "sets": 3,
        "targetReps": 15,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Scapular rotator cuff control"
      },
      {
        "exerciseId": "hammer-curl-band",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Forearm & bicep burnout \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bands-pull-3",
    "name": "Bands Pull Hypertrophy Burnout \u26a1\u26a1\u26a1",
    "category": "Pull",
    "equipmentCategory": "bands-only",
    "tier": 3,
    "description": "Heavy single-arm lat rows (3s eccentric), behind-back curls & reverse curls.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "single-arm-lat-row",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair A1: 3s lowering tempo per rep"
      },
      {
        "exerciseId": "seated-face-pull",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair A2: High rear delt squeeze \u2022 25s rest"
      },
      {
        "exerciseId": "bent-over-row-feet",
        "sets": 3,
        "targetReps": 15,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Heavy band horizontal row"
      },
      {
        "exerciseId": "behind-back-bicep-curl",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Long-head bicep stretch \u2022 25s rest"
      },
      {
        "exerciseId": "door-high-lat-pulldown",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Vertical kneeling pulldown"
      },
      {
        "exerciseId": "reverse-bicep-curl-band",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Brachioradialis reverse curl \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bands-legs-1",
    "name": "Bands Legs & Glutes Foundation \u26a1",
    "category": "Legs",
    "equipmentCategory": "bands-only",
    "tier": 1,
    "description": "Front-rack squats, RDLs & glute kickbacks.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "banded-squat-front",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Quad & core stability"
      },
      {
        "exerciseId": "tube-calf-raise",
        "sets": 3,
        "targetReps": 15,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Standing calf drive \u2022 25s rest"
      },
      {
        "exerciseId": "romanian-deadlift-band",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Posterior chain hinge"
      },
      {
        "exerciseId": "standing-glute-kickback",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Isolated glute peak \u2022 25s rest"
      },
      {
        "exerciseId": "glute-bridge-loop",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Glute bridge drive"
      },
      {
        "exerciseId": "lateral-band-walk",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Glute medius burn \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bands-legs-2",
    "name": "Bands Legs & Posterior Overload \u26a1\u26a1",
    "category": "Legs",
    "equipmentCategory": "bands-only",
    "tier": 2,
    "description": "Front squats, RDLs, lunges & monster walks.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "banded-squat-front",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Deep front-rack squat"
      },
      {
        "exerciseId": "lateral-band-walk",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Abductor fire \u2022 25s rest"
      },
      {
        "exerciseId": "romanian-deadlift-band",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Hamstring stretch & squeeze"
      },
      {
        "exerciseId": "banded-lunges",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Unilateral quad drive \u2022 25s rest"
      },
      {
        "exerciseId": "glute-bridge-loop",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Gluteus maximus burnout"
      },
      {
        "exerciseId": "tube-calf-raise",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Full dorsiflexion calf raise \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bands-legs-3",
    "name": "Bands Lower Body Power \u26a1\u26a1\u26a1",
    "category": "Legs",
    "equipmentCategory": "bands-only",
    "tier": 3,
    "description": "Heavy deadlifts, jump squats & good mornings.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "chris-heria-deadlift",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Heavy triple-band deadlift"
      },
      {
        "exerciseId": "bodyweight-jump-squats",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Plyometric power output \u2022 25s rest"
      },
      {
        "exerciseId": "banded-squat-front",
        "sets": 3,
        "targetReps": 15,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Maximum quad endurance"
      },
      {
        "exerciseId": "band-good-morning",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Deep hamstring hinge \u2022 25s rest"
      },
      {
        "exerciseId": "banded-lunges",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Heavy deficit reverse lunge"
      },
      {
        "exerciseId": "tube-calf-raise",
        "sets": 3,
        "targetReps": 18,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Single-leg calf burnout \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bands-core-1",
    "name": "Bands Core & Anti-Rotation \u26a1",
    "category": "Core",
    "equipmentCategory": "bands-only",
    "tier": 1,
    "description": "Kneeling crunches, Pallof press & posterior support.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "kneeling-cable-crunch-band",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Kneeling door crunch"
      },
      {
        "exerciseId": "bodyweight-plank-shoulder-taps",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Anti-rotation plank \u2022 25s rest"
      },
      {
        "exerciseId": "pallof-press-anti-rotation",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Lateral core stability"
      },
      {
        "exerciseId": "bodyweight-bicycle-crunches",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Oblique rotation \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-superman-pulses",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Lower back erector pulses"
      },
      {
        "exerciseId": "bodyweight-glute-bridge",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Glute squeeze & core lock \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bands-core-2",
    "name": "Bands Core & Obliques \u26a1\u26a1",
    "category": "Core",
    "equipmentCategory": "bands-only",
    "tier": 2,
    "description": "Diagonal woodchoppers, Pallof press & mountain climbers.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "band-woodchopper-high-low",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair A1: High-to-low diagonal chop"
      },
      {
        "exerciseId": "pallof-press-anti-rotation",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair A2: 3s anti-rotation hold \u2022 25s rest"
      },
      {
        "exerciseId": "kneeling-cable-crunch-band",
        "sets": 3,
        "targetReps": 15,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Kneeling cable crunch"
      },
      {
        "exerciseId": "bodyweight-plank-shoulder-taps",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Trunk stability \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-v-ups",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Supine V-up jackknife"
      },
      {
        "exerciseId": "bodyweight-mountain-climbers",
        "sets": 3,
        "targetReps": 20,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Cross-body tempo drive \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bands-core-3",
    "name": "Bands Advanced Core Density \u26a1\u26a1\u26a1",
    "category": "Core",
    "equipmentCategory": "bands-only",
    "tier": 3,
    "description": "Heavy woodchoppers, 3s Pallof holds, V-ups & mountain climbers.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "band-woodchopper-high-low",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Heavy rotational power"
      },
      {
        "exerciseId": "pallof-press-anti-rotation",
        "sets": 3,
        "targetReps": 15,
        "targetRestSeconds": 25,
        "notes": "Pair A2: 3s hold at peak reach \u2022 25s rest"
      },
      {
        "exerciseId": "kneeling-cable-crunch-band",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Heavy band crunch"
      },
      {
        "exerciseId": "bodyweight-v-ups",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Full abdominal jackknife \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-mountain-climbers",
        "sets": 3,
        "targetReps": 24,
        "targetRestSeconds": 10,
        "notes": "Pair C1: High-cadence drive"
      },
      {
        "exerciseId": "bodyweight-bicycle-crunches",
        "sets": 3,
        "targetReps": 20,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Oblique exhaustion \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bands-fullbody-1",
    "name": "Bands Full Body Flow \u26a1",
    "category": "Full Body Flow",
    "equipmentCategory": "bands-only",
    "tier": 1,
    "description": "Band thrusters, bent-over rows & floor conditioning.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "band-thruster",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Squat-to-overhead press"
      },
      {
        "exerciseId": "bent-over-row-feet",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Horizontal band row \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-pushup-standard",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Floor push-up"
      },
      {
        "exerciseId": "romanian-deadlift-band",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Hamstring hinge \u2022 25s rest"
      },
      {
        "exerciseId": "seated-face-pull",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Rear delt reset"
      },
      {
        "exerciseId": "bodyweight-bicycle-crunches",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Core rotation \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bands-fullbody-2",
    "name": "Bands Full Body Flow \u26a1\u26a1",
    "category": "Full Body Flow",
    "equipmentCategory": "bands-only",
    "tier": 2,
    "description": "Band thrusters, single-arm lat rows, push-ups & Pallof press.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "band-thruster",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Explosive thruster"
      },
      {
        "exerciseId": "single-arm-lat-row",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Unilateral lat pull \u2022 25s rest"
      },
      {
        "exerciseId": "chest-pushup-banded",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Banded floor push"
      },
      {
        "exerciseId": "romanian-deadlift-band",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Posterior chain hinge \u2022 25s rest"
      },
      {
        "exerciseId": "seated-face-pull",
        "sets": 3,
        "targetReps": 15,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Posture stabilizer"
      },
      {
        "exerciseId": "pallof-press-anti-rotation",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Anti-rotation hold \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bands-fullbody-3",
    "name": "Bands Full Body Flow \u26a1\u26a1\u26a1",
    "category": "Full Body Flow",
    "equipmentCategory": "bands-only",
    "tier": 3,
    "description": "Band thrusters, archer push-ups, heavy deadlifts & burpees.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "band-thruster",
        "sets": 3,
        "targetReps": 15,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Maximum metabolic stimulus"
      },
      {
        "exerciseId": "single-arm-lat-row",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Heavy staggered row \u2022 25s rest"
      },
      {
        "exerciseId": "banded-archer-pushup",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Archer push-up overload"
      },
      {
        "exerciseId": "chris-heria-deadlift",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Heavy deadlift \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-full-burpees",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Full calisthenic burpee"
      },
      {
        "exerciseId": "bodyweight-v-ups",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair C2: V-up jackknife finish \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bands-7x4",
    "name": "Slovic Bands 7x4 Challenge",
    "category": "7x4 Challenge",
    "equipmentCategory": "bands-only",
    "tier": 2,
    "description": "28-Day progressive PPL system for Slovic 5-band loop kits.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "band-thruster",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Phase 1: Compound Thruster"
      },
      {
        "exerciseId": "single-arm-lat-row",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Phase 2: Heavy Lat Row"
      },
      {
        "exerciseId": "chest-pushup-banded",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Phase 3: Banded Push-Up"
      },
      {
        "exerciseId": "chris-heria-deadlift",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Phase 4: Deadlift Overload"
      },
      {
        "exerciseId": "band-woodchopper-high-low",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Phase 5: Rotational Core"
      },
      {
        "exerciseId": "kneeling-cable-crunch-band",
        "sets": 3,
        "targetReps": 15,
        "targetRestSeconds": 25,
        "notes": "Phase 6: Kneeling Crunch"
      }
    ]
  },
  {
    "id": "routine-bar-push-1",
    "name": "Bar Calisthenics Push \u26a1",
    "category": "Push",
    "equipmentCategory": "bar-only",
    "tier": 1,
    "description": "Floor push-ups, shoulder taps, downward dog & pike push-ups.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bodyweight-pushup-standard",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Strict floor push-up"
      },
      {
        "exerciseId": "bodyweight-plank-shoulder-taps",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Core & shoulder taps \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-pushup-downward-dog",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Push-up to downward dog stretch"
      },
      {
        "exerciseId": "bar-dead-hang",
        "sets": 3,
        "targetReps": 30,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Passive decompression hang \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-pike-pushup",
        "sets": 3,
        "targetReps": 8,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Partial range pike push-up"
      },
      {
        "exerciseId": "bodyweight-superman-pulses",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Antagonist back support \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bar-push-2",
    "name": "Bar Calisthenics Push \u26a1\u26a1",
    "category": "Push",
    "equipmentCategory": "bar-only",
    "tier": 2,
    "description": "Standard push-ups, diamond push-ups, pike push-ups & dead hangs.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bodyweight-pushup-standard",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Strict cadence push-up"
      },
      {
        "exerciseId": "bodyweight-plank-shoulder-taps",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Anti-rotation taps \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-diamond-pushup",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Close-grip tricep focus"
      },
      {
        "exerciseId": "bar-dead-hang",
        "sets": 3,
        "targetReps": 40,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Spinal decompression \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-pike-pushup",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Full range vertical push"
      },
      {
        "exerciseId": "bodyweight-pushup-downward-dog",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Deltoid and chest stretch \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bar-push-3",
    "name": "Bar Calisthenics Push Levers \u26a1\u26a1\u26a1",
    "category": "Push",
    "equipmentCategory": "bar-only",
    "tier": 3,
    "description": "Archer push-ups, strict pike presses & diamond burnout.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bodyweight-archer-pushup",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Unilateral bodyweight archer push-up"
      },
      {
        "exerciseId": "bodyweight-plank-shoulder-taps",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Rigid plank taps \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-pike-pushup",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Deep vertical deltoid press"
      },
      {
        "exerciseId": "bar-dead-hang",
        "sets": 3,
        "targetReps": 45,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Active decompression hang \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-diamond-pushup",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Inner tricep exhaustion"
      },
      {
        "exerciseId": "bodyweight-pushup-downward-dog",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Dynamic chest burnout \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bar-pull-1",
    "name": "Bar Calisthenics Pull \u26a1",
    "category": "Pull",
    "equipmentCategory": "bar-only",
    "tier": 1,
    "description": "Slow lowering pull-up negatives, superman pulses & hanging knee tucks.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bar-pullup-strict",
        "sets": 3,
        "targetReps": 6,
        "targetRestSeconds": 10,
        "notes": "Pair A1: 5s slow lowering negative per rep"
      },
      {
        "exerciseId": "bodyweight-superman-pulses",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Floor lat & back pulses \u2022 25s rest"
      },
      {
        "exerciseId": "bar-dead-hang",
        "sets": 3,
        "targetReps": 35,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Scapular pull & hang"
      },
      {
        "exerciseId": "bar-hanging-leg-raise",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Hanging knee raise (tuck) \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bar-pull-2",
    "name": "Bar Calisthenics Pull \u26a1\u26a1",
    "category": "Pull",
    "equipmentCategory": "bar-only",
    "tier": 2,
    "description": "Strict pull-ups, strict chin-ups, hanging raises & superman pulses.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bar-pullup-strict",
        "sets": 3,
        "targetReps": 8,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Strict chest-to-bar pull"
      },
      {
        "exerciseId": "bodyweight-superman-pulses",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Posterior chain pulse \u2022 25s rest"
      },
      {
        "exerciseId": "bar-chinup-strict",
        "sets": 3,
        "targetReps": 8,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Underhand bicep overload on bar"
      },
      {
        "exerciseId": "bar-hanging-leg-raise",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Hanging knee/leg raise \u2022 25s rest"
      },
      {
        "exerciseId": "bar-dead-hang",
        "sets": 3,
        "targetReps": 40,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Spine decompression hang"
      },
      {
        "exerciseId": "bodyweight-plank-shoulder-taps",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Core stability reset \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bar-pull-3",
    "name": "Bar Calisthenics Pull Mastery \u26a1\u26a1\u26a1",
    "category": "Pull",
    "equipmentCategory": "bar-only",
    "tier": 3,
    "description": "Strict pull-ups with top pause, strict chin-ups & straight-leg raises.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bar-pullup-strict",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 10,
        "notes": "Pair A1: 2s pause at peak chin clearance"
      },
      {
        "exerciseId": "bodyweight-superman-pulses",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Erector spinae & lat squeeze \u2022 25s rest"
      },
      {
        "exerciseId": "bar-chinup-strict",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Strict slow lowering chin-ups"
      },
      {
        "exerciseId": "bar-hanging-leg-raise",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Straight-leg toes-to-bar \u2022 25s rest"
      },
      {
        "exerciseId": "bar-dead-hang",
        "sets": 3,
        "targetReps": 45,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Sustained 45s dead-hang"
      },
      {
        "exerciseId": "bodyweight-v-ups",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Supine jackknife finish \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bar-legs-1",
    "name": "Bar Calisthenics Legs \u26a1",
    "category": "Legs",
    "equipmentCategory": "bar-only",
    "tier": 1,
    "description": "Tempo squats, calf raises, reverse lunges & glute bridges.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bodyweight-air-squat",
        "sets": 3,
        "targetReps": 15,
        "targetRestSeconds": 10,
        "notes": "Pair A1: 3s descent tempo squat"
      },
      {
        "exerciseId": "bodyweight-standing-calf-raise",
        "sets": 3,
        "targetReps": 18,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Standing calf drive \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-reverse-lunge",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Alternating reverse lunge"
      },
      {
        "exerciseId": "bodyweight-glute-bridge",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Glute bridge squeeze \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bar-legs-2",
    "name": "Bar Calisthenics Legs \u26a1\u26a1",
    "category": "Legs",
    "equipmentCategory": "bar-only",
    "tier": 2,
    "description": "Tempo squats, sumo squat pulses, reverse lunges & glute bridges.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bodyweight-air-squat",
        "sets": 3,
        "targetReps": 18,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Deep bodyweight squat"
      },
      {
        "exerciseId": "bodyweight-standing-calf-raise",
        "sets": 3,
        "targetReps": 20,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Floor calf raise \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-sumo-squat-pulse",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Wide stance adductor pulse"
      },
      {
        "exerciseId": "bodyweight-glute-bridge",
        "sets": 3,
        "targetReps": 18,
        "targetRestSeconds": 25,
        "notes": "Pair B2: 2s glute lockout \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-reverse-lunge",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Unilateral leg drive"
      },
      {
        "exerciseId": "bodyweight-plank-shoulder-taps",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Core reset \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bar-legs-3",
    "name": "Bar Calisthenics Legs Power \u26a1\u26a1\u26a1",
    "category": "Legs",
    "equipmentCategory": "bar-only",
    "tier": 3,
    "description": "Explosive jump squats, single-leg calf raises, sumo pulses & burpees.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bodyweight-jump-squats",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Explosive jump squats"
      },
      {
        "exerciseId": "bodyweight-standing-calf-raise",
        "sets": 3,
        "targetReps": 22,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Single-leg calf burnout \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-sumo-squat-pulse",
        "sets": 3,
        "targetReps": 20,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Deep sumo pulse"
      },
      {
        "exerciseId": "bodyweight-glute-bridge",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Single-leg glute bridge \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-reverse-lunge",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 10,
        "notes": "Pair C1: 2s pause at bottom"
      },
      {
        "exerciseId": "bodyweight-full-burpees",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Metabolic burpee burn \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bar-core-1",
    "name": "Bar Calisthenics Core \u26a1",
    "category": "Core",
    "equipmentCategory": "bar-only",
    "tier": 1,
    "description": "Bicycle crunches, shoulder taps, hanging knee raises & dead-hangs.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bodyweight-bicycle-crunches",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Oblique rotational crunch"
      },
      {
        "exerciseId": "bodyweight-plank-shoulder-taps",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Plank stabilization \u2022 25s rest"
      },
      {
        "exerciseId": "bar-hanging-leg-raise",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Hanging knee tuck"
      },
      {
        "exerciseId": "bodyweight-mountain-climbers",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Cross-body drive \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-superman-pulses",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Lower back erector pulses"
      },
      {
        "exerciseId": "bar-dead-hang",
        "sets": 3,
        "targetReps": 35,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Spine decompression hang \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bar-core-2",
    "name": "Bar Calisthenics Core \u26a1\u26a1",
    "category": "Core",
    "equipmentCategory": "bar-only",
    "tier": 2,
    "description": "Hanging leg raises, V-ups, mountain climbers & dead-hangs.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bar-hanging-leg-raise",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Hanging knee-to-elbow raise"
      },
      {
        "exerciseId": "bodyweight-bicycle-crunches",
        "sets": 3,
        "targetReps": 18,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Oblique rotation \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-v-ups",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Supine V-up jackknife"
      },
      {
        "exerciseId": "bodyweight-plank-shoulder-taps",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Anti-rotation tap \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-mountain-climbers",
        "sets": 3,
        "targetReps": 20,
        "targetRestSeconds": 10,
        "notes": "Pair C1: High-cadence drive"
      },
      {
        "exerciseId": "bar-dead-hang",
        "sets": 3,
        "targetReps": 40,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Decompression hang \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bar-core-3",
    "name": "Bar Calisthenics Core Overload \u26a1\u26a1\u26a1",
    "category": "Core",
    "equipmentCategory": "bar-only",
    "tier": 3,
    "description": "Straight-leg hanging raises, V-ups & sprint mountain climbers.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bar-hanging-leg-raise",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Strict straight-leg toes-to-bar"
      },
      {
        "exerciseId": "bodyweight-v-ups",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Fast-tempo V-up jackknife \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-mountain-climbers",
        "sets": 3,
        "targetReps": 24,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Sprint mountain climbers"
      },
      {
        "exerciseId": "bodyweight-bicycle-crunches",
        "sets": 3,
        "targetReps": 20,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Oblique burnout \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-plank-shoulder-taps",
        "sets": 3,
        "targetReps": 18,
        "targetRestSeconds": 10,
        "notes": "Pair C1: High plank hold and tap"
      },
      {
        "exerciseId": "bar-dead-hang",
        "sets": 3,
        "targetReps": 45,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Sustained 45s dead-hang \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bar-fullbody-1",
    "name": "Bar Calisthenics Flow \u26a1",
    "category": "Full Body Flow",
    "equipmentCategory": "bar-only",
    "tier": 1,
    "description": "Tempo squats, push-ups, dead-hangs & mountain climbers.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bodyweight-air-squat",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Air squat cadence"
      },
      {
        "exerciseId": "bodyweight-pushup-standard",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Floor push-up \u2022 25s rest"
      },
      {
        "exerciseId": "bar-dead-hang",
        "sets": 3,
        "targetReps": 35,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Passive spinal hang"
      },
      {
        "exerciseId": "bodyweight-mountain-climbers",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Cross-body knee drive \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-reverse-lunge",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Reverse lunge"
      },
      {
        "exerciseId": "bodyweight-bicycle-crunches",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Core rotation \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bar-fullbody-2",
    "name": "Bar Calisthenics Flow \u26a1\u26a1",
    "category": "Full Body Flow",
    "equipmentCategory": "bar-only",
    "tier": 2,
    "description": "Strict pull-ups, push-ups, sumo pulses, lunges & V-ups.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bar-pullup-strict",
        "sets": 3,
        "targetReps": 8,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Strict bodyweight pull-up"
      },
      {
        "exerciseId": "bodyweight-pushup-standard",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Standard push-up \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-sumo-squat-pulse",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Sumo pulse"
      },
      {
        "exerciseId": "bodyweight-plank-shoulder-taps",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Shoulder taps \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-reverse-lunge",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Alternating reverse lunge"
      },
      {
        "exerciseId": "bodyweight-v-ups",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair C2: V-up jackknife \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bar-fullbody-3",
    "name": "Bar Calisthenics Flow \u26a1\u26a1\u26a1",
    "category": "Full Body Flow",
    "equipmentCategory": "bar-only",
    "tier": 3,
    "description": "Strict pull-ups, push-up to downward dog, jump squats, chin-ups & burpees.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bar-pullup-strict",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Full range pull-up"
      },
      {
        "exerciseId": "bodyweight-pushup-downward-dog",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Push-up to downward dog \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-jump-squats",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Explosive jump squat"
      },
      {
        "exerciseId": "bar-chinup-strict",
        "sets": 3,
        "targetReps": 8,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Strict chin-up bicep pull \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-full-burpees",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Full calisthenic burpee"
      },
      {
        "exerciseId": "bar-hanging-leg-raise",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Hanging leg raise finish \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-bar-7x4",
    "name": "Bar Calisthenics 7x4 Challenge",
    "category": "7x4 Challenge",
    "equipmentCategory": "bar-only",
    "tier": 2,
    "description": "28-Day progressive bodyweight & pull-up bar conditioning program.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bar-pullup-strict",
        "sets": 3,
        "targetReps": 8,
        "targetRestSeconds": 10,
        "notes": "Phase 1: Strict Pull-Up"
      },
      {
        "exerciseId": "bodyweight-pushup-standard",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Phase 2: Push-Up Mechanics"
      },
      {
        "exerciseId": "bodyweight-air-squat",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 10,
        "notes": "Phase 3: Lower Body Cadence"
      },
      {
        "exerciseId": "bar-chinup-strict",
        "sets": 3,
        "targetReps": 8,
        "targetRestSeconds": 25,
        "notes": "Phase 4: Bicep Chin-Up Overload"
      },
      {
        "exerciseId": "bar-hanging-leg-raise",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Phase 5: Hanging Abdominal Flexion"
      },
      {
        "exerciseId": "bar-dead-hang",
        "sets": 3,
        "targetReps": 40,
        "targetRestSeconds": 25,
        "notes": "Phase 6: Spine Decompression Hang"
      }
    ]
  },
  {
    "id": "routine-ne-push-1",
    "name": "Rowan Row Push Foundation \u26a1",
    "category": "Push",
    "equipmentCategory": "no-equipment",
    "tier": 1,
    "description": "Floor push-ups, shoulder taps, downward dog & pike push-ups.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bodyweight-pushup-standard",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Clean floor push-up"
      },
      {
        "exerciseId": "bodyweight-plank-shoulder-taps",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Anti-rotation taps \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-pushup-downward-dog",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Push-up to downward dog"
      },
      {
        "exerciseId": "bodyweight-superman-pulses",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Posterior erector support \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-pike-pushup",
        "sets": 3,
        "targetReps": 8,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Partial range pike push-up"
      },
      {
        "exerciseId": "bodyweight-superman-pulses",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Scapular recovery \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-ne-push-2",
    "name": "Rowan Row Push & Chest Blast \u26a1\u26a1",
    "category": "Push",
    "equipmentCategory": "no-equipment",
    "tier": 2,
    "description": "Standard push-ups, diamond push-ups, pike push-ups & downward dog.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bodyweight-pushup-standard",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Rowan Row cadence push-up"
      },
      {
        "exerciseId": "bodyweight-plank-shoulder-taps",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Anti-rotation taps \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-diamond-pushup",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Close-grip tricep focus"
      },
      {
        "exerciseId": "bodyweight-superman-pulses",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Back & lat pulses \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-pike-pushup",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Full vertical pike press"
      },
      {
        "exerciseId": "bodyweight-pushup-downward-dog",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Dynamic chest & delt stretch \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-ne-push-3",
    "name": "Rowan Row Advanced Push Levers \u26a1\u26a1\u26a1",
    "category": "Push",
    "equipmentCategory": "no-equipment",
    "tier": 3,
    "description": "Bodyweight archer push-ups, pike push-ups & diamond burnout.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bodyweight-archer-pushup",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Unilateral archer push-up"
      },
      {
        "exerciseId": "bodyweight-plank-shoulder-taps",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Rigid plank taps \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-pike-pushup",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Deep vertical deltoid press"
      },
      {
        "exerciseId": "bodyweight-superman-pulses",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair B2: 3s hold superman pulses \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-diamond-pushup",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Tricep burnout"
      },
      {
        "exerciseId": "bodyweight-pushup-downward-dog",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Chest stretch & lockout \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-ne-pull-1",
    "name": "Rowan Row Posterior Chain & Pull \u26a1",
    "category": "Pull",
    "equipmentCategory": "no-equipment",
    "tier": 1,
    "description": "Superman back pulses, plank taps, glute bridges & bicycle crunches.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bodyweight-superman-pulses",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Floor lat & erector squeeze"
      },
      {
        "exerciseId": "bodyweight-plank-shoulder-taps",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Scapular stabilization \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-glute-bridge",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Glute bridge & posterior squeeze"
      },
      {
        "exerciseId": "bodyweight-bicycle-crunches",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Core rotational finish \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-ne-pull-2",
    "name": "Rowan Row Posterior Chain & Pull \u26a1\u26a1",
    "category": "Pull",
    "equipmentCategory": "no-equipment",
    "tier": 2,
    "description": "Superman pulses (3s hold), plank taps, glute bridges (3s squeeze) & V-ups.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bodyweight-superman-pulses",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 10,
        "notes": "Pair A1: 3s peak contraction hold on lats"
      },
      {
        "exerciseId": "bodyweight-plank-shoulder-taps",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Rigid trunk taps \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-glute-bridge",
        "sets": 3,
        "targetReps": 18,
        "targetRestSeconds": 10,
        "notes": "Pair B1: 3s glute lockout squeeze"
      },
      {
        "exerciseId": "bodyweight-v-ups",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Supine jackknife finish \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-ne-pull-3",
    "name": "Rowan Row Posterior Chain & Pull \u26a1\u26a1\u26a1",
    "category": "Pull",
    "equipmentCategory": "no-equipment",
    "tier": 3,
    "description": "High-tempo superman pulses, V-up jackknifes & single-leg bridges.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bodyweight-superman-pulses",
        "sets": 3,
        "targetReps": 18,
        "targetRestSeconds": 10,
        "notes": "Pair A1: High-rep lat & erector pulses"
      },
      {
        "exerciseId": "bodyweight-v-ups",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Fast-tempo V-up jackknife \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-glute-bridge",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Single-leg glute bridge"
      },
      {
        "exerciseId": "bodyweight-mountain-climbers",
        "sets": 3,
        "targetReps": 24,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Sprint mountain climbers \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-ne-legs-1",
    "name": "Rowan Row Legs & Glutes \u26a1",
    "category": "Legs",
    "equipmentCategory": "no-equipment",
    "tier": 1,
    "description": "Tempo squats, calf raises, reverse lunges & bridges.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bodyweight-air-squat",
        "sets": 3,
        "targetReps": 15,
        "targetRestSeconds": 10,
        "notes": "Pair A1: 3s descent tempo squat"
      },
      {
        "exerciseId": "bodyweight-standing-calf-raise",
        "sets": 3,
        "targetReps": 18,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Standing calf drive \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-reverse-lunge",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Alternating reverse lunge"
      },
      {
        "exerciseId": "bodyweight-glute-bridge",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Glute bridge squeeze \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-ne-legs-2",
    "name": "Rowan Row Lower Body Blast \u26a1\u26a1",
    "category": "Legs",
    "equipmentCategory": "no-equipment",
    "tier": 2,
    "description": "Air squats, sumo pulses, lunges & glute bridges.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bodyweight-air-squat",
        "sets": 3,
        "targetReps": 18,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Deep bodyweight squat"
      },
      {
        "exerciseId": "bodyweight-standing-calf-raise",
        "sets": 3,
        "targetReps": 20,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Floor calf raise \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-sumo-squat-pulse",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Wide stance adductor pulse"
      },
      {
        "exerciseId": "bodyweight-glute-bridge",
        "sets": 3,
        "targetReps": 18,
        "targetRestSeconds": 25,
        "notes": "Pair B2: 2s glute lockout \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-reverse-lunge",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Unilateral leg drive"
      },
      {
        "exerciseId": "bodyweight-plank-shoulder-taps",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Core reset \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-ne-legs-3",
    "name": "Rowan Row Legs & Plyo Burn \u26a1\u26a1\u26a1",
    "category": "Legs",
    "equipmentCategory": "no-equipment",
    "tier": 3,
    "description": "Jump squats, single-leg calf raises, sumo pulses & burpees.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bodyweight-jump-squats",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Explosive jump squats"
      },
      {
        "exerciseId": "bodyweight-standing-calf-raise",
        "sets": 3,
        "targetReps": 22,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Single-leg calf burnout \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-sumo-squat-pulse",
        "sets": 3,
        "targetReps": 20,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Deep sumo pulse"
      },
      {
        "exerciseId": "bodyweight-glute-bridge",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Single-leg glute bridge \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-reverse-lunge",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 10,
        "notes": "Pair C1: 2s pause at bottom"
      },
      {
        "exerciseId": "bodyweight-full-burpees",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Metabolic burpee burn \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-ne-core-1",
    "name": "Rowan Row Core Stability \u26a1",
    "category": "Core",
    "equipmentCategory": "no-equipment",
    "tier": 1,
    "description": "Bicycle crunches, shoulder taps, mountain climbers & superman pulses.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bodyweight-bicycle-crunches",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Oblique rotational crunch"
      },
      {
        "exerciseId": "bodyweight-plank-shoulder-taps",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair A2: High plank shoulder taps \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-mountain-climbers",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Cross-body knee drive"
      },
      {
        "exerciseId": "bodyweight-superman-pulses",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Lower back erector pulses \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-glute-bridge",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Glute bridge lockout"
      },
      {
        "exerciseId": "bodyweight-bicycle-crunches",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Core burnout \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-ne-core-2",
    "name": "Rowan Row Core & Abs Blast \u26a1\u26a1",
    "category": "Core",
    "equipmentCategory": "no-equipment",
    "tier": 2,
    "description": "V-up jackknifes, bicycle crunches, mountain climbers & shoulder taps.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bodyweight-v-ups",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Supine V-up jackknife"
      },
      {
        "exerciseId": "bodyweight-bicycle-crunches",
        "sets": 3,
        "targetReps": 18,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Oblique rotation \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-mountain-climbers",
        "sets": 3,
        "targetReps": 20,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Cross-body drive"
      },
      {
        "exerciseId": "bodyweight-plank-shoulder-taps",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Anti-rotation taps \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-superman-pulses",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Posterior back pulses"
      },
      {
        "exerciseId": "bodyweight-v-ups",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Rectus abdominis burnout \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-ne-core-3",
    "name": "Rowan Row Advanced Core Density \u26a1\u26a1\u26a1",
    "category": "Core",
    "equipmentCategory": "no-equipment",
    "tier": 3,
    "description": "High-tempo V-ups, sprint mountain climbers & plank taps.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bodyweight-v-ups",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Fast-tempo V-up jackknife"
      },
      {
        "exerciseId": "bodyweight-mountain-climbers",
        "sets": 3,
        "targetReps": 24,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Sprint mountain climbers \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-plank-shoulder-taps",
        "sets": 3,
        "targetReps": 18,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Rigid plank taps"
      },
      {
        "exerciseId": "bodyweight-bicycle-crunches",
        "sets": 3,
        "targetReps": 20,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Fast bicycle crunches \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-superman-pulses",
        "sets": 3,
        "targetReps": 18,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Posterior chain hyperextension"
      },
      {
        "exerciseId": "bodyweight-v-ups",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Total abdominal exhaustion \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-ne-fullbody-1",
    "name": "Rowan Row Full Body Flow \u26a1",
    "category": "Full Body Flow",
    "equipmentCategory": "no-equipment",
    "tier": 1,
    "description": "Tempo squats, push-ups, mountain climbers, lunges & bicycle crunches.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bodyweight-air-squat",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Air squat cadence"
      },
      {
        "exerciseId": "bodyweight-pushup-standard",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Clean push-up \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-mountain-climbers",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Mountain climbers"
      },
      {
        "exerciseId": "bodyweight-superman-pulses",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Posterior chain pulses \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-reverse-lunge",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Reverse lunge"
      },
      {
        "exerciseId": "bodyweight-bicycle-crunches",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Core rotation \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-ne-fullbody-2",
    "name": "Rowan Row Full Body Flow \u26a1\u26a1",
    "category": "Full Body Flow",
    "equipmentCategory": "no-equipment",
    "tier": 2,
    "description": "Sumo squat pulses, standard push-ups, lunges, shoulder taps & V-ups.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bodyweight-sumo-squat-pulse",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Sumo squat pulse"
      },
      {
        "exerciseId": "bodyweight-pushup-standard",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Strict floor push-up \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-reverse-lunge",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Alternating reverse lunge"
      },
      {
        "exerciseId": "bodyweight-plank-shoulder-taps",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Shoulder taps \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-mountain-climbers",
        "sets": 3,
        "targetReps": 20,
        "targetRestSeconds": 10,
        "notes": "Pair C1: Cross-body climbers"
      },
      {
        "exerciseId": "bodyweight-v-ups",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair C2: V-up jackknife finish \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-ne-fullbody-3",
    "name": "Rowan Row Full Body Flow \u26a1\u26a1\u26a1",
    "category": "Full Body Flow",
    "equipmentCategory": "no-equipment",
    "tier": 3,
    "description": "Push-up downward dog, jump squats, archer push-ups, burpees & V-ups.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bodyweight-pushup-downward-dog",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Pair A1: Push-up to downward dog"
      },
      {
        "exerciseId": "bodyweight-jump-squats",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair A2: Explosive jump squat \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-archer-pushup",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 10,
        "notes": "Pair B1: Unilateral archer push-up"
      },
      {
        "exerciseId": "bodyweight-full-burpees",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Pair B2: Full calisthenic burpee \u2022 25s rest"
      },
      {
        "exerciseId": "bodyweight-mountain-climbers",
        "sets": 3,
        "targetReps": 24,
        "targetRestSeconds": 10,
        "notes": "Pair C1: High-cadence drive"
      },
      {
        "exerciseId": "bodyweight-v-ups",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 25,
        "notes": "Pair C2: Core jackknife finish \u2022 25s rest"
      }
    ]
  },
  {
    "id": "routine-ne-7x4",
    "name": "Rowan Row 7x4 Challenge",
    "category": "7x4 Challenge",
    "equipmentCategory": "no-equipment",
    "tier": 2,
    "description": "28-Day progressive 100% bodyweight transformation program.",
    "estimatedDurationMins": 20,
    "exercises": [
      {
        "exerciseId": "bodyweight-pushup-standard",
        "sets": 3,
        "targetReps": 14,
        "targetRestSeconds": 10,
        "notes": "Phase 1: Standard Push-Up"
      },
      {
        "exerciseId": "bodyweight-air-squat",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 25,
        "notes": "Phase 2: Air Squat Cadence"
      },
      {
        "exerciseId": "bodyweight-superman-pulses",
        "sets": 3,
        "targetReps": 16,
        "targetRestSeconds": 10,
        "notes": "Phase 3: Posterior Chain Hold"
      },
      {
        "exerciseId": "bodyweight-jump-squats",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 25,
        "notes": "Phase 4: Explosive Jump Squat"
      },
      {
        "exerciseId": "bodyweight-v-ups",
        "sets": 3,
        "targetReps": 12,
        "targetRestSeconds": 10,
        "notes": "Phase 5: V-Up Jackknife"
      },
      {
        "exerciseId": "bodyweight-full-burpees",
        "sets": 3,
        "targetReps": 10,
        "targetRestSeconds": 25,
        "notes": "Phase 6: Full Burpee Benchmark"
      }
    ]
  }
];

/** Base routines plus the programming fixes and split variants (see routineVariants.ts). */
export const PREBUILT_ROUTINES: LeapRoutine[] = expandRoutines(BASE_ROUTINES);
