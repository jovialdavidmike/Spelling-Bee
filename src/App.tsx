import React, { useState } from 'react';
import { AppView, UserRole, SessionSettings } from './types';
import { TopBar } from './components/common/TopBar';
import { Sidebar } from './components/common/Sidebar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { ToastContainer, ToastMessage } from './components/common/Toast';

// Public pages
import { LandingPage } from './components/public/LandingPage';
import { AboutPage } from './components/public/AboutPage';
import { CompetitionGuidePage } from './components/public/CompetitionGuidePage';

// Student pages
import { StudentDashboard } from './components/student/StudentDashboard';
import { PracticeSetupView } from './components/student/PracticeSetupView';
import { PracticeSession } from './components/student/PracticeSession';
import { CompetitionMode } from './components/student/CompetitionMode';
import { WordLibrary } from './components/student/WordLibrary';
import { MistakesReview } from './components/student/MistakesReview';
import { StudentProgress } from './components/student/StudentProgress';
import { AchievementsView } from './components/student/AchievementsView';
import { LeaderboardView } from './components/student/LeaderboardView';
import { StudentProfile } from './components/student/StudentProfile';
import { StudentSettings } from './components/student/StudentSettings';

// Teacher pages
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { TeacherStudents } from './components/teacher/TeacherStudents';
import { TeacherStudentDetail } from './components/teacher/TeacherStudentDetail';
import { TeacherAssignPractice } from './components/teacher/TeacherAssignPractice';
import { TeacherWordSets } from './components/teacher/TeacherWordSets';
import { TeacherCompetitionRoom } from './components/teacher/TeacherCompetitionRoom';
import { TeacherReports } from './components/teacher/TeacherReports';
import { TeacherSettings } from './components/teacher/TeacherSettings';
import { TeacherClasses } from './components/teacher/TeacherClasses';
import { AuthModal } from './components/common/AuthModal';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [currentRole, setCurrentRole] = useState<UserRole>('guest');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [activeSessionSettings, setActiveSessionSettings] = useState<SessionSettings | undefined>(undefined);
  const [activeCustomWordIds, setActiveCustomWordIds] = useState<string[] | undefined>(undefined);
  const [activeSessionTitle, setActiveSessionTitle] = useState<string | undefined>(undefined);
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | undefined>(undefined);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('std_01');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'student' && currentView === 'landing') {
      setCurrentView('student-dashboard');
    } else if (role === 'teacher' && currentView === 'landing') {
      setCurrentView('teacher-dashboard');
    } else if (role === 'guest') {
      setCurrentView('landing');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleLaunchPractice = (
    settings: SessionSettings,
    wordIds?: string[],
    title?: string,
    assignmentId?: string
  ) => {
    setActiveSessionSettings(settings);
    setActiveCustomWordIds(wordIds);
    setActiveSessionTitle(title);
    setActiveAssignmentId(assignmentId);
    setCurrentView('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePracticeSingleWord = (wordId: string) => {
    const settings: SessionSettings = {
      mode: 'single',
      wordCount: 1,
      difficulty: 'Mixed',
      category: 'All Categories',
      allowSkip: false,
      allowRetry: true,
      showDefinitionAfterAnswer: true,
      showExampleAfterAnswer: true,
      scoringRule: 'standard'
    };
    handleLaunchPractice(settings, [wordId], 'Single Word Practice');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      // Public Views
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} onRoleChange={handleRoleChange} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} onRoleChange={handleRoleChange} />;
      case 'competition-guide':
        return <CompetitionGuidePage onNavigate={handleNavigate} onRoleChange={handleRoleChange} />;

      // Student Views
      case 'student-dashboard':
        return (
          <StudentDashboard
            onNavigate={handleNavigate}
            onLaunchPractice={handleLaunchPractice}
          />
        );
      case 'practice-setup':
        return (
          <PracticeSetupView
            onNavigate={handleNavigate}
            onLaunchSession={handleLaunchPractice}
          />
        );
      case 'practice':
        return (
          <PracticeSession
            onNavigate={handleNavigate}
            sessionSettings={activeSessionSettings}
            customWordIds={activeCustomWordIds}
            sessionTitle={activeSessionTitle}
            assignmentId={activeAssignmentId}
          />
        );
      case 'competition':
        return <CompetitionMode onNavigate={handleNavigate} />;
      case 'word-library':
        return (
          <WordLibrary
            onNavigate={handleNavigate}
            onPracticeSingle={handlePracticeSingleWord}
          />
        );
      case 'mistakes':
        return (
          <MistakesReview
            onNavigate={handleNavigate}
            onLaunchPractice={handleLaunchPractice}
          />
        );
      case 'progress':
        return <StudentProgress onNavigate={handleNavigate} />;
      case 'achievements':
        return <AchievementsView onNavigate={handleNavigate} />;
      case 'leaderboard':
        return <LeaderboardView onNavigate={handleNavigate} />;
      case 'student-profile':
        return <StudentProfile onNavigate={handleNavigate} />;
      case 'student-settings':
        return <StudentSettings onNavigate={handleNavigate} onShowToast={showToast} />;

      // Teacher Views
      case 'teacher-dashboard':
        return (
          <TeacherDashboard
            onNavigate={handleNavigate}
            onSelectStudent={(id) => setSelectedStudentId(id)}
          />
        );
      case 'teacher-students':
        return (
          <TeacherStudents
            onNavigate={handleNavigate}
            onSelectStudent={(id) => setSelectedStudentId(id)}
          />
        );
      case 'teacher-student-detail':
        return (
          <TeacherStudentDetail
            studentId={selectedStudentId}
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        );
      case 'teacher-assign':
        return (
          <TeacherAssignPractice
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        );
      case 'teacher-word-sets':
        return (
          <TeacherWordSets
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        );
      case 'teacher-competition':
        return (
          <TeacherCompetitionRoom
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        );
      case 'teacher-reports':
        return (
          <TeacherReports
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        );
      case 'teacher-settings':
        return (
          <TeacherSettings
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        );
      case 'teacher-classes':
        return (
          <TeacherClasses
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        );

      default:
        return <LandingPage onNavigate={handleNavigate} onRoleChange={handleRoleChange} />;
    }
  };

  const showSidebar = currentRole !== 'guest' && currentView !== 'landing' && currentView !== 'about' && currentView !== 'competition-guide';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Bar Header */}
      <TopBar
        currentView={currentView}
        currentRole={currentRole}
        onNavigate={handleNavigate}
        onRoleChange={handleRoleChange}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar */}
        {showSidebar && (
          <Sidebar
            currentView={currentView}
            currentRole={currentRole}
            onNavigate={handleNavigate}
          />
        )}

        {/* Dynamic View Content */}
        <main className={`flex-1 w-full ${showSidebar ? 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto' : ''} mb-14 lg:mb-0`}>
          {renderCurrentView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        currentView={currentView}
        currentRole={currentRole}
        onNavigate={handleNavigate}
      />

      {/* Auth & Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onRoleChanged={handleRoleChange}
        onNavigate={handleNavigate}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
