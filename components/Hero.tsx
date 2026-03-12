
import React from 'react';
import { useLanguage } from './LanguageContext';
import { useSiteConfig } from '../hooks/useSiteConfig';

interface HeroProps {
  onApplyClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onApplyClick }) => {
  const { t, language } = useLanguage();
  const { config } = useSiteConfig();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative pt-24 sm:pt-32 lg:pt-48 pb-12 sm:pb-20 overflow-hidden">
      <div className="hero-shape hidden lg:block"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-16 items-center">
          <div className="space-y-6 sm:space-y-10 text-center lg:text-start">
            <div className="inline-flex items-center gap-2 bg-[#0da993]/10 border border-[#0da993]/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#0da993] animate-pulse"></span>
              <span className="text-[#0da993] font-bold text-[10px] sm:text-xs uppercase tracking-widest">{t.hero.badge}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black font-heading leading-tight text-[#0d1b2a]">
              {language === 'ar' && config.heroTitle?.ar ? config.heroTitle.ar : (
                <>{t.hero.title_part1} <br />
                <span className="text-[#0da993]">{t.hero.title_part2}</span> <br />
                {t.hero.title_part3}</>
              )}
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              {language === 'ar' && config.heroSubtitle?.ar ? config.heroSubtitle.ar : (config.heroSubtitle?.en || t.hero.desc)}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 pt-2 sm:pt-4 justify-center lg:justify-start">
              <button
                onClick={onApplyClick}
                className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 btn-action rounded-xl sm:rounded-2xl font-black text-base sm:text-lg active:scale-95"
              >
                {t.hero.begin}
              </button>
              <button
                onClick={() => scrollToSection('courses')}
                className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-[#e8e4d8]/60 text-[#0d1b2a] border-2 border-[#e8e4d8] rounded-xl sm:rounded-2xl font-black hover:border-[#0da993] hover:text-[#0da993] transition-all text-base sm:text-lg active:scale-95"
              >
                {t.hero.cta_primary}
              </button>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl rotate-2">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071" 
                alt="Executive Learning" 
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b2a]/40 to-transparent"></div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#3d66f1] rounded-3xl -z-10 rotate-12"></div>
            <div className="absolute -top-10 -right-10 w-64 h-64 border-[20px] border-[#0da993]/10 rounded-full -z-10"></div>
          </div>
        </div>

        <div className="pt-16 sm:pt-24 lg:pt-32">
          <div className="flex flex-col items-center">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 sm:mb-12">{t.hero.partners}</p>
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 lg:gap-24 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
              {(config.partners || []).map((partner) => (
                <div key={partner.name} className="h-10 flex items-center justify-center">
                   <img 
                    src={partner.logo} 
                    alt={partner.name} 
                    className="max-h-full w-auto object-contain brightness-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const span = document.createElement('span');
                        span.className = "text-sm font-black text-slate-900 uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-lg";
                        span.innerText = partner.name;
                        parent.appendChild(span);
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
