import React, { useState } from 'react';
import { StudentStreakData } from '../../types';
import {
  Flame,
  CheckCircle2,
  Calendar,
  Trophy,
  Award,
  Zap,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
  Clock,
  Share2
} from 'lucide-react';

interface Props {
  streakData: StudentStreakData;
  onStartPractice: () => void;
  onShareStreak?: () => void;
}

export const DailyStreakCard: React.FC<Props> = ({ streakData, onStartPractice, onShareStreak }) => {
  const [showMilestonesModal, setShowMilestonesModal] = useState(false);

  const {
    currentStreak,
    longestStreak,
    isPracticedToday,
    weekDays,
    nextMilestone,
    allMilestones,
    streakStatusMessage,
    flameLevel
  } = streakData;

  // Styling based on flame intensity
  const getFlameGlowClass = () => {
    switch (flameLevel) {
      case 'legendary':
        return 'from-amber-500 via-orange-500 to-rose-600 shadow-orange-500/25';
      case 'inferno':
        return 'from-amber-400 via-orange-500 to-red-500 shadow-amber-500/20';
      case 'blazing':
        return 'from-amber-400 to-orange-500 shadow-amber-500/15';
      case 'warm':
        return 'from-amber-400 to-amber-500 shadow-amber-500/10';
      default:
        return 'from-slate-400 to-amber-500 shadow-slate-400/10';
    }
  };

  const percentToNextMilestone = Math.min(
    100,
    Math.round(((nextMilestone.targetDays - nextMilestone.daysRemaining) / nextMilestone.targetDays) * 100)
  );

  return (
    <>
      <div className="bg-gradient-to-br from-white via-amber-50/20 to-orange-50/30 rounded-2xl border border-amber-200/80 shadow-sm p-5 sm:p-6 space-y-5 relative overflow-hidden">
        {/* Subtle decorative background watermarks */}
        <div className="absolute -right-8 -bottom-8 pointer-events-none opacity-5">
          <Flame className="w-56 h-56 text-orange-500" />
        </div>

        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Glowing Flame Icon Container */}
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${getFlameGlowClass()} p-0.5 shadow-lg flex items-center justify-center relative shrink-0 transition-transform hover:scale-105`}
            >
              <div className="w-full h-full bg-white/10 backdrop-blur-xs rounded-2xl flex items-center justify-center">
                <Flame
                  className={`w-8 h-8 ${
                    isPracticedToday
                      ? 'fill-amber-300 text-white animate-pulse'
                      : 'fill-amber-200 text-white'
                  }`}
                />
              </div>
              {isPracticedToday && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white">
                  ✓
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Daily Practice Streak</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                    isPracticedToday
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                  }`}
                >
                  {isPracticedToday ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Practiced Today</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 text-amber-700" />
                      <span>Action Needed Today</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mt-0.5">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                  {currentStreak}{' '}
                  <span className="text-base sm:text-lg font-sans font-semibold text-slate-600">
                    Day{currentStreak === 1 ? '' : 's'} Unbroken
                  </span>
                </h2>
              </div>
            </div>
          </div>

          {/* Quick Actions & Best Streak Badge */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Personal Best</span>
              <span className="text-xs font-bold text-slate-700 flex items-center justify-end gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>{longestStreak} Days</span>
              </span>
            </div>

            {onShareStreak && (
              <button
                onClick={onShareStreak}
                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Share your streak on social media"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Share Streak</span>
              </button>
            )}

            {!isPracticedToday ? (
              <button
                onClick={onStartPractice}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-900" />
                <span>Practice to Keep Streak</span>
              </button>
            ) : (
              <button
                onClick={() => setShowMilestonesModal(true)}
                className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>View Milestones</span>
              </button>
            )}
          </div>
        </div>

        {/* Motivational Banner */}
        <p className="text-xs text-slate-600 leading-relaxed font-medium bg-white/70 p-3 rounded-xl border border-amber-100">
          {streakStatusMessage}
        </p>

        {/* 7-Day Weekly Streak Tracker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>This Week's Activity (Mon – Sun)</span>
            </span>
            <button
              onClick={() => setShowMilestonesModal(true)}
              className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Milestones</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {weekDays.map((day) => {
              const isToday = day.isToday;
              const isPracticed = day.isPracticed;

              return (
                <div
                  key={day.dateStr}
                  className={`flex flex-col items-center py-2.5 px-1 rounded-xl border text-center transition-all ${
                    isToday
                      ? isPracticed
                        ? 'bg-amber-100/70 border-amber-400 shadow-xs ring-2 ring-amber-400/30'
                        : 'bg-white border-amber-500 ring-2 ring-amber-500/20'
                      : isPracticed
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : day.isPast
                      ? 'bg-slate-50/80 border-slate-200 opacity-60'
                      : 'bg-white/40 border-slate-100 opacity-50'
                  }`}
                  title={`${day.fullName} (${day.dateStr}): ${isPracticed ? 'Practiced' : isToday ? 'Today (Pending)' : day.isPast ? 'Missed' : 'Upcoming'}`}
                >
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{day.dayName}</span>
                  <span className="text-xs font-mono font-bold text-slate-800 my-1">{day.dayNumber}</span>

                  <div className="w-6 h-6 rounded-full flex items-center justify-center mt-0.5">
                    {isPracticed ? (
                      <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
                    ) : isToday ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-amber-500 animate-spin" />
                    ) : day.isPast ? (
                      <span className="text-slate-300 text-xs">·</span>
                    ) : (
                      <span className="text-slate-200 text-xs">○</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestone Progress Bar Footer */}
        <div className="pt-3 border-t border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-base">{nextMilestone.badge.split(' ')[0]}</span>
            <div>
              <span className="font-semibold text-slate-700">Next Milestone: </span>
              <strong className="text-slate-900">{nextMilestone.title}</strong>
              <span className="text-slate-500 font-normal ml-1">
                ({nextMilestone.daysRemaining === 0 ? 'Goal Reached!' : `${nextMilestone.daysRemaining} day${nextMilestone.daysRemaining === 1 ? '' : 's'} to go`})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:w-48">
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${percentToNextMilestone}%` }}
              />
            </div>
            <span className="font-mono text-slate-600 font-bold text-[10px] shrink-0">{percentToNextMilestone}%</span>
          </div>
        </div>
      </div>

      {/* STREAK MILESTONES MODAL */}
      {showMilestonesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  🔥
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Practice Streak Milestones</h3>
                  <p className="text-[11px] text-slate-500">Consistent daily practice builds spelling champions</p>
                </div>
              </div>
              <button
                onClick={() => setShowMilestonesModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {allMilestones.map((m) => (
                <div
                  key={m.targetDays}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                    m.isUnlocked
                      ? 'bg-amber-50/60 border-amber-300'
                      : 'bg-slate-50/70 border-slate-200 opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{m.badge.split(' ')[0]}</span>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{m.title}</span>
                        {m.isUnlocked && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-slate-900">
                            UNLOCKED
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {m.targetDays} consecutive days of spelling practice
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono text-[11px]">
                    {m.isUnlocked ? (
                      <span className="text-emerald-700 font-bold">Achieved ✓</span>
                    ) : (
                      <span className="text-slate-500">{m.daysRemaining} days left</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>How Streaks Work</span>
              </div>
              <p className="text-slate-600">
                Complete at least 1 practice session, assignment drill, or competition question each calendar day to keep your flame alive.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onShareStreak && (
                <button
                  onClick={() => {
                    setShowMilestonesModal(false);
                    onShareStreak();
                  }}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share My Streak</span>
                </button>
              )}
              <button
                onClick={() => setShowMilestonesModal(false)}
                className={`py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer ${
                  onShareStreak ? 'px-5' : 'w-full'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
