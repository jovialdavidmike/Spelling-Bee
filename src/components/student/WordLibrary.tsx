import React, { useState, useMemo } from 'react';
import { Word, DifficultyLevel, WordCategory, AppView } from '../../types';
import { dataService } from '../../services/dataService';
import { AudioButton } from '../common/AudioButton';
import { DifficultyIndicator } from '../common/DifficultyIndicator';
import { WordDetailModal } from './WordDetailModal';
import { EmptyState } from '../common/EmptyState';
import { Search, X, Filter, BookOpen, Zap, CheckCircle2, Bookmark, ArrowUpDown } from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
  onPracticeSingle?: (wordId: string) => void;
}

export const WordLibrary: React.FC<Props> = ({ onNavigate, onPracticeSingle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'alpha' | 'difficulty' | 'length'>('alpha');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [allWords, setAllWords] = useState<Word[]>(dataService.getWords());

  const difficulties: Array<'all' | DifficultyLevel> = ['all', 'Beginner', 'Easy', 'Medium', 'Hard', 'Challenge'];
  const categories: Array<'all' | WordCategory> = [
    'all',
    'General Vocabulary',
    'Science & Nature',
    'Literature & Arts',
    'Social Studies',
    'Technology',
    'Governance & Law',
    'Environment',
    'Health',
    'Academic Vocabulary'
  ];

  const filteredWords = useMemo(() => {
    let result = allWords.filter(item => {
      // Search query match
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.word.toLowerCase().includes(query) ||
        item.definition.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(query)));

      // Difficulty match
      const matchesDifficulty = selectedDifficulty === 'all' || item.difficulty === selectedDifficulty;

      // Category match
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

      // Status match
      let matchesStatus = true;
      if (selectedStatus === 'saved') {
        matchesStatus = dataService.isWordSaved(item.id);
      } else if (selectedStatus !== 'all') {
        matchesStatus = item.status === selectedStatus;
      }

      return matchesSearch && matchesDifficulty && matchesCategory && matchesStatus;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'alpha') {
        return a.word.localeCompare(b.word);
      } else if (sortBy === 'length') {
        return (a.letterCount || a.word.length) - (b.letterCount || b.word.length);
      } else if (sortBy === 'difficulty') {
        const order = { Beginner: 1, Easy: 2, Medium: 3, Hard: 4, Advanced: 5, Challenge: 6 };
        return (order[a.difficulty] || 3) - (order[b.difficulty] || 3);
      }
      return 0;
    });
  }, [allWords, searchQuery, selectedDifficulty, selectedCategory, selectedStatus, sortBy]);

  const handlePracticeWord = (wordId: string) => {
    if (onPracticeSingle) {
      onPracticeSingle(wordId);
    }
  };

  const handleMarkMastered = (wordId: string) => {
    dataService.markWordMastered(wordId);
    setAllWords([...dataService.getWords()]);
    if (selectedWord && selectedWord.id === wordId) {
      setSelectedWord({ ...selectedWord, status: 'mastered' });
    }
  };

  const handleToggleSave = (wordId: string) => {
    dataService.toggleSaveWord(wordId);
    setAllWords([...dataService.getWords()]);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDifficulty('all');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSortBy('alpha');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Word Library</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explore curated secondary-school vocabulary cards with pronunciation, syllable counts, and etymology.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-mono">
            Showing <strong className="text-slate-900">{filteredWords.length}</strong> of {allWords.length} words
          </span>
        </div>
      </div>

      {/* Search Bar & Filter Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search words, definitions, or tags (e.g. 'accom', 'double consonant', 'bio')..."
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Segmented Controls */}
        <div className="space-y-3 pt-1 border-t border-slate-100 text-xs">
          
          {/* Difficulty Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 font-semibold mr-1">Difficulty:</span>
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedDifficulty === diff
                    ? 'bg-amber-500 text-slate-900 font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {diff === 'all' ? 'All Difficulties' : diff}
              </button>
            ))}
          </div>

          {/* Category Dropdown & Quick Status */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-2">
              <label htmlFor="lib-cat-filter" className="text-slate-500 font-semibold">Category:</label>
              <select
                id="lib-cat-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Categories</option>
                {categories.filter(c => c !== 'all').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold mr-1">Status:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'mastered', label: 'Mastered' },
                { id: 'needsReview', label: 'Needs Review' },
                { id: 'practicing', label: 'Practicing' },
                { id: 'saved', label: '★ Saved' }
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStatus(st.id)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    selectedStatus === st.id
                      ? 'bg-slate-900 text-white font-medium'
                      : 'text-slate-500 hover:text-slate-900 bg-slate-50'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-slate-500 font-semibold flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Sort:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 focus:outline-none"
              >
                <option value="alpha">Alphabetical (A-Z)</option>
                <option value="difficulty">Difficulty Tier</option>
                <option value="length">Word Length</option>
              </select>
            </div>

            {(searchQuery || selectedDifficulty !== 'all' || selectedCategory !== 'all' || selectedStatus !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-amber-700 hover:text-amber-900 font-medium cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Word Cards Grid */}
      {filteredWords.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map((w) => {
            const isSaved = dataService.isWordSaved(w.id);
            return (
              <div
                key={w.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all p-5 flex flex-col justify-between space-y-4 group"
              >
                
                {/* Card Top */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate max-w-[130px]">{w.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-400">{w.letterCount || w.word.length}L</span>
                      <DifficultyIndicator difficulty={w.difficulty} />
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <button
                      onClick={() => setSelectedWord(w)}
                      className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors text-left cursor-pointer"
                    >
                      {w.word}
                    </button>
                    <span className="text-xs font-mono text-slate-400">{w.pronunciation}</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {w.definition}
                  </p>

                  {/* Status Indicator (Unboxed metadata) */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="capitalize">{w.status || 'new'}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleSave(w.id)}
                      className={`p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer ${
                        isSaved ? 'text-amber-600' : 'text-slate-300 hover:text-slate-500'
                      }`}
                      aria-label={isSaved ? 'Remove from practice later' : 'Save to practice later'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                  <AudioButton word={w.word} size="sm" allowSlowMode={false} />

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedWord(w)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handlePracticeWord(w.id)}
                      className="px-3 py-1 text-xs font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      Practice
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No words found"
          description={`We couldn’t find any spelling cards matching your search query "${searchQuery}" and active filters.`}
          actionLabel="Clear All Filters"
          onAction={clearFilters}
        />
      )}

      {/* Word Detail Modal */}
      {selectedWord && (
        <WordDetailModal
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
          onPracticeWord={handlePracticeWord}
          onMarkMastered={handleMarkMastered}
        />
      )}

    </div>
  );
};
