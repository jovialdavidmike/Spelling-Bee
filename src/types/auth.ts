export type UserRole = 'guest' | 'student' | 'teacher' | 'admin';

export type AccountStatus = 'active' | 'pending' | 'suspended' | 'disabled';

export interface UserProfile {
  uid: string;
  id?: string; // Alias for backward compatibility
  email: string | null;
  displayName: string;
  name?: string; // Alias for backward compatibility
  role: UserRole;
  accountStatus: AccountStatus;
  schoolId?: string;
  schoolName?: string;
  classId?: string;
  className?: string;
  studentCode?: string;
  photoURL?: string;
  avatarUrl?: string; // Alias for backward compatibility
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  // Voice preferences attached to authenticated identity
  preferredVoice?: string;
  voiceRate?: number;
}

export type AuthState = 
  | 'INITIALIZING'
  | 'AUTHENTICATED'
  | 'UNAUTHENTICATED'
  | 'SUSPENDED'
  | 'NEEDS_PROFILE_SETUP';

export type AuthAction = 
  | 'practice.read'
  | 'practice.submit'
  | 'competition.join'
  | 'competition.create'
  | 'competition.manage'
  | 'class.manage'
  | 'assignment.create'
  | 'student.viewList'
  | 'admin.access';
