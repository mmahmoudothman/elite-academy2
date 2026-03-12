import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';

const NotFoundPage: React.FC = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Large 404 text */}
        <div className="relative">
          <h1 className="text-[10rem] sm:text-[14rem] font-black font-heading leading-none text-slate-100 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-5xl sm:text-7xl font-black font-heading text-[#0da993]">
              404
            </h2>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h3 className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
            {t?.notFound?.title || (isRTL ? 'الصفحة غير موجودة' : 'Page Not Found')}
          </h3>
          <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
            {t?.notFound?.description || (isRTL
              ? 'عذرا، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.'
              : 'Sorry, the page you are looking for does not exist or has been moved.')}
          </p>
        </div>

        {/* Back to home link */}
        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#0da993] text-white px-8 py-4 rounded-xl font-black text-sm sm:text-base hover:bg-[#0da993]/90 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            <svg
              className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {t?.notFound?.backHome || (isRTL ? 'العودة للرئيسية' : 'Back to Home')}
          </Link>
        </div>

        {/* Decorative element */}
        <div className="pt-8">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#0da993] animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 rounded-full bg-slate-200 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
