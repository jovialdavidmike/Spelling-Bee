import React from 'react';
import { AppView, UserRole } from '../../types';
import {
  LayoutDashboard,
  Zap,
  Trophy,
  BookOpen,
  TrendingUp,
  Users,
  FileCheck,
  FolderTree,
  BarChart3
} from 'lucide-react';

interface Props {
  currentView: AppView;
  currentRole: UserRole;
  onNavigate: (view: AppView) => void;
}

export const MobileBottomNav: React.FC<Props> = ({
  currentView,
  currentRole,
  onNavigate
}) => {
  if (currentRole === 'guest') return null;

  const isStudent = currentRole === 'student';

  const studentItems = [
    { id: 'student-dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'practice', label: 'Practice', icon: Zap },
    { id: 'competition', label: 'Contest', icon: Trophy },
    { id: 'word-library', label: 'Words', icon: BookOpen },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ];

  const teacherItems = [
    { id: 'teacher-dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'teacher-students', label: 'Students', icon: Users },
    { id: 'teacher-assign', label: 'Assign', icon: FileCheck },
    { id: 'teacher-word-sets', label: 'Word Sets', icon: FolderTree },
    { id: 'teacher-reports', label: 'Reports', icon: BarChart3 },
  ];

  const items = isStudent ? studentItems : teacherItems;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around h-14"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as AppView)}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors ${
              isActive
                ? isStudent
                  ? 'text-amber-600 font-semibold'
                  : 'text-indigo-600 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className={`w-4 h-4 mb-0.5 ${isActive ? (isStudent ? 'text-amber-600' : 'text-indigo-600') : 'text-slate-400'}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
