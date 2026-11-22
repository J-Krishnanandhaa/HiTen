import { Exercise } from '../types';
import {
  EXTRA_EXERCISES, PROGRESSION_LADDERS, COMMON_MISTAKES,
  TIMED_EXERCISES, ASSISTED_EXERCISES, COMPOUND_EXERCISES, defaultTempo,
} from './extraExercises';

/**
 * VIDEO DEMONSTRATIONS (re-audited 22 Nov 2026)
 *
 * Every exercise points at a clip of that exact exercise:
 *   - `tut_*`  short single-exercise tutorials, each checked frame by frame and
 *              confirmed embeddable; they play from the start (Live Lean TV clips
 *              skip their 4-second intro card).
 *   - `thenx`  the THENX band compilation, used only where the cue sits on one of
 *              the video's own chapter markers.
 * Estimated timestamps into long follow-along workouts were removed.
 * `rowan` stays only for the guided warm-up and cool-down blocks.
 */
export const VIDEO_SOURCES = {
  thenx: {
    id: 'hQ2lHMP4kco',
    title: '20 Best Exercises You Can Do With A Resistance Band',
    channel: 'THENX (Chris Heria)',
    lengthSec: 620,
  },
  rowan: {
    id: 'cDq-nFmD0rI',
    title: 'The Ultimate 45 Min FULL BODY WORKOUT',
    channel: 'Rowan Row',
    lengthSec: 2797,
  },

  // Short single-exercise form tutorials (verified 22 Nov 2026: live, embeddable, titled for the exercise).
  tut_bar_pullup_strict: { id: 'eGo4IYlbE5g', title: 'The Perfect Pull Up - Do it right!', channel: 'Calisthenicmovement', lengthSec: 272 },
  tut_bar_dead_hang: { id: 'lR6fl7q2C5k', title: 'How To Dead Hang The Right Way', channel: 'Dan\'s Protocol', lengthSec: 555 },
  tut_chest_press_standing: { id: '6-86jEAXA08', title: 'How To: Standing Resistance Band Chest Press', channel: 'Live Lean TV', lengthSec: 60 },
  tut_banded_archer_pushup: { id: '7-4Uq64blA8', title: 'How to do the Archer Push-Up', channel: 'STRIQfit', lengthSec: 177 },
  tut_glute_bridge_loop: { id: '2_Z61SwEuWw', title: 'The Banded Glute Bridge', channel: 'Dr. Carl Baird', lengthSec: 85 },
  tut_band_woodchopper_high_low: { id: '2AvO-FyLiEY', title: 'High to Low Wood Chops with Resistance Bands', channel: 'Bodylastics', lengthSec: 146 },
  tut_pallof_press_anti_rotation: { id: 'y1fOBVtANdM', title: 'How to do a Standing Banded Pallof Press', channel: 'TurnFit', lengthSec: 38 },
  tut_kneeling_cable_crunch_band: { id: 'imWlkp8w1I4', title: 'Kneeling Abs Crunch With Resistance Bands', channel: 'Bodylastics', lengthSec: 153 },
  tut_reverse_bicep_curl_band: { id: '1Zurwnbeq0g', title: 'Standing Reverse Biceps Curl with Resistance Bands', channel: 'Bodylastics', lengthSec: 162 },
  tut_bodyweight_glute_bridge: { id: 'OUgsJ8-Vi0E', title: 'How to Perform the Perfect Glute Bridge', channel: 'Airrosti Rehab Centers', lengthSec: 140 },
  tut_bodyweight_standing_calf_raise: { id: 'k8ipHzKeAkQ', title: 'Standing Calf Raises', channel: 'Children\'s Hospital Colorado', lengthSec: 62 },
  tut_bar_chinup_strict: { id: 'e1YSApl-QcM', title: 'Perfect Chin-Ups: Full Guide', channel: 'Simonster Strength', lengthSec: 250 },
  tut_bodyweight_archer_pushup: { id: 'MxVbNel13Ek', title: 'Archer Push Ups Tutorial | With Progressions', channel: 'Andrew Alinda', lengthSec: 209 },
  tut_band_lying_leg_curl: { id: 'GBXQdlzBxM4', title: 'Lying Hamstrings Curl with Resistance Bands', channel: 'Bodylastics', lengthSec: 202 },
  tut_bodyweight_slider_leg_curl: { id: 'kkkTfzi2gj4', title: 'How To: Slider Leg Curl', channel: 'Kia Khadem', lengthSec: 31 },
  tut_bodyweight_nordic_negative: { id: 'vBgP7bJlgMs', title: 'Nordic Hamstring Curl Negatives', channel: 'Functional Bodybuilding', lengthSec: 21 },
  tut_bodyweight_bulgarian_split_squat: { id: 'hPlKPjohFS0', title: 'The Perfect Bulgarian Split Squat', channel: 'Squat University', lengthSec: 319 },
  tut_bodyweight_step_up: { id: 'WCFCdxzFBa4', title: 'How to do the Step Up: technique and common mistakes', channel: 'Get Exercise Confident', lengthSec: 171 },
  tut_bodyweight_pistol_squat_assisted: { id: 'tiA23NSUm7A', title: 'Assisted Pistol Squat', channel: 'The Barbell Physio', lengthSec: 14 },
  tut_bodyweight_bench_dip: { id: 'c3ZGl4pAwZ4', title: 'How To: Bench Dip', channel: 'ScottHermanFitness', lengthSec: 97 },
  tut_bodyweight_doorframe_row: { id: 'r8NzhNe9Res', title: 'Door Frame Rows', channel: 'Sul Ross State Sports Performance', lengthSec: 66 },
  tut_bodyweight_table_row: { id: 'FKKZRwBJDxE', title: 'Table Rows', channel: 'Andrew Heming', lengthSec: 47 },
  tut_bar_negative_pullup: { id: 'gbPURTSxQLY', title: 'How To Do a Negative Pull-Up', channel: 'Bodybuilding.com', lengthSec: 62 },
  tut_bodyweight_incline_pushup: { id: 'cfns5VDVVvk', title: 'How To Do An Incline Push Up', channel: 'Train With Adby', lengthSec: 133 },
  tut_bodyweight_knee_pushup: { id: 'lFR1GWy1Dcs', title: 'The Knee Push Up', channel: 'Dr. Carl Baird', lengthSec: 125 },

  // Exact single-exercise clips, checked frame by frame (22 Nov 2026).
  tut_bar_chinup_assisted: { id: '6NoWVtcSUyI', title: 'How To: Resistance Band Assisted Chin Up', channel: 'Live Lean TV Daily Exercises', lengthSec: 93 },
  tut_bar_hanging_leg_raise: { id: 'dPwg1E_ygjc', title: 'How To Do Hanging Knee Raises', channel: 'Live Lean TV Daily Exercises', lengthSec: 42 },
  tut_bar_band_lat_pulldown: { id: '2K6U6ScTdUI', title: 'How To Do Resistance Band Lat Pull Down', channel: 'Calixpert', lengthSec: 50 },
  tut_bar_band_face_pull: { id: 'JBpj9-3tP0c', title: 'How To Do Face Pull With Resistance Band', channel: 'Fitness My Life', lengthSec: 49 },
  tut_bar_band_tricep_pushdown: { id: 'p1pmKGJgcr0', title: 'Resistance Band Tricep Pushdown', channel: 'Dale Dymkoski', lengthSec: 54 },
  tut_chest_fly_middle: { id: 'UpyX0O740Gg', title: 'Standing Chest Fly Using Resistance Bands', channel: 'Home Gym Fitness Channel', lengthSec: 76 },
  tut_incline_chest_press: { id: 'RzJMbxUEP9c', title: 'How To Do Incline Chest Press With Resistance Band', channel: 'Fitness My Life', lengthSec: 49 },
  tut_bent_over_row_feet: { id: 'Y3H17rshgZE', title: 'How To Do A Resistance Band Bent Over Row', channel: 'Live Lean TV Daily Exercises', lengthSec: 53 },
  tut_single_arm_lat_row: { id: 'x_SBOiREd8I', title: 'Stagger-Stance Single-Arm Banded Row', channel: 'VP Movement Library', lengthSec: 49 },
  tut_seated_face_pull: { id: 'MJEKj5KnW88', title: 'Banded Face Pull with External Rotation', channel: 'E3 Rehab Exercise Library', lengthSec: 15 },
  tut_overhead_shoulder_press: { id: 'Ky8S6SCcyxI', title: 'How To Do Shoulder Press With Resistance Band', channel: 'Fitness My Life', lengthSec: 50 },
  tut_lateral_deltoid_raise: { id: 'gfEyrmxbCbw', title: 'How To: Resistance Band Lateral Raise', channel: 'Live Lean TV Daily Exercises', lengthSec: 67 },
  tut_front_raise_band: { id: 'LKvx4Y0G57w', title: 'How to do resistance band front raises', channel: 'Famme', lengthSec: 49 },
  tut_standing_bicep_curl: { id: 'AaA7Yj3zHiU', title: 'How to do Bicep curls with resistance bands', channel: 'YuryFit', lengthSec: 26 },
  tut_hammer_curl_band: { id: 'bcond2tqWg0', title: 'Biceps: Resistance Band Hammer Curl', channel: 'Fit Gent', lengthSec: 44 },
  tut_tube_concentration_curl: { id: 'osTYcC1O5TE', title: 'Resistance Band Concentration Curl', channel: 'Sean Chen', lengthSec: 36 },
  tut_overhead_tricep_extension: { id: 'Ewqe_z1HKno', title: 'How to Do Overhead Tricep Extensions with Resistance Bands', channel: 'YuryFit', lengthSec: 56 },
  tut_tricep_pushdown_band: { id: 'Y3CDzx-oj3k', title: 'How To Do Triceps Pushdowns with Resistance Bands', channel: 'Undersun Fitness', lengthSec: 138 },
  tut_band_thruster: { id: 'VSrh6NbPCe0', title: 'How to do a Thruster with resistance bands', channel: 'YuryFit', lengthSec: 35 },
  tut_banded_squat_front: { id: 'hgWgPHewl7U', title: 'How to Do Front Squats with a Resistance Band', channel: 'YuryFit', lengthSec: 39 },
  tut_romanian_deadlift_band: { id: '6jlj3bRgjv8', title: 'Romanian Deadlift (RDL) (Resistance Band)', channel: 'Coach Yash', lengthSec: 39 },
  tut_band_good_morning: { id: 'nk8Gat8_za0', title: 'Band Good Mornings', channel: 'Paul Sandburg Fitness', lengthSec: 47 },
  tut_lateral_band_walk: { id: 'dgbhiejP7oI', title: 'Monster Walks: Gluteal Strengthening', channel: 'Competitive EDGE PT', lengthSec: 77 },
  tut_standing_glute_kickback: { id: 'rONpWaNIhE8', title: 'How To: Band Glute Kickback', channel: 'Kia Khadem', lengthSec: 53 },
  tut_tube_calf_raise: { id: '-c39P9V64tU', title: 'Resistance Band Standing Calf Raise', channel: 'Home Gym Fitness Channel', lengthSec: 86 },
  tut_reverse_fly_band: { id: 'FGoKCNIno-Y', title: 'How To Do Reverse Flys With Resistance Band', channel: 'Fitness My Life', lengthSec: 40 },
  tut_behind_back_bicep_curl: { id: 'g5_WanhBcV4', title: 'Behind The Back Curls with Resistance Bands', channel: 'HomeStrong Fitness', lengthSec: 45 },
  tut_bodyweight_pushup_standard: { id: 'IODxDxX7oi4', title: 'The Perfect Push Up | Do it right!', channel: 'Calisthenicmovement', lengthSec: 217 },
  tut_bodyweight_diamond_pushup: { id: 'J0DnG1_S92I', title: 'How To: Diamond Push-Up', channel: 'ScottHermanFitness', lengthSec: 110 },
  tut_bodyweight_pike_pushup: { id: 'XckEEwa1BPI', title: 'How to do a Pike Push-Up', channel: 'NASM', lengthSec: 17 },
  tut_bodyweight_pushup_downward_dog: { id: 'LCLfv60R9XA', title: 'Push-up to Down Dog', channel: 'TrainFTW', lengthSec: 22 },
  tut_bodyweight_superman_pulses: { id: '0rVIf0RpZcA', title: 'How To Do A Superman with Pull', channel: 'Live Lean TV Daily Exercises', lengthSec: 31 },
  tut_bodyweight_air_squat: { id: 'P-yaD24bUE8', title: 'Bodyweight Squat Tutorial - Proper Form and Technique', channel: 'Runna', lengthSec: 47 },
  tut_bodyweight_sumo_squat_pulse: { id: 'GGVLjBEjmRQ', title: 'Sumo Squat Pulse', channel: 'VIRFIT', lengthSec: 33 },
  tut_bodyweight_reverse_lunge: { id: '5frs7_F2SrU', title: 'Alternating Reverse Lunge', channel: 'Melita ReGen Lab', lengthSec: 33 },
  tut_bodyweight_jump_squats: { id: 'QQWsscOgGkU', title: 'How To Jump Squat', channel: 'Nuffield Health', lengthSec: 46 },
  tut_bodyweight_bicycle_crunches: { id: 'eqg47ZuGZXQ', title: 'Strengthening the core: Bicycle Crunch', channel: 'UCLA Health', lengthSec: 59 },
  tut_bodyweight_v_ups: { id: 'n5cSgOvk53U', title: 'How To Do V-Ups', channel: 'Alas Family Adventures', lengthSec: 117 },
  tut_bodyweight_mountain_climbers: { id: 'YQbLbj57DqY', title: 'How To: Cross Body Mountain Climber', channel: 'Live Lean TV Daily Exercises', lengthSec: 33 },
  tut_bodyweight_plank_shoulder_taps: { id: 'wcKyqAMqueQ', title: 'How to do Shoulder Taps', channel: 'Bodybuilding.com', lengthSec: 44 },
  tut_bodyweight_full_burpees: { id: 'NCqbpkoiyXE', title: 'How To Burpee', channel: 'Nuffield Health', lengthSec: 52 },
  tut_door_high_lat_pulldown: { id: '_97pmOC2tzE', title: 'How To Do Lat Pull Down With Resistance Band', channel: 'Fitness My Life', lengthSec: 57 },
  tut_bodyweight_single_leg_calf_raise: { id: 'qPd73snQfUs', title: 'Single-Leg Calf Raise', channel: 'Hospital for Special Surgery', lengthSec: 30 },
  tut_bodyweight_side_lunge: { id: 'MvpBUsQrt_4', title: 'Lateral Lunges', channel: 'MGH Orthopaedics', lengthSec: 28 },
  tut_band_upright_row: { id: 'VhpnXlphu88', title: 'Band Upright Row', channel: 'FitnessBlender', lengthSec: 43 },
  tut_band_pull_apart: { id: 'pct3bP74WSw', title: 'Band Pull Apart', channel: 'The Active Life', lengthSec: 23 },
  tut_band_overhead_squat: { id: 'hHHpLMFxhvk', title: 'Resistance Band Overhead Squat', channel: 'Ambitious Athletics', lengthSec: 57 },
  tut_band_tricep_kickback: { id: 'YGkG8ApcqTE', title: 'How to do a Resistance Band Triceps Kickback', channel: 'Nutrient Health', lengthSec: 40 },
  tut_bodyweight_leg_scissors: { id: 'aqMfWavH2X4', title: 'How To Do A Scissor Kick', channel: 'Live Lean TV Daily Exercises', lengthSec: 24 },
  tut_bodyweight_long_arm_crunch: { id: '29lmlWvqXTE', title: 'How To: Long Arm Crunch', channel: 'Live Lean TV Daily Exercises', lengthSec: 64 },
  tut_bodyweight_side_plank_rotation: { id: 'yaiF53lSVHI', title: 'Side Plank Thread the Needle', channel: 'Andy Vincent', lengthSec: 30 },
  tut_bodyweight_plank_crunch: { id: 'I_syux99Bug', title: 'Plank Knee to Elbow', channel: 'I am Workoutic', lengthSec: 40 },
  tut_bodyweight_plank: { id: 'mwlp75MS6Rg', title: 'How to do a Plank | Proper Form & Technique', channel: 'NASM', lengthSec: 14 },
} as const;

export type VideoSourceKey = keyof typeof VIDEO_SOURCES;
export type VideoMatch = 'exact' | 'close' | 'variant';

export interface ExerciseVideoCue {
  source: VideoSourceKey;
  start: number; // seconds
  match: VideoMatch;
  label: string; // what the video actually shows at `start`
}

export const EXERCISE_VIDEO_CUES: Record<string, ExerciseVideoCue> = {
  // --- Pull / bar ---
  'bar-pullup-assisted':        { source: 'thenx', start: 290,  match: 'exact',   label: 'Assisted Pull-Ups (band)' },

  // --- Push ---
  'chest-pushup-banded':        { source: 'thenx', start: 239,  match: 'exact',   label: 'Level 1 Push-Ups (band resisted)' },

  // --- Arms ---

  // --- Legs / hinge ---
  'chris-heria-deadlift':       { source: 'thenx', start: 260,  match: 'exact',   label: 'Deadlift (resistance band)' },
  'banded-lunges':              { source: 'thenx', start: 390,  match: 'exact',   label: 'Reverse Lunges (resistance band)' },

  // --- Bodyweight (Rowan Row) ---

  // --- Added exercises ---
  'band-single-leg-rdl':            { source: 'thenx', start: 271,  match: 'exact',   label: 'Single-Leg Romanian Deadlift (band)' },
  'bar-band-assisted-dip':          { source: 'thenx', start: 218,  match: 'exact',   label: 'Straight Bar Dips (band assistance)' },
  'bar-band-planche-lean':          { source: 'thenx', start: 437,  match: 'exact',   label: 'Assisted Planche Leans' },
  'bar-band-front-lever-raise':     { source: 'thenx', start: 460,  match: 'exact',   label: 'Assisted Front Lever Raises' },

  // Single-exercise tutorials (start at 0)
  'bar-pullup-strict': { source: 'tut_bar_pullup_strict', start: 0, match: 'exact', label: 'The Perfect Pull Up - Do it right!' },
  'bar-dead-hang': { source: 'tut_bar_dead_hang', start: 0, match: 'exact', label: 'How To Dead Hang The Right Way' },
  'chest-press-standing': { source: 'tut_chest_press_standing', start: 0, match: 'exact', label: 'How To: Standing Resistance Band Chest Press' },
  'banded-archer-pushup': { source: 'tut_banded_archer_pushup', start: 0, match: 'exact', label: 'Archer Push-Up (add the band across your back)' },
  'glute-bridge-loop': { source: 'tut_glute_bridge_loop', start: 0, match: 'exact', label: 'The Banded Glute Bridge' },
  'band-woodchopper-high-low': { source: 'tut_band_woodchopper_high_low', start: 0, match: 'exact', label: 'High to Low Wood Chops with Resistance Bands' },
  'pallof-press-anti-rotation': { source: 'tut_pallof_press_anti_rotation', start: 0, match: 'exact', label: 'How to do a Standing Banded Pallof Press' },
  'kneeling-cable-crunch-band': { source: 'tut_kneeling_cable_crunch_band', start: 0, match: 'exact', label: 'Kneeling Abs Crunch With Resistance Bands' },
  'reverse-bicep-curl-band': { source: 'tut_reverse_bicep_curl_band', start: 0, match: 'exact', label: 'Standing Reverse Biceps Curl with Resistance Bands' },
  'bodyweight-glute-bridge': { source: 'tut_bodyweight_glute_bridge', start: 0, match: 'exact', label: 'How to Perform the Perfect Glute Bridge' },
  'bodyweight-standing-calf-raise': { source: 'tut_bodyweight_standing_calf_raise', start: 0, match: 'exact', label: 'Standing Calf Raises' },
  'bar-chinup-strict': { source: 'tut_bar_chinup_strict', start: 0, match: 'exact', label: 'Perfect Chin-Ups: Full Guide' },
  'bodyweight-archer-pushup': { source: 'tut_bodyweight_archer_pushup', start: 0, match: 'exact', label: 'Archer Push Ups Tutorial | With Progressions' },
  'band-lying-leg-curl': { source: 'tut_band_lying_leg_curl', start: 0, match: 'exact', label: 'Lying Hamstrings Curl with Resistance Bands' },
  'bodyweight-slider-leg-curl': { source: 'tut_bodyweight_slider_leg_curl', start: 0, match: 'exact', label: 'How To: Slider Leg Curl' },
  'bodyweight-nordic-negative': { source: 'tut_bodyweight_nordic_negative', start: 0, match: 'exact', label: 'Nordic Hamstring Curl Negatives' },
  'bodyweight-bulgarian-split-squat': { source: 'tut_bodyweight_bulgarian_split_squat', start: 0, match: 'exact', label: 'The Perfect Bulgarian Split Squat' },
  'bodyweight-step-up': { source: 'tut_bodyweight_step_up', start: 0, match: 'exact', label: 'How to do the Step Up: technique and common mistakes' },
  'bodyweight-pistol-squat-assisted': { source: 'tut_bodyweight_pistol_squat_assisted', start: 0, match: 'exact', label: 'Assisted Pistol Squat' },
  'bodyweight-bench-dip': { source: 'tut_bodyweight_bench_dip', start: 0, match: 'exact', label: 'How To: Bench Dip' },
  'bodyweight-doorframe-row': { source: 'tut_bodyweight_doorframe_row', start: 0, match: 'exact', label: 'Door Frame Rows' },
  'bodyweight-table-row': { source: 'tut_bodyweight_table_row', start: 0, match: 'exact', label: 'Table Rows' },
  'bar-negative-pullup': { source: 'tut_bar_negative_pullup', start: 0, match: 'exact', label: 'How To Do a Negative Pull-Up' },
  'bodyweight-incline-pushup': { source: 'tut_bodyweight_incline_pushup', start: 0, match: 'exact', label: 'How To Do An Incline Push Up' },
  'bodyweight-knee-pushup': { source: 'tut_bodyweight_knee_pushup', start: 0, match: 'exact', label: 'The Knee Push Up' },
  // Exact single-exercise clips (replace estimated compilation timestamps).
  'bar-chinup-assisted': { source: 'tut_bar_chinup_assisted', start: 4, match: 'exact', label: 'How To: Resistance Band Assisted Chin Up' },
  'bar-hanging-leg-raise': { source: 'tut_bar_hanging_leg_raise', start: 4, match: 'exact', label: 'How To Do Hanging Knee Raises' },
  'bar-band-lat-pulldown': { source: 'tut_bar_band_lat_pulldown', start: 0, match: 'exact', label: 'How To Do Resistance Band Lat Pull Down' },
  'bar-band-face-pull': { source: 'tut_bar_band_face_pull', start: 0, match: 'exact', label: 'How To Do Face Pull With Resistance Band' },
  'bar-band-tricep-pushdown': { source: 'tut_bar_band_tricep_pushdown', start: 0, match: 'exact', label: 'Resistance Band Tricep Pushdown' },
  'chest-fly-middle': { source: 'tut_chest_fly_middle', start: 0, match: 'exact', label: 'Standing Chest Fly Using Resistance Bands' },
  'incline-chest-press': { source: 'tut_incline_chest_press', start: 0, match: 'exact', label: 'How To Do Incline Chest Press With Resistance Band' },
  'bent-over-row-feet': { source: 'tut_bent_over_row_feet', start: 4, match: 'exact', label: 'How To Do A Resistance Band Bent Over Row' },
  'single-arm-lat-row': { source: 'tut_single_arm_lat_row', start: 0, match: 'exact', label: 'Stagger-Stance Single-Arm Banded Row' },
  'seated-face-pull': { source: 'tut_seated_face_pull', start: 0, match: 'exact', label: 'Banded Face Pull with External Rotation' },
  'overhead-shoulder-press': { source: 'tut_overhead_shoulder_press', start: 0, match: 'exact', label: 'How To Do Shoulder Press With Resistance Band' },
  'lateral-deltoid-raise': { source: 'tut_lateral_deltoid_raise', start: 4, match: 'exact', label: 'How To: Resistance Band Lateral Raise' },
  'front-raise-band': { source: 'tut_front_raise_band', start: 0, match: 'exact', label: 'How to do resistance band front raises' },
  'standing-bicep-curl': { source: 'tut_standing_bicep_curl', start: 0, match: 'exact', label: 'How to do Bicep curls with resistance bands' },
  'hammer-curl-band': { source: 'tut_hammer_curl_band', start: 0, match: 'exact', label: 'Biceps: Resistance Band Hammer Curl' },
  'tube-concentration-curl': { source: 'tut_tube_concentration_curl', start: 0, match: 'exact', label: 'Resistance Band Concentration Curl' },
  'overhead-tricep-extension': { source: 'tut_overhead_tricep_extension', start: 0, match: 'exact', label: 'How to Do Overhead Tricep Extensions with Resistance Bands' },
  'tricep-pushdown-band': { source: 'tut_tricep_pushdown_band', start: 0, match: 'exact', label: 'How To Do Triceps Pushdowns with Resistance Bands' },
  'band-thruster': { source: 'tut_band_thruster', start: 0, match: 'exact', label: 'How to do a Thruster with resistance bands' },
  'banded-squat-front': { source: 'tut_banded_squat_front', start: 0, match: 'exact', label: 'How to Do Front Squats with a Resistance Band' },
  'romanian-deadlift-band': { source: 'tut_romanian_deadlift_band', start: 0, match: 'exact', label: 'Romanian Deadlift (RDL) (Resistance Band)' },
  'band-good-morning': { source: 'tut_band_good_morning', start: 0, match: 'exact', label: 'Band Good Mornings' },
  'lateral-band-walk': { source: 'tut_lateral_band_walk', start: 0, match: 'exact', label: 'Monster Walks: Gluteal Strengthening' },
  'standing-glute-kickback': { source: 'tut_standing_glute_kickback', start: 0, match: 'exact', label: 'How To: Band Glute Kickback' },
  'tube-calf-raise': { source: 'tut_tube_calf_raise', start: 0, match: 'exact', label: 'Resistance Band Standing Calf Raise' },
  'reverse-fly-band': { source: 'tut_reverse_fly_band', start: 0, match: 'exact', label: 'How To Do Reverse Flys With Resistance Band' },
  'behind-back-bicep-curl': { source: 'tut_behind_back_bicep_curl', start: 0, match: 'exact', label: 'Behind The Back Curls with Resistance Bands' },
  'bodyweight-pushup-standard': { source: 'tut_bodyweight_pushup_standard', start: 0, match: 'exact', label: 'The Perfect Push Up | Do it right!' },
  'bodyweight-diamond-pushup': { source: 'tut_bodyweight_diamond_pushup', start: 0, match: 'exact', label: 'How To: Diamond Push-Up' },
  'bodyweight-pike-pushup': { source: 'tut_bodyweight_pike_pushup', start: 0, match: 'exact', label: 'How to do a Pike Push-Up' },
  'bodyweight-pushup-downward-dog': { source: 'tut_bodyweight_pushup_downward_dog', start: 0, match: 'exact', label: 'Push-up to Down Dog' },
  'bodyweight-superman-pulses': { source: 'tut_bodyweight_superman_pulses', start: 4, match: 'exact', label: 'How To Do A Superman with Pull' },
  'bodyweight-air-squat': { source: 'tut_bodyweight_air_squat', start: 0, match: 'exact', label: 'Bodyweight Squat Tutorial - Proper Form and Technique' },
  'bodyweight-sumo-squat-pulse': { source: 'tut_bodyweight_sumo_squat_pulse', start: 0, match: 'exact', label: 'Sumo Squat Pulse' },
  'bodyweight-reverse-lunge': { source: 'tut_bodyweight_reverse_lunge', start: 0, match: 'exact', label: 'Alternating Reverse Lunge' },
  'bodyweight-jump-squats': { source: 'tut_bodyweight_jump_squats', start: 0, match: 'exact', label: 'How To Jump Squat' },
  'bodyweight-bicycle-crunches': { source: 'tut_bodyweight_bicycle_crunches', start: 0, match: 'exact', label: 'Strengthening the core: Bicycle Crunch' },
  'bodyweight-v-ups': { source: 'tut_bodyweight_v_ups', start: 0, match: 'exact', label: 'How To Do V-Ups' },
  'bodyweight-mountain-climbers': { source: 'tut_bodyweight_mountain_climbers', start: 4, match: 'exact', label: 'How To: Cross Body Mountain Climber' },
  'bodyweight-plank-shoulder-taps': { source: 'tut_bodyweight_plank_shoulder_taps', start: 0, match: 'exact', label: 'How to do Shoulder Taps' },
  'bodyweight-full-burpees': { source: 'tut_bodyweight_full_burpees', start: 0, match: 'exact', label: 'How To Burpee' },
  'door-high-lat-pulldown': { source: 'tut_door_high_lat_pulldown', start: 0, match: 'exact', label: 'How To Do Lat Pull Down With Resistance Band' },
  'bodyweight-single-leg-calf-raise': { source: 'tut_bodyweight_single_leg_calf_raise', start: 0, match: 'exact', label: 'Single-Leg Calf Raise' },
  'bodyweight-side-lunge': { source: 'tut_bodyweight_side_lunge', start: 0, match: 'exact', label: 'Lateral Lunges' },
  'band-upright-row': { source: 'tut_band_upright_row', start: 0, match: 'exact', label: 'Band Upright Row' },
  'band-pull-apart': { source: 'tut_band_pull_apart', start: 0, match: 'exact', label: 'Band Pull Apart' },
  'band-overhead-squat': { source: 'tut_band_overhead_squat', start: 0, match: 'exact', label: 'Resistance Band Overhead Squat' },
  'band-tricep-kickback': { source: 'tut_band_tricep_kickback', start: 0, match: 'exact', label: 'How to do a Resistance Band Triceps Kickback' },
  'bodyweight-leg-scissors': { source: 'tut_bodyweight_leg_scissors', start: 4, match: 'exact', label: 'How To Do A Scissor Kick' },
  'bodyweight-long-arm-crunch': { source: 'tut_bodyweight_long_arm_crunch', start: 4, match: 'exact', label: 'How To: Long Arm Crunch' },
  'bodyweight-side-plank-rotation': { source: 'tut_bodyweight_side_plank_rotation', start: 0, match: 'exact', label: 'Side Plank Thread the Needle' },
  'bodyweight-plank-crunch': { source: 'tut_bodyweight_plank_crunch', start: 0, match: 'exact', label: 'Plank Knee to Elbow' },
  'bodyweight-plank': { source: 'tut_bodyweight_plank', start: 0, match: 'exact', label: 'How to do a Plank | Proper Form & Technique' },
};

/** Back-compat: id → timestamped URL (only verified cues). */
export const EXERCISE_YOUTUBE_TIMESTAMPS: Record<string, string> = Object.fromEntries(
  Object.entries(EXERCISE_VIDEO_CUES).map(([id, c]) => [id, `https://youtu.be/${VIDEO_SOURCES[c.source].id}?t=${c.start}`])
);

export function getExerciseVideoCue(exerciseId: string): ExerciseVideoCue | undefined {
  return EXERCISE_VIDEO_CUES[exerciseId];
}

export function getExerciseVideoSource(exerciseId: string) {
  const cue = EXERCISE_VIDEO_CUES[exerciseId];
  return cue ? VIDEO_SOURCES[cue.source] : undefined;
}

/**
 * Timestamped demo URL when a verified cue exists; otherwise a targeted
 * YouTube search (never a bare, un-timestamped long video).
 */
export function getExerciseYoutubeUrl(exerciseId: string, exerciseName?: string): string {
  const url = EXERCISE_YOUTUBE_TIMESTAMPS[exerciseId];
  if (url) return url;
  const query = encodeURIComponent((exerciseName || exerciseId.replace(/-/g, ' ')) + ' exercise form tutorial');
  return `https://www.youtube.com/results?search_query=${query}`;
}

/** "MM:SS" label for verified cues, '' otherwise. */
export function getExerciseTimestampLabel(exerciseId: string): string {
  const cue = EXERCISE_VIDEO_CUES[exerciseId];
  if (!cue) return '';
  const m = Math.floor(cue.start / 60);
  const s = cue.start % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const RAW_EXERCISES: Exercise[] = [
  // =========================================================================
  // 1. VERTICAL PULL & CALISTHENICS
  // =========================================================================
  {
    id: 'bar-pullup-assisted',
    name: 'Band-Assisted Pull-Up',
    targetMuscle: 'Back',
    secondaryMuscles: ['Biceps', 'Forearms', 'Core'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Bar',
    difficulty: 'Beginner',
    requiresBand: true,
    requiresBar: true,
    avatarAnimation: 'pullup-assisted',
    sourceVideo: {
      title: '20 Best Exercises You Can Do With A Resistance Band',
      channel: 'Thenx (Chris Heria)',
      youtubeUrl: 'https://youtu.be/hQ2lHMP4kco',
    },
    instructions: [
      'Loop your resistance band around the center of the pull-up bar and pull one end through the other to girth-hitch it securely.',
      'Grip the bar slightly wider than shoulder-width with palms facing away (overhand grip).',
      'Step one foot (or knee) into the bottom loop of the hanging band, with your other leg crossed over for stability.',
      'Hang with full arm extension and shoulders engaged (no sagging).',
      'Drive your elbows down and back towards your ribs, pulling your chest up towards the bar until your chin clears the bar.',
      'Pause for a split second at the top, then slowly lower yourself down over 2-3 seconds until arms are straight.',
    ],
    formCues: [
      'Lead with your chest, not your chin; avoid craning your neck forward.',
      'Squeeze your lats and depress your scapulae before initiating the bend at the elbows.',
      'Keep your core braced so the band doesn’t swing your legs back and forth.',
    ],
    tips: 'Progress down to lighter band resistance as your strength increases until you achieve strict bodyweight pull-ups.',
    estimatedCaloriesPerMin: 9.0,
  },
  {
    id: 'bar-chinup-assisted',
    name: 'Band-Assisted Chin-Up',
    targetMuscle: 'Biceps',
    secondaryMuscles: ['Back', 'Forearms', 'Core'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Bar',
    difficulty: 'Beginner',
    requiresBand: true,
    requiresBar: true,
    avatarAnimation: 'chinup-assisted',
    sourceVideo: {
      title: '20 Best Exercises You Can Do With A Resistance Band',
      channel: 'Thenx (Chris Heria)',
      youtubeUrl: 'https://youtu.be/hQ2lHMP4kco',
    },
    instructions: [
      'Hitch your loop band around the pull-up bar.',
      'Grip the bar shoulder-width apart with palms facing towards you (supinated grip).',
      'Place your foot or knee into the loop for upward assistance.',
      'Pull upward smoothly, driving elbows down, until your chin easily clears the bar and biceps reach maximum contraction.',
      'Lower yourself down with a slow, controlled negative.',
    ],
    formCues: [
      'The supinated underhand grip maximizes bicep recruitment along with the lower lats.',
      'Do not kick your legs; let the band provide the constant linear spring assist.',
    ],
    tips: 'Chin-ups are easier on the shoulder joints than wide pull-ups and develop thick bicep peaks.',
    estimatedCaloriesPerMin: 8.5,
  },
  {
    id: 'bar-pullup-strict',
    name: 'Strict Bodyweight Pull-Up',
    targetMuscle: 'Back',
    secondaryMuscles: ['Biceps', 'Shoulders', 'Core'],
    bandType: 'Loop Band',
    anchorPosition: 'Bar',
    difficulty: 'Advanced',
    requiresBand: false,
    requiresBar: true,
    avatarAnimation: 'pullup-strict',
    instructions: [
      'Grip the pull-up bar slightly wider than shoulder-width with overhand grip.',
      'From a dead hang, engage your shoulder blades by pulling them down and together.',
      'Pull yourself upward with zero momentum or kipping until your chin clears the bar.',
      'Pause at the peak, then lower yourself down to a full dead hang.',
    ],
    formCues: [
      'Dead stop at the bottom of each rep to eliminate swinging.',
      'Squeeze your glutes and point your toes slightly forward in a hollow-body calisthenic hold.',
    ],
    tips: 'The gold standard of upper-body pulling strength.',
    estimatedCaloriesPerMin: 9.5,
  },
  {
    id: 'bar-hanging-leg-raise',
    name: 'Hanging Leg / Knee Raise',
    targetMuscle: 'Core',
    secondaryMuscles: ['Forearms', 'Back'],
    bandType: 'Loop Band',
    anchorPosition: 'Bar',
    difficulty: 'Intermediate',
    requiresBand: false,
    requiresBar: true,
    avatarAnimation: 'hanging-knee-raise',
    sourceVideo: {
      title: '20 Best Exercises You Can Do With A Resistance Band',
      channel: 'Thenx (Chris Heria)',
      youtubeUrl: 'https://youtu.be/hQ2lHMP4kco',
    },
    instructions: [
      'Hang from your pull-up bar with an overhand grip, shoulders engaged.',
      'Brace your abdominal core and tilt your pelvis backward.',
      'Raise your straight legs (or bent knees for beginner modification) up until they are parallel to the floor or higher.',
      'Hold the top contraction for 1 second, then lower your legs slowly without swinging.',
    ],
    formCues: [
      'Do not use momentum to swing legs up; flex your lower core to curl the pelvis.',
      'Exhale sharply at the peak of the raise.',
    ],
    tips: 'Keep ribs compressed to maximize lower core recruitment.',
    estimatedCaloriesPerMin: 7.0,
  },
  {
    id: 'bar-band-lat-pulldown',
    name: 'Bar Lat Pulldown',
    targetMuscle: 'Back',
    secondaryMuscles: ['Biceps', 'Shoulders'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Bar',
    difficulty: 'Beginner',
    requiresBand: true,
    requiresBar: true,
    avatarAnimation: 'lat-pulldown',
    instructions: [
      'Hitch your band over the top of the pull-up bar.',
      'Kneel on the floor facing the bar, holding both sides of the band with arms extended overhead.',
      'Lean back very slightly with a proud chest.',
      'Drive your elbows down and back, pulling the band down to your upper clavicles.',
      'Squeeze your lats hard for 2 seconds, then let the band slowly pull your arms back up to a deep lat stretch.',
    ],
    formCues: [
      'Keep your torso locked at a 10-15 degree backward angle; do not rock back and forth.',
      'Focus on elbow movement rather than hand pulling.',
    ],
    tips: 'Allows you to achieve high-rep hypertrophy volume for the lats without bodyweight fatigue.',
    estimatedCaloriesPerMin: 6.5,
  },
  {
    id: 'bar-band-face-pull',
    name: 'High Band Face Pull',
    targetMuscle: 'Shoulders',
    secondaryMuscles: ['Back'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Bar',
    difficulty: 'Beginner',
    requiresBand: true,
    requiresBar: true,
    avatarAnimation: 'face-pull',
    sourceVideo: {
      title: '20 Best Exercises You Can Do With A Resistance Band',
      channel: 'Thenx (Chris Heria)',
      youtubeUrl: 'https://youtu.be/hQ2lHMP4kco',
    },
    instructions: [
      'Attach your band high to the bar or anchor.',
      'Step back holding both sides of the band with palms facing inward or down.',
      'Pull the band directly towards your forehead and nose, flaring your elbows high and pulling hands apart.',
      'Externally rotate your shoulders at the end so thumbs point backwards.',
      'Hold for 2 seconds, then slowly return under tension.',
    ],
    formCues: [
      'Keep elbows higher than wrists throughout the pull.',
      'Essential movement for bulletproofing rotator cuffs and reversing slouching posture.',
    ],
    tips: 'Focus on mind-muscle connection with the rear delts rather than using excessive band tension.',
    estimatedCaloriesPerMin: 5.5,
  },
  {
    id: 'bar-band-tricep-pushdown',
    name: 'Bar Tricep Pushdown',
    targetMuscle: 'Triceps',
    secondaryMuscles: ['Forearms'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Bar',
    difficulty: 'Beginner',
    requiresBand: true,
    requiresBar: true,
    avatarAnimation: 'tricep-pushdown',
    instructions: [
      'Loop your resistance band over the center of the bar.',
      'Stand facing the bar, grasp the handles or band with elbows tucked tight to your ribs at a 90-degree angle.',
      'Extend your forearms downward until your elbows are completely locked out, spreading the band slightly at the bottom.',
      'Squeeze your triceps at the bottom for 1 second, then control the return up to 90 degrees.',
    ],
    formCues: [
      'Keep upper arms stationary; only forearms should move.',
      'Do not let shoulders roll forward.',
    ],
    tips: 'Spreading the band apart at full extension maximizes horseshoe tricep contraction.',
    estimatedCaloriesPerMin: 6.0,
  },
  {
    id: 'bar-dead-hang',
    name: 'Spine Decompression Hang',
    targetMuscle: 'Back',
    secondaryMuscles: ['Forearms', 'Shoulders'],
    bandType: 'Loop Band',
    anchorPosition: 'Bar',
    difficulty: 'Beginner',
    requiresBand: false,
    requiresBar: true,
    avatarAnimation: 'dead-hang',
    instructions: [
      'Grip the bar shoulder-width apart.',
      'Step off the floor and allow your full bodyweight to hang freely.',
      'Relax your spine and breathe deeply into your belly, allowing gravity to decompress your vertebrae and stretch your lats.',
      'Hold for 30 to 60 seconds.',
    ],
    formCues: [
      'Breathe slowly and deeply to facilitate thoracic relaxation.',
      'Builds tremendous grip endurance and shoulder joint mobility.',
    ],
    tips: 'Perfect recovery finisher at the end of every workout session.',
    estimatedCaloriesPerMin: 3.5,
  },

  // =========================================================================
  // 2. CHEST WORKOUTS (FITNESS MY LIFE & THENX INSPIRED)
  // =========================================================================
  {
    id: 'chest-press-standing',
    name: 'Standing Resistance Band Chest Press',
    targetMuscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Shoulders'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Door Middle',
    difficulty: 'Beginner',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'chest-press',
    sourceVideo: {
      title: 'Resistance Band (Tube) Full Body Workout for Lean Muscle Mass',
      channel: 'Fitness My Life',
      youtubeUrl: 'https://youtu.be/njGZClD94bg',
    },
    instructions: [
      'Anchor the band at mid-chest height behind you (or loop around back).',
      'Face away from the anchor, take a handle in each hand, and step forward into a staggered stance to create tension.',
      'Bring your hands to chest height with elbows bent at 90 degrees.',
      'Press both handles straight forward until your arms are extended, squeezing your pecs at peak contraction.',
      'Slowly return to starting position under control (2-3 seconds).'
    ],
    formCues: [
      'Keep your core tight and do not lean excessively forward.',
      'Keep wrists aligned with forearms, do not bend wrists back.',
      'Control the eccentric (return) phase - do not let the band snap you backward.'
    ],
    tips: 'Squeeze your chest muscles together as if hugging a barrel at the end of the press.',
    estimatedCaloriesPerMin: 6.5,
  },
  {
    id: 'chest-fly-middle',
    name: 'Mid-Chest Resistance Fly',
    targetMuscle: 'Chest',
    secondaryMuscles: ['Shoulders'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Door Middle',
    difficulty: 'Intermediate',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'chest-fly',
    instructions: [
      'Anchor band at chest level. Face away and hold loop band with arms extended out to your sides with a slight bend in the elbows.',
      'Step forward until there is moderate tension on the bands.',
      'Bring your hands forward in a wide hugging arc until your hands meet in front of your chest.',
      'Squeeze the inner chest at the peak for 1 second, then slowly open arms back up.'
    ],
    formCues: [
      'Maintain the same slight bend in your elbows throughout the movement.',
      'Do not let the bands pull your elbows behind your torso.'
    ],
    tips: 'Imagine hugging a large tree trunk; avoid turning it into a press.',
    estimatedCaloriesPerMin: 6.0,
  },
  {
    id: 'chest-pushup-banded',
    name: 'Banded Overload Push-Up',
    targetMuscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Core'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Behind Back',
    difficulty: 'Intermediate',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'pushup',
    sourceVideo: {
      title: '20 Best Exercises You Can Do With A Resistance Band',
      channel: 'Thenx (Chris Heria)',
      youtubeUrl: 'https://youtu.be/hQ2lHMP4kco',
    },
    instructions: [
      'Loop your Slovic loop band across your upper back and hold each end underneath your palms on the floor.',
      'Assume a solid high plank position with feet hip-width apart.',
      'Lower your chest toward the floor until your elbows reach 90 degrees.',
      'Powerfully press the floor away against the band resistance to full lockout.'
    ],
    formCues: [
      'Keep glutes and core squeezed so hips do not sag.',
      'Tuck elbows at roughly 45 degrees to protect shoulders.'
    ],
    tips: 'Peak resistance occurs at the top of the pushup where your chest is strongest.',
    estimatedCaloriesPerMin: 7.5,
  },
  {
    id: 'banded-archer-pushup',
    name: 'Banded Archer Push-Up',
    targetMuscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Shoulders', 'Core'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Behind Back',
    difficulty: 'Advanced',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'archer-pushup',
    sourceVideo: {
      title: '20 Best Exercises You Can Do With A Resistance Band',
      channel: 'Thenx (Chris Heria)',
      youtubeUrl: 'https://youtu.be/hQ2lHMP4kco',
    },
    instructions: [
      'With the Slovic band across your back, take an ultra-wide push-up stance.',
      'Lower your body diagonally towards one side, bending that working elbow while keeping the opposite arm straight like an archer drawing a bow.',
      'Press through the working chest to return to center, then alternate to the other side.',
    ],
    formCues: [
      'Advanced calisthenic unilateral chest overloading exercise.',
      'Keep your pelvis level with the floor throughout.',
    ],
    tips: 'A staple Chris Heria move for developing one-arm push-up strength.',
    estimatedCaloriesPerMin: 8.5,
  },
  {
    id: 'incline-chest-press',
    name: 'Low-to-High Incline Press',
    targetMuscle: 'Chest',
    secondaryMuscles: ['Shoulders', 'Triceps'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Door Low',
    difficulty: 'Intermediate',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'incline-press',
    instructions: [
      'Anchor the band low to the floor behind you (or step on band with back foot).',
      'Face away from the anchor with handles at hip level, palms facing forward.',
      'Press handles up and forward at a 45-degree angle toward eye level.',
      'Focus on contracting the upper clavicular chest at the top of the motion.'
    ],
    formCues: [
      'Do not arch your lower back as you press upward; keep your core tight.',
      'Think of moving your elbows inward and upward.'
    ],
    tips: 'Essential for sculpting the upper shelf of the chest.',
    estimatedCaloriesPerMin: 6.5,
  },

  // =========================================================================
  // 3. BACK & POSTURE (TOM PETO & FITNESS MY LIFE INSPIRED)
  // =========================================================================
  {
    id: 'bent-over-row-feet',
    name: 'Bent-Over Double Band Row',
    targetMuscle: 'Back',
    secondaryMuscles: ['Biceps', 'Hamstrings'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Under Feet',
    difficulty: 'Beginner',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'bent-over-row',
    sourceVideo: {
      title: 'Resistance Band (Tube) Full Body Workout for Lean Muscle Mass',
      channel: 'Fitness My Life',
      youtubeUrl: 'https://youtu.be/njGZClD94bg',
    },
    instructions: [
      'Stand on the middle of the band with feet shoulder-width apart.',
      'Hinge at your hips with a flat back and soft knees until your torso is at roughly 45 degrees.',
      'Hold loop band with arms hanging straight down.',
      'Pull your elbows back past your ribs, squeezing your shoulder blades together tightly at the top.',
      'Lower slowly back down under control.'
    ],
    formCues: [
      'Maintain a neutral spine throughout - do not round your lower back.',
      'Pull with your elbows, not your biceps.'
    ],
    tips: 'To increase resistance, cross the bands in an "X" in front of your shins before pulling.',
    estimatedCaloriesPerMin: 7.0,
  },
  {
    id: 'single-arm-lat-row',
    name: 'Single-Arm Staggered Lat Row',
    targetMuscle: 'Back',
    secondaryMuscles: ['Biceps', 'Core'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Door Middle',
    difficulty: 'Intermediate',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'single-arm-row',
    instructions: [
      'Anchor band at mid height. Hold handle in right hand and step back with right leg into a deep lunge stance.',
      'Lean torso forward slightly, extending your right arm toward the anchor.',
      'Drive your right elbow back close to your hip, rotating your wrist as you pull.',
      'Hold for 1 second, then extend forward.'
    ],
    formCues: [
      'Resist twisting your torso as you row - use your core to stay square to the anchor.',
      'Feel the deep lat stretch at full arm extension.'
    ],
    tips: 'Isolates each lat individually to correct muscle imbalances.',
    estimatedCaloriesPerMin: 6.5,
  },
  {
    id: 'seated-face-pull',
    name: 'Mid-Anchor Face Pull & External Rotation',
    targetMuscle: 'Shoulders',
    secondaryMuscles: ['Back'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Door Middle',
    difficulty: 'Beginner',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'mid-face-pull',
    instructions: [
      'Anchor band at eye/chest level.',
      'Hold loop band with an overhand grip and take a few steps back to create tension.',
      'Pull the band toward your face, driving elbows wide and high while rotating wrists up.',
      'End with your knuckles facing behind you at ear level.'
    ],
    formCues: [
      'Do not thrust your neck forward to meet the band.',
      'Keep shoulder blades down and back.'
    ],
    tips: 'The single best exercise for counteracting desk-slouch and rounded shoulders.',
    estimatedCaloriesPerMin: 5.5,
  },

  // =========================================================================
  // 4. SHOULDERS & DELTOIDS
  // =========================================================================
  {
    id: 'overhead-shoulder-press',
    name: 'Standing Band Overhead Shoulder Press',
    targetMuscle: 'Shoulders',
    secondaryMuscles: ['Triceps', 'Core'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Under Feet',
    difficulty: 'Intermediate',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'overhead-press',
    sourceVideo: {
      title: 'Resistance Band (Tube) Full Body Workout for Lean Muscle Mass',
      channel: 'Fitness My Life',
      youtubeUrl: 'https://youtu.be/njGZClD94bg',
    },
    instructions: [
      'Stand on the band with feet hip-width apart.',
      'Bring handles to shoulder height with palms facing forward and elbows under wrists.',
      'Brace your core and press both handles straight overhead until arms are fully extended.',
      'Lower slowly back to shoulder height.'
    ],
    formCues: [
      'Do not lean backward or hyperextend the lumbar spine as you press.',
      'Look straight ahead and press your head through your arms at the top lockout.'
    ],
    tips: 'If resistance is too high, step on the band with only one foot.',
    estimatedCaloriesPerMin: 7.0,
  },
  {
    id: 'lateral-deltoid-raise',
    name: 'Lateral Deltoid Raise',
    targetMuscle: 'Shoulders',
    secondaryMuscles: ['Forearms'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Under Feet',
    difficulty: 'Beginner',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'lateral-raise',
    instructions: [
      'Stand on the middle of the band with one foot, holding handles at your sides.',
      'With a slight bend in your elbows, raise both arms straight out to the sides until parallel with the floor.',
      'Pause at shoulder height, pouring out an imaginary pitcher of water with your pinkies slightly elevated.',
      'Lower down slowly over 3 seconds.'
    ],
    formCues: [
      'Do not swing or shrug your traps up toward your ears.',
      'Lead with your elbows, not your hands.'
    ],
    tips: 'Key isolation exercise to build 3D side delt width.',
    estimatedCaloriesPerMin: 5.5,
  },
  {
    id: 'front-raise-band',
    name: 'Alternating Front Delt Raise',
    targetMuscle: 'Shoulders',
    secondaryMuscles: ['Core'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Under Feet',
    difficulty: 'Beginner',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'front-raise',
    instructions: [
      'Stand on the band. Hold loop band resting on the front of your thighs.',
      'Keep arms straight with a micro-bend at the elbow.',
      'Raise one arm straight in front of you until eye level.',
      'Lower slowly and repeat with the other arm.'
    ],
    formCues: [
      'Keep core rigid to avoid leaning back as the arm rises.',
      'Controlled eccentric phase is where muscle growth happens.'
    ],
    tips: 'Focuses directly on anterior deltoid definition.',
    estimatedCaloriesPerMin: 5.0,
  },

  // =========================================================================
  // 5. ARMS (BICEPS & TRICEPS)
  // =========================================================================
  {
    id: 'standing-bicep-curl',
    name: 'Standing Supinated Bicep Curl',
    targetMuscle: 'Biceps',
    secondaryMuscles: ['Forearms'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Under Feet',
    difficulty: 'Beginner',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'bicep-curl',
    sourceVideo: {
      title: 'Resistance Band (Tube) Full Body Workout for Lean Muscle Mass',
      channel: 'Fitness My Life',
      youtubeUrl: 'https://youtu.be/njGZClD94bg',
    },
    instructions: [
      'Stand on the center of the band with feet hip-width apart.',
      'Hold loop band with arms extended down at your sides, palms facing forward.',
      'Pin your elbows to the sides of your ribcage.',
      'Curl the handles up toward your shoulders, rotating your pinkies inward at the peak for maximum bicep peak contraction.',
      'Lower slowly over 3 seconds to a full stretch.'
    ],
    formCues: [
      'Do not swing your torso or let elbows flare forward.',
      'Keep wrists straight and rigid.'
    ],
    tips: 'Peak tension is at the very top of the curl where bands are stretched the tightest.',
    estimatedCaloriesPerMin: 6.0,
  },
  {
    id: 'hammer-curl-band',
    name: 'Neutral Grip Hammer Curl',
    targetMuscle: 'Biceps',
    secondaryMuscles: ['Forearms'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Under Feet',
    difficulty: 'Beginner',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'hammer-curl',
    instructions: [
      'Stand on the band with feet shoulder-width apart.',
      'Hold loop band with palms facing each other (neutral grip).',
      'Curl the handles upward keeping thumbs pointed toward the ceiling.',
      'Squeeze at the top and lower under control.'
    ],
    formCues: [
      'Isolates the brachialis and brachioradialis to add bicep arm thickness.',
      'Keep shoulders pinned back.'
    ],
    tips: 'Great for forearm grip strength and elbow health.',
    estimatedCaloriesPerMin: 6.0,
  },
  {
    id: 'tube-concentration-curl',
    name: 'Kneeling Single-Arm Concentration Curl',
    targetMuscle: 'Biceps',
    secondaryMuscles: ['Forearms'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Under Feet',
    difficulty: 'Intermediate',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'concentration-curl',
    sourceVideo: {
      title: 'Resistance Band (Tube) Full Body Workout for Lean Muscle Mass',
      channel: 'Fitness My Life',
      youtubeUrl: 'https://youtu.be/njGZClD94bg',
    },
    instructions: [
      'Kneel on one knee, anchoring the band under the front foot.',
      'Brace your working elbow against the inside of your front thigh.',
      'Curl the loop band upwards towards your cheekbone, locking the arm in place to eliminate all momentum.',
      'Squeeze hard at peak contraction and slowly lower.',
    ],
    formCues: [
      'Total isolation of the bicep short head.',
      'Do not allow the torso to rock.',
    ],
    tips: 'One of the best peak builders in resistance band training.',
    estimatedCaloriesPerMin: 5.5,
  },
  {
    id: 'overhead-tricep-extension',
    name: 'Overhead Band Tricep Extension',
    targetMuscle: 'Triceps',
    secondaryMuscles: ['Forearms'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Under Feet',
    difficulty: 'Intermediate',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'tricep-overhead',
    sourceVideo: {
      title: 'Resistance Band (Tube) Full Body Workout for Lean Muscle Mass',
      channel: 'Fitness My Life',
      youtubeUrl: 'https://youtu.be/njGZClD94bg',
    },
    instructions: [
      'Anchor band under your back heel (or low door).',
      'Bring handles behind your head with elbows pointing straight up toward the ceiling.',
      'Keeping upper arms perpendicular to the floor, extend forearms upward until arms are straight overhead.',
      'Lower slowly back down behind your head to feel a deep stretch in the long head of the tricep.'
    ],
    formCues: [
      'Keep elbows tucked close to your ears; do not let them flare wide.',
      'Brace your core to prevent lumbar overextension.'
    ],
    tips: 'Targeting the long head of the tricep is the key to massive arm size.',
    estimatedCaloriesPerMin: 6.0,
  },
  {
    id: 'tricep-pushdown-band',
    name: 'Door High Tricep Pushdown',
    targetMuscle: 'Triceps',
    secondaryMuscles: ['Forearms'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Door High',
    difficulty: 'Beginner',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'tricep-pushdown',
    instructions: [
      'Anchor band at top of door.',
      'Hold loop band with overhand grip, elbows bent at 90 degrees and pinned to your torso.',
      'Push handles straight down until arms are fully locked out at your thighs.',
      'Squeeze triceps for 1 second, then return to 90 degrees.'
    ],
    formCues: [
      'Upper arms must stay stationary like hinges.',
      'Slight forward torso lean is ideal.'
    ],
    tips: 'Spreading the handles apart at the bottom increases peak contraction.',
    estimatedCaloriesPerMin: 6.0,
  },

  // =========================================================================
  // 6. LEGS & GLUTES (TOM PETO & FITNESS MY LIFE INSPIRED)
  // =========================================================================
  {
    id: 'band-thruster',
    name: 'Full Body Band Thruster (Squat to Overhead Press)',
    targetMuscle: 'Full Body',
    secondaryMuscles: ['Quads', 'Glutes', 'Shoulders', 'Core'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Under Feet',
    difficulty: 'Intermediate',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'squat-press',
    sourceVideo: {
      title: '20 Min FULL BODY RESISTANCE BAND WORKOUT | Follow Along',
      channel: 'Tom Peto Training',
      youtubeUrl: 'https://youtu.be/sTueHjRCMaQ',
    },
    instructions: [
      'Stand on your Slovic band with feet shoulder-width apart.',
      'Rack the band at shoulder height with elbows tucked forward.',
      'Descend into a deep parallel squat, driving knees out.',
      'Powerfully drive out of the squat with your legs, transferring the kinetic momentum directly into an overhead shoulder press to lockout.',
      'Lower band smoothly back to shoulders as you prepare for the next rep.',
    ],
    formCues: [
      'Fluid, continuous movement: do not pause between the squat and the press.',
      'Explosive hip extension drives the band overhead.',
    ],
    tips: 'Massive metabolic burn that rapidly elevates heart rate and builds lean functional muscle.',
    estimatedCaloriesPerMin: 10.0,
  },
  {
    id: 'banded-squat-front',
    name: 'Front-Rack Banded Squat',
    targetMuscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Core', 'Hamstrings'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Under Feet',
    difficulty: 'Beginner',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'squat',
    sourceVideo: {
      title: 'Resistance Band (Tube) Full Body Workout for Lean Muscle Mass',
      channel: 'Fitness My Life',
      youtubeUrl: 'https://youtu.be/njGZClD94bg',
    },
    instructions: [
      'Stand on the middle of the band with feet shoulder-width apart, toes turned slightly out.',
      'Bring handles up to collarbone height (front rack position) with elbows high.',
      'Push your hips back and bend knees, lowering into a deep squat until thighs are parallel to the floor.',
      'Drive through your heels to stand back up, squeezing glutes at the top.'
    ],
    formCues: [
      'Keep chest tall and proud; do not let the band pull your chest forward.',
      'Ensure knees track in line with toes.'
    ],
    tips: 'The band provides progressive resistance: it gets hardest at the top where your legs are strongest.',
    estimatedCaloriesPerMin: 8.0,
  },
  {
    id: 'romanian-deadlift-band',
    name: 'Banded Romanian Deadlift (RDL)',
    targetMuscle: 'Hamstrings',
    secondaryMuscles: ['Glutes', 'Back'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Under Feet',
    difficulty: 'Intermediate',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'rdl',
    instructions: [
      'Stand on the band with feet hip-width apart.',
      'Hold loop band with arms extended down, creating significant starting tension.',
      'With soft knees and a flat back, push your hips straight backward as if touching a wall behind you.',
      'Lower torso until you feel a deep hamstring stretch just below knee height.',
      'Drive hips forward to return to standing, locking out glutes.'
    ],
    formCues: [
      'This is a hip hinge, not a squat - knees remain at the same slight bend throughout.',
      'Never allow your lumbar spine to round.'
    ],
    tips: 'Keep handles dragging close to your shins for optimal hip hinge mechanics.',
    estimatedCaloriesPerMin: 7.5,
  },
  {
    id: 'band-good-morning',
    name: 'Banded Good Morning',
    targetMuscle: 'Hamstrings',
    secondaryMuscles: ['Glutes', 'Back'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Under Feet',
    difficulty: 'Intermediate',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'good-morning',
    sourceVideo: {
      title: '20 Min FULL BODY RESISTANCE BAND WORKOUT | Follow Along',
      channel: 'Tom Peto Training',
      youtubeUrl: 'https://youtu.be/sTueHjRCMaQ',
    },
    instructions: [
      'Stand on the Slovic loop band and loop the top over the back of your neck/shoulders.',
      'Hinge deeply at the hips with a flat back until your torso is parallel to the floor.',
      'Drive hips forward powerfully against the loop tension to stand tall.',
    ],
    formCues: [
      'Keep shoulder blades pulled back throughout.',
      'Feel the deep stretch in your hamstrings and glutes.',
    ],
    tips: 'Builds an iron posterior chain without loading heavy iron onto your spine.',
    estimatedCaloriesPerMin: 7.0,
  },
  {
    id: 'banded-lunges',
    name: 'Band-Resisted Reverse Lunge',
    targetMuscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Hamstrings'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Under Feet',
    difficulty: 'Intermediate',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'reverse-lunge',
    instructions: [
      'Place front foot over the middle of the band.',
      'Hold loop band at shoulder height.',
      'Step back with opposite foot and lower hips until both knees are bent at 90 degrees.',
      'Drive through front heel to return to standing.'
    ],
    formCues: [
      'Keep front knee directly above front ankle; do not let it collapse inward.',
      'Torso stays upright.'
    ],
    tips: 'Complete all reps on one leg before switching sides.',
    estimatedCaloriesPerMin: 7.5,
  },
  {
    id: 'glute-bridge-loop',
    name: 'Glute Bridge with Loop Band',
    targetMuscle: 'Glutes',
    secondaryMuscles: ['Hamstrings', 'Core'],
    bandType: 'Loop Band',
    anchorPosition: 'None',
    difficulty: 'Beginner',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'glute-bridge',
    instructions: [
      'Lie on your back on the floor with knees bent and feet flat, hip-width apart.',
      'Place a loop band around your thighs, 2 inches above your knees.',
      'Push your knees outward against the band to keep glutes engaged.',
      'Drive hips up until your body forms a straight line from knees to shoulders.',
      'Squeeze glutes hard at the top for 2 seconds, then lower down.'
    ],
    formCues: [
      'Do not arch your lower back at the top; the lift comes entirely from hip extension.',
      'Keep constant outward pressure against the loop.'
    ],
    tips: 'Add 10 butterfly pulses at the top of your final set for maximum glute burn.',
    estimatedCaloriesPerMin: 5.5,
  },
  {
    id: 'lateral-band-walk',
    name: 'Lateral Band Monster Walk',
    targetMuscle: 'Glutes',
    secondaryMuscles: ['Quads'],
    bandType: 'Loop Band',
    anchorPosition: 'None',
    difficulty: 'Beginner',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'monster-walk',
    instructions: [
      'Place loop band around your ankles or just above knees.',
      'Drop into a quarter squat athletic stance with hands up.',
      'Take 10 controlled sideways steps to the right, maintaining tension on the band.',
      'Reverse and take 10 steps to the left.'
    ],
    formCues: [
      'Never let feet come all the way together - keep the band under constant tension.',
      'Do not bounce up and down; stay low in the squat.'
    ],
    tips: 'Fires up the gluteus medius for hip stability and knee health.',
    estimatedCaloriesPerMin: 6.0,
  },
  {
    id: 'standing-glute-kickback',
    name: 'Standing Glute Kickback',
    targetMuscle: 'Glutes',
    secondaryMuscles: ['Hamstrings'],
    bandType: 'Loop Band',
    anchorPosition: 'None',
    difficulty: 'Beginner',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'glute-kickback',
    instructions: [
      'Place loop band around both ankles.',
      'Hold onto a wall or chair for balance, keeping torso slightly forward.',
      'Kick one leg straight backward without arching your lower back.',
      'Squeeze the glute at the peak for 1 second, then return.'
    ],
    formCues: [
      'Movement should come from the hip, not from twisting the spine.',
      'Keep the kicking leg relatively straight.'
    ],
    tips: 'Concentrate on high-rep isolation (15-20 reps per leg).',
    estimatedCaloriesPerMin: 5.0,
  },
  {
    id: 'tube-calf-raise',
    name: 'Standing Resistance Band Calf Raise',
    targetMuscle: 'Calves',
    bandType: 'Long Loop Band',
    anchorPosition: 'Under Feet',
    difficulty: 'Beginner',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'calf-raise',
    sourceVideo: {
      title: 'Resistance Band (Tube) Full Body Workout for Lean Muscle Mass',
      channel: 'Fitness My Life',
      youtubeUrl: 'https://youtu.be/njGZClD94bg',
    },
    instructions: [
      'Stand on balls of feet with Slovic band looped underneath.',
      'Hold loop band firmly at collarbones to create high upward tension.',
      'Drive up onto tiptoes as high as possible, contracting the gastrocnemius.',
      'Hold peak squeeze for 2 seconds, then slowly descend.',
    ],
    formCues: [
      'Full ankle range of motion is crucial for calf growth.',
      'Pause at the peak to prevent bounce elasticity.',
    ],
    tips: 'High reps (20-25) build diamond calf definition.',
    estimatedCaloriesPerMin: 5.0,
  },

  // =========================================================================
  // 7. CORE & SIX-PACK (THENX & TOM PETO INSPIRED)
  // =========================================================================
  {
    id: 'band-woodchopper-high-low',
    name: 'High-to-Low Diagonal Woodchopper',
    targetMuscle: 'Core',
    secondaryMuscles: ['Shoulders', 'Back'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Door High',
    difficulty: 'Intermediate',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'woodchopper',
    instructions: [
      'Anchor band high on a door or pull-up bar.',
      'Stand sideways to anchor, holding the handle with both hands extended.',
      'Pull the handle diagonally across your body down towards your opposite knee, rotating your torso and pivoting your back foot.',
      'Return slowly under control.'
    ],
    formCues: [
      'Power originates from core and hip rotation, not just arm pulling.',
      'Keep arms extended with a slight bend throughout.'
    ],
    tips: 'Carves sharp oblique definition and rotational power.',
    estimatedCaloriesPerMin: 6.5,
  },
  {
    id: 'pallof-press-anti-rotation',
    name: 'Pallof Press Anti-Rotation Hold',
    targetMuscle: 'Core',
    secondaryMuscles: ['Shoulders', 'Chest'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Door Middle',
    difficulty: 'Beginner',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'pallof-press',
    sourceVideo: {
      title: '20 Min FULL BODY RESISTANCE BAND WORKOUT | Follow Along',
      channel: 'Tom Peto Training',
      youtubeUrl: 'https://youtu.be/sTueHjRCMaQ',
    },
    instructions: [
      'Anchor band at chest height. Stand perpendicular to the anchor with feet shoulder-width apart.',
      'Hold handle against your sternum with both hands and step away to create tension.',
      'Press the handle straight out in front of you until arms are fully extended.',
      'Resist the rotational pull of the band twisting you backward - hold for 2 seconds, then bring back to sternum.'
    ],
    formCues: [
      'Body stays locked in place like concrete.',
      'Breathe steadily while bracing your core.'
    ],
    tips: 'The ultimate anti-rotational core movement for spine safety and deep abdominal wall density.',
    estimatedCaloriesPerMin: 5.5,
  },
  {
    id: 'kneeling-cable-crunch-band',
    name: 'Kneeling Band Abdominal Crunch',
    targetMuscle: 'Core',
    secondaryMuscles: ['Back'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Door High',
    difficulty: 'Beginner',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'ab-crunch',
    instructions: [
      'Anchor band high on door or pull-up bar.',
      'Kneel facing away, holding handles on each side of your neck.',
      'Hinge at hips slightly, then crunch your ribcage down toward your pelvis.',
      'Squeeze core hard at the bottom for 1 second, then slowly return.'
    ],
    formCues: [
      'Do not sit down onto your heels as you crunch; keep hips high.',
      'Focus on spinal flexion (curling the spine), not hip bending.'
    ],
    tips: 'Delivers the heavy resistance crunch of a gym cable machine.',
    estimatedCaloriesPerMin: 6.0,
  },
  {
    id: 'reverse-fly-band',
    name: 'Standing Band Reverse Fly',
    targetMuscle: 'Back',
    secondaryMuscles: ['Shoulders'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Door Middle',
    difficulty: 'Intermediate',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'reverse-fly',
    sourceVideo: {
      title: 'Resistance band (Tube) Full body workout for Lean muscle mass',
      channel: 'Fitness My Life',
      youtubeUrl: 'https://youtu.be/njGZClD94bg',
    },
    instructions: [
      'Anchor loop band at chest height. Face the anchor and hold loop band with arms extended forward.',
      'With a slight bend in your elbows, pull your arms horizontally out to the sides in a reverse hugging motion.',
      'Squeeze your rear deltoids and rhomboids together at the end of the range.',
      'Control the return back to starting position over 2-3 seconds.',
    ],
    formCues: [
      'Keep elbows slightly bent and fixed throughout the motion.',
      'Lead with elbows, squeezing upper back blades together.',
    ],
    tips: 'Crucial postural movement from Fitness My Life to balance pressing exercises.',
    estimatedCaloriesPerMin: 6.5,
  },
  {
    id: 'behind-back-bicep-curl',
    name: 'Behind-the-Back Bicep Curl',
    targetMuscle: 'Biceps',
    secondaryMuscles: ['Forearms'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Door Low',
    difficulty: 'Intermediate',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'behind-back-curl',
    sourceVideo: {
      title: 'Resistance band (Tube) Full body workout for Lean muscle mass',
      channel: 'Fitness My Life',
      youtubeUrl: 'https://youtu.be/njGZClD94bg',
    },
    instructions: [
      'Anchor the band low behind you. Face away from the anchor and take a step forward so there is tension.',
      'With elbows positioned slightly behind your torso in extension, curl your hands forward and up.',
      'Squeeze the long head of your biceps at the peak, then slowly lower under constant stretch.',
    ],
    formCues: [
      'Keep your upper arms slightly behind your body to emphasize the long head stretch.',
      'Control the eccentric negative; the stretch under tension builds peak bicep height.',
    ],
    tips: 'Signature isolation technique featured in Fitness My Life for maximal bicep peak development.',
    estimatedCaloriesPerMin: 6.0,
  },
  {
    id: 'reverse-bicep-curl-band',
    name: 'Band Reverse Bicep Curl',
    targetMuscle: 'Forearms',
    secondaryMuscles: ['Biceps'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Under Feet',
    difficulty: 'Beginner',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'reverse-curl',
    sourceVideo: {
      title: 'Resistance band (Tube) Full body workout for Lean muscle mass',
      channel: 'Fitness My Life',
      youtubeUrl: 'https://youtu.be/njGZClD94bg',
    },
    instructions: [
      'Stand on the middle of the band with feet shoulder-width apart.',
      'Grip the handles or band with palms facing down (overhand / pronated grip).',
      'Keeping elbows pinned to your sides, curl your hands upward toward chest height.',
      'Lower down slowly, feeling tension across the top of your forearms and brachialis.',
    ],
    formCues: [
      'Keep wrists straight and neutral throughout the movement.',
      'Do not swing or lean back; isolate the arm flexors.',
    ],
    tips: 'Fitness My Life arm finisher that builds forearms and pushes the bicep higher from underneath.',
    estimatedCaloriesPerMin: 5.5,
  },
  {
    id: 'chris-heria-deadlift',
    name: 'Banded Heavy Deadlift',
    targetMuscle: 'Hamstrings',
    secondaryMuscles: ['Glutes', 'Back', 'Core'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Under Feet',
    difficulty: 'Intermediate',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'deadlift',
    instructions: [
      'Step firmly on the loop band with both feet shoulder-width apart.',
      'Hinge deeply at hips with a flat, arched back and grab the band low down for maximum pre-stretch tension.',
      'Drive forcefully through your heels and squeeze your glutes to stand completely tall.',
      'Lock out hips at the top, then hinge backwards with a controlled tempo back to mid-shin.',
    ],
    formCues: [
      'Chest proud, shoulder blades pinned back, neutral spine.',
      'Drive hips forward to lockout — do not hyperextend lower back.',
    ],
    tips: 'The ultimate exercise to substitute heavy barbell deadlifts safely at home.',
    estimatedCaloriesPerMin: 9.0,
  },
  // =========================================================================
  // ROWAN ROW ZERO-EQUIPMENT BODYWEIGHT CALISTHENICS
  // Source: The Ultimate 45 Min FULL BODY WORKOUT (https://youtu.be/cDq-nFmD0rI)
  // =========================================================================
  {
    id: 'bodyweight-pushup-standard',
    name: 'Standard Floor Push-Up',
    targetMuscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Shoulders', 'Core'],
    bandType: 'None',
    anchorPosition: 'None',
    difficulty: 'Beginner',
    requiresBand: false,
    requiresBar: false,
    avatarAnimation: 'pushup-standard',
    sourceVideo: {
      title: 'The Ultimate 45 Min FULL BODY WORKOUT | No Equipment',
      channel: 'Rowan Row',
      youtubeUrl: 'https://youtu.be/cDq-nFmD0rI',
    },
    instructions: [
      'Place your hands flat on the floor slightly wider than shoulder-width apart, arms straight, legs extended back.',
      'Brace your core, glutes, and thighs to form a rigid plank from heels to crown.',
      'Lower your chest until it hovers 1-2 inches above the ground, elbows tracking back at a 45-degree angle.',
      'Press forcefully through the palms to lock out at the top.',
    ],
    formCues: [
      'Keep elbows tucked at 45 degrees; do not flare out.',
      'Neutral neck and spine throughout the entire range of motion.',
      'Exhale powerfully as you push up away from the floor.',
    ],
    tips: 'Rowan Row standard push-up for chest hypertrophy and pushing endurance.',
    estimatedCaloriesPerMin: 7.5,
  },
  {
    id: 'bodyweight-diamond-pushup',
    name: 'Diamond Push-Up',
    targetMuscle: 'Triceps',
    secondaryMuscles: ['Chest', 'Shoulders', 'Core'],
    bandType: 'None',
    anchorPosition: 'None',
    difficulty: 'Intermediate',
    requiresBand: false,
    requiresBar: false,
    avatarAnimation: 'diamond-pushup',
    sourceVideo: {
      title: 'The Ultimate 45 Min FULL BODY WORKOUT | No Equipment',
      channel: 'Rowan Row',
      youtubeUrl: 'https://youtu.be/cDq-nFmD0rI',
    },
    instructions: [
      'Form a standard high plank, bringing thumbs and index fingers together to form a diamond shape directly beneath your chest.',
      'Lower your chest with control toward the center of the diamond, keeping elbows glued close to your ribs.',
      'Drive through the triceps and palms to return to full lockout.',
    ],
    formCues: [
      'Keep elbows tight to your torso to isolate the tricep lateral and long heads.',
      'Avoid dipping or sagging hips; maintain rigid core plank.',
    ],
    tips: 'The quintessential bodyweight triceps builder from Rowan Row’s routine.',
    estimatedCaloriesPerMin: 8.0,
  },
  {
    id: 'bodyweight-pike-pushup',
    name: 'Pike Push-Up',
    targetMuscle: 'Shoulders',
    secondaryMuscles: ['Triceps', 'Chest', 'Core'],
    bandType: 'None',
    anchorPosition: 'None',
    difficulty: 'Intermediate',
    requiresBand: false,
    requiresBar: false,
    avatarAnimation: 'pike-pushup',
    sourceVideo: {
      title: 'The Ultimate 45 Min FULL BODY WORKOUT | No Equipment',
      channel: 'Rowan Row',
      youtubeUrl: 'https://youtu.be/cDq-nFmD0rI',
    },
    instructions: [
      'From a high plank position, walk your feet forward and hike your hips high into an inverted V-shape (pike).',
      'Gaze between your feet, keeping your back flat and legs straight (or slight knee bend).',
      'Lower the crown of your head diagonally forward toward the floor between your hands.',
      'Push upward and back through your shoulders to return to the pike peak.',
    ],
    formCues: [
      'Aim the top of your head in front of your fingertips to form a tripod path.',
      'Shrug your shoulders at lockout to fully engage deltoids and serratus.',
    ],
    tips: 'The most effective calisthenics overhead shoulder builder without weights or bands.',
    estimatedCaloriesPerMin: 8.0,
  },
  {
    id: 'bodyweight-pushup-downward-dog',
    name: 'Push-Up to Downward Dog',
    targetMuscle: 'Chest',
    secondaryMuscles: ['Shoulders', 'Core', 'Hamstrings'],
    bandType: 'None',
    anchorPosition: 'None',
    difficulty: 'Beginner',
    requiresBand: false,
    requiresBar: false,
    avatarAnimation: 'pushup-downward-dog',
    sourceVideo: {
      title: 'The Ultimate 45 Min FULL BODY WORKOUT | No Equipment',
      channel: 'Rowan Row',
      youtubeUrl: 'https://youtu.be/cDq-nFmD0rI',
    },
    instructions: [
      'Perform a smooth, controlled push-up down to the floor and press back up.',
      'At the top of the push-up, push your hips up and back into a deep Downward-Facing Dog posture.',
      'Press heels toward the ground, opening chest and decompressing the spine, then flow back forward to push-up plank.',
    ],
    formCues: [
      'Drive heels gently towards floor to stretch posterior chain.',
      'Maintain steady breath rhythm throughout the flow.',
    ],
    tips: 'Combines chest hypertrophy with shoulder mobility and spinal decompression.',
    estimatedCaloriesPerMin: 7.0,
  },
  {
    id: 'bodyweight-superman-pulses',
    name: 'Superman Back & Lat Pulses',
    targetMuscle: 'Back',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Shoulders'],
    bandType: 'None',
    anchorPosition: 'None',
    difficulty: 'Beginner',
    requiresBand: false,
    requiresBar: false,
    avatarAnimation: 'superman-pulse',
    sourceVideo: {
      title: 'The Ultimate 45 Min FULL BODY WORKOUT | No Equipment',
      channel: 'Rowan Row',
      youtubeUrl: 'https://youtu.be/cDq-nFmD0rI',
    },
    instructions: [
      'Lie face down on the floor with arms outstretched overhead and legs fully extended.',
      'Simultaneously lift your chest, arms, and thighs off the floor by squeezing your lats, erectors, and glutes.',
      'At the peak, pull elbows back toward your ribs into a lat squeeze pulse.',
      'Hold for 2 seconds, lower slightly with control, and repeat without letting limbs touch the floor.',
    ],
    formCues: [
      'Look down at the floor to maintain neutral cervical spine.',
      'Initiate movement from the back muscles and glutes, not swinging.',
    ],
    tips: 'Essential zero-equipment posterior chain and lat stimulus from Rowan Row.',
    estimatedCaloriesPerMin: 6.5,
  },
  {
    id: 'bodyweight-air-squat',
    name: 'Tempo Bodyweight Squat',
    targetMuscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Core'],
    bandType: 'None',
    anchorPosition: 'None',
    difficulty: 'Beginner',
    requiresBand: false,
    requiresBar: false,
    avatarAnimation: 'air-squat',
    sourceVideo: {
      title: 'The Ultimate 45 Min FULL BODY WORKOUT | No Equipment',
      channel: 'Rowan Row',
      youtubeUrl: 'https://youtu.be/cDq-nFmD0rI',
    },
    instructions: [
      'Stand with feet shoulder-width apart, toes slightly angled outwards.',
      'Extend your arms out front for counter-balance and brace your core.',
      'Hinge back at hips and bend knees, sinking down until thighs are parallel to the ground or deeper.',
      'Drive through heels and mid-foot to stand up, squeezing glutes at the top.',
    ],
    formCues: [
      'Keep chest tall and knees tracking over your toes.',
      'Do not let heels lift off the ground; distribute weight evenly.',
    ],
    tips: 'Maintain a 3-second eccentric tempo on the way down for maximal quad fiber recruitment.',
    estimatedCaloriesPerMin: 7.0,
  },
  {
    id: 'bodyweight-sumo-squat-pulse',
    name: 'Sumo Squat & Pulse',
    targetMuscle: 'Glutes',
    secondaryMuscles: ['Quads', 'Hamstrings', 'Core'],
    bandType: 'None',
    anchorPosition: 'None',
    difficulty: 'Beginner',
    requiresBand: false,
    requiresBar: false,
    avatarAnimation: 'sumo-squat',
    sourceVideo: {
      title: 'The Ultimate 45 Min FULL BODY WORKOUT | No Equipment',
      channel: 'Rowan Row',
      youtubeUrl: 'https://youtu.be/cDq-nFmD0rI',
    },
    instructions: [
      'Set a wide stance with feet 1.5x shoulder width apart, toes flared out at 45 degrees.',
      'Descend into a deep sumo squat until thighs are parallel to the floor.',
      'Pulse up 2 inches and back down 2 inches to keep constant metabolic burn.',
      'Push through heels to return to standing lockout after pulse.',
    ],
    formCues: [
      'Keep knees pushed wide outward in line with toes.',
      'Torso remains upright to load the glutes and adductors.',
    ],
    tips: 'Rowan Row leg burner that targets inner thighs and glute medius without weights.',
    estimatedCaloriesPerMin: 7.5,
  },
  {
    id: 'bodyweight-reverse-lunge',
    name: 'Alternating Reverse Lunge',
    targetMuscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Calves'],
    bandType: 'None',
    anchorPosition: 'None',
    difficulty: 'Beginner',
    requiresBand: false,
    requiresBar: false,
    avatarAnimation: 'reverse-lunge-bodyweight',
    sourceVideo: {
      title: 'The Ultimate 45 Min FULL BODY WORKOUT | No Equipment',
      channel: 'Rowan Row',
      youtubeUrl: 'https://youtu.be/cDq-nFmD0rI',
    },
    instructions: [
      'Stand tall with hands on hips or clasped at your chest.',
      'Take a controlled step backward with one leg and lower both knees until they reach 90-degree angles.',
      'Ensure the back knee hovers just above the floor without hitting.',
      'Drive through the front heel to return to standing, then alternate legs.',
    ],
    formCues: [
      'Keep front shin nearly vertical, preventing excessive knee overhang.',
      'Maintain an upright torso and steady core balance.',
    ],
    tips: 'Reverse lunges protect knee joints far better than forward lunges.',
    estimatedCaloriesPerMin: 7.0,
  },
  {
    id: 'bodyweight-jump-squats',
    name: 'Explosive Jump Squat',
    targetMuscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Calves', 'Core'],
    bandType: 'None',
    anchorPosition: 'None',
    difficulty: 'Intermediate',
    requiresBand: false,
    requiresBar: false,
    avatarAnimation: 'jump-squat',
    sourceVideo: {
      title: 'The Ultimate 45 Min FULL BODY WORKOUT | No Equipment',
      channel: 'Rowan Row',
      youtubeUrl: 'https://youtu.be/cDq-nFmD0rI',
    },
    instructions: [
      'Begin in a regular squat stance, feet shoulder-width apart.',
      'Lower down into a half squat, swinging arms back.',
      'Explode straight up off the ground extending hips, knees, and ankles simultaneously.',
      'Land softly on the balls of your feet, immediately absorbing into the next squat descent.',
    ],
    formCues: [
      'Quiet, soft landing to protect joints.',
      'Keep core braced throughout flight and landing.',
    ],
    tips: 'High-intensity power and cardiovascular conditioning from Rowan Row’s session.',
    estimatedCaloriesPerMin: 10.5,
  },
  {
    id: 'bodyweight-glute-bridge',
    name: 'Bodyweight Glute Bridge & Squeeze',
    targetMuscle: 'Glutes',
    secondaryMuscles: ['Hamstrings', 'Core'],
    bandType: 'None',
    anchorPosition: 'None',
    difficulty: 'Beginner',
    requiresBand: false,
    requiresBar: false,
    avatarAnimation: 'glute-bridge-bodyweight',
    sourceVideo: {
      title: 'The Ultimate 45 Min FULL BODY WORKOUT | No Equipment',
      channel: 'Rowan Row',
      youtubeUrl: 'https://youtu.be/cDq-nFmD0rI',
    },
    instructions: [
      'Lie on your back with knees bent and feet flat on the floor, hip-width apart.',
      'Place arms flat along your sides with palms down.',
      'Drive through your heels to raise your hips until knees, hips, and shoulders form a straight diagonal line.',
      'Squeeze glutes maximally at the top for a full 2-second hold, then lower slowly.',
    ],
    formCues: [
      'Do not hyperextend your lower back at the top; rotate pelvis under.',
      'Feel the tension strictly in glutes and hamstrings.',
    ],
    tips: 'Ideal posterior chain activator that requires zero setup or equipment.',
    estimatedCaloriesPerMin: 5.5,
  },
  {
    id: 'bodyweight-bicycle-crunches',
    name: 'Bicycle Crunch',
    targetMuscle: 'Core',
    secondaryMuscles: ['Quads'],
    bandType: 'None',
    anchorPosition: 'None',
    difficulty: 'Beginner',
    requiresBand: false,
    requiresBar: false,
    avatarAnimation: 'bicycle-crunch',
    sourceVideo: {
      title: 'The Ultimate 45 Min FULL BODY WORKOUT | No Equipment',
      channel: 'Rowan Row',
      youtubeUrl: 'https://youtu.be/cDq-nFmD0rI',
    },
    instructions: [
      'Lie flat on your back, hands lightly touching the sides of your head (no pulling neck).',
      'Raise your knees to 90 degrees and lift your shoulder blades off the floor.',
      'Rotate your torso to bring your right elbow toward your left knee while extending the right leg straight out.',
      'Smoothly alternate sides in a continuous pedal motion.',
    ],
    formCues: [
      'Focus on rotating from the rib cage, not yanking on the head.',
      'Keep lower back pressed firmly into the ground.',
    ],
    tips: 'Ranked by biomechanical research as one of the most effective abdominal exercises.',
    estimatedCaloriesPerMin: 7.0,
  },
  {
    id: 'bodyweight-v-ups',
    name: 'V-Up Jackknife',
    targetMuscle: 'Core',
    secondaryMuscles: ['Quads', 'Shoulders'],
    bandType: 'None',
    anchorPosition: 'None',
    difficulty: 'Advanced',
    requiresBand: false,
    requiresBar: false,
    avatarAnimation: 'v-up',
    sourceVideo: {
      title: 'The Ultimate 45 Min FULL BODY WORKOUT | No Equipment',
      channel: 'Rowan Row',
      youtubeUrl: 'https://youtu.be/cDq-nFmD0rI',
    },
    instructions: [
      'Lie flat on your back with arms extended straight overhead and legs together.',
      'In one explosive, controlled movement, lift your torso and straight legs simultaneously into a V-shape.',
      'Reach your fingertips towards your toes at the apex.',
      'Slowly lower back down with control, without letting heels or shoulders rest on the floor between reps.',
    ],
    formCues: [
      'Brace your core tight before initiating the lift.',
      'Control the descent to protect the lower back.',
    ],
    tips: 'Rowan Row’s premier calisthenics abdominal exercise for athletic core definition.',
    estimatedCaloriesPerMin: 8.5,
  },
  {
    id: 'bodyweight-mountain-climbers',
    name: 'Cross-Body Mountain Climbers',
    targetMuscle: 'Core',
    secondaryMuscles: ['Shoulders', 'Quads'],
    bandType: 'None',
    anchorPosition: 'None',
    difficulty: 'Intermediate',
    requiresBand: false,
    requiresBar: false,
    avatarAnimation: 'mountain-climbers',
    sourceVideo: {
      title: 'The Ultimate 45 Min FULL BODY WORKOUT | No Equipment',
      channel: 'Rowan Row',
      youtubeUrl: 'https://youtu.be/cDq-nFmD0rI',
    },
    instructions: [
      'Set up in a rigid push-up plank position with hands under shoulders.',
      'Drive your right knee forward and across toward your left elbow with speed.',
      'Quickly step it back and immediately drive your left knee toward your right elbow.',
      'Maintain a rapid, rhythmic alternating pace while keeping hips stable.',
    ],
    formCues: [
      'Keep hips level; avoid bouncing your glutes into the air.',
      'Maintain constant pressure into the palms to stabilize shoulders.',
    ],
    tips: 'High-calorie core incinerator from Rowan Row’s 45-min circuit.',
    estimatedCaloriesPerMin: 10.0,
  },
  {
    id: 'bodyweight-plank-shoulder-taps',
    name: 'Plank Shoulder Taps',
    targetMuscle: 'Core',
    secondaryMuscles: ['Shoulders', 'Chest', 'Triceps'],
    bandType: 'None',
    anchorPosition: 'None',
    difficulty: 'Beginner',
    requiresBand: false,
    requiresBar: false,
    avatarAnimation: 'plank-shoulder-tap',
    sourceVideo: {
      title: 'The Ultimate 45 Min FULL BODY WORKOUT | No Equipment',
      channel: 'Rowan Row',
      youtubeUrl: 'https://youtu.be/cDq-nFmD0rI',
    },
    instructions: [
      'Start in a tall push-up plank position with feet slightly wider than hip-width for balance.',
      'Keep hips dead still while lifting your right hand to tap your left shoulder.',
      'Place the hand down and immediately lift your left hand to tap your right shoulder.',
      'Continue alternating smoothly while resisting any torso sway.',
    ],
    formCues: [
      'Imagine a glass of water resting on your lower back — do not let it spill.',
      'Squeeze your glutes and core throughout.',
    ],
    tips: 'Top anti-rotational core stability drill.',
    estimatedCaloriesPerMin: 6.5,
  },
  {
    id: 'bodyweight-standing-calf-raise',
    name: 'Floor Standing Calf Raise',
    targetMuscle: 'Calves',
    bandType: 'None',
    anchorPosition: 'None',
    difficulty: 'Beginner',
    requiresBand: false,
    requiresBar: false,
    avatarAnimation: 'calf-raise-bodyweight',
    sourceVideo: {
      title: 'The Ultimate 45 Min FULL BODY WORKOUT | No Equipment',
      channel: 'Rowan Row',
      youtubeUrl: 'https://youtu.be/cDq-nFmD0rI',
    },
    instructions: [
      'Stand tall with feet hip-width apart on flat ground.',
      'Press down through the balls of your big toes to raise your heels as high as possible.',
      'Hold the peak contraction for 1 full second.',
      'Lower heels down with control until barely skimming the floor, then immediately press up.',
    ],
    formCues: [
      'Push evenly through the big toe knuckle to prevent ankle rolling.',
      'Keep knees straight with a soft micro-bend.',
    ],
    tips: 'Rowan Row calf burn finisher that requires zero equipment.',
    estimatedCaloriesPerMin: 5.0,
  },
  {
    id: 'bodyweight-full-burpees',
    name: 'Calisthenic Full Burpee',
    targetMuscle: 'Full Body',
    secondaryMuscles: ['Chest', 'Quads', 'Core', 'Shoulders'],
    bandType: 'None',
    anchorPosition: 'None',
    difficulty: 'Intermediate',
    requiresBand: false,
    requiresBar: false,
    avatarAnimation: 'burpee',
    sourceVideo: {
      title: 'The Ultimate 45 Min FULL BODY WORKOUT | No Equipment',
      channel: 'Rowan Row',
      youtubeUrl: 'https://youtu.be/cDq-nFmD0rI',
    },
    instructions: [
      'Stand tall, then drop quickly into a squat and place your hands on the floor.',
      'Kick your feet back into a push-up plank and lower your chest all the way to the floor.',
      'Push your chest back up and jump your feet back forward outside your hands.',
      'Explode up into a vertical jump, clapping hands overhead.',
    ],
    formCues: [
      'Keep core tight when jumping feet back to protect lower back.',
      'Breathe rhythmically on every jump.',
    ],
    tips: 'Rowan Row full body calorie shredder and functional endurance benchmark.',
    estimatedCaloriesPerMin: 11.0,
  },
  {
    id: 'bar-chinup-strict',
    name: 'Strict Chin-Up',
    targetMuscle: 'Biceps',
    secondaryMuscles: ['Back', 'Forearms', 'Core'],
    bandType: 'None',
    anchorPosition: 'Bar',
    difficulty: 'Intermediate',
    requiresBand: false,
    requiresBar: true,
    avatarAnimation: 'chinup-strict',
    sourceVideo: {
      title: 'Pull-Up Bar Calisthenics & Bodyweight Training',
      channel: 'Calisthenics Movement',
      youtubeUrl: 'https://youtu.be/hQ2lHMP4kco',
    },
    instructions: [
      'Grip the pull-up bar with an underhand (supinated) grip, hands shoulder-width apart.',
      'Hang with arms fully extended and engage your core to avoid swinging.',
      'Pull your chest up toward the bar, driving elbows down and back until chin clears the bar.',
      'Lower under strict control over 2-3 seconds to full extension.',
    ],
    formCues: [
      'Keep shoulders depressed (down away from ears).',
      'Squeeze biceps hard at the peak contraction.',
      'Avoid kipping or kicking knees.',
    ],
    tips: 'Primary loaded bicep and lat movement for Pull-Up Bar mode.',
    estimatedCaloriesPerMin: 8.5,
  },
  {
    id: 'bodyweight-archer-pushup',
    name: 'Archer Push-Up (Bodyweight)',
    targetMuscle: 'Chest',
    secondaryMuscles: ['Shoulders', 'Triceps', 'Core'],
    bandType: 'None',
    anchorPosition: 'None',
    difficulty: 'Advanced',
    requiresBand: false,
    requiresBar: false,
    avatarAnimation: 'archer-pushup-bodyweight',
    sourceVideo: {
      title: 'The Ultimate 45 Min FULL BODY WORKOUT | No Equipment',
      channel: 'Rowan Row',
      youtubeUrl: 'https://youtu.be/cDq-nFmD0rI',
    },
    instructions: [
      'Set up in a wide push-up plank with fingers pointing slightly outward.',
      'Lower your body toward one side, bending that elbow while keeping the opposite arm completely straight.',
      'Press through the working hand to return to the center top position.',
      'Alternate sides or complete designated reps on one side before switching.',
    ],
    formCues: [
      'Keep core rigid; do not twist hips or sag lower back.',
      'Straight arm acts as a stabilizer, forcing unilateral overload on working pec.',
    ],
    tips: 'Advanced bodyweight chest builder bridge to one-arm push-up.',
    estimatedCaloriesPerMin: 8.0,
  },
  {
    id: 'door-high-lat-pulldown',
    name: 'Door High Lat Pulldown',
    targetMuscle: 'Back',
    secondaryMuscles: ['Biceps', 'Shoulders'],
    bandType: 'Long Loop Band',
    anchorPosition: 'Door High',
    difficulty: 'Beginner',
    requiresBand: true,
    requiresBar: false,
    avatarAnimation: 'lat-pulldown',
    sourceVideo: {
      title: 'Complete Resistance Band Full Body Exercises',
      channel: 'Slovic',
      youtubeUrl: 'https://youtu.be/njGZClD94bg',
    },
    instructions: [
      'Anchor the resistance band at the top of the door.',
      'Kneel facing the door anchor, holding both sides of the band with arms extended overhead.',
      'Drive elbows down and back toward your ribs, arching upper back slightly.',
      'Squeeze lats at the bottom for 1 second, then control the stretch overhead.',
    ],
    formCues: [
      'Think of pulling through the elbows, not hands.',
      'Maintain an upright kneeling torso with engaged core.',
    ],
    tips: 'Vertical pulling staple for Bands Only mode with full stretch and contraction.',
    estimatedCaloriesPerMin: 6.5,
  },
];

const LADDER_NEIGHBOURS: Record<string, { easierId?: string; harderId?: string }> = {};
for (const ladder of PROGRESSION_LADDERS) {
  ladder.forEach((id, i) => {
    const entry = (LADDER_NEIGHBOURS[id] ||= {});
    if (i > 0 && !entry.easierId) entry.easierId = ladder[i - 1];
    if (i < ladder.length - 1 && !entry.harderId) entry.harderId = ladder[i + 1];
  });
}

const MERGED: Exercise[] = [...RAW_EXERCISES, ...EXTRA_EXERCISES].map(e => ({
  ...e,
  // One source of truth for demo links: verified cue or a targeted search.
  youtubeUrl: getExerciseYoutubeUrl(e.id, e.name),
  sourceVideo: undefined,
  isTimed: e.isTimed || TIMED_EXERCISES.has(e.id),
  isAssisted: e.isAssisted || ASSISTED_EXERCISES.has(e.id),
  isCompound: e.isCompound || COMPOUND_EXERCISES.has(e.id),
  commonMistakes: e.commonMistakes || COMMON_MISTAKES[e.id],
  easierId: e.easierId || LADDER_NEIGHBOURS[e.id]?.easierId,
  harderId: e.harderId || LADDER_NEIGHBOURS[e.id]?.harderId,
}));

export const EXERCISE_DATABASE: Exercise[] = MERGED.map(e => ({ ...e, tempo: defaultTempo(e) }));

const EXERCISE_BY_ID = new Map(EXERCISE_DATABASE.map(e => [e.id, e]));

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISE_BY_ID.get(id);
}

export function isExerciseAvailable(
  exercise: Exercise,
  profile: { hasResistanceBands?: boolean; hasPullUpBar?: boolean }
): boolean {
  const bandsActive = profile.hasResistanceBands !== false;
  const barActive = profile.hasPullUpBar !== false;
  if (exercise.requiresBand && !bandsActive) return false;
  if (exercise.requiresBar && !barActive) return false;
  return true;
}
