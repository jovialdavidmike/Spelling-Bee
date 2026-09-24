import React, { useState, useEffect } from 'react';
import { AppView, Competition, CompetitionRound, Word } from '../../types';
import { competitionService } from '../../services/competitionService';
import { voiceService } from '../../services/voiceService';
import { dataService } from '../../services/dataService';
import {
  Trophy,
  Volume2,
  Clock,
  Play,
  Pause,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  ShieldAlert,
  Sparkles,
  BookOpen,
  MessageSquare,
  BarChart3,
  ArrowLeft,
  X
} from 'lucide-react';

interface Props {
  competitionId?: string;
  onNavigate: (view: AppView) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const TeacherCompetitionLive: React.FC<Props> = ({
  competitionId,
  onNavigate,
  onShowToast
}) => {
  const [competition, setCompetition] = useState<Competition | null>(() => {
    if (competitionId) {
      const found = competitionService.getCompetitionById(competitionId);
      if (found) return found;
    }
    const comps = competitionService.getCompetitions();
    return comps.find(c => c.status === 'live' || c.status === 'ready') || comps[0];
  });

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [showInvalidateModal, setShowInvalidateModal] = useState(false);
  const [invalidationReason, setInvalidationReason] = useState('Pronunciation ambiguity or source dictionary discrepancy');
  const [showEndConfirmModal, setShowEndConfirmModal] = useState(false);
  const [showTieBreakModal, setShowTieBreakModal] = useState(false);
  const [tieBreakCandidates, setTieBreakCandidates] = useState<string[]>([]);

  const activeRoundIndex = competition?.currentRoundIndex || 0;
  const activeRound: CompetitionRound | undefined = competition?.rounds[activeRoundIndex];
  const roundWords: Word[] = activeRound ? dataService.getWordsByIds(activeRound.wordIds) : [];
  const currentWord: Word | undefined = roundWords[currentWordIndex];

  // Refresh active competition state
  const refreshCompetition = () => {
    if (competition) {
      const updated = competitionService.getCompetitionById(competition.id);
      if (updated) setCompetition({ ...updated });
    }
  };

  // Timer countdown for teacher room
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!isPaused && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPaused, timerSeconds]);

  // Voice announcement on new word
  const handlePronounce = () => {
    if (!currentWord) return;
    voiceService.speakWordPrompt(currentWord.word, 'competition');
  };

  const handleRepeatWord = () => {
    if (!currentWord) return;
    voiceService.speakWordRepeat(currentWord.word);
  };

  const handleReadDefinition = () => {
    if (!currentWord) return;
    voiceService.speakDefinition(currentWord.definition);
  };

  const handleReadSentence = () => {
    if (!currentWord) return;
    voiceService.speakSentence(currentWord.exampleSentence);
  };

  const handleTogglePause = () => {
    if (!competition) return;
    if (isPaused) {
      competitionService.resumeCompetition(competition.id);
      setIsPaused(false);
      onShowToast('Competition heat resumed.', 'info');
    } else {
      competitionService.pauseCompetition(competition.id);
      setIsPaused(true);
      onShowToast('Competition heat paused.', 'info');
    }
  };

  const handleNextWord = () => {
    if (!competition) return;
    if (currentWordIndex < roundWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      const limit = activeRound?.settings.timePerWord || 30;
      setTimerSeconds(limit);
      const nextW = roundWords[currentWordIndex + 1];
      if (nextW) {
        voiceService.speakWordPrompt(nextW.word, 'competition');
      }
    } else {
      handleFinalizeRound();
    }
  };

  const handleFinalizeRound = () => {
    if (!competition || !activeRound) return;
    const res = competitionService.completeRound(competition.id, activeRound.id);
    refreshCompetition();

    if (res.qualification.tieDetected) {
      setTieBreakCandidates(res.qualification.tiedIds);
      setShowTieBreakModal(true);
      voiceService.speakTieBreakerAnnouncement();
      onShowToast('Tie detected at the qualification threshold!', 'info');
    } else if (res.isComplete) {
      voiceService.speakText('The competition has concluded. Final standings calculated.');
      onShowToast('All rounds complete! Opening results...', 'success');
      onNavigate('teacher-competition-results');
    } else {
      onShowToast(`Round complete! ${res.qualification.qualifiedIds.length} spellers advanced.`, 'success');
      setCurrentWordIndex(0);
      setTimerSeconds(competition.rounds[activeRoundIndex + 1]?.settings.timePerWord || 30);
    }
  };

  const handleStartTieBreaker = () => {
    if (!competition) return;
    const tieWords = ['w1', 'w5', 'w8', 'w12'];
    competitionService.createTieBreakerRound(competition.id, tieBreakCandidates, tieWords);
    setShowTieBreakModal(false);
    refreshCompetition();
    setCurrentWordIndex(0);
    setTimerSeconds(20);
    onShowToast('Tie-Breaker round launched!', 'success');
  };

  const handleConfirmInvalidation = () => {
    if (!competition || !currentWord) return;
    competitionService.invalidateWord(competition.id, currentWord.id, invalidationReason);
    setShowInvalidateModal(false);
    refreshCompetition();
    onShowToast(`Word "${currentWord.word}" invalidated and excluded from scores.`, 'info');
  };

  const handleEndCompetitionEarly = () => {
    if (!competition) return;
    competitionService.completeCompetition(competition.id);
    setShowEndConfirmModal(false);
    onShowToast('Competition closed.', 'success');
    onNavigate('teacher-competition-results');
  };

  if (!competition) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900">No Active Competition Heat Found</h2>
        <button
          onClick={() => onNavigate('teacher-competition')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
        >
          Back to Competition Arena
        </button>
      </div>
    );
  }

  const participants = competition.participants || [];
  const activeCount = participants.filter(p => p.status === 'active' || p.status === 'qualified').length;
  const eliminatedCount = participants.filter(p => p.status === 'eliminated').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Moderator Control Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              LIVE MODERATOR CONSOLE
            </span>
            <span className="text-xs font-mono text-slate-400">{competition.accessCode}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {competition.title}
          </h1>
          <div className="text-xs text-slate-400 flex items-center gap-3">
            <span>Class: {competition.className}</span>
            <span>•</span>
            <span>{activeRound?.name}</span>
            <span>•</span>
            <span>Gemini Studio Voice ({activeRound?.settings.voiceName || 'Kore'})</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleTogglePause}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              isPaused
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? 'Resume Heat' : 'Pause Heat'}
          </button>

          <button
            onClick={() => setShowEndConfirmModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
          >
            End Competition
          </button>
        </div>
      </div>

      {/* Main Grid: Moderator Card & Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Word Moderation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            
            {/* Word Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Target Word {currentWordIndex + 1} of {roundWords.length}
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {currentWord?.word || 'Awaiting word...'}
                </h2>
                <div className="text-xs text-slate-500 font-mono">
                  {currentWord?.phoneticSpelling} • {currentWord?.partOfSpeech}
                </div>
              </div>

              {/* Authoritative Timer */}
              <div className="text-right">
                <div className="text-xs text-slate-400 font-medium">Authoritative Clock</div>
                <div className="text-3xl font-mono font-bold text-slate-800">
                  00:{String(timerSeconds).padStart(2, '0')}
                </div>
              </div>
            </div>

            {/* Pronouncer Triggers (Gemini Voice) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={handlePronounce}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs border border-indigo-200 transition-colors gap-2 cursor-pointer"
              >
                <Volume2 className="w-6 h-6 text-indigo-600" />
                <span>Pronounce Word</span>
              </button>

              <button
                onClick={handleRepeatWord}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors gap-2 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5 text-slate-600" />
                <span>Repeat Word</span>
              </button>

              <button
                onClick={handleReadDefinition}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors gap-2 cursor-pointer"
              >
                <BookOpen className="w-5 h-5 text-slate-600" />
                <span>Read Definition</span>
              </button>

              <button
                onClick={handleReadSentence}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors gap-2 cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 text-slate-600" />
                <span>Read Example</span>
              </button>
            </div>

            {/* Word Context Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-700">
              <div>
                <strong className="text-slate-900">Definition:</strong> {currentWord?.definition}
              </div>
              <div>
                <strong className="text-slate-900">Example Sentence:</strong> "{currentWord?.exampleSentence}"
              </div>
            </div>

            {/* Moderator Action Controls */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <button
                onClick={() => setShowInvalidateModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Invalidate Word
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleNextWord}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  <span>Advance to Next Word</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Roster & Analytics */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Participant Roster ({participants.length})
              </h3>
              <div className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {activeCount} Active / {eliminatedCount} Eliminated
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
              {participants.map((p, idx) => {
                const rs = activeRound ? p.roundScores[activeRound.id] : undefined;
                const roundCorrect = rs?.correctCount || 0;
                const roundTotal = rs?.answers?.length || 0;

                return (
                  <div key={p.studentId} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span>{p.studentName}</span>
                        {p.status === 'eliminated' && (
                          <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                            Eliminated
                          </span>
                        )}
                        {p.status === 'qualified' && (
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                            Qualified ✓
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {p.studentCode} • Overall: {p.totalScore} pts ({p.totalAccuracy}%)
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-slate-900 font-mono">
                        {roundCorrect}/{roundTotal}
                      </div>
                      <div className="text-[10px] text-slate-400">Current Round</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Invalidate Word Modal */}
      {showInvalidateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Invalidate Current Word?</h3>
              <p className="text-xs text-slate-500">
                Word: <strong className="text-slate-900">{currentWord?.word}</strong>. Invalidating excludes this word from participant scores while preserving full audit logs.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Invalidation
              </label>
              <textarea
                value={invalidationReason}
                onChange={(e) => setInvalidationReason(e.target.value)}
                rows={3}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowInvalidateModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmInvalidation}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors"
              >
                Confirm Invalidation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tie Breaker Modal */}
      {showTieBreakModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="space-y-1 text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Qualification Tie Detected</h3>
              <p className="text-xs text-slate-500">
                {tieBreakCandidates.length} spellers are tied at the qualification boundary. A sudden-death tie-breaker round is required to determine advancement.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
              <div className="font-semibold text-slate-900 mb-1">Tied Participants:</div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                {tieBreakCandidates.map(id => {
                  const p = participants.find(part => part.studentId === id);
                  return <li key={id}>{p?.studentName} ({p?.studentCode})</li>;
                })}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowTieBreakModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Advance All Tied Spellers
              </button>
              <button
                onClick={handleStartTieBreaker}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Launch Tie-Breaker Round
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Competition Confirmation */}
      {showEndConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">End Competition Heat?</h3>
            <p className="text-xs text-slate-500">
              This will finalize scores, calculate winner rankings, and close active participant inputs.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowEndConfirmModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleEndCompetitionEarly}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
              >
                End & Calculate Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
