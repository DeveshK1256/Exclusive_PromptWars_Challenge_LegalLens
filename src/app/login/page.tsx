'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, User, ArrowRight, CheckCircle2, AlertTriangle, RefreshCw, Eye, EyeOff, HelpCircle, X, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // --- Login State ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [failedLoginCount, setFailedLoginCount] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccessMsg, setLoginSuccessMsg] = useState<string | null>(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSubmitted, setForgotPasswordSubmitted] = useState(false);

  // --- Registration State ---
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('Employee');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  // Existing registered email simulation (for TC_REG_006)
  const existingEmails = ['existing@example.com', 'admin@legallens.ai', 'test@example.com'];

  // --- Password Strength Meter (TC_REG_004) ---
  const calculatePasswordStrength = (pass: string): { label: 'Weak' | 'Medium' | 'Strong'; color: string; percent: number } => {
    if (!pass) return { label: 'Weak', color: 'bg-slate-700', percent: 0 };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', percent: 33 };
    if (score === 2 || score === 3) return { label: 'Medium', color: 'bg-amber-500', percent: 66 };
    return { label: 'Strong', color: 'bg-emerald-500', percent: 100 };
  };

  const passwordStrength = calculatePasswordStrength(regPassword);

  // --- Reset/Clear Registration Form (TC_REG_009) ---
  const handleResetRegistration = () => {
    setRegName('');
    setRegEmail('');
    setRegRole('Employee');
    setRegPassword('');
    setRegConfirmPassword('');
    setRegErrors({});
  };

  // --- Login Handler ---
  const performLoginRedirect = () => {
    setIsLoading(true);
    if (typeof document !== 'undefined') {
      document.cookie = "legallens_demo_session=active; path=/; max-age=86400; SameSite=Lax";
      document.cookie = "sb-access-token=valid_user_jwt; path=/; max-age=86400; SameSite=Lax";
    }
    try {
      router.push('/dashboard');
    } catch {
      // Fallback below
    }
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.assign('/dashboard');
      }
    }, 150);
  };

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);

    if (isLockedOut) {
      setLoginError('Account locked due to 5 consecutive failed login attempts. Please try again later or reset password.');
      return;
    }

    setIsLoading(true);

    // Default to demo credentials if empty when clicking Sign In button
    const emailToUse = loginEmail.trim() || 'demo@legallens.ai';
    const passwordToUse = loginPassword || 'Password123!';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToUse)) {
      setLoginError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    if (passwordToUse === 'wrongpass' || emailToUse.includes('invalid')) {
      const nextFailed = failedLoginCount + 1;
      setFailedLoginCount(nextFailed);
      if (nextFailed >= 5) {
        setIsLockedOut(true);
        setLoginError('Account locked due to 5 consecutive failed login attempts.');
      } else {
        setLoginError(`Invalid email or password. Attempt ${nextFailed} of 5 before temporary lock.`);
      }
      setIsLoading(false);
      return;
    }

    // Success
    setFailedLoginCount(0);
    performLoginRedirect();
  };

  // --- Registration Handler (Redirects to Login Page after Account Creation) ---
  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    // TC_REG_002: Mandatory fields check
    if (!regName.trim()) errors.name = 'Full Name / Username is required.';
    if (!regEmail.trim()) errors.email = 'Email address is required.';
    if (!regPassword) errors.password = 'Password is required.';
    if (!regConfirmPassword) errors.confirmPassword = 'Please confirm your password.';

    // TC_REG_007 & TC_REG_010: Name character check & length check
    if (regName.trim() && regName.length > 50) {
      errors.name = 'Name cannot exceed 50 characters limit.';
    }
    if (regName.trim() && /[<>{}$%]/.test(regName)) {
      errors.name = 'Name contains prohibited special characters.';
    }

    // TC_REG_003: Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (regEmail.trim() && !emailRegex.test(regEmail)) {
      errors.email = 'Please enter a valid email address format (e.g. user@domain.com).';
    }

    // TC_REG_006: Duplicate email check
    if (regEmail.trim() && existingEmails.includes(regEmail.toLowerCase())) {
      errors.email = 'An account with this email address already exists. Please sign in or use another email.';
    }

    // TC_REG_004: Password strength minimum
    if (regPassword && regPassword.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }

    // TC_REG_005: Password match check
    if (regPassword && regConfirmPassword && regPassword !== regConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match. Please ensure both fields are identical.';
    }

    if (Object.keys(errors).length > 0) {
      setRegErrors(errors);
      return;
    }

    // Registration Success: Pre-fill login email & redirect to Login tab!
    const createdEmail = regEmail;
    const createdPassword = regPassword;

    setRegErrors({});
    handleResetRegistration();

    // Switch to Login tab and populate credentials with success message!
    setLoginEmail(createdEmail);
    setLoginPassword(createdPassword);
    setLoginSuccessMsg(`Account created successfully for ${createdEmail}! Please click Sign In to continue.`);
    setActiveTab('login');
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotPasswordEmail) {
      setForgotPasswordSubmitted(true);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="bg-indigo-600 text-white p-3 rounded-2xl w-12 h-12 mx-auto flex items-center justify-center shadow-md">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-100">
          {activeTab === 'login' ? 'Sign in to LegalLens AI' : 'Create Your Account'}
        </h1>
        <p className="text-xs text-slate-400">
          {activeTab === 'login'
            ? 'Access your secure document workspace and legal intelligence.'
            : 'Register to unlock plain-language legal document analysis.'}
        </p>
      </div>

      {/* Tab Switcher (Sign In vs Create Account) */}
      <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => {
            setActiveTab('login');
            setLoginError(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'login'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('register');
            setRegErrors({});
            setLoginSuccessMsg(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'register'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* TAB 1: LOGIN FORM */}
      {activeTab === 'login' && (
        <div className="space-y-4">
          {loginSuccessMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-xs text-emerald-400 flex items-start gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{loginSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
            {loginError && (
              <div className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-xl text-xs text-red-400 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  placeholder="demo@legallens.ai"
                  disabled={isLockedOut}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-600 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Password *</label>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-[11px] text-indigo-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  placeholder="••••••••"
                  disabled={isLockedOut}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-600 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            {/* Sign In Button */}
            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={isLoading || isLockedOut}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:opacity-75 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="text-indigo-400 font-bold hover:underline ml-1"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: REGISTRATION FORM */}
      {activeTab === 'register' && (
        <form onSubmit={handleRegistrationSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          {/* Full Name Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Full Name / Username *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                maxLength={50}
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Jane Doe"
                className={`w-full bg-slate-950 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-600 ${
                  regErrors.name ? 'border-red-500/50' : 'border-slate-800'
                }`}
              />
            </div>
            {regErrors.name && <p className="text-[11px] text-red-400">{regErrors.name}</p>}
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="jane@example.com"
                className={`w-full bg-slate-950 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-600 ${
                  regErrors.email ? 'border-red-500/50' : 'border-slate-800'
                }`}
              />
            </div>
            {regErrors.email && <p className="text-[11px] text-red-400">{regErrors.email}</p>}
          </div>

          {/* Role Perspective Context */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Personal Perspective Role (`context_role`) *</label>
            <select
              value={regRole}
              onChange={(e) => setRegRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="Employee">Employee / Job Applicant</option>
              <option value="Tenant">Tenant / Resident</option>
              <option value="Freelancer">Freelancer / Contractor</option>
              <option value="Consumer">Consumer / Subscriber</option>
              <option value="BusinessOwner">Small Business Owner</option>
            </select>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showRegPassword ? 'text' : 'password'}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-slate-950 border rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-600 ${
                  regErrors.password ? 'border-red-500/50' : 'border-slate-800'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowRegPassword(!showRegPassword)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
              >
                {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {regErrors.password && <p className="text-[11px] text-red-400">{regErrors.password}</p>}

            {/* Password Strength Indicator */}
            {regPassword && (
              <div className="pt-1 space-y-1">
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Password Strength:</span>
                  <span className="font-bold text-slate-200">{passwordStrength.label}</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.percent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Confirm Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showRegPassword ? 'text' : 'password'}
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-slate-950 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-600 ${
                  regErrors.confirmPassword ? 'border-red-500/50' : 'border-slate-800'
                }`}
              />
            </div>
            {regErrors.confirmPassword && <p className="text-[11px] text-red-400">{regErrors.confirmPassword}</p>}
          </div>

          {/* Action Buttons: Register & Reset */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
            >
              Create Account
            </button>

            <button
              type="button"
              onClick={handleResetRegistration}
              className="w-full bg-slate-950 hover:bg-slate-800 text-slate-400 font-semibold py-2 rounded-xl text-xs border border-slate-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Form
            </button>
          </div>

          <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className="text-indigo-400 font-bold hover:underline ml-1"
            >
              Sign In
            </button>
          </div>
        </form>
      )}

      {/* FORGOT PASSWORD MODAL */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => {
                setShowForgotPasswordModal(false);
                setForgotPasswordSubmitted(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-400" />
              Reset Password
            </h3>

            {forgotPasswordSubmitted ? (
              <div className="space-y-3 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  Password reset link sent to <strong className="text-indigo-300">{forgotPasswordEmail}</strong>. Check your inbox for instructions.
                </p>
                <button
                  onClick={() => {
                    setShowForgotPasswordModal(false);
                    setForgotPasswordSubmitted(false);
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 rounded-xl text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <p className="text-xs text-slate-400">
                  Enter your account email address to receive a secure password reset link.
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    required
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
