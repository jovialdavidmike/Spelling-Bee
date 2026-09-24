import React, { useState } from 'react';
import { AppView, ClassRoom } from '../../types';
import { dataService } from '../../services/dataService';
import {
  Users,
  Plus,
  KeyRound,
  RotateCcw,
  Archive,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  School,
  Copy,
  Clock,
  Check
} from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
  onSelectClassForStudents?: (classId: string) => void;
  onSelectClassForAssign?: (classId: string) => void;
  onShowToast: (msg: string) => void;
}

export const TeacherClasses: React.FC<Props> = ({
  onNavigate,
  onSelectClassForStudents,
  onSelectClassForAssign,
  onShowToast
}) => {
  const [showArchived, setShowArchived] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New Class Form State
  const [className, setClassName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [academicSession, setAcademicSession] = useState('2026/2027');

  const classes = dataService.getClasses(showArchived);
  const schoolConfig = dataService.getSchoolConfig();

  const handleCopyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    onShowToast(`Class Join Code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleRegenerateCode = (classId: string, name: string) => {
    const newCode = dataService.regenerateJoinCode(classId);
    onShowToast(`New Join Code generated for ${name}: ${newCode}`);
  };

  const handleToggleArchive = (classId: string, name: string, isArchived: boolean) => {
    dataService.archiveClass(classId);
    onShowToast(`${name} has been ${isArchived ? 'restored to active' : 'archived'}.`);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
      onShowToast('Please provide a class name.');
      return;
    }

    const created = dataService.createClass(
      className.trim(),
      classDescription.trim(),
      classCode.trim(),
      academicSession.trim()
    );

    onShowToast(`Class "${created.name}" created with Join Code: ${created.joinCode}`);
    setIsCreateOpen(false);
    setClassName('');
    setClassCode('');
    setClassDescription('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Classroom & Cohort Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize secondary school candidates into classes, generate join codes, and control group assignments.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
              showArchived
                ? 'bg-slate-200 border-slate-300 text-slate-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Class</span>
          </button>
        </div>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className={`bg-white rounded-2xl border p-6 space-y-5 transition-shadow shadow-xs hover:shadow-md ${
              cls.isArchived ? 'border-slate-200 opacity-70 bg-slate-50/50' : 'border-slate-200/90'
            }`}
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{cls.name}</h3>
                  <span className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-slate-100 text-slate-600">
                    {cls.code}
                  </span>
                  {cls.isArchived && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                      Archived
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">{cls.description}</p>
              </div>

              {/* Join Code Box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-center shrink-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
                  Student Join Code
                </div>
                <div className="font-mono text-base font-bold text-emerald-950 tracking-wider my-0.5">
                  {cls.joinCode}
                </div>
                <div className="flex items-center justify-center gap-1 pt-1 border-t border-emerald-200/60">
                  <button
                    onClick={() => handleCopyJoinCode(cls.joinCode)}
                    title="Copy code"
                    className="p-1 rounded text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    {copiedCode === cls.joinCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleRegenerateCode(cls.id, cls.name)}
                    title="Regenerate code"
                    className="p-1 rounded text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-100 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block">Enrolled Spellers</span>
                <span className="font-mono font-bold text-slate-800 text-base">{cls.studentCount}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Avg Accuracy</span>
                <span className="font-mono font-bold text-emerald-600 text-base">{cls.averageAccuracy}%</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Completion</span>
                <span className="font-mono font-bold text-indigo-600 text-base">{cls.completionRate}%</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onSelectClassForStudents) onSelectClassForStudents(cls.name);
                    onNavigate('teacher-students');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>View Students</span>
                </button>

                <button
                  onClick={() => {
                    if (onSelectClassForAssign) onSelectClassForAssign(cls.id);
                    onNavigate('teacher-assign');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Assign Work</span>
                </button>
              </div>

              <button
                onClick={() => handleToggleArchive(cls.id, cls.name, cls.isArchived)}
                className="text-[11px] text-slate-400 hover:text-slate-700 p-1.5 rounded transition-colors cursor-pointer"
                title={cls.isArchived ? 'Restore class' : 'Archive class'}
              >
                <Archive className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE CLASS MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Create New Class</h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Class Name *</label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. JSS 2 Emerald"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Code / Tag</label>
                  <input
                    type="text"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value)}
                    placeholder="e.g. JSS2-EME"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Session</label>
                  <input
                    type="text"
                    value={academicSession}
                    onChange={(e) => setAcademicSession(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={classDescription}
                  onChange={(e) => setClassDescription(e.target.value)}
                  placeholder="Junior Secondary competition training group..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500">
                A unique, secure 6-character <strong>Class Join Code</strong> will be automatically generated upon creation.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
