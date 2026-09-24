import React, { useState } from 'react';
import { AppView } from '../../types';
import { dataService } from '../../services/dataService';
import { authService } from '../../services/authService';
import {
  User,
  School,
  BookOpen,
  Award,
  Flame,
  Target,
  Settings,
  Zap,
  Lock,
  Edit3,
  Check,
  Copy,
  KeyRound,
  FileCheck
} from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
}

export const StudentProfile: React.FC<Props> = ({ onNavigate }) => {
  const currentUser = authService.getCurrentUser();
  const student = dataService.getStudent();
  const achievements = dataService.getAchievements();
  const enrolledStudent = currentUser?.id ? dataService.getEnrolledStudentById(currentUser.id) : undefined;
  const submissions = dataService.getAssignments().map(a => {
    const sub = dataService.getAssignmentSubmissions(a.id).find(s => s.studentId === (currentUser?.id || student.id));
    return sub;
  }).filter(Boolean);

  const [copiedCode, setCopiedCode] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.name || student.name);
  const [selectedAvatar, setSelectedAvatar] = useState('🎓');

  const avatarOptions = ['🎓', '⭐', '🐝', '🏆', '📚', '🚀', '🎯', '🦅'];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    authService.updateStudentPreferences({
      name: displayName.trim(),
      avatarUrl: selectedAvatar
    });
    setIsEditingPreferences(false);
  };

  const studentCodeToDisplay = currentUser?.studentCode || 'CCA-SS1-001';
  const weakWordsCount = enrolledStudent?.weakWords?.length || student.recentMistakes.length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 text-xs">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          
          {/* Avatar Circle */}
          <div className="w-20 h-20 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-3xl shrink-0 border-2 border-amber-200 shadow-sm">
            {currentUser?.avatarUrl || selectedAvatar}
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Secondary School Candidate Profile
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{currentUser?.name || student.name}</h1>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-1 gap-x-3 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">{currentUser?.className || student.className}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{currentUser?.schoolName || student.school}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-indigo-700 font-medium">Level {student.level} Speller</span>
            </div>

            {/* School Credential Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <div className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-lg font-mono text-slate-800">
                <span className="text-slate-400 font-sans text-[11px]">Student Code:</span>
                <strong>{studentCodeToDisplay}</strong>
                <button
                  onClick={() => handleCopyCode(studentCodeToDisplay)}
                  className="p-1 hover:text-slate-900 cursor-pointer"
                  title="Copy code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {currentUser?.pin && (
                <div className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-lg font-mono text-slate-600 text-[11px]">
                  <span>PIN:</span>
                  <strong>{currentUser.pin}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0">
            <button
              onClick={() => setIsEditingPreferences(true)}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => onNavigate('practice')}
              className="px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Practice Now</span>
            </button>
          </div>

        </div>
      </div>

      {/* Lifetime Performance Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Running Accuracy</div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-indigo-700 mt-1">
            {enrolledStudent?.accuracy ?? student.accuracy}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Best: {student.bestAccuracy}%</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Words Mastered</div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 mt-1">
            {enrolledStudent?.wordsMastered ?? student.wordsMastered}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">High retention words</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Assignments Done</div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 mt-1">
            {submissions.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Class drills completed</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Needs Improvement</div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-rose-600 mt-1">
            {weakWordsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Mistake review queue</div>
        </div>

      </div>

      {/* Security & Access Protection Notice */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex items-start gap-3 text-slate-600">
        <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-[11px]">
          <strong className="text-slate-800">Protected Academic Record</strong>
          <p>
            Your class assignment, school affiliation, student credential code, and official assessment scores are verified by your teacher to ensure contest integrity. You may customize your avatar and personal study settings.
          </p>
        </div>
      </div>

      {/* Badges Earned Preview */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Earned Accolades & Badges</h2>
          <button
            onClick={() => onNavigate('achievements')}
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 cursor-pointer"
          >
            View all ({achievements.filter(a => a.unlocked).length}) →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {achievements.filter(a => a.unlocked).slice(0, 3).map((ach) => (
            <div key={ach.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span>{ach.title}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">{ach.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: EDIT PREFERENCES */}
      {isEditingPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Customize Profile</h2>
              <button onClick={() => setIsEditingPreferences(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-3.5">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Display Name / Nickname</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Choose Speller Avatar</label>
                <div className="grid grid-cols-4 gap-2">
                  {avatarOptions.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedAvatar(emoji)}
                      className={`text-2xl p-2 rounded-xl border transition-all cursor-pointer ${
                        selectedAvatar === emoji ? 'border-amber-500 bg-amber-50 shadow-xs' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingPreferences(false)}
                  className="px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 rounded-lg shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
