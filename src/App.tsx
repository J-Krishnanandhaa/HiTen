import React, { useState } from 'react';
import {
  loadUserProfile, saveUserProfile,
  loadRoutines, saveRoutines,
  loadWorkoutLogs, migrateStorage,
} from './utils/storage';
import { computeWeeklyStreak } from './utils/streak';
import { OnboardingFlow } from './components/Onboarding/OnboardingFlow';
import { UserProfile, Routine, WorkoutSessionLog } from './types';
import { Navbar, ActiveTab } from './components/Navbar';
import { WorkoutHub } from './components/Workout/WorkoutHub';
import { WorkoutPlayer } from './components/Workout/WorkoutPlayer';
import { ExerciseLibraryView } from './components/ExerciseLibrary/ExerciseLibraryView';
import { HistoryView } from './components/History/HistoryView';
import { ProfileAndBandsModal } from './components/Settings/ProfileAndBandsModal';
import { initTheme } from './utils/theme';

// Move v1 (bandfit_*) data to v2 before anything is read.
migrateStorage();
initTheme();

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('training');
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadUserProfile());
  const [routines, setRoutines] = useState<Routine[]>(() => loadRoutines());
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutSessionLog[]>(() => loadWorkoutLogs());

  // Active Live Workout Session
  const [activeWorkoutRoutine, setActiveWorkoutRoutine] = useState<Routine | null>(null);

  // Sync profile changes
  const handleUpdateProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    saveUserProfile(updated);
  };

  // Sync routine save
  const handleSaveRoutine = (routine: Routine) => {
    const existingIndex = routines.findIndex(r => r.id === routine.id);
    let updated: Routine[];
    if (existingIndex >= 0) {
      updated = [...routines];
      updated[existingIndex] = routine;
    } else {
      updated = [routine, ...routines];
    }
    setRoutines(updated);
    saveRoutines(updated);
  };

  // Sync workout finish
  const handleWorkoutFinished = (newLog: WorkoutSessionLog) => {
    const updated = [newLog, ...workoutLogs];
    setWorkoutLogs(updated);
    setActiveWorkoutRoutine(null);
    setActiveTab('report');

    const freshProfile = loadUserProfile();
    setUserProfile(freshProfile);
  };

  return (
    <div className="min-h-screen bg-hy-bg text-hy-text flex flex-col">
      {/* Navigation Bars */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        isWorkoutActive={!!activeWorkoutRoutine}
        onOpenActiveWorkout={() => {}}
        streakWeeks={computeWeeklyStreak(workoutLogs, userProfile.weeklyGoal || 4).weeks}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl md:max-w-4xl lg:max-w-5xl landscape:max-w-5xl w-full mx-auto px-3 sm:px-4 md:px-6 pt-3 landscape:pt-2 pb-20 landscape:pb-16 transition-all">
        {activeTab === 'training' && (
          <WorkoutHub
            routines={routines}
            userProfile={userProfile}
            recentLogs={workoutLogs}
            onStartRoutine={(routine) => setActiveWorkoutRoutine(routine)}
            onSaveRoutine={handleSaveRoutine}
            onOpenBandsSetup={() => setActiveTab('me')}
            onUpdateUserProfile={handleUpdateProfile}
          />
        )}

        {activeTab === 'exercises' && (
          <ExerciseLibraryView />
        )}

        {activeTab === 'report' && (
          <HistoryView
            workoutLogs={workoutLogs}
            userProfile={userProfile}
            onUpdateWeight={(newWeightKg) => {
              handleUpdateProfile({
                ...userProfile,
                weightKg: newWeightKg,
              });
            }}
            onNavigateToTraining={() => setActiveTab('training')}
          />
        )}

        {activeTab === 'me' && (
          <ProfileAndBandsModal
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </main>

      {/* First-run setup */}
      {!userProfile.onboarded && (
        <OnboardingFlow profile={userProfile} onComplete={handleUpdateProfile} />
      )}

      {/* Fullscreen Interactive Workout Player */}
      {activeWorkoutRoutine && (
        <WorkoutPlayer
          routine={activeWorkoutRoutine}
          userProfile={userProfile}
          workoutLogs={workoutLogs}
          onExit={() => setActiveWorkoutRoutine(null)}
          onFinished={handleWorkoutFinished}
        />
      )}
    </div>
  );
};
export default App;
