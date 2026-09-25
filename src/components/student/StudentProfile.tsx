import React, { useState } from 'react';
import { AppView } from '../../types';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  School,
  BookOpen,
  Award,
  Flame,
  Target,
  Edit3,
  Check,
  Copy,
  KeyRound,
  FileCheck,
  Mail,
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
}

export const StudentProfile: React.FC<Props> = ({ onNavigate }) => {
  const { user, updateProfile } = useAuth();
  const student = dataService.getStudent();
  const achievements = dataService.getAchievements();

  const [copiedCode, setCopiedCode] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || student.name);
  const [selectedAvatar, setSelectedAvatar] = useState(user?.photoURL || '🎓');
  const [savedNotice, setSavedNotice] = useState(false);

  const avatarOptions = ['🎓', '⭐', '🐝', '🏆', '📚', '🚀', '🎯', '🦅'];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      displayName: displayName.trim(),
      photoURL: selectedAvatar
    });
    setIsEditingPreferences(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const studentCodeToDisplay = user?.studentCode || 'CCA-SS1-001';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 text-xs">
      
      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Profile information updated successfully!</span>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          
          {/* Avatar Circle */}
          <div className="w-20 h-20 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-3xl shrink-0 border-2 border-amber-200 shadow-sm">
            {user?.photoURL || selectedAvatar}
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center justify-center sm:justify-start gap-2">
              <span>Candidate Profile</span>
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Account</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{user?.displayName || student.name}</h1>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-1 gap-x-3 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">{user?.className || student.className}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{user?.schoolName || student.school}</span>
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

              {user?.email && (
                <div className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-lg text-slate-700 text-[11px]">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.email}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsEditingPreferences(!isEditingPreferences)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs self-center sm:self-start"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingPreferences ? 'Cancel' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Edit Form */}
        {isEditingPreferences && (
          <form onSubmit={handleSavePreferences} className="mt-6 pt-6 border-t border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-900">Edit Display Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Avatar Icon</label>
                <div className="flex gap-2">
                  {avatarOptions.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedAvatar(emoji)}
                      className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                        selectedAvatar === emoji
                          ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-400'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Progress & Milestone Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Target className="w-4 h-4 text-emerald-600" />
            <span>Accuracy</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-2">{student.accuracy}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Practice & competition</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Mastered</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-2">{student.wordsMastered}</div>
          <div className="text-[11px] text-slate-400 mt-1">Words in repertoire</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Day Streak</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-2">{student.currentStreak} Days</div>
          <div className="text-[11px] text-slate-400 mt-1">Best: {student.longestStreak} days</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Award className="w-4 h-4 text-purple-600" />
            <span>Badges</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-2">
            {achievements.filter(a => a.unlocked).length} / {achievements.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Preparation honors</div>
        </div>
      </div>

      {/* Account Security Information */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-slate-600" />
          <span>Account & Security</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[11px]">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="text-slate-400">Canonical Identity (UID)</div>
            <div className="font-mono text-slate-800 break-all text-[10px]">{user?.uid || 'std_anonymous'}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="text-slate-400">Account Status</div>
            <div className="font-semibold text-emerald-700 capitalize">{user?.accountStatus || 'active'}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="text-slate-400">Member Since</div>
            <div className="font-semibold text-slate-800">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'September 2026'}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
