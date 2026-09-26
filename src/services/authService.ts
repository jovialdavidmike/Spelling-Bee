import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, validateFirestoreConnection } from './firebase';
import { userService } from './userService';
import { dataService } from './dataService';
import { UserProfile, UserRole } from '../types/auth';
import { getFriendlyAuthErrorMessage } from './authAuthorization';
import { INITIAL_SCHOOL_CONFIG, INITIAL_ENROLLED_STUDENTS } from '../data/mockData';

export const DEMO_TEACHER_PROFILE: UserProfile = {
  uid: 'usr_teacher_david',
  id: 'usr_teacher_david',
  email: 'david.mike@fstc-yaba.edu.ng',
  displayName: 'David Mike',
  name: 'David Mike',
  role: 'teacher',
  accountStatus: 'active',
  schoolId: 'sch_fstc_01',
  schoolName: INITIAL_SCHOOL_CONFIG.schoolName,
  className: 'SS 1 Gold / JSS 3 Blue',
  profileCompleted: true,
  createdAt: '2026-08-15T08:00:00.000Z',
  updatedAt: new Date().toISOString()
};

export const DEMO_STUDENT_PROFILE: UserProfile = {
  uid: 'usr_student_amara',
  id: 'usr_student_amara',
  email: 'amara.okafor@student.spellready.ng',
  displayName: 'Amara Okafor',
  name: 'Amara Okafor',
  role: 'student',
  accountStatus: 'active',
  schoolId: 'sch_fstc_01',
  schoolName: INITIAL_SCHOOL_CONFIG.schoolName,
  classId: 'class_ss1_gold',
  className: 'SS 1 Gold',
  studentCode: 'CCA-SS1-001',
  profileCompleted: true,
  createdAt: '2026-09-01T08:00:00.000Z',
  updatedAt: new Date().toISOString()
};

export const DEMO_TEACHER = {
  id: DEMO_TEACHER_PROFILE.uid,
  name: DEMO_TEACHER_PROFILE.displayName,
  email: DEMO_TEACHER_PROFILE.email || 'david.mike@fstc-yaba.edu.ng',
  role: 'teacher' as UserRole,
  schoolName: DEMO_TEACHER_PROFILE.schoolName,
  createdAt: DEMO_TEACHER_PROFILE.createdAt
};

export const DEMO_STUDENT = {
  id: DEMO_STUDENT_PROFILE.uid,
  name: DEMO_STUDENT_PROFILE.displayName,
  role: 'student' as UserRole,
  studentCode: DEMO_STUDENT_PROFILE.studentCode,
  className: DEMO_STUDENT_PROFILE.className,
  schoolName: DEMO_STUDENT_PROFILE.schoolName,
  createdAt: DEMO_STUDENT_PROFILE.createdAt
};

export class AuthService {
  private currentProfile: UserProfile | null = null;
  private firebaseUser: FirebaseUser | null = null;
  private isInitializing: boolean = true;
  private listeners: Array<(profile: UserProfile | null) => void> = [];

  constructor() {
    this.initAuthListener();
  }

  private initAuthListener() {
    // Validate firestore connection
    validateFirestoreConnection().catch(() => {});

    // Listen for real Firebase Auth state changes
    onAuthStateChanged(auth, async (user) => {
      this.firebaseUser = user;

      if (user) {
        try {
          let profile = await userService.getUserProfile(user.uid);

          if (!profile) {
            // First time auth without firestore doc: create default user profile
            const isTeacher = user.email?.includes('teacher') || user.email?.includes('coach') || false;
            profile = {
              uid: user.uid,
              id: user.uid,
              email: user.email || null,
              displayName: user.displayName || user.email?.split('@')[0] || 'Speller',
              name: user.displayName || user.email?.split('@')[0] || 'Speller',
              role: isTeacher ? 'teacher' : 'student',
              accountStatus: 'active',
              schoolName: INITIAL_SCHOOL_CONFIG.schoolName,
              profileCompleted: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            };
            await userService.createUserProfile(profile);
          } else {
            // Sync aliases
            profile.id = profile.uid;
            profile.name = profile.displayName;
            profile.avatarUrl = profile.photoURL;
            await userService.updateUserProfile(user.uid, { lastLoginAt: new Date().toISOString() });
          }

          this.currentProfile = profile;
        } catch (err) {
          console.warn('Profile load note during auth change:', err);
        }
      } else {
        // If no Firebase session is logged in, check if user was using a demo test profile
        const cachedFallback = this.loadLocalProfile();
        if (cachedFallback) {
          cachedFallback.id = cachedFallback.uid;
          cachedFallback.name = cachedFallback.displayName;
          this.currentProfile = cachedFallback;
        } else {
          // Default to student profile for seamless initial preview
          this.currentProfile = { ...DEMO_STUDENT_PROFILE };
          this.persistLocalProfile(this.currentProfile);
        }
      }

      this.isInitializing = false;
      this.notify();
    });
  }

  public subscribe(fn: (profile: UserProfile | null) => void): () => void {
    this.listeners.push(fn);
    fn(this.currentProfile);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.currentProfile));
  }

  public getProfile(): UserProfile | null {
    return this.currentProfile;
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentProfile;
  }

  public getRole(): UserRole {
    return this.currentProfile ? this.currentProfile.role : 'guest';
  }

  public isAuthenticated(): boolean {
    return this.currentProfile !== null;
  }

  public getIsInitializing(): boolean {
    return this.isInitializing;
  }

  /**
   * Real login with Firebase Email & Password
   */
  public async loginWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string; profile?: UserProfile }> {
    try {
      const cleanEmail = email.trim();
      const userCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      let profile = await userService.getUserProfile(userCred.user.uid);

      if (!profile) {
        profile = {
          uid: userCred.user.uid,
          id: userCred.user.uid,
          email: userCred.user.email || cleanEmail,
          displayName: userCred.user.displayName || cleanEmail.split('@')[0],
          name: userCred.user.displayName || cleanEmail.split('@')[0],
          role: cleanEmail.includes('teacher') ? 'teacher' : 'student',
          accountStatus: 'active',
          schoolName: INITIAL_SCHOOL_CONFIG.schoolName,
          profileCompleted: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        await userService.createUserProfile(profile);
      } else {
        profile.id = profile.uid;
        profile.name = profile.displayName;
      }

      this.currentProfile = profile;
      this.persistLocalProfile(profile);
      this.notify();
      return { success: true, profile };
    } catch (err: any) {
      return {
        success: false,
        error: getFriendlyAuthErrorMessage(err?.code || err?.message || '')
      };
    }
  }

  /**
   * Real Registration with Firebase
   */
  public async registerUser(params: {
    email: string;
    password: string;
    displayName: string;
    role: UserRole;
    schoolName?: string;
    className?: string;
    studentCode?: string;
  }): Promise<{ success: boolean; error?: string; profile?: UserProfile }> {
    try {
      const cleanEmail = params.email.trim();
      const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, params.password);

      const newProfile: UserProfile = {
        uid: userCred.user.uid,
        id: userCred.user.uid,
        email: cleanEmail,
        displayName: params.displayName.trim() || cleanEmail.split('@')[0],
        name: params.displayName.trim() || cleanEmail.split('@')[0],
        role: params.role,
        accountStatus: 'active',
        schoolName: params.schoolName?.trim() || INITIAL_SCHOOL_CONFIG.schoolName,
        className: params.className?.trim(),
        studentCode: params.studentCode?.trim(),
        profileCompleted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      await userService.createUserProfile(newProfile);
      this.currentProfile = newProfile;
      this.persistLocalProfile(newProfile);
      this.notify();

      return { success: true, profile: newProfile };
    } catch (err: any) {
      return {
        success: false,
        error: getFriendlyAuthErrorMessage(err?.code || err?.message || '')
      };
    }
  }

  /**
   * Password Reset via Firebase
   */
  public async sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: getFriendlyAuthErrorMessage(err?.code || err?.message || '')
      };
    }
  }

  /**
   * Student Login via School-Issued Code
   */
  public loginStudentWithCode(studentCode: string, pin?: string): { success: boolean; error?: string; profile?: UserProfile } {
    const codeClean = studentCode.trim().toUpperCase();
    const allStudents = dataService.getTeacherStudents();
    const student = allStudents.find(s => s.studentCode.toUpperCase() === codeClean) ||
                    INITIAL_ENROLLED_STUDENTS.find(s => s.studentCode.toUpperCase() === codeClean);

    if (!student) {
      return { success: false, error: `Student Code "${studentCode}" not found. Please verify with your teacher.` };
    }

    if (pin && student.pin && student.pin.trim() !== pin.trim()) {
      return { success: false, error: 'Incorrect PIN. Please re-enter your 4-digit code.' };
    }

    const profile: UserProfile = {
      uid: `std_${student.id}`,
      id: `std_${student.id}`,
      email: `${student.studentCode.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.spellready.ng`,
      displayName: student.name,
      name: student.name,
      role: 'student',
      accountStatus: 'active',
      schoolName: student.school,
      classId: student.classId,
      className: student.className,
      studentCode: student.studentCode,
      profileCompleted: true,
      createdAt: student.createdAt || '2026-09-01T08:00:00.000Z',
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    this.currentProfile = profile;
    this.persistLocalProfile(profile);
    this.notify();

    // Sync profile to Firestore
    userService.createUserProfile(profile).catch(err => {
      console.warn('Sync note during student code login:', err);
    });

    return { success: true, profile };
  }

  /**
   * Fast Test Account Switcher (For Evaluation and Demos)
   */
  public switchRole(role: UserRole, studentId: string = 'std_01'): UserProfile | null {
    if (role === 'guest') {
      this.currentProfile = null;
    } else if (role === 'teacher') {
      this.currentProfile = { ...DEMO_TEACHER_PROFILE };
    } else if (role === 'admin') {
      this.currentProfile = {
        uid: 'usr_admin_spellready',
        id: 'usr_admin_spellready',
        email: 'admin@spellready.ng',
        displayName: 'Platform Administrator',
        name: 'Platform Administrator',
        role: 'admin',
        accountStatus: 'active',
        schoolName: 'SpellReady National Consortium',
        profileCompleted: true,
        createdAt: '2026-07-01T08:00:00.000Z',
        updatedAt: new Date().toISOString()
      };
    } else {
      const allStudents = dataService.getTeacherStudents();
      const match = allStudents.find(s => s.id === studentId) ||
                    INITIAL_ENROLLED_STUDENTS.find(s => s.id === studentId) ||
                    allStudents[0] ||
                    INITIAL_ENROLLED_STUDENTS[0];
      this.currentProfile = {
        uid: `usr_${match.id}`,
        id: `usr_${match.id}`,
        email: `${match.studentCode.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.spellready.ng`,
        displayName: match.name,
        name: match.name,
        role: 'student',
        accountStatus: 'active',
        schoolName: match.school,
        classId: match.classId,
        className: match.className,
        studentCode: match.studentCode,
        profileCompleted: true,
        createdAt: match.createdAt || '2026-09-01T08:00:00.000Z',
        updatedAt: new Date().toISOString()
      };
    }

    this.persistLocalProfile(this.currentProfile);
    this.notify();
    return this.currentProfile;
  }

  /**
   * Real Logout
   */
  public async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('SignOut note:', e);
    }
    this.currentProfile = null;
    this.persistLocalProfile(null);
    this.notify();
  }

  /**
   * Update current profile in memory, dataService and database
   */
  public async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    if (!this.currentProfile) return;
    const newName = updates.displayName ? updates.displayName.trim() : (updates.name ? updates.name.trim() : this.currentProfile.displayName);
    const updated: UserProfile = {
      ...this.currentProfile,
      ...updates,
      displayName: newName,
      name: newName,
      updatedAt: new Date().toISOString()
    };
    this.currentProfile = updated;
    this.persistLocalProfile(updated);
    this.notify();

    // 1. Sync student name to dataService (updates active student + enrolledStudents roster)
    dataService.updateStudentName(
      { id: updated.id, studentCode: updated.studentCode, uid: updated.uid },
      newName
    );

    // 2. Persist to Firestore / user cache via userService
    const uidToUse = this.firebaseUser?.uid || updated.uid || (updated.id ? `std_${updated.id}` : undefined);
    if (uidToUse) {
      await userService.updateUserProfile(uidToUse, {
        displayName: newName,
        name: newName,
        ...updates
      }).catch(err => {
        console.warn('Note updating Firestore profile:', err);
      });
    }
  }

  private persistLocalProfile(profile: UserProfile | null) {
    if (typeof window === 'undefined') return;
    try {
      if (profile) {
        localStorage.setItem('spellready_active_auth_profile', JSON.stringify(profile));
      } else {
        localStorage.removeItem('spellready_active_auth_profile');
      }
    } catch {
      // ignore
    }
  }

  private loadLocalProfile(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('spellready_active_auth_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
