import React from 'react';
import { UserRole, AppView } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { AccountStatusNotice } from './AccountStatusNotice';
import { AuthLoadingScreen } from './AuthLoadingScreen';

interface Props {
  allowedRoles?: UserRole[];
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<Props> = ({
  allowedRoles,
  currentView,
  onNavigate,
  children
}) => {
  const { user, role, isLoading, isAuthenticated, canAccess } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (user?.accountStatus === 'suspended' || user?.accountStatus === 'disabled') {
    return <AccountStatusNotice />;
  }

  // Check authorization
  const access = canAccess(currentView);
  if (!access.allowed) {
    // If not allowed, show unauthorized notice or redirect
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold text-lg">
            !
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Access Restricted</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {access.reason || 'You do not have permission to open this page.'}
            </p>
          </div>
          <button
            onClick={() => onNavigate(access.fallbackView)}
            className="w-full py-2.5 px-4 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
            🔒
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Sign-in Required</h3>
            <p className="text-xs text-slate-500 mt-1">
              Please sign in with an authorized account to access this page.
            </p>
          </div>
          <button
            onClick={() => onNavigate('landing')}
            className="w-full py-2.5 px-4 bg-amber-500 text-slate-900 rounded-xl text-xs font-semibold hover:bg-amber-600 cursor-pointer"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
