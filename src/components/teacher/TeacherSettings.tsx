import React, { useState } from 'react';
import { AppView } from '../../types';
import { dataService } from '../../services/dataService';
import { Save, School, Shield, Sliders, Volume2, Trophy, Check } from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
  onShowToast: (msg: string) => void;
}

export const TeacherSettings: React.FC<Props> = ({ onNavigate, onShowToast }) => {
  const currentConfig = dataService.getSchoolConfig();

  const [schoolName, setSchoolName] = useState(currentConfig.schoolName);
  const [academicSession, setAcademicSession] = useState(currentConfig.academicSession);
  const [leaderboardEnabled, setLeaderboardEnabled] = useState(currentConfig.leaderboardEnabled);
  const [defaultTimeLimitMinutes, setDefaultTimeLimitMinutes] = useState(currentConfig.defaultTimeLimitMinutes);
  const [defaultAttemptsAllowed, setDefaultAttemptsAllowed] = useState(currentConfig.defaultAttemptsAllowed);
  const [defaultMode, setDefaultMode] = useState(currentConfig.defaultMode);
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(currentConfig.voiceFeedbackEnabled);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    dataService.updateSchoolConfig({
      schoolName: schoolName.trim(),
      academicSession: academicSession.trim(),
      leaderboardEnabled,
      defaultTimeLimitMinutes,
      defaultAttemptsAllowed,
      defaultMode,
      voiceFeedbackEnabled
    });

    setSavedSuccess(true);
    onShowToast('Teacher & School configuration saved and active across cohorts.');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 text-xs">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Teacher & School Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure institutional defaults, academic session rules, and leaderboard student privacy.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100">
        
        {/* School Profile */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <School className="w-4 h-4 text-indigo-600" />
            <span>School Institutional Information</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-800">School / Institution Name</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-800">Academic Session / Year</label>
              <input
                type="text"
                value={academicSession}
                onChange={(e) => setAcademicSession(e.target.value)}
                placeholder="2026/2027"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Practice Defaults */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Sliders className="w-4 h-4 text-amber-600" />
            <span>Assignment & Practice Defaults</span>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-800">Default Time Limit (Mins)</label>
                <select
                  value={defaultTimeLimitMinutes}
                  onChange={(e) => setDefaultTimeLimitMinutes(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value={10}>10 Minutes</option>
                  <option value={15}>15 Minutes</option>
                  <option value={20}>20 Minutes</option>
                  <option value={30}>30 Minutes</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800">Default Attempts</label>
                <select
                  value={defaultAttemptsAllowed}
                  onChange={(e) => setDefaultAttemptsAllowed(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value={1}>1 Attempt</option>
                  <option value={2}>2 Attempts</option>
                  <option value={3}>3 Attempts</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <label className="font-semibold text-slate-800">Spoken Feedback After Answer</label>
                <p className="text-slate-500">Provide spoken confirmation (e.g. 'Correct. Well done.') during practice mode.</p>
              </div>
              <input
                type="checkbox"
                checked={voiceFeedbackEnabled}
                onChange={(e) => setVoiceFeedbackEnabled(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Privacy & Leaderboard Control */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Trophy className="w-4 h-4 text-emerald-600" />
            <span>Class Leaderboard & Privacy</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-semibold text-slate-800">Enable Class Leaderboard</label>
                <p className="text-slate-500">Allow students to see comparative accuracy ranking. When turned off, student rankings are hidden to reduce pressure.</p>
              </div>
              <input
                type="checkbox"
                checked={leaderboardEnabled}
                onChange={(e) => setLeaderboardEnabled(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => onNavigate('teacher-dashboard')}
          className="px-4 py-2.5 font-medium text-slate-600 hover:text-slate-900"
        >
          Back
        </button>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Settings Saved!' : 'Save Configuration'}</span>
        </button>
      </div>

    </div>
  );
};
