import React, { useState } from 'react';
import { AppView, WeeklyTopSpeller } from '../../types';
import { dataService } from '../../services/dataService';
import { authService } from '../../services/authService';
import {
  Trophy,
  Medal,
  Flame,
  Target,
  Zap,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  Calendar,
  Clock,
  Award,
  Users,
  Share2,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Info
} from 'lucide-react';
import { ShareProgressModal } from './ShareProgressModal';

interface Props {
  onNavigate: (view: AppView) => void;
  onLaunchPractice?: (settings?: any) => void;
}

export const WeeklyTopSpellersView: React.FC<Props> = ({ onNavigate, onLaunchPractice }) => {
  const currentUser = authService.getCurrentUser();
  const streakData = dataService.getStudentStreakData();
  const achievements = dataService.getAchievements();

  const [classFilter, setClassFilter] = useState<'all' | 'SS 1' | 'SS 2' | 'JSS 3'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'frequency' | 'accuracy' | 'streak'>('score');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Retrieve top spellers from data service
  const { spellers, currentUserSpeller, currentUserRank, meta } = dataService.getWeeklyTopSpellers();

  // Filter spellers based on class
  let filteredSpellers = spellers.filter(s => {
    if (classFilter === 'all') return true;
    return s.className.includes(classFilter);
  });

  // Sort based on chosen criteria
  if (sortBy === 'frequency') {
    filteredSpellers = [...filteredSpellers].sort((a, b) => b.weeklyWordsDrilled - a.weeklyWordsDrilled);
  } else if (sortBy === 'accuracy') {
    filteredSpellers = [...filteredSpellers].sort((a, b) => b.weeklyAccuracy - a.weeklyAccuracy);
  } else if (sortBy === 'streak') {
    filteredSpellers = [...filteredSpellers].sort((a, b) => b.weeklyStreakDays - a.weeklyStreakDays);
  } else {
    // Default score
    filteredSpellers = [...filteredSpellers].sort((a, b) => b.weeklyPoints - a.weeklyPoints);
  }

  // Get podium (1st, 2nd, 3rd) from overall score rankings
  const top1 = spellers[0];
  const top2 = spellers[1];
  const top3 = spellers[2];

  const handleStartWeeklyDrill = () => {
    if (onLaunchPractice) {
      onLaunchPractice({
        mode: 'quick',
        wordCount: 15,
        difficulty: 'Mixed',
        category: 'All Categories',
        allowSkip: true,
        allowRetry: true,
        showDefinitionAfterAnswer: true,
        showExampleAfterAnswer: true,
        scoringRule: 'standard'
      });
    } else {
      onNavigate('practice-setup');
    }
  };

  return (
    <div className="space-y-8 pb-16 text-xs">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-amber-50/40 to-transparent p-6 sm:p-8 rounded-3xl border border-amber-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-900 shadow-2xs flex items-center gap-1">
              <Trophy className="w-3 h-3 fill-slate-900" />
              <span>CURRENT WEEKLY RACE</span>
            </span>
            <span className="text-slate-500 font-medium">·</span>
            <span className="text-slate-600 font-semibold text-xs">
              Week {meta.weekNumber} ({meta.startDate} – {meta.endDate})
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Weekly Top Spellers
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Recognizing the top 10 secondary school students based on <strong>weekly practice frequency</strong> (drills & words completed) and <strong>spelling accuracy</strong>.
          </p>
        </div>

        {/* Live Round Countdown & Practice Action */}
        <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2.5 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-white border border-amber-200/90 shadow-2xs flex items-center gap-2 text-slate-700">
            <Clock className="w-4 h-4 text-amber-600 animate-spin" />
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase leading-none">Weekly Reset In</div>
              <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">
                {meta.daysRemaining}d {meta.hoursRemaining}h remaining
              </div>
            </div>
          </div>

          <button
            onClick={handleStartWeeklyDrill}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-slate-900" />
            <span>Practice to Boost Rank</span>
          </button>
        </div>
      </div>

      {/* CURRENT STUDENT STANDING BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center font-black text-2xl text-amber-300 font-mono shrink-0">
              #{currentUserRank}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Your Current Weekly Standing
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {currentUserRank <= 3 ? 'Podium Contender 🏆' : currentUserRank <= 5 ? 'Top 5 Speller 🔥' : 'Active Challenger'}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                {currentUser?.name || currentUserSpeller.name}
              </h2>
              <p className="text-xs text-slate-300">
                {currentUserSpeller.className} · {currentUserSpeller.school}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-white/5 p-3.5 rounded-xl border border-white/10 shrink-0">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Weekly Drills</div>
              <div className="text-base font-bold text-white font-mono flex items-center gap-1">
                <span>{currentUserSpeller.weeklyPracticeSessions}</span>
                <span className="text-[11px] text-slate-400 font-normal">({currentUserSpeller.weeklyWordsDrilled} words)</span>
              </div>
            </div>

            <div className="border-l border-white/10 pl-4">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Accuracy</div>
              <div className="text-base font-bold text-emerald-400 font-mono">
                {currentUserSpeller.weeklyAccuracy}%
              </div>
            </div>

            <div className="border-l border-white/10 pl-4">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Weekly Score</div>
              <div className="text-base font-bold text-amber-300 font-mono">
                {currentUserSpeller.weeklyPoints.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">pts</span>
              </div>
            </div>

            <div className="border-l border-white/10 pl-4">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Share your weekly rank on social media"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Rank</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TOP 3 PODIUM DISPLAY */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">Weekly Podium Champions</h2>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Top 3 leaders this week</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          
          {/* 2ND PLACE PODIUM (Left) */}
          {top2 && (
            <div className="order-2 md:order-1 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shadow-2xs border border-slate-200">
                    🥈 2
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Silver Podium
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                    <span>{top2.name}</span>
                    {top2.isCurrentUser && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-slate-900">YOU</span>
                    )}
                  </h3>
                  <div className="text-slate-500 text-xs">{top2.className} · {top2.school}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Frequency</div>
                    <div className="font-bold text-slate-800 font-mono text-sm">
                      {top2.weeklyPracticeSessions} drills
                    </div>
                    <div className="text-[10px] text-slate-500">{top2.weeklyWordsDrilled} words</div>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-lg">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Accuracy</div>
                    <div className="font-bold text-emerald-600 font-mono text-sm">
                      {top2.weeklyAccuracy}%
                    </div>
                    <div className="text-[10px] text-slate-500">{top2.weeklyStreakDays}/7 days active</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Weekly Points</span>
                <span className="font-mono font-black text-slate-900 text-sm">{top2.weeklyPoints.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* 1ST PLACE PODIUM (Center - Elevated) */}
          {top1 && (
            <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50/70 via-white to-amber-50/30 rounded-2xl border-2 border-amber-400 p-6 shadow-md flex flex-col justify-between space-y-4 relative md:-mt-2">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-full font-black text-[10px] uppercase tracking-wider shadow-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-slate-900" />
                <span>WEEKLY LEADER</span>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-lg shadow-xs border border-amber-300">
                    👑 1
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    🥇 Gold Champion
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-slate-900 text-lg flex items-center gap-1.5">
                    <span>{top1.name}</span>
                    {top1.isCurrentUser && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-slate-900">YOU</span>
                    )}
                  </h3>
                  <div className="text-slate-600 text-xs font-medium">{top1.className} · {top1.school}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-100">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/70">
                    <div className="text-[10px] text-amber-800 font-bold uppercase">Frequency</div>
                    <div className="font-bold text-slate-900 font-mono text-base">
                      {top1.weeklyPracticeSessions} drills
                    </div>
                    <div className="text-[10px] text-slate-600">{top1.weeklyWordsDrilled} words drilled</div>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/70">
                    <div className="text-[10px] text-amber-800 font-bold uppercase">Accuracy</div>
                    <div className="font-bold text-emerald-700 font-mono text-base">
                      {top1.weeklyAccuracy}%
                    </div>
                    <div className="text-[10px] text-slate-600">{top1.weeklyStreakDays}/7 days streak</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Weekly Champion Score</span>
                <span className="font-mono font-black text-amber-700 text-base">{top1.weeklyPoints.toLocaleString()} pts</span>
              </div>
            </div>
          )}

          {/* 3RD PLACE PODIUM (Right) */}
          {top3 && (
            <div className="order-3 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center font-bold text-sm shadow-2xs border border-amber-200">
                    🥉 3
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                    Bronze Podium
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                    <span>{top3.name}</span>
                    {top3.isCurrentUser && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-slate-900">YOU</span>
                    )}
                  </h3>
                  <div className="text-slate-500 text-xs">{top3.className} · {top3.school}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Frequency</div>
                    <div className="font-bold text-slate-800 font-mono text-sm">
                      {top3.weeklyPracticeSessions} drills
                    </div>
                    <div className="text-[10px] text-slate-500">{top3.weeklyWordsDrilled} words</div>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-lg">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Accuracy</div>
                    <div className="font-bold text-emerald-600 font-mono text-sm">
                      {top3.weeklyAccuracy}%
                    </div>
                    <div className="text-[10px] text-slate-500">{top3.weeklyStreakDays}/7 days active</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Weekly Points</span>
                <span className="font-mono font-black text-slate-900 text-sm">{top3.weeklyPoints.toLocaleString()}</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* FILTER & SORT CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start sm:self-auto text-xs">
          {(['all', 'SS 1', 'SS 2', 'JSS 3'] as const).map(cls => (
            <button
              key={cls}
              onClick={() => setClassFilter(cls)}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer ${
                classFilter === cls
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cls === 'all' ? 'All Classes' : cls}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-slate-400 font-medium text-xs">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="score">Weekly Composite Score</option>
            <option value="frequency">Practice Frequency (Words Drilled)</option>
            <option value="accuracy">Spelling Accuracy (%)</option>
            <option value="streak">Active Days This Week</option>
          </select>
        </div>
      </div>

      {/* TOP 10 RANKING TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-900 text-sm">Official Top 10 Spellers Standings</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">148 participating students this week</span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-xs font-semibold text-slate-500">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Rank</th>
                <th className="py-3 px-3 w-12 text-center">Trend</th>
                <th className="py-3 px-4">Student & School</th>
                <th className="py-3 px-3">Class</th>
                <th className="py-3 px-4 text-right">Practice Frequency</th>
                <th className="py-3 px-4 text-right">Accuracy</th>
                <th className="py-3 px-4 text-right">Active Days</th>
                <th className="py-3 px-4 text-right">Weekly Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSpellers.map((speller) => {
                const isUser = speller.isCurrentUser;
                const isPodium = speller.rank <= 3;

                return (
                  <tr
                    key={speller.id}
                    className={`transition-colors ${
                      isUser
                        ? 'bg-amber-50/70 hover:bg-amber-100/70 font-semibold'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Rank Badge */}
                    <td className="py-3.5 px-4 text-center">
                      {speller.rank === 1 && (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300">
                          🥇
                        </span>
                      )}
                      {speller.rank === 2 && (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300">
                          🥈
                        </span>
                      )}
                      {speller.rank === 3 && (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 text-amber-900 font-bold text-xs border border-amber-200">
                          🥉
                        </span>
                      )}
                      {speller.rank > 3 && (
                        <span className="font-mono text-slate-500 font-semibold">#{speller.rank}</span>
                      )}
                    </td>

                    {/* Trend Icon */}
                    <td className="py-3.5 px-3 text-center">
                      {speller.trend === 'up' && (
                        <span className="text-emerald-600 inline-flex items-center text-[11px] font-mono font-bold" title="Moved up">
                          <ArrowUp className="w-3 h-3" />
                          <span>{speller.rankChange || 1}</span>
                        </span>
                      )}
                      {speller.trend === 'down' && (
                        <span className="text-rose-500 inline-flex items-center text-[11px] font-mono" title="Moved down">
                          <ArrowDown className="w-3 h-3" />
                          <span>{speller.rankChange || 1}</span>
                        </span>
                      )}
                      {speller.trend === 'same' && (
                        <span className="text-slate-400 inline-flex items-center" title="Same rank">
                          <Minus className="w-3 h-3" />
                        </span>
                      )}
                      {speller.trend === 'new' && (
                        <span className="text-indigo-600 text-[10px] font-bold uppercase">
                          NEW
                        </span>
                      )}
                    </td>

                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isUser ? 'text-amber-950 font-black' : 'text-slate-900'}`}>
                          {speller.name}
                        </span>
                        {isUser && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-slate-900 shadow-2xs">
                            YOU
                          </span>
                        )}
                        {speller.badge && (
                          <span className="text-[11px] text-amber-700 font-normal">
                            · {speller.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-normal">{speller.school}</div>
                    </td>

                    {/* Class */}
                    <td className="py-3.5 px-3 text-slate-600 text-xs font-medium">
                      {speller.className}
                    </td>

                    {/* Frequency (Drills + Words) */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-bold text-slate-800 text-xs">
                        {speller.weeklyPracticeSessions} drills
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {speller.weeklyWordsDrilled} words
                      </div>
                    </td>

                    {/* Accuracy */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-bold text-emerald-700 text-sm">
                        {speller.weeklyAccuracy}%
                      </span>
                    </td>

                    {/* Active Streak Days */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-semibold text-amber-600 inline-flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-amber-500 text-amber-500 inline" />
                        <span>{speller.weeklyStreakDays}/7d</span>
                      </span>
                    </td>

                    {/* Weekly Score Points */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {speller.weeklyPoints.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredSpellers.map((speller) => {
            const isUser = speller.isCurrentUser;
            return (
              <div
                key={speller.id}
                className={`p-4 flex items-center justify-between gap-3 text-xs ${
                  isUser ? 'bg-amber-50/70 font-semibold' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 text-center font-bold text-slate-700 font-mono text-sm">
                    {speller.rank <= 3 ? (
                      speller.rank === 1 ? '🥇' : speller.rank === 2 ? '🥈' : '🥉'
                    ) : (
                      `#${speller.rank}`
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <span>{speller.name}</span>
                      {isUser && (
                        <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-amber-500 text-slate-900">YOU</span>
                      )}
                    </div>
                    <div className="text-slate-500 text-[11px]">{speller.className} · {speller.school}</div>
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <div className="font-mono font-bold text-emerald-700 text-xs">
                    {speller.weeklyAccuracy}% acc
                  </div>
                  <div className="text-slate-500 text-[10px] font-mono">
                    {speller.weeklyPracticeSessions} drills ({speller.weeklyWordsDrilled}w)
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-xs">
                    {speller.weeklyPoints.toLocaleString()} pts
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HOW WEEKLY RANKINGS WORK EXPLANATION */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2 text-xs text-slate-600">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <Info className="w-4 h-4 text-amber-600" />
          <span>How Weekly Top Spellers Rankings Are Calculated</span>
        </div>
        <p className="leading-relaxed">
          The weekly leaderboard is reset every <strong>Monday at 00:00</strong> to provide an equal competitive playing field each round. Points are awarded based on two core pillars:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <strong className="text-slate-900 block mb-1">1. Practice Frequency (Dedication)</strong>
            <span>Points awarded for each practice session completed and total volume of words drilled during the current calendar week. Consistent daily practice boosts your streak multiplier.</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <strong className="text-slate-900 block mb-1">2. Spelling Accuracy (Mastery)</strong>
            <span>A high accuracy score multiplies your weekly drill points, ensuring that speed and high-volume practice are paired with authentic spelling mastery.</span>
          </div>
        </div>
      </div>

      {/* SHARE PROGRESS MODAL */}
      <ShareProgressModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        streakData={streakData}
        studentName={currentUser?.name || currentUserSpeller.name}
        studentClass={currentUserSpeller.className}
        schoolName={currentUserSpeller.school}
        accuracy={currentUserSpeller.weeklyAccuracy}
        wordsMastered={currentUserSpeller.weeklyWordsDrilled}
        achievements={achievements}
        initialMode="all"
      />

    </div>
  );
};
