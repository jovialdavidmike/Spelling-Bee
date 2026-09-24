import {
  Word,
  PracticeSession,
  SessionSettings,
  PracticeMode,
  SpellingAttempt,
  DifficultyLevel,
  WordCategory
} from '../types';
import { validateSpelling } from './spellingEngine';
import { masteryService } from './masteryService';
import { dataService } from './dataService';

export class PracticeSessionService {
  /**
   * Deterministic pseudo-random number generator using a string seed (e.g. date YYYY-MM-DD).
   */
  private getSeededRandom(seed: string): () => number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    return () => {
      hash = (hash * 9301 + 49297) % 233280;
      return Math.abs(hash / 233280);
    };
  }

  /**
   * Selects words based on session settings.
   */
  public selectWordsForSession(
    allWords: Word[],
    settings: SessionSettings,
    customWordIds?: string[]
  ): { words: Word[]; insufficient: boolean; matchingCount: number } {
    if (customWordIds && customWordIds.length > 0) {
      const filtered = allWords.filter(w => customWordIds.includes(w.id));
      return { words: filtered, insufficient: false, matchingCount: filtered.length };
    }

    let pool = [...allWords];

    // Mode-specific filtering
    if (settings.mode === 'mistakes') {
      const mistakeWords = dataService.getMistakes();
      pool = masteryService.prioritizeMistakes(mistakeWords);
      if (pool.length === 0) {
        // Fallback to practicing/learning words
        pool = allWords.filter(w => w.status === 'learning' || w.status === 'needsReview');
      }
    } else if (settings.mode === 'daily') {
      // Deterministic selection based on current date
      const todayDate = new Date().toISOString().split('T')[0];
      const randomFunc = this.getSeededRandom(todayDate);
      const shuffled = [...allWords].sort(() => 0.5 - randomFunc());
      const dailyWords = shuffled.slice(0, Math.min(10, shuffled.length));
      return { words: dailyWords, insufficient: false, matchingCount: dailyWords.length };
    } else {
      // Difficulty filter
      if (settings.difficulty !== 'Mixed') {
        pool = pool.filter(w => w.difficulty === settings.difficulty);
      }

      // Category filter
      if (settings.category !== 'All Categories') {
        pool = pool.filter(w => w.category === settings.category);
      }
    }

    const matchingCount = pool.length;
    const requestedCount = settings.wordCount || 10;
    const insufficient = matchingCount < requestedCount;

    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(requestedCount, matchingCount));

    return { words: selected, insufficient, matchingCount };
  }

  /**
   * Initializes a new practice session with frozen word list and settings.
   */
  public createSession(
    settings: SessionSettings,
    customWordIds?: string[],
    title?: string,
    assignmentId?: string
  ): PracticeSession {
    const allWords = dataService.getWords();
    const { words } = this.selectWordsForSession(allWords, settings, customWordIds);

    const defaultTitle = 
      title ||
      (settings.mode === 'quick' ? `Quick Drill (${words.length} Words)` :
       settings.mode === 'competition' ? 'Competition Simulation' :
       settings.mode === 'mistakes' ? 'Mistakes Review Session' :
       settings.mode === 'daily' ? `Daily Challenge - ${new Date().toLocaleDateString('en-GB')}` :
       settings.mode === 'assignment' ? 'Teacher Assigned Practice' :
       'Focused Practice Drill');

    const session: PracticeSession = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      studentId: 'std_01',
      title: defaultTitle,
      mode: settings.mode,
      wordIds: words.map(w => w.id),
      currentIndex: 0,
      attempts: [],
      score: 0,
      accuracy: 0,
      correctCount: 0,
      incorrectCount: 0,
      skippedCount: 0,
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      status: 'active',
      difficulty: settings.difficulty,
      category: settings.category,
      timeLimit: settings.timeLimitPerWordSeconds || 45,
      settings,
      assignmentId
    };

    return session;
  }

  /**
   * Submits a student's spelling attempt for the active question.
   */
  public submitAnswer(
    session: PracticeSession,
    currentWord: Word,
    studentAnswer: string,
    timeTakenSeconds: number = 0,
    listenedCount: number = 1
  ): {
    session: PracticeSession;
    validation: ReturnType<typeof validateSpelling>;
    attempt: SpellingAttempt;
  } {
    const validation = validateSpelling(studentAnswer, currentWord);

    const attempt: SpellingAttempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      sessionId: session.id,
      studentId: session.studentId,
      wordId: currentWord.id,
      studentAnswer,
      expectedAnswer: currentWord.word,
      isCorrect: validation.isCorrect,
      isSkipped: false,
      errorType: validation.errorType,
      timeTakenSeconds,
      listenedCount,
      timestamp: new Date().toISOString(),
      mode: session.mode
    };

    // Update attempts array
    session.attempts.push(attempt);

    if (validation.isCorrect) {
      session.correctCount += 1;
      session.score += 10;
      dataService.resolveMistake(currentWord.id);
    } else {
      session.incorrectCount += 1;
      dataService.recordMistake(currentWord.id);
    }

    // Update session running accuracy
    const totalAnswered = session.correctCount + session.incorrectCount;
    session.accuracy = totalAnswered > 0 ? Math.round((session.correctCount / totalAnswered) * 100) : 0;
    session.durationSeconds += timeTakenSeconds;

    // Record in mastery service
    masteryService.recordAttempt(attempt);

    return { session, validation, attempt };
  }

  /**
   * Skips the current question if mode permits.
   */
  public skipQuestion(
    session: PracticeSession,
    currentWord: Word,
    timeTakenSeconds: number = 0
  ): PracticeSession {
    const attempt: SpellingAttempt = {
      id: `att_${Date.now()}_skip`,
      sessionId: session.id,
      studentId: session.studentId,
      wordId: currentWord.id,
      studentAnswer: '(Skipped)',
      expectedAnswer: currentWord.word,
      isCorrect: false,
      isSkipped: true,
      errorType: 'completely_different',
      timeTakenSeconds,
      listenedCount: 1,
      timestamp: new Date().toISOString(),
      mode: session.mode
    };

    session.attempts.push(attempt);
    session.skippedCount += 1;
    session.durationSeconds += timeTakenSeconds;

    return session;
  }

  /**
   * Finalizes the session, updates all student stats, evaluates achievements, and persists results.
   */
  public finalizeSession(session: PracticeSession): PracticeSession {
    session.status = 'completed';
    session.completedAt = new Date().toISOString();

    const attemptedCount = session.correctCount + session.incorrectCount;
    session.accuracy = attemptedCount > 0 ? Math.round((session.correctCount / attemptedCount) * 100) : 0;

    // Persist via data service
    dataService.recordPracticeSessionResult(session);

    return session;
  }
}

export const practiceSessionService = new PracticeSessionService();
