import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

interface Props {
  variant?: 'inline' | 'banner';
}

export const DisclaimerBanner: React.FC<Props> = ({ variant = 'inline' }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (variant === 'banner') {
    return (
      <aside aria-label="Independent Platform Notice" className="bg-slate-900 text-slate-300 text-xs px-4 py-2 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <p>
              <strong className="text-white font-medium">Independent Practice Platform:</strong> Built for secondary school students preparing for spelling-bee competitions across Nigeria, including MTN Spelling Bee activities. Not an official MTN product or affiliated entity.
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            aria-label="Dismiss disclaimer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-600 flex items-start gap-2.5 my-4">
      <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="leading-relaxed">
        <span className="font-medium text-slate-800">Educational Notice: </span>
        SpellReady is an independent preparation and vocabulary practice platform designed for Nigerian secondary school students and teachers. Competition names are referenced solely to assist student preparation.
      </div>
    </div>
  );
};
