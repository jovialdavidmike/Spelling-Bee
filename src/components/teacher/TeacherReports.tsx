import React, { useState } from 'react';
import { AppView } from '../../types';
import { dataService } from '../../services/dataService';
import {
  BarChart3,
  TrendingUp,
  Download,
  AlertTriangle,
  CheckCircle2,
  Zap,
  School,
  ArrowRight,
  Filter
} from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
  onShowToast: (msg: string) => void;
  onLaunchTargetedAssign?: (wordIds: string[]) => void;
}

export const TeacherReports: React.FC<Props> = ({
  onNavigate,
  onShowToast,
  onLaunchTargetedAssign
}) => {
  const [selectedClassId, setSelectedClassId] = useState('all');
  const classes = dataService.getClasses();
  const students = dataService.getTeacherStudents();
  const assignments = dataService.getAssignments();

  const mostMissed = dataService.getMostMissedWords(selectedClassId === 'all' ? undefined : selectedClassId, 6);

  const filteredStudents = selectedClassId === 'all'
    ? students
    : students.filter(s => s.classId === selectedClassId || s.className.includes(selectedClassId));

  const avgAccuracy = Math.round(
    filteredStudents.reduce((acc, s) => acc + s.accuracy, 0) / Math.max(1, filteredStudents.length)
  );

  const totalWords = filteredStudents.reduce((acc, s) => acc + s.wordsPracticed, 0);

  const handleExport = () => {
    const csvData = dataService.exportClassResultsCSV(selectedClassId);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `spellready_analytics_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Exported class analytics report to CSV.');
  };

  const handleCreateAssignmentFromWeakWords = () => {
    const wordIds = mostMissed.map(m => m.word.id);
    if (wordIds.length === 0) {
      onShowToast('No recorded mistake words found.');
      return;
    }

    if (onLaunchTargetedAssign) {
      onLaunchTargetedAssign(wordIds);
    } else {
      dataService.createTargetedAssignmentFromWeakWords(
        selectedClassId === 'all' ? classes[0]?.id || 'class_ss1_gold' : selectedClassId,
        wordIds,
        `Targeted Remedial: Top Missed Words`
      );
      onShowToast(`Created targeted practice drill with ${wordIds.length} weak words!`);
      onNavigate('teacher-dashboard');
    }
  };

  return (
    <div className="space-y-8 pb-12 text-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Class Spelling Analytics & Mistake Diagnosis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Diagnostic insights into cohort error rates, most missed vocabulary, and targeted remedial loops.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="text-xs bg-transparent focus:outline-none text-slate-800 font-medium"
            >
              <option value="all">All School Cohorts</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExport}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Cohort Accuracy</div>
          <div className="text-3xl font-bold font-mono text-slate-900 mt-1">{avgAccuracy}%</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Across {filteredStudents.length} candidates</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Words Drilled</div>
          <div className="text-3xl font-bold font-mono text-indigo-700 mt-1">{totalWords.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 mt-1">Total student attempts</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Active Assignments</div>
          <div className="text-3xl font-bold font-mono text-slate-900 mt-1">{assignments.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Published sets</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Contest Ready Candidates</div>
          <div className="text-3xl font-bold font-mono text-amber-600 mt-1">
            {filteredStudents.filter(s => s.accuracy >= 85).length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Over 85% accuracy</div>
        </div>
      </div>

      {/* TARGETED TEACHING LOOP: MOST MISSED WORDS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h2 className="text-base font-bold text-slate-900">Highest Error-Rate Words (Class Mistake Diagnosis)</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              These words triggered the most spelling errors across homework drills and timed mock bee tests.
            </p>
          </div>

          <button
            onClick={handleCreateAssignmentFromWeakWords}
            className="px-4 py-2 font-semibold text-xs text-slate-900 bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Create Assignment from These Words</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {mostMissed.map(item => (
            <div
              key={item.word.id}
              className="p-4 rounded-xl border border-rose-200/70 bg-rose-50/30 flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-slate-900 text-sm">{item.word.word}</span>
                  <span className="font-mono text-slate-400 text-[11px]">{item.word.pronunciation}</span>
                </div>
                <div className="text-slate-600 text-[11px] line-clamp-1">{item.word.definition}</div>
                <div className="text-[11px] text-slate-500">
                  Students struggling: <span className="font-medium text-slate-700">{item.studentNames.join(', ')}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="px-2 py-1 rounded bg-rose-100 text-rose-800 font-mono font-bold text-xs block">
                  {item.missedCount} Misses
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Tier: {item.word.difficulty}</span>
              </div>
            </div>
          ))}

          {mostMissed.length === 0 && (
            <div className="col-span-2 py-8 text-center text-slate-500">
              Great news! No high-frequency mistakes recorded for this class cohort yet.
            </div>
          )}
        </div>
      </div>

      {/* STUDENT PROGRESSION TABLE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Student Improvement & Status Tracking</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Class</th>
                <th className="py-2.5 px-3 text-right">Words Practiced</th>
                <th className="py-2.5 px-3 text-right">Accuracy</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.map(st => (
                <tr key={st.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{st.name}</td>
                  <td className="py-2.5 px-3 text-slate-600">{st.className}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{st.wordsPracticed}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold">
                    <span className={st.accuracy >= 85 ? 'text-emerald-700' : 'text-amber-700'}>
                      {st.accuracy}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      st.status === 'Strong' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {st.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onNavigate('teacher-students')}
                      className="font-semibold text-indigo-700 hover:text-indigo-900"
                    >
                      Manage →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
