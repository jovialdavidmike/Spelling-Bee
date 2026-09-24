import React, { useState, useEffect } from 'react';
import {
  AppView,
  DifficultyLevel,
  WordCategory,
  Word,
  ClassRoom,
  TeacherAssignment
} from '../../types';
import { dataService } from '../../services/dataService';
import { voiceService } from '../../services/voiceService';
import {
  FileCheck,
  ArrowLeft,
  Save,
  PlusCircle,
  Check,
  Eye,
  Search,
  AlertCircle,
  Volume2,
  X,
  Sparkles,
  Lock,
  Layers,
  HelpCircle,
  Plus
} from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
  onShowToast: (msg: string) => void;
  initialWordIds?: string[];
  initialTitle?: string;
  initialClassId?: string;
}

export const TeacherAssignPractice: React.FC<Props> = ({
  onNavigate,
  onShowToast,
  initialWordIds,
  initialTitle,
  initialClassId
}) => {
  const classes = dataService.getClasses();
  const allLibraryWords = dataService.getWords();

  // Assignment details
  const [title, setTitle] = useState(initialTitle || '');
  const [description, setDescription] = useState('');
  const [targetClassId, setTargetClassId] = useState(initialClassId || (classes[0]?.id ?? 'class_ss1_gold'));
  const [mode, setMode] = useState<'practice' | 'assessment' | 'competition' | 'review'>('practice');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  // Selected words
  const [selectedWordIds, setSelectedWordIds] = useState<string[]>(initialWordIds || ['w1', 'w2', 'w3', 'w5', 'w7']);
  const [wordSearch, setWordSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | DifficultyLevel>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | WordCategory>('all');
  const [showOnlyWeakWords, setShowOnlyWeakWords] = useState(false);

  // Settings
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);
  const [attemptsAllowed, setAttemptsAllowed] = useState(2);
  const [randomizeWords, setRandomizeWords] = useState(true);
  const [allowReplay, setAllowReplay] = useState(true);
  const [allowDefinition, setAllowDefinition] = useState(true);
  const [allowExample, setAllowExample] = useState(true);
  const [immediateFeedback, setImmediateFeedback] = useState(true);
  const [passingScore, setPassingScore] = useState(70);
  const [allowLateSubmission, setAllowLateSubmission] = useState(true);

  // Custom word modal
  const [isCustomWordModalOpen, setIsCustomWordModalOpen] = useState(false);
  const [customWordText, setCustomWordText] = useState('');
  const [customWordDefinition, setCustomWordDefinition] = useState('');
  const [customWordExample, setCustomWordExample] = useState('');
  const [customWordDifficulty, setCustomWordDifficulty] = useState<DifficultyLevel>('Medium');
  const [customWordCategory, setCustomWordCategory] = useState<WordCategory>('General Vocabulary');

  // Preview modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewWordIndex, setPreviewWordIndex] = useState(0);

  // Handle mode constraints
  useEffect(() => {
    if (mode === 'competition') {
      setAllowDefinition(false);
      setAllowExample(false);
      setImmediateFeedback(false);
      setAttemptsAllowed(1);
    } else if (mode === 'assessment') {
      setAllowDefinition(false);
      setAllowExample(false);
      setImmediateFeedback(false);
      setAttemptsAllowed(1);
    } else if (mode === 'practice') {
      setAllowDefinition(true);
      setAllowExample(true);
      setImmediateFeedback(true);
      setAttemptsAllowed(3);
    }
  }, [mode]);

  // Find target class object
  const currentClass = classes.find(c => c.id === targetClassId) || classes[0];

  // Most missed words
  const mostMissed = dataService.getMostMissedWords(targetClassId);
  const mostMissedIds = mostMissed.map(m => m.word.id);

  // Filtered words for selection
  const filteredWords = allLibraryWords.filter(w => {
    const matchesSearch = w.word.toLowerCase().includes(wordSearch.toLowerCase()) || w.definition.toLowerCase().includes(wordSearch.toLowerCase());
    const matchesDiff = difficultyFilter === 'all' || w.difficulty === difficultyFilter;
    const matchesCat = categoryFilter === 'all' || w.category === categoryFilter;
    const matchesWeak = !showOnlyWeakWords || mostMissedIds.includes(w.id);
    return matchesSearch && matchesDiff && matchesCat && matchesWeak;
  });

  const toggleSelectWord = (wordId: string) => {
    setSelectedWordIds(prev =>
      prev.includes(wordId) ? prev.filter(id => id !== wordId) : [...prev, wordId]
    );
  };

  const handleSelectAllFiltered = () => {
    const idsToAdd = filteredWords.map(w => w.id).filter(id => !selectedWordIds.includes(id));
    setSelectedWordIds(prev => [...prev, ...idsToAdd]);
  };

  const handleDeselectAll = () => {
    setSelectedWordIds([]);
  };

  const handleAddCustomWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customWordText.trim() || !customWordDefinition.trim()) return;

    const newWord = dataService.addCustomWord({
      word: customWordText.trim().toLowerCase(),
      normalizedWord: customWordText.trim().toLowerCase(),
      definition: customWordDefinition.trim(),
      exampleSentence: customWordExample.trim() || `The speller correctly identified ${customWordText.trim()}.`,
      partOfSpeech: 'noun',
      difficulty: customWordDifficulty,
      category: customWordCategory,
      pronunciation: `/${customWordText.trim().toLowerCase()}/`
    });

    setSelectedWordIds(prev => [...prev, newWord.id]);
    onShowToast(`Custom word "${newWord.word}" added to assignment!`);
    setIsCustomWordModalOpen(false);
    setCustomWordText('');
    setCustomWordDefinition('');
    setCustomWordExample('');
  };

  const handleSave = (status: 'active' | 'draft') => {
    if (!title.trim()) {
      onShowToast('Please provide an assignment title.');
      return;
    }
    if (selectedWordIds.length === 0) {
      onShowToast('Please select at least 1 word for this assignment.');
      return;
    }
    if (new Date(dueDate) < new Date(startDate)) {
      onShowToast('Due date cannot be earlier than start date.');
      return;
    }

    dataService.createAssignment({
      title: title.trim(),
      description: description.trim() || 'Class spelling practice set.',
      targetClass: currentClass ? currentClass.name : 'All Classes',
      classId: currentClass ? currentClass.id : undefined,
      wordCount: selectedWordIds.length,
      difficulty: 'Mixed',
      category: 'All Categories',
      startDate,
      dueDate,
      timeLimitMinutes,
      mode,
      status,
      settings: {
        attemptsAllowed,
        timeLimitMinutes,
        randomizeWords,
        allowReplay,
        allowDefinition,
        allowExample,
        immediateFeedback,
        passingScore,
        allowLateSubmission
      },
      wordIds: selectedWordIds
    });

    onShowToast(
      status === 'active'
        ? `Assignment "${title}" published to ${currentClass ? currentClass.name : 'students'}!`
        : `Assignment draft "${title}" saved.`
    );
    onNavigate('teacher-dashboard');
  };

  // Preview speak
  const handlePreviewSpeak = (word: string) => {
    voiceService.speakWordPrompt(word, mode);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 text-xs">
      
      {/* Back button */}
      <button
        onClick={() => onNavigate('teacher-dashboard')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium py-1 px-2 rounded hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Dashboard</span>
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Create Spelling Assignment
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build curriculum-aligned drills, timed assessments, or competition simulations with custom voice rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setPreviewWordIndex(0); setIsPreviewOpen(true); }}
            disabled={selectedWordIds.length === 0}
            className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview as Student</span>
          </button>
        </div>
      </div>

      {/* FORM BODY */}
      <div className="space-y-6">
        
        {/* STEP 1: ASSIGNMENT INFORMATION & MODE */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center justify-center">1</span>
            <span>Assignment Information & Mode</span>
          </h2>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-800">Assignment Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. SS 1 Mid-Term Competition Qualifier Drill"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-800">Instructions / Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Focus on double consonants, silent letters, and Latin roots..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1">
                <label className="font-semibold text-slate-800">Target Class</label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Mode Selector */}
            <div className="space-y-1.5 pt-2">
              <label className="font-semibold text-slate-800">Assignment Delivery Mode</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'practice', label: 'Practice Mode', desc: 'Hear word, definition, repeat audio, retry on mistakes.' },
                  { id: 'assessment', label: 'Assessment Test', desc: 'Single attempt, strict answer hiding until completed.' },
                  { id: 'competition', label: 'Competition Bee', desc: 'Timed 45s rounds, simulated podium instructions.' },
                  { id: 'review', label: 'Remedial Review', desc: 'Targeted drill focusing on previously missed words.' }
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      mode === m.id
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-slate-900">{m.label}</div>
                    <div className="text-[10px] text-slate-500 mt-1 leading-snug">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* STEP 2: WORD SELECTION & CUSTOM WORDS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center justify-center">2</span>
              <span>Word Selection ({selectedWordIds.length} words chosen)</span>
            </h2>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCustomWordModalOpen(true)}
                className="px-3 py-1.5 font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Custom Word</span>
              </button>

              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="px-2.5 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Select Filtered
              </button>

              <button
                type="button"
                onClick={handleDeselectAll}
                className="px-2.5 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div className="relative sm:col-span-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={wordSearch}
                onChange={(e) => setWordSearch(e.target.value)}
                placeholder="Search word or definition..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Challenge">Challenge</option>
              </select>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowOnlyWeakWords(!showOnlyWeakWords)}
                className={`w-full p-2 rounded-xl border text-center font-semibold transition-colors cursor-pointer ${
                  showOnlyWeakWords
                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {showOnlyWeakWords ? '✓ Class Mistake Words' : 'Filter Mistake Words'}
              </button>
            </div>
          </div>

          {/* Word Selection List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl p-1 bg-slate-50/50">
            {filteredWords.map(w => {
              const isSelected = selectedWordIds.includes(w.id);
              const isWeak = mostMissedIds.includes(w.id);

              return (
                <div
                  key={w.id}
                  onClick={() => toggleSelectWord(w.id)}
                  className={`p-2.5 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-50/70 border border-indigo-200' : 'hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // handled by parent div onClick
                      className="rounded accent-indigo-600 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{w.word}</span>
                        <span className="font-mono text-[11px] text-slate-400">{w.pronunciation}</span>
                        {isWeak && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800">
                            Class Weak Word
                          </span>
                        )}
                        {w.tags?.includes('Teacher-created content') && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                            Teacher Custom
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{w.definition}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded bg-slate-100 font-medium">
                      {w.difficulty}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); voiceService.playWord(w.word); }}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
                      title="Listen"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 3: CONTROLS & SECURITY SETTINGS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center justify-center">3</span>
            <span>Security, Timing & Voice Rules</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="space-y-1">
              <label className="font-semibold text-slate-800">Time Limit per Session</label>
              <select
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={20}>20 Minutes</option>
                <option value={30}>30 Minutes</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-800">Attempts Allowed</label>
              <select
                disabled={mode === 'assessment' || mode === 'competition'}
                value={attemptsAllowed}
                onChange={(e) => setAttemptsAllowed(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-50"
              >
                <option value={1}>1 Attempt Only (Strict)</option>
                <option value={2}>2 Attempts</option>
                <option value={3}>3 Attempts (Practice)</option>
              </select>
              {(mode === 'assessment' || mode === 'competition') && (
                <span className="text-[10px] text-amber-600 block">Locked to 1 attempt for {mode} mode.</span>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-800">Passing Score (%)</label>
              <input
                type="number"
                min={50}
                max={100}
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={randomizeWords}
                onChange={(e) => setRandomizeWords(e.target.checked)}
                className="rounded accent-indigo-600"
              />
              <div>
                <span className="font-semibold text-slate-800 block">Randomize Word Order</span>
                <span className="text-[10px] text-slate-500">Each student gets a shuffled word sequence</span>
              </div>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={allowLateSubmission}
                onChange={(e) => setAllowLateSubmission(e.target.checked)}
                className="rounded accent-indigo-600"
              />
              <div>
                <span className="font-semibold text-slate-800 block">Allow Late Submissions</span>
                <span className="text-[10px] text-slate-500">Submissions after deadline flagged as 'Late'</span>
              </div>
            </label>
          </div>

        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center justify-between gap-3 pt-3">
          <button
            type="button"
            onClick={() => onNavigate('teacher-dashboard')}
            className="px-4 py-2.5 font-medium text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave('draft')}
              className="px-4 py-2.5 font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
            >
              Save as Draft
            </button>

            <button
              type="button"
              onClick={() => handleSave('active')}
              className="px-6 py-2.5 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>Publish Assignment</span>
            </button>
          </div>
        </div>

      </div>

      {/* MODAL 1: ADD CUSTOM WORD */}
      {isCustomWordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Add Custom Spelling Word</h2>
              <button onClick={() => setIsCustomWordModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleAddCustomWord} className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Word *</label>
                <input
                  type="text"
                  required
                  value={customWordText}
                  onChange={(e) => setCustomWordText(e.target.value)}
                  placeholder="e.g. photosynthesis"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Definition *</label>
                <textarea
                  rows={2}
                  required
                  value={customWordDefinition}
                  onChange={(e) => setCustomWordDefinition(e.target.value)}
                  placeholder="The biological process where plants convert solar light into chemical energy..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Example Sentence</label>
                <input
                  type="text"
                  value={customWordExample}
                  onChange={(e) => setCustomWordExample(e.target.value)}
                  placeholder="Leaves contain chlorophyll which is vital for photosynthesis."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Difficulty</label>
                  <select
                    value={customWordDifficulty}
                    onChange={(e) => setCustomWordDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Challenge">Challenge</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Category</label>
                  <select
                    value={customWordCategory}
                    onChange={(e) => setCustomWordCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="General Vocabulary">General Vocabulary</option>
                    <option value="Science & Nature">Science & Nature</option>
                    <option value="Governance & Law">Governance & Law</option>
                    <option value="Technology">Technology</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomWordModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Add to Word List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: STUDENT EXPERIENCE PREVIEW */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5 text-center">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                Teacher Preview Mode ({mode.toUpperCase()})
              </span>
              <button onClick={() => setIsPreviewOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            {selectedWordIds.length > 0 && (
              (() => {
                const previewWord = dataService.getWordById(selectedWordIds[previewWordIndex]) || allLibraryWords[0];
                return (
                  <div className="space-y-4 py-2">
                    <div className="text-xs text-slate-500 font-mono">
                      Word {previewWordIndex + 1} of {selectedWordIds.length}
                    </div>

                    <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                      <Volume2 className="w-8 h-8" />
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => handlePreviewSpeak(previewWord.word)}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold flex items-center gap-2 mx-auto cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Hear Pronunciation</span>
                      </button>
                    </div>

                    {mode === 'practice' && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-left text-xs space-y-1">
                        <div><strong>Definition:</strong> {previewWord.definition}</div>
                        <div><strong>Example:</strong> "{previewWord.exampleSentence}"</div>
                      </div>
                    )}

                    {(mode === 'assessment' || mode === 'competition') && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-left">
                        <Lock className="w-4 h-4 inline mr-1 text-amber-600" />
                        In {mode} mode, definitions and written spellings remain hidden until final submission.
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <button
                        type="button"
                        disabled={previewWordIndex === 0}
                        onClick={() => setPreviewWordIndex(i => i - 1)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40"
                      >
                        Previous Word
                      </button>

                      <button
                        type="button"
                        disabled={previewWordIndex >= selectedWordIds.length - 1}
                        onClick={() => setPreviewWordIndex(i => i + 1)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold disabled:opacity-40"
                      >
                        Next Word →
                      </button>
                    </div>
                  </div>
                );
              })()
            )}

            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Close Preview
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
