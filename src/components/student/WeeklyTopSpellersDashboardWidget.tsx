import React from 'react';
import { AppView, WeeklyTopSpeller, WeeklyLeaderboardMeta } from '../../types';
import {
  Trophy,
  Flame,
  Zap,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Award,
  Clock,
  ChevronRight,
  Medal,
  Users
} from 'lucide-react';

interface Props {
  spellers: WeeklyTopSpeller[];
  currentUserSpeller: WeeklyTopSpeller;
  currentUserRank: number;
  meta: WeeklyLeaderboardMeta;
  onNavigate: (view: AppView) => void;
  onStartPractice?: () => void;
}

export const WeeklyTopSpellersDashboardWidget: React.FC<Props> = ({
  spellers,
  currentUserSpeller,
  currentUserRank,
  meta,
  onNavigate,
  onStartPractice
}) => {
  const top3 = spellers.slice(0, 3);
  const remainingTop = spellers.slice(3, 7);

  const getStandingMotivationalMessage = () => {
    if (currentUserRank === 1) {
      return {
        tag: 'Weekly Leader 👑',
        message: 'You are leading the national spelling charts this week! Keep practicing to secure the weekly championship.',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300'
      };
    }
    if (currentUserRank <= 3) {
      return {
        tag: 'Podium Contender 🏆',
        message: `You are in position #${currentUserRank} on the podium! Only a few practice drills away from the #1 spot.`,
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300'
      };
    }
    const pointsBehind3rd = (top3[2]?.weeklyPoints || 0) - currentUserSpeller.weeklyPoints;
    return {
      tag: `Rank #${currentUserRank} Challenger 🔥`,
      message: pointsBehind3rd > 0
        ? `You are ${pointsBehind3rd} points away from the Top 3 podium! Boost your practice frequency and accuracy to climb.`
        : 'You are right on the edge of the Top 3 podium! Drill a set of words today to overtake competitors.',
      badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-200'
    };
  };

  const motivation = getStandingMotivationalMessage();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5 relative overflow-hidden">
      
      {/* Decorative background accent */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-amber-500/10 via-orange-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold shadow-2xs border border-amber-300/60 shrink-0">
            <Trophy className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Weekly Top Spellers</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Week {meta.weekNumber}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Ranked by practice frequency (drills & words) + spelling accuracy ({meta.startDate} – {meta.endDate})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{meta.daysRemaining}d {meta.hoursRemaining}h left</span>
          </div>

          <button
            onClick={() => onNavigate('weekly-top-spellers')}
            className="px-3.5 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Full Standings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Current Student Standing Motivational Callout */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-50/50 to-orange-50/30 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 text-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${motivation.badgeClass}`}>
              {motivation.tag}
            </span>
            <span className="font-semibold text-slate-800">
              {currentUserSpeller.weeklyPracticeSessions} drills completed ({currentUserSpeller.weeklyWordsDrilled} words) · {currentUserSpeller.weeklyAccuracy}% acc
            </span>
          </div>
          <p className="text-[11px] text-slate-600">
            {motivation.message}
          </p>
        </div>

        {onStartPractice && (
          <button
            onClick={onStartPractice}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-900" />
            <span>Practice Now</span>
          </button>
        )}
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
        {top3.map((speller) => {
          const isUser = speller.isCurrentUser;
          const isFirst = speller.rank === 1;

          return (
            <div
              key={speller.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-2.5 ${
                isFirst
                  ? 'bg-gradient-to-b from-amber-50/70 via-white to-amber-50/40 border-amber-300 ring-1 ring-amber-300/40 shadow-xs'
                  : isUser
                  ? 'bg-amber-50/50 border-amber-200 ring-1 ring-amber-400/30'
                  : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      speller.rank === 1
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : speller.rank === 2
                        ? 'bg-slate-200 text-slate-800 border border-slate-300'
                        : 'bg-amber-50 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {speller.rank === 1 ? '🥇' : speller.rank === 2 ? '🥈' : '🥉'}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1 truncate max-w-[130px]">
                      <span>{speller.name}</span>
                      {isUser && (
                        <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-amber-500 text-slate-900">
                          YOU
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] text-slate-500 block truncate max-w-[130px]">
                      {speller.className} · {speller.school.split(',')[0]}
                    </span>
                  </div>
                </div>

                <span className="font-mono font-bold text-xs text-slate-900">
                  #{speller.rank}
                </span>
              </div>

              {/* Metrics strip */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="text-slate-600">
                  <strong className="text-slate-800 font-mono">{speller.weeklyPracticeSessions}</strong> drills ({speller.weeklyWordsDrilled}w)
                </div>
                <div className="font-mono font-bold text-emerald-700">
                  {speller.weeklyAccuracy}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ranks 4 to 7 Mini Preview Table */}
      <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 text-[11px] relative z-10">
        {remainingTop.map((speller) => {
          const isUser = speller.isCurrentUser;
          return (
            <div
              key={speller.id}
              className={`p-2.5 px-3 flex items-center justify-between gap-2 transition-colors ${
                isUser ? 'bg-amber-50/80 font-semibold' : 'hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 text-center font-mono font-bold text-slate-400">
                  #{speller.rank}
                </span>
                <span className={`font-semibold ${isUser ? 'text-amber-950 font-bold' : 'text-slate-900'}`}>
                  {speller.name}
                </span>
                {isUser && (
                  <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-amber-500 text-slate-900">YOU</span>
                )}
                <span className="text-slate-400 hidden sm:inline">
                  ({speller.className})
                </span>
              </div>

              <div className="flex items-center gap-4 shrink-0 font-mono text-[10px]">
                <span className="text-slate-600">{speller.weeklyPracticeSessions} drills</span>
                <span className="text-emerald-700 font-bold">{speller.weeklyAccuracy}% acc</span>
                <span className="text-slate-900 font-bold">{speller.weeklyPoints.toLocaleString()} pts</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Link to Full View */}
      <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 relative z-10">
        <span className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>Top 10 leaderboard refreshed continuously based on student drills</span>
        </span>

        <button
          onClick={() => onNavigate('weekly-top-spellers')}
          className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-0.5 cursor-pointer"
        >
          <span>View All Top 10 Spellers</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
