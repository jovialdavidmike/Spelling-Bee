import {
  Competition,
  CompetitionRound,
  CompetitionParticipant,
  CompetitionAnswerRecord,
  CompetitionResultSnapshot,
  CompetitionStatus,
  CompetitionMode,
  QualificationRule
} from '../types';
import { INITIAL_COMPETITIONS } from '../data/competitionPresets';
import { dataService } from './dataService';

const STORAGE_KEYS = {
  COMPETITIONS: 'spellready_competitions',
  RESULTS: 'spellready_competition_results',
  ACTIVE_SESSION: 'spellready_active_competition_session'
};

class CompetitionService {
  private competitions: Competition[] = [];
  private results: CompetitionResultSnapshot[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const storedComps = localStorage.getItem(STORAGE_KEYS.COMPETITIONS);
      if (storedComps) {
        this.competitions = JSON.parse(storedComps);
      } else {
        this.competitions = [...INITIAL_COMPETITIONS];
        this.persist(STORAGE_KEYS.COMPETITIONS, this.competitions);
      }

      const storedResults = localStorage.getItem(STORAGE_KEYS.RESULTS);
      if (storedResults) {
        this.results = JSON.parse(storedResults);
      }
    } catch (e) {
      console.warn('Failed to load competitions from storage', e);
      this.competitions = [...INITIAL_COMPETITIONS];
    }
  }

  private persist(key: string, data: any) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`Failed to persist ${key}`, e);
    }
  }

  public getCompetitions(filter?: { status?: CompetitionStatus; classId?: string; mode?: string }): Competition[] {
    let list = this.competitions.filter(c => c.status !== 'archived');
    if (!filter) return list;
    if (filter.status) list = list.filter(c => c.status === filter.status);
    if (filter.classId) list = list.filter(c => c.classId === filter.classId);
    if (filter.mode) list = list.filter(c => c.mode === filter.mode);
    return list;
  }

  public getAllCompetitionsIncludingArchived(): Competition[] {
    return this.competitions;
  }

  public getCompetitionById(id: string): Competition | undefined {
    return this.competitions.find(c => c.id === id);
  }

  public getCompetitionByCode(code: string): Competition | undefined {
    const formatted = code.trim().toUpperCase();
    return this.competitions.find(c => c.accessCode.toUpperCase() === formatted);
  }

  public validateCompetition(c: Partial<Competition>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!c.title || c.title.trim().length < 3) {
      errors.push('Competition title must be at least 3 characters.');
    }
    if (!c.classId && c.mode !== 'practice_simulation') {
      errors.push('Target class must be selected.');
    }
    if (!c.participantIds || c.participantIds.length === 0) {
      if (c.mode !== 'practice_simulation') {
        errors.push('At least one participant must be added.');
      }
    }
    if (!c.rounds || c.rounds.length === 0) {
      errors.push('At least one round must be configured.');
    } else {
      c.rounds.forEach((r, idx) => {
        if (!r.wordIds || r.wordIds.length === 0) {
          errors.push(`Round ${idx + 1} (${r.name}) has no words in its word pool.`);
        }
      });
    }
    return { valid: errors.length === 0, errors };
  }

  public createCompetition(data: Partial<Competition>): Competition {
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newComp: Competition = {
      id: `comp_${Date.now()}`,
      title: data.title || 'Untitled Competition Heat',
      description: data.description || 'Competition Simulation Heat',
      organizerId: data.organizerId || 't_01',
      organizerName: data.organizerName || 'Class Moderator',
      classId: data.classId || 'class_ss1_gold',
      className: data.className || 'SS 1 Gold',
      accessCode: data.accessCode || `SPB-${randomSuffix}`,
      mode: data.mode || 'class_competition',
      status: data.status || 'draft',
      rounds: data.rounds || [],
      settings: data.settings || {
        scoring: { correctPoints: 1, incorrectPoints: 0, timeoutPoints: 0, timeBonusEnabled: false },
        randomizeWordOrder: false,
        sharedWordSequence: true,
        preventCopyPaste: true,
        trackTabSwitching: true,
        showLeaderboardToStudents: true,
        disconnectionGracePeriodSeconds: 30,
        voiceModerator: { enabled: true, voiceName: 'Kore', speechRate: 0.88 }
      },
      participantIds: data.participantIds || [],
      participants: data.participants || [],
      currentRoundIndex: 0,
      currentWordIndex: 0,
      createdAt: new Date().toISOString().split('T')[0],
      scheduledAt: data.scheduledAt,
      isSimulation: data.isSimulation || data.mode === 'practice_simulation'
    };

    // Populate participant objects from enrolled students if missing
    if (newComp.participants.length === 0 && newComp.participantIds.length > 0) {
      const enrolled = dataService.getEnrolledStudents();
      const initialRoundId = newComp.rounds[0]?.id || 'round_1';
      newComp.participants = newComp.participantIds.map(pId => {
        const student = enrolled.find(s => s.id === pId);
        return {
          studentId: pId,
          studentName: student?.name || 'Speller Candidate',
          studentCode: student?.studentCode || 'SP-001',
          className: student?.className || newComp.className,
          status: 'ready' as const,
          currentRoundId: initialRoundId,
          totalScore: 0,
          totalAccuracy: 0,
          correctCount: 0,
          incorrectCount: 0,
          timeoutCount: 0,
          totalDurationSeconds: 0,
          roundScores: {},
          attentionEvents: []
        };
      });
    }

    this.competitions.unshift(newComp);
    this.persist(STORAGE_KEYS.COMPETITIONS, this.competitions);
    return newComp;
  }

  public updateCompetition(id: string, updates: Partial<Competition>): Competition | undefined {
    const comp = this.competitions.find(c => c.id === id);
    if (comp) {
      Object.assign(comp, updates);
      this.persist(STORAGE_KEYS.COMPETITIONS, this.competitions);
    }
    return comp;
  }

  public duplicateCompetition(id: string, newTitle?: string): Competition | undefined {
    const orig = this.competitions.find(c => c.id === id);
    if (!orig) return undefined;

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const clonedRounds = orig.rounds.map((r, i) => ({
      ...r,
      id: `r_clone_${Date.now()}_${i}`,
      status: 'pending' as const,
      words: undefined
    }));

    const cloned: Competition = {
      ...orig,
      id: `comp_${Date.now()}`,
      title: newTitle || `${orig.title} (Copy)`,
      status: 'draft',
      accessCode: `SPB-${randomSuffix}`,
      currentRoundIndex: 0,
      currentWordIndex: 0,
      createdAt: new Date().toISOString().split('T')[0],
      scheduledAt: undefined,
      startedAt: undefined,
      completedAt: undefined,
      rounds: clonedRounds,
      // Reset participants & scores per Prompt 5 requirement
      participants: orig.participantIds.map(pId => {
        const student = dataService.getEnrolledStudents().find(s => s.id === pId);
        return {
          studentId: pId,
          studentName: student?.name || 'Speller Candidate',
          studentCode: student?.studentCode || 'SP-001',
          className: student?.className || orig.className,
          status: 'registered' as const,
          currentRoundId: clonedRounds[0]?.id || 'round_1',
          totalScore: 0,
          totalAccuracy: 0,
          correctCount: 0,
          incorrectCount: 0,
          timeoutCount: 0,
          totalDurationSeconds: 0,
          roundScores: {},
          attentionEvents: []
        };
      })
    };

    this.competitions.unshift(cloned);
    this.persist(STORAGE_KEYS.COMPETITIONS, this.competitions);
    return cloned;
  }

  public archiveCompetition(id: string): boolean {
    const comp = this.competitions.find(c => c.id === id);
    if (comp) {
      comp.status = 'archived';
      this.persist(STORAGE_KEYS.COMPETITIONS, this.competitions);
      return true;
    }
    return false;
  }

  public cancelCompetition(id: string, reason: string): boolean {
    const comp = this.competitions.find(c => c.id === id);
    if (comp) {
      comp.status = 'cancelled';
      comp.cancelledReason = reason;
      this.persist(STORAGE_KEYS.COMPETITIONS, this.competitions);
      return true;
    }
    return false;
  }

  public startCompetition(id: string): Competition | undefined {
    const comp = this.competitions.find(c => c.id === id);
    if (!comp) return undefined;
    comp.status = 'live';
    comp.startedAt = new Date().toISOString();
    comp.currentRoundIndex = 0;
    comp.currentWordIndex = 0;
    if (comp.rounds[0]) {
      comp.rounds[0].status = 'in_progress';
    }
    // Set all participants to active
    comp.participants.forEach(p => {
      p.status = 'active';
      p.currentRoundId = comp.rounds[0]?.id || '';
    });
    this.persist(STORAGE_KEYS.COMPETITIONS, this.competitions);
    return comp;
  }

  public pauseCompetition(id: string): boolean {
    const comp = this.competitions.find(c => c.id === id);
    if (comp && comp.status === 'live') {
      comp.status = 'paused';
      this.persist(STORAGE_KEYS.COMPETITIONS, this.competitions);
      return true;
    }
    return false;
  }

  public resumeCompetition(id: string): boolean {
    const comp = this.competitions.find(c => c.id === id);
    if (comp && comp.status === 'paused') {
      comp.status = 'live';
      this.persist(STORAGE_KEYS.COMPETITIONS, this.competitions);
      return true;
    }
    return false;
  }

  public advanceWord(competitionId: string): { roundComplete: boolean; competitionComplete: boolean } {
    const comp = this.competitions.find(c => c.id === competitionId);
    if (!comp) return { roundComplete: false, competitionComplete: false };

    const currentRound = comp.rounds[comp.currentRoundIndex];
    if (!currentRound) return { roundComplete: true, competitionComplete: true };

    if (comp.currentWordIndex < currentRound.wordIds.length - 1) {
      comp.currentWordIndex += 1;
      this.persist(STORAGE_KEYS.COMPETITIONS, this.competitions);
      return { roundComplete: false, competitionComplete: false };
    } else {
      // Current round words finished!
      return { roundComplete: true, competitionComplete: comp.currentRoundIndex >= comp.rounds.length - 1 };
    }
  }

  /**
   * Word Invalidation (Prompt 5 requirement)
   * Preserves historical attempts but excludes word from official scoring
   */
  public invalidateWord(competitionId: string, wordId: string, reason: string): boolean {
    const comp = this.competitions.find(c => c.id === competitionId);
    if (!comp) return false;

    if (!comp.invalidatedWordIds) {
      comp.invalidatedWordIds = [];
    }
    comp.invalidatedWordIds.push({
      wordId,
      reason,
      timestamp: new Date().toISOString()
    });

    // Mark attempt records as invalidated and recalculate scores
    comp.participants.forEach(p => {
      Object.values(p.roundScores).forEach(rs => {
        rs.answers.forEach(a => {
          if (a.wordId === wordId) {
            a.isInvalidated = true;
            a.invalidationReason = reason;
          }
        });
        // Recalculate round score ignoring invalidated answers
        const validAnswers = rs.answers.filter(a => !a.isInvalidated);
        rs.correctCount = validAnswers.filter(a => a.isCorrect).length;
        rs.incorrectCount = validAnswers.filter(a => !a.isCorrect && !a.isTimeout).length;
        rs.timeoutCount = validAnswers.filter(a => a.isTimeout).length;
        rs.score = rs.correctCount * comp.settings.scoring.correctPoints;
        rs.accuracy = validAnswers.length > 0 ? Math.round((rs.correctCount / validAnswers.length) * 100) : 0;
      });
      // Recalculate participant totals
      const allValid = Object.values(p.roundScores).flatMap(rs => rs.answers.filter(a => !a.isInvalidated));
      p.correctCount = allValid.filter(a => a.isCorrect).length;
      p.incorrectCount = allValid.filter(a => !a.isCorrect && !a.isTimeout).length;
      p.timeoutCount = allValid.filter(a => a.isTimeout).length;
      p.totalScore = p.correctCount * comp.settings.scoring.correctPoints;
      p.totalAccuracy = allValid.length > 0 ? Math.round((p.correctCount / allValid.length) * 100) : 0;
    });

    this.persist(STORAGE_KEYS.COMPETITIONS, this.competitions);
    return true;
  }

  /**
   * Submit an answer with strict normalization, timestamp, and single-submit protection
   */
  public submitAnswer(params: {
    competitionId: string;
    roundId: string;
    studentId: string;
    wordId: string;
    submittedText: string;
    responseTimeMs: number;
    isTimeout?: boolean;
  }): { record: CompetitionAnswerRecord; isCorrect: boolean } {
    const comp = this.competitions.find(c => c.id === params.competitionId);
    if (!comp) throw new Error('Competition not found');

    const participant = comp.participants.find(p => p.studentId === params.studentId);
    if (!participant) throw new Error('Participant not enrolled');

    const word = dataService.getWordById(params.wordId);
    const targetWord = word?.word || '';
    const cleanSubmitted = params.submittedText.trim();

    // Check correctness: exact case-insensitive match (or match accepted alternatives)
    let isCorrect = false;
    if (!params.isTimeout && cleanSubmitted) {
      if (cleanSubmitted.toLowerCase() === targetWord.toLowerCase()) {
        isCorrect = true;
      }
    }

    const round = comp.rounds.find(r => r.id === params.roundId) || comp.rounds[0];
    const roundName = round?.name || 'Round';

    // Ensure round score entry exists
    if (!participant.roundScores[params.roundId]) {
      participant.roundScores[params.roundId] = {
        roundId: params.roundId,
        roundName,
        score: 0,
        accuracy: 0,
        correctCount: 0,
        incorrectCount: 0,
        timeoutCount: 0,
        status: 'pending',
        totalDurationSeconds: 0,
        answers: []
      };
    }

    const roundScore = participant.roundScores[params.roundId];

    // Check for duplicate submission prevention (idempotency)
    const existing = roundScore.answers.find(a => a.wordId === params.wordId);
    if (existing) {
      return { record: existing, isCorrect: existing.isCorrect };
    }

    const record: CompetitionAnswerRecord = {
      attemptId: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      roundId: params.roundId,
      wordId: params.wordId,
      wordText: targetWord,
      submittedText: cleanSubmitted,
      isCorrect,
      isTimeout: Boolean(params.isTimeout),
      responseTimeMs: params.responseTimeMs,
      submittedAt: new Date().toISOString()
    };

    roundScore.answers.push(record);
    roundScore.totalDurationSeconds += Math.round(params.responseTimeMs / 1000);

    if (isCorrect) {
      roundScore.correctCount += 1;
      participant.correctCount += 1;
      let points = comp.settings.scoring.correctPoints;
      if (comp.settings.scoring.timeBonusEnabled && params.responseTimeMs < 10000) {
        points += 2; // rapid response bonus
      }
      roundScore.score += points;
      participant.totalScore += points;
    } else if (params.isTimeout) {
      roundScore.timeoutCount += 1;
      participant.timeoutCount += 1;
      roundScore.score += comp.settings.scoring.timeoutPoints;
      participant.totalScore += comp.settings.scoring.timeoutPoints;
    } else {
      roundScore.incorrectCount += 1;
      participant.incorrectCount += 1;
      roundScore.score += comp.settings.scoring.incorrectPoints;
      participant.totalScore += comp.settings.scoring.incorrectPoints;
    }

    roundScore.accuracy = Math.round((roundScore.correctCount / roundScore.answers.length) * 100);

    // Calculate participant overall totals
    const allAnswers = Object.values(participant.roundScores).flatMap(rs => rs.answers);
    participant.totalAccuracy = allAnswers.length > 0 
      ? Math.round((participant.correctCount / allAnswers.length) * 100) 
      : 0;
    participant.totalDurationSeconds += Math.round(params.responseTimeMs / 1000);

    // Also register attempt in student progress if not a disposable simulation
    if (!comp.isSimulation && params.studentId) {
      dataService.recordSpellingAttempt(
        params.studentId,
        params.wordId,
        cleanSubmitted,
        isCorrect,
        'competition',
        params.responseTimeMs
      );
    }

    this.persist(STORAGE_KEYS.COMPETITIONS, this.competitions);
    return { record, isCorrect };
  }

  /**
   * Log attention / anti-cheating events (tab switching, disconnect)
   */
  public logAttentionEvent(competitionId: string, studentId: string, type: 'visibilityHidden' | 'visibilityRestored' | 'reconnected' | 'disconnected', note?: string) {
    const comp = this.competitions.find(c => c.id === competitionId);
    if (!comp) return;
    const participant = comp.participants.find(p => p.studentId === studentId);
    if (!participant) return;
    participant.attentionEvents.push({
      type,
      timestamp: new Date().toISOString(),
      note
    });
    this.persist(STORAGE_KEYS.COMPETITIONS, this.competitions);
  }

  /**
   * Calculate Qualification & Elimination for a Round
   */
  public calculateRoundQualification(
    round: CompetitionRound,
    participants: CompetitionParticipant[]
  ): {
    qualifiedIds: string[];
    eliminatedIds: string[];
    tieDetected: boolean;
    tiedIds: string[];
  } {
    const rule = round.qualificationRule;
    const activeParticipants = participants.filter(p => p.status === 'active' || p.status === 'ready' || p.status === 'qualified');

    // Sort by current round score descending, then by response time ascending
    const scored = activeParticipants.map(p => {
      const rs = p.roundScores[round.id];
      return {
        studentId: p.studentId,
        score: rs?.score || 0,
        accuracy: rs?.accuracy || 0,
        duration: rs?.totalDurationSeconds || 9999
      };
    }).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      return a.duration - b.duration;
    });

    if (rule.type === 'all') {
      return {
        qualifiedIds: scored.map(s => s.studentId),
        eliminatedIds: [],
        tieDetected: false,
        tiedIds: []
      };
    }

    if (rule.type === 'pass_mark') {
      const qualified = scored.filter(s => s.accuracy >= rule.value).map(s => s.studentId);
      const eliminated = scored.filter(s => s.accuracy < rule.value).map(s => s.studentId);
      return { qualifiedIds: qualified, eliminatedIds: eliminated, tieDetected: false, tiedIds: [] };
    }

    if (rule.type === 'sudden_death') {
      const qualified = scored.filter(s => s.accuracy === 100).map(s => s.studentId);
      const eliminated = scored.filter(s => s.accuracy < 100).map(s => s.studentId);
      return { qualifiedIds: qualified, eliminatedIds: eliminated, tieDetected: false, tiedIds: [] };
    }

    // Top N or Top Percentage
    let targetCount = rule.value;
    if (rule.type === 'top_percentage') {
      targetCount = Math.max(1, Math.round((scored.length * rule.value) / 100));
    }

    if (scored.length <= targetCount) {
      return {
        qualifiedIds: scored.map(s => s.studentId),
        eliminatedIds: [],
        tieDetected: false,
        tiedIds: []
      };
    }

    const cutoffScore = scored[targetCount - 1].score;
    // Check if there are participants tied at the boundary
    const tiedAtCutoff = scored.filter(s => s.score === cutoffScore);
    const strictlyAbove = scored.filter(s => s.score > cutoffScore);

    if (strictlyAbove.length + tiedAtCutoff.length > targetCount && tiedAtCutoff.length > 1) {
      // Tie detected at cutoff!
      if (rule.tieBreaker === 'all_tied_advance') {
        const qualified = [...strictlyAbove, ...tiedAtCutoff].map(s => s.studentId);
        const eliminated = scored.filter(s => s.score < cutoffScore).map(s => s.studentId);
        return { qualifiedIds: qualified, eliminatedIds: eliminated, tieDetected: false, tiedIds: [] };
      } else if (rule.tieBreaker === 'fastest_time') {
        // Break tie using lowest duration
        const sortedTied = [...tiedAtCutoff].sort((a, b) => a.duration - b.duration);
        const needed = targetCount - strictlyAbove.length;
        const advancedFromTied = sortedTied.slice(0, needed);
        const eliminatedFromTied = sortedTied.slice(needed);

        const qualified = [...strictlyAbove, ...advancedFromTied].map(s => s.studentId);
        const eliminated = [...eliminatedFromTied, ...scored.filter(s => s.score < cutoffScore)].map(s => s.studentId);
        return { qualifiedIds: qualified, eliminatedIds: eliminated, tieDetected: false, tiedIds: [] };
      } else {
        // Needs Extra Round or Moderator Decision
        return {
          qualifiedIds: strictlyAbove.map(s => s.studentId),
          eliminatedIds: scored.filter(s => s.score < cutoffScore).map(s => s.studentId),
          tieDetected: true,
          tiedIds: tiedAtCutoff.map(s => s.studentId)
        };
      }
    }

    const qualified = scored.slice(0, targetCount).map(s => s.studentId);
    const eliminated = scored.slice(targetCount).map(s => s.studentId);
    return { qualifiedIds: qualified, eliminatedIds: eliminated, tieDetected: false, tiedIds: [] };
  }

  /**
   * Finalize a Round and Advance Qualified Participants
   */
  public completeRound(competitionId: string, roundId: string): {
    nextRound?: CompetitionRound;
    isComplete: boolean;
    qualification: { qualifiedIds: string[]; eliminatedIds: string[]; tieDetected: boolean; tiedIds: string[] };
  } {
    const comp = this.competitions.find(c => c.id === competitionId);
    if (!comp) throw new Error('Competition not found');

    const roundIndex = comp.rounds.findIndex(r => r.id === roundId);
    if (roundIndex === -1) throw new Error('Round not found');

    const currentRound = comp.rounds[roundIndex];
    currentRound.status = 'completed';

    const qual = this.calculateRoundQualification(currentRound, comp.participants);

    // Update participants status
    comp.participants.forEach(p => {
      if (qual.qualifiedIds.includes(p.studentId)) {
        p.status = 'qualified';
        if (p.roundScores[roundId]) {
          p.roundScores[roundId].status = 'qualified';
        }
      } else if (qual.eliminatedIds.includes(p.studentId)) {
        p.status = 'eliminated';
        if (p.roundScores[roundId]) {
          p.roundScores[roundId].status = 'eliminated';
        }
      }
    });

    const isLastRound = roundIndex >= comp.rounds.length - 1;

    if (isLastRound || qual.tieDetected) {
      if (isLastRound && !qual.tieDetected) {
        this.completeCompetition(competitionId);
      }
      this.persist(STORAGE_KEYS.COMPETITIONS, this.competitions);
      return { isComplete: isLastRound, qualification: qual };
    }

    // Advance to next round
    comp.currentRoundIndex = roundIndex + 1;
    comp.currentWordIndex = 0;
    const nextRound = comp.rounds[comp.currentRoundIndex];
    nextRound.status = 'in_progress';

    // Move qualified participants to next round
    comp.participants.forEach(p => {
      if (qual.qualifiedIds.includes(p.studentId)) {
        p.status = 'active';
        p.currentRoundId = nextRound.id;
      }
    });

    this.persist(STORAGE_KEYS.COMPETITIONS, this.competitions);
    return { nextRound, isComplete: false, qualification: qual };
  }

  /**
   * Create an Automatic Tie-Breaker Round
   */
  public createTieBreakerRound(competitionId: string, tiedStudentIds: string[], tieWordIds: string[]): CompetitionRound {
    const comp = this.competitions.find(c => c.id === competitionId);
    if (!comp) throw new Error('Competition not found');

    const tieRound: CompetitionRound = {
      id: `r_tie_${Date.now()}`,
      competitionId,
      name: 'Sudden-Death Tie-Breaker Round',
      order: comp.rounds.length + 1,
      wordIds: tieWordIds.length > 0 ? tieWordIds : ['w1', 'w2', 'w3'],
      isTieBreaker: true,
      status: 'in_progress',
      settings: {
        timePerWord: 20,
        roundTimeLimitMinutes: 5,
        allowReplay: false,
        maxReplaysAllowed: 0,
        allowDefinition: false,
        allowExample: false,
        strictPunctuation: false,
        caseSensitive: false,
        showImmediateFeedback: false,
        voiceName: comp.settings.voiceModerator.voiceName || 'Kore'
      },
      qualificationRule: {
        type: 'top_n',
        value: 1,
        tieBreaker: 'fastest_time'
      }
    };

    comp.rounds.push(tieRound);
    comp.currentRoundIndex = comp.rounds.length - 1;
    comp.currentWordIndex = 0;

    // Set tied participants to active for the tie-break
    comp.participants.forEach(p => {
      if (tiedStudentIds.includes(p.studentId)) {
        p.status = 'active';
        p.currentRoundId = tieRound.id;
      }
    });

    this.persist(STORAGE_KEYS.COMPETITIONS, this.competitions);
    return tieRound;
  }

  /**
   * Complete Competition & Create Durable Historical Result Snapshot
   */
  public completeCompetition(competitionId: string): CompetitionResultSnapshot {
    const comp = this.competitions.find(c => c.id === competitionId);
    if (!comp) throw new Error('Competition not found');

    comp.status = 'completed';
    comp.completedAt = new Date().toISOString();

    // Calculate final rankings
    const sorted = [...comp.participants].sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.totalAccuracy !== a.totalAccuracy) return b.totalAccuracy - a.totalAccuracy;
      return a.totalDurationSeconds - b.totalDurationSeconds;
    });

    sorted.forEach((p, idx) => {
      p.rank = idx + 1;
    });

    const winner = sorted[0];

    // Aggregate mistake statistics
    const mistakeMap = new Map<string, { missedCount: number; totalAttempts: number }>();
    comp.participants.forEach(p => {
      Object.values(p.roundScores).forEach(rs => {
        rs.answers.forEach(a => {
          if (!a.isInvalidated) {
            const entry = mistakeMap.get(a.wordText) || { missedCount: 0, totalAttempts: 0 };
            entry.totalAttempts += 1;
            if (!a.isCorrect) {
              entry.missedCount += 1;
            }
            mistakeMap.set(a.wordText, entry);
          }
        });
      });
    });

    const mostMissedWords = Array.from(mistakeMap.entries())
      .filter(([_, v]) => v.missedCount > 0)
      .map(([word, v]) => ({
        word,
        missedCount: v.missedCount,
        accuracy: Math.round(((v.totalAttempts - v.missedCount) / v.totalAttempts) * 100)
      }))
      .sort((a, b) => b.missedCount - a.missedCount)
      .slice(0, 10);

    const totalAccuracy = comp.participants.length > 0
      ? Math.round(comp.participants.reduce((acc, p) => acc + p.totalAccuracy, 0) / comp.participants.length)
      : 0;

    const totalDuration = comp.participants.length > 0
      ? Math.round(comp.participants.reduce((acc, p) => acc + p.totalDurationSeconds, 0) / comp.participants.length)
      : 0;

    const snapshot: CompetitionResultSnapshot = {
      id: `res_${comp.id}_${Date.now()}`,
      competitionId: comp.id,
      competitionTitle: comp.title,
      date: new Date().toISOString().split('T')[0],
      classId: comp.classId,
      className: comp.className,
      mode: comp.mode,
      isSimulation: Boolean(comp.isSimulation),
      totalParticipants: comp.participants.length,
      completedParticipants: comp.participants.filter(p => p.status === 'completed' || p.status === 'qualified' || p.status === 'eliminated').length,
      qualifiedParticipants: comp.participants.filter(p => p.status === 'qualified').length,
      eliminatedParticipants: comp.participants.filter(p => p.status === 'eliminated').length,
      winnerStudentId: winner?.studentId,
      winnerStudentName: winner?.studentName,
      averageAccuracy: totalAccuracy,
      averageResponseTimeSec: totalDuration,
      mostMissedWords,
      standings: sorted.map((p, idx) => ({
        rank: idx + 1,
        studentId: p.studentId,
        studentName: p.studentName,
        studentCode: p.studentCode,
        finalScore: p.totalScore,
        finalAccuracy: p.totalAccuracy,
        correctCount: p.correctCount,
        incorrectCount: p.incorrectCount,
        timeoutCount: p.timeoutCount,
        totalDurationSeconds: p.totalDurationSeconds,
        qualificationStatus: p.status,
        roundSummaries: Object.values(p.roundScores).map(rs => ({
          roundName: rs.roundName,
          score: rs.score,
          accuracy: rs.accuracy
        }))
      })),
      rulesSnapshot: {
        mode: comp.mode,
        totalRounds: comp.rounds.length,
        totalWords: comp.rounds.reduce((acc, r) => acc + r.wordIds.length, 0),
        timePerWord: comp.rounds[0]?.settings.timePerWord || 30,
        scoring: {
          correct: comp.settings.scoring.correctPoints,
          incorrect: comp.settings.scoring.incorrectPoints
        }
      }
    };

    this.results.unshift(snapshot);
    this.persist(STORAGE_KEYS.RESULTS, this.results);
    this.persist(STORAGE_KEYS.COMPETITIONS, this.competitions);
    return snapshot;
  }

  public getCompetitionResults(competitionId?: string): CompetitionResultSnapshot[] {
    if (competitionId) {
      return this.results.filter(r => r.competitionId === competitionId);
    }
    return this.results;
  }

  public getCompetitionResultById(resultId: string): CompetitionResultSnapshot | undefined {
    return this.results.find(r => r.id === resultId);
  }

  public getStudentCompetitionHistory(studentId: string): { competition: Competition; participant: CompetitionParticipant }[] {
    const history: { competition: Competition; participant: CompetitionParticipant }[] = [];
    this.competitions.forEach(c => {
      const p = c.participants.find(part => part.studentId === studentId);
      if (p && (c.status === 'completed' || Object.keys(p.roundScores).length > 0)) {
        history.push({ competition: c, participant: p });
      }
    });
    return history;
  }

  /**
   * Export Competition Results to CSV
   */
  public exportCompetitionResultsCSV(competitionId: string): string {
    const comp = this.competitions.find(c => c.id === competitionId);
    if (!comp) return '';

    const headers = [
      'Rank',
      'Student Name',
      'Student Code',
      'Class',
      'Total Score',
      'Accuracy (%)',
      'Correct Count',
      'Incorrect Count',
      'Timeouts',
      'Total Duration (s)',
      'Status'
    ];

    const sorted = [...comp.participants].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
    const rows = sorted.map((p, idx) => [
      idx + 1,
      `"${p.studentName}"`,
      `"${p.studentCode}"`,
      `"${p.className}"`,
      p.totalScore,
      `${p.totalAccuracy}%`,
      p.correctCount,
      p.incorrectCount,
      p.timeoutCount,
      p.totalDurationSeconds,
      `"${p.status}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  /**
   * Create Instant Practice Assignment from Competition Mistakes (Prompt 5 requirement)
   */
  public createPracticeAssignmentFromCompetitionMistakes(competitionId: string, targetClassId?: string): any {
    const comp = this.competitions.find(c => c.id === competitionId);
    if (!comp) return null;

    const missedWordIds = new Set<string>();
    comp.participants.forEach(p => {
      Object.values(p.roundScores).forEach(rs => {
        rs.answers.forEach(a => {
          if (!a.isCorrect && !a.isInvalidated) {
            missedWordIds.add(a.wordId);
          }
        });
      });
    });

    const wordIdsList = Array.from(missedWordIds);
    if (wordIdsList.length === 0) {
      wordIdsList.push('w1', 'w2', 'w3', 'w4', 'w5'); // fallback sample
    }

    return dataService.createAssignment({
      title: `Remedial Drill: ${comp.title}`,
      description: `Targeted practice generated from words missed during ${comp.title}.`,
      targetClass: comp.className,
      classId: targetClassId || comp.classId,
      wordCount: wordIdsList.length,
      difficulty: 'Mixed',
      category: 'All Categories',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignedStudentIds: comp.participantIds,
      wordIds: wordIdsList,
      mode: 'practice',
      timeLimitMinutes: 10,
      settings: {
        attemptsAllowed: 3,
        timeLimitMinutes: 10,
        randomizeWords: true,
        allowReplay: true,
        allowDefinition: true,
        allowExample: true,
        immediateFeedback: true,
        passingScore: 80,
        allowLateSubmission: true
      }
    });
  }

  /**
   * Launch a Self-Paced Competition Simulation for Student
   */
  public createSoloSimulation(wordCount = 10, timePerWord = 30, studentId = 'std_01'): Competition {
    const student = dataService.getEnrolledStudents().find(s => s.id === studentId);
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const allWords = dataService.getWords();
    const shuffled = [...allWords].sort(() => 0.5 - Math.random());
    const selectedWords = shuffled.slice(0, wordCount);

    const sim: Competition = {
      id: `sim_${Date.now()}`,
      title: 'Competition Practice Simulation',
      description: 'Self-paced simulation with timed prompts and natural voice moderator.',
      organizerId: 'system',
      organizerName: 'Automated Moderator',
      classId: student?.classId || 'class_ss1_gold',
      className: student?.className || 'SS 1 Gold',
      accessCode: `SIM-${randomSuffix}`,
      mode: 'practice_simulation',
      status: 'live',
      currentRoundIndex: 0,
      currentWordIndex: 0,
      createdAt: new Date().toISOString().split('T')[0],
      startedAt: new Date().toISOString(),
      isSimulation: true,
      participantIds: [studentId],
      settings: {
        scoring: { correctPoints: 1, incorrectPoints: 0, timeoutPoints: 0, timeBonusEnabled: false },
        randomizeWordOrder: false,
        sharedWordSequence: true,
        preventCopyPaste: true,
        trackTabSwitching: true,
        showLeaderboardToStudents: false,
        disconnectionGracePeriodSeconds: 30,
        voiceModerator: { enabled: true, voiceName: 'Kore', speechRate: 0.88 }
      },
      rounds: [
        {
          id: `r_sim_${Date.now()}`,
          competitionId: `sim_${Date.now()}`,
          name: 'Simulation Round (10 Words)',
          order: 1,
          wordIds: selectedWords.map(w => w.id),
          words: selectedWords,
          status: 'in_progress',
          settings: {
            timePerWord,
            roundTimeLimitMinutes: 8,
            allowReplay: true,
            maxReplaysAllowed: 2,
            allowDefinition: true,
            allowExample: true,
            strictPunctuation: false,
            caseSensitive: false,
            showImmediateFeedback: false,
            voiceName: 'Kore'
          },
          qualificationRule: {
            type: 'all',
            value: 100,
            tieBreaker: 'all_tied_advance'
          }
        }
      ],
      participants: [
        {
          studentId,
          studentName: student?.name || 'Speller Student',
          studentCode: student?.studentCode || 'SP-001',
          className: student?.className || 'SS 1 Gold',
          status: 'active',
          currentRoundId: `r_sim_${Date.now()}`,
          totalScore: 0,
          totalAccuracy: 0,
          correctCount: 0,
          incorrectCount: 0,
          timeoutCount: 0,
          totalDurationSeconds: 0,
          roundScores: {},
          attentionEvents: []
        }
      ]
    };

    this.competitions.unshift(sim);
    this.persist(STORAGE_KEYS.COMPETITIONS, this.competitions);
    return sim;
  }
}

export const competitionService = new CompetitionService();
