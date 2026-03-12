import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useSiteConfig } from '../hooks/useSiteConfig';

interface NavbarProps {
  onApplyClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onApplyClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, user, userRole, logout } = useAuth();
  const { config } = useSiteConfig();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    if (!isLanding) return;
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
  }, [isLanding]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  const navLinkClass = (section: string) =>
    `font-bold text-sm transition-colors ${activeSection === section ? 'text-[#0da993] underline underline-offset-8 decoration-2' : 'text-slate-600 hover:text-[#0da993]'}`;

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'py-4 glass-light shadow-sm' : 'py-6 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0da993] rounded-xl flex items-center justify-center shadow-lg shadow-[#0da993]/20">
              <span className="text-white font-bold text-xl font-heading">E</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black font-heading tracking-tight text-slate-900 leading-none">
                {language === 'ar' ? 'أكاديمية النخبة' : 'ELITE ACADEMY'}
              </span>
              <span className="text-[9px] font-bold text-[#0da993] tracking-[0.2em] uppercase">
                {language === 'ar' ? (config.companyTagline?.ar || 'التعلم المبتكر') : (config.companyTagline?.en || 'Innovative Learning')}
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-10 rtl:space-x-reverse">
            {isLanding && (
              <div className="flex items-center space-x-10 rtl:space-x-reverse">
                <a href="#courses" onClick={(e) => handleNavClick(e, 'courses')} className={navLinkClass('courses')}>{t.nav.programs}</a>
                <a href="#insights" onClick={(e) => handleNavClick(e, 'insights')} className={navLinkClass('insights')}>{t.nav.curriculum}</a>
                <a href="#enterprise" onClick={(e) => handleNavClick(e, 'enterprise')} className={navLinkClass('enterprise')}>{t.nav.enterprise}</a>
              </div>
            )}

            <div className="flex items-center gap-4">
              <Link to="/contact" className="font-bold text-sm text-slate-600 hover:text-[#0da993] transition-colors">
                {t.contact?.nav_link || 'Contact'}
              </Link>

              <button onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} className="text-xs font-black text-slate-400 hover:text-[#0da993] transition-colors">
                {language === 'en' ? 'AR' : 'EN'}
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  {(userRole === 'super_admin' || userRole === 'admin') && (
                    <Link to="/dashboard" className="text-sm font-bold text-[#0da993] hover:text-[#0da993] transition-colors">
                      {t.dashboard?.nav_link || 'Dashboard'}
                    </Link>
                  )}
                  <Link to="/profile" className="text-sm font-bold text-slate-600 hover:text-[#0da993] transition-colors">
                    {t.profile_modal?.title || 'Profile'}
                  </Link>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#0da993]/10 rounded-full flex items-center justify-center text-[#0da993] font-bold text-xs">
                      {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <button onClick={logout} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">
                      {t.dashboard?.logout || 'Logout'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-[#0da993] transition-colors">
                    {t.auth?.login_button || 'Sign In'}
                  </Link>
                  {onApplyClick && (
                    <button onClick={onApplyClick} className="bg-[#0da993] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[#0da993]/90 transition-all shadow-xl shadow-[#0da993]/20 active:scale-95">
                      {t.nav.apply}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile */}
          <div className="lg:hidden flex items-center gap-3">
            <button onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} className="text-xs font-black text-slate-400 hover:text-[#0da993] transition-colors px-2 py-1">
              {language === 'en' ? 'AR' : 'EN'}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-900 p-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden absolute top-full inset-x-0 w-full bg-white shadow-2xl p-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 max-h-[calc(100vh-80px)] overflow-y-auto">
          <div className="flex flex-col space-y-4">
            {isLanding && (
              <>
                <a href="#courses" onClick={(e) => handleNavClick(e, 'courses')} className="text-slate-900 font-bold text-lg">{t.nav.programs}</a>
                <a href="#insights" onClick={(e) => handleNavClick(e, 'insights')} className="text-slate-900 font-bold text-lg">{t.nav.curriculum}</a>
                <a href="#enterprise" onClick={(e) => handleNavClick(e, 'enterprise')} className="text-slate-900 font-bold text-lg">{t.nav.enterprise}</a>
              </>
            )}
            <Link to="/contact" onClick={() => setIsOpen(false)} className="text-slate-900 font-bold text-lg">{t.contact?.nav_link || 'Contact Us'}</Link>

            {isAuthenticated ? (
              <>
                {(userRole === 'super_admin' || userRole === 'admin') && (
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-[#0da993] font-bold text-lg">{t.dashboard?.nav_link || 'Dashboard'}</Link>
                )}
                <Link to="/profile" onClick={() => setIsOpen(false)} className="text-[#0da993] font-bold text-lg">{t.profile_modal?.title || 'Profile'}</Link>
                <button onClick={() => { setIsOpen(false); logout(); }} className="text-red-500 font-bold text-lg text-start">{t.dashboard?.logout || 'Logout'}</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="text-[#0da993] font-bold text-lg">{t.auth?.login_button || 'Sign In'}</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="text-[#0da993] font-bold text-lg">{t.auth?.register_button || 'Register'}</Link>
              </>
            )}

            {onApplyClick && (
              <button onClick={() => { setIsOpen(false); onApplyClick(); }} className="bg-[#0da993] text-white w-full py-4 rounded-xl font-bold">{t.nav.apply}</button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
