import React, { useState } from 'react';
import { Word, AppView, SessionSettings } from '../../types';
import { dataService } from '../../services/dataService';
import { masteryService } from '../../services/masteryService';
import { AudioButton } from '../common/AudioButton';
import { DifficultyIndicator } from '../common/DifficultyIndicator';
import { EmptyState } from '../common/EmptyState';
import {
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  Zap,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
  onLaunchPractice?: (settings: SessionSettings, wordIds?: string[], title?: string) => void;
}

export const MistakesReview: React.FC<Props> = ({ onNavigate, onLaunchPractice }) => {
  const [mistakes, setMistakes] = useState<Word[]>(
    masteryService.prioritizeMistakes(dataService.getMistakes())
  );

  const handleClearMistake = (wordId: string) => {
    dataService.resolveMistake(wordId);
    setMistakes(masteryService.prioritizeMistakes(dataService.getMistakes()));
  };

  const handlePracticeAll = () => {
    if (mistakes.length === 0) return;
    const ids = mistakes.map(m => m.id);

    if (onLaunchPractice) {
      onLaunchPractice({
        mode: 'mistakes',
        wordCount: ids.length,
        difficulty: 'Mixed',
        category: 'All Categories',
        allowSkip: true,
        allowRetry: true,
        showDefinitionAfterAnswer: true,
        showExampleAfterAnswer: true,
        scoringRule: 'standard'
      }, ids, 'Mistakes Review Drill');
    } else {
      onNavigate('practice');
    }
  };

  const handlePracticeSingle = (wordId: string) => {
    if (onLaunchPractice) {
      onLaunchPractice({
        mode: 'single',
        wordCount: 1,
        difficulty: 'Mixed',
        category: 'All Categories',
        allowSkip: false,
        allowRetry: true,
        showDefinitionAfterAnswer: true,
        showExampleAfterAnswer: true,
        scoringRule: 'standard'
      }, [wordId], 'Single Word Review');
    } else {
      onNavigate('practice');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Review Your Mistakes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Focus on words that need another look. Prioritized by error frequency and low accuracy.
          </p>
        </div>

        {mistakes.length > 0 && (
          <button
            onClick={handlePracticeAll}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Zap className="w-4 h-4" />
            <span>Practice All {mistakes.length} Flagged Words</span>
          </button>
        )}
      </div>

      {/* Summary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Flagged Words</div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-rose-600 mt-1">
            {mistakes.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting re-practice</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Mastery Rule</div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 mt-1">
            3x Correct
          </div>
          <div className="text-[11px] text-slate-400 mt-1">80%+ accuracy threshold</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Review Velocity</div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 mt-1">
            +84%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Recovery rate upon 2nd attempt</div>
        </div>
      </div>

      {/* Mistakes List */}
      {mistakes.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Prioritized Review Queue ({mistakes.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mistakes.map((word) => {
              const record = masteryService.getRecord(word.id);
              return (
                <div
                  key={word.id}
                  className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="truncate max-w-[150px]">{word.category}</span>
                      <DifficultyIndicator difficulty={word.difficulty} />
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <h3 className="text-xl font-bold text-slate-900">{word.word}</h3>
                      <span className="text-xs font-mono text-slate-400">{word.pronunciation}</span>
                    </div>

                    {record.lastMistakeAnswer && (
                      <div className="text-xs text-slate-600 bg-rose-50/70 p-2 rounded-lg border border-rose-200/60 flex items-center justify-between">
                        <span>Last attempt: <span className="line-through font-mono font-bold text-rose-700">{record.lastMistakeAnswer}</span></span>
                        <span className="text-[11px] text-rose-800 font-medium">{record.incorrectCount} misspellings</span>
                      </div>
                    )}

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {word.definition}
                    </p>

                    {word.tips && (
                      <div className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200/70">
                        <strong>Tip: </strong>{word.tips}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                    <AudioButton word={word.word} size="sm" allowSlowMode={true} />

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleClearMistake(word.id)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        title="Mark as resolved"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => handlePracticeSingle(word.id)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        Practice Now
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={CheckCircle2}
          title="No pending mistakes!"
          description="Great work! Once you misspell a word during a drill or competition, it will automatically appear here for spaced repetition."
          actionLabel="Start a Quick Practice Drill"
          onAction={() => onNavigate('practice-setup')}
        />
      )}

    </div>
  );
};
