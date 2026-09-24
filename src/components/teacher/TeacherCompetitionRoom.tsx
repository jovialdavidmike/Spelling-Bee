import React, { useState, useEffect } from 'react';
import { AppView, Word } from '../../types';
import { dataService } from '../../services/dataService';
import { AudioButton } from '../common/AudioButton';
import { DifficultyIndicator } from '../common/DifficultyIndicator';
import {
  Trophy,
  Users,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Volume2,
  ChevronRight
} from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
  onShowToast: (msg: string) => void;
}

export const TeacherCompetitionRoom: React.FC<Props> = ({ onNavigate, onShowToast }) => {
  const students = dataService.getTeacherStudents();
  const words = dataService.getWords();

  const [currentRound, setCurrentRound] = useState('Round 1: Preliminary');
  const [studentIndex, setStudentIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(45);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [scores, setScores] = useState<Record<string, { correct: number; strikes: number; status: 'active' | 'eliminated' }>>({
    std_01: { correct: 3, strikes: 0, status: 'active' },
    std_02: { correct: 3, strikes: 0, status: 'active' },
    std_03: { correct: 2, strikes: 1, status: 'active' },
    std_04: { correct: 2, strikes: 0, status: 'active' },
    std_05: { correct: 2, strikes: 1, status: 'active' },
    std_06: { correct: 1, strikes: 2, status: 'eliminated' }
  });

  const currentStudent = students[studentIndex] || students[0];
  const currentWord = words[wordIndex] || words[0];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const handleJudgeDecision = (verdict: 'correct' | 'incorrect') => {
    const studentId = currentStudent.id;
    const currentRecord = scores[studentId] || { correct: 0, strikes: 0, status: 'active' };

    if (verdict === 'correct') {
      setScores(prev => ({
        ...prev,
        [studentId]: { ...currentRecord, correct: currentRecord.correct + 1 }
      }));
      onShowToast(`✓ Correct marked for ${currentStudent.name}`);
    } else {
      const strikes = currentRecord.strikes + 1;
      const isEliminated = strikes >= 2;
      setScores(prev => ({
        ...prev,
        [studentId]: {
          ...currentRecord,
          strikes,
          status: isEliminated ? 'eliminated' : 'active'
        }
      }));
      onShowToast(isEliminated ? `${currentStudent.name} eliminated on 2 strikes.` : `Strike 1 logged for ${currentStudent.name}`);
    }

    // Advance to next word & next student
    setStudentIndex((studentIndex + 1) % students.length);
    setWordIndex((wordIndex + 1) % words.length);
    setTimerSeconds(45);
    setIsTimerRunning(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
            Host Moderator Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Mock Spelling Bee Simulation Room
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Conduct live podium simulation rounds in class with official timekeeper and judge controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={currentRound}
            onChange={(e) => setCurrentRound(e.target.value)}
            className="bg-white border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Round 1: Preliminary">Round 1: Preliminary (15s prep)</option>
            <option value="Round 2: Semi-Final">Round 2: Semi-Final (Poly-syllabic)</option>
            <option value="Round 3: Sudden Death">Round 3: Sudden Death Final</option>
          </select>
        </div>
      </div>

      {/* Main Moderator Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Active Candidate Podium Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          
          {/* Active Candidate Banner */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidate at the Microphone</span>
              <h2 className="text-xl font-bold text-slate-900">{currentStudent.name}</h2>
              <div className="text-xs text-slate-500">{currentStudent.className} · Level {currentStudent.level}</div>
            </div>

            {/* 45-Second Stopwatch Control */}
            <div className="flex items-center gap-3">
              <div className={`font-mono text-3xl font-bold px-3 py-1 rounded-xl ${
                timerSeconds <= 10 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-900'
              }`}>
                {timerSeconds}s
              </div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                  aria-label={isTimerRunning ? 'Pause timer' : 'Start timer'}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsTimerRunning(false); setTimerSeconds(45); }}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  aria-label="Reset timer to 45 seconds"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Pronouncer Card for the Teacher */}
          <div className="space-y-4 p-5 rounded-xl border border-amber-200/80 bg-amber-50/40">
            <div className="flex items-center justify-between text-xs text-amber-900">
              <span className="font-semibold uppercase tracking-wider">Official Word Prompt</span>
              <DifficultyIndicator difficulty={currentWord.difficulty} />
            </div>

            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{currentWord.word}</h3>
              <span className="text-sm font-mono text-slate-600 font-semibold">{currentWord.pronunciation}</span>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div>
                <strong className="text-slate-900">Definition: </strong>
                {currentWord.definition}
              </div>
              <div>
                <strong className="text-slate-900">Example Sentence: </strong>
                <span className="italic text-slate-600">"{currentWord.exampleSentence}"</span>
              </div>
              {currentWord.origin && (
                <div className="text-[11px] text-slate-500">
                  <strong>Etymology: </strong>{currentWord.origin}
                </div>
              )}
            </div>

            <div className="pt-2">
              <AudioButton word={currentWord.word} size="md" label="Play Official Word Audio" />
            </div>
          </div>

          {/* Judges Verdict Buttons */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Judge’s Official Verdict</span>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleJudgeDecision('correct')}
                className="py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all active:scale-[0.98]"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Correct (Pass)</span>
              </button>

              <button
                type="button"
                onClick={() => handleJudgeDecision('incorrect')}
                className="py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all active:scale-[0.98]"
              >
                <XCircle className="w-5 h-5" />
                <span>Incorrect (Strike)</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right: Live Elimination Scoreboard */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Live Heat Standings</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">2 Strikes Rule</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {students.map((std, idx) => {
              const rec = scores[std.id] || { correct: 0, strikes: 0, status: 'active' };
              const isCurrent = idx === studentIndex;
              return (
                <div
                  key={std.id}
                  className={`py-3 flex items-center justify-between gap-3 ${
                    isCurrent ? 'bg-amber-50/60 -mx-2 px-2 rounded-lg font-semibold' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 font-mono text-slate-400">#{idx + 1}</span>
                    <div className="truncate">
                      <div className="text-slate-900 font-medium truncate">{std.name}</div>
                      <div className="text-[11px] text-slate-500">{std.className}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-emerald-700 font-bold">{rec.correct} pts</span>
                    
                    {/* Strikes */}
                    <div className="flex items-center gap-0.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${rec.strikes >= 1 ? 'bg-rose-500' : 'bg-slate-200'}`} />
                      <span className={`w-2.5 h-2.5 rounded-full ${rec.strikes >= 2 ? 'bg-rose-600' : 'bg-slate-200'}`} />
                    </div>

                    {rec.status === 'eliminated' ? (
                      <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                        Eliminated
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
