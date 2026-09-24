import { UserAccount, UserRole, AppView, EnrolledStudent } from '../types';
import { INITIAL_ENROLLED_STUDENTS, INITIAL_SCHOOL_CONFIG } from '../data/mockData';

const AUTH_STORAGE_KEY = 'spellready_auth_account';

export const DEMO_TEACHER: UserAccount = {
  id: 'teacher_01',
  role: 'teacher',
  name: 'David Mike',
  email: 'david.mike@fstc-yaba.edu.ng',
  schoolName: INITIAL_SCHOOL_CONFIG.schoolName,
  createdAt: '2026-08-15'
};

export const DEMO_STUDENT: UserAccount = {
  id: 'std_01',
  role: 'student',
  name: 'Amara Okafor',
  studentCode: 'CCA-SS1-001',
  pin: '4827',
  className: 'SS 1 Gold',
  classId: 'class_ss1_gold',
  schoolName: INITIAL_SCHOOL_CONFIG.schoolName,
  createdAt: '2026-09-01'
};

class AuthService {
  private currentUser: UserAccount | null = null;
  private listeners: Array<(user: UserAccount | null) => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      } else {
        // Default to student user for seamless initial onboarding
        this.currentUser = { ...DEMO_STUDENT };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
      }
    } catch {
      this.currentUser = { ...DEMO_STUDENT };
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      if (this.currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Auth persist note:', e);
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.currentUser));
  }

  public subscribe(fn: (user: UserAccount | null) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  public getCurrentUser(): UserAccount | null {
    return this.currentUser;
  }

  public getRole(): UserRole {
    return this.currentUser ? this.currentUser.role : 'guest';
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Student login via Student Code and optional PIN
   */
  public loginStudentWithCode(studentCode: string, pin?: string): { success: boolean; error?: string; user?: UserAccount } {
    const codeClean = studentCode.trim().toUpperCase();
    const student = INITIAL_ENROLLED_STUDENTS.find(s => s.studentCode.toUpperCase() === codeClean);

    if (!student) {
      return { success: false, error: `Student Code "${studentCode}" not found. Please check with your teacher.` };
    }

    if (pin && student.pin && student.pin !== pin.trim()) {
      return { success: false, error: 'Incorrect PIN. Please re-enter your 4-digit code.' };
    }

    const user: UserAccount = {
      id: student.id,
      role: 'student',
      name: student.name,
      studentCode: student.studentCode,
      pin: student.pin,
      className: student.className,
      classId: student.classId,
      schoolName: student.school,
      createdAt: '2026-09-01'
    };

    this.currentUser = user;
    this.persist();
    return { success: true, user };
  }

  /**
   * Teacher login via email / password
   */
  public loginTeacher(emailOrUsername: string): { success: boolean; user: UserAccount } {
    const user: UserAccount = {
      ...DEMO_TEACHER,
      email: emailOrUsername.includes('@') ? emailOrUsername : DEMO_TEACHER.email
    };
    this.currentUser = user;
    this.persist();
    return { success: true, user };
  }

  /**
   * Switch between demo student / teacher for smooth evaluation
   */
  public switchRole(role: UserRole, studentId: string = 'std_01'): UserAccount | null {
    if (role === 'guest') {
      this.currentUser = null;
    } else if (role === 'teacher') {
      this.currentUser = { ...DEMO_TEACHER };
    } else {
      const match = INITIAL_ENROLLED_STUDENTS.find(s => s.id === studentId) || INITIAL_ENROLLED_STUDENTS[0];
      this.currentUser = {
        id: match.id,
        role: 'student',
        name: match.name,
        studentCode: match.studentCode,
        pin: match.pin,
        className: match.className,
        classId: match.classId,
        schoolName: match.school,
        createdAt: '2026-09-01'
      };
    }
    this.persist();
    return this.currentUser;
  }

  /**
   * Update student authorized settings
   */
  public updateStudentPreferences(updates: { avatarUrl?: string; name?: string }) {
    if (this.currentUser && this.currentUser.role === 'student') {
      this.currentUser = { ...this.currentUser, ...updates };
      this.persist();
    }
  }

  /**
   * Route guard check
   */
  public canAccessView(view: AppView, role: UserRole): { allowed: boolean; fallbackView: AppView; reason?: string } {
    const teacherOnlyViews: AppView[] = [
      'teacher-dashboard',
      'teacher-classes',
      'teacher-students',
      'teacher-student-detail',
      'teacher-assign',
      'teacher-word-sets',
      'teacher-reports',
      'teacher-competition',
      'teacher-settings'
    ];

    const studentOnlyViews: AppView[] = [
      'student-dashboard',
      'practice-setup',
      'practice',
      'competition',
      'mistakes',
      'progress',
      'achievements',
      'leaderboard',
      'student-profile',
      'student-settings'
    ];

    if (teacherOnlyViews.includes(view) && role !== 'teacher') {
      return {
        allowed: false,
        fallbackView: role === 'student' ? 'student-dashboard' : 'landing',
        reason: 'Teacher administration authorization required.'
      };
    }

    if (studentOnlyViews.includes(view) && role === 'guest') {
      return {
        allowed: false,
        fallbackView: 'landing',
        reason: 'Please sign in as a student to access practice and assignments.'
      };
    }

    return { allowed: true, fallbackView: view };
  }
}

export const authService = new AuthService();
