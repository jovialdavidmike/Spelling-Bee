import React, { useState } from 'react';
import { AppView, WordSet } from '../../types';
import { dataService } from '../../services/dataService';
import { DifficultyIndicator } from '../common/DifficultyIndicator';
import { FolderTree, Plus, BookOpen, Users, Check, X } from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
  onShowToast: (msg: string) => void;
}

export const TeacherWordSets: React.FC<Props> = ({ onNavigate, onShowToast }) => {
  const [wordSets, setWordSets] = useState<WordSet[]>(dataService.getWordSets());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('General Vocabulary');

  const handleCreateSet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = dataService.createWordSet({
      title: newTitle.trim(),
      description: newDescription.trim() || 'Teacher created vocabulary bank.',
      wordCount: 20,
      difficulty: 'Medium',
      category: newCategory,
      tags: ['Custom Set', 'Class Drill'],
      wordIds: ['w1', 'w2', 'w3', 'w4']
    });

    setWordSets(dataService.getWordSets());
    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
    onShowToast(`Word Set "${created.title}" created!`);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Curated Word Sets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organized thematic vocabularies for class drills, mock heats, and inter-house spelling competitions.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Word Set</span>
        </button>
      </div>

      {/* Grid of Sets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wordSets.map((set) => (
          <div
            key={set.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 p-6 flex flex-col justify-between space-y-4 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{set.category}</span>
                <span className="font-mono text-slate-700 font-semibold">{set.wordCount} words</span>
              </div>

              <h2 className="text-lg font-bold text-slate-900">{set.title}</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{set.description}</p>

              {/* Tags (Zero-Pill discipline: unboxed text with separators) */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-2 text-[11px] text-slate-500">
                {set.tags.map((tag, idx) => (
                  <React.Fragment key={tag}>
                    <span>{tag}</span>
                    {idx < set.tags.length - 1 && <span aria-hidden="true">·</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <div className="text-slate-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{set.studentsAssigned} students practicing</span>
              </div>

              <button
                onClick={() => {
                  onShowToast(`Word set "${set.title}" assigned to current class.`);
                }}
                className="px-3 py-1 font-medium text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
              >
                Assign Set →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Create New Curated Word Set</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSet} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-800">Set Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. SS 2 Advanced Civic & Legal Terms"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Target vocabulary focus..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="General Vocabulary">General Vocabulary</option>
                  <option value="Science & Nature">Science & Nature</option>
                  <option value="Governance & Law">Governance & Law</option>
                  <option value="Technology">Technology</option>
                  <option value="Literature & Arts">Literature & Arts</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs cursor-pointer"
                >
                  Create Word Set
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
