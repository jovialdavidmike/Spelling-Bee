import React from 'react';
import { AppView, UserRole } from '../../types';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { Trophy, HelpCircle, Clock, Volume2, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
  onRoleChange: (role: UserRole) => void;
}

export const CompetitionGuidePage: React.FC<Props> = ({ onNavigate, onRoleChange }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Competition Preparation</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Secondary School Spelling Bee Contestant Guide
        </h1>
        <p className="text-base text-slate-600 max-w-3xl leading-relaxed">
          Essential competition-stage techniques, pronouncer interaction etiquette, and practice strategies for Nigerian students preparing for regional and national spelling competitions.
        </p>
      </div>

      <DisclaimerBanner variant="inline" />

      {/* Official Information Placeholder Box */}
      <div className="p-5 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-700" />
          <span>Official Competition Notices & Schedule Verification</span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          <em>Official competition dates, host venues, registration deadlines, and sanctioned word list publications will be updated here following verified announcements by authorized competition organizers. Please verify all registration criteria through your secondary school's designated English department or competition coordinator.</em>
        </p>
      </div>

      {/* Stage Etiquette & Rules Guide */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900">
          Stage Strategies & Contestant Rights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-800">
                <Volume2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">1. Pronounce Before You Spell</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Always pronounce the word clearly into the microphone before beginning your spelling. This confirms to the judges that you correctly heard the word and did not misinterpret a homophone.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-800">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">2. Request Permitted Clarifications</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              You are entitled to ask the pronouncer:
              <br />• "Can you please repeat the word?"
              <br />• "May I have the definition?"
              <br />• "Could you use the word in a sentence?"
              <br />• "What is the language of origin?"
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-800">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">3. Control the 45-Second Clock</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Do not rush. Take the first 15–20 seconds to ask for the sentence, analyze the etymological root (e.g. Greek vs. Latin), and visualize the letter sequence before speaking.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-800">
                <Trophy className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">4. Pronounce After Spelling</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Once you finish uttering the letters, pronounce the complete word a second time. This signals to the judges that you have finalized your official answer.
            </p>
          </div>

        </div>
      </section>

      {/* Simulated Competition CTA */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold">Ready to practice under competition conditions?</h3>
          <p className="text-xs text-slate-300">
            Experience our timed simulator with round tracking and strict input validation.
          </p>
        </div>
        <button
          onClick={() => { onRoleChange('student'); onNavigate('competition'); }}
          className="px-5 py-3 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors cursor-pointer shrink-0"
        >
          Launch Competition Simulator →
        </button>
      </div>

    </div>
  );
};
