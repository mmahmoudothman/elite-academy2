
import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';

interface RegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[150] overflow-y-auto" onClick={onClose}>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div className="relative min-h-full flex items-start sm:items-center justify-center p-0 sm:p-4">
        <div
          className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl lg:rounded-[2.5rem] shadow-2xl p-5 sm:p-8 lg:p-12 sm:my-4"
          style={{ animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {isSuccess ? (
            <div className="text-center py-8 sm:py-12 space-y-4 sm:space-y-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
                {t.form.success_title}
              </h3>
              <p className="text-slate-500 font-medium text-sm sm:text-base">
                {t.form.success_desc}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-5 sm:mb-8 pr-8">
                <h3 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 mb-2">
                  {t.form.title}
                </h3>
                <p className="text-slate-500 font-medium text-xs sm:text-sm">
                  {t.form.desc}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="space-y-1 text-left rtl:text-right">
                  <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ms-1">
                    {t.form.name}
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg sm:rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm sm:text-base"
                    placeholder={t.form.name_placeholder}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left rtl:text-right">
                  <div className="space-y-1">
                    <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ms-1">
                      {t.form.email}
                    </label>
                    <input
                      required
                      type="email"
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg sm:rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm sm:text-base"
                      placeholder="example@mail.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ms-1">
                      {t.form.phone}
                    </label>
                    <input
                      required
                      type="tel"
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg sm:rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm sm:text-base"
                      placeholder="+1 234..."
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left rtl:text-right">
                  <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ms-1">
                    {t.form.country}
                  </label>
                  <select className="w-full bg-slate-50 border border-slate-100 rounded-lg sm:rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold appearance-none text-sm sm:text-base">
                    <option value="EG">{t.form.egypt}</option>
                    <option value="SA">{t.form.saudi}</option>
                    <option value="AE">{t.form.uae}</option>
                  </select>
                </div>

                <button
                  disabled={isSubmitting}
                  className="w-full btn-action py-3.5 sm:py-4 rounded-lg sm:rounded-xl font-black text-sm disabled:opacity-50 mt-3 sm:mt-4 active:scale-95"
                >
                  {isSubmitting ? t.form.submitting : t.form.submit}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
