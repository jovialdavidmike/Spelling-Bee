import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { UserProfile, UserRole, AuthAction } from '../types/auth';
import { AppView } from '../types';
import { authService } from '../services/authService';
import { hasRole, hasAnyRole, canPerformAction, canAccessView } from '../services/authAuthorization';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (params: {
    email: string;
    password: string;
    displayName: string;
    role: UserRole;
    schoolName?: string;
    className?: string;
    studentCode?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginStudentWithCode: (code: string, pin?: string) => { success: boolean; error?: string };
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  switchRole: (role: UserRole, studentId?: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  canPerform: (action: AuthAction) => boolean;
  canAccess: (view: AppView) => { allowed: boolean; fallbackView: AppView; reason?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(authService.getProfile());
  const [isLoading, setIsLoading] = useState<boolean>(authService.getIsInitializing());

  useEffect(() => {
    const unsubscribe = authService.subscribe((profile) => {
      setUser(profile);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const role = useMemo<UserRole>(() => user ? user.role : 'guest', [user]);
  const isAuthenticated = useMemo<boolean>(() => user !== null, [user]);

  const value: AuthContextType = {
    user,
    role,
    isAuthenticated,
    isLoading,
    loginWithEmail: async (email, pass) => {
      const res = await authService.loginWithEmail(email, pass);
      return { success: res.success, error: res.error };
    },
    register: async (params) => {
      const res = await authService.registerUser(params);
      return { success: res.success, error: res.error };
    },
    loginStudentWithCode: (code, pin) => {
      const res = authService.loginStudentWithCode(code, pin);
      return { success: res.success, error: res.error };
    },
    sendPasswordReset: async (email) => {
      return await authService.sendPasswordReset(email);
    },
    switchRole: (newRole, studentId) => {
      authService.switchRole(newRole, studentId);
    },
    updateProfile: async (updates) => {
      await authService.updateProfile(updates);
    },
    logout: async () => {
      await authService.logout();
    },
    hasRole: (checkRole) => hasRole(user, checkRole),
    hasAnyRole: (roles) => hasAnyRole(user, roles),
    canPerform: (action) => canPerformAction(user, action),
    canAccess: (view) => canAccessView(view, user)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
