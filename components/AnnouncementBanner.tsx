import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { useSiteConfig } from '../hooks/useSiteConfig';

const DISMISS_KEY = 'elite_academy_announcement_dismissed';

const AnnouncementBanner: React.FC = () => {
  const { language, t } = useLanguage();
  const { config } = useSiteConfig();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) === 'true') {
      setDismissed(true);
    }
  }, []);

  const announcement = config.announcement;
  if (!announcement || !announcement.visible || dismissed) return null;

  const text = language === 'ar' ? announcement.ar : announcement.en;
  if (!text) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(DISMISS_KEY, 'true');
  };

  const content = announcement.link ? (
    <a href={announcement.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
      {text}
    </a>
  ) : (
    <span>{text}</span>
  );

  return (
    <div className="sticky top-0 z-[60] bg-gradient-to-r from-teal-600 to-blue-600 text-white py-2 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <p className="text-xs sm:text-sm font-bold text-center flex-1">
          {content}
        </p>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          aria-label={t.announcement?.close || 'Close'}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
