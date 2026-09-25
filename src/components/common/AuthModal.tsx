import React, { useState } from 'react';
import { UserRole, AppView } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import {
  X,
  GraduationCap,
  School,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRoleChanged: (role: UserRole) => void;
  onNavigate: (view: AppView) => void;
  initialMode?: 'login' | 'register' | 'code';
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onRoleChanged,
  onNavigate,
  initialMode = 'login'
}) => {
  const { loginWithEmail, register, loginStudentWithCode, sendPasswordReset, switchRole } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'register' | 'student-code' | 'forgot-password'>(
    initialMode === 'register' ? 'register' : initialMode === 'code' ? 'student-code' : 'signin'
  );

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register State
  const [regRole, setRegRole] = useState<'student' | 'teacher'>('student');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSchool, setRegSchool] = useState('Federal Science & Technical College, Yaba');
  const [regClass, setRegClass] = useState('SS 1 Gold');
  const [regStudentCode, setRegStudentCode] = useState('');

  // Student Code State
  const [codeValue, setCodeValue] = useState('CCA-SS1-001');
  const [codePin, setCodePin] = useState('4827');

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const enrolled = dataService.getEnrolledStudents();

  // --- HANDLER: EMAIL LOGIN ---
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!loginEmail.trim() || !loginPassword) {
      setError('Please provide both email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginWithEmail(loginEmail, loginPassword);
      if (!res.success) {
        setError(res.error || 'Authentication failed. Please verify your credentials.');
        setIsSubmitting(false);
        return;
      }

      setSuccess('Signed in successfully!');
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
        if (loginEmail.toLowerCase().includes('teacher')) {
          onRoleChanged('teacher');
          onNavigate('teacher-dashboard');
        } else {
          onRoleChanged('student');
          onNavigate('student-dashboard');
        }
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Network error occurred. Please check connection.');
      setIsSubmitting(false);
    }
  };

  // --- HANDLER: REGISTRATION ---
  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!regName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setError('Please enter a valid email address.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register({
        email: regEmail,
        password: regPassword,
        displayName: regName,
        role: regRole,
        schoolName: regSchool,
        className: regRole === 'student' ? regClass : undefined,
        studentCode: regRole === 'student' && regStudentCode ? regStudentCode : undefined
      });

      if (!res.success) {
        setError(res.error || 'Registration could not be completed.');
        setIsSubmitting(false);
        return;
      }

      setSuccess(`Account created! Welcome to SpellReady, ${regName}.`);
      setTimeout(() => {
        setIsSubmitting(false);
        onRoleChanged(regRole);
        onNavigate(regRole === 'teacher' ? 'teacher-dashboard' : 'student-dashboard');
        onClose();
      }, 800);
    } catch (err: any) {
      setError(err?.message || 'An error occurred during account creation.');
      setIsSubmitting(false);
    }
  };

  // --- HANDLER: STUDENT CODE LOGIN ---
  const handleStudentCodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!codeValue.trim()) {
      setError('Please enter your school-issued Student Code.');
      return;
    }

    setIsSubmitting(true);
    const res = loginStudentWithCode(codeValue, codePin);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Student code authentication failed.');
      return;
    }

    setSuccess('Student code verified! Entering student portal…');
    setTimeout(() => {
      onRoleChanged('student');
      onNavigate('student-dashboard');
      onClose();
    }, 600);
  };

  // --- HANDLER: FORGOT PASSWORD ---
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!forgotEmail.trim()) {
      setError('Please enter your account email address.');
      return;
    }

    setIsSubmitting(true);
    const res = await sendPasswordReset(forgotEmail);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Failed to dispatch reset email.');
      return;
    }

    setSuccess('If an account exists for that email, we have sent instructions to reset your password.');
  };

  // --- HANDLER: FAST TEST SWITCHER ---
  const handleQuickDemoSelect = (role: UserRole, studentId?: string) => {
    switchRole(role, studentId);
    onRoleChanged(role);
    onNavigate(role === 'teacher' ? 'teacher-dashboard' : 'student-dashboard');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {activeTab === 'signin' && 'Sign In to SpellReady'}
              {activeTab === 'register' && 'Create Your Account'}
              {activeTab === 'student-code' && 'Student Code Sign-In'}
              {activeTab === 'forgot-password' && 'Reset Your Password'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === 'signin' && 'Access personalized practice, assignments, and competitions'}
              {activeTab === 'register' && 'Join your school spelling bee preparation platform'}
              {activeTab === 'student-code' && 'For students using school-issued credentials without email'}
              {activeTab === 'forgot-password' && 'Enter your email to receive recovery instructions'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setActiveTab('signin'); setError(null); setSuccess(null); }}
            className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'signin'
                ? 'border-amber-500 text-amber-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('register'); setError(null); setSuccess(null); }}
            className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'register'
                ? 'border-indigo-600 text-indigo-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('student-code'); setError(null); setSuccess(null); }}
            className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'student-code'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Student Code</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* TAB 1: EMAIL SIGN IN */}
          {activeTab === 'signin' && (
            <div className="space-y-4">
              <form onSubmit={handleEmailLogin} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@school.edu.ng"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('forgot-password'); setError(null); }}
                      className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 text-xs font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing you in…</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Fast Test Account Switchers */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <span>Quick Test Personas</span>
                  <span className="text-[10px] text-amber-600 lowercase font-normal">1-click test</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoSelect('teacher')}
                    className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/50 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                      <School className="w-3.5 h-3.5 text-indigo-600" />
                      <span>David Mike</span>
                    </div>
                    <div className="text-[10px] text-indigo-700 mt-0.5">Teacher / Coach</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoSelect('student', 'std_01')}
                    className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                      <span>Amara Okafor</span>
                    </div>
                    <div className="text-[10px] text-amber-700 mt-0.5">Student (SS 1 Gold)</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTRATION */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              {/* Role Toggle */}
              <div className="flex rounded-xl bg-slate-100 p-1 font-semibold text-[11px]">
                <button
                  type="button"
                  onClick={() => setRegRole('student')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    regRole === 'student' ? 'bg-white shadow-xs text-amber-900' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Student Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('teacher')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    regRole === 'teacher' ? 'bg-white shadow-xs text-indigo-900' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <School className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Teacher / Coach</span>
                </button>
              </div>

              <form onSubmit={handleRegistration} className="space-y-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={regRole === 'student' ? 'e.g. Chinelo Nnamdi' : 'e.g. Mr. Oluwaseun Adeleke'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder={regRole === 'student' ? 'student@school.edu.ng' : 'teacher@school.edu.ng'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Password (min 6 chars) *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">School / Institution</label>
                  <input
                    type="text"
                    value={regSchool}
                    onChange={(e) => setRegSchool(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {regRole === 'student' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Class</label>
                      <input
                        type="text"
                        value={regClass}
                        onChange={(e) => setRegClass(e.target.value)}
                        placeholder="SS 1 Gold"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Student Code (Opt)</label>
                      <input
                        type="text"
                        value={regStudentCode}
                        onChange={(e) => setRegStudentCode(e.target.value)}
                        placeholder="CCA-SS1-099"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Account…</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: STUDENT CODE SIGN IN */}
          {activeTab === 'student-code' && (
            <div className="space-y-4">
              <form onSubmit={handleStudentCodeLogin} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Student Code (School-Issued)</label>
                  <input
                    type="text"
                    required
                    value={codeValue}
                    onChange={(e) => setCodeValue(e.target.value)}
                    placeholder="e.g. CCA-SS1-001"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400">Provided by your teacher on class enrollment roster.</span>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Security PIN (4 Digits)</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={codePin}
                    onChange={(e) => setCodePin(e.target.value)}
                    placeholder="4827"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In as Student</span>
                </button>
              </form>

              {/* Quick Roster Selectors */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Enrolled Students in Demo School
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {enrolled.slice(0, 4).map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setCodeValue(st.studentCode);
                        setCodePin(st.pin);
                        const res = loginStudentWithCode(st.studentCode, st.pin);
                        if (res.success) {
                          onRoleChanged('student');
                          onNavigate('student-dashboard');
                          onClose();
                        }
                      }}
                      className="p-2.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-slate-900">{st.name}</div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                        <span>{st.className}</span>
                        <span className="font-mono text-slate-400">{st.studentCode}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FORGOT PASSWORD */}
          {activeTab === 'forgot-password' && (
            <div className="space-y-4">
              <form onSubmit={handleForgotPassword} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Account Email Address</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@school.edu.ng"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    We will send a secure password reset link to this address.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('signin')}
                    className="flex-1 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 text-xs font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? 'Sending…' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
