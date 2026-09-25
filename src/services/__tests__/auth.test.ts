import { hasRole, hasAnyRole, canPerformAction, canAccessView, getFriendlyAuthErrorMessage } from '../authAuthorization';
import { UserProfile } from '../../types/auth';

const studentProfile: UserProfile = {
  uid: 'test_student_01',
  email: 'student@example.com',
  displayName: 'Chidi Mokwe',
  role: 'student',
  accountStatus: 'active',
  profileCompleted: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z'
};

const teacherProfile: UserProfile = {
  uid: 'test_teacher_01',
  email: 'teacher@example.com',
  displayName: 'Mrs. Fatima Danjuma',
  role: 'teacher',
  accountStatus: 'active',
  profileCompleted: true,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z'
};

const suspendedProfile: UserProfile = {
  uid: 'test_suspended_01',
  email: 'suspended@example.com',
  displayName: 'Suspended Account',
  role: 'student',
  accountStatus: 'suspended',
  profileCompleted: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z'
};

export function runAuthSanityChecks(): { passed: boolean; details: string[] } {
  const details: string[] = [];
  let passed = true;

  // 1. Role verification
  if (!hasRole(studentProfile, 'student') || hasRole(studentProfile, 'teacher')) {
    details.push('Student role check failed');
    passed = false;
  }

  if (!hasRole(teacherProfile, 'teacher') || hasRole(teacherProfile, 'student')) {
    details.push('Teacher role check failed');
    passed = false;
  }

  // 2. Permission enforcement (Students cannot create competitions or classes)
  if (canPerformAction(studentProfile, 'competition.create')) {
    details.push('Security violation: Student was permitted to create competition');
    passed = false;
  }

  if (!canPerformAction(teacherProfile, 'competition.create')) {
    details.push('Teacher was denied competition creation permission');
    passed = false;
  }

  // 3. Suspended account lockdown
  if (canPerformAction(suspendedProfile, 'practice.read')) {
    details.push('Security violation: Suspended account was permitted practice action');
    passed = false;
  }

  const suspendedAccess = canAccessView('student-dashboard', suspendedProfile);
  if (suspendedAccess.allowed) {
    details.push('Security violation: Suspended account was allowed into student dashboard');
    passed = false;
  }

  // 4. Route protection (Student cannot access teacher dashboard)
  const studentTeacherAccess = canAccessView('teacher-dashboard', studentProfile);
  if (studentTeacherAccess.allowed) {
    details.push('Security violation: Student was permitted to access teacher-dashboard');
    passed = false;
  }

  // 5. Error sanitization (No technical leaks)
  const friendlyMsg = getFriendlyAuthErrorMessage('auth/invalid-credential');
  if (friendlyMsg.includes('auth/') || friendlyMsg.includes('FirebaseError')) {
    details.push('Error message was not user-friendly');
    passed = false;
  }

  return { passed, details };
}
