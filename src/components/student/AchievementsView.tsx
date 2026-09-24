import React from 'react';
import { AppView } from '../../types';
import { dataService } from '../../services/dataService';
import { Award, Lock, CheckCircle2, Zap, Trophy, Flame, Target } from 'lucide-react';

interface Props {
  onNavigate: (view: AppView) => void;
}

export const AchievementsView: React.FC<Props> = ({ onNavigate }) => {
  const achievements = dataService.getAchievements();

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'streak': return Flame;
      case 'accuracy': return Target;
      case 'competition': return Trophy;
      default: return Zap;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Achievements & Badges
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Milestones unlocked through continuous spelling practice and competition simulations.
          </p>
        </div>

        <div className="text-xs font-mono font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
          {unlockedCount} of {achievements.length} Unlocked
        </div>
      </div>

      {/* Grid of Achievements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((ach) => {
          const Icon = getCategoryIcon(ach.category);
          return (
            <div
              key={ach.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition-all ${
                ach.unlocked
                  ? 'bg-white border-slate-200 shadow-xs hover:border-amber-300'
                  : 'bg-slate-50/70 border-slate-200/60 opacity-75'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      ach.unlocked
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {ach.unlocked ? <Icon className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>

                  <span
                    className={`text-[11px] font-semibold ${
                      ach.unlocked ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {ach.unlocked ? '✓ Unlocked' : 'In Progress'}
                  </span>
                </div>

                <div>
                  <h3 className={`text-base font-bold ${ach.unlocked ? 'text-slate-900' : 'text-slate-700'}`}>
                    {ach.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Requirement</span>
                  <span className="font-mono font-medium">{ach.progressLabel}</span>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      ach.unlocked ? 'bg-amber-500' : 'bg-slate-400'
                    }`}
                    style={{ width: `${ach.progress}%` }}
                  />
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
