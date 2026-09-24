import React, { useState } from 'react';
import {
  AppView,
  PracticeMode,
  DifficultyLevel,
  WordCategory,
  SessionSettings
} from '../../types';
import { dataService } from '../../services/dataService';
import { practiceSessionService } from '../../services/practiceSessionService';
import { DifficultyIndicator } from '../common/DifficultyIndicator';
import {
  Zap,
  Target,
  RotateCcw,
  Calendar,
  FileCheck,
  Bookmark,
  ArrowRight,
  Clock,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
  onLaunchSession: (settings: SessionSettings, wordIds?: string[], title?: string, assignmentId?: string) => void;
}

export const PracticeSetupView: React.FC<Props> = ({ onNavigate, onLaunchSession }) => {
  const [selectedMode, setSelectedMode] = useState<PracticeMode>('quick');
  const [wordCount, setWordCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<DifficultyLevel | 'Mixed'>('Mixed');
  const [category, setCategory] = useState<WordCategory | 'All Categories'>('All Categories');
  
  const student = dataService.getStudent();
  const mistakes = dataService.getMistakes();
  const savedWords = dataService.getSavedWords();
  const assignments = dataService.getAssignments().filter(a => a.status === 'active');
  const isDailyDone = dataService.isDailyChallengeCompletedToday();
  const dailyRecord = dataService.getDailyChallengeRecord();

  const allWords = dataService.getWords();

  // Calculate matching word count for focused mode
  const matchingCheck = practiceSessionService.selectWordsForSession(allWords, {
    mode: selectedMode,
    wordCount,
    difficulty,
    category,
    allowSkip: true,
    allowRetry: false,
    showDefinitionAfterAnswer: true,
    showExampleAfterAnswer: true,
    scoringRule: 'standard'
  });

  const handleStart = () => {
    const settings: SessionSettings = {
      mode: selectedMode,
      wordCount,
      difficulty,
      category,
      allowSkip: selectedMode !== 'competition',
      allowRetry: selectedMode === 'mistakes',
      showDefinitionAfterAnswer: true,
      showExampleAfterAnswer: true,
      scoringRule: selectedMode === 'competition' ? 'competition' : 'standard'
    };

    onLaunchSession(settings);
  };

  const handleStartAssignment = (asg: typeof assignments[0]) => {
    const settings: SessionSettings = {
      mode: 'assignment',
      wordCount: asg.wordCount,
      difficulty: asg.difficulty,
      category: asg.category,
      timeLimitPerWordSeconds: 45,
      allowSkip: true,
      allowRetry: false,
      showDefinitionAfterAnswer: true,
      showExampleAfterAnswer: true,
      scoringRule: 'standard'
    };

    onLaunchSession(settings, asg.wordIds, asg.title, asg.id);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Spelling Practice Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select a training mode to sharpen spelling accuracy, test weak words, or complete teacher homework.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        
        <button
          onClick={() => setSelectedMode('quick')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedMode === 'quick'
              ? 'bg-amber-50/80 border-amber-400 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <Zap className="w-5 h-5 text-amber-600 mb-2" />
          <div className="text-sm font-bold text-slate-900">Quick Drill</div>
          <div className="text-xs text-slate-500 mt-0.5">Rapid 5–20 words</div>
        </button>

        <button
          onClick={() => setSelectedMode('focused')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedMode === 'focused'
              ? 'bg-amber-50/80 border-amber-400 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <Target className="w-5 h-5 text-indigo-600 mb-2" />
          <div className="text-sm font-bold text-slate-900">Focused Practice</div>
          <div className="text-xs text-slate-500 mt-0.5">By topic & difficulty</div>
        </button>

        <button
          onClick={() => setSelectedMode('mistakes')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedMode === 'mistakes'
              ? 'bg-amber-50/80 border-amber-400 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <RotateCcw className="w-5 h-5 text-rose-600 mb-2" />
          <div className="text-sm font-bold text-slate-900">Mistakes Review</div>
          <div className="text-xs text-slate-500 mt-0.5">{mistakes.length} flagged words</div>
        </button>

        <button
          onClick={() => setSelectedMode('daily')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedMode === 'daily'
              ? 'bg-amber-50/80 border-amber-400 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <Calendar className="w-5 h-5 text-emerald-600 mb-2" />
          <div className="text-sm font-bold text-slate-900">Daily Challenge</div>
          <div className="text-xs text-slate-500 mt-0.5">
            {isDailyDone ? '✓ Completed today' : '10 mixed words'}
          </div>
        </button>

        <button
          onClick={() => setSelectedMode('assignment')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedMode === 'assignment'
              ? 'bg-amber-50/80 border-amber-400 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <FileCheck className="w-5 h-5 text-blue-600 mb-2" />
          <div className="text-sm font-bold text-slate-900">Assignments</div>
          <div className="text-xs text-slate-500 mt-0.5">{assignments.length} assigned sets</div>
        </button>

        <button
          onClick={() => {
            onNavigate('competition');
          }}
          className="p-4 rounded-xl border bg-white border-slate-200 hover:border-slate-300 text-left transition-all cursor-pointer"
        >
          <Clock className="w-5 h-5 text-amber-500 mb-2" />
          <div className="text-sm font-bold text-slate-900">Competition Mode</div>
          <div className="text-xs text-slate-500 mt-0.5">Timed 45s rounds →</div>
        </button>

      </div>

      {/* Mode Configurations */}
      {selectedMode === 'quick' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Quick Drill Configuration</h2>
            <p className="text-xs text-slate-500">Pick length and difficulty for a fast session.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 mb-2 block">Number of Words</label>
              <div className="flex items-center gap-2">
                {[5, 10, 15, 20].map(count => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setWordCount(count)}
                    className={`px-4 py-2 rounded-xl font-mono font-medium transition-colors cursor-pointer ${
                      wordCount === count
                        ? 'bg-amber-500 text-slate-900 font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {count} Words
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 mb-2 block">Difficulty Level</label>
              <div className="flex flex-wrap items-center gap-2">
                {(['Mixed', 'Easy', 'Medium', 'Hard', 'Challenge'] as const).map(diff => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                      difficulty === diff
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-3.5 text-xs font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <span>Start Quick Drill ({wordCount} Words)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {selectedMode === 'focused' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Focused Practice Drill</h2>
            <p className="text-xs text-slate-500">Target a specific subject category and difficulty level.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Subject Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="All Categories">All Subject Categories</option>
                <option value="Science & Nature">Science & Nature</option>
                <option value="Governance & Law">Governance & Law</option>
                <option value="Technology">Technology</option>
                <option value="Environment">Environment</option>
                <option value="Health">Health</option>
                <option value="Literature & Arts">Literature & Arts</option>
                <option value="Academic Vocabulary">Academic Vocabulary</option>
                <option value="General Vocabulary">General Vocabulary</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Mixed">Mixed Difficulty</option>
                <option value="Beginner">Beginner</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Challenge">Challenge</option>
              </select>
            </div>
          </div>

          {/* Word Availability Feedback */}
          {matchingCheck.insufficient ? (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Only <strong>{matchingCheck.matchingCount} words</strong> currently match these filters. Would you like to practice all {matchingCheck.matchingCount}?
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 font-mono">
              ✓ {matchingCheck.matchingCount} matching words available.
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={matchingCheck.matchingCount === 0}
            className="w-full py-3.5 text-xs font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <span>Start Focused Session ({Math.min(wordCount, matchingCheck.matchingCount)} Words)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {selectedMode === 'mistakes' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Mistakes Review Mode</h2>
            <p className="text-xs text-slate-500">
              Spaced repetition prioritizing frequently missed letters and weak words.
            </p>
          </div>

          {mistakes.length > 0 ? (
            <div className="space-y-4">
              <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-900">
                You currently have <strong>{mistakes.length} flagged words</strong> waiting for re-practice. Words stay in this list until you spell them correctly multiple times.
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {mistakes.slice(0, 6).map(w => (
                  <span key={w.id} className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-mono text-slate-800">
                    {w.word}
                  </span>
                ))}
                {mistakes.length > 6 && (
                  <span className="text-xs text-slate-400 self-center">+{mistakes.length - 6} more</span>
                )}
              </div>

              <button
                onClick={handleStart}
                className="w-full py-3.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Drill Flagged Words ({mistakes.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <div className="text-sm font-bold text-slate-900">No pending mistakes!</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Excellent accuracy! When you miss a word in any practice or competition round, it will appear here for targeted drills.
              </p>
              <button
                onClick={() => setSelectedMode('quick')}
                className="px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 rounded-xl"
              >
                Try Quick Drill Instead
              </button>
            </div>
          )}
        </div>
      )}

      {selectedMode === 'daily' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Today's Daily Challenge</h2>
            <p className="text-xs text-slate-500">
              A curated 10-word drill generated daily. All secondary school candidates receive the same challenge for today.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Challenge Status:</span>
              {isDailyDone ? (
                <span className="font-semibold text-emerald-700">✓ Completed today ({dailyRecord?.score} pts · {dailyRecord?.accuracy}%)</span>
              ) : (
                <span className="text-amber-700 font-semibold">● Pending for today</span>
              )}
            </div>
            <div className="text-slate-500">
              10 Words · Mixed Difficulty · Awards +50 Streak XP Bonus
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-3.5 text-xs font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <span>{isDailyDone ? 'Practice Daily Challenge Again' : 'Start Today\'s 10-Word Challenge'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {selectedMode === 'assignment' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Teacher Assigned Word Sets</h2>
            <p className="text-xs text-slate-500">
              Homework and competition preparation drills assigned by your English teacher.
            </p>
          </div>

          {assignments.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {assignments.map(asg => (
                <div key={asg.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 text-sm">{asg.title}</div>
                    <div className="text-slate-500">{asg.description}</div>
                    <div className="text-slate-400">
                      Due {asg.dueDate} · {asg.wordCount} words · <DifficultyIndicator difficulty={asg.difficulty === 'Mixed' ? 'Medium' : asg.difficulty} />
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartAssignment(asg)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer"
                  >
                    Start Assignment →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-500">
              No active assignments currently pending.
            </div>
          )}
        </div>
      )}

    </div>
  );
};
