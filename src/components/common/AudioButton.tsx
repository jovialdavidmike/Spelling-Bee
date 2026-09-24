import React, { useState } from 'react';
import { Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';
import { voiceService } from '../../services/voiceService';

interface Props {
  word: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
  label?: string;
  allowSlowMode?: boolean;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
}

export const AudioButton: React.FC<Props> = ({
  word,
  size = 'md',
  variant = 'primary',
  label,
  allowSlowMode = true,
  onPlayStart,
  onPlayEnd
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);

  const handlePlay = async (speed: number = 0.85) => {
    if (isPlaying) return;
    setIsPlaying(true);
    if (onPlayStart) onPlayStart();

    try {
      await voiceService.playWord(word, speed);
      setPlayCount(prev => prev + 1);
    } catch (err) {
      console.warn('Speech playback notice:', err);
    } finally {
      setIsPlaying(false);
      if (onPlayEnd) onPlayEnd();
    }
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base font-medium gap-2.5 shadow-sm'
  };

  const variantClasses = {
    primary: 'bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 focus-visible:ring-2 focus-visible:ring-slate-400',
    ghost: 'hover:bg-slate-100 text-slate-600 focus-visible:ring-2 focus-visible:ring-slate-400'
  };

  const defaultLabel = playCount > 0 ? 'Listen Again' : 'Listen to Word';

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => handlePlay(0.85)}
        disabled={isPlaying}
        aria-label={label || `${defaultLabel}: ${isPlaying ? 'Playing audio' : 'Click to hear word'}`}
        className={`inline-flex items-center justify-center rounded-lg transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer ${sizeClasses[size]} ${variantClasses[variant]}`}
      >
        <Volume2 className={`shrink-0 ${size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${isPlaying ? 'animate-pulse text-amber-900' : ''}`} />
        <span>{isPlaying ? 'Speaking...' : label || defaultLabel}</span>
      </button>

      {allowSlowMode && (
        <button
          type="button"
          onClick={() => handlePlay(0.65)}
          disabled={isPlaying}
          aria-label="Listen to word at slower speed"
          title="Play at slower speed (0.65x)"
          className="inline-flex items-center justify-center text-xs font-medium px-2.5 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          <span>Slower</span>
        </button>
      )}
    </div>
  );
};
