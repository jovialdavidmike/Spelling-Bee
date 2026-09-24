import React from 'react';
import { AppView, UserRole } from '../../types';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { ShieldCheck, Target, HeartHandshake, BookOpen, Volume2, Award } from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
  onRoleChange: (role: UserRole) => void;
}

export const AboutPage: React.FC<Props> = ({ onNavigate, onRoleChange }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">About The Platform</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Empowering Nigerian Students to Master Spelling
        </h1>
        <p className="text-base text-slate-600 max-w-3xl leading-relaxed">
          SpellReady is an independent educational initiative designed to provide structured, accessible, and high-quality spelling bee training for secondary school students in Nigeria.
        </p>
      </div>

      <DisclaimerBanner variant="inline" />

      {/* Core Educational Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <Volume2 className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Pronunciation & Phonetics</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Spelling bees test listening accuracy as much as orthography. We train students to decode standard British and international English pronunciations, phonetic syllables, and stress patterns.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Etymology & Root Words</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Rote memorization fails with unfamiliar words. Understanding Latin prefixes, Greek combining forms, and French loanword rules enables contestants to spell words they have never seen before.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Stage Poise & Timing</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Competition mode trains students to manage the ticking 45-second timer, pause when necessary, request repetitions calmly, and avoid hurried mistakes under spotlight pressure.
          </p>
        </div>

      </div>

      {/* Teacher & School Collaboration */}
      <section className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-indigo-600" />
          <span>Designed for Secondary School Teachers</span>
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Behind every great speller is a committed English teacher or debate coach. Our teacher portal allows educators to assign specific weekly word sets, monitor class accuracy trends, diagnose frequent vowel and consonant confusion, and run mock elimination bees right in their classrooms or computer labs.
        </p>
        <div className="pt-2">
          <button
            onClick={() => { onRoleChange('teacher'); onNavigate('teacher-dashboard'); }}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Explore Teacher Dashboard Demo →
          </button>
        </div>
      </section>

      {/* Independent Notice section */}
      <section className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-700" />
          <span>Notice of Independence & Fair Practice</span>
        </h3>
        <p className="leading-relaxed">
          SpellReady is not owned, operated, certified, or endorsed by MTN Nigeria or any other commercial sponsor. Mentions of external competition names are for educational preparation and contextual reference only. Official rules, schedules, and contestant qualifications should always be confirmed through official competition organizers.
        </p>
      </section>

      {/* Back to Home action */}
      <div className="pt-4 flex gap-3">
        <button
          onClick={() => onNavigate('landing')}
          className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg bg-white"
        >
          ← Back to Home
        </button>
        <button
          onClick={() => { onRoleChange('student'); onNavigate('practice'); }}
          className="px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 rounded-lg"
        >
          Start Practice Drill
        </button>
      </div>

    </div>
  );
};
