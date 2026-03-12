import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { stripHtml } from '../utils/sanitize';
import toast from 'react-hot-toast';

const RegisterPage: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { signUpUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', country: 'EG' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const passwordChecks = useMemo(() => ({
    minLength: form.password.length >= 8,
    hasUppercase: /[A-Z]/.test(form.password),
    hasNumber: /[0-9]/.test(form.password),
  }), [form.password]);

  const passwordStrength = useMemo(() => {
    const passed = [passwordChecks.minLength, passwordChecks.hasUppercase, passwordChecks.hasNumber].filter(Boolean).length;
    if (passed === 0) return { level: 'none', label: '', color: '', width: '0%' };
    if (passed === 1) return { level: 'weak', label: t.auth?.password_weak || 'Weak', color: 'bg-red-500', width: '33%' };
    if (passed === 2) return { level: 'medium', label: t.auth?.password_medium || 'Medium', color: 'bg-amber-500', width: '66%' };
    return { level: 'strong', label: t.auth?.password_strong || 'Strong', color: 'bg-emerald-500', width: '100%' };
  }, [passwordChecks, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError(t.auth?.fields_required || 'Please fill in all required fields');
      return;
    }
    if (form.password.length < 8) {
      setError(t.auth?.password_min_8 || 'Password must be at least 8 characters');
      return;
    }
    if (!/[A-Z]/.test(form.password)) {
      setError(t.auth?.password_uppercase || 'Password must contain at least one uppercase letter');
      return;
    }
    if (!/[0-9]/.test(form.password)) {
      setError(t.auth?.password_number || 'Password must contain at least one number');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(t.auth?.password_mismatch || 'Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signUpUser(form.email, form.password, stripHtml(form.name), 'student', { phone: form.phone, country: form.country });
      setSuccess(true);
      toast.success(t.auth?.register_success || 'Account created successfully!');
      // Telegram notification (fire and forget)
      import('../services/telegramService').then(({ notifyNewRegistration }) => {
        notifyNewRegistration(form.name, form.email);
      }).catch(() => {});
      setTimeout(() => navigate('/'), 1200);
    } catch (err: any) {
      const msg = err.code === 'auth/email-already-in-use'
        ? (t.auth?.email_exists || 'This email is already registered')
        : (t.auth?.register_error || 'Registration failed. Please try again.');
      setError(msg);
      setLoading(false);
    }
  };

  const countries = [
    { code: 'EG', label: t.form?.egypt || 'Egypt' },
    { code: 'SA', label: t.form?.saudi || 'Saudi Arabia' },
    { code: 'AE', label: t.form?.uae || 'United Arab Emirates' },
    { code: 'KW', label: t.form?.kuwait || 'Kuwait' },
    { code: 'QA', label: t.form?.qatar || 'Qatar' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
          <div className="flex flex-col items-center mb-6">
            <Link to="/" className="mb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${success ? 'bg-emerald-500' : 'bg-teal-600'}`}>
                {success ? (
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-white font-bold text-2xl font-heading">E</span>
                )}
              </div>
            </Link>
            <h1 className="text-2xl font-black text-slate-900 font-heading">{t.auth?.register_title || 'Create Account'}</h1>
            <p className="text-sm text-slate-400 font-medium mt-1">{t.auth?.register_subtitle || 'Join Elite Academy today'}</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm font-bold text-red-600">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ms-1">{t.form?.name || 'Full Name'}</label>
              <input
                required type="text" value={form.name} onChange={e => update('name', e.target.value)}
                placeholder={t.form?.name_placeholder || 'Enter your name'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ms-1">{t.form?.email || 'Email'}</label>
              <input
                required type="email" value={form.email} onChange={e => update('email', e.target.value)}
                placeholder="example@mail.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ms-1">{t.form?.phone || 'Phone'}</label>
                <input
                  type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                  placeholder="+20..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ms-1">{t.form?.country || 'Country'}</label>
                <select
                  value={form.country} onChange={e => update('country', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm appearance-none"
                >
                  {countries.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ms-1">{t.auth?.password || 'Password'}</label>
              <input
                required type="password" value={form.password} onChange={e => update('password', e.target.value)}
                placeholder={t.auth?.password_placeholder || 'Min 8 characters'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
              {/* Password strength indicator */}
              {form.password.length > 0 && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${passwordStrength.color} rounded-full transition-all duration-300`} style={{ width: passwordStrength.width }} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${passwordStrength.color.replace('bg-', 'text-')}`}>{passwordStrength.label}</span>
                  </div>
                  <div className="space-y-1">
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${passwordChecks.minLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {passwordChecks.minLength ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />}
                      </svg>
                      {t.auth?.check_min_8 || 'At least 8 characters'}
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${passwordChecks.hasUppercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {passwordChecks.hasUppercase ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />}
                      </svg>
                      {t.auth?.check_uppercase || 'At least one uppercase letter'}
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${passwordChecks.hasNumber ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {passwordChecks.hasNumber ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />}
                      </svg>
                      {t.auth?.check_number || 'At least one number'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ms-1">{t.auth?.confirm_password || 'Confirm Password'}</label>
              <input
                required type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
                placeholder={t.auth?.confirm_placeholder || 'Re-enter password'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? (t.auth?.creating || 'Creating account...') : (t.auth?.register_button || 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <Link to="/login" className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors">
              {t.auth?.has_account || 'Already have an account? Sign in'}
            </Link>
            <div>
              <button onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} className="text-sm font-bold text-slate-400 hover:text-teal-600 transition-colors">
                {language === 'en' ? 'العربية' : 'English'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
