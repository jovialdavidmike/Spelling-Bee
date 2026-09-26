/**
 * SpellReady Speech Recognition Service
 * 
 * Provides letter-by-letter spoken spelling input and continuous voice transcription
 * for student practice drills and live spelling bee competitions.
 * 
 * Features:
 * - Robust mapping of letter names, homophones, and NATO phonetics to alphabet characters
 * - Voice commands: 'backspace', 'delete', 'clear', 'submit', 'space', 'hyphen'
 * - Real-time interim & final letter stream
 * - Cross-browser support with webkitSpeechRecognition fallback
 * - Simulated fallback mode for environments without microphone permissions
 */

export interface SpeechRecognitionResult {
  rawTranscript: string;
  parsedLetters: string;
  isFinal: boolean;
  confidence: number;
}

export type SpeechCommand = 'backspace' | 'clear' | 'submit' | 'repeat' | null;

interface SpeechServiceCallbacks {
  onLettersChanged?: (letters: string) => void;
  onTranscriptChanged?: (rawTranscript: string) => void;
  onListeningStateChanged?: (isListening: boolean) => void;
  onCommand?: (command: SpeechCommand) => void;
  onError?: (errorMessage: string) => void;
}

// Letter phonetics mapping table
const LETTER_MAP: Record<string, string> = {
  // A
  'a': 'A', 'ay': 'A', 'eh': 'A', 'alpha': 'A',
  // B
  'b': 'B', 'be': 'B', 'bee': 'B', 'bravo': 'B',
  // C
  'c': 'C', 'see': 'C', 'sea': 'C', 'cee': 'C', 'charlie': 'C',
  // D
  'd': 'D', 'de': 'D', 'dee': 'D', 'delta': 'D',
  // E
  'e': 'E', 'ee': 'E', 'echo': 'E',
  // F
  'f': 'F', 'ef': 'F', 'eff': 'F', 'foxtrot': 'F',
  // G
  'g': 'G', 'gee': 'G', 'ji': 'G', 'golf': 'G',
  // H
  'h': 'H', 'aitch': 'H', 'haitch': 'H', 'hotel': 'H',
  // I
  'i': 'I', 'eye': 'I', 'aye': 'I', 'india': 'I',
  // J
  'j': 'J', 'jay': 'J', 'juliet': 'J', 'juliett': 'J',
  // K
  'k': 'K', 'kay': 'K', 'kilo': 'K',
  // L
  'l': 'L', 'el': 'L', 'ell': 'L', 'lima': 'L',
  // M
  'm': 'M', 'em': 'M', 'mike': 'M',
  // N
  'n': 'N', 'en': 'N', 'november': 'N',
  // O
  'o': 'O', 'oh': 'O', 'owe': 'O', 'oscar': 'O',
  // P
  'p': 'P', 'pe': 'P', 'pee': 'P', 'pea': 'P', 'papa': 'P',
  // Q
  'q': 'Q', 'cue': 'Q', 'queue': 'Q', 'quebec': 'Q',
  // R
  'r': 'R', 'ar': 'R', 'are': 'R', 'romeo': 'R',
  // S
  's': 'S', 'es': 'S', 'ess': 'S', 'sierra': 'S',
  // T
  't': 'T', 'te': 'T', 'tee': 'T', 'tea': 'T', 'tango': 'T',
  // U
  'u': 'U', 'you': 'U', 'yu': 'U', 'uniform': 'U',
  // V
  'v': 'V', 've': 'V', 'vee': 'V', 'victor': 'V',
  // W
  'w': 'W', 'double-u': 'W', 'doubleu': 'W', 'double you': 'W', 'whiskey': 'W', 'whisky': 'W',
  // X
  'x': 'X', 'ex': 'X', 'x-ray': 'X', 'xray': 'X',
  // Y
  'y': 'Y', 'why': 'Y', 'wye': 'Y', 'yankee': 'Y',
  // Z
  'z': 'Z', 'zed': 'Z', 'zee': 'Z', 'zulu': 'Z',
  // Symbols
  'hyphen': '-', 'dash': '-', 'minus': '-',
  'apostrophe': "'",
  'space': ' '
};

const COMMAND_MAP: Record<string, SpeechCommand> = {
  'backspace': 'backspace',
  'delete': 'backspace',
  'undo': 'backspace',
  'remove': 'backspace',
  'erase': 'backspace',
  'clear': 'clear',
  'reset': 'clear',
  'restart': 'clear',
  'start over': 'clear',
  'submit': 'submit',
  'done': 'submit',
  'finish': 'submit',
  'confirm': 'submit',
  'enter': 'submit',
  'repeat': 'repeat',
  'repeat word': 'repeat',
  'say again': 'repeat'
};

class SpeechRecognitionService {
  private recognition: any = null;
  private isListening = false;
  private currentSpelling = '';
  private callbacks: SpeechServiceCallbacks = {};
  private autoRestart = false;
  private recognitionSupported = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        this.recognitionSupported = true;
        this.initRecognition(SpeechRec);
      }
    }
  }

  public isSupported(): boolean {
    return this.recognitionSupported;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public getCurrentSpelling(): string {
    return this.currentSpelling;
  }

  public setSpelling(letters: string) {
    this.currentSpelling = letters;
    if (this.callbacks.onLettersChanged) {
      this.callbacks.onLettersChanged(this.currentSpelling);
    }
  }

  public setCallbacks(callbacks: SpeechServiceCallbacks) {
    this.callbacks = callbacks;
  }

  private initRecognition(SpeechRec: any) {
    try {
      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 3;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.callbacks.onListeningStateChanged?.(true);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.callbacks.onListeningStateChanged?.(false);
        // If continuous listening was requested, restart
        if (this.autoRestart) {
          try {
            this.recognition.start();
          } catch (e) {
            // Already active or prevented
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition event:', event.error);
        if (event.error === 'not-allowed') {
          this.autoRestart = false;
          this.callbacks.onError?.('Microphone access was denied. Please allow microphone permissions in your browser.');
        } else if (event.error === 'network') {
          this.callbacks.onError?.('Speech service network glitch. Reconnecting speech recognition...');
        }
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        const fullRaw = (finalTranscript + interimTranscript).trim();
        this.callbacks.onTranscriptChanged?.(fullRaw);

        if (finalTranscript.trim()) {
          this.processSpokenText(finalTranscript.trim());
        }
      };
    } catch (e) {
      console.warn('Failed to initialize SpeechRecognition API', e);
      this.recognitionSupported = false;
    }
  }

  /**
   * Intelligently parses spoken words or letter sequences into spelling text
   */
  public processSpokenText(spoken: string) {
    const lower = spoken.toLowerCase().trim();

    // 1. Check for whole-phrase commands
    for (const [trigger, cmd] of Object.entries(COMMAND_MAP)) {
      if (lower === trigger || lower.endsWith(` ${trigger}`)) {
        this.executeCommand(cmd);
        return;
      }
    }

    // 2. Tokenize by space, hyphen, and period
    const tokens = lower.split(/[\s\-.]+/).filter(t => t.length > 0);

    for (const token of tokens) {
      // Check command token
      if (COMMAND_MAP[token]) {
        this.executeCommand(COMMAND_MAP[token]);
        continue;
      }

      // Check letter token map
      if (LETTER_MAP[token]) {
        this.appendLetter(LETTER_MAP[token]);
        continue;
      }

      // If token is a single alphabetical character
      if (/^[a-z]$/i.test(token)) {
        this.appendLetter(token.toUpperCase());
        continue;
      }

      // If token is a compound spelling like "c-a-t" or "c a t" without spaces
      // Check if user spelled aloud quickly
      if (/^[a-z]+$/i.test(token) && token.length <= 4) {
        // Break into characters if recognized as letter sounds
        let matchedCompound = false;
        if (token === 'ok') {
          this.appendLetter('O');
          this.appendLetter('K');
          matchedCompound = true;
        } else if (token === 'tv') {
          this.appendLetter('T');
          this.appendLetter('V');
          matchedCompound = true;
        }

        if (!matchedCompound) {
          // If 1-3 letters, append characters
          for (const char of token.toUpperCase()) {
            this.appendLetter(char);
          }
        }
      }
    }
  }

  private appendLetter(char: string) {
    this.currentSpelling += char;
    this.callbacks.onLettersChanged?.(this.currentSpelling);
  }

  public backspace() {
    if (this.currentSpelling.length > 0) {
      this.currentSpelling = this.currentSpelling.slice(0, -1);
      this.callbacks.onLettersChanged?.(this.currentSpelling);
    }
  }

  public clear() {
    this.currentSpelling = '';
    this.callbacks.onLettersChanged?.(this.currentSpelling);
  }

  private executeCommand(cmd: SpeechCommand) {
    if (!cmd) return;
    if (cmd === 'backspace') {
      this.backspace();
    } else if (cmd === 'clear') {
      this.clear();
    }
    this.callbacks.onCommand?.(cmd);
  }

  public startListening(initialLetters = ''): boolean {
    this.currentSpelling = initialLetters;
    this.autoRestart = true;

    if (!this.recognitionSupported || !this.recognition) {
      this.callbacks.onError?.('Speech recognition is not supported in this browser. Please use keyboard entry.');
      return false;
    }

    try {
      if (!this.isListening) {
        this.recognition.start();
      }
      return true;
    } catch (e: any) {
      if (e?.name !== 'InvalidStateError') {
        console.warn('SpeechRecognition start error:', e);
      }
      return false;
    }
  }

  public stopListening() {
    this.autoRestart = false;
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
    this.isListening = false;
    this.callbacks.onListeningStateChanged?.(false);
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
