import React, { useState } from 'react';
import { Word } from '../../types';
import { dataService } from '../../services/dataService';
import { AudioButton } from '../common/AudioButton';
import { DifficultyIndicator } from '../common/DifficultyIndicator';
import { X, Check, BookOpen, Zap, Bookmark, AlertCircle } from 'lucide-react';

interface Props {
  word: Word | null;
  onClose: () => void;
  onPracticeWord: (wordId: string) => void;
  onMarkMastered: (wordId: string) => void;
}

export const WordDetailModal: React.FC<Props> = ({
  word,
  onClose,
  onPracticeWord,
  onMarkMastered
}) => {
  if (!word) return null;

  const [isSaved, setIsSaved] = useState(dataService.isWordSaved(word.id));

  const handleToggleSaved = () => {
    const updated = dataService.toggleSaveWord(word.id);
    setIsSaved(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close word details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Word Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">{word.category}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <DifficultyIndicator difficulty={word.difficulty} />
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-xs text-slate-400 font-mono">{word.letterCount || word.word.length} letters</span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{word.word}</h2>
            <span className="text-sm font-mono text-slate-500">{word.pronunciation}</span>
          </div>

          {word.phoneticSpelling && (
            <div className="text-xs text-slate-500">
              Phonetic breakdown: <span className="font-medium text-slate-700">{word.phoneticSpelling}</span>
            </div>
          )}

          <div className="pt-2">
            <AudioButton word={word.word} size="sm" />
          </div>
        </div>

        {/* Linguistic Details */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 space-y-3 text-xs text-slate-700">
          <div>
            <strong className="text-slate-900">Part of Speech: </strong>
            <span className="italic">{word.partOfSpeech}</span>
          </div>

          <div>
            <strong className="text-slate-900">Definition: </strong>
            <span className="leading-relaxed">{word.definition}</span>
          </div>

          <div>
            <strong className="text-slate-900">Example Sentence: </strong>
            <span className="italic text-slate-600">"{word.exampleSentence}"</span>
          </div>

          {word.origin && (
            <div className="text-slate-500 pt-1 border-t border-slate-200/60">
              <strong className="text-slate-800">Origin & Roots: </strong>
              {word.origin}
            </div>
          )}

          {word.tips && (
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/70 text-amber-900 text-[11px]">
              <strong>Spelling Tip: </strong>{word.tips}
            </div>
          )}
        </div>

        {/* Practice Stats */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div>
            Learning Status: <span className="font-semibold capitalize text-slate-800">{word.status || 'new'}</span>
          </div>
          <button
            onClick={handleToggleSaved}
            className={`inline-flex items-center gap-1 font-medium transition-colors cursor-pointer ${
              isSaved ? 'text-amber-700' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>{isSaved ? 'Saved for Later' : 'Save for Later'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => {
              onPracticeWord(word.id);
              onClose();
            }}
            className="flex-1 py-3 text-xs font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Zap className="w-4 h-4" />
            <span>Practice This Single Word Now</span>
          </button>

          <button
            onClick={() => {
              onMarkMastered(word.id);
            }}
            className="px-4 py-3 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Mark Mastered</span>
          </button>
        </div>

      </div>
    </div>
  );
};
