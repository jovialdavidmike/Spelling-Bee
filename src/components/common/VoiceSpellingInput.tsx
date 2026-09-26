import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Keyboard,
  Delete,
  RotateCcw,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Volume2
} from 'lucide-react';
import { speechRecognitionService, SpeechCommand } from '../../services/speechRecognitionService';

interface VoiceSpellingInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  onPastePrevented?: () => void;
  preventCopyPaste?: boolean;
}

export const VoiceSpellingInput: React.FC<VoiceSpellingInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = 'Type or speak your spelling...',
  autoFocus = true,
  onPastePrevented,
  preventCopyPaste = false
}) => {
  const [inputMode, setInputMode] = useState<'keyboard' | 'voice'>('keyboard');
  const [isListening, setIsListening] = useState(false);
  const [rawTranscript, setRawTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const isSupported = speechRecognitionService.isSupported();

  // Keep speech service synced with parent value
  useEffect(() => {
    speechRecognitionService.setSpelling(value);
  }, [value]);

  // Set up speech recognition callbacks
  useEffect(() => {
    speechRecognitionService.setCallbacks({
      onLettersChanged: (letters) => {
        onChange(letters);
      },
      onTranscriptChanged: (transcript) => {
        setRawTranscript(transcript);
      },
      onListeningStateChanged: (active) => {
        setIsListening(active);
      },
      onCommand: (command: SpeechCommand) => {
        if (command === 'submit') {
          onSubmit();
        }
      },
      onError: (err) => {
        setErrorMessage(err);
      }
    });

    return () => {
      speechRecognitionService.stopListening();
    };
  }, [onChange, onSubmit]);

  // Focus input when keyboard mode is active
  useEffect(() => {
    if (inputMode === 'keyboard' && autoFocus && !disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputMode, autoFocus, disabled]);

  const handleToggleVoice = () => {
    if (inputMode === 'keyboard') {
      setInputMode('voice');
      setErrorMessage(null);
      speechRecognitionService.startListening(value);
    } else {
      speechRecognitionService.stopListening();
      setInputMode('keyboard');
    }
  };

  const handleMicButtonClick = () => {
    if (isListening) {
      speechRecognitionService.stopListening();
    } else {
      setErrorMessage(null);
      speechRecognitionService.startListening(value);
    }
  };

  const handleBackspace = () => {
    speechRecognitionService.backspace();
  };

  const handleClear = () => {
    speechRecognitionService.clear();
  };

  return (
    <div className="space-y-4">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              if (isListening) speechRecognitionService.stopListening();
              setInputMode('keyboard');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              inputMode === 'keyboard'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Keyboard</span>
          </button>

          <button
            type="button"
            onClick={handleToggleVoice}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              inputMode === 'voice'
                ? 'bg-amber-500 text-slate-900 shadow-xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mic className={`w-3.5 h-3.5 ${inputMode === 'voice' ? 'animate-pulse text-slate-950' : 'text-amber-600'}`} />
            <span>Podium Mic</span>
            {isSupported && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowVoiceHelp(!showVoiceHelp)}
          className="text-xs text-slate-400 hover:text-amber-600 flex items-center gap-1 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Voice Guide</span>
        </button>
      </div>

      {/* Voice Guide Popup */}
      {showVoiceHelp && (
        <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-950 space-y-2 animate-fadeIn">
          <div className="font-bold flex items-center gap-1.5 text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>How to Spell Aloud with the Podium Mic</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-slate-700">
            <li>Say letters one by one clearly: <span className="font-mono font-semibold">"A... P... P... L... E"</span></li>
            <li>Phonetic letter names are recognized: <span className="font-mono font-semibold">"bee", "see", "kay", "queue"</span></li>
            <li>Voice commands: Say <span className="font-semibold text-rose-700">"Backspace"</span> to remove a letter, <span className="font-semibold text-amber-800">"Clear"</span> to restart, or <span className="font-semibold text-emerald-700">"Submit"</span> when done.</li>
          </ul>
        </div>
      )}

      {/* KEYBOARD MODE */}
      {inputMode === 'keyboard' && (
        <div className="space-y-3">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value.toUpperCase())}
              disabled={disabled}
              placeholder={placeholder}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              onPaste={(e) => {
                if (preventCopyPaste && onPastePrevented) {
                  e.preventDefault();
                  onPastePrevented();
                }
              }}
              className="w-full text-center text-xl sm:text-2xl font-bold tracking-widest uppercase py-4 px-6 bg-slate-50 border-2 border-slate-300 focus:border-amber-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 shadow-inner transition-all disabled:opacity-50 text-slate-900"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>{value.length} letters entered</span>
            <button
              type="button"
              onClick={handleToggleVoice}
              className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1"
            >
              <Mic className="w-3.5 h-3.5" />
              Switch to Podium Mic
            </button>
          </div>
        </div>
      )}

      {/* VOICE PODIUM MIC MODE */}
      {inputMode === 'voice' && (
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl border border-slate-800 text-center relative overflow-hidden">
          
          {/* Visual wave backdrop when listening */}
          {isListening && (
            <div className="absolute inset-0 bg-amber-500/5 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 rounded-full border border-amber-500/20 animate-ping opacity-25" />
            </div>
          )}

          {/* Active Podium Microphone Header */}
          <div className="relative z-10 flex flex-col items-center space-y-3">
            <button
              type="button"
              onClick={handleMicButtonClick}
              disabled={disabled}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform transform active:scale-95 cursor-pointer ${
                isListening
                  ? 'bg-amber-500 text-slate-950 ring-8 ring-amber-500/25 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 ring-4 ring-slate-700'
              }`}
            >
              {isListening ? (
                <Mic className="w-9 h-9" />
              ) : (
                <MicOff className="w-9 h-9 text-slate-400" />
              )}
            </button>

            <div>
              <div className="text-sm font-bold tracking-wide">
                {isListening ? (
                  <span className="text-amber-400 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    Podium Mic is Active • Speak Letters Aloud
                  </span>
                ) : (
                  <span className="text-slate-400">Mic Paused — Click to Listen</span>
                )}
              </div>
              {rawTranscript && (
                <div className="text-xs text-slate-400 mt-1 italic">
                  "{rawTranscript}"
                </div>
              )}
            </div>
          </div>

          {/* Spelled Letter Tiles Display (Spelling Bee Podium Broadcast Style) */}
          <div className="relative z-10 min-h-[70px] flex flex-wrap items-center justify-center gap-2 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            {value.length === 0 ? (
              <span className="text-xs text-slate-500 italic">
                Speak your spelling letter-by-letter (e.g., "A... C... C... O... M... M... O... D... A... T... E")
              </span>
            ) : (
              value.split('').map((letter, idx) => (
                <div
                  key={idx}
                  className="w-10 h-12 sm:w-11 sm:h-14 flex items-center justify-center bg-slate-800 border-2 border-amber-400 text-amber-300 font-extrabold text-xl sm:text-2xl rounded-xl shadow-md transform transition-all animate-scaleIn"
                >
                  {letter}
                </div>
              ))
            )}
          </div>

          {/* Quick Voice Control Buttons */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleBackspace}
              disabled={disabled || value.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-40 transition-colors"
            >
              <Delete className="w-3.5 h-3.5 text-rose-400" />
              <span>Backspace</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={disabled || value.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-40 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Clear</span>
            </button>

            <button
              type="button"
              onClick={() => {
                speechRecognitionService.processSpokenText('dash');
              }}
              disabled={disabled}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-40 transition-colors font-mono"
            >
              - Hyphen
            </button>

            <button
              type="button"
              onClick={() => {
                speechRecognitionService.processSpokenText('apostrophe');
              }}
              disabled={disabled}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-40 transition-colors font-mono"
            >
              ' Apostrophe
            </button>
          </div>

          {/* Error notice if microphone denied */}
          {errorMessage && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs text-left">
              {errorMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
