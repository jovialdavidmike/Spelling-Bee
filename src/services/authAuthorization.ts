import { UserProfile, UserRole, AuthAction } from '../types/auth';
import { AppView } from '../types';

export function hasRole(profile: UserProfile | null, role: UserRole): boolean {
  if (!profile) return role === 'guest';
  return profile.role === role;
}

export function hasAnyRole(profile: UserProfile | null, roles: UserRole[]): boolean {
  if (!profile) return roles.includes('guest');
  return roles.includes(profile.role);
}

export function canPerformAction(profile: UserProfile | null, action: AuthAction): boolean {
  if (!profile) {
    return action === 'practice.read';
  }

  if (profile.accountStatus === 'suspended' || profile.accountStatus === 'disabled') {
    return false;
  }

  switch (action) {
    case 'practice.read':
    case 'practice.submit':
    case 'competition.join':
      return ['student', 'teacher', 'admin'].includes(profile.role);

    case 'competition.create':
    case 'competition.manage':
    case 'class.manage':
    case 'assignment.create':
    case 'student.viewList':
      return ['teacher', 'admin'].includes(profile.role);

    case 'admin.access':
      return profile.role === 'admin';

    default:
      return false;
  }
}

export function canAccessView(view: AppView, profile: UserProfile | null): { allowed: boolean; fallbackView: AppView; reason?: string } {
  const teacherOnlyViews: AppView[] = [
    'teacher-dashboard',
    'teacher-classes',
    'teacher-students',
    'teacher-student-detail',
    'teacher-assign',
    'teacher-word-sets',
    'teacher-reports',
    'teacher-competition',
    'teacher-competition-builder',
    'teacher-competition-live',
    'teacher-competition-results',
    'teacher-settings'
  ];

  const studentOnlyViews: AppView[] = [
    'student-dashboard',
    'practice-setup',
    'practice',
    'competition-session',
    'mistakes',
    'progress',
    'achievements',
    'student-profile',
    'student-settings'
  ];

  if (!profile) {
    if (teacherOnlyViews.includes(view)) {
      return {
        allowed: false,
        fallbackView: 'landing',
        reason: 'Teacher sign-in is required to access classroom controls.'
      };
    }
    if (studentOnlyViews.includes(view)) {
      return {
        allowed: false,
        fallbackView: 'landing',
        reason: 'Please sign in to access personalized student practice and progress.'
      };
    }
    return { allowed: true, fallbackView: view };
  }

  if (profile.accountStatus === 'suspended' || profile.accountStatus === 'disabled') {
    return {
      allowed: false,
      fallbackView: 'landing',
      reason: 'Your account is currently suspended. Please contact your school administrator.'
    };
  }

  if (teacherOnlyViews.includes(view) && profile.role !== 'teacher' && profile.role !== 'admin') {
    return {
      allowed: false,
      fallbackView: 'student-dashboard',
      reason: 'This page is reserved for teachers and competition coaches.'
    };
  }

  return { allowed: true, fallbackView: view };
}

export function getFriendlyAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'The email or password entered is incorrect. Please check your details and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in or use password reset.';
    case 'auth/weak-password':
      return 'Your password should be at least 6 characters long for security.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/network-request-failed':
      return 'Could not reach the authentication service. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Access temporarily slowed for security. Please try again shortly.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact your school coordinator.';
    default:
      return 'Unable to complete request. Please verify your credentials and try again.';
  }
}
