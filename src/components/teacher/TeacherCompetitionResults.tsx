import React, { useState } from 'react';
import { AppView, Competition, CompetitionResultSnapshot } from '../../types';
import { competitionService } from '../../services/competitionService';
import { voiceService } from '../../services/voiceService';
import {
  Trophy,
  Download,
  Printer,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Clock,
  TrendingUp,
  FileCheck,
  Zap,
  Volume2
} from 'lucide-react';

interface Props {
  competitionId?: string;
  onNavigate: (view: AppView) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const TeacherCompetitionResults: React.FC<Props> = ({
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
    return comps.find(c => c.status === 'completed') || comps[0];
  });

  const [snapshot, setSnapshot] = useState<CompetitionResultSnapshot | undefined>(() => {
    if (!competition) return undefined;
    const existing = competitionService.getCompetitionResults(competition.id)[0];
    if (existing) return existing;
    return competitionService.completeCompetition(competition.id);
  });

  const handleExportCSV = () => {
    if (!competition) return;
    const csv = competitionService.exportCompetitionResultsCSV(competition.id);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${competition.title.replace(/\s+/g, '_')}_Results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('CSV Report downloaded successfully!', 'success');
  };

  const handleCreateReviewAssignment = () => {
    if (!competition) return;
    const asg = competitionService.createPracticeAssignmentFromCompetitionMistakes(competition.id);
    if (asg) {
      onShowToast(`Created review assignment "${asg.title}" with missed words!`, 'success');
      onNavigate('teacher-assign');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!competition || !snapshot) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900">No Completed Competition Found</h2>
        <button
          onClick={() => onNavigate('teacher-competition')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
        >
          Back to Competition Arena
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 print:p-0">
      {/* Header & Export Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:border-none print:shadow-none">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full">
              OFFICIAL HEAT RESULTS
            </span>
            <span className="text-xs text-slate-500">{snapshot.date}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {snapshot.competitionTitle}
          </h1>
          <p className="text-xs text-slate-500">
            Cohort: <strong className="text-slate-700">{snapshot.className}</strong> • Mode: {snapshot.mode.replace('_', ' ')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 print:hidden">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Standings
          </button>

          <button
            onClick={handleCreateReviewAssignment}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            Create Remedial Assignment
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm text-center">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-4 h-4" />
          </div>
          <div className="text-lg font-bold text-slate-900 truncate">
            {snapshot.winnerStudentName || 'N/A'}
          </div>
          <div className="text-xs text-slate-500">1st Place Speller</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm text-center">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {snapshot.averageAccuracy}%
          </div>
          <div className="text-xs text-slate-500">Average Heat Accuracy</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm text-center">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {snapshot.qualifiedParticipants}
          </div>
          <div className="text-xs text-slate-500">Spellers Qualified</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm text-center">
          <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {snapshot.averageResponseTimeSec}s
          </div>
          <div className="text-xs text-slate-500">Avg Response Time</div>
        </div>
      </div>

      {/* Standings Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Final Standings & Leaderboard
          </h3>
          <span className="text-xs text-slate-500">
            {snapshot.standings.length} participants evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Rank</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Candidate Code</th>
                <th className="px-5 py-3">Final Score</th>
                <th className="px-5 py-3">Accuracy</th>
                <th className="px-5 py-3">Correct / Missed</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {snapshot.standings.map((row) => (
                <tr key={row.studentId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    {row.rank === 1 ? (
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-xs shadow-xs">
                        1
                      </span>
                    ) : row.rank === 2 ? (
                      <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-bold flex items-center justify-center text-xs">
                        2
                      </span>
                    ) : row.rank === 3 ? (
                      <span className="w-6 h-6 rounded-full bg-amber-700/30 text-amber-900 font-bold flex items-center justify-center text-xs">
                        3
                      </span>
                    ) : (
                      <span className="text-slate-500 font-mono pl-2">{row.rank}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-slate-900">{row.studentName}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-400">{row.studentCode}</td>
                  <td className="px-5 py-3.5 font-bold text-indigo-700 font-mono">{row.finalScore} pts</td>
                  <td className="px-5 py-3.5 font-bold text-slate-800">{row.finalAccuracy}%</td>
                  <td className="px-5 py-3.5 text-slate-600">
                    <span className="text-emerald-700 font-semibold">{row.correctCount}</span> /{' '}
                    <span className="text-rose-600 font-semibold">{row.incorrectCount + row.timeoutCount}</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-500">{row.totalDurationSeconds}s</td>
                  <td className="px-5 py-3.5">
                    {row.qualificationStatus === 'qualified' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Qualified ✓
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                        Concluded
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Most Missed Words Analytics */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Highest-Frequency Missed Words
            </h3>
            <p className="text-xs text-slate-500">
              Words that posed the greatest challenge across participants in this competition.
            </p>
          </div>
          <button
            onClick={handleCreateReviewAssignment}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            Assign as Class Drill
          </button>
        </div>

        {snapshot.mostMissedWords.length === 0 ? (
          <div className="text-xs text-slate-400 py-4 text-center">
            No frequent errors recorded for this competition heat.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {snapshot.mostMissedWords.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-xs">{item.word}</div>
                  <div className="text-[11px] text-rose-600 font-medium">Missed by {item.missedCount} spellers</div>
                </div>
                <button
                  onClick={() => voiceService.playWord(item.word)}
                  className="p-1.5 rounded-lg bg-white text-indigo-600 hover:bg-indigo-50 shadow-2xs"
                  title="Hear pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Return Button */}
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={() => onNavigate('teacher-competition')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Competition Hub
        </button>
      </div>
    </div>
  );
};
