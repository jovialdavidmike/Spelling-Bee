import React, { useState } from 'react';
import { UserRole, AppView } from '../../types';
import { authService, DEMO_TEACHER } from '../../services/authService';
import { dataService } from '../../services/dataService';
import {
  X,
  GraduationCap,
  School,
  KeyRound,
  UserCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Users
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRoleChanged: (role: UserRole) => void;
  onNavigate: (view: AppView) => void;
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onRoleChanged,
  onNavigate
}) => {
  const [tab, setTab] = useState<'student' | 'teacher' | 'join'>('student');
  const [studentCode, setStudentCode] = useState('CCA-SS1-001');
  const [pin, setPin] = useState('4827');
  const [teacherEmail, setTeacherEmail] = useState(DEMO_TEACHER.email || 'david.mike@fstc-yaba.edu.ng');
  const [teacherPassword, setTeacherPassword] = useState('••••••••');
  
  // Join with code form state
  const [joinName, setJoinName] = useState('');
  const [joinClassCode, setJoinClassCode] = useState('7K4P9X');
  const [joinPin, setJoinPin] = useState('1234');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const enrolled = dataService.getEnrolledStudents();

  const handleStudentLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const res = authService.loginStudentWithCode(studentCode, pin);
    if (!res.success) {
      setError(res.error || 'Failed to authenticate student.');
      return;
    }
    onRoleChanged('student');
    onNavigate('student-dashboard');
    onClose();
  };

  const handleQuickStudentSelect = (code: string, studentPin: string) => {
    setStudentCode(code);
    setPin(studentPin);
    const res = authService.loginStudentWithCode(code, studentPin);
    if (res.success) {
      onRoleChanged('student');
      onNavigate('student-dashboard');
      onClose();
    }
  };

  const handleTeacherLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    authService.loginTeacher(teacherEmail);
    onRoleChanged('teacher');
    onNavigate('teacher-dashboard');
    onClose();
  };

  const handleJoinWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!joinName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!joinClassCode.trim()) {
      setError('Please enter your Class Join Code.');
      return;
    }

    const classes = dataService.getClasses();
    const targetClass = classes.find(c => c.joinCode.toUpperCase() === joinClassCode.trim().toUpperCase() && !c.isArchived);

    if (!targetClass) {
      setError(`Class Join Code "${joinClassCode}" not found or expired. Please check with your teacher.`);
      return;
    }

    // Register student
    const newStudent = dataService.addStudent({
      name: joinName.trim(),
      classId: targetClass.id,
      pin: joinPin.trim() || '1234'
    });

    // Auto login
    authService.loginStudentWithCode(newStudent.studentCode, newStudent.pin);
    onRoleChanged('student');
    setSuccess(`Welcome, ${newStudent.name}! Enrolled in ${targetClass.name}.`);
    setTimeout(() => {
      onNavigate('student-dashboard');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Sign In to SpellReady</h2>
            <p className="text-xs text-slate-500 mt-0.5">Select your role to access practice or classroom controls</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => { setTab('student'); setError(null); }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              tab === 'student'
                ? 'border-amber-500 text-amber-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-600" />
            <span>Student Portal</span>
          </button>

          <button
            onClick={() => { setTab('teacher'); setError(null); }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              tab === 'teacher'
                ? 'border-indigo-600 text-indigo-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <School className="w-4 h-4 text-indigo-600" />
            <span>Teacher Portal</span>
          </button>

          <button
            onClick={() => { setTab('join'); setError(null); }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              tab === 'join'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4 text-emerald-600" />
            <span>Join Class</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* TAB 1: STUDENT LOGIN */}
          {tab === 'student' && (
            <div className="space-y-4">
              <form onSubmit={handleStudentLogin} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Student Code (School-Issued)</label>
                  <input
                    type="text"
                    required
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    placeholder="e.g. CCA-SS1-001"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-400">No email required for student access.</span>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Security PIN (4 Digits)</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="4827"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Sign In as Student</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick 1-Click Demo Selectors */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Quick Demo Student Accounts
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {enrolled.slice(0, 4).map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleQuickStudentSelect(st.studentCode, st.pin)}
                      className="p-2.5 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 text-left transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-slate-900">{st.name}</div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                        <span>{st.className}</span>
                        <span className="font-mono text-slate-400">{st.studentCode}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEACHER LOGIN */}
          {tab === 'teacher' && (
            <div className="space-y-4">
              <form onSubmit={handleTeacherLogin} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Teacher Email / ID</label>
                  <input
                    type="text"
                    required
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    placeholder="david.mike@fstc-yaba.edu.ng"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Password</label>
                  <input
                    type="password"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Access Teacher Portal (Demo)</span>
                </button>
              </form>

              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 space-y-1 text-[11px]">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Demo Coach Profile Loaded</span>
                </div>
                <p className="text-indigo-700">
                  Logged in as <strong>David Mike</strong>, Head of English & Spelling Coach at Federal Science & Technical College, Yaba.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: JOIN CLASS WITH CODE */}
          {tab === 'join' && (
            <div className="space-y-4">
              <form onSubmit={handleJoinWithCode} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                    placeholder="e.g. Mary Chukwu"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Class Join Code (From Teacher) *</label>
                  <input
                    type="text"
                    required
                    value={joinClassCode}
                    onChange={(e) => setJoinClassCode(e.target.value)}
                    placeholder="e.g. 7K4P9X"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="text-[11px] text-slate-400">Try demo join code: <strong>7K4P9X</strong> (SS 1 Gold) or <strong>9Q2L5V</strong> (JSS 3 Blue)</div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Create 4-Digit Login PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={joinPin}
                    onChange={(e) => setJoinPin(e.target.value)}
                    placeholder="1234"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Join Class & Enter Dashboard</span>
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
