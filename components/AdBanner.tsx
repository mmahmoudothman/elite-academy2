import React, { useState, useEffect } from 'react';
import { Ad } from '../types';
import { useLanguage } from './LanguageContext';
import { useDataManager } from '../hooks/useDataManager';

interface AdBannerProps {
  page?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ page = 'home' }) => {
  const { language, t } = useLanguage();
  const { ads } = useDataManager();
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    try {
      const stored = sessionStorage.getItem('dismissed_ads');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  const now = Date.now();

  const activeAds = ads
    .filter(ad =>
      ad.visible &&
      ad.status === 'active' &&
      ad.startDate <= now &&
      ad.endDate >= now &&
      ad.placement === 'banner' &&
      (!ad.targetPages?.length || ad.targetPages.includes(page)) &&
      !dismissed.has(ad.id)
    )
    .sort((a, b) => b.priority - a.priority);

  const dismiss = (id: string) => {
    setDismissed(prev => {
      const next = new Set(prev);
      next.add(id);
      sessionStorage.setItem('dismissed_ads', JSON.stringify([...next]));
      return next;
    });
  };

  if (activeAds.length === 0) return null;

  const ad = activeAds[0];
  const title = language === 'ar' ? ad.title.ar : ad.title.en;
  const content = language === 'ar' ? ad.content.ar : ad.content.en;

  return (
    <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center justify-center w-8 h-8 bg-white/20 rounded-full flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </span>
          <div className="min-w-0">
            <span className="font-black text-sm sm:text-base">{title}</span>
            {content && <span className="hidden md:inline text-sm text-white/90 font-medium ms-2">— {content}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {ad.link && (
            <a
              href={ad.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 bg-white text-teal-700 rounded-full text-xs font-black hover:bg-teal-50 transition-all"
            >
              {t.common?.learn_more || 'Learn More'}
            </a>
          )}
          <button
            onClick={() => dismiss(ad.id)}
            className="p-1 hover:bg-white/20 rounded-full transition-all"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdBanner;
