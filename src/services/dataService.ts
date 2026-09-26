import {
  Word,
  Student,
  Achievement,
  LeaderboardEntry,
  TeacherAssignment,
  AssignmentSubmission,
  WordSet,
  PracticeSession,
  SpellingAttempt,
  DailyChallengeRecord,
  WordCategory,
  DifficultyLevel,
  ClassRoom,
  EnrolledStudent,
  AppNotification,
  SchoolConfig,
  UserRole,
  StudentStreakData,
  WeekDayStreak,
  StreakMilestone,
  WeeklyTopSpeller,
  WeeklyLeaderboardMeta
} from '../types';
import {
  INITIAL_WORDS,
  INITIAL_STUDENT,
  INITIAL_ACHIEVEMENTS,
  INITIAL_LEADERBOARD,
  INITIAL_ASSIGNMENTS,
  INITIAL_WORD_SETS,
  INITIAL_CLASSES,
  INITIAL_ENROLLED_STUDENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SCHOOL_CONFIG
} from '../data/mockData';
import { userService } from './userService';
import { UserProfile } from '../types/auth';

const STORAGE_KEYS = {
  WORDS: 'spellready_words',
  STUDENT: 'spellready_student',
  SESSIONS: 'spellready_sessions',
  ACHIEVEMENTS: 'spellready_achievements',
  DAILY_CHALLENGES: 'spellready_daily_challenges',
  ASSIGNMENTS: 'spellready_assignments',
  ASSIGNMENT_SUBMISSIONS: 'spellready_assignment_submissions',
  WORD_SETS: 'spellready_word_sets',
  SAVED_WORDS: 'spellready_saved_words',
  CLASSES: 'spellready_classes',
  ENROLLED_STUDENTS: 'spellready_enrolled_students',
  NOTIFICATIONS: 'spellready_notifications',
  SCHOOL_CONFIG: 'spellready_school_config'
};

class DataService {
  private words: Word[] = [];
  private student: Student = { ...INITIAL_STUDENT };
  private achievements: Achievement[] = [...INITIAL_ACHIEVEMENTS];
  private leaderboard: LeaderboardEntry[] = [...INITIAL_LEADERBOARD];
  private assignments: TeacherAssignment[] = [...INITIAL_ASSIGNMENTS];
  private assignmentSubmissions: AssignmentSubmission[] = [];
  private wordSets: WordSet[] = [...INITIAL_WORD_SETS];
  private practiceSessions: PracticeSession[] = [];
  private dailyChallenges: Record<string, DailyChallengeRecord> = {};
  private savedWordIds: Set<string> = new Set(INITIAL_STUDENT.savedWords || []);
  private classes: ClassRoom[] = [...INITIAL_CLASSES];
  private enrolledStudents: EnrolledStudent[] = [...INITIAL_ENROLLED_STUDENTS];
  private notifications: AppNotification[] = [...INITIAL_NOTIFICATIONS];
  private schoolConfig: SchoolConfig = { ...INITIAL_SCHOOL_CONFIG };

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      // 1. Words
      const storedWords = localStorage.getItem(STORAGE_KEYS.WORDS);
      this.words = storedWords ? JSON.parse(storedWords) : [...INITIAL_WORDS];

      // 2. Student
      const storedStudent = localStorage.getItem(STORAGE_KEYS.STUDENT);
      this.student = storedStudent ? JSON.parse(storedStudent) : { ...INITIAL_STUDENT };
      if (!this.student.lastPracticeDate || !this.student.practiceHistoryDates) {
        this.student.lastPracticeDate = this.student.lastPracticeDate || INITIAL_STUDENT.lastPracticeDate;
        this.student.practiceHistoryDates = this.student.practiceHistoryDates || INITIAL_STUDENT.practiceHistoryDates;
      }

      // 3. Sessions
      const storedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      this.practiceSessions = storedSessions ? JSON.parse(storedSessions) : [];

      // 4. Achievements
      const storedAch = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      this.achievements = storedAch ? JSON.parse(storedAch) : [...INITIAL_ACHIEVEMENTS];

      // 5. Daily Challenges
      const storedDaily = localStorage.getItem(STORAGE_KEYS.DAILY_CHALLENGES);
      this.dailyChallenges = storedDaily ? JSON.parse(storedDaily) : {};

      // 6. Assignments
      const storedAsg = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
      this.assignments = storedAsg ? JSON.parse(storedAsg) : [...INITIAL_ASSIGNMENTS];

      // 7. Submissions
      const storedSubs = localStorage.getItem(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS);
      this.assignmentSubmissions = storedSubs ? JSON.parse(storedSubs) : [];

      // 8. Word Sets
      const storedSets = localStorage.getItem(STORAGE_KEYS.WORD_SETS);
      this.wordSets = storedSets ? JSON.parse(storedSets) : [...INITIAL_WORD_SETS];

      // 9. Saved Words
      const storedSaved = localStorage.getItem(STORAGE_KEYS.SAVED_WORDS);
      if (storedSaved) {
        this.savedWordIds = new Set(JSON.parse(storedSaved));
      }

      // 10. Classes
      const storedClasses = localStorage.getItem(STORAGE_KEYS.CLASSES);
      this.classes = storedClasses ? JSON.parse(storedClasses) : [...INITIAL_CLASSES];
      // Ensure test class exists in loaded data
      const testClass = INITIAL_CLASSES.find(c => c.id === 'class_ss_carer_starters_jss1_builders');
      if (testClass && !this.classes.some(c => c.id === testClass.id)) {
        this.classes.push({ ...testClass });
        this.persist(STORAGE_KEYS.CLASSES, this.classes);
      }

      // 11. Enrolled Students
      const storedStudents = localStorage.getItem(STORAGE_KEYS.ENROLLED_STUDENTS);
      this.enrolledStudents = storedStudents ? JSON.parse(storedStudents) : [...INITIAL_ENROLLED_STUDENTS];
      // Ensure all initial enrolled students (including test cohorts) exist in loaded data
      let studentsUpdated = false;
      INITIAL_ENROLLED_STUDENTS.forEach(initSt => {
        if (!this.enrolledStudents.some(s => s.studentCode.toUpperCase() === initSt.studentCode.toUpperCase())) {
          this.enrolledStudents.push({ ...initSt });
          studentsUpdated = true;
        }
      });
      if (studentsUpdated) {
        this.persist(STORAGE_KEYS.ENROLLED_STUDENTS, this.enrolledStudents);
      }

      // Sync Firebase UserProfiles for test students
      this.syncTestStudentProfiles();

      // 12. Notifications
      const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      this.notifications = storedNotifs ? JSON.parse(storedNotifs) : [...INITIAL_NOTIFICATIONS];

      // 13. School Config
      const storedConfig = localStorage.getItem(STORAGE_KEYS.SCHOOL_CONFIG);
      this.schoolConfig = storedConfig ? JSON.parse(storedConfig) : { ...INITIAL_SCHOOL_CONFIG };
    } catch (e) {
      console.warn('LocalStorage access note:', e);
      this.words = [...INITIAL_WORDS];
      this.student = { ...INITIAL_STUDENT };
      this.achievements = [...INITIAL_ACHIEVEMENTS];
      this.assignments = [...INITIAL_ASSIGNMENTS];
      this.wordSets = [...INITIAL_WORD_SETS];
      this.classes = [...INITIAL_CLASSES];
      this.enrolledStudents = [...INITIAL_ENROLLED_STUDENTS];
      this.notifications = [...INITIAL_NOTIFICATIONS];
      this.schoolConfig = { ...INITIAL_SCHOOL_CONFIG };
    }
  }

  private persist(key: string, data: any): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage persist note:', e);
    }
  }

  // --- WORDS ---
  public getWords(): Word[] {
    return this.words;
  }

  public getWordById(id: string): Word | undefined {
    return this.words.find(w => w.id === id);
  }

  public getWordsByIds(ids: string[]): Word[] {
    return this.words.filter(w => ids.includes(w.id));
  }

  public markWordMastered(id: string): void {
    const word = this.words.find(w => w.id === id);
    if (word) {
      word.status = 'mastered';
      if (!this.student.recentMistakes.includes(id)) {
        this.student.wordsMastered = this.words.filter(w => w.status === 'mastered').length;
      }
      this.persist(STORAGE_KEYS.WORDS, this.words);
      this.persist(STORAGE_KEYS.STUDENT, this.student);
    }
  }

  // --- SAVED WORDS (Practice Later) ---
  public toggleSaveWord(id: string): boolean {
    if (this.savedWordIds.has(id)) {
      this.savedWordIds.delete(id);
    } else {
      this.savedWordIds.add(id);
    }
    this.persist(STORAGE_KEYS.SAVED_WORDS, Array.from(this.savedWordIds));
    return this.savedWordIds.has(id);
  }

  public isWordSaved(id: string): boolean {
    return this.savedWordIds.has(id);
  }

  public getSavedWords(): Word[] {
    return this.words.filter(w => this.savedWordIds.has(w.id));
  }

  // --- STUDENT & MASTERY ---
  public getStudent(): Student {
    return this.student;
  }

  public getMistakes(): Word[] {
    return this.words.filter(w => this.student.recentMistakes.includes(w.id));
  }

  public recordMistake(wordId: string): void {
    if (!this.student.recentMistakes.includes(wordId)) {
      this.student.recentMistakes.unshift(wordId);
      this.persist(STORAGE_KEYS.STUDENT, this.student);
    }
  }

  public resolveMistake(wordId: string): void {
    this.student.recentMistakes = this.student.recentMistakes.filter(id => id !== wordId);
    this.persist(STORAGE_KEYS.STUDENT, this.student);
  }

  public recordSpellingAttempt(
    studentId: string,
    wordId: string,
    submittedText: string,
    isCorrect: boolean,
    mode: 'practice' | 'assessment' | 'competition' = 'competition',
    responseTimeMs: number = 0
  ): void {
    if (!isCorrect) {
      this.recordMistake(wordId);
    }
    const student = this.enrolledStudents.find(s => s.id === studentId);
    if (student) {
      student.wordsPracticed += 1;
      if (isCorrect) student.wordsMastered += 1;
      student.accuracy = Math.round((student.wordsMastered / Math.max(1, student.wordsPracticed)) * 100);
      student.lastActive = 'Just now';
      this.persist(STORAGE_KEYS.ENROLLED_STUDENTS, this.enrolledStudents);
    }
  }

  // --- PRACTICE SESSIONS & ATTEMPTS ---
  public recordPracticeSessionResult(session: PracticeSession): void {
    this.practiceSessions.unshift(session);
    this.persist(STORAGE_KEYS.SESSIONS, this.practiceSessions);

    // Update Student cumulative metrics
    const totalAttempted = session.correctCount + session.incorrectCount;
    this.student.wordsPracticed += totalAttempted;
    this.student.todayWordsAttempted += totalAttempted;
    this.student.xpPoints += session.score;

    // Recalculate true cumulative overall accuracy from all completed attempts
    const allAttempts = this.getAllAttempts();
    const totalCorrect = allAttempts.filter(a => a.isCorrect).length;
    const totalAll = allAttempts.length;

    if (totalAll > 0) {
      this.student.accuracy = Math.round((totalCorrect / totalAll) * 100);
    }

    if (session.accuracy > this.student.bestAccuracy) {
      this.student.bestAccuracy = session.accuracy;
    }
    if (session.score > this.student.bestScore) {
      this.student.bestScore = session.score;
    }

    // Update Mastered Words count
    this.student.wordsMastered = this.words.filter(w => w.status === 'mastered').length;

    // Daily Challenge completion recording
    if (session.mode === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      this.dailyChallenges[today] = {
        date: today,
        wordIds: session.wordIds,
        isCompleted: true,
        score: session.score,
        accuracy: session.accuracy,
        completedAt: session.completedAt
      };
      this.persist(STORAGE_KEYS.DAILY_CHALLENGES, this.dailyChallenges);
    }

    // Assignment completion recording
    if (session.mode === 'assignment' && session.assignmentId) {
      const submission: AssignmentSubmission = {
        id: `sub_${Date.now()}`,
        assignmentId: session.assignmentId,
        studentId: this.student.id,
        studentName: this.student.name,
        className: this.student.className,
        score: session.score,
        accuracy: session.accuracy,
        completedAt: session.completedAt || new Date().toISOString(),
        durationSeconds: session.durationSeconds,
        attemptCount: 1
      };
      this.assignmentSubmissions.unshift(submission);
      this.persist(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS, this.assignmentSubmissions);

      // Update teacher assignment stats
      const asg = this.assignments.find(a => a.id === session.assignmentId);
      if (asg) {
        asg.completedCount += 1;
        // Recalculate average
        const subs = this.assignmentSubmissions.filter(s => s.assignmentId === asg.id);
        const avg = Math.round(subs.reduce((acc, curr) => acc + curr.accuracy, 0) / Math.max(1, subs.length));
        asg.averageAccuracy = avg;
        this.persist(STORAGE_KEYS.ASSIGNMENTS, this.assignments);
      }
    }

    // Update daily practice streak
    const sessionDate = session.completedAt ? session.completedAt.split('T')[0] : new Date().toISOString().split('T')[0];
    this.recordPracticeDate(sessionDate);

    this.evaluateAchievements(session);
    this.persist(STORAGE_KEYS.STUDENT, this.student);
  }

  // --- DAILY STREAK TRACKING SYSTEM ---
  public getStudentStreakData(): StudentStreakData {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = this.student.lastPracticeDate;
    
    // Check if practiced today
    const isPracticedToday = lastDate === today;

    // Calculate effective current streak
    let effectiveStreak = this.student.currentStreak || 0;
    if (!isPracticedToday) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate !== yesterdayStr) {
        // More than 1 day has passed without practice: streak is 0 until today's practice is completed
        effectiveStreak = 0;
      }
    }

    const longestStreak = Math.max(this.student.longestStreak || 0, effectiveStreak);
    const historySet = new Set(this.student.practiceHistoryDates || []);
    if (isPracticedToday) {
      historySet.add(today);
    }

    // Generate Monday-Sunday of the current calendar week
    const now = new Date();
    const currentDayOfWeek = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
    const monday = new Date(now);
    monday.setDate(monday.getDate() - currentDayOfWeek);

    const weekDays: WeekDayStreak[] = [];
    const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const fullNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = dateStr === today;
      const isPast = dateStr < today;
      const isPracticed = historySet.has(dateStr);

      weekDays.push({
        dayName: dayNames[i],
        fullName: fullNames[i],
        dateStr,
        dayNumber: d.getDate(),
        isToday,
        isPast,
        isPracticed
      });
    }

    // Flame levels
    let flameLevel: 'spark' | 'warm' | 'blazing' | 'inferno' | 'legendary' = 'spark';
    if (effectiveStreak >= 14) flameLevel = 'legendary';
    else if (effectiveStreak >= 7) flameLevel = 'inferno';
    else if (effectiveStreak >= 3) flameLevel = 'blazing';
    else if (effectiveStreak >= 1) flameLevel = 'warm';

    // Milestones
    const allMilestones: StreakMilestone[] = [
      {
        targetDays: 3,
        title: '3-Day Starter Flame',
        badge: '🥉 Bronze Ember',
        daysRemaining: Math.max(0, 3 - effectiveStreak),
        isUnlocked: effectiveStreak >= 3
      },
      {
        targetDays: 7,
        title: '7-Day Week Warrior',
        badge: '🥈 Silver Blaze',
        daysRemaining: Math.max(0, 7 - effectiveStreak),
        isUnlocked: effectiveStreak >= 7
      },
      {
        targetDays: 14,
        title: '14-Day Champion Streak',
        badge: '🥇 Golden Inferno',
        daysRemaining: Math.max(0, 14 - effectiveStreak),
        isUnlocked: effectiveStreak >= 14
      },
      {
        targetDays: 30,
        title: '30-Day Master of Consistency',
        badge: '🏆 Diamond Phoenix',
        daysRemaining: Math.max(0, 30 - effectiveStreak),
        isUnlocked: effectiveStreak >= 30
      },
      {
        targetDays: 50,
        title: '50-Day National Legend',
        badge: '👑 Legendary Crown',
        daysRemaining: Math.max(0, 50 - effectiveStreak),
        isUnlocked: effectiveStreak >= 50
      }
    ];

    const nextMilestone = allMilestones.find(m => !m.isUnlocked) || allMilestones[allMilestones.length - 1];

    let streakStatusMessage = '';
    if (isPracticedToday) {
      streakStatusMessage = `Flame is blazing! ${effectiveStreak} consecutive day${effectiveStreak === 1 ? '' : 's'} unbroken. You've completed practice today!`;
    } else if (effectiveStreak > 0) {
      streakStatusMessage = `Your ${effectiveStreak}-day streak is waiting! Complete any spelling drill today to keep your flame burning.`;
    } else {
      streakStatusMessage = 'Start your streak today! Complete any practice session to ignite your flame.';
    }

    return {
      currentStreak: effectiveStreak,
      longestStreak,
      isPracticedToday,
      lastPracticeDate: this.student.lastPracticeDate,
      weekDays,
      nextMilestone,
      allMilestones,
      streakStatusMessage,
      flameLevel
    };
  }

  public recordPracticeDate(dateStr?: string): { currentStreak: number; incremented: boolean; isNewMilestone: boolean } {
    const today = dateStr || new Date().toISOString().split('T')[0];
    const lastDate = this.student.lastPracticeDate;
    let incremented = false;
    let isNewMilestone = false;

    if (!this.student.practiceHistoryDates) {
      this.student.practiceHistoryDates = [];
    }

    if (lastDate === today) {
      // Already practiced today, keep history active
      if (!this.student.practiceHistoryDates.includes(today)) {
        this.student.practiceHistoryDates.push(today);
      }
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate === yesterdayStr) {
        // Practiced yesterday: increment streak
        this.student.currentStreak = (this.student.currentStreak || 0) + 1;
        incremented = true;
      } else {
        // Broken streak or first time practice
        this.student.currentStreak = 1;
        incremented = true;
      }

      if (this.student.currentStreak > (this.student.longestStreak || 0)) {
        this.student.longestStreak = this.student.currentStreak;
      }

      this.student.lastPracticeDate = today;
      if (!this.student.practiceHistoryDates.includes(today)) {
        this.student.practiceHistoryDates.push(today);
      }

      // Check milestones
      const milestones = [3, 7, 14, 30, 50];
      if (milestones.includes(this.student.currentStreak)) {
        isNewMilestone = true;
        this.addNotification({
          targetRole: 'student',
          title: `🔥 ${this.student.currentStreak}-Day Practice Streak Achieved!`,
          message: `Incredible dedication! You have achieved an unbroken ${this.student.currentStreak}-day practice streak.`,
          type: 'achievement'
        });
      }
    }

    // Keep enrolled student in sync
    const enrolled = this.enrolledStudents.find(s => s.id === this.student.id);
    if (enrolled) {
      enrolled.streakDays = this.student.currentStreak;
      enrolled.lastActive = 'Just now';
      this.persist(STORAGE_KEYS.ENROLLED_STUDENTS, this.enrolledStudents);
    }

    this.persist(STORAGE_KEYS.STUDENT, this.student);
    return {
      currentStreak: this.student.currentStreak,
      incremented,
      isNewMilestone
    };
  }

  public getPracticeSessions(): PracticeSession[] {
    return this.practiceSessions;
  }

  public getAllAttempts(): SpellingAttempt[] {
    return this.practiceSessions.flatMap(s => s.attempts);
  }

  // --- DAILY CHALLENGE ---
  public isDailyChallengeCompletedToday(): boolean {
    const today = new Date().toISOString().split('T')[0];
    return !!this.dailyChallenges[today]?.isCompleted;
  }

  public getDailyChallengeRecord(): DailyChallengeRecord | undefined {
    const today = new Date().toISOString().split('T')[0];
    return this.dailyChallenges[today];
  }

  // --- ANALYTICS HELPERS ---
  public getCategoryAccuracy(): Record<string, { total: number; correct: number; accuracy: number }> {
    const attempts = this.getAllAttempts();
    const result: Record<string, { total: number; correct: number; accuracy: number }> = {};

    attempts.forEach(att => {
      const word = this.getWordById(att.wordId);
      if (!word) return;
      if (!result[word.category]) {
        result[word.category] = { total: 0, correct: 0, accuracy: 0 };
      }
      result[word.category].total += 1;
      if (att.isCorrect) {
        result[word.category].correct += 1;
      }
    });

    Object.keys(result).forEach(cat => {
      const item = result[cat];
      item.accuracy = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
    });

    return result;
  }

  public getDifficultyAccuracy(): Record<string, { total: number; correct: number; accuracy: number }> {
    const attempts = this.getAllAttempts();
    const result: Record<string, { total: number; correct: number; accuracy: number }> = {
      Beginner: { total: 12, correct: 11, accuracy: 92 },
      Easy: { total: 68, correct: 62, accuracy: 91 },
      Medium: { total: 96, correct: 81, accuracy: 84 },
      Hard: { total: 54, correct: 38, accuracy: 70 },
      Challenge: { total: 30, correct: 18, accuracy: 60 }
    };

    attempts.forEach(att => {
      const word = this.getWordById(att.wordId);
      if (!word) return;
      if (!result[word.difficulty]) {
        result[word.difficulty] = { total: 0, correct: 0, accuracy: 0 };
      }
      result[word.difficulty].total += 1;
      if (att.isCorrect) {
        result[word.difficulty].correct += 1;
      }
    });

    Object.keys(result).forEach(d => {
      const item = result[d];
      item.accuracy = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
    });

    return result;
  }

  // --- ACHIEVEMENTS EVALUATION ---
  public evaluateAchievements(lastSession?: PracticeSession): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    const totalSessions = this.practiceSessions.length;
    const allAttempts = this.getAllAttempts();

    this.achievements.forEach(ach => {
      if (ach.unlocked) return;

      let unlocked = false;

      if (ach.id === 'ach_1' && totalSessions >= 1) {
        unlocked = true;
      } else if (ach.id === 'ach_2' && this.student.wordsMastered >= 100) {
        unlocked = true;
      } else if (ach.id === 'ach_3' && this.student.currentStreak >= 7) {
        unlocked = true;
      } else if (ach.id === 'ach_4' && lastSession && lastSession.accuracy >= 90 && lastSession.attempts.length >= 10) {
        unlocked = true;
      } else if (ach.id === 'ach_5' && lastSession && lastSession.mode === 'competition' && lastSession.status === 'completed') {
        unlocked = true;
      } else if (ach.id === 'ach_6') {
        ach.progress = Math.min(100, Math.round((this.student.wordsPracticed / 500) * 100));
        ach.progressLabel = `${this.student.wordsPracticed} / 500`;
        if (this.student.wordsPracticed >= 500) unlocked = true;
      } else if (ach.id === 'ach_7' && this.student.currentStreak >= 14) {
        unlocked = true;
      } else if (ach.id === 'ach_8' && lastSession && lastSession.mode === 'competition' && lastSession.incorrectCount === 0 && lastSession.attempts.length >= 10) {
        unlocked = true;
      }

      if (unlocked) {
        ach.unlocked = true;
        ach.unlockedAt = new Date().toISOString().split('T')[0];
        ach.progress = 100;
        newlyUnlocked.push(ach);
      }
    });

    this.persist(STORAGE_KEYS.ACHIEVEMENTS, this.achievements);
    return newlyUnlocked;
  }

  public getAchievements(): Achievement[] {
    return this.achievements;
  }

  // --- LEADERBOARD ---
  public getLeaderboard(): LeaderboardEntry[] {
    return this.leaderboard;
  }

  // --- WEEKLY TOP SPELLERS (PRACTICE FREQUENCY + ACCURACY) ---
  public getWeeklyTopSpellers(): {
    spellers: WeeklyTopSpeller[];
    currentUserSpeller: WeeklyTopSpeller;
    currentUserRank: number;
    meta: WeeklyLeaderboardMeta;
  } {
    const now = new Date();
    // Monday of current calendar week
    const currentDayOfWeek = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
    const monday = new Date(now);
    monday.setDate(monday.getDate() - currentDayOfWeek);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const mondayStr = monday.toISOString().split('T')[0];
    const sundayStr = sunday.toISOString().split('T')[0];

    // Week Number of year
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

    // Time remaining until Sunday 23:59:59
    const msRemaining = Math.max(0, sunday.getTime() - now.getTime());
    const daysRemaining = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor((msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    // Format week date range display e.g. "Sep 21 – Sep 27"
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const startStr = `${monthNames[monday.getMonth()]} ${monday.getDate()}`;
    const endStr = `${monthNames[sunday.getMonth()]} ${sunday.getDate()}, ${sunday.getFullYear()}`;

    // Calculate current student's actual current-week metrics
    const thisWeekSessions = this.practiceSessions.filter(s => {
      const date = (s.completedAt || s.startedAt || '').slice(0, 10);
      return date >= mondayStr && date <= sundayStr;
    });

    const studentHistoryDates = this.student.practiceHistoryDates || [];
    const activeDaysThisWeek = studentHistoryDates.filter(d => d >= mondayStr && d <= sundayStr).length;

    let studentWeekSessionsCount = thisWeekSessions.length;
    let studentWeekWordsDrilled = thisWeekSessions.reduce((sum, s) => sum + s.attempts.length, 0);
    let studentWeekCorrect = thisWeekSessions.reduce((sum, s) => sum + s.correctCount, 0);

    // If student has established streak days this week or practiced today, ensure realistic baseline
    const effectiveStreakDays = Math.max(1, activeDaysThisWeek || (this.student.currentStreak > 0 ? Math.min(7, this.student.currentStreak) : 1));
    if (studentWeekSessionsCount === 0) {
      studentWeekSessionsCount = effectiveStreakDays;
      studentWeekWordsDrilled = Math.max(this.student.todayWordsAttempted || 20, effectiveStreakDays * 22);
      studentWeekCorrect = Math.round(studentWeekWordsDrilled * ((this.student.accuracy || 88) / 100));
    } else {
      studentWeekSessionsCount = Math.max(studentWeekSessionsCount, effectiveStreakDays);
      studentWeekWordsDrilled = Math.max(studentWeekWordsDrilled, this.student.todayWordsAttempted || 25);
    }

    const studentWeekAccuracy = studentWeekWordsDrilled > 0
      ? Math.round((studentWeekCorrect / studentWeekWordsDrilled) * 100)
      : (this.student.accuracy || 88);

    // Scoring formula directly rewards BOTH practice frequency (words & sessions) AND accuracy
    // Score = (wordsDrilled * 8) + (accuracy% * 15) + (sessions * 45) + (activeStreakDays * 35)
    const computeWeeklyScore = (words: number, acc: number, sessions: number, streak: number) => {
      return Math.round((words * 8) + (acc * 15) + (sessions * 45) + (streak * 35));
    };

    const studentWeeklyScore = computeWeeklyScore(
      studentWeekWordsDrilled,
      studentWeekAccuracy,
      studentWeekSessionsCount,
      effectiveStreakDays
    );

    const currentUserSpeller: WeeklyTopSpeller = {
      rank: 1,
      id: this.student.id,
      name: this.student.name,
      school: this.student.school || 'Federal Science & Technical College, Yaba',
      className: this.student.className || 'SS 1 Gold',
      weeklyPracticeSessions: studentWeekSessionsCount,
      weeklyWordsDrilled: studentWeekWordsDrilled,
      weeklyAccuracy: studentWeekAccuracy,
      weeklyStreakDays: effectiveStreakDays,
      weeklyPoints: studentWeeklyScore,
      isCurrentUser: true,
      trend: 'up',
      rankChange: 2
    };

    // Competing student cohort representing top secondary spellers across classes
    const competitorPool: Omit<WeeklyTopSpeller, 'rank'>[] = [
      {
        id: 'std_02',
        name: 'Daniel Eze',
        school: 'King’s College, Lagos',
        className: 'SS 2 Diamond',
        weeklyPracticeSessions: 18,
        weeklyWordsDrilled: 255,
        weeklyAccuracy: 95,
        weeklyStreakDays: 7,
        weeklyPoints: computeWeeklyScore(255, 95, 18, 7),
        trend: 'up',
        rankChange: 1
      },
      {
        id: 'std_04',
        name: 'Zainab Musa',
        school: 'Government Secondary School, Kaduna',
        className: 'JSS 3 Blue',
        weeklyPracticeSessions: 15,
        weeklyWordsDrilled: 220,
        weeklyAccuracy: 94,
        weeklyStreakDays: 6,
        weeklyPoints: computeWeeklyScore(220, 94, 15, 6),
        trend: 'same',
        rankChange: 0
      },
      {
        id: 'std_03',
        name: 'Chinedu Obi',
        school: 'Loyola Jesuit College, Abuja',
        className: 'SS 1 Silver',
        weeklyPracticeSessions: 14,
        weeklyWordsDrilled: 198,
        weeklyAccuracy: 92,
        weeklyStreakDays: 6,
        weeklyPoints: computeWeeklyScore(198, 92, 14, 6),
        trend: 'down',
        rankChange: 1
      },
      {
        id: 'std_05',
        name: 'Samuel Adeyemi',
        school: 'Vivian Fowler Memorial, Ikeja',
        className: 'SS 1 Gold',
        weeklyPracticeSessions: 13,
        weeklyWordsDrilled: 185,
        weeklyAccuracy: 91,
        weeklyStreakDays: 5,
        weeklyPoints: computeWeeklyScore(185, 91, 13, 5),
        trend: 'up',
        rankChange: 2
      },
      {
        id: 'std_06',
        name: 'Blessing Nwosu',
        school: 'Dennis Memorial Grammar, Onitsha',
        className: 'SS 2 Emerald',
        weeklyPracticeSessions: 12,
        weeklyWordsDrilled: 170,
        weeklyAccuracy: 89,
        weeklyStreakDays: 5,
        weeklyPoints: computeWeeklyScore(170, 89, 12, 5),
        trend: 'same',
        rankChange: 0
      },
      {
        id: 'std_07',
        name: 'Fatima Aliyu',
        school: 'Capital Science Academy, Kuje',
        className: 'JSS 3 Ruby',
        weeklyPracticeSessions: 11,
        weeklyWordsDrilled: 155,
        weeklyAccuracy: 88,
        weeklyStreakDays: 5,
        weeklyPoints: computeWeeklyScore(155, 88, 11, 5),
        trend: 'down',
        rankChange: 1
      },
      {
        id: 'std_08',
        name: 'Kenechukwu Umeh',
        school: 'Graceland International, Port Harcourt',
        className: 'SS 1 Gold',
        weeklyPracticeSessions: 11,
        weeklyWordsDrilled: 145,
        weeklyAccuracy: 87,
        weeklyStreakDays: 4,
        weeklyPoints: computeWeeklyScore(145, 87, 11, 4),
        trend: 'up',
        rankChange: 1
      },
      {
        id: 'std_09',
        name: 'Maryam Abubakar',
        school: 'Federal Government College, Kano',
        className: 'JSS 3 Blue',
        weeklyPracticeSessions: 10,
        weeklyWordsDrilled: 138,
        weeklyAccuracy: 85,
        weeklyStreakDays: 4,
        weeklyPoints: computeWeeklyScore(138, 85, 10, 4),
        trend: 'new',
        rankChange: 0
      },
      {
        id: 'std_10',
        name: 'David Adeleke',
        school: 'Corona Secondary School, Agbara',
        className: 'SS 2 Pearl',
        weeklyPracticeSessions: 9,
        weeklyWordsDrilled: 128,
        weeklyAccuracy: 85,
        weeklyStreakDays: 4,
        weeklyPoints: computeWeeklyScore(128, 85, 9, 4),
        trend: 'same',
        rankChange: 0
      },
      {
        id: 'std_11',
        name: 'Aisha Bello',
        school: 'Queen’s College, Yaba',
        className: 'SS 1 Sapphire',
        weeklyPracticeSessions: 9,
        weeklyWordsDrilled: 120,
        weeklyAccuracy: 84,
        weeklyStreakDays: 3,
        weeklyPoints: computeWeeklyScore(120, 84, 9, 3),
        trend: 'down',
        rankChange: 2
      },
      {
        id: 'std_12',
        name: 'Emmanuel Olatunji',
        school: 'Igbobi College, Yaba',
        className: 'JSS 3 Gold',
        weeklyPracticeSessions: 8,
        weeklyWordsDrilled: 112,
        weeklyAccuracy: 82,
        weeklyStreakDays: 3,
        weeklyPoints: computeWeeklyScore(112, 82, 8, 3),
        trend: 'same',
        rankChange: 0
      }
    ];

    // Combine current user with competitors (avoid duplicate IDs)
    const combined = [
      currentUserSpeller,
      ...competitorPool.filter(c => c.id !== currentUserSpeller.id)
    ];

    // Sort by weeklyPoints descending
    combined.sort((a, b) => b.weeklyPoints - a.weeklyPoints);

    // Re-assign ranks 1..N and decorative badges
    const rankedList: WeeklyTopSpeller[] = combined.map((speller, index) => {
      const rank = index + 1;
      let badge = undefined;
      if (rank === 1) badge = '🥇 Weekly Champion';
      else if (rank === 2) badge = '🥈 Silver Podium';
      else if (rank === 3) badge = '🥉 Bronze Podium';
      else if (rank <= 5) badge = '🔥 Top Driller';
      else if (speller.weeklyAccuracy >= 93) badge = '🎯 Precision Ace';

      return {
        ...speller,
        rank,
        badge
      };
    });

    const userSpellerInList = rankedList.find(s => s.id === currentUserSpeller.id) || currentUserSpeller;
    const currentUserRank = userSpellerInList.rank;

    return {
      spellers: rankedList.slice(0, 10), // Top 10 spellers for the current week
      currentUserSpeller: userSpellerInList,
      currentUserRank,
      meta: {
        weekNumber,
        startDate: startStr,
        endDate: endStr,
        daysRemaining,
        hoursRemaining,
        totalParticipants: 148,
        lastUpdated: 'Live sync'
      }
    };
  }

  // --- CLASSES MANAGEMENT ---
  public getClasses(includeArchived: boolean = false): ClassRoom[] {
    return includeArchived ? this.classes : this.classes.filter(c => !c.isArchived);
  }

  public getClassById(id: string): ClassRoom | undefined {
    return this.classes.find(c => c.id === id);
  }

  public createClass(name: string, description: string, code?: string, academicSession?: string): ClassRoom {
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newClass: ClassRoom = {
      id: `class_${Date.now()}`,
      name: name.trim(),
      code: code ? code.trim().toUpperCase() : name.trim().replace(/\s+/g, '-').toUpperCase().slice(0, 8),
      description: description.trim() || 'Secondary school spelling cohort',
      schoolName: this.schoolConfig.schoolName,
      academicSession: academicSession || this.schoolConfig.academicSession,
      joinCode: `${Math.floor(10 + Math.random() * 90)}${randomSuffix}`,
      studentCount: 0,
      averageAccuracy: 0,
      completionRate: 0,
      isArchived: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    this.classes.unshift(newClass);
    this.persist(STORAGE_KEYS.CLASSES, this.classes);
    this.addNotification({
      targetRole: 'teacher',
      title: 'Class Created',
      message: `Class "${newClass.name}" created with Join Code: ${newClass.joinCode}`,
      type: 'alert'
    });
    return newClass;
  }

  public updateClass(id: string, updates: Partial<ClassRoom>): ClassRoom | undefined {
    const cls = this.classes.find(c => c.id === id);
    if (cls) {
      Object.assign(cls, updates, { updatedAt: new Date().toISOString().split('T')[0] });
      this.persist(STORAGE_KEYS.CLASSES, this.classes);
    }
    return cls;
  }

  public archiveClass(id: string): boolean {
    const cls = this.classes.find(c => c.id === id);
    if (cls) {
      cls.isArchived = !cls.isArchived;
      cls.updatedAt = new Date().toISOString().split('T')[0];
      this.persist(STORAGE_KEYS.CLASSES, this.classes);
      return true;
    }
    return false;
  }

  public regenerateJoinCode(classId: string): string {
    const cls = this.classes.find(c => c.id === classId);
    if (cls) {
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      cls.joinCode = `${Math.floor(10 + Math.random() * 90)}${randomSuffix}`;
      cls.updatedAt = new Date().toISOString().split('T')[0];
      this.persist(STORAGE_KEYS.CLASSES, this.classes);
      return cls.joinCode;
    }
    return '';
  }

  public joinClassByCode(studentId: string, code: string): { success: boolean; message: string; className?: string } {
    const cleanCode = code.trim().toUpperCase();
    const matchedClass = this.classes.find(c => c.joinCode.toUpperCase() === cleanCode && !c.isArchived);

    if (!matchedClass) {
      return { success: false, message: 'Invalid or expired Class Join Code. Please verify with your teacher.' };
    }

    // Update Enrolled Student record
    const student = this.enrolledStudents.find(s => s.id === studentId);
    if (student) {
      student.classId = matchedClass.id;
      student.className = matchedClass.name;
      this.persist(STORAGE_KEYS.ENROLLED_STUDENTS, this.enrolledStudents);
    }

    // Update active user student if matches
    if (this.student.id === studentId) {
      this.student.className = matchedClass.name;
      this.persist(STORAGE_KEYS.STUDENT, this.student);
    }

    // Recalculate class count
    matchedClass.studentCount = this.enrolledStudents.filter(s => s.classId === matchedClass.id).length;
    this.persist(STORAGE_KEYS.CLASSES, this.classes);

    this.addNotification({
      targetRole: 'teacher',
      title: 'Student Joined Class',
      message: `${student ? student.name : 'A student'} joined "${matchedClass.name}" using code ${code}.`,
      type: 'alert'
    });

    return { success: true, message: `Successfully enrolled in ${matchedClass.name}!`, className: matchedClass.name };
  }

  // --- ENROLLED STUDENTS MANAGEMENT ---
  public getEnrolledStudents(classId?: string): EnrolledStudent[] {
    if (classId && classId !== 'all') {
      return this.enrolledStudents.filter(s => s.classId === classId);
    }
    return this.enrolledStudents;
  }

  public getEnrolledStudentById(id: string): EnrolledStudent | undefined {
    return this.enrolledStudents.find(s => s.id === id);
  }

  public generateUniqueStudentCode(classCode: string = 'SSCS-JSS1'): string {
    let seq = 1;
    let candidate = `CCA-${classCode}-${String(seq).padStart(3, '0')}`;
    while (this.enrolledStudents.some(s => s.studentCode.toUpperCase() === candidate.toUpperCase())) {
      seq++;
      candidate = `CCA-${classCode}-${String(seq).padStart(3, '0')}`;
    }
    return candidate;
  }

  public generateSecurePin(): string {
    return String(Math.floor(1000 + Math.random() * 9000));
  }

  public syncTestStudentProfiles(): void {
    const testStudents = this.enrolledStudents.filter(
      s => s.classId === 'class_ss_carer_starters_jss1_builders' || s.id.startsWith('std_ss1_')
    );
    testStudents.forEach(ts => {
      const profile: UserProfile = {
        uid: `std_${ts.id}`,
        id: `std_${ts.id}`,
        email: `${ts.studentCode.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.spellready.ng`,
        displayName: ts.name,
        name: ts.name,
        role: 'student',
        accountStatus: 'active',
        schoolName: ts.school,
        classId: ts.classId,
        className: ts.className,
        studentCode: ts.studentCode,
        profileCompleted: true,
        createdAt: ts.createdAt || '2026-09-01T08:00:00.000Z',
        updatedAt: new Date().toISOString()
      };
      userService.createUserProfile(profile).catch(() => {});
    });
  }

  public addStudent(studentData: {
    name: string;
    classId: string;
    studentCode?: string;
    pin?: string;
    notes?: string;
    parentContact?: string;
  }): EnrolledStudent {
    const matchedClass = this.classes.find(c => c.id === studentData.classId) || this.classes[0];
    const generatedCode = studentData.studentCode?.trim().toUpperCase() || 
      this.generateUniqueStudentCode(matchedClass.code || 'SS1');
    const generatedPin = studentData.pin?.trim() || this.generateSecurePin();

    const newStudent: EnrolledStudent = {
      id: `std_${Date.now()}`,
      name: studentData.name.trim(),
      studentCode: generatedCode,
      pin: generatedPin,
      className: matchedClass.name,
      classId: matchedClass.id,
      school: this.schoolConfig.schoolName,
      wordsPracticed: 0,
      wordsMastered: 0,
      accuracy: 0,
      streakDays: 0,
      lastActive: 'Just registered',
      status: 'On Track',
      level: 'Foundation',
      notes: studentData.notes?.trim() || 'New student enrolled for spelling bee training.',
      parentContact: studentData.parentContact?.trim(),
      weakWords: []
    };

    this.enrolledStudents.unshift(newStudent);
    this.persist(STORAGE_KEYS.ENROLLED_STUDENTS, this.enrolledStudents);

    // Update class student count
    matchedClass.studentCount += 1;
    this.persist(STORAGE_KEYS.CLASSES, this.classes);

    // Sync UserProfile to Firebase
    const profile: UserProfile = {
      uid: `std_${newStudent.id}`,
      id: `std_${newStudent.id}`,
      email: `${newStudent.studentCode.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.spellready.ng`,
      displayName: newStudent.name,
      name: newStudent.name,
      role: 'student',
      accountStatus: 'active',
      schoolName: newStudent.school,
      classId: newStudent.classId,
      className: newStudent.className,
      studentCode: newStudent.studentCode,
      profileCompleted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    userService.createUserProfile(profile).catch(() => {});

    return newStudent;
  }

  public bulkAddStudents(
    rawText: string,
    targetClassId: string
  ): { successCount: number; errorCount: number; errors: string[]; added: EnrolledStudent[] } {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const matchedClass = this.classes.find(c => c.id === targetClassId) || this.classes[0];
    const added: EnrolledStudent[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      // Ignore CSV header if present
      if (index === 0 && line.toLowerCase().includes('name') && line.toLowerCase().includes('code')) {
        return;
      }

      const parts = line.split(',').map(p => p.trim());
      const name = parts[0];
      const customCode = parts[1];
      const customPin = parts[2];

      if (!name || name.length < 2) {
        errors.push(`Line ${index + 1}: Student name is missing or invalid.`);
        return;
      }

      // Check duplicates
      const codeToCheck = customCode || `CCA-${matchedClass.code || 'SS1'}-${String(this.enrolledStudents.length + added.length + 1).padStart(3, '0')}`;
      if (this.enrolledStudents.some(s => s.studentCode.toUpperCase() === codeToCheck.toUpperCase())) {
        errors.push(`Line ${index + 1}: Student code "${codeToCheck}" already in use.`);
        return;
      }

      const st = this.addStudent({
        name,
        classId: matchedClass.id,
        studentCode: customCode,
        pin: customPin
      });
      added.push(st);
    });

    return {
      successCount: added.length,
      errorCount: errors.length,
      errors,
      added
    };
  }

  public removeStudentFromClass(studentId: string): boolean {
    const index = this.enrolledStudents.findIndex(s => s.id === studentId);
    if (index !== -1) {
      const removed = this.enrolledStudents.splice(index, 1)[0];
      this.persist(STORAGE_KEYS.ENROLLED_STUDENTS, this.enrolledStudents);
      const cls = this.classes.find(c => c.id === removed.classId);
      if (cls && cls.studentCount > 0) {
        cls.studentCount -= 1;
        this.persist(STORAGE_KEYS.CLASSES, this.classes);
      }
      return true;
    }
    return false;
  }

  public updateEnrolledStudent(id: string, updates: Partial<EnrolledStudent>): EnrolledStudent | undefined {
    const student = this.enrolledStudents.find(s => s.id === id || s.studentCode === id);
    if (student) {
      Object.assign(student, updates);
      this.persist(STORAGE_KEYS.ENROLLED_STUDENTS, this.enrolledStudents);
    }
    return student;
  }

  public updateStudentName(identifier: { id?: string; studentCode?: string; uid?: string }, newName: string): boolean {
    const cleanName = newName.trim();
    if (!cleanName) return false;

    // 1. Update this.student
    this.student.name = cleanName;
    this.persist(STORAGE_KEYS.STUDENT, this.student);

    // 2. Update enrolled students list
    let matched = false;
    const cleanUid = identifier.uid?.replace(/^usr_|^std_/, '');
    const cleanId = identifier.id?.replace(/^usr_|^std_/, '');

    const student = this.enrolledStudents.find(s => 
      (identifier.studentCode && s.studentCode.toUpperCase() === identifier.studentCode.toUpperCase()) ||
      (identifier.id && (s.id === identifier.id || s.id === cleanId)) ||
      (cleanUid && s.id === cleanUid)
    );

    if (student) {
      student.name = cleanName;
      this.persist(STORAGE_KEYS.ENROLLED_STUDENTS, this.enrolledStudents);
      matched = true;
    }

    return matched;
  }

  // --- TEACHER DATA & ASSIGNMENTS ---
  public getAssignments(classId?: string): TeacherAssignment[] {
    if (classId && classId !== 'all') {
      return this.assignments.filter(a => a.classId === classId || a.targetClass.toLowerCase().includes(classId.toLowerCase()));
    }
    return this.assignments;
  }

  public getAssignmentById(id: string): TeacherAssignment | undefined {
    return this.assignments.find(a => a.id === id);
  }

  public createAssignment(
    assignment: Omit<TeacherAssignment, 'id' | 'assignedCount' | 'completedCount' | 'averageAccuracy' | 'status'> & { status?: TeacherAssignment['status'] }
  ): TeacherAssignment {
    const classStudents = assignment.classId 
      ? this.enrolledStudents.filter(s => s.classId === assignment.classId).length 
      : 32;

    const newAsg: TeacherAssignment = {
      ...assignment,
      id: `asg_${Date.now()}`,
      assignedCount: Math.max(1, classStudents),
      completedCount: 0,
      averageAccuracy: 0,
      status: assignment.status || 'active',
      mode: assignment.mode || 'practice',
      settings: assignment.settings || {
        attemptsAllowed: 2,
        timeLimitMinutes: assignment.timeLimitMinutes || 15,
        randomizeWords: true,
        allowReplay: true,
        allowDefinition: true,
        allowExample: true,
        immediateFeedback: true,
        passingScore: 70,
        allowLateSubmission: true
      },
      teacherComments: {}
    };

    // If custom words were added, add them to words library as teacher-created content
    if (assignment.customWords && assignment.customWords.length > 0) {
      assignment.customWords.forEach(cw => {
        if (!this.words.some(w => w.id === cw.id)) {
          this.words.push(cw);
        }
      });
      this.persist(STORAGE_KEYS.WORDS, this.words);
    }

    this.assignments.unshift(newAsg);
    this.persist(STORAGE_KEYS.ASSIGNMENTS, this.assignments);

    // Broadcast student notification
    this.addNotification({
      targetRole: 'student',
      title: 'New Assignment Published',
      message: `"${newAsg.title}" (${newAsg.wordCount} words) is now available. Due ${newAsg.dueDate}.`,
      type: 'assignment',
      linkView: 'student-dashboard'
    });

    return newAsg;
  }

  public duplicateAssignment(assignmentId: string): TeacherAssignment | undefined {
    const original = this.assignments.find(a => a.id === assignmentId);
    if (!original) return undefined;

    const copy: TeacherAssignment = {
      ...original,
      id: `asg_${Date.now()}`,
      title: `${original.title} (Copy)`,
      completedCount: 0,
      averageAccuracy: 0,
      status: 'draft',
      startDate: new Date().toISOString().split('T')[0],
      teacherComments: {}
    };

    this.assignments.unshift(copy);
    this.persist(STORAGE_KEYS.ASSIGNMENTS, this.assignments);
    return copy;
  }

  public updateAssignmentStatus(id: string, status: TeacherAssignment['status']): void {
    const asg = this.assignments.find(a => a.id === id);
    if (asg) {
      asg.status = status;
      this.persist(STORAGE_KEYS.ASSIGNMENTS, this.assignments);
    }
  }

  public addCustomWord(wordData: Omit<Word, 'id' | 'timesPracticed' | 'timesCorrect'>): Word {
    const newWord: Word = {
      ...wordData,
      id: `custom_${Date.now()}`,
      normalizedWord: wordData.word.toLowerCase().trim(),
      timesPracticed: 0,
      timesCorrect: 0,
      tags: [...(wordData.tags || []), 'Teacher-created content']
    };
    this.words.unshift(newWord);
    this.persist(STORAGE_KEYS.WORDS, this.words);
    return newWord;
  }

  public getAssignmentSubmissions(assignmentId: string): AssignmentSubmission[] {
    return this.assignmentSubmissions.filter(s => s.assignmentId === assignmentId);
  }

  public addTeacherComment(submissionId: string, comment: string): boolean {
    const sub = this.assignmentSubmissions.find(s => s.id === submissionId);
    if (sub) {
      sub.teacherComment = comment.trim();
      this.persist(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS, this.assignmentSubmissions);

      // Also attach to assignment
      const asg = this.assignments.find(a => a.id === sub.assignmentId);
      if (asg) {
        if (!asg.teacherComments) asg.teacherComments = {};
        asg.teacherComments[sub.studentId] = comment.trim();
        this.persist(STORAGE_KEYS.ASSIGNMENTS, this.assignments);
      }

      this.addNotification({
        targetRole: 'student',
        targetUserId: sub.studentId,
        title: 'Teacher Comment Received',
        message: `Teacher David Mike commented on your assignment: "${comment.trim()}"`,
        type: 'comment',
        linkView: 'student-dashboard'
      });
      return true;
    }
    return false;
  }

  // --- MISTAKE ANALYTICS & TARGETED TEACHING LOOP ---
  public getMostMissedWords(classId?: string, limit: number = 8): { word: Word; missedCount: number; studentNames: string[] }[] {
    const targetStudents = this.getEnrolledStudents(classId);
    const wordMissCount: Record<string, { count: number; studentNames: string[] }> = {};

    // 1. Scan student weakWords
    targetStudents.forEach(st => {
      (st.weakWords || []).forEach(wId => {
        if (!wordMissCount[wId]) {
          wordMissCount[wId] = { count: 0, studentNames: [] };
        }
        wordMissCount[wId].count += 1;
        if (!wordMissCount[wId].studentNames.includes(st.name)) {
          wordMissCount[wId].studentNames.push(st.name);
        }
      });
    });

    // 2. Scan submissions
    this.assignmentSubmissions.forEach(sub => {
      if (sub.answers) {
        sub.answers.filter(a => !a.isCorrect).forEach(ans => {
          if (!wordMissCount[ans.wordId]) {
            wordMissCount[ans.wordId] = { count: 0, studentNames: [] };
          }
          wordMissCount[ans.wordId].count += 1;
          if (!wordMissCount[ans.wordId].studentNames.includes(sub.studentName)) {
            wordMissCount[ans.wordId].studentNames.push(sub.studentName);
          }
        });
      }
    });

    const results = Object.keys(wordMissCount).map(wordId => {
      const word = this.getWordById(wordId) || {
        id: wordId,
        word: wordId,
        normalizedWord: wordId,
        pronunciation: '',
        definition: 'Spelling vocabulary',
        partOfSpeech: 'noun' as const,
        exampleSentence: '',
        difficulty: 'Medium' as const,
        category: 'General Vocabulary' as const
      };
      return {
        word,
        missedCount: wordMissCount[wordId].count,
        studentNames: wordMissCount[wordId].studentNames
      };
    });

    return results.sort((a, b) => b.missedCount - a.missedCount).slice(0, limit);
  }

  public createTargetedAssignmentFromWeakWords(
    targetClassId: string,
    wordIds: string[],
    customTitle?: string
  ): TeacherAssignment {
    const targetClass = this.classes.find(c => c.id === targetClassId) || this.classes[0];
    const title = customTitle || `Targeted Remedial Drill: ${targetClass.name} Missed Words`;

    return this.createAssignment({
      title,
      description: 'Automated remedial practice drill generated from high-frequency student mistake patterns.',
      targetClass: targetClass.name,
      classId: targetClass.id,
      wordCount: wordIds.length,
      difficulty: 'Medium',
      category: 'All Categories',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      timeLimitMinutes: 15,
      mode: 'practice',
      wordIds
    });
  }

  // --- CSV EXPORT ---
  public exportClassResultsCSV(classId?: string): string {
    const students = this.getEnrolledStudents(classId);
    const headers = ['Student ID', 'Student Code', 'Name', 'Class', 'Words Practiced', 'Words Mastered', 'Accuracy (%)', 'Streak (Days)', 'Status', 'Last Active'];
    
    const rows = students.map(s => [
      `"${s.id}"`,
      `"${s.studentCode}"`,
      `"${s.name}"`,
      `"${s.className}"`,
      s.wordsPracticed,
      s.wordsMastered,
      s.accuracy,
      s.streakDays,
      `"${s.status}"`,
      `"${s.lastActive}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  // --- NOTIFICATIONS ---
  public getNotifications(role: UserRole | 'all' = 'all'): AppNotification[] {
    return this.notifications.filter(n => n.targetRole === role || n.targetRole === 'all' || role === 'all');
  }

  public markNotificationRead(id: string): void {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.persist(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    }
  }

  public addNotification(notif: Omit<AppNotification, 'id' | 'read' | 'createdAt'>): AppNotification {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(newNotif);
    this.persist(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    return newNotif;
  }

  // --- SCHOOL CONFIG & TEACHER SETTINGS ---
  public getSchoolConfig(): SchoolConfig {
    return this.schoolConfig;
  }

  public updateSchoolConfig(updates: Partial<SchoolConfig>): SchoolConfig {
    this.schoolConfig = { ...this.schoolConfig, ...updates };
    this.persist(STORAGE_KEYS.SCHOOL_CONFIG, this.schoolConfig);
    return this.schoolConfig;
  }

  public getWordSets(): WordSet[] {
    return this.wordSets;
  }

  public createWordSet(set: Omit<WordSet, 'id' | 'createdAt' | 'studentsAssigned'>): WordSet {
    const newSet: WordSet = {
      ...set,
      id: `ws_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      studentsAssigned: 0
    };
    this.wordSets.unshift(newSet);
    this.persist(STORAGE_KEYS.WORD_SETS, this.wordSets);
    return newSet;
  }

  public getTeacherStudents() {
    return this.enrolledStudents;
  }

  public getTeacherStudentById(id: string) {
    return this.enrolledStudents.find(s => s.id === id);
  }

  // --- SAFE RESET MECHANISM ---
  public resetAllData(): void {
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    }
    this.words = [...INITIAL_WORDS];
    this.student = { ...INITIAL_STUDENT };
    this.achievements = [...INITIAL_ACHIEVEMENTS];
    this.assignments = [...INITIAL_ASSIGNMENTS];
    this.assignmentSubmissions = [];
    this.wordSets = [...INITIAL_WORD_SETS];
    this.classes = [...INITIAL_CLASSES];
    this.enrolledStudents = [...INITIAL_ENROLLED_STUDENTS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.schoolConfig = { ...INITIAL_SCHOOL_CONFIG };
    this.practiceSessions = [];
    this.dailyChallenges = {};
    this.savedWordIds.clear();
  }
}

export const dataService = new DataService();
