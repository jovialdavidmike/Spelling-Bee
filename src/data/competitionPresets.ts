import { Competition, CompetitionMode, CompetitionRound } from '../types';

export interface CompetitionPreset {
  id: string;
  name: string;
  description: string;
  mode: CompetitionMode;
  roundsCount: number;
  wordsPerRound: number;
  timePerWord: number; // seconds
  scoring: { correctPoints: number; incorrectPoints: number; timeoutPoints: number; timeBonusEnabled: boolean };
  qualificationType: 'all' | 'top_n' | 'top_percentage' | 'pass_mark' | 'sudden_death';
  qualificationValue: number;
  allowReplay: boolean;
  allowDefinition: boolean;
  allowExample: boolean;
}

export const COMPETITION_PRESETS: CompetitionPreset[] = [
  {
    id: 'preset_quick_sim',
    name: 'Quick Solo Simulation',
    description: '10 curriculum words with 30s per-word timer. Ideal for daily competition warm-up.',
    mode: 'practice_simulation',
    roundsCount: 1,
    wordsPerRound: 10,
    timePerWord: 30,
    scoring: { correctPoints: 1, incorrectPoints: 0, timeoutPoints: 0, timeBonusEnabled: false },
    qualificationType: 'all',
    qualificationValue: 100,
    allowReplay: true,
    allowDefinition: true,
    allowExample: false
  },
  {
    id: 'preset_timed_test',
    name: 'Timed Speed Challenge',
    description: '15 words with a strict 20-second countdown. Tests rapid phonetic spelling recall.',
    mode: 'timed_test',
    roundsCount: 1,
    wordsPerRound: 15,
    timePerWord: 20,
    scoring: { correctPoints: 10, incorrectPoints: 0, timeoutPoints: 0, timeBonusEnabled: true },
    qualificationType: 'pass_mark',
    qualificationValue: 80,
    allowReplay: true,
    allowDefinition: false,
    allowExample: false
  },
  {
    id: 'preset_class_heat',
    name: 'Classroom Championship (2 Rounds)',
    description: 'Round 1 Qualifier (Top 50% advance) followed by a decisive Final Round.',
    mode: 'class_competition',
    roundsCount: 2,
    wordsPerRound: 10,
    timePerWord: 30,
    scoring: { correctPoints: 1, incorrectPoints: 0, timeoutPoints: 0, timeBonusEnabled: false },
    qualificationType: 'top_percentage',
    qualificationValue: 50,
    allowReplay: true,
    allowDefinition: true,
    allowExample: true
  },
  {
    id: 'preset_multi_round',
    name: 'Standard 3-Round Tournament',
    description: 'Preliminary (Top 8 advance) → Semi-Final (Top 4 advance) → Championship Final.',
    mode: 'multi_round',
    roundsCount: 3,
    wordsPerRound: 8,
    timePerWord: 30,
    scoring: { correctPoints: 1, incorrectPoints: 0, timeoutPoints: 0, timeBonusEnabled: false },
    qualificationType: 'top_n',
    qualificationValue: 8,
    allowReplay: true,
    allowDefinition: false,
    allowExample: false
  },
  {
    id: 'preset_elimination',
    name: 'Sudden-Death Survival Heats',
    description: 'Participants must achieve a minimum 80% pass mark each round to remain in the competition.',
    mode: 'elimination',
    roundsCount: 3,
    wordsPerRound: 6,
    timePerWord: 25,
    scoring: { correctPoints: 1, incorrectPoints: 0, timeoutPoints: 0, timeBonusEnabled: false },
    qualificationType: 'pass_mark',
    qualificationValue: 80,
    allowReplay: false,
    allowDefinition: false,
    allowExample: false
  }
];

export const INITIAL_COMPETITIONS: Competition[] = [
  {
    id: 'comp_01',
    title: 'Federal Inter-Collegiate Spelling Championship 2026',
    description: 'Secondary School Junior & Senior Spelling Challenge. Real-time moderator audio heats.',
    organizerId: 't_01',
    organizerName: 'Mr. David Mike',
    classId: 'class_ss1_gold',
    className: 'SS 1 Gold',
    accessCode: 'SPB-7K4P',
    mode: 'multi_round',
    status: 'ready',
    currentRoundIndex: 0,
    currentWordIndex: 0,
    createdAt: '2026-09-20',
    scheduledAt: '2026-09-26T10:00:00Z',
    participantIds: ['std_01', 'std_02', 'std_03', 'std_04', 'std_05', 'std_06', 'std_08'],
    settings: {
      scoring: { correctPoints: 1, incorrectPoints: 0, timeoutPoints: 0, timeBonusEnabled: false },
      randomizeWordOrder: false,
      sharedWordSequence: true,
      preventCopyPaste: true,
      trackTabSwitching: true,
      showLeaderboardToStudents: true,
      disconnectionGracePeriodSeconds: 45,
      voiceModerator: { enabled: true, voiceName: 'Kore', speechRate: 0.88 }
    },
    rounds: [
      {
        id: 'r_01_prelim',
        competitionId: 'comp_01',
        name: 'Round 1: Preliminary Qualifier',
        order: 1,
        wordIds: ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8'],
        status: 'pending',
        settings: {
          timePerWord: 30,
          roundTimeLimitMinutes: 10,
          allowReplay: true,
          maxReplaysAllowed: 2,
          allowDefinition: true,
          allowExample: false,
          strictPunctuation: false,
          caseSensitive: false,
          showImmediateFeedback: false,
          voiceName: 'Kore'
        },
        qualificationRule: {
          type: 'top_n',
          value: 4,
          tieBreaker: 'extra_round'
        }
      },
      {
        id: 'r_01_semi',
        competitionId: 'comp_01',
        name: 'Round 2: Semi-Finals',
        order: 2,
        wordIds: ['w9', 'w10', 'w11', 'w12', 'w13', 'w14'],
        status: 'pending',
        settings: {
          timePerWord: 25,
          roundTimeLimitMinutes: 8,
          allowReplay: true,
          maxReplaysAllowed: 1,
          allowDefinition: false,
          allowExample: false,
          strictPunctuation: false,
          caseSensitive: false,
          showImmediateFeedback: false,
          voiceName: 'Kore'
        },
        qualificationRule: {
          type: 'top_n',
          value: 2,
          tieBreaker: 'all_tied_advance'
        }
      },
      {
        id: 'r_01_final',
        competitionId: 'comp_01',
        name: 'Round 3: Championship Final',
        order: 3,
        wordIds: ['w15', 'w16', 'w17', 'w18', 'w19'],
        status: 'pending',
        settings: {
          timePerWord: 30,
          roundTimeLimitMinutes: 6,
          allowReplay: true,
          maxReplaysAllowed: 1,
          allowDefinition: true,
          allowExample: true,
          strictPunctuation: false,
          caseSensitive: false,
          showImmediateFeedback: false,
          voiceName: 'Kore'
        },
        qualificationRule: {
          type: 'top_n',
          value: 1,
          tieBreaker: 'extra_round'
        }
      }
    ],
    participants: [
      {
        studentId: 'std_01',
        studentName: 'Amara Okafor',
        studentCode: 'CCA-SS1-001',
        className: 'SS 1 Gold',
        status: 'ready',
        currentRoundId: 'r_01_prelim',
        totalScore: 0,
        totalAccuracy: 0,
        correctCount: 0,
        incorrectCount: 0,
        timeoutCount: 0,
        totalDurationSeconds: 0,
        roundScores: {},
        attentionEvents: []
      },
      {
        studentId: 'std_02',
        studentName: 'Chidi Obi',
        studentCode: 'CCA-SS1-002',
        className: 'SS 1 Gold',
        status: 'ready',
        currentRoundId: 'r_01_prelim',
        totalScore: 0,
        totalAccuracy: 0,
        correctCount: 0,
        incorrectCount: 0,
        timeoutCount: 0,
        totalDurationSeconds: 0,
        roundScores: {},
        attentionEvents: []
      },
      {
        studentId: 'std_03',
        studentName: 'Fatima Bello',
        studentCode: 'CCA-SS1-003',
        className: 'SS 1 Gold',
        status: 'ready',
        currentRoundId: 'r_01_prelim',
        totalScore: 0,
        totalAccuracy: 0,
        correctCount: 0,
        incorrectCount: 0,
        timeoutCount: 0,
        totalDurationSeconds: 0,
        roundScores: {},
        attentionEvents: []
      },
      {
        studentId: 'std_04',
        studentName: 'Daniel Eze',
        studentCode: 'CCA-SS1-004',
        className: 'SS 1 Gold',
        status: 'ready',
        currentRoundId: 'r_01_prelim',
        totalScore: 0,
        totalAccuracy: 0,
        correctCount: 0,
        incorrectCount: 0,
        timeoutCount: 0,
        totalDurationSeconds: 0,
        roundScores: {},
        attentionEvents: []
      },
      {
        studentId: 'std_05',
        studentName: 'Samuel Adeyemi',
        studentCode: 'CCA-SS1-005',
        className: 'SS 1 Gold',
        status: 'ready',
        currentRoundId: 'r_01_prelim',
        totalScore: 0,
        totalAccuracy: 0,
        correctCount: 0,
        incorrectCount: 0,
        timeoutCount: 0,
        totalDurationSeconds: 0,
        roundScores: {},
        attentionEvents: []
      },
      {
        studentId: 'std_08',
        studentName: 'Kenechukwu Umeh',
        studentCode: 'CCA-SS1-006',
        className: 'SS 1 Gold',
        status: 'ready',
        currentRoundId: 'r_01_prelim',
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
  },
  {
    id: 'comp_02',
    title: 'JSS 3 Speed & Accuracy Invitational',
    description: 'Fast-paced timed spelling competition for Junior Secondary spellers.',
    organizerId: 't_01',
    organizerName: 'Mr. David Mike',
    classId: 'class_jss3_emerald',
    className: 'JSS 3 Emerald',
    accessCode: 'SPB-2M9Y',
    mode: 'timed_test',
    status: 'scheduled',
    currentRoundIndex: 0,
    currentWordIndex: 0,
    createdAt: '2026-09-22',
    scheduledAt: '2026-09-29T11:00:00Z',
    participantIds: ['std_07'],
    settings: {
      scoring: { correctPoints: 10, incorrectPoints: 0, timeoutPoints: 0, timeBonusEnabled: true },
      randomizeWordOrder: true,
      sharedWordSequence: true,
      preventCopyPaste: true,
      trackTabSwitching: true,
      showLeaderboardToStudents: false,
      disconnectionGracePeriodSeconds: 30,
      voiceModerator: { enabled: true, voiceName: 'Puck', speechRate: 0.9 }
    },
    rounds: [
      {
        id: 'r_02_sprint',
        competitionId: 'comp_02',
        name: 'Sprint Round (20s limit)',
        order: 1,
        wordIds: ['w1', 'w3', 'w5', 'w7', 'w9', 'w11', 'w13', 'w15'],
        status: 'pending',
        settings: {
          timePerWord: 20,
          roundTimeLimitMinutes: 5,
          allowReplay: true,
          maxReplaysAllowed: 2,
          allowDefinition: false,
          allowExample: false,
          strictPunctuation: false,
          caseSensitive: false,
          showImmediateFeedback: false,
          voiceName: 'Puck'
        },
        qualificationRule: {
          type: 'pass_mark',
          value: 75,
          tieBreaker: 'fastest_time'
        }
      }
    ],
    participants: []
  },
  {
    id: 'comp_03_completed',
    title: 'National Science & Tech Vocabulary Derby',
    description: 'Completed 3-round elimination heat covering WAEC & BECE technical and science terminology.',
    organizerId: 't_01',
    organizerName: 'Mr. David Mike',
    classId: 'class_ss1_gold',
    className: 'SS 1 Gold',
    accessCode: 'SPB-9X1Q',
    mode: 'elimination',
    status: 'completed',
    currentRoundIndex: 2,
    currentWordIndex: 5,
    createdAt: '2026-09-18',
    completedAt: '2026-09-18T15:30:00Z',
    participantIds: ['std_01', 'std_02', 'std_03', 'std_04', 'std_05'],
    settings: {
      scoring: { correctPoints: 1, incorrectPoints: 0, timeoutPoints: 0, timeBonusEnabled: false },
      randomizeWordOrder: false,
      sharedWordSequence: true,
      preventCopyPaste: true,
      trackTabSwitching: true,
      showLeaderboardToStudents: true,
      disconnectionGracePeriodSeconds: 30,
      voiceModerator: { enabled: true, voiceName: 'Kore', speechRate: 0.88 }
    },
    rounds: [
      {
        id: 'r_03_1',
        competitionId: 'comp_03_completed',
        name: 'Round 1: Qualifying Heat',
        order: 1,
        wordIds: ['w1', 'w2', 'w3', 'w4', 'w5'],
        status: 'completed',
        settings: {
          timePerWord: 30,
          roundTimeLimitMinutes: 5,
          allowReplay: true,
          maxReplaysAllowed: 2,
          allowDefinition: true,
          allowExample: false,
          strictPunctuation: false,
          caseSensitive: false,
          showImmediateFeedback: false,
          voiceName: 'Kore'
        },
        qualificationRule: { type: 'top_n', value: 4, tieBreaker: 'extra_round' }
      },
      {
        id: 'r_03_2',
        competitionId: 'comp_03_completed',
        name: 'Round 2: Semi-Finals',
        order: 2,
        wordIds: ['w6', 'w7', 'w8', 'w9', 'w10'],
        status: 'completed',
        settings: {
          timePerWord: 25,
          roundTimeLimitMinutes: 4,
          allowReplay: true,
          maxReplaysAllowed: 1,
          allowDefinition: false,
          allowExample: false,
          strictPunctuation: false,
          caseSensitive: false,
          showImmediateFeedback: false,
          voiceName: 'Kore'
        },
        qualificationRule: { type: 'top_n', value: 2, tieBreaker: 'extra_round' }
      },
      {
        id: 'r_03_3',
        competitionId: 'comp_03_completed',
        name: 'Round 3: Championship Final',
        order: 3,
        wordIds: ['w11', 'w12', 'w13', 'w14', 'w15'],
        status: 'completed',
        settings: {
          timePerWord: 30,
          roundTimeLimitMinutes: 5,
          allowReplay: true,
          maxReplaysAllowed: 1,
          allowDefinition: true,
          allowExample: true,
          strictPunctuation: false,
          caseSensitive: false,
          showImmediateFeedback: false,
          voiceName: 'Kore'
        },
        qualificationRule: { type: 'top_n', value: 1, tieBreaker: 'extra_round' }
      }
    ],
    participants: [
      {
        studentId: 'std_01',
        studentName: 'Amara Okafor',
        studentCode: 'CCA-SS1-001',
        className: 'SS 1 Gold',
        status: 'completed',
        currentRoundId: 'r_03_3',
        totalScore: 14,
        totalAccuracy: 93,
        correctCount: 14,
        incorrectCount: 1,
        timeoutCount: 0,
        totalDurationSeconds: 185,
        rank: 1,
        roundScores: {
          r_03_1: { roundId: 'r_03_1', roundName: 'Round 1: Qualifying Heat', score: 5, accuracy: 100, correctCount: 5, incorrectCount: 0, timeoutCount: 0, status: 'qualified', totalDurationSeconds: 58, answers: [] },
          r_03_2: { roundId: 'r_03_2', roundName: 'Round 2: Semi-Finals', score: 5, accuracy: 100, correctCount: 5, incorrectCount: 0, timeoutCount: 0, status: 'qualified', totalDurationSeconds: 62, answers: [] },
          r_03_3: { roundId: 'r_03_3', roundName: 'Round 3: Championship Final', score: 4, accuracy: 80, correctCount: 4, incorrectCount: 1, timeoutCount: 0, status: 'qualified', totalDurationSeconds: 65, answers: [] }
        },
        attentionEvents: []
      },
      {
        studentId: 'std_02',
        studentName: 'Chidi Obi',
        studentCode: 'CCA-SS1-002',
        className: 'SS 1 Gold',
        status: 'completed',
        currentRoundId: 'r_03_3',
        totalScore: 12,
        totalAccuracy: 80,
        correctCount: 12,
        incorrectCount: 3,
        timeoutCount: 0,
        totalDurationSeconds: 210,
        rank: 2,
        roundScores: {
          r_03_1: { roundId: 'r_03_1', roundName: 'Round 1: Qualifying Heat', score: 4, accuracy: 80, correctCount: 4, incorrectCount: 1, timeoutCount: 0, status: 'qualified', totalDurationSeconds: 70, answers: [] },
          r_03_2: { roundId: 'r_03_2', roundName: 'Round 2: Semi-Finals', score: 4, accuracy: 80, correctCount: 4, incorrectCount: 1, timeoutCount: 0, status: 'qualified', totalDurationSeconds: 68, answers: [] },
          r_03_3: { roundId: 'r_03_3', roundName: 'Round 3: Championship Final', score: 4, accuracy: 80, correctCount: 4, incorrectCount: 1, timeoutCount: 0, status: 'qualified', totalDurationSeconds: 72, answers: [] }
        },
        attentionEvents: []
      },
      {
        studentId: 'std_04',
        studentName: 'Daniel Eze',
        studentCode: 'CCA-SS1-004',
        className: 'SS 1 Gold',
        status: 'eliminated',
        currentRoundId: 'r_03_2',
        totalScore: 7,
        totalAccuracy: 70,
        correctCount: 7,
        incorrectCount: 3,
        timeoutCount: 0,
        totalDurationSeconds: 155,
        rank: 3,
        roundScores: {
          r_03_1: { roundId: 'r_03_1', roundName: 'Round 1: Qualifying Heat', score: 4, accuracy: 80, correctCount: 4, incorrectCount: 1, timeoutCount: 0, status: 'qualified', totalDurationSeconds: 75, answers: [] },
          r_03_2: { roundId: 'r_03_2', roundName: 'Round 2: Semi-Finals', score: 3, accuracy: 60, correctCount: 3, incorrectCount: 2, timeoutCount: 0, status: 'eliminated', totalDurationSeconds: 80, answers: [] }
        },
        attentionEvents: []
      }
    ]
  }
];
