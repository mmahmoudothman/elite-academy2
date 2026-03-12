import React, { useState, useMemo } from 'react';
import { useLanguage } from './LanguageContext';
import { FAQ } from '../types';

interface FAQSectionProps {
  faqs?: FAQ[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ faqs: rawFaqs = [] }) => {
  const { t, language } = useLanguage();
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const faqs = rawFaqs
    .filter(item => item.visible)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const categories = useMemo(() => {
    const cats = Array.from(new Set(faqs.map(f => f.category).filter(Boolean)));
    return cats;
  }, [faqs]);

  const filteredFAQs = activeCategory === 'all'
    ? faqs
    : faqs.filter(f => f.category === activeCategory);

  const toggleItem = (id: string) => {
    setOpenId(prev => prev === id ? null : id);
  };

  if (faqs.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6">
            <span className="text-teal-700 font-bold text-[10px] sm:text-xs uppercase tracking-widest">
              {t.faq?.badge || (language === 'ar' ? 'الأسئلة الشائعة' : 'FAQ')}
            </span>
          </div>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading leading-tight text-slate-900">
            {t.faq?.title || (language === 'ar' ? 'الأسئلة الأكثر شيوعاً' : 'Frequently Asked Questions')}
          </h3>
        </div>

        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeCategory === 'all'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {t.faq?.all_categories || 'All'}
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {filteredFAQs.map(faq => {
            const isOpen = openId === faq.id;
            const question = language === 'ar' ? faq.question.ar : faq.question.en;
            const answer = language === 'ar' ? faq.answer.ar : faq.answer.en;

            return (
              <div
                key={faq.id}
                className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden transition-all hover:border-slate-200"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-start"
                >
                  <span className="font-bold text-sm sm:text-base text-slate-900 pe-4">
                    {question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: isOpen ? '500px' : '0px',
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="px-5 sm:px-6 pb-4 sm:pb-5">
                    <p className="text-slate-600 text-sm leading-relaxed font-medium">
                      {answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
