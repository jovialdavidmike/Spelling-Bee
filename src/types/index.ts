import { UserRole } from './auth';
export * from './auth';

export type DifficultyLevel = 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Advanced' | 'Challenge';

export type WordCategory = 
  | 'General Vocabulary'
  | 'Science & Nature'
  | 'Literature & Arts'
  | 'Social Studies'
  | 'Technology'
  | 'Governance & Law'
  | 'Environment'
  | 'Health'
  | 'Academic Vocabulary';

export type WordStatus = 'new' | 'learning' | 'practicing' | 'needsReview' | 'mastered';

export interface Word {
  id: string;
  word: string;
  normalizedWord: string;
  phonetic?: string;
  pronunciation: string;
  phoneticSpelling?: string;
  definition: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'conjunction' | 'preposition';
  exampleSentence: string;
  difficulty: DifficultyLevel;
  category: WordCategory;
  syllables?: number;
  letterCount?: number;
  commonMisspellings?: string[];
  tips?: string;
  relatedWords?: string[];
  tags?: string[];
  acceptedSpellings?: string[];
  origin?: string;
  status?: WordStatus;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  timesPracticed?: number;
  timesCorrect?: number;
}

export type SpellingErrorType = 
  | 'none'
  | 'missing_letter'
  | 'extra_letter'
  | 'wrong_letter'
  | 'transposed_letters'
  | 'multiple_errors'
  | 'completely_different';

export interface SpellingValidationResult {
  isCorrect: boolean;
  studentAnswer: string;
  expectedAnswer: string;
  normalizedStudentAnswer: string;
  normalizedExpectedAnswer: string;
  errorType: SpellingErrorType;
  feedback: string;
  tip?: string;
}

export type PracticeMode = 
  | 'quick'
  | 'focused'
  | 'mistakes'
  | 'daily'
  | 'assignment'
  | 'competition'
  | 'single';

export interface SpellingAttempt {
  id: string;
  sessionId: string;
  studentId: string;
  wordId: string;
  studentAnswer: string;
  expectedAnswer: string;
  isCorrect: boolean;
  isSkipped?: boolean;
  errorType: SpellingErrorType;
  timeTakenSeconds: number;
  listenedCount: number;
  timestamp: string;
  mode: PracticeMode;
}

export type SessionStatus = 'notStarted' | 'active' | 'paused' | 'completed' | 'abandoned';

export interface SessionSettings {
  mode: PracticeMode;
  wordCount: number;
  difficulty: DifficultyLevel | 'Mixed';
  category: WordCategory | 'All Categories';
  timeLimitPerWordSeconds?: number;
  sessionTimeLimitMinutes?: number;
  allowSkip: boolean;
  allowRetry: boolean;
  showDefinitionAfterAnswer: boolean;
  showExampleAfterAnswer: boolean;
  scoringRule: 'standard' | 'competition';
}

export interface PracticeSession {
  id: string;
  studentId: string;
  title: string;
  mode: PracticeMode;
  wordIds: string[];
  currentIndex: number;
  attempts: SpellingAttempt[];
  score: number;
  accuracy: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  status: SessionStatus;
  difficulty: DifficultyLevel | 'Mixed';
  category: WordCategory | 'All Categories';
  timeLimit?: number;
  settings: SessionSettings;
  assignmentId?: string;
}

export interface WordMasteryRecord {
  wordId: string;
  studentId: string;
  status: WordStatus;
  attemptsCount: number;
  correctCount: number;
  incorrectCount: number;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  accuracy: number;
  lastAttempted: string;
  lastMistakeAnswer?: string;
  isSavedForLater?: boolean;
}

export interface Recommendation {
  id: string;
  title: string;
  reason: string;
  action: string;
  targetMode: PracticeMode;
  targetWordIds?: string[];
  targetDifficulty?: DifficultyLevel;
  targetCategory?: WordCategory;
}

export interface DailyChallengeRecord {
  date: string; // YYYY-MM-DD
  wordIds: string[];
  isCompleted: boolean;
  score?: number;
  accuracy?: number;
  completedAt?: string;
}

export interface Student {
  id: string;
  name: string;
  className: string; // e.g., 'JSS 3', 'SS 1', 'SS 2'
  school: string;
  avatarUrl?: string;
  accuracy: number;
  wordsPracticed: number;
  wordsMastered: number;
  currentStreak: number;
  longestStreak: number;
  bestScore: number;
  bestAccuracy: number;
  level: number;
  xpPoints: number;
  recentMistakes: string[]; // word IDs
  savedWords?: string[]; // word IDs saved for later
  dailyGoal: number; // e.g. 20 words
  todayWordsAttempted: number;
  lastPracticeDate?: string;
  practiceHistoryDates?: string[];
}

export interface WeekDayStreak {
  dayName: string;
  fullName: string;
  dateStr: string;
  dayNumber: number;
  isToday: boolean;
  isPast: boolean;
  isPracticed: boolean;
}

export interface StreakMilestone {
  targetDays: number;
  title: string;
  badge: string;
  daysRemaining: number;
  isUnlocked: boolean;
}

export interface StudentStreakData {
  currentStreak: number;
  longestStreak: number;
  isPracticedToday: boolean;
  lastPracticeDate?: string;
  weekDays: WeekDayStreak[];
  nextMilestone: StreakMilestone;
  allMilestones: StreakMilestone[];
  streakStatusMessage: string;
  flameLevel: 'spark' | 'warm' | 'blazing' | 'inferno' | 'legendary';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'practice' | 'accuracy' | 'streak' | 'competition';
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0 - 100
  progressLabel: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  school: string;
  className: string;
  accuracy: number;
  wordsPracticed: number;
  streakDays: number;
  points: number;
  badge?: string;
}

export interface WeeklyTopSpeller {
  rank: number;
  id: string;
  name: string;
  avatarUrl?: string;
  school: string;
  className: string;
  weeklyPracticeSessions: number; // practice frequency (sessions)
  weeklyWordsDrilled: number;    // practice frequency (words)
  weeklyAccuracy: number;        // accuracy %
  weeklyStreakDays: number;      // days practiced this week
  weeklyPoints: number;          // composite score
  badge?: string;                // e.g. 🥇 Weekly Leader, 🥈 Silver Podium, etc.
  isCurrentUser?: boolean;
  trend: 'up' | 'down' | 'same' | 'new';
  rankChange?: number;
}

export interface WeeklyLeaderboardMeta {
  weekNumber: number;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  hoursRemaining: number;
  totalParticipants: number;
  lastUpdated: string;
}

export interface TeacherAssignment {
  id: string;
  teacherId?: string;
  title: string;
  description: string;
  targetClass: string;
  classId?: string;
  wordCount: number;
  difficulty: DifficultyLevel | 'Mixed';
  category: WordCategory | 'All Categories';
  dueDate: string;
  startDate?: string;
  timeLimitMinutes: number;
  assignedCount: number;
  completedCount: number;
  averageAccuracy: number;
  status: 'active' | 'draft' | 'completed' | 'closed' | 'archived';
  mode?: 'practice' | 'assessment' | 'competition' | 'review';
  settings?: {
    attemptsAllowed: number;
    timeLimitMinutes: number;
    timeLimitPerWordSeconds?: number;
    randomizeWords: boolean;
    allowReplay: boolean;
    allowDefinition: boolean;
    allowExample: boolean;
    immediateFeedback: boolean;
    passingScore: number;
    allowLateSubmission: boolean;
  };
  wordIds?: string[];
  assignedStudentIds?: string[];
  customWords?: Word[];
  teacherComments?: Record<string, string>; // studentId -> comment
}

export interface StudentAnswerRecord {
  wordId: string;
  wordText: string;
  submittedAnswer: string;
  expectedAnswer: string;
  isCorrect: boolean;
  responseTimeMs: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentCode?: string;
  className: string;
  classId?: string;
  score: number;
  accuracy: number;
  completedAt: string;
  durationSeconds: number;
  attemptCount: number;
  isLate?: boolean;
  answers?: StudentAnswerRecord[];
  teacherComment?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  code: string; // e.g. "JSS1-A"
  description: string;
  schoolName: string;
  academicSession: string; // e.g. "2026/2027"
  joinCode: string; // e.g. "7K4P9X"
  studentCount: number;
  averageAccuracy: number;
  completionRate: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EnrolledStudent {
  id: string;
  name: string;
  studentCode: string;
  pin: string;
  className: string;
  classId: string;
  school: string;
  wordsPracticed: number;
  wordsMastered: number;
  accuracy: number;
  streakDays: number;
  lastActive: string;
  status: 'On Track' | 'Needs Practice' | 'Strong' | 'Attention Needed';
  level: string;
  notes?: string;
  parentContact?: string;
  weakWords?: string[];
  createdAt?: string;
}

export interface UserAccount {
  id: string;
  role: UserRole;
  name: string;
  email?: string;
  studentCode?: string;
  pin?: string;
  className?: string;
  classId?: string;
  schoolName?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  targetRole: UserRole | 'all';
  targetUserId?: string;
  title: string;
  message: string;
  type: 'assignment' | 'achievement' | 'alert' | 'comment';
  read: boolean;
  createdAt: string;
  linkView?: AppView;
}

export interface SchoolConfig {
  schoolName: string;
  academicSession: string;
  leaderboardEnabled: boolean;
  defaultTimeLimitMinutes: number;
  defaultAttemptsAllowed: number;
  defaultMode: 'practice' | 'assessment' | 'competition';
  voiceFeedbackEnabled: boolean;
}

export interface WordSet {
  id: string;
  title: string;
  description: string;
  wordCount: number;
  difficulty: DifficultyLevel | 'Mixed';
  category: string;
  tags: string[];
  createdAt: string;
  studentsAssigned: number;
  wordIds: string[];
}

export interface TeacherActivityItem {
  id: string;
  studentName: string;
  className: string;
  action: string;
  score: string;
  timestamp: string;
}

export * from './competition';

export type AppView = 
  // Public
  | 'landing'
  | 'about'
  | 'competition-guide'
  // Student
  | 'student-dashboard'
  | 'practice'
  | 'practice-setup'
  | 'competition'
  | 'competition-session'
  | 'competition-results'
  | 'word-library'
  | 'mistakes'
  | 'progress'
  | 'achievements'
  | 'leaderboard'
  | 'weekly-top-spellers'
  | 'student-profile'
  | 'student-settings'
  // Teacher
  | 'teacher-dashboard'
  | 'teacher-classes'
  | 'teacher-students'
  | 'teacher-student-detail'
  | 'teacher-assign'
  | 'teacher-word-sets'
  | 'teacher-reports'
  | 'teacher-competition'
  | 'teacher-competition-builder'
  | 'teacher-competition-live'
  | 'teacher-competition-results'
  | 'teacher-settings';
