import { Word, WordStatus, WordMasteryRecord, SpellingAttempt } from '../types';

export const MASTERY_CONFIG = {
  REQUIRED_CORRECT_COUNT: 3,
  MIN_MASTERY_ACCURACY: 0.8,
  CONSECUTIVE_CORRECT_MASTERY: 2,
};

class MasteryService {
  private records: Map<string, WordMasteryRecord> = new Map();

  /**
   * Initializes or gets the mastery record for a word.
   */
  public getRecord(wordId: string, studentId: string = 'std_01'): WordMasteryRecord {
    const key = `${studentId}_${wordId}`;
    if (!this.records.has(key)) {
      this.records.set(key, {
        wordId,
        studentId,
        status: 'new',
        attemptsCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        consecutiveCorrect: 0,
        consecutiveIncorrect: 0,
        accuracy: 0,
        lastAttempted: '',
        isSavedForLater: false
      });
    }
    return this.records.get(key)!;
  }

  /**
   * Updates word mastery statistics after a student spelling attempt.
   */
  public recordAttempt(attempt: SpellingAttempt): WordStatus {
    const record = this.getRecord(attempt.wordId, attempt.studentId);

    record.attemptsCount += 1;
    record.lastAttempted = attempt.timestamp;

    if (attempt.isCorrect) {
      record.correctCount += 1;
      record.consecutiveCorrect += 1;
      record.consecutiveIncorrect = 0;
    } else {
      record.incorrectCount += 1;
      record.consecutiveIncorrect += 1;
      record.consecutiveCorrect = 0;
      record.lastMistakeAnswer = attempt.studentAnswer;
    }

    record.accuracy = record.attemptsCount > 0 
      ? Math.round((record.correctCount / record.attemptsCount) * 100)
      : 0;

    // Determine updated WordStatus
    let newStatus: WordStatus = 'learning';

    if (
      record.correctCount >= MASTERY_CONFIG.REQUIRED_CORRECT_COUNT &&
      record.accuracy >= (MASTERY_CONFIG.MIN_MASTERY_ACCURACY * 100) &&
      record.consecutiveCorrect >= MASTERY_CONFIG.CONSECUTIVE_CORRECT_MASTERY
    ) {
      newStatus = 'mastered';
    } else if (record.consecutiveIncorrect >= 1 || (!attempt.isCorrect && record.accuracy < 60)) {
      newStatus = 'needsReview';
    } else if (record.attemptsCount >= 2) {
      newStatus = 'practicing';
    } else {
      newStatus = 'learning';
    }

    record.status = newStatus;
    return newStatus;
  }

  /**
   * Toggles whether a word is in the student's personal "Practice Later" list.
   */
  public toggleSaveForLater(wordId: string, studentId: string = 'std_01'): boolean {
    const record = this.getRecord(wordId, studentId);
    record.isSavedForLater = !record.isSavedForLater;
    return record.isSavedForLater;
  }

  public isWordSaved(wordId: string, studentId: string = 'std_01'): boolean {
    const record = this.getRecord(wordId, studentId);
    return !!record.isSavedForLater;
  }

  /**
   * Sorts mistake words by learning priority:
   * 1. Repeated mistakes (highest consecutive/total incorrect)
   * 2. Lowest accuracy
   * 3. Recent attempts
   */
  public prioritizeMistakes(words: Word[], studentId: string = 'std_01'): Word[] {
    return [...words].sort((a, b) => {
      const recA = this.getRecord(a.id, studentId);
      const recB = this.getRecord(b.id, studentId);

      if (recB.incorrectCount !== recA.incorrectCount) {
        return recB.incorrectCount - recA.incorrectCount;
      }
      if (recA.accuracy !== recB.accuracy) {
        return recA.accuracy - recB.accuracy;
      }
      return (recB.lastAttempted || '').localeCompare(recA.lastAttempted || '');
    });
  }

  /**
   * Returns list of words marked as mastered.
   */
  public getMasteredWordIds(studentId: string = 'std_01'): string[] {
    const ids: string[] = [];
    this.records.forEach((record) => {
      if (record.studentId === studentId && record.status === 'mastered') {
        ids.push(record.wordId);
      }
    });
    return ids;
  }

  /**
   * Returns saved words for practice later.
   */
  public getSavedWordIds(studentId: string = 'std_01'): string[] {
    const ids: string[] = [];
    this.records.forEach((record) => {
      if (record.studentId === studentId && record.isSavedForLater) {
        ids.push(record.wordId);
      }
    });
    return ids;
  }
}

export const masteryService = new MasteryService();
