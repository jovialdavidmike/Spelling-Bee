/**
 * SpellReady Voice Service
 * Primary Voice: Google Gemini API (gemini-3.8-flash-lite-tts) Studio Audio
 * Fallback Voice: Browser SpeechSynthesis API
 * 
 * Features:
 * - Studio quality human-like pronunciation
 * - Centralized competition scripts
 * - No overlapping speech / audio queue management
 * - In-memory audio caching for zero-latency replay
 * - Safe offline / error fallback
 */

export type GeminiVoiceName = 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon';

interface SpeakOptions {
  voiceName?: GeminiVoiceName;
  style?: string;
  speed?: number; // fallback speed
  useCache?: boolean;
}

class VoiceService {
  private currentAudio: HTMLAudioElement | null = null;
  private audioCache = new Map<string, string>(); // text:voice -> objectUrl or dataUri
  private isGeminiVoiceEnabled = true;
  private selectedGeminiVoice: GeminiVoiceName = 'Kore';
  private synth: SpeechSynthesis | null = null;
  private browserVoice: SpeechSynthesisVoice | null = null;
  private isMuted = false;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.initBrowserVoices();
      }
    }
  }

  private initBrowserVoices() {
    if (!this.synth) return;
    const loadVoices = () => {
      const voices = this.synth?.getVoices() || [];
      const preferred = voices.find(v => 
        (v.lang.includes('en-GB') || v.lang.includes('en-NG') || v.lang.includes('en-US')) &&
        v.name.includes('Google')
      ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
      if (preferred) {
        this.browserVoice = preferred;
      }
    };
    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  public setGeminiVoice(voice: GeminiVoiceName) {
    this.selectedGeminiVoice = voice;
  }

  public getGeminiVoice(): GeminiVoiceName {
    return this.selectedGeminiVoice;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Stop any current speech (both Gemini audio element and Web Speech)
   */
  public stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio = null;
      } catch (e) {
        // ignore
      }
    }
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        // ignore
      }
    }
  }

  /**
   * Speak arbitrary text using Gemini TTS with automatic fallback to Web Speech
   */
  public async speakText(text: string, options: SpeakOptions = {}): Promise<boolean> {
    if (this.isMuted) return true;
    const cleanText = text.trim();
    if (!cleanText) return true;

    this.stop();

    const voice = options.voiceName || this.selectedGeminiVoice;
    const cacheKey = `${voice}:${cleanText}`;

    // Try Gemini TTS first if enabled
    if (this.isGeminiVoiceEnabled && typeof window !== 'undefined') {
      try {
        let audioSrc: string | null = null;

        if (this.audioCache.has(cacheKey)) {
          audioSrc = this.audioCache.get(cacheKey)!;
        } else {
          const res = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: cleanText,
              voiceName: voice,
              style: options.style || 'Clear, deliberate, authoritative and dignified spelling bee moderator with pristine British English pronunciation'
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.audioBase64) {
              audioSrc = `data:audio/wav;base64,${data.audioBase64}`;
              this.audioCache.set(cacheKey, audioSrc);
            }
          }
        }

        if (audioSrc) {
          const played = await this.playAudioUrl(audioSrc);
          if (played) return true;
        }
      } catch (err) {
        console.warn('Gemini TTS unavailable, falling back to Web Speech synthesis:', err);
      }
    }

    // Fallback: Web Speech API
    return this.speakWebSpeech(cleanText, options.speed || 0.88);
  }

  private playAudioUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const audio = new Audio(url);
      this.currentAudio = audio;

      audio.onended = () => {
        if (this.currentAudio === audio) {
          this.currentAudio = null;
        }
        resolve(true);
      };

      audio.onerror = () => {
        if (this.currentAudio === audio) {
          this.currentAudio = null;
        }
        resolve(false);
      };

      audio.play().catch(() => {
        resolve(false);
      });
    });
  }

  private speakWebSpeech(text: string, speed: number = 0.88): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve(false);
        return;
      }
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speed;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      if (this.browserVoice) {
        utterance.voice = this.browserVoice;
      }

      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);

      this.synth.speak(utterance);
    });
  }

  /**
   * Pronounce a competition or practice word clearly
   */
  public playWord(word: string, optionsOrSpeed?: SpeakOptions | number): Promise<boolean> {
    const opts: SpeakOptions = typeof optionsOrSpeed === 'number' 
      ? { speed: optionsOrSpeed } 
      : (optionsOrSpeed || {});

    return this.speakText(word, {
      ...opts,
      style: 'Clear, articulate, natural spelling bee pronouncer. Say only the target word clearly with accurate standard phonetics.'
    });
  }

  /**
   * Centralized Competition Voice Scripts (Prompt 5 requirement)
   */
  public speakCompetitionOpening(competitionTitle: string): Promise<boolean> {
    return this.speakText(
      `Welcome to ${competitionTitle}. Listen carefully to each word and spell it as accurately as you can.`
    );
  }

  public speakRoundIntro(roundName: string, wordCount: number): Promise<boolean> {
    return this.speakText(`${roundName} is about to begin. You will be given ${wordCount} words.`);
  }

  public speakWordPrompt(word: string, mode: string = 'competition'): Promise<boolean> {
    if (mode === 'competition') {
      return this.speakText(`Your word is, ${word}.`);
    } else if (mode === 'assessment') {
      return this.speakText(`Spell, ${word}.`);
    } else {
      return this.speakText(`Your word is, ${word}.`);
    }
  }

  public speakWordRepeat(word: string): Promise<boolean> {
    return this.speakText(`The word is, ${word}.`);
  }

  public speakDefinition(definition: string): Promise<boolean> {
    return this.speakText(`Definition. ${definition}`);
  }

  public speakSentence(sentence: string): Promise<boolean> {
    return this.speakText(`Example sentence. ${sentence}`);
  }

  public speakTimeWarning(): Promise<boolean> {
    return this.speakText(`Ten seconds remaining.`);
  }

  public speakTimeExpired(): Promise<boolean> {
    return this.speakText(`Time.`);
  }

  public speakRoundComplete(roundName: string): Promise<boolean> {
    return this.speakText(`${roundName} is complete. Calculating results.`);
  }

  public speakQualification(qualified: boolean): Promise<boolean> {
    if (qualified) {
      return this.speakText(`Congratulations. You have qualified for the next round.`);
    } else {
      return this.speakText(`Round complete. You can review your missed words and continue practicing.`);
    }
  }

  public speakTieBreakerAnnouncement(): Promise<boolean> {
    return this.speakText(`A tie has been detected. The tie-breaker round will now begin.`);
  }

  public speakFinalRound(): Promise<boolean> {
    return this.speakText(`You have reached the final round. Take your time and spell carefully.`);
  }

  public speakFeedbackResult(isCorrect: boolean, mode: string = 'practice'): Promise<boolean> {
    if (mode === 'competition' || mode === 'assessment') {
      return Promise.resolve(true); // strict mode - no immediate spoiler
    }
    if (isCorrect) {
      const affirmations = ['Correct. Well done.', 'Accurate. Great spelling.', 'Correct. Excellent job.'];
      const chosen = affirmations[Math.floor(Math.random() * affirmations.length)];
      return this.speakText(chosen);
    } else {
      return this.speakText('Not quite. Let’s review that word.');
    }
  }
}

export const voiceService = new VoiceService();
