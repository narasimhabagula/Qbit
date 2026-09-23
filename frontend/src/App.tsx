import React from 'react';
import { useGameStore } from './store/useGameStore';
import { Navbar } from './components/navigation/Navbar';
import { Sidebar } from './components/navigation/Sidebar';
import { BottomNav } from './components/navigation/BottomNav';
import { LandingPage } from './components/landing/LandingPage';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { LessonView } from './components/learn/LessonView';
import { QuantumPlayground } from './components/playground/QuantumPlayground';
import { CodeStudio } from './components/code/CodeStudio';
import { VisualizationLab } from './components/visualization/VisualizationLab';
import { PracticeHub } from './components/practice/PracticeHub';
import { ProgressPage } from './components/progress/ProgressPage';
import { LeaderboardPage } from './components/leaderboard/LeaderboardPage';
import { ProfilePage } from './components/profile/ProfilePage';
import { InstructorDashboard } from './components/instructor/InstructorDashboard';
import { QBitAIAssistant } from './components/ai/QBitAIAssistant';
import { AuthModal } from './components/auth/AuthModal';

export function App() {
  const [store] = useGameStore();

  return (
    <>
      {/* Global Authentication Modal */}
      <AuthModal />

      {store.currentView === 'landing' && (
        <div className="min-h-screen bg-slate-50 font-sans">
          <LandingPage />
          <QBitAIAssistant />
        </div>
      )}

      {store.currentView === 'onboarding' && (
        <div className="min-h-screen bg-slate-50 font-sans">
          <OnboardingModal />
        </div>
      )}

      {store.currentView === 'lesson' && (
        <div className="min-h-screen bg-slate-50 font-sans">
          <LessonView />
          <QBitAIAssistant />
        </div>
      )}

      {store.currentView !== 'landing' && store.currentView !== 'onboarding' && store.currentView !== 'lesson' && (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-16 lg:pb-0">
          <Navbar />

          <div className="flex-1 flex max-w-7xl w-full mx-auto">
            <Sidebar />

            <main className="flex-1 min-w-0 overflow-y-auto">
              {store.currentView === 'dashboard' && <DashboardView />}
              {store.currentView === 'playground' && <QuantumPlayground />}
              {store.currentView === 'code' && <CodeStudio />}
              {store.currentView === 'visualization' && <VisualizationLab />}
              {store.currentView === 'practice' && <PracticeHub />}
              {store.currentView === 'progress' && <ProgressPage />}
              {store.currentView === 'leaderboard' && <LeaderboardPage />}
              {store.currentView === 'profile' && <ProfilePage />}
              {store.currentView === 'instructor' && <InstructorDashboard />}
            </main>
          </div>

          <BottomNav />
          <QBitAIAssistant />
        </div>
      )}
    </>
  );
}

export default App;
