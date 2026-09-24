import React from 'react';

interface Props {
  lines?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<Props> = ({ lines = 3, className = '' }) => {
  return (
    <div className={`animate-pulse space-y-3 p-4 bg-white rounded-xl border border-slate-200/80 ${className}`}>
      <div className="h-5 bg-slate-200 rounded w-1/3 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3.5 bg-slate-100 rounded"
          style={{ width: `${85 - i * 15}%` }}
        />
      ))}
    </div>
  );
};
