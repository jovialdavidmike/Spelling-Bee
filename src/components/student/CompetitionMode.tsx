import React, { useState, useEffect, useRef } from 'react';
import { Word, AppView, SessionSettings, PracticeSession } from '../../types';
import { dataService } from '../../services/dataService';
import { practiceSessionService } from '../../services/practiceSessionService';
import { AudioButton } from '../common/AudioButton';
import { DifficultyIndicator } from '../common/DifficultyIndicator';
import {
  Trophy,
  Clock,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Zap,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
}

const SECONDS_PER_WORD = 45;

export const CompetitionMode: React.FC<Props> = ({ onNavigate }) => {
  const [stage, setStage] = useState<'intro' | 'active' | 'results'>('intro');
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [competitionWords, setCompetitionWords] = useState<Word[]>([]);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_WORD);
  const [userInput, setUserInput] = useState('');
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const startCompetition = () => {
    const settings: SessionSettings = {
      mode: 'competition',
      wordCount: 15,
      difficulty: 'Mixed',
      category: 'All Categories',
      timeLimitPerWordSeconds: SECONDS_PER_WORD,
      allowSkip: false,
      allowRetry: false,
      showDefinitionAfterAnswer: false,
      showExampleAfterAnswer: false,
      scoringRule: 'competition'
    };

    const newSession = practiceSessionService.createSession(settings, undefined, 'Competition Round Simulation');
    const words = dataService.getWordsByIds(newSession.wordIds);

    setSession(newSession);
    setCompetitionWords(words);
    setTimeLeft(SECONDS_PER_WORD);
    setUserInput('');
    setTotalTimeSpent(0);
    setStage('active');
  };

  const currentWord = session && competitionWords[session.currentIndex];

  // Timer loop for active question
  useEffect(() => {
    if (stage !== 'active' || !session || session.status === 'completed') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time expired for this word
          handleTimeExpire();
          return SECONDS_PER_WORD;
        }
        return prev - 1;
      });
      setTotalTimeSpent(t => t + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage, session?.currentIndex]);

  // Focus input when moving to new word
  useEffect(() => {
    if (stage === 'active' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [stage, session?.currentIndex]);

  const handleTimeExpire = () => {
    if (!currentWord || !session || isSubmitting) return;
    submitCurrentWord('(Time Expired)', true);
  };

  const submitCurrentWord = (answer: string, timedOut = false) => {
    if (!currentWord || !session || isSubmitting) return;
    setIsSubmitting(true);

    const timeTaken = SECONDS_PER_WORD - timeLeft;
    const { session: updatedSession } = practiceSessionService.submitAnswer(
      session,
      currentWord,
      timedOut ? '(Time Expired)' : answer,
      timeTaken,
      1
    );

    if (updatedSession.currentIndex + 1 < competitionWords.length) {
      updatedSession.currentIndex += 1;
      setSession({ ...updatedSession });
      setTimeLeft(SECONDS_PER_WORD);
      setUserInput('');
      setIsSubmitting(false);
    } else {
      // Completed full competition
      if (timerRef.current) clearInterval(timerRef.current);
      const finalized = practiceSessionService.finalizeSession(updatedSession);
      setSession({ ...finalized });
      setStage('results');
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isSubmitting) return;
    submitCurrentWord(userInput.trim());
  };

  // --- 1. INTRO STAGE ---
  if (stage === 'intro') {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
        <button
          onClick={() => onNavigate('student-dashboard')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium py-1 px-2 rounded hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Timed Simulation</span>
              <h1 className="text-2xl font-bold text-slate-900">Spelling Bee Competition Mode</h1>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Test your spelling under authentic competition conditions. You will receive 15 challenging secondary school words with strict timing and no hints or mid-round answer reveals.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-3 border-y border-slate-100 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <div className="text-slate-500">Total Words</div>
              <div className="text-lg font-bold text-slate-900 font-mono">15 Words</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <div className="text-slate-500">Time Limit</div>
              <div className="text-lg font-bold text-amber-700 font-mono">45s / Word</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <div className="text-slate-500">Difficulty</div>
              <div className="text-lg font-bold text-slate-900">Mixed & Hard</div>
            </div>
          </div>

          <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/70 text-xs text-amber-900 space-y-1.5">
            <div className="font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Simulation Conditions:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              <li>Listen to the official audio enunciation carefully using the audio button.</li>
              <li>Enter your answer before the 45-second clock reaches zero.</li>
              <li>Answers are locked upon submission without interim definition hints.</li>
            </ul>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={startCompetition}
              className="flex-1 py-3.5 text-sm font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors text-center cursor-pointer shadow-xs"
            >
              Start Competition Simulation →
            </button>
            <button
              onClick={() => onNavigate('student-dashboard')}
              className="px-5 py-3.5 text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. RESULTS STAGE ---
  if (stage === 'results' && session) {
    const accuracy = session.accuracy;
    const missedAttempts = session.attempts.filter(a => !a.isCorrect);

    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Trophy className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Simulation Completed</span>
            <h1 className="text-3xl font-bold text-slate-900">Competition Scorecard</h1>
            <p className="text-sm text-slate-600">
              {accuracy >= 85 
                ? 'Competition Ready! Superb performance under pressure.' 
                : 'Good simulation run! Review the words you missed below.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 py-4 border-y border-slate-100">
            <div>
              <div className="text-xs text-slate-500">Correct Words</div>
              <div className="text-2xl font-bold font-mono text-slate-900">{session.correctCount} / {session.wordIds.length}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Final Accuracy</div>
              <div className="text-2xl font-bold font-mono text-amber-600">{accuracy}%</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Total Time</div>
              <div className="text-2xl font-bold font-mono text-slate-700">
                {Math.floor(totalTimeSpent / 60)}m {totalTimeSpent % 60}s
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={startCompetition}
              className="px-5 py-2.5 text-xs font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Simulate Another Round
            </button>

            {missedAttempts.length > 0 && (
              <button
                onClick={() => onNavigate('mistakes')}
                className="px-4 py-2.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors cursor-pointer"
              >
                Review {missedAttempts.length} Missed Words →
              </button>
            )}

            <button
              onClick={() => onNavigate('student-dashboard')}
              className="px-4 py-2.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Performance Breakdown</h2>
          <div className="divide-y divide-slate-100">
            {session.attempts.map((item, idx) => {
              const wordObj = dataService.getWordById(item.wordId);
              if (!wordObj) return null;

              return (
                <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      {item.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span className="font-bold text-slate-900 text-sm">{wordObj.word}</span>
                      <DifficultyIndicator difficulty={wordObj.difficulty} showBars={false} />
                    </div>
                    {!item.isCorrect && (
                      <div className="text-slate-500 pl-6">
                        Your answer: <span className="line-through text-rose-600 font-mono">{item.studentAnswer}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right text-slate-400 font-mono text-[11px]">
                    {item.timeTakenSeconds}s
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- 2. ACTIVE COMPETITION STAGE ---
  if (!currentWord || !session) return null;

  const isTimeCritical = timeLeft <= 10;

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      
      {/* Competition Top Bar */}
      <div className="flex items-center justify-between text-xs bg-slate-900 text-white px-4 py-3 rounded-xl">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="font-semibold uppercase tracking-wider">Competition Simulation</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono text-slate-300">
            Word {session.currentIndex + 1} of {competitionWords.length}
          </span>
          
          {/* Countdown Clock */}
          <div className={`flex items-center gap-1.5 font-mono font-bold px-2 py-0.5 rounded transition-colors ${
            isTimeCritical ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-800 text-amber-400'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Main Focused Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6 text-center">
        
        <div className="space-y-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Listen to Official Enunciation
          </span>
          
          <div className="flex justify-center">
            <AudioButton word={currentWord.word} size="lg" />
          </div>

          <p className="text-xs text-slate-500">
            Repeat audio as needed before the 45-second clock expires.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-slate-100 text-left">
          <div>
            <label htmlFor="comp-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Official Spelling Entry
            </label>
            <input
              id="comp-input"
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="Spell the word..."
              className="w-full px-4 py-3.5 text-lg font-mono text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 tracking-wider"
            />
          </div>

          <button
            type="submit"
            disabled={!userInput.trim() || isSubmitting}
            className="w-full py-3.5 text-sm font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Submit Official Spelling
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
          <span>* Locked answer submission</span>
          <button
            onClick={() => setShowExitConfirm(true)}
            className="text-slate-400 hover:text-rose-600 transition-colors"
          >
            Exit Simulation
          </button>
        </div>
      </div>

      {/* Exit Warning Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Leave Active Competition?</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Exiting midway will cancel this competition round. Unsubmitted answers will not be recorded.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Stay in Simulation
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onNavigate('student-dashboard');
                }}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Exit Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
