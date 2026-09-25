import React, { useState } from 'react';
import { UserRole, AppView, AppNotification } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import {
  Shield,
  Menu,
  X,
  Bell,
  KeyRound,
  GraduationCap,
  LogOut,
  ChevronDown,
  User,
  Settings,
  Sparkles
} from 'lucide-react';

interface Props {
  currentView: AppView;
  currentRole: UserRole;
  onNavigate: (view: AppView) => void;
  onRoleChange: (role: UserRole) => void;
  onOpenAuthModal: () => void;
}

export const TopBar: React.FC<Props> = ({
  currentView,
  currentRole,
  onNavigate,
  onRoleChange,
  onOpenAuthModal
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const notifications = dataService.getNotifications(currentRole);
  const unreadCount = notifications.filter(n => !n.read).length;

  const isPublic = currentRole === 'guest';
  const isStudent = currentRole === 'student';
  const isTeacher = currentRole === 'teacher';
  const isAdmin = currentRole === 'admin';

  const handleNav = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    dataService.markNotificationRead(notif.id);
    if (notif.linkView) {
      onNavigate(notif.linkView);
    }
    setNotifDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    onRoleChange('guest');
    onNavigate('landing');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNav(isPublic ? 'landing' : isStudent ? 'student-dashboard' : 'teacher-dashboard')}
            className="text-xl font-bold tracking-tight text-slate-900 hover:text-amber-600 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded cursor-pointer"
          >
            <span>SpellReady</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block mb-1" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-600">
          {isPublic && (
            <>
              <button
                onClick={() => handleNav('landing')}
                className={`hover:text-slate-900 transition-colors pb-0.5 cursor-pointer ${currentView === 'landing' ? 'text-slate-900 border-b-2 border-amber-500 font-bold' : ''}`}
              >
                Home
              </button>
              <button
                onClick={() => handleNav('about')}
                className={`hover:text-slate-900 transition-colors pb-0.5 cursor-pointer ${currentView === 'about' ? 'text-slate-900 border-b-2 border-amber-500 font-bold' : ''}`}
              >
                How It Works
              </button>
              <button
                onClick={() => handleNav('competition-guide')}
                className={`hover:text-slate-900 transition-colors pb-0.5 cursor-pointer ${currentView === 'competition-guide' ? 'text-slate-900 border-b-2 border-amber-500 font-bold' : ''}`}
              >
                Competition Guide
              </button>
              <button
                onClick={() => handleNav('practice')}
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                Try Practice
              </button>
            </>
          )}

          {isStudent && (
            <>
              <button
                onClick={() => handleNav('student-dashboard')}
                className={`hover:text-slate-900 transition-colors pb-0.5 cursor-pointer ${currentView === 'student-dashboard' ? 'text-slate-900 border-b-2 border-amber-500 font-bold' : ''}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNav('practice')}
                className={`hover:text-slate-900 transition-colors pb-0.5 cursor-pointer ${currentView === 'practice' ? 'text-slate-900 border-b-2 border-amber-500 font-bold' : ''}`}
              >
                Practice
              </button>
              <button
                onClick={() => handleNav('competition')}
                className={`hover:text-slate-900 transition-colors pb-0.5 cursor-pointer ${currentView === 'competition' ? 'text-slate-900 border-b-2 border-amber-500 font-bold' : ''}`}
              >
                Competitions
              </button>
              <button
                onClick={() => handleNav('word-library')}
                className={`hover:text-slate-900 transition-colors pb-0.5 cursor-pointer ${currentView === 'word-library' ? 'text-slate-900 border-b-2 border-amber-500 font-bold' : ''}`}
              >
                Word Library
              </button>
              <button
                onClick={() => handleNav('mistakes')}
                className={`hover:text-slate-900 transition-colors pb-0.5 cursor-pointer ${currentView === 'mistakes' ? 'text-slate-900 border-b-2 border-amber-500 font-bold' : ''}`}
              >
                Mistakes
              </button>
              <button
                onClick={() => handleNav('progress')}
                className={`hover:text-slate-900 transition-colors pb-0.5 cursor-pointer ${currentView === 'progress' ? 'text-slate-900 border-b-2 border-amber-500 font-bold' : ''}`}
              >
                Progress
              </button>
            </>
          )}

          {(isTeacher || isAdmin) && (
            <>
              <button
                onClick={() => handleNav('teacher-dashboard')}
                className={`hover:text-slate-900 transition-colors pb-0.5 cursor-pointer ${currentView === 'teacher-dashboard' ? 'text-slate-900 border-b-2 border-indigo-600 font-bold' : ''}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNav('teacher-classes')}
                className={`hover:text-slate-900 transition-colors pb-0.5 cursor-pointer ${currentView === 'teacher-classes' ? 'text-slate-900 border-b-2 border-indigo-600 font-bold' : ''}`}
              >
                Classrooms
              </button>
              <button
                onClick={() => handleNav('teacher-students')}
                className={`hover:text-slate-900 transition-colors pb-0.5 cursor-pointer ${currentView === 'teacher-students' ? 'text-slate-900 border-b-2 border-indigo-600 font-bold' : ''}`}
              >
                Students
              </button>
              <button
                onClick={() => handleNav('teacher-assign')}
                className={`hover:text-slate-900 transition-colors pb-0.5 cursor-pointer ${currentView === 'teacher-assign' ? 'text-slate-900 border-b-2 border-indigo-600 font-bold' : ''}`}
              >
                Assign
              </button>
              <button
                onClick={() => handleNav('teacher-competition')}
                className={`hover:text-slate-900 transition-colors pb-0.5 cursor-pointer ${currentView === 'teacher-competition' ? 'text-slate-900 border-b-2 border-indigo-600 font-bold' : ''}`}
              >
                Competitions
              </button>
              <button
                onClick={() => handleNav('teacher-reports')}
                className={`hover:text-slate-900 transition-colors pb-0.5 cursor-pointer ${currentView === 'teacher-reports' ? 'text-slate-900 border-b-2 border-indigo-600 font-bold' : ''}`}
              >
                Mistake Analytics
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Actions & Notifications & User Menu */}
        <div className="flex items-center gap-2.5">
          
          {/* Notifications Dropdown */}
          {!isPublic && (
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors relative cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 text-xs z-50 space-y-1">
                  <div className="px-3 py-1.5 font-bold text-slate-800 border-b border-slate-100 flex items-center justify-between text-[11px]">
                    <span>Notifications ({unreadCount} new)</span>
                  </div>
                  {notifications.slice(0, 4).map(n => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                        n.read ? 'text-slate-500 hover:bg-slate-50' : 'bg-amber-50/60 text-slate-900 font-medium hover:bg-amber-100/50'
                      }`}
                    >
                      <div className="font-semibold text-[11px] text-slate-800">{n.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">{n.message}</div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="p-3 text-center text-slate-400 text-[11px]">No notifications right now.</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* User Sign In / Account Dropdown */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200 cursor-pointer shadow-2xs"
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                  isTeacher ? 'bg-indigo-600' : isAdmin ? 'bg-purple-600' : 'bg-amber-500 text-slate-900'
                }`}>
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <span className="truncate max-w-[120px]">{user.displayName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-xs z-50 space-y-0.5">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <div className="font-bold text-slate-900 truncate">{user.displayName}</div>
                    <div className="text-[10px] text-slate-500 truncate">{user.email || user.studentCode}</div>
                    <div className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {user.role}
                    </div>
                  </div>

                  {isStudent && (
                    <button
                      onClick={() => handleNav('student-profile')}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>My Profile</span>
                    </button>
                  )}

                  {isTeacher && (
                    <button
                      onClick={() => handleNav('teacher-settings')}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      <span>School Settings</span>
                    </button>
                  )}

                  <button
                    onClick={() => { setUserMenuOpen(false); onOpenAuthModal(); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Switch User / Persona</span>
                  </button>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-semibold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 text-xs">
          {isPublic && (
            <>
              <button onClick={() => handleNav('landing')} className="block w-full text-left px-3 py-2 font-medium text-slate-700 rounded-lg hover:bg-slate-50">Home</button>
              <button onClick={() => handleNav('about')} className="block w-full text-left px-3 py-2 font-medium text-slate-700 rounded-lg hover:bg-slate-50">How It Works</button>
              <button onClick={() => handleNav('competition-guide')} className="block w-full text-left px-3 py-2 font-medium text-slate-700 rounded-lg hover:bg-slate-50">Competition Guide</button>
              <button onClick={() => handleNav('practice')} className="block w-full text-left px-3 py-2 font-medium text-slate-700 rounded-lg hover:bg-slate-50">Try Practice Drill</button>
            </>
          )}
          {isStudent && (
            <>
              <button onClick={() => handleNav('student-dashboard')} className="block w-full text-left px-3 py-2 font-medium text-slate-700 rounded-lg hover:bg-slate-50">Dashboard</button>
              <button onClick={() => handleNav('practice')} className="block w-full text-left px-3 py-2 font-medium text-slate-700 rounded-lg hover:bg-slate-50">Practice Mode</button>
              <button onClick={() => handleNav('competition')} className="block w-full text-left px-3 py-2 font-medium text-slate-700 rounded-lg hover:bg-slate-50">Competition Mode</button>
              <button onClick={() => handleNav('word-library')} className="block w-full text-left px-3 py-2 font-medium text-slate-700 rounded-lg hover:bg-slate-50">Word Library</button>
              <button onClick={() => handleNav('mistakes')} className="block w-full text-left px-3 py-2 font-medium text-slate-700 rounded-lg hover:bg-slate-50">Review Mistakes</button>
              <button onClick={() => handleNav('progress')} className="block w-full text-left px-3 py-2 font-medium text-slate-700 rounded-lg hover:bg-slate-50">Progress & Stats</button>
              <button onClick={() => handleNav('student-profile')} className="block w-full text-left px-3 py-2 font-medium text-slate-700 rounded-lg hover:bg-slate-50">My Profile</button>
            </>
          )}
          {(isTeacher || isAdmin) && (
            <>
              <button onClick={() => handleNav('teacher-dashboard')} className="block w-full text-left px-3 py-2 font-medium text-slate-700 rounded-lg hover:bg-slate-50">Teacher Dashboard</button>
              <button onClick={() => handleNav('teacher-classes')} className="block w-full text-left px-3 py-2 font-medium text-slate-700 rounded-lg hover:bg-slate-50">Classrooms</button>
              <button onClick={() => handleNav('teacher-students')} className="block w-full text-left px-3 py-2 font-medium text-slate-700 rounded-lg hover:bg-slate-50">Students</button>
              <button onClick={() => handleNav('teacher-assign')} className="block w-full text-left px-3 py-2 font-medium text-slate-700 rounded-lg hover:bg-slate-50">Assign Practice</button>
              <button onClick={() => handleNav('teacher-competition')} className="block w-full text-left px-3 py-2 font-medium text-slate-700 rounded-lg hover:bg-slate-50">Competitions</button>
              <button onClick={() => handleNav('teacher-reports')} className="block w-full text-left px-3 py-2 font-medium text-slate-700 rounded-lg hover:bg-slate-50">Mistake Analytics</button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
