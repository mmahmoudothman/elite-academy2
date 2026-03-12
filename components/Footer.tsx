
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { useAnalyticsTracker } from '../hooks/useAnalyticsTracker';

const Footer: React.FC = () => {
  const { language, t } = useLanguage();
  const { config } = useSiteConfig();
  const { track } = useAnalyticsTracker();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const normalizedEmail = email.trim().toLowerCase();

    // TODO: Save newsletter subscription to Firestore via useDataManager
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 5000);
    setEmail('');
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0d1b2a] text-white pt-12 sm:pt-16 lg:pt-24 pb-8 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-10 sm:mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#0da993] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg font-heading">E</span>
              </div>
              <span className="text-xl font-black font-heading tracking-tight uppercase">
                {language === 'ar' ? config.companyName.ar : config.companyName.en}
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              {language === 'ar' ? config.footerText.ar : config.footerText.en}
            </p>
            {/* Social Icons */}
            <div className="flex gap-3">
              {config.socialLinks.whatsapp && (
                <a href={config.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" onClick={() => track('social_click', { metadata: { platform: 'whatsapp' } })} className="w-9 h-9 bg-[#1a2744] rounded-lg flex items-center justify-center text-slate-400 hover:text-green-400 hover:bg-[#1a2744]/80 transition-all" title="WhatsApp">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                </a>
              )}
              {config.socialLinks.instagram && (
                <a href={config.socialLinks.instagram} target="_blank" rel="noopener noreferrer" onClick={() => track('social_click', { metadata: { platform: 'instagram' } })} className="w-9 h-9 bg-[#1a2744] rounded-lg flex items-center justify-center text-slate-400 hover:text-pink-400 hover:bg-[#1a2744]/80 transition-all" title="Instagram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                </a>
              )}
              {config.socialLinks.linkedin && (
                <a href={config.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" onClick={() => track('social_click', { metadata: { platform: 'linkedin' } })} className="w-9 h-9 bg-[#1a2744] rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-[#1a2744]/80 transition-all" title="LinkedIn">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
              )}
              {config.socialLinks.twitter && (
                <a href={config.socialLinks.twitter} target="_blank" rel="noopener noreferrer" onClick={() => track('social_click', { metadata: { platform: 'twitter' } })} className="w-9 h-9 bg-[#1a2744] rounded-lg flex items-center justify-center text-slate-400 hover:text-sky-400 hover:bg-[#1a2744]/80 transition-all" title="Twitter">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-[#0da993]">{t.footer?.navigation || (language === 'ar' ? 'التنقل' : 'Navigation')}</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#courses" className="hover:text-[#0da993] transition-colors">{t.footer?.strategic_programs || t.nav.programs}</a></li>
              <li><Link to="/contact" className="hover:text-[#0da993] transition-colors">{t.footer?.contact_us || t.contact?.nav_link || 'Contact Us'}</Link></li>
              <li><Link to="/login" className="hover:text-[#0da993] transition-colors">{t.footer?.sign_in || t.auth?.login_button || 'Sign In'}</Link></li>
              <li><Link to="/register" className="hover:text-[#0da993] transition-colors">{t.footer?.register || t.auth?.register_button || 'Register'}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-[#0da993]">{t.footer?.contact_heading || (language === 'ar' ? 'تواصل معنا' : 'Contact')}</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              {config.addresses.map((addr, i) => (
                <li key={i}>{addr.value}</li>
              ))}
              <li>
                <a href={`mailto:${config.contactEmail}`} className="hover:text-[#0da993] transition-colors">{config.contactEmail}</a>
              </li>
              <li>
                <a href={`tel:${config.contactPhone}`} className="hover:text-[#0da993] transition-colors">{config.contactPhone}</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-[#0da993]">{t.footer?.stay_updated || (language === 'ar' ? 'ابق على اطلاع' : 'Stay Updated')}</h4>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder={t.footer?.email_placeholder || (language === 'ar' ? 'البريد الإلكتروني' : 'Email Address')}
                className="bg-[#1a2744] border-none rounded-xl px-4 py-3 w-full text-sm outline-none focus:ring-2 focus:ring-[#0da993]"
              />
              <button type="submit" className="brand-gradient px-4 py-3 rounded-xl hover:opacity-90 transition-all active:scale-95 flex-shrink-0">
                <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </form>
            {subscribed && (
              <p className="text-xs text-[#0da993] font-bold mt-2">{t.footer?.subscribed_success || (language === 'ar' ? 'تم الاشتراك بنجاح!' : 'Subscribed successfully!')}</p>
            )}
            {alreadySubscribed && (
              <p className="text-xs text-amber-400 font-bold mt-2">{t.footer?.already_subscribed || (language === 'ar' ? 'هذا البريد مسجل بالفعل' : 'This email is already subscribed.')}</p>
            )}

            {/* WhatsApp CTA */}
            {config.socialLinks.whatsapp && (
              <a href={config.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center gap-2 bg-green-600/20 text-green-400 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-green-600/30 transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /></svg>
                {t.footer?.chat_whatsapp || (language === 'ar' ? 'تحدث معنا عبر واتساب' : 'Chat on WhatsApp')}
              </a>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-[#1a2744] flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
          <p>&copy; {currentYear} {language === 'ar' ? config.companyName.ar : config.companyName.en}. {t.footer?.all_rights_reserved || (language === 'ar' ? 'جميع الحقوق محفوظة' : 'ALL RIGHTS RESERVED')}.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">{t.footer?.privacy || (language === 'ar' ? 'الخصوصية' : 'Privacy')}</a>
            <a href="#" className="hover:text-white transition-colors">{t.footer?.terms || (language === 'ar' ? 'الشروط' : 'Terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
