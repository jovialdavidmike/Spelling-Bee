import React from 'react';
import { AppView, UserRole } from '../../types';
import {
  LayoutDashboard,
  Zap,
  Trophy,
  BookOpen,
  AlertCircle,
  TrendingUp,
  Award,
  Users,
  User,
  Settings,
  FolderTree,
  FileCheck,
  BarChart3,
  Flame,
  Volume2,
  School
} from 'lucide-react';

interface Props {
  currentView: AppView;
  currentRole: UserRole;
  onNavigate: (view: AppView) => void;
  collapsed?: boolean;
}

export const Sidebar: React.FC<Props> = ({
  currentView,
  currentRole,
  onNavigate,
  collapsed = false
}) => {
  const isStudent = currentRole === 'student';
  const isTeacher = currentRole === 'teacher';

  if (!isStudent && !isTeacher) {
    return null; // Public views do not need sidebar
  }

  const studentNavItems = [
    { id: 'student-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'practice', label: 'Practice Mode', icon: Zap },
    { id: 'competition', label: 'Competition Mode', icon: Trophy },
    { id: 'word-library', label: 'Word Library', icon: BookOpen },
    { id: 'mistakes', label: 'Review Mistakes', icon: AlertCircle },
    { id: 'progress', label: 'Progress & Stats', icon: TrendingUp },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'leaderboard', label: 'Leaderboard', icon: Users },
    { id: 'student-profile', label: 'Student Profile', icon: User },
    { id: 'student-settings', label: 'Settings', icon: Settings },
  ];

  const teacherNavItems = [
    { id: 'teacher-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'teacher-classes', label: 'Classrooms', icon: School },
    { id: 'teacher-students', label: 'Students', icon: Users },
    { id: 'teacher-assign', label: 'Assign Practice', icon: FileCheck },
    { id: 'teacher-word-sets', label: 'Word Sets', icon: FolderTree },
    { id: 'teacher-competition', label: 'Competition Room', icon: Trophy },
    { id: 'teacher-reports', label: 'Mistake Analytics', icon: BarChart3 },
    { id: 'teacher-settings', label: 'School Settings', icon: Settings },
  ];

  const items = isStudent ? studentNavItems : teacherNavItems;

  return (
    <aside className={`hidden lg:flex flex-col border-r border-slate-200/80 bg-white min-h-[calc(100vh-4rem)] ${collapsed ? 'w-16' : 'w-64'} transition-all duration-200 shrink-0`}>
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div className="space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {isStudent ? 'Student Training' : 'Teacher Portal'}
          </div>

          <nav className="space-y-0.5" aria-label="Sidebar Navigation">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as AppView)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    isActive
                      ? isStudent
                        ? 'bg-amber-50 text-amber-900 font-semibold'
                        : 'bg-indigo-50 text-indigo-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? isStudent ? 'text-amber-600' : 'text-indigo-600'
                      : 'text-slate-400'
                  }`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Motivational / Context Card at sidebar bottom */}
        {!collapsed && isStudent && (
          <div className="mt-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 mb-1">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>7-Day Streak Active</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Spell 10 words daily to keep your competition sharpness growing.
            </p>
          </div>
        )}

        {!collapsed && isTeacher && (
          <div className="mt-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-xs font-semibold text-slate-900 mb-1">
              Next Contest Prep
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              38 students enrolled in JSS3 & SS1 spelling simulation rounds.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
