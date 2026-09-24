import React from 'react';
import { AppView, TeacherAssignment } from '../../types';
import { dataService } from '../../services/dataService';
import { TEACHER_ACTIVITY } from '../../data/mockData';
import {
  Users,
  Target,
  FileCheck,
  FolderTree,
  AlertTriangle,
  Trophy,
  ArrowRight,
  TrendingUp,
  Plus,
  Clock,
  School,
  Copy,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
  onSelectStudent?: (id: string) => void;
  onSelectClass?: (className: string) => void;
}

export const TeacherDashboard: React.FC<Props> = ({
  onNavigate,
  onSelectStudent,
  onSelectClass
}) => {
  const students = dataService.getTeacherStudents();
  const assignments = dataService.getAssignments();
  const classes = dataService.getClasses();
  const mostMissedWords = dataService.getMostMissedWords();

  const attentionStudents = students.filter(
    s => s.status === 'Attention Needed' || s.status === 'Needs Practice' || s.accuracy < 75
  );

  const activeAssignments = assignments.filter(a => a.status === 'active');
  const avgAccuracy = Math.round(
    students.reduce((acc, s) => acc + s.accuracy, 0) / Math.max(1, students.length)
  );

  const handleDuplicate = (asgId: string) => {
    const copy = dataService.duplicateAssignment(asgId);
    if (copy) {
      onNavigate('teacher-assign');
    }
  };

  return (
    <div className="space-y-8 pb-12 text-xs">
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <School className="w-3.5 h-3.5" />
            <span>Federal Science & Technical College · English Dept</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Teacher & Coach Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Monitoring secondary school cohorts, assigning targeted drills, and preparing candidates for regional bees.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onNavigate('teacher-classes')}
            className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
          >
            Manage Classes
          </button>

          <button
            onClick={() => onNavigate('teacher-assign')}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Classes Active</div>
          <div className="text-3xl font-bold font-mono text-slate-900 mt-1">
            {classes.length}
          </div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">
            {students.length} enrolled students
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Cohort Accuracy</div>
          <div className="text-3xl font-bold font-mono text-slate-900 mt-1">
            {avgAccuracy}%
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Across {students.length} spellers
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Active Assignments</div>
          <div className="text-3xl font-bold font-mono text-indigo-700 mt-1">
            {activeAssignments.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {assignments.length} total sets
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Attention Needed</div>
          <div className="text-3xl font-bold font-mono text-amber-600 mt-1">
            {attentionStudents.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Struggling or incomplete
          </div>
        </div>

      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Classroom Navigation</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <button
            onClick={() => onNavigate('teacher-classes')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-colors cursor-pointer group"
          >
            <School className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-slate-900">Classes & Codes</div>
            <div className="text-xs text-slate-500 mt-0.5">{classes.length} active cohorts</div>
          </button>

          <button
            onClick={() => onNavigate('teacher-students')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-colors cursor-pointer group"
          >
            <Users className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-slate-900">Enrolled Students</div>
            <div className="text-xs text-slate-500 mt-0.5">Manage codes & PINs</div>
          </button>

          <button
            onClick={() => onNavigate('teacher-reports')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-colors cursor-pointer group"
          >
            <TrendingUp className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-slate-900">Mistake Analytics</div>
            <div className="text-xs text-slate-500 mt-0.5">Diagnose weak words</div>
          </button>

          <button
            onClick={() => onNavigate('teacher-competition')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-colors cursor-pointer group"
          >
            <Trophy className="w-5 h-5 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-slate-900">Competition Room</div>
            <div className="text-xs text-slate-500 mt-0.5">Host live in-class bee</div>
          </button>

        </div>
      </div>

      {/* CLASS OVERVIEW SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Class Performance Overview</h2>
          </div>
          <button
            onClick={() => onNavigate('teacher-classes')}
            className="font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View all classes →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {classes.slice(0, 3).map(cls => (
            <div key={cls.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{cls.name}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">{cls.code}</span>
                </div>
                <span className="px-2 py-0.5 rounded font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  {cls.joinCode}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block">Spellers</span>
                  <span className="font-mono font-bold text-slate-800">{cls.studentCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Accuracy</span>
                  <span className="font-mono font-bold text-emerald-700">{cls.averageAccuracy}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Completion</span>
                  <span className="font-mono font-bold text-indigo-700">{cls.completionRate}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    if (onSelectClass) onSelectClass(cls.name);
                    onNavigate('teacher-students');
                  }}
                  className="font-semibold text-slate-700 hover:text-slate-900 text-[11px]"
                >
                  View Students →
                </button>
                <button
                  onClick={() => onNavigate('teacher-assign')}
                  className="font-semibold text-indigo-600 hover:text-indigo-800 text-[11px]"
                >
                  Assign Work →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Split: Students Needing Attention & High-Miss Words */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Students Needing Attention */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">Candidates Requiring Remedial Practice</h2>
            </div>
            <button
              onClick={() => onNavigate('teacher-students')}
              className="font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View all ({students.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {attentionStudents.slice(0, 4).map((student) => (
              <div
                key={student.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 text-sm">{student.name}</div>
                  <div className="text-slate-500">{student.className} · Code: <span className="font-mono">{student.studentCode}</span></div>
                  <div className="text-slate-600 italic text-[11px] pt-0.5">"{student.notes}"</div>
                </div>

                <div className="text-right space-y-1 shrink-0">
                  <div className={`font-mono font-bold text-sm ${student.accuracy >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {student.accuracy}%
                  </div>
                  <button
                    onClick={() => {
                      if (onSelectStudent) onSelectStudent(student.id);
                      onNavigate('teacher-student-detail');
                    }}
                    className="px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-md transition-colors"
                  >
                    Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Most Missed Words (Targeted Teaching Loop) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-rose-600" />
              <h2 className="text-base font-bold text-slate-900">Most Missed Words Across Classes</h2>
            </div>
            <button
              onClick={() => onNavigate('teacher-reports')}
              className="font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Full Report →
            </button>
          </div>

          <div className="space-y-2.5">
            {mostMissedWords.slice(0, 4).map((item) => (
              <div
                key={item.word.id}
                className="p-3 rounded-xl border border-slate-200 bg-rose-50/40 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm">{item.word.word}</div>
                  <div className="text-slate-500 text-[11px]">
                    Missed by {item.missedCount} students ({item.studentNames.slice(0, 2).join(', ')}...)
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('teacher-assign')}
                  className="px-3 py-1 font-semibold text-slate-900 bg-amber-400 hover:bg-amber-500 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Assign Drill
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ACTIVE ASSIGNMENTS LIST */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Current Homework & Qualifier Drills</h2>
          </div>
          <button
            onClick={() => onNavigate('teacher-assign')}
            className="font-semibold text-indigo-600 hover:text-indigo-800"
          >
            + Create New Assignment
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {assignments.map(asg => (
            <div key={asg.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{asg.title}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 uppercase">
                    {asg.mode || 'practice'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    asg.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {asg.status}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Target: {asg.targetClass} · {asg.wordCount} words · Due {asg.dueDate}
                </p>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div className="hidden sm:block">
                  <span className="font-mono font-bold text-slate-900">{asg.completedCount} / {asg.assignedCount}</span>
                  <span className="text-[10px] text-slate-400 block">Submitted</span>
                </div>

                <div className="hidden sm:block">
                  <span className="font-mono font-bold text-emerald-600">{asg.averageAccuracy}%</span>
                  <span className="text-[10px] text-slate-400 block">Avg Accuracy</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDuplicate(asg.id)}
                    title="Duplicate Assignment"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
