import React from 'react';
import { DifficultyLevel } from '../../types';

interface Props {
  difficulty: DifficultyLevel;
  showBars?: boolean;
}

export const DifficultyIndicator: React.FC<Props> = ({ difficulty, showBars = true }) => {
  const getLevels = () => {
    switch (difficulty) {
      case 'Beginner': return { count: 1, color: 'text-emerald-700', barColor: 'bg-emerald-600' };
      case 'Easy': return { count: 2, color: 'text-emerald-700', barColor: 'bg-emerald-600' };
      case 'Medium': return { count: 3, color: 'text-amber-700', barColor: 'bg-amber-500' };
      case 'Hard': return { count: 4, color: 'text-orange-700', barColor: 'bg-orange-600' };
      case 'Challenge': return { count: 5, color: 'text-rose-700', barColor: 'bg-rose-600' };
      default: return { count: 2, color: 'text-slate-600', barColor: 'bg-slate-500' };
    }
  };

  const { count, color, barColor } = getLevels();

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${color}`} aria-label={`Difficulty: ${difficulty}`}>
      {showBars && (
        <span className="flex items-end gap-0.5 h-3" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`w-0.5 rounded-full transition-all ${
                i <= count ? `${barColor} h-${i * 0.5 + 1.5}` : 'bg-slate-200 h-1.5'
              }`}
              style={{ height: `${i <= count ? Math.min(12, 3 + i * 1.8) : 4}px` }}
            />
          ))}
        </span>
      )}
      <span>{difficulty}</span>
    </span>
  );
};
