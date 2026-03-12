import { useState, useEffect } from 'react';
import { SiteConfig } from '../types';
import { subscribeSiteConfig, updateSiteConfig as fsSaveSiteConfig } from '../services/firestoreService';

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
  partners: [],
  footerText: { en: 'Leading the future of education in MENA.', ar: 'نقود مستقبل التعليم في المنطقة.' },
  announcement: { en: '', ar: '', visible: false, link: '' },
  whatsappMessage: { en: 'Hello! I\'m interested in your courses.', ar: 'مرحباً! أنا مهتم ببرامجكم.' },
  whatsappNumber: '+201040742770',
  telegram: {
    botToken: '',
    chatId: '',
    enabled: false,
    notifications: {
      newRegistration: true,
      newEnrollment: true,
      newPayment: true,
      newContact: true,
    },
  },
} as SiteConfig;

function mergeConfig(base: SiteConfig, overrides: Partial<SiteConfig>): SiteConfig {
  const merged = { ...base, ...overrides };
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
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeSiteConfig((data) => {
      if (data) {
        setConfig(mergeConfig(DEFAULT_CONFIG, data));
      }
      setLoading(false);
    });

    return unsub;
  }, []);

  const updateConfig = async (newConfig: SiteConfig) => {
    const updated = { ...newConfig, updatedAt: Date.now() };
    setConfig(updated);
    await fsSaveSiteConfig(updated);
  };

  return { config, loading, updateConfig, DEFAULT_CONFIG };
}
