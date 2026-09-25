import React from 'react';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AccountStatusNotice: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 shadow-xl p-6 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">Account Access Suspended</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your account ({user?.email || user?.displayName}) is currently marked as {user?.accountStatus}.
            Please contact your school coordinator or class teacher to reactivate your access.
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl text-left border border-slate-100 text-[11px] text-slate-600 space-y-1">
          <div className="font-semibold text-slate-800">Assigned Institution:</div>
          <div>{user?.schoolName || 'SpellReady Member School'}</div>
          {user?.className && <div>Class: {user.className}</div>}
        </div>

        <button
          onClick={() => logout()}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
