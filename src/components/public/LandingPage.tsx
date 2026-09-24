import React from 'react';
import { AppView, UserRole } from '../../types';
import { AudioButton } from '../common/AudioButton';
import { DifficultyIndicator } from '../common/DifficultyIndicator';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import heroStudentImg from '../../assets/images/hero_spelling_student_1790281062665.jpg';
import studyGroupImg from '../../assets/images/students_study_group_1790281083409.jpg';
import trophyImg from '../../assets/images/trophy_spelling_award_1790281072658.jpg';
import {
  Zap,
  Trophy,
  Volume2,
  BookOpen,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
  onRoleChange: (role: UserRole) => void;
}

export const LandingPage: React.FC<Props> = ({ onNavigate, onRoleChange }) => {
  const handleStartPractice = () => {
    onRoleChange('student');
    onNavigate('practice');
  };

  const handleTeacherDemo = () => {
    onRoleChange('teacher');
    onNavigate('teacher-dashboard');
  };

  return (
    <div className="bg-[#F8FAFC]">
      {/* Top Disclaimer Notice */}
      <DisclaimerBanner variant="banner" />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200/70 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Value Prop */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full">
                <span>Secondary School Spelling Preparation Hub</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 text-balance leading-[1.12]">
                Train Your Spelling. Build Your Confidence.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Practice spelling, pronunciation, vocabulary, and timed competition challenges in an independent, distraction-free learning environment designed for Nigerian students.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleStartPractice}
                  className="px-6 py-3.5 text-sm font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>Start Practicing Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('competition-guide')}
                  className="px-5 py-3.5 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Competition Guide
                </button>

                <button
                  onClick={handleTeacherDemo}
                  className="px-4 py-3.5 text-sm font-medium text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50/60 rounded-xl transition-colors cursor-pointer"
                >
                  Teacher Portal Demo →
                </button>
              </div>

              {/* Unboxed Metadata Trust Bar */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-4 text-xs text-slate-500 border-t border-slate-100">
                <span>Tailored for JSS 1 – SS 3</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>British & Nigerian English Curricula</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>Audio Pronunciation Engine</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>Zero Distractions</span>
              </div>
            </div>

            {/* Right Column: Visual Interactive Spelling Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-100 p-6 space-y-5">
                
                {/* Visual Card Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700 uppercase tracking-wider">Practice Question Preview</span>
                  <DifficultyIndicator difficulty="Medium" />
                </div>

                {/* Word Display with Audio */}
                <div className="space-y-3">
                  <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Target Word</div>
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">accommodate</h2>
                    <span className="text-xs font-mono text-slate-500">/əˈkɒmədeɪt/</span>
                  </div>
                  
                  <div className="pt-1">
                    <AudioButton word="accommodate" size="sm" />
                  </div>
                </div>

                {/* Vocabulary Details */}
                <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/60">
                  <div>
                    <strong className="text-slate-800">Part of Speech: </strong>
                    <span className="italic">verb</span>
                  </div>
                  <div>
                    <strong className="text-slate-800">Definition: </strong>
                    To provide sufficient space, room, or lodging; or adapt to requirements.
                  </div>
                  <div className="text-slate-500 italic pt-1">
                    "The national hall can accommodate all secondary school finalists."
                  </div>
                </div>

                {/* Interactive Demo Action */}
                <button
                  onClick={handleStartPractice}
                  className="w-full py-2.5 text-xs font-semibold text-slate-900 bg-amber-100 hover:bg-amber-200 rounded-lg text-center transition-colors block cursor-pointer"
                >
                  Test Your Spelling in Live Practice Mode →
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* High-Fidelity Editorial Visual Break */}
      <section className="py-12 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white group">
              <div className="aspect-video w-full overflow-hidden bg-slate-100">
                <img
                  src={heroStudentImg}
                  alt="Focused Nigerian student at competition practice microphone"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Competition Podium Poise</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Learn to listen under simulated competition timing without rushing your answers.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white group">
              <div className="aspect-video w-full overflow-hidden bg-slate-100">
                <img
                  src={studyGroupImg}
                  alt="Secondary school students reviewing spelling notes together"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Collaborative School Drills</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Equip entire classes with structured vocabulary sets and weekly teacher assignments.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white group">
              <div className="aspect-video w-full overflow-hidden bg-slate-100">
                <img
                  src={trophyImg}
                  alt="Academic spelling bee trophy and dictionary on wooden desk"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Merit & Mastery Milestones</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Celebrate accuracy milestones, consistency streaks, and clean contest simulations.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 border-t border-slate-200/70 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              How SpellReady Works
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              A four-step cycle designed to build long-term spelling memory and competition poise.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-semibold text-slate-900">Hear the Word</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click to hear clear acoustic pronunciation. Request normal pace or slower enunciation just like asking an official pronouncer.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-semibold text-slate-900">Spell the Word</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your spelling without distracting predictive auto-correct or unwanted hints. Focus on internal memory and letter sounds.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-semibold text-slate-900">Check Your Answer</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive immediate constructive feedback. Verify exact spelling, syllabic breakdown, and phonetic nuances.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="text-base font-semibold text-slate-900">Learn & Retain</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Missed words are automatically moved to your dedicated Review Mistakes bucket until you spell them correctly twice.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Practice Features Grid */}
      <section className="py-16 border-t border-slate-200/70 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Targeted Training Features
            </h2>
            <p className="text-sm text-slate-600">
              Purpose-built tools to take students from schoolroom practice to competition readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Quick Practice Drills</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Short 10-word drills designed for high frequency daily practice on mobile phones and tablets.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Competition Simulator</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Authentic timed conditions (45 seconds per word), round counters, and strict unassisted spelling rules.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Curated Word Library</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Searchable repository grouped by difficulty (Easy to Challenge) and subject domains like Science, Civics, and Tech.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Mistakes Review Bucket</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Target words that tripped you up previously. Spaced repetition ensures tricky double-letters don't stay unmastered.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Progress & Accuracy Analytics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track accuracy percentages across Easy, Medium, and Challenge difficulties, streak days, and total words mastered.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Teacher Assignments & Reports</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Educators can create classroom word sets, assign homework drills, and monitor student completion in real time.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Competition Preparation Statement */}
      <section className="py-14 bg-white border-t border-slate-200/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
            <ShieldCheck className="w-4 h-4 text-slate-600" />
            <span>Independent Competition Preparation</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Preparing for Nigeria’s Premier Spelling Contests
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed">
            Secondary school spelling bees—including regional and national competitions such as MTN Spelling Bee initiatives—require steady nerves, rich vocabulary, and sharp phonetic recognition. SpellReady equips teachers and candidates with practical drills without commercial distractions.
          </p>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('competition-guide')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors"
            >
              <span>Read the Competition Preparation Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
            Ready to test your spelling skills?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Begin with a rapid 10-word practice session or explore the teacher assignment portal.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={handleStartPractice}
              className="px-6 py-3 text-sm font-semibold text-slate-900 bg-amber-500 hover:bg-amber-400 rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              Start Student Practice
            </button>
            <button
              onClick={handleTeacherDemo}
              className="px-6 py-3 text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              View Teacher Portal
            </button>
          </div>

          <div className="text-[11px] text-slate-500 pt-4">
            No real credit card, email harvesting, or phone numbers required for prototype demo.
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-8 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-slate-200">SpellReady</span> — Independent Spelling Bee Preparation Platform
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('about')} className="hover:text-slate-200 transition-colors">About</button>
            <button onClick={() => onNavigate('competition-guide')} className="hover:text-slate-200 transition-colors">Competition Guide</button>
            <button onClick={() => onNavigate('word-library')} className="hover:text-slate-200 transition-colors">Word Library</button>
          </div>
          <div className="text-slate-500">
            For Nigerian Secondary Schools (JSS & SS)
          </div>
        </div>
      </footer>
    </div>
  );
};
