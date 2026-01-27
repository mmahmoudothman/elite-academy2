
import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

interface NavbarProps {
  onApplyClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onApplyClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      const sections = ['home', 'insights', 'instructors', 'courses', 'enterprise'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'py-4 glass-light shadow-sm' : 'py-6 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-100">
              <span className="text-white font-bold text-xl font-heading">E</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black font-heading tracking-tight text-slate-900 leading-none">
                {language === 'ar' ? 'أكاديمية النخبة' : 'ELITE ACADEMY'}
              </span>
              <span className="text-[9px] font-bold text-teal-600 tracking-[0.2em] uppercase">
                {language === 'ar' ? 'التعلم المبتكر' : 'Innovative Learning'}
              </span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center space-x-10 rtl:space-x-reverse">
            <div className="flex items-center space-x-10 rtl:space-x-reverse">
              <a 
                href="#courses" 
                onClick={(e) => handleNavClick(e, 'courses')}
                className={`font-bold text-sm transition-colors ${activeSection === 'courses' ? 'text-teal-600 underline underline-offset-8 decoration-2' : 'text-slate-600 hover:text-teal-600'}`}
              >
                {t.nav.programs}
              </a>
              <a 
                href="#insights" 
                onClick={(e) => handleNavClick(e, 'insights')}
                className={`font-bold text-sm transition-colors ${activeSection === 'insights' ? 'text-teal-600 underline underline-offset-8 decoration-2' : 'text-slate-600 hover:text-teal-600'}`}
              >
                {t.nav.curriculum}
              </a>
              <a 
                href="#enterprise" 
                onClick={(e) => handleNavClick(e, 'enterprise')}
                className={`font-bold text-sm transition-colors ${activeSection === 'enterprise' ? 'text-teal-600 underline underline-offset-8 decoration-2' : 'text-slate-600 hover:text-teal-600'}`}
              >
                {t.nav.enterprise}
              </a>
            </div>
            
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="text-xs font-black text-slate-400 hover:text-teal-600 transition-colors"
              >
                {language === 'en' ? 'AR' : 'EN'}
              </button>
              <button 
                onClick={onApplyClick}
                className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-teal-700 transition-all shadow-xl shadow-teal-100 active:scale-95"
              >
                {t.nav.apply}
              </button>
            </div>
          </div>

          <div className="lg:hidden flex items-center gap-4">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-900 p-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-2xl p-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col space-y-4">
            <a href="#courses" onClick={(e) => handleNavClick(e, 'courses')} className="text-slate-900 font-bold text-lg">{t.nav.programs}</a>
            <a href="#insights" onClick={(e) => handleNavClick(e, 'insights')} className="text-slate-900 font-bold text-lg">{t.nav.curriculum}</a>
            <a href="#enterprise" onClick={(e) => handleNavClick(e, 'enterprise')} className="text-slate-900 font-bold text-lg">{t.nav.enterprise}</a>
            <button 
              onClick={() => {
                setIsOpen(false);
                onApplyClick();
              }} 
              className="bg-teal-600 text-white w-full py-4 rounded-xl font-bold"
            >
              {t.nav.apply}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
