import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Atom,
  HelpCircle
} from 'lucide-react';

// Google 4-Color SVG Logo
const GoogleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.76-2.1-6.71-4.93H1.25v3.13C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.29 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.04-3.13z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.04 3.13c.95-2.83 3.59-4.96 6.71-4.96z"
    />
  </svg>
);

// Simulated Google Accounts for realistic OAuth picker
const MOCK_GOOGLE_ACCOUNTS = [
  {
    name: 'Quantum Explorer',
    email: 'user.quantum@gmail.com',
    avatar: '🧑‍🚀',
  },
  {
    name: 'Narasimha Developer',
    email: 'narasimha.dev@gmail.com',
    avatar: '⚡',
  },
];

export const AuthModal: React.FC = () => {
  const [store, actions] = useGameStore();

  const [mode, setMode] = useState<'login' | 'signup'>(store.authMode || 'signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [goal, setGoal] = useState('Beginner');
  
  // UI states
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  if (!store.authModalOpen) return null;

  const validateEmail = (str: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address (e.g. learner@example.com).');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Please tell us your name so QBIT AI can address you.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccessMsg(mode === 'signup' ? 'Account created successfully! Welcome to QBIT.' : 'Welcome back to QBIT!');
      
      setTimeout(() => {
        if (mode === 'signup') {
          actions.signup(email.trim(), name.trim() || undefined, 'email');
        } else {
          actions.login(email.trim(), undefined, 'email');
        }
        setSuccessMsg(null);
      }, 700);
    }, 600);
  };

  const handleGoogleSelect = (acc: typeof MOCK_GOOGLE_ACCOUNTS[0]) => {
    setLoading(true);
    setShowGooglePicker(false);
    
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg(`Signed in with Google as ${acc.name}!`);
      setTimeout(() => {
        actions.login(acc.email, acc.name, 'google');
        setSuccessMsg(null);
      }, 700);
    }, 600);
  };

  const handleDirectGoogleLogin = () => {
    setShowGooglePicker(true);
  };

  const handleGuestContinue = () => {
    actions.closeAuth();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto selection:bg-indigo-500 selection:text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 my-auto"
      >
        {/* Close Button */}
        <button
          onClick={handleGuestContinue}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all z-10"
          title="Close / Continue as Guest"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header / Brand with Official QBIT Platform Logo (Reference Image 2) */}
        <div className="pt-8 pb-4 px-6 text-center bg-gradient-to-b from-indigo-50/70 via-white to-white">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-cyan-400 via-indigo-600 to-purple-600 shadow-xl shadow-cyan-500/20 mb-3 ring-2 ring-cyan-400/30 bg-black">
            <img 
              src="/qbit-platform-logo.jpg" 
              alt="QBIT Quantum Computing Platform" 
              className="w-full h-full object-cover object-top rounded-[14px]"
            />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            {mode === 'signup' ? 'Create your QBIT Account' : 'Log in to QBIT'}
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
            {mode === 'signup' 
              ? 'Save your quantum streaks, earn XP, and unlock interactive 3D circuits.' 
              : 'Welcome back! Continue your daily quantum streak and track your progress.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="px-6 pb-2">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Log In
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-6 pt-2 space-y-4">
          {/* Success Message Banner */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 bg-rose-50 border border-rose-300 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* GOOGLE SIGN IN BUTTON */}
          <button
            type="button"
            onClick={handleDirectGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-bold text-sm shadow-xs transition-all hover:border-slate-300 group cursor-pointer"
          >
            <GoogleIcon className="w-5 h-5 shrink-0" />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-1">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 absolute">
              OR
            </span>
          </div>

          {/* EMAIL & PASSWORD FORM */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Richard Feynman"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordSent(true);
                      setTimeout(() => setForgotPasswordSent(false), 4000);
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {forgotPasswordSent && (
              <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-800 text-[11px] font-medium">
                Password reset link simulated! Check your inbox for recovery instructions.
              </div>
            )}

            {/* In Signup: Quick Skill Level */}
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  Quantum Experience
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: 'Beginner', icon: '🌱' },
                    { label: 'Student', icon: '📚' },
                    { label: 'Scientist', icon: '⚛️' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setGoal(item.label)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-1.5 ${
                        goal === item.label
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-wider shadow-lg border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin text-lg">⚛</span>
                    <span>Connecting...</span>
                  </span>
                ) : (
                  <>
                    <span>{mode === 'signup' ? 'Create Account' : 'Log In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Toggle between Login and Signup */}
          <div className="text-center pt-1 text-xs text-slate-500">
            {mode === 'signup' ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer uppercase tracking-wider text-[11px]"
                >
                  Log In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); }}
                  className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer uppercase tracking-wider text-[11px]"
                >
                  Sign Up Free
                </button>
              </span>
            )}
          </div>

          {/* Guest preview link */}
          <div className="border-t border-slate-100 pt-3 text-center">
            <button
              type="button"
              onClick={handleGuestContinue}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              Skip for now • Explore as Guest →
            </button>
          </div>
        </div>

        {/* Footer info banner */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400 font-medium">
          QBIT Quantum Computing Platform • Secure Authentication
        </div>
      </motion.div>

      {/* Realistic Google Account Picker Modal */}
      <AnimatePresence>
        {showGooglePicker && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-900"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <GoogleIcon className="w-5 h-5" />
                  <span className="font-bold text-sm text-slate-800">Sign in with Google</span>
                </div>
                <button
                  onClick={() => setShowGooglePicker(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-4">
                Choose an account to continue to <strong className="text-slate-800">QBIT</strong>:
              </p>

              <div className="space-y-2 mb-4">
                {MOCK_GOOGLE_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => handleGoogleSelect(acc)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-left group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-lg shrink-0">
                      {acc.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-700">
                        {acc.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {acc.email}
                      </div>
                    </div>
                  </button>
                ))}

                {/* Custom Google Account input option */}
                <div className="p-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center">
                  <span className="text-[11px] text-slate-500 block mb-1">Or enter any Google account:</span>
                  <input
                    type="email"
                    placeholder="yourname@gmail.com"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        const val = e.currentTarget.value.trim();
                        handleGoogleSelect({
                          name: val.split('@')[0],
                          email: val,
                          avatar: '⚛️',
                        });
                      }
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Press Enter to continue</span>
                </div>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowGooglePicker(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
