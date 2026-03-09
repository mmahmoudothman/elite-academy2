import { useState, useEffect } from 'react';
import { SiteConfig } from '../types';
import { isFirebaseConfigured } from '../services/firebase';
import { subscribeSiteConfig } from '../services/firestoreService';

const DEFAULT_CONFIG: SiteConfig = {
  heroTitle: { en: 'Shape the Economic Future of MENA', ar: 'اصنع المستقبل الاقتصادي للمنطقة' },
  heroSubtitle: { en: 'Elite Academy provides world-class executive education tailored for high-growth markets.', ar: 'توفر أكاديمية النخبة تعليماً تنفيذياً عالمي المستوى.' },
  heroBadge: { en: 'Q3 Admissions Now Open', ar: 'باب القبول للربع الثالث مفتوح الآن' },
  companyName: { en: 'ELITE ACADEMY', ar: 'أكاديمية النخبة' },
  companyTagline: { en: 'Innovative Learning', ar: 'التعلم المبتكر' },
  contactEmail: 'info@elitelearning.com',
  contactPhone: '+20 104 074 2770',
  addresses: [
    { label: 'Egypt', value: 'Cairo, Egypt' },
    { label: 'Saudi Arabia', value: 'Riyadh, Saudi Arabia' },
  ],
  socialLinks: {
    whatsapp: 'https://wa.me/201040742770',
    instagram: 'https://instagram.com/elitelearning',
    linkedin: 'https://linkedin.com/company/elitelearning',
    twitter: 'https://twitter.com/elitelearning',
    facebook: 'https://facebook.com/elitelearning',
  },
  partners: [
    { name: 'Aramco', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/Saudi_Aramco_logo.svg/320px-Saudi_Aramco_logo.svg.png' },
    { name: 'NEOM', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/NEOM_logo.svg/320px-NEOM_logo.svg.png' },
    { name: 'Etisalat', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Etisalat_logo.svg/320px-Etisalat_logo.svg.png' },
    { name: 'CIB', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Commercial_International_Bank_Egypt_Logo.svg/320px-Commercial_International_Bank_Egypt_Logo.svg.png' },
  ],
  footerText: { en: 'Leading the future of education in MENA.', ar: 'نقود مستقبل التعليم في المنطقة.' },
  announcement: { en: '', ar: '', visible: false, link: '' },
  whatsappMessage: { en: 'Hello! I\'m interested in your courses.', ar: 'مرحباً! أنا مهتم ببرامجكم.' },
  whatsappNumber: '+201040742770',
  telegram: {
    botToken: '8754576598:AAGXNjDvenlyArVNTCYqLn1NFITWetYzIsA',
    chatId: '869497837',
    enabled: true,
    notifications: {
      newRegistration: true,
      newEnrollment: true,
      newPayment: true,
      newContact: true,
    },
  },
} as SiteConfig;

const STORAGE_KEY = 'elite_academy_site_config';

function mergeConfig(base: SiteConfig, overrides: Partial<SiteConfig>): SiteConfig {
  const merged = { ...base, ...overrides };
  // Deep-merge telegram so partial saves don't lose defaults
  if (base.telegram) {
    merged.telegram = {
      ...base.telegram,
      ...(overrides.telegram || {}),
      notifications: {
        ...base.telegram.notifications,
        ...(overrides.telegram?.notifications || {}),
      },
    };
  }
  return merged;
}

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return mergeConfig(DEFAULT_CONFIG, JSON.parse(stored));
      } catch { /* ignore */ }
    }
    return DEFAULT_CONFIG;
  });
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsub = subscribeSiteConfig((data) => {
      if (data) {
        const merged = mergeConfig(DEFAULT_CONFIG, data);
        setConfig(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      }
      setLoading(false);
    });

    return unsub;
  }, []);

  const updateConfig = async (newConfig: SiteConfig) => {
    const updated = { ...newConfig, updatedAt: Date.now() };
    setConfig(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (isFirebaseConfigured) {
      const { updateSiteConfig } = await import('../services/firestoreService');
      await updateSiteConfig(updated);
    }
  };

  return { config, loading, updateConfig, DEFAULT_CONFIG };
}
