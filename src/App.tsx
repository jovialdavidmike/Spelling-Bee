import React, { useState, useEffect } from 'react';
import { AppView, UserRole, SessionSettings } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AuthLoadingScreen } from './components/common/AuthLoadingScreen';
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
import { TeacherReports } from './components/teacher/TeacherReports';
import { TeacherSettings } from './components/teacher/TeacherSettings';
import { TeacherClasses } from './components/teacher/TeacherClasses';
import { TeacherCompetitionBuilder } from './components/teacher/TeacherCompetitionBuilder';
import { TeacherCompetitionLive } from './components/teacher/TeacherCompetitionLive';
import { TeacherCompetitionResults } from './components/teacher/TeacherCompetitionResults';
import { CompetitionLiveSession } from './components/student/CompetitionLiveSession';
import { CompetitionsHub } from './components/common/CompetitionsHub';
import { AuthModal } from './components/common/AuthModal';

function AppContent() {
  const { user, role, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [currentRole, setCurrentRole] = useState<UserRole>(role);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [activeSessionSettings, setActiveSessionSettings] = useState<SessionSettings | undefined>(undefined);
  const [activeCustomWordIds, setActiveCustomWordIds] = useState<string[] | undefined>(undefined);
  const [activeSessionTitle, setActiveSessionTitle] = useState<string | undefined>(undefined);
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | undefined>(undefined);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('std_01');
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string | undefined>(undefined);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Synchronize state with AuthProvider role
  useEffect(() => {
    setCurrentRole(role);
  }, [role]);

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (newRole === 'student' && currentView === 'landing') {
      setCurrentView('student-dashboard');
    } else if (newRole === 'teacher' && currentView === 'landing') {
      setCurrentView('teacher-dashboard');
    } else if (newRole === 'guest') {
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

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      // Public Views
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} onRoleChange={handleRoleChange} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} onRoleChange={handleRoleChange} />;
      case 'competition-guide':
        return <CompetitionGuidePage onNavigate={handleNavigate} onRoleChange={handleRoleChange} />;

      // Student Views (Protected)
      case 'student-dashboard':
        return (
          <ProtectedRoute allowedRoles={['student', 'admin']} currentView={currentView} onNavigate={handleNavigate}>
            <StudentDashboard
              onNavigate={handleNavigate}
              onLaunchPractice={handleLaunchPractice}
            />
          </ProtectedRoute>
        );
      case 'practice-setup':
        return (
          <ProtectedRoute currentView={currentView} onNavigate={handleNavigate}>
            <PracticeSetupView
              onNavigate={handleNavigate}
              onLaunchSession={handleLaunchPractice}
            />
          </ProtectedRoute>
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
        return (
          <CompetitionsHub
            currentRole={currentRole}
            onNavigate={handleNavigate}
            onShowToast={showToast}
            onSelectCompetition={(id) => setSelectedCompetitionId(id)}
          />
        );
      case 'competition-session':
        return (
          <ProtectedRoute currentView={currentView} onNavigate={handleNavigate}>
            <CompetitionLiveSession
              competitionId={selectedCompetitionId}
              onNavigate={handleNavigate}
              onShowToast={showToast}
              onLaunchPracticeMistakes={(wordIds) => {
                setActiveCustomWordIds(wordIds);
                setActiveSessionTitle('Remedial Practice: Competition Missed Words');
                handleNavigate('practice');
              }}
            />
          </ProtectedRoute>
        );
      case 'competition-results':
        return (
          <TeacherCompetitionResults
            competitionId={selectedCompetitionId}
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        );
      case 'word-library':
        return (
          <WordLibrary
            onNavigate={handleNavigate}
            onPracticeSingle={handlePracticeSingleWord}
          />
        );
      case 'mistakes':
        return (
          <ProtectedRoute currentView={currentView} onNavigate={handleNavigate}>
            <MistakesReview
              onNavigate={handleNavigate}
              onLaunchPractice={handleLaunchPractice}
            />
          </ProtectedRoute>
        );
      case 'progress':
        return (
          <ProtectedRoute currentView={currentView} onNavigate={handleNavigate}>
            <StudentProgress onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case 'achievements':
        return (
          <ProtectedRoute currentView={currentView} onNavigate={handleNavigate}>
            <AchievementsView onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case 'leaderboard':
        return <LeaderboardView onNavigate={handleNavigate} />;
      case 'student-profile':
        return (
          <ProtectedRoute allowedRoles={['student', 'admin']} currentView={currentView} onNavigate={handleNavigate}>
            <StudentProfile onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case 'student-settings':
        return (
          <ProtectedRoute currentView={currentView} onNavigate={handleNavigate}>
            <StudentSettings onNavigate={handleNavigate} onShowToast={showToast} />
          </ProtectedRoute>
        );

      // Teacher Views (Protected)
      case 'teacher-dashboard':
        return (
          <ProtectedRoute allowedRoles={['teacher', 'admin']} currentView={currentView} onNavigate={handleNavigate}>
            <TeacherDashboard
              onNavigate={handleNavigate}
              onSelectStudent={(id) => setSelectedStudentId(id)}
            />
          </ProtectedRoute>
        );
      case 'teacher-students':
        return (
          <ProtectedRoute allowedRoles={['teacher', 'admin']} currentView={currentView} onNavigate={handleNavigate}>
            <TeacherStudents
              onNavigate={handleNavigate}
              onSelectStudent={(id) => setSelectedStudentId(id)}
            />
          </ProtectedRoute>
        );
      case 'teacher-student-detail':
        return (
          <ProtectedRoute allowedRoles={['teacher', 'admin']} currentView={currentView} onNavigate={handleNavigate}>
            <TeacherStudentDetail
              studentId={selectedStudentId}
              onNavigate={handleNavigate}
              onShowToast={showToast}
            />
          </ProtectedRoute>
        );
      case 'teacher-assign':
        return (
          <ProtectedRoute allowedRoles={['teacher', 'admin']} currentView={currentView} onNavigate={handleNavigate}>
            <TeacherAssignPractice
              onNavigate={handleNavigate}
              onShowToast={showToast}
            />
          </ProtectedRoute>
        );
      case 'teacher-word-sets':
        return (
          <ProtectedRoute allowedRoles={['teacher', 'admin']} currentView={currentView} onNavigate={handleNavigate}>
            <TeacherWordSets
              onNavigate={handleNavigate}
              onShowToast={showToast}
            />
          </ProtectedRoute>
        );
      case 'teacher-competition':
        return (
          <ProtectedRoute allowedRoles={['teacher', 'admin']} currentView={currentView} onNavigate={handleNavigate}>
            <CompetitionsHub
              currentRole={currentRole}
              onNavigate={handleNavigate}
              onShowToast={showToast}
              onSelectCompetition={(id) => setSelectedCompetitionId(id)}
            />
          </ProtectedRoute>
        );
      case 'teacher-competition-builder':
        return (
          <ProtectedRoute allowedRoles={['teacher', 'admin']} currentView={currentView} onNavigate={handleNavigate}>
            <TeacherCompetitionBuilder
              onNavigate={handleNavigate}
              onShowToast={showToast}
            />
          </ProtectedRoute>
        );
      case 'teacher-competition-live':
        return (
          <ProtectedRoute allowedRoles={['teacher', 'admin']} currentView={currentView} onNavigate={handleNavigate}>
            <TeacherCompetitionLive
              competitionId={selectedCompetitionId}
              onNavigate={handleNavigate}
              onShowToast={showToast}
            />
          </ProtectedRoute>
        );
      case 'teacher-competition-results':
        return (
          <ProtectedRoute allowedRoles={['teacher', 'admin']} currentView={currentView} onNavigate={handleNavigate}>
            <TeacherCompetitionResults
              competitionId={selectedCompetitionId}
              onNavigate={handleNavigate}
              onShowToast={showToast}
            />
          </ProtectedRoute>
        );
      case 'teacher-reports':
        return (
          <ProtectedRoute allowedRoles={['teacher', 'admin']} currentView={currentView} onNavigate={handleNavigate}>
            <TeacherReports
              onNavigate={handleNavigate}
              onShowToast={showToast}
            />
          </ProtectedRoute>
        );
      case 'teacher-settings':
        return (
          <ProtectedRoute allowedRoles={['teacher', 'admin']} currentView={currentView} onNavigate={handleNavigate}>
            <TeacherSettings onNavigate={handleNavigate} onShowToast={showToast} />
          </ProtectedRoute>
        );
      case 'teacher-classes':
        return (
          <ProtectedRoute allowedRoles={['teacher', 'admin']} currentView={currentView} onNavigate={handleNavigate}>
            <TeacherClasses
              onNavigate={handleNavigate}
              onShowToast={showToast}
            />
          </ProtectedRoute>
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

      {/* Real Auth Modal */}
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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
