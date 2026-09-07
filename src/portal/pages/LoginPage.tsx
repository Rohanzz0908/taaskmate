import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound, 
  Building2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/portal', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Load remembered user
  useEffect(() => {
    const remembered = localStorage.getItem('tm_portal_remembered_user_v1');
    if (remembered) {
      setEmailOrUser(remembered);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!emailOrUser.trim() || !password.trim()) {
      setErrorMsg('Please enter your email/username and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(emailOrUser, password, rememberMe);
      if (res.success) {
        navigate('/portal', { replace: true });
      } else {
        setErrorMsg(res.message || 'Invalid credentials. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      setShowForgotModal(false);
      setResetEmail('');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#0A131C] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans select-none">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#172B3A]/40 rounded-full blur-3xl pointer-events-none"></div>

      {/* Back to Public Site Link */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 backdrop-blur-sm"
        >
          <span>← Back to Public Website</span>
        </Link>
      </div>

      {/* Main Centered Login Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#11202D] rounded-2xl shadow-2xl border border-gray-800/80 p-8 sm:p-10 backdrop-blur-xl">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-navy border border-white/10 shadow-lg mb-4 text-brand-green">
              <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8">
                <path 
                  d="M18 3L31 10.5V25.5L18 33L5 25.5V10.5L18 3Z" 
                  stroke="#00C878" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="opacity-40"
                />
                <path 
                  d="M11 18.5L16 23.5L25 13.5" 
                  stroke="#00C878" 
                  strokeWidth="3.2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </div>

            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-1.5">
              <span>Taask</span>
              <span className="text-brand-green">mate</span>
            </h1>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-1">
              Management Portal
            </p>
          </div>

          {/* Error Notification */}
          {errorMsg && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Email / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="admin@taaskmate.com"
                  value={emailOrUser}
                  onChange={(e) => setEmailOrUser(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0A141E] text-white placeholder-gray-500 rounded-xl border border-gray-700/80 text-sm focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-brand-green hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 bg-[#0A141E] text-white placeholder-gray-500 rounded-xl border border-gray-700/80 text-sm focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-700 bg-[#0A141E] text-brand-green focus:ring-brand-green focus:ring-offset-gray-900"
                />
                <span className="text-xs text-gray-300">Remember my session</span>
              </label>
              <span className="text-[11px] text-gray-500">v2.4 Enterprise</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-brand-green hover:bg-brand-green-hover text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-brand-green/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Login to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>© 2026 Taaskmate Enterprise Solutions. Secure SSL 256-bit Encrypted.</p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#11202D] rounded-2xl max-w-sm w-full p-6 border border-gray-800 text-white shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Reset Portal Password</h3>
            <p className="text-xs text-gray-400 mb-4">
              Enter your registered work email address to receive password reset instructions.
            </p>

            {resetSent ? (
              <div className="text-center py-4 text-brand-green space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <p className="text-xs text-gray-300">Password reset link dispatched to <strong>{resetEmail}</strong></p>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="admin@taaskmate.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0A141E] text-white rounded-xl border border-gray-700 text-sm focus:outline-none focus:border-brand-green"
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold rounded-lg shadow cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
