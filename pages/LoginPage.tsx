import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { checkRateLimit, getRemainingCooldown } from '../utils/rateLimit';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { signInUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError(t.auth?.fields_required || 'Please fill in all fields');
      return;
    }

    // Rate limit: 5 attempts per 5 minutes
    if (!checkRateLimit('login', 5, 5 * 60 * 1000)) {
      const cooldown = Math.ceil(getRemainingCooldown('login', 5 * 60 * 1000) / 1000);
      setError(`${t.auth?.too_many_attempts || 'Too many login attempts. Please wait'} ${cooldown} ${t.auth?.seconds || 'seconds'}.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signInUser(email, password);
      setSuccess(true);
      toast.success(t.auth?.login_success || 'Welcome back!');
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err: any) {
      setError(t.auth?.login_error || 'Invalid credentials. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 transition-all duration-300">
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <Link to="/" className="mb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-500 ${success ? 'bg-emerald-500' : 'bg-teal-600'}`}>
                {success ? (
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-white font-bold text-2xl font-heading">E</span>
                )}
              </div>
            </Link>
            <h1 className="text-2xl font-black text-slate-900 font-heading">{t.auth?.login_title || 'Sign In'}</h1>
            <p className="text-sm text-slate-400 font-medium mt-1">{t.auth?.login_subtitle || 'Welcome back to Elite Academy'}</p>
          </div>

          {success && (
            <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 animate-[fadeSlideIn_0.3s_ease-out]">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-bold text-emerald-700">{t.auth?.redirecting || 'Welcome! Redirecting...'}</span>
            </div>
          )}

          {error && !success && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-[fadeSlideIn_0.3s_ease-out]">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="text-sm font-bold text-red-600">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t.auth?.email || 'Email / Username'}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-4 rtl:pr-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder={t.auth?.email_placeholder || 'Enter email or username'}
                  disabled={loading}
                  className="w-full pl-11 rtl:pl-4 rtl:pr-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all disabled:opacity-60"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t.auth?.password || 'Password'}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-4 rtl:pr-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder={t.auth?.password_placeholder || 'Enter password'}
                  disabled={loading}
                  className="w-full pl-11 rtl:pl-12 rtl:pr-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-4 rtl:pl-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18" />
                    ) : (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 ${
                success ? 'bg-emerald-500 text-white' : 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500'
              } disabled:cursor-not-allowed`}
            >
              {loading && !success && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {success ? (t.auth?.redirecting || 'Redirecting...') : loading ? (t.auth?.signing_in || 'Signing in...') : (t.auth?.login_button || 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <Link to="/register" className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors">
              {t.auth?.no_account || "Don't have an account? Register"}
            </Link>
            <div>
              <button
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="text-sm font-bold text-slate-400 hover:text-teal-600 transition-colors"
              >
                {language === 'en' ? 'العربية' : 'English'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
