import React, { useState } from 'react';
import { AppView } from '../../types';
import { dataService } from '../../services/dataService';
import { Trophy, Medal, Flame, ShieldAlert, Users } from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
}

export const LeaderboardView: React.FC<Props> = ({ onNavigate }) => {
  const [classFilter, setClassFilter] = useState<'all' | 'JSS 3' | 'SS 1' | 'SS 2'>('all');
  const leaderboard = dataService.getLeaderboard();

  const filteredLeaderboard = leaderboard.filter(entry => {
    if (classFilter === 'all') return true;
    return entry.className.includes(classFilter);
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Student Practice Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Celebrating consistent spelling practice, competition accuracy, and learning diligence across secondary schools.
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto text-xs">
          {(['all', 'JSS 3', 'SS 1', 'SS 2'] as const).map((cls) => (
            <button
              key={cls}
              onClick={() => setClassFilter(cls)}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                classFilter === cls
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cls === 'all' ? 'All Classes' : cls}
            </button>
          ))}
        </div>
      </div>

      {/* Privacy Notice Card */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-600 flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0" />
        <span>
          <strong>Privacy Safeguard:</strong> This prototype displays fictional placeholder student names. Student personal details (emails, phone numbers, addresses) are strictly protected.
        </span>
      </div>

      {/* Leaderboard Table (Responsive: Table on Desktop, Cards on Mobile) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-500">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Rank</th>
                <th className="py-3 px-4">Student & School</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4 text-right">Words Drilled</th>
                <th className="py-3 px-4 text-right">Accuracy</th>
                <th className="py-3 px-4 text-right">Streak</th>
                <th className="py-3 px-4 text-right">XP Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeaderboard.map((row) => {
                const isTop3 = row.rank <= 3;
                return (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-center">
                      {row.rank === 1 && <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">🥇 1</span>}
                      {row.rank === 2 && <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs">🥈 2</span>}
                      {row.rank === 3 && <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs">🥉 3</span>}
                      {row.rank > 3 && <span className="font-mono text-slate-400 font-medium">{row.rank}</span>}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <span>{row.name}</span>
                        {row.badge && (
                          <span className="text-[11px] text-amber-700 font-normal">
                            · {row.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{row.school}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">
                      {row.className}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-800 tabular-nums">
                      {row.wordsPracticed}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {row.accuracy}%
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-amber-600 font-semibold tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 inline" />
                        {row.streakDays}d
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700 tabular-nums">
                      {row.points.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredLeaderboard.map((row) => (
            <div key={row.id} className="p-4 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-7 text-center font-bold text-slate-600 font-mono">
                  #{row.rank}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{row.name}</div>
                  <div className="text-slate-500">{row.className} · {row.school}</div>
                </div>
              </div>

              <div className="text-right space-y-0.5">
                <div className="font-mono font-bold text-slate-900 text-sm">{row.accuracy}%</div>
                <div className="text-slate-400 font-mono">{row.wordsPracticed} words</div>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
