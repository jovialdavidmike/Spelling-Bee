import React from 'react';
import { Award, Sparkles } from 'lucide-react';

export const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white p-6">
      <div className="flex flex-col items-center max-w-sm text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center animate-pulse">
            <Award className="w-9 h-9 text-amber-400" />
          </div>
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
          </div>
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">SpellReady</h1>
          <p className="text-xs text-amber-400/80 font-medium mt-0.5">Spelling Bee Practice & Competition Platform</p>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-300">
            <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Checking your account…</span>
          </div>
          <p className="text-[11px] text-slate-400">Restoring your session and learning data</p>
        </div>
      </div>
    </div>
  );
};
