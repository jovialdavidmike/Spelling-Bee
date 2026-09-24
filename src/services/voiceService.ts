/**
 * Speech synthesis service for Spelling Bee pronunciation
 * Compatible with modern browser SpeechSynthesis API with clean fallback handling.
 */

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
    }
  }

  private initVoices() {
    if (!this.synth) return;

    const loadVoices = () => {
      const voices = this.synth?.getVoices() || [];
      // Prefer clear English voices (GB, US, or standard English)
      const preferredVoice = voices.find(v => 
        (v.lang.includes('en-GB') || v.lang.includes('en-US') || v.lang.includes('en')) && 
        !v.name.includes('Google') === false
      ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

      if (preferredVoice) {
        this.selectedVoice = preferredVoice;
      }
      this.isInitialized = true;
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  public isAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Speak a word for spelling bee practice
   * @param word Target word
   * @param speed Playback rate (e.g. 0.85 for normal, 0.65 for slower)
   */
  public playWord(word: string, speed: number = 0.85): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve(false);
        return;
      }

      this.synth.cancel(); // cancel any active speech

      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = speed;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }

      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);

      this.synth.speak(utterance);
    });
  }

  /**
   * Speak a sentence or definition
   */
  public speakText(text: string, speed: number = 0.9): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve(false);
        return;
      }

      this.synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speed;
      utterance.pitch = 1.0;

      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }

      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);

      this.synth.speak(utterance);
    });
  }

  /**
   * Speak mode-aware assignment intro
   */
  public speakAssignmentIntro(wordCount: number, mode: string = 'practice'): Promise<boolean> {
    if (mode === 'competition') {
      return this.speakText(`Competition simulation starting. You will receive ${wordCount} words. You have timed rounds. Listen carefully.`);
    } else if (mode === 'assessment') {
      return this.speakText(`Assessment starting. You will receive ${wordCount} words. Listen carefully and spell each word.`);
    } else {
      return this.speakText(`Let's begin. You will receive ${wordCount} words. Listen carefully and spell each word.`);
    }
  }

  /**
   * Mode-aware word prompt
   */
  public speakWordPrompt(word: string, mode: string = 'practice'): Promise<boolean> {
    if (mode === 'competition') {
      return this.speakText(`Your word is, ${word}.`);
    } else if (mode === 'assessment') {
      return this.speakText(`Spell, ${word}.`);
    } else {
      return this.speakText(`Your word is, ${word}.`);
    }
  }

  /**
   * Mode-aware feedback
   */
  public speakFeedbackResult(isCorrect: boolean, mode: string = 'practice'): Promise<boolean> {
    if (mode === 'competition' || mode === 'assessment') {
      // In assessment or competition, no spoken answers or excessive feedback
      return Promise.resolve(true);
    }

    if (isCorrect) {
      const affirmations = ['Correct. Well done.', 'Accurate. Great spelling.', 'Correct. Excellent job.'];
      const chosen = affirmations[Math.floor(Math.random() * affirmations.length)];
      return this.speakText(chosen);
    } else {
      return this.speakText('Not quite. Let’s review that word.');
    }
  }

  /**
   * Stop current speech
   */
  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const voiceService = new VoiceService();
