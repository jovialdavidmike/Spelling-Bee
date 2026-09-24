import { Word, DifficultyLevel } from './index';

export type CompetitionMode = 
  | 'practice_simulation' // Mode A: student practices solo under simulation conditions
  | 'timed_test'          // Mode B: fixed words with strict time limits
  | 'class_competition'   // Mode C: single/multi-round heat among classmates
  | 'multi_round'         // Mode D: preliminary -> round 2 -> semi-final -> final
  | 'elimination';        // Mode E: survival elimination per round

export type CompetitionStatus = 
  | 'draft'
  | 'scheduled'
  | 'registration_open'
  | 'ready'
  | 'live'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'archived';

export type ParticipantStatus = 
  | 'registered'
  | 'ready'
  | 'active'
  | 'qualified'
  | 'eliminated'
  | 'completed'
  | 'disconnected';

export type QualificationRuleType = 
  | 'all'             // all participants advance
  | 'top_n'           // top N participants with highest scores advance
  | 'top_percentage'  // top X% advance (e.g. 50%)
  | 'pass_mark'       // score >= X% advance (e.g. 80%)
  | 'sudden_death';   // only 100% correct advance

export type TieBreakerRule = 
  | 'extra_round'         // automatic tie-breaker round
  | 'all_tied_advance'    // all tied participants advance
  | 'fastest_time'        // lowest response time breaks tie
  | 'teacher_decision';   // moderator manually resolves

export interface RoundSettings {
  timePerWord: number; // seconds (0 = no limit, 15, 20, 30, 45, 60, custom)
  roundTimeLimitMinutes: number; // 0 = no limit
  allowReplay: boolean;
  maxReplaysAllowed: number;
  allowDefinition: boolean;
  allowExample: boolean;
  strictPunctuation: boolean;
  caseSensitive: boolean;
  showImmediateFeedback: boolean; // false during competition, true for practice
  voiceName: 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon';
}

export interface QualificationRule {
  type: QualificationRuleType;
  value: number; // N for top_n, % for pass_mark/top_percentage
  tieBreaker: TieBreakerRule;
}

export interface CompetitionRound {
  id: string;
  competitionId: string;
  name: string; // e.g. "Round 1 - Preliminary", "Round 2 - Semi-Final", "Final Round", "Tie-Breaker"
  order: number;
  wordIds: string[];
  words?: Word[];
  settings: RoundSettings;
  qualificationRule: QualificationRule;
  isTieBreaker?: boolean;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface CompetitionAnswerRecord {
  attemptId: string;
  roundId: string;
  wordId: string;
  wordText: string;
  submittedText: string;
  isCorrect: boolean;
  isTimeout: boolean;
  isInvalidated?: boolean;
  invalidationReason?: string;
  responseTimeMs: number;
  submittedAt: string;
}

export interface ParticipantRoundScore {
  roundId: string;
  roundName: string;
  score: number;
  accuracy: number;
  correctCount: number;
  incorrectCount: number;
  timeoutCount: number;
  status: 'qualified' | 'eliminated' | 'pending';
  totalDurationSeconds: number;
  answers: CompetitionAnswerRecord[];
}

export interface CompetitionParticipant {
  studentId: string;
  studentName: string;
  studentCode: string;
  className: string;
  status: ParticipantStatus;
  currentRoundId: string;
  totalScore: number;
  totalAccuracy: number;
  correctCount: number;
  incorrectCount: number;
  timeoutCount: number;
  totalDurationSeconds: number;
  rank?: number;
  roundScores: Record<string, ParticipantRoundScore>;
  attentionEvents: {
    type: 'visibilityHidden' | 'visibilityRestored' | 'reconnected' | 'disconnected';
    timestamp: string;
    note?: string;
  }[];
}

export interface CompetitionGlobalSettings {
  scoring: {
    correctPoints: number; // e.g. +1 or +10
    incorrectPoints: number; // e.g. 0 or -2
    timeoutPoints: number; // e.g. 0
    timeBonusEnabled: boolean; // bonus points for fast responses
  };
  randomizeWordOrder: boolean;
  sharedWordSequence: boolean; // all students receive same sequence simultaneously
  preventCopyPaste: boolean;
  trackTabSwitching: boolean;
  showLeaderboardToStudents: boolean;
  disconnectionGracePeriodSeconds: number;
  voiceModerator: {
    enabled: boolean;
    voiceName: 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon';
    speechRate: number;
  };
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  organizerId: string;
  organizerName?: string;
  classId: string;
  className: string;
  accessCode: string; // e.g. "SPB-7K4P"
  mode: CompetitionMode;
  status: CompetitionStatus;
  rounds: CompetitionRound[];
  settings: CompetitionGlobalSettings;
  participantIds: string[];
  participants: CompetitionParticipant[];
  currentRoundIndex: number;
  currentWordIndex: number;
  createdAt: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  isSimulation?: boolean; // When true, does not affect official class results
  endedBy?: string;
  cancelledReason?: string;
  invalidatedWordIds?: { wordId: string; reason: string; timestamp: string }[];
}

export interface CompetitionResultSnapshot {
  id: string;
  competitionId: string;
  competitionTitle: string;
  date: string;
  classId: string;
  className: string;
  mode: CompetitionMode;
  isSimulation: boolean;
  totalParticipants: number;
  completedParticipants: number;
  qualifiedParticipants: number;
  eliminatedParticipants: number;
  winnerStudentId?: string;
  winnerStudentName?: string;
  averageAccuracy: number;
  averageResponseTimeSec: number;
  mostMissedWords: {
    word: string;
    missedCount: number;
    accuracy: number;
  }[];
  standings: {
    rank: number;
    studentId: string;
    studentName: string;
    studentCode: string;
    finalScore: number;
    finalAccuracy: number;
    correctCount: number;
    incorrectCount: number;
    timeoutCount: number;
    totalDurationSeconds: number;
    qualificationStatus: string;
    roundSummaries: { roundName: string; score: number; accuracy: number }[];
  }[];
  rulesSnapshot: {
    mode: CompetitionMode;
    totalRounds: number;
    totalWords: number;
    timePerWord: number;
    scoring: { correct: number; incorrect: number };
  };
}
