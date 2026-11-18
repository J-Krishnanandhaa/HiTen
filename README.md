# HyTen 🏋️‍♂️⚡
> **Hybrid Tension Progressive Overload Fitness Platform**  
> Specifically engineered for Resistance Bands, Calisthenics & Bodyweight Progressive Overload.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8.6-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![Android APK](https://img.shields.io/badge/Android-5.26MB_APK-3DDC84?logo=android&logoColor=white)](./HyTen.apk)

---

## 💡 Why HyTen?

Most mainstream fitness and home workout apps assume one of two extremes:
1. **Zero equipment apps**: Rely purely on high-rep calisthenics with no meaningful path for progressive overload.
2. **Gym-focused apps**: Assume heavy barbells, cable stacks, and dumbbells, failing to understand elastic variable resistance curves.

**HyTen** (*Hybrid Tension*) bridges this gap. It is built from the ground up for trainees utilizing **resistance bands (loop bands, tube bands with door anchors) and bodyweight leverage (pull-up bars, floor calisthenics)**. It models the escalating tension curve of elastic resistance, supports stacked bands, and tracks workout volume, sets, and calorie expenditure in an intuitive, offline-first mobile app.

---

## ✨ Key Features

### 1. 📅 Master Program & Workday Splits (PPL Engine)
* **Equipment-Adaptive Programming**: Workouts automatically re-route based on the equipment you own (Pull-Up Bar + Resistance Bands). Toggle equipment in the **Me** tab to dynamically adapt all routines.
* **Push / Pull / Legs (PPL) Split Architectures**:
  * **4-Day Split**: Push, Pull, Legs, Core & Conditioning (Ideal for recovery & hypertrophy).
  * **5-Day Split**: Push, Pull, Legs, Upper Hypertrophy, Lower & Core.
  * **6-Day Split**: Push 1, Pull 1, Legs 1, Push 2, Pull 2, Core & Conditioning.
* **Duration Scaler**: Scale any routine between **15, 20, 30, or 45 minutes** on the fly—rep schemes and rest intervals dynamically adjust to fit your schedule.
* **7x4 Full Body Challenge**: 28-day progressive overload program designed for total-body conditioning.

### 2. ⚡ Live Workout Player with Real-Time Calorie Burn
* **Live Calorie Counter**: Real-time workout calorie expenditure computed using verified metabolic equivalent (MET ~6.0–7.5) formulas calibrated to your body weight.
* **Animated Exercise Avatar**: Vector-rendered visual animation illustrating anatomical plane of motion, eccentric tempo, and concentric contraction.
* **Band Resistance Stacking**: Tap any combination of owned bands to stack resistance (e.g., Orange [30 lbs] + Black [40 lbs] = 70 lbs total load).
* **Audio Voice Coach & Timers**:
  * Web Speech synthesized announcements (*"Ready to go"*, *"Take a rest"*, *"Halfway there"*).
  * Synthesized frequency audio countdown beeps and start whistles.
* **Rest Engine**: Fullscreen rest screen with circular countdown timer, technique cues for the upcoming exercise, `+20s` recovery extension, and instant skip options.

### 3. 🎥 Audited Exercise Video Demonstrations (Exact Timestamps)
Every single exercise in the 59-movement database is mapped to the exact start second (`▶ MM:SS`) where trainer demonstration begins across 4 reference video libraries:
* **Thenx / Chris Heria**: Bar calisthenics, power band deadlifts, strict pull-ups, and band-assisted gymnastics.
* **Fitness My Life / Slovic**: Tube band full-body mastery (lat pulldowns, tricep pushdowns, chest presses, rows).
* **Tom Peto Training**: Loop band follow-along circuit training.
* **Rowan Row**: Calisthenics and floor bodyweight movements.
* *Fallback protection*: Automatically falls back to targeted YouTube form tutorials if no timestamp is present.

### 4. 📊 Analytics & Report Dashboard (Home Workout Style)
* **Tri-Metric Hero Banner**: Immediate visibility of **Total Workouts**, **Total Calories Burnt (kcal)**, **Active Minutes**, and **Average Calories / Workout**.
* **7-Day Calorie Burn Bar Chart**: Visual Mon–Sun weekly breakdown with daily averages and current week totals.
* **Monthly Workout Calendar**: Visual calendar highlighting workout days with Dumbbell badges and burned calories (`🔥 140 kcal`).
* **Day Inspector**: Tap any calendar day to inspect completed routines, total volume (lbs), exercises, sets, reps, and average burn rate.
* **Weight Tracker & BMI Gauge**: Log body weight (with unrestricted backspace typing) and track your Body Mass Index across visual color gauges (Underweight, Normal, Overweight, Obese).
* **Complete Workout History**: Searchable chronological log of all historical workouts with full exercise set breakdowns.

### 5. ⚙️ Offline-First & Data Sovereignty
* **100% Offline Capable**: All routines, exercises, animations, and voice audio work completely without internet access.
* **Zero Account Required**: Zero sign-ups, zero tracking, zero telemetries.
* **Full Data Portability**: Export your entire workout history and profile settings as a raw JSON backup and restore it with one click.

---

## 📱 Tech Stack & Architecture

```
HyTen (com.hyten.workout)
├── Frontend Core: React 18 (Hooks, Context, StrictMode)
├── Language: TypeScript 5.7 (Strict Type Checking)
├── Build Engine: Vite 6.0 (Lightning-fast HMR & Tree-Shaking)
├── Styling: Tailwind CSS 3.4 (Custom Design System, Dark Mode)
├── Icons: Lucide React Icons
├── Mobile Wrapper: Capacitor 8.6 (Android WebView Bridge)
└── Audio & TTS: Web Speech API & HTML5 Audio Buffer Synthesis
```

---

## 🛠️ Project Structure

```
HomeWorkout/
├── android/                 # Native Android Gradle project (Capacitor)
│   ├── app/                 # Android application manifest, icons, build configs
│   └── build.gradle         # Android project gradle build script
├── public/                  # Static assets & synthesized audio cues
├── src/
│   ├── components/
│   │   ├── Common/          # Avatar animations, YouTube badges
│   │   ├── ExerciseLibrary/ # Exercise library view, video cue links
│   │   ├── History/         # Report tab, calorie chart, calendar, BMI
│   │   ├── Settings/        # Profile & bands management modal
│   │   ├── Workout/         # Workout player, hub, routine builder
│   │   └── Navbar.tsx       # Bottom 4-tab navigation & header
│   ├── data/
│   │   ├── defaultBands.ts  # Standard Slovic & loop band specifications
│   │   ├── exerciseDatabase.ts # 59 exercises with exact audited video cues
│   │   └── prebuiltWorkouts.ts # Workday PPL splits & 7x4 challenge routines
│   ├── types/               # TypeScript interfaces & types
│   ├── utils/
│   │   ├── equipmentManager.ts # Equipment routing logic
│   │   ├── nutritionMath.ts    # MET calorie formulas & weekly statistics
│   │   ├── routineScaler.ts    # 15/20/30/45 minute dynamic scaler
│   │   ├── soundEffects.ts     # Voice coach & audio cue synthesizer
│   │   └── storage.ts          # LocalStorage persistence & JSON export/import
│   ├── App.tsx              # Root application router & state controller
│   ├── index.css            # Tailwind directives & design tokens
│   └── main.tsx             # React DOM entry point
├── capacitor.config.ts      # Capacitor mobile configuration
├── package.json             # NPM dependencies & scripts
├── tailwind.config.js       # Color palette & responsive breakpoints
├── tsconfig.json            # TypeScript compiler configuration
└── vite.config.ts           # Vite dev server & production bundling
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **Java Development Kit (JDK)**: JDK 17 or higher (for Android APK compilation)
* **Android Studio & SDK**: API Level 34+ (optional, for native builds)

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/J-Krishnanandhaa/HiTen.git
cd HiTen
npm install
```

### 2. Run Local Development Server
Start the local Vite dev server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open **[http://localhost:5174](http://localhost:5174)** in your browser.

To access the app from your phone on the same Wi-Fi network:
```bash
npm run dev -- --host
```

### 3. Production Web Build
```bash
npm run build
```
Generates an optimized static bundle in `dist/`.

---

## 🤖 Android Compilation & Installation

### Build Debug APK via Gradle
```bash
# 1. Build web assets & sync to Android project
npm run build
npx cap sync android

# 2. Compile APK with Gradle
cd android
./gradlew assembleDebug

# Output APK:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Install Directly on Android Device via ADB
```bash
adb install -r "HyTen.apk"
```

You can also download [HyTen.apk](./HyTen.apk) directly from this repository and install it on your Android smartphone.

---

## 📄 License
This project is open-source and available under the **MIT License**.
