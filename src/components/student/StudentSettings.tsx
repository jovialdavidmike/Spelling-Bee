import React, { useState, useEffect } from 'react';
import { AppView } from '../../types';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { Volume2, Sliders, Bell, Globe, Save, Check, RotateCcw, AlertTriangle, User, Edit3 } from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
  onShowToast: (message: string) => void;
}

export const StudentSettings: React.FC<Props> = ({ onNavigate, onShowToast }) => {
  const { user, updateProfile } = useAuth();
  const student = dataService.getStudent();
  const [fullName, setFullName] = useState(user?.displayName || student.name);
  const [nameSaved, setNameSaved] = useState(false);

  useEffect(() => {
    if (user?.displayName) {
      setFullName(user.displayName);
    }
  }, [user?.displayName]);

  const [speechRate, setSpeechRate] = useState<'normal' | 'slower'>('normal');
  const [autoPronounce, setAutoPronounce] = useState(true);
  const [showDefinitionHints, setShowDefinitionHints] = useState(true);
  const [englishDialect, setEnglishDialect] = useState('British / WAEC Standard');
  const [timerAlerts, setTimerAlerts] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    await updateProfile({
      displayName: fullName.trim(),
      name: fullName.trim()
    });
    setNameSaved(true);
    onShowToast('Your name has been updated successfully!');
    setTimeout(() => setNameSaved(false), 2500);
  };

  const handleSave = () => {
    onShowToast('Practice settings successfully saved.');
  };

  const handleResetData = () => {
    dataService.resetAllData();
    setShowResetConfirm(false);
    onShowToast('Prototype data reset to baseline defaults.');
    onNavigate('student-dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Account & Practice Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your candidate identity, pronunciation speed, timer indicators, and practice ergonomics.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100">
        
        {/* Speller Identity & Name */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <User className="w-4 h-4 text-amber-600" />
              <span>Speller Identity & Name</span>
            </div>
            {nameSaved && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3" /> Saved
              </span>
            )}
          </div>

          <form onSubmit={handleUpdateName} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-800">Your Full Name</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  disabled={!fullName.trim() || fullName.trim() === (user?.displayName || student.name)}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-900 font-semibold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
                >
                  Save Name
                </button>
              </div>
              <p className="text-slate-500 text-[11px] mt-1">
                This name appears across your student dashboard, teacher class roster, certificates, and weekly top spellers leaderboards.
              </p>
            </div>
          </form>
        </div>
        
        {/* Pronunciation & Voice Settings */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Volume2 className="w-4 h-4 text-amber-600" />
            <span>Audio & Voice Enunciation</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-semibold text-slate-800">Default Speech Pace</label>
                <p className="text-slate-500">Pace of audio playback when reading target spelling words.</p>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSpeechRate('normal')}
                  className={`px-3 py-1 rounded font-medium cursor-pointer ${speechRate === 'normal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
                >
                  Normal (0.85x)
                </button>
                <button
                  type="button"
                  onClick={() => setSpeechRate('slower')}
                  className={`px-3 py-1 rounded font-medium cursor-pointer ${speechRate === 'slower' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
                >
                  Deliberate (0.65x)
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <label className="font-semibold text-slate-800">Auto-play Pronunciation on Question</label>
                <p className="text-slate-500">Automatically speak target word when each question loads.</p>
              </div>
              <input
                type="checkbox"
                checked={autoPronounce}
                onChange={(e) => setAutoPronounce(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Practice Session Rules */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Practice Drills</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-semibold text-slate-800">Show Definition Hint Toggle</label>
                <p className="text-slate-500">Allow requesting definition hints during standard practice sessions.</p>
              </div>
              <input
                type="checkbox"
                checked={showDefinitionHints}
                onChange={(e) => setShowDefinitionHints(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <label className="font-semibold text-slate-800">Competition Countdown Warning Pulse</label>
                <p className="text-slate-500">Visually pulse timer clock red when under 10 seconds remaining.</p>
              </div>
              <input
                type="checkbox"
                checked={timerAlerts}
                onChange={(e) => setTimerAlerts(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Dialect & Standards */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>Spelling Standards & Curricula</span>
          </div>

          <div className="space-y-2 text-xs">
            <label className="font-semibold text-slate-800">Standard English Reference</label>
            <select
              value={englishDialect}
              onChange={(e) => setEnglishDialect(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="British / WAEC Standard">British & WAEC Examination Standard (e.g. colour, programme)</option>
              <option value="International Standard">International Spelling Bee Consensus</option>
            </select>
          </div>
        </div>

        {/* Developer / Demo Reset Action */}
        <div className="p-6 space-y-3 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-slate-800">Reset Prototype Progress Data</div>
              <div className="text-slate-500">Clears locally stored practice attempts, mistakes, and resets to baseline student state.</div>
            </div>
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-3 py-1.5 font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Reset Data
            </button>
          </div>
        </div>

      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => onNavigate('student-dashboard')}
          className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 text-xs font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Reset Prototype Data?</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This will reset your practice history, mistake queues, and student metrics back to original demonstration data. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
