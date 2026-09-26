import React, { useState, useEffect, useRef } from 'react';
import { AppView, Competition, CompetitionRound, Word } from '../../types';
import { competitionService } from '../../services/competitionService';
import { voiceService } from '../../services/voiceService';
import { authService } from '../../services/authService';
import { dataService } from '../../services/dataService';
import { VoiceSpellingInput } from '../common/VoiceSpellingInput';
import {
  Trophy,
  Volume2,
  Clock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  MessageSquare,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  Zap,
  ArrowLeft,
  EyeOff
} from 'lucide-react';

interface Props {
  competitionId?: string;
  onNavigate: (view: AppView) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onLaunchPracticeMistakes?: (words: string[]) => void;
}

export const CompetitionLiveSession: React.FC<Props> = ({
  competitionId,
  onNavigate,
  onShowToast,
  onLaunchPracticeMistakes
}) => {
  const currentUser = authService.getCurrentUser();
  const studentId = currentUser?.id || 'std_01';

  // Retrieve competition
  const [competition, setCompetition] = useState<Competition | null>(() => {
    if (competitionId) {
      const found = competitionService.getCompetitionById(competitionId);
      if (found) return found;
    }
    // Default to first active competition or create solo simulation
    const comps = competitionService.getCompetitions();
    const live = comps.find(c => c.status === 'live' || c.status === 'ready');
    return live || comps[0] || competitionService.createSoloSimulation();
  });

  const [stage, setStage] = useState<'rules' | 'lobby' | 'countdown' | 'active_word' | 'word_feedback' | 'round_complete' | 'final_results'>('rules');
  const [countdownValue, setCountdownValue] = useState(5);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);

  // Time tracking
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [wordDeadlineTimestamp, setWordDeadlineTimestamp] = useState<number>(0);
  const [totalSessionDurationSec, setTotalSessionDurationSec] = useState(0);

  // Input & submission
  const [userInput, setUserInput] = useState('');
  const [replaysUsed, setReplaysUsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionResult, setLastSubmissionResult] = useState<{ isCorrect: boolean; submitted: string; expected: string } | null>(null);

  // Round summary & qualification
  const [roundQualification, setRoundQualification] = useState<{ isQualified: boolean; score: number; accuracy: number } | null>(null);
  const [missedWordsList, setMissedWordsList] = useState<Word[]>([]);

  // Anti-cheating tab tracking
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const activeRound: CompetitionRound | undefined = competition?.rounds[currentRoundIndex];
  const roundWords: Word[] = activeRound ? dataService.getWordsByIds(activeRound.wordIds) : [];

  // Tab switching visibility tracking (Prompt 5 requirement)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        if (competition) {
          competitionService.logAttentionEvent(competition.id, studentId, 'visibilityHidden', 'Browser tab switched away');
        }
      } else {
        if (competition) {
          competitionService.logAttentionEvent(competition.id, studentId, 'visibilityRestored', 'Browser tab restored');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [competition?.id, studentId]);

  // Load current target word
  useEffect(() => {
    if (roundWords.length > 0 && currentWordIndex < roundWords.length) {
      const target = roundWords[currentWordIndex];
      setCurrentWord(target);
      setUserInput('');
      setReplaysUsed(0);
      setIsSubmitting(false);

      const timeLimit = activeRound?.settings.timePerWord || 30;
      setSecondsRemaining(timeLimit);
      setWordDeadlineTimestamp(Date.now() + timeLimit * 1000);

      // Auto-pronounce using Gemini API voice when moving to a new word in active mode
      if (stage === 'active_word' && target) {
        voiceService.speakWordPrompt(target.word, competition?.mode === 'practice_simulation' ? 'practice' : 'competition');
      }
    }
  }, [currentWordIndex, currentRoundIndex, stage]);

  // Focus input automatically
  useEffect(() => {
    if (stage === 'active_word' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [stage, currentWordIndex]);

  // Authoritative Timestamp-based Timer loop (Prompt 5 requirement)
  useEffect(() => {
    if (stage !== 'active_word') {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    const timeLimit = activeRound?.settings.timePerWord || 30;
    if (timeLimit <= 0) return; // untimed

    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((wordDeadlineTimestamp - now) / 1000));
      setSecondsRemaining(remaining);
      setTotalSessionDurationSec(t => t + 1);

      if (remaining <= 0) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        handleTimeExpired();
      }
    }, 250);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [stage, wordDeadlineTimestamp]);

  // Countdown timer before competition starts
  useEffect(() => {
    if (stage === 'countdown') {
      if (countdownValue > 1) {
        const timeout = setTimeout(() => {
          setCountdownValue(prev => prev - 1);
        }, 1000);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setStage('active_word');
          if (currentWord) {
            voiceService.speakWordPrompt(currentWord.word, 'competition');
          }
        }, 1000);
        return () => clearTimeout(timeout);
      }
    }
  }, [stage, countdownValue, currentWord]);

  const handleStartLobbyOrCountdown = () => {
    if (!competition) return;
    voiceService.speakCompetitionOpening(competition.title);
    setStage('countdown');
    setCountdownValue(5);
  };

  const handlePlayWord = () => {
    if (!currentWord || !activeRound) return;
    const maxReplays = activeRound.settings.maxReplaysAllowed;
    if (replaysUsed >= maxReplays && !activeRound.settings.allowReplay) {
      onShowToast(`No more replays allowed for this word.`, 'info');
      return;
    }
    setReplaysUsed(prev => prev + 1);
    voiceService.speakWordRepeat(currentWord.word);
  };

  const handlePlayDefinition = () => {
    if (!currentWord || !activeRound?.settings.allowDefinition) return;
    voiceService.speakDefinition(currentWord.definition);
  };

  const handlePlaySentence = () => {
    if (!currentWord || !activeRound?.settings.allowExample) return;
    voiceService.speakSentence(currentWord.exampleSentence);
  };

  const handleTimeExpired = () => {
    if (isSubmitting || !currentWord) return;
    voiceService.speakTimeExpired();
    submitWordAnswer('(Time Expired)', true);
  };

  const submitWordAnswer = (answerText: string, isTimeout = false) => {
    if (isSubmitting || !competition || !activeRound || !currentWord) return;
    setIsSubmitting(true);

    const responseTime = Math.max(1000, Date.now() - (wordDeadlineTimestamp - (activeRound.settings.timePerWord || 30) * 1000));

    try {
      const result = competitionService.submitAnswer({
        competitionId: competition.id,
        roundId: activeRound.id,
        studentId,
        wordId: currentWord.id,
        submittedText: answerText,
        responseTimeMs: responseTime,
        isTimeout
      });

      if (!result.isCorrect) {
        setMissedWordsList(prev => [...prev.filter(w => w.id !== currentWord.id), currentWord]);
      }

      setLastSubmissionResult({
        isCorrect: result.isCorrect,
        submitted: answerText,
        expected: currentWord.word
      });

      // Show immediate feedback or jump immediately depending on settings
      if (activeRound.settings.showImmediateFeedback) {
        voiceService.speakFeedbackResult(result.isCorrect, 'practice');
        setStage('word_feedback');
        setTimeout(() => {
          advanceToNextWordOrRound();
        }, 1800);
      } else {
        advanceToNextWordOrRound();
      }
    } catch (err: any) {
      onShowToast(err?.message || 'Submission error', 'error');
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    const trimmed = userInput.trim();
    if (!trimmed) {
      onShowToast('Please enter your spelling before submitting.', 'info');
      return;
    }
    submitWordAnswer(trimmed, false);
  };

  const advanceToNextWordOrRound = () => {
    if (!competition || !activeRound) return;

    if (currentWordIndex < roundWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setStage('active_word');
    } else {
      // Round completed!
      handleRoundCompletion();
    }
  };

  const handleRoundCompletion = () => {
    if (!competition || !activeRound) return;

    try {
      const roundResult = competitionService.completeRound(competition.id, activeRound.id);
      const isQualified = roundResult.qualification.qualifiedIds.includes(studentId);

      const participant = competition.participants.find(p => p.studentId === studentId);
      const currentScore = participant?.roundScores[activeRound.id]?.score || 0;
      const currentAccuracy = participant?.roundScores[activeRound.id]?.accuracy || 0;

      setRoundQualification({
        isQualified,
        score: currentScore,
        accuracy: currentAccuracy
      });

      voiceService.speakRoundComplete(activeRound.name);

      if (roundResult.isComplete) {
        setStage('final_results');
      } else {
        setStage('round_complete');
      }
    } catch (e: any) {
      onShowToast(e?.message || 'Error completing round', 'error');
    }
  };

  const handleNextRound = () => {
    if (!competition) return;
    if (currentRoundIndex < competition.rounds.length - 1) {
      setCurrentRoundIndex(prev => prev + 1);
      setCurrentWordIndex(0);
      setStage('active_word');
      voiceService.speakRoundIntro(competition.rounds[currentRoundIndex + 1].name, competition.rounds[currentRoundIndex + 1].wordIds.length);
    } else {
      setStage('final_results');
    }
  };

  const handlePracticeMissedWords = () => {
    if (missedWordsList.length === 0) {
      onShowToast('Great job! No missed words to review.', 'success');
      return;
    }
    if (onLaunchPracticeMistakes) {
      onLaunchPracticeMistakes(missedWordsList.map(w => w.id));
    } else {
      onNavigate('mistakes');
    }
  };

  // --- RENDER 1: RULES SUMMARY & READINESS SCREEN ---
  if (stage === 'rules') {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                {competition?.isSimulation ? 'Competition Simulation' : 'Official Competition Heat'}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {competition?.title || 'Spelling Challenge'}
              </h1>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs text-slate-700">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Competition Rules & Guidelines
            </h3>
            <ul className="space-y-2 list-disc list-inside text-slate-600">
              <li>
                <strong>Total Words:</strong> {roundWords.length} words in this round ({activeRound?.name}).
              </li>
              <li>
                <strong>Time per Word:</strong> {activeRound?.settings.timePerWord || 30} seconds per word countdown.
              </li>
              <li>
                <strong>Audio Moderator:</strong> Powered by Google Gemini Studio Voice ({activeRound?.settings.voiceName || 'Kore'}). Listen attentively before typing.
              </li>
              <li>
                <strong>Repetition:</strong> {activeRound?.settings.allowReplay ? `Allowed up to ${activeRound.settings.maxReplaysAllowed} times` : 'Disabled (One listen only)'}.
              </li>
              <li>
                <strong>Definitions & Sentences:</strong> {activeRound?.settings.allowDefinition ? 'Available on request' : 'Disabled for this heat'}.
              </li>
              <li>
                <strong>Integrity & Focus:</strong> Browser spellcheck and copy-paste are disabled. Tab switching is monitored.
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3 text-xs text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Readiness Checklist:</strong>
              <span>Ensure your volume is at a comfortable level, you are in a quiet room, and you have a stable network connection.</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => onNavigate('competition')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Exit to Arena
            </button>
            <button
              onClick={handleStartLobbyOrCountdown}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 transition-all transform active:scale-95"
            >
              <span>I'm Ready — Enter Competition</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER 2: COUNTDOWN ANIMATION ---
  if (stage === 'countdown') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="text-center space-y-6 max-w-md animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center mx-auto">
            <Volume2 className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold text-indigo-400 tracking-widest mb-1">
              {competition?.title}
            </div>
            <h2 className="text-2xl font-bold text-slate-100">
              {activeRound?.name || 'Round 1'}
            </h2>
          </div>

          <div className="py-6">
            <div className="text-8xl font-black font-mono tracking-tight text-amber-400 animate-bounce">
              {countdownValue}
            </div>
            <p className="text-xs text-slate-400 mt-4">
              Get ready to listen and spell. Time begins immediately.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER 3: ACTIVE WORD SPELLING (FOCUS MODE) ---
  if (stage === 'active_word' || stage === 'word_feedback') {
    const timeLimit = activeRound?.settings.timePerWord || 30;
    const progressPercent = timeLimit > 0 ? (secondsRemaining / timeLimit) * 100 : 100;
    const isUrgentTime = secondsRemaining <= 8;

    return (
      <div className="min-h-[85vh] flex flex-col justify-between max-w-3xl mx-auto py-6 px-4">
        {/* Top Minimal Focus Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="space-y-0.5">
            <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
              {activeRound?.name} • Word {currentWordIndex + 1} of {roundWords.length}
            </div>
            <h2 className="text-sm font-semibold text-slate-700">
              {competition?.title}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {tabSwitchCount > 0 && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <EyeOff className="w-3 h-3" />
                Focus note: {tabSwitchCount} switch
              </span>
            )}
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${isUrgentTime ? 'text-rose-600 animate-ping' : 'text-slate-500'}`} />
              <span className={`text-lg font-mono font-bold ${isUrgentTime ? 'text-rose-600' : 'text-slate-800'}`}>
                {String(Math.floor(secondsRemaining / 60)).padStart(2, '0')}:{String(secondsRemaining % 60).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Timer Progress Bar */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden my-3">
          <div
            className={`h-full transition-all duration-300 ${
              isUrgentTime ? 'bg-rose-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Central Spelling Card */}
        <div className="my-auto py-6 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-10 text-center space-y-6">
            
            {/* Audio Moderator Section */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handlePlayWord}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center mx-auto transition-transform transform active:scale-95 group cursor-pointer"
                title="Pronounce Word (Gemini Voice)"
              >
                <Volume2 className="w-12 h-12 text-white group-hover:scale-110 transition-transform" />
              </button>

              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-800">
                  Tap to Re-hear Word
                </div>
                <div className="text-[11px] text-slate-500">
                  Voice: Gemini Studio ({activeRound?.settings.voiceName || 'Kore'}) • Replays used: {replaysUsed}/{activeRound?.settings.maxReplaysAllowed || 2}
                </div>
              </div>

              {/* Assistance buttons if permitted by round rules */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {activeRound?.settings.allowDefinition && (
                  <button
                    type="button"
                    onClick={handlePlayDefinition}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    Hear Definition
                  </button>
                )}
                {activeRound?.settings.allowExample && (
                  <button
                    type="button"
                    onClick={handlePlaySentence}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                    Hear Example
                  </button>
                )}
              </div>
            </div>

            {/* Input Form with Anti-Cheat attributes and Voice Podium support */}
            <div className="max-w-md mx-auto space-y-4">
              <VoiceSpellingInput
                value={userInput}
                onChange={setUserInput}
                onSubmit={() => {
                  if (userInput.trim() && !isSubmitting && secondsRemaining > 0) {
                    handleSubmit();
                  }
                }}
                disabled={isSubmitting || secondsRemaining <= 0}
                placeholder="Type or speak spelling..."
                preventCopyPaste={!!competition?.settings.preventCopyPaste}
                onPastePrevented={() => {
                  onShowToast('Copy/Paste is disabled during competition heats.', 'info');
                }}
              />

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !userInput.trim() || secondsRemaining <= 0}
                className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-base shadow-md shadow-indigo-600/25 transition-all transform active:scale-98 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Confirming...' : 'Submit Spelling'}
              </button>
            </div>

            {/* Immediate feedback banner if permitted */}
            {stage === 'word_feedback' && lastSubmissionResult && (
              <div className={`p-4 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2 ${
                lastSubmissionResult.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {lastSubmissionResult.isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Correct! Advancing...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>Incorrect. Advancing to next word...</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="text-center text-xs text-slate-400 py-2">
          SpellReady Competition Engine • Single submission locking active
        </div>
      </div>
    );
  }

  // --- RENDER 4: ROUND TRANSITION & QUALIFICATION ---
  if (stage === 'round_complete') {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
              Round Complete
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {activeRound?.name || 'Round Summary'}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-2xl font-extrabold text-slate-900">
                {roundQualification?.score || 0}
              </div>
              <div className="text-xs text-slate-500 font-medium">Round Score</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-2xl font-extrabold text-slate-900">
                {roundQualification?.accuracy || 0}%
              </div>
              <div className="text-xs text-slate-500 font-medium">Accuracy</div>
            </div>
          </div>

          {roundQualification?.isQualified ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
              <div className="flex items-center justify-center gap-1.5 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Qualified for Next Round ✓
              </div>
              <p className="text-xs text-emerald-700">
                Congratulations! You met the qualification threshold and advance to the next round.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
              <div className="flex items-center justify-center gap-1.5 font-bold text-sm">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Round Concluded
              </div>
              <p className="text-xs text-amber-700">
                You have completed this round. Keep training your missed words to improve for the next competition.
              </p>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {roundQualification?.isQualified && (
              <button
                onClick={handleNextRound}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all"
              >
                Continue to Next Round
              </button>
            )}
            <button
              onClick={() => setStage('final_results')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
            >
              View Full Standings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER 5: FINAL RESULTS & MISTAKE REVIEW LOOP ---
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-400/30">
            <Trophy className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Competition Complete 🎉
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            {competition?.title} • {competition?.isSimulation ? 'Simulation Mode' : 'Class Championship Heat'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-2xl font-black text-indigo-600">
                {roundWords.length - missedWordsList.length}/{roundWords.length}
              </div>
              <div className="text-xs text-slate-500 font-medium">Correct Words</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-2xl font-black text-emerald-600">
                {roundWords.length > 0 ? Math.round(((roundWords.length - missedWordsList.length) / roundWords.length) * 100) : 0}%
              </div>
              <div className="text-xs text-slate-500 font-medium">Accuracy</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-2xl font-black text-amber-600">
                {missedWordsList.length}
              </div>
              <div className="text-xs text-slate-500 font-medium">Missed Words</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-2xl font-black text-slate-700">
                {Math.floor(totalSessionDurationSec / 60)}m {totalSessionDurationSec % 60}s
              </div>
              <div className="text-xs text-slate-500 font-medium">Time Taken</div>
            </div>
          </div>

          {/* Missed Words Targeted Remedial Loop (Prompt 5 requirement) */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Mistake Review & Remedial Drill
                </h3>
                <p className="text-xs text-slate-500">
                  {missedWordsList.length > 0
                    ? `You missed ${missedWordsList.length} words during this heat. Review and practice them immediately.`
                    : 'Flawless performance! You spelled all words correctly.'}
                </p>
              </div>

              {missedWordsList.length > 0 && (
                <button
                  onClick={handlePracticeMissedWords}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Practice Missed Words
                </button>
              )}
            </div>

            {missedWordsList.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {missedWordsList.map(w => (
                  <div key={w.id} className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{w.word}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{w.phoneticSpelling}</div>
                    </div>
                    <button
                      onClick={() => voiceService.playWord(w.word)}
                      className="p-2 rounded-lg bg-white text-indigo-600 shadow-xs hover:bg-indigo-50 transition-colors"
                      title="Listen"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Navigation */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => onNavigate('competition')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Competition Arena
            </button>
            <button
              onClick={() => onNavigate('student-dashboard')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
            >
              Return to Student Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
