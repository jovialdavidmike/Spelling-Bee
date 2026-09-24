import React, { useState, useEffect, useRef } from 'react';
import {
  Word,
  AppView,
  PracticeSession as IPracticeSession,
  SessionSettings,
  SpellingAttempt
} from '../../types';
import { dataService } from '../../services/dataService';
import { practiceSessionService } from '../../services/practiceSessionService';
import { validateSpelling } from '../../services/spellingEngine';
import { voiceService } from '../../services/voiceService';
import { AudioButton } from '../common/AudioButton';
import { DifficultyIndicator } from '../common/DifficultyIndicator';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Volume2,
  ArrowRight,
  Trophy,
  Sparkles,
  BookOpen,
  Clock,
  Pause,
  Play,
  SkipForward,
  AlertCircle
} from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
  sessionSettings?: SessionSettings;
  customWordIds?: string[];
  sessionTitle?: string;
  assignmentId?: string;
}

export const PracticeSession: React.FC<Props> = ({
  onNavigate,
  sessionSettings,
  customWordIds,
  sessionTitle,
  assignmentId
}) => {
  const [session, setSession] = useState<IPracticeSession | null>(null);
  const [sessionWords, setSessionWords] = useState<Word[]>([]);
  const [userInput, setUserInput] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [lastValidation, setLastValidation] = useState<ReturnType<typeof validateSpelling> | null>(null);
  const [showDefinitionHint, setShowDefinitionHint] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [wordTimerSeconds, setWordTimerSeconds] = useState(0);
  const [listenedCount, setListenedCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Session
  useEffect(() => {
    const defaultSettings: SessionSettings = sessionSettings || {
      mode: 'quick',
      wordCount: 10,
      difficulty: 'Mixed',
      category: 'All Categories',
      allowSkip: true,
      allowRetry: false,
      showDefinitionAfterAnswer: true,
      showExampleAfterAnswer: true,
      scoringRule: 'standard'
    };

    const newSession = practiceSessionService.createSession(
      defaultSettings,
      customWordIds,
      sessionTitle,
      assignmentId
    );

    const words = dataService.getWordsByIds(newSession.wordIds);
    setSession(newSession);
    setSessionWords(words);
    setUserInput('');
    setHasSubmitted(false);
    setLastValidation(null);
    setWordTimerSeconds(0);
    setListenedCount(0);
  }, [sessionSettings, customWordIds, sessionTitle, assignmentId]);

  // Per-word timer ticker
  useEffect(() => {
    if (!session || session.status === 'completed' || isPaused || hasSubmitted) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setWordTimerSeconds(s => s + 1);
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [session, isPaused, hasSubmitted]);

  // Auto focus input on each question
  useEffect(() => {
    if (!hasSubmitted && !isPaused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [session?.currentIndex, hasSubmitted, isPaused]);

  if (!session || sessionWords.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Preparing practice session...</h2>
        <p className="text-xs text-slate-500">Loading words from dictionary repository.</p>
      </div>
    );
  }

  const currentWord = sessionWords[session.currentIndex];

  // Submission handler
  const handleSubmitAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || hasSubmitted || !currentWord || isSubmitting) return;

    setIsSubmitting(true);
    const { session: updatedSession, validation } = practiceSessionService.submitAnswer(
      session,
      currentWord,
      userInput,
      wordTimerSeconds,
      Math.max(1, listenedCount)
    );

    setSession({ ...updatedSession });
    setLastValidation(validation);
    setHasSubmitted(true);
    setIsSubmitting(false);
    voiceService.speakFeedbackResult(validation.isCorrect, updatedSession.settings.mode);
  };

  // Skip question handler
  const handleSkipQuestion = () => {
    if (!currentWord || hasSubmitted) return;
    const updated = practiceSessionService.skipQuestion(session, currentWord, wordTimerSeconds);
    setSession({ ...updated });
    handleNextWord();
  };

  // Advance to next word or complete session
  const handleNextWord = () => {
    if (session.currentIndex + 1 < sessionWords.length) {
      setSession({
        ...session,
        currentIndex: session.currentIndex + 1
      });
      setUserInput('');
      setHasSubmitted(false);
      setLastValidation(null);
      setShowDefinitionHint(false);
      setWordTimerSeconds(0);
      setListenedCount(0);
    } else {
      const finalized = practiceSessionService.finalizeSession(session);
      setSession({ ...finalized });
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (hasSubmitted) {
        e.preventDefault();
        handleNextWord();
      }
    }
  };

  // --- RESULTS SCREEN ---
  if (session.status === 'completed') {
    const totalAttempted = session.correctCount + session.incorrectCount;
    const accuracy = totalAttempted > 0 ? Math.round((session.correctCount / totalAttempted) * 100) : 0;
    const missedAttempts = session.attempts.filter(a => !a.isCorrect && !a.isSkipped);

    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        
        {/* Results Summary Card */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Trophy className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{session.title}</span>
            <h1 className="text-3xl font-bold text-slate-900">Practice Complete!</h1>
            <p className="text-sm text-slate-600">
              {accuracy >= 80 
                ? 'Outstanding spelling precision! Keep up the momentum.' 
                : 'Good effort! Review the words you missed below to lock in the correct spelling.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-slate-100 text-center">
            <div>
              <div className="text-xs text-slate-500">Correct</div>
              <div className="text-2xl font-bold font-mono text-slate-900">{session.correctCount} / {session.wordIds.length}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Accuracy</div>
              <div className="text-2xl font-bold font-mono text-amber-600">{accuracy}%</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Time Spent</div>
              <div className="text-2xl font-bold font-mono text-slate-800">
                {Math.floor(session.durationSeconds / 60)}m {session.durationSeconds % 60}s
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Points Earned</div>
              <div className="text-2xl font-bold font-mono text-emerald-600">+{session.score} XP</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {missedAttempts.length > 0 ? (
              <button
                onClick={() => onNavigate('mistakes')}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Review {missedAttempts.length} Missed Words →
              </button>
            ) : (
              <button
                onClick={() => onNavigate('practice-setup')}
                className="px-5 py-2.5 text-xs font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Practice Another Set
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

        {/* Word by Word Review */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Word Review</h2>
          <div className="divide-y divide-slate-100">
            {session.attempts.map((att, idx) => {
              const wordObj = dataService.getWordById(att.wordId);
              if (!wordObj) return null;

              return (
                <div key={att.id || idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {att.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span className="font-bold text-slate-900 text-sm">{wordObj.word}</span>
                      <DifficultyIndicator difficulty={wordObj.difficulty} showBars={false} />
                    </div>

                    {!att.isCorrect && (
                      <div className="text-slate-500 pl-6 space-y-0.5">
                        <div>
                          Your answer: <span className="line-through text-rose-600 font-mono font-medium">{att.studentAnswer}</span>
                        </div>
                        {wordObj.tips && (
                          <div className="text-amber-800 italic text-[11px]">
                            Tip: {wordObj.tips}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    <span className="font-mono text-slate-400 text-[11px]">{att.timeTakenSeconds}s</span>
                    <AudioButton word={wordObj.word} size="sm" allowSlowMode={false} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    );
  }

  // --- ACTIVE QUESTION SCREEN ---
  const progressPercent = Math.round((session.currentIndex / sessionWords.length) * 100);

  return (
    <div className="max-w-xl mx-auto py-6 px-4 space-y-6" onKeyDown={handleKeyDown}>
      
      {/* Top Header: Exit, Pause, and Progress Counter */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('student-dashboard')}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-medium py-1 px-2 rounded hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 font-medium py-1 px-2 rounded hover:bg-slate-100 transition-colors"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-amber-600" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{wordTimerSeconds}s</span>
          </span>

          <span className="font-mono font-bold text-slate-900">
            Word {session.currentIndex + 1} of {sessionWords.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Pause Overlay if paused */}
      {isPaused ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <Pause className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Practice Drill Paused</h2>
          <p className="text-xs text-slate-500">Take a breath. Your timer is paused.</p>
          <button
            onClick={() => setIsPaused(false)}
            className="px-6 py-2.5 text-xs font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors cursor-pointer"
          >
            Resume Practice Drill
          </button>
        </div>
      ) : (
        /* Main Active Question Card */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          
          {/* Card Meta: Difficulty and Length */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Difficulty:</span>
              <DifficultyIndicator difficulty={currentWord.difficulty} />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-mono text-[11px]">
                {currentWord.letterCount || currentWord.word.length} letters
              </span>

              {session.settings.allowSkip && !hasSubmitted && (
                <button
                  type="button"
                  onClick={handleSkipQuestion}
                  className="text-slate-400 hover:text-slate-700 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>Skip</span>
                </button>
              )}
            </div>
          </div>

          {/* Audio Pronunciation Stage (Word spelling remains hidden!) */}
          <div className="text-center py-6 sm:py-8 space-y-3 bg-slate-50/70 rounded-xl border border-slate-100">
            <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Listen to the Pronunciation
            </div>

            <div className="flex justify-center">
              <AudioButton
                word={currentWord.word}
                size="lg"
                onPlayStart={() => setListenedCount(c => c + 1)}
              />
            </div>

            <p className="text-[11px] text-slate-500">
              Listen carefully to each letter sound. Click "Slower" if you need careful enunciation.
            </p>

            {/* Optional Definition Toggle */}
            {!hasSubmitted && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowDefinitionHint(!showDefinitionHint)}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-amber-700 font-medium transition-colors"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>{showDefinitionHint ? 'Hide Definition Hint' : 'Show Definition Hint'}</span>
                </button>

                {showDefinitionHint && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 text-left space-y-1 animate-fadeIn max-w-md mx-auto">
                    <div className="font-semibold">Part of speech: <span className="italic font-normal">{currentWord.partOfSpeech}</span></div>
                    <div className="font-semibold">Meaning: <span className="font-normal">{currentWord.definition}</span></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Spelling Input Area (Before Submission) */}
          {!hasSubmitted ? (
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <div>
                <label htmlFor="student-spelling-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Type Your Spelling
                </label>
                <input
                  id="student-spelling-input"
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  placeholder="Type the word here..."
                  className="w-full px-4 py-3.5 text-base sm:text-lg font-mono text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 tracking-wide transition-all"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                  <span>No auto-correct active</span>
                  <span>Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">Enter</kbd> to submit</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!userInput.trim() || isSubmitting}
                className="w-full py-3.5 text-sm font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Submit Answer
              </button>
            </form>
          ) : (
            /* Post-Submission Feedback Area */
            <div className="space-y-5 animate-fadeIn">
              
              {lastValidation?.isCorrect ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <div className="text-sm font-bold text-emerald-900">Correct! Excellent work.</div>
                    <div className="text-emerald-800">
                      You spelled <strong className="font-mono">{currentWord.word}</strong> accurately in {wordTimerSeconds} seconds.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1.5 text-xs">
                    <div className="text-sm font-bold text-rose-900">Not quite. Let’s learn this one.</div>
                    <div className="text-rose-800">
                      Your answer: <span className="line-through font-mono font-bold text-rose-700">{userInput}</span>
                    </div>
                    <div className="text-slate-900 font-semibold pt-0.5">
                      Correct Spelling: <span className="font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-sm">{currentWord.word}</span>
                    </div>
                    {lastValidation?.feedback && (
                      <div className="text-slate-600 italic pt-1">
                        {lastValidation.feedback}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Educational Breakdown */}
              <div className="bg-slate-50/90 rounded-xl p-4 border border-slate-200/70 space-y-2 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 font-mono text-sm">{currentWord.word}</strong>
                    <span className="font-mono text-slate-500 ml-2">({currentWord.pronunciation})</span>
                  </div>
                  <span className="italic text-slate-500">{currentWord.partOfSpeech}</span>
                </div>

                <div>
                  <strong className="text-slate-900">Definition: </strong>
                  {currentWord.definition}
                </div>

                <div>
                  <strong className="text-slate-900">Example: </strong>
                  <span className="italic text-slate-600">"{currentWord.exampleSentence}"</span>
                </div>

                {currentWord.tips && (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/70 text-amber-900 text-[11px] mt-1">
                    <strong>Spelling Tip: </strong>{currentWord.tips}
                  </div>
                )}
              </div>

              {/* Next Word Button */}
              <button
                type="button"
                onClick={handleNextWord}
                className="w-full py-3.5 text-sm font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>{session.currentIndex + 1 < sessionWords.length ? 'Continue to Next Word' : 'View Session Results'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
