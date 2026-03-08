import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CourseList from '../components/CourseList';
import AIAssistant from '../components/AIAssistant';
import Footer from '../components/Footer';
import MarketAnalytics from '../components/MarketAnalytics';
import Instructors from '../components/Instructors';
import RegistrationForm from '../components/RegistrationForm';
import { useLanguage } from '../components/LanguageContext';
import { useDataManager } from '../hooks/useDataManager';

const LandingPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [isRegOpen, setIsRegOpen] = useState(false);
  const { courses, instructors } = useDataManager();

  const handleApplyClick = () => {
    setIsRegOpen(true);
  };

  const handleProspectusClick = () => {
    alert(language === 'ar' ? 'سيتم إرسال النشرة التعريفية إلى بريدك الإلكتروني.' : 'The prospectus will be sent to your email address.');
  };

  return (
    <div className="min-h-screen bg-white transition-all duration-500">
      <Navbar onApplyClick={handleApplyClick} />
      <main>
        <section id="home">
          <Hero onApplyClick={handleApplyClick} />
        </section>

        <section id="insights">
          <MarketAnalytics />
        </section>

        <section id="instructors">
          <Instructors instructors={instructors} />
        </section>

        <section id="advantage" className="py-32 bg-white relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-5 space-y-8">
                <h2 className="text-sm font-black text-teal-600 uppercase tracking-[0.3em]">{t.advantage.badge}</h2>
                <h3 className="text-5xl lg:text-6xl font-black font-heading leading-tight text-slate-900">
                  {t.advantage.title1} <br />
                  <span className="text-slate-400">{t.advantage.title2}</span>
                </h3>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                  {t.advantage.desc}
                </p>

                <div className="space-y-4 pt-4">
                  {[
                    {
                      title: t.advantage.item1_title,
                      desc: t.advantage.item1_desc,
                      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    },
                    {
                      title: t.advantage.item2_title,
                      desc: t.advantage.item2_desc,
                      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                    },
                    {
                      title: t.advantage.item3_title,
                      desc: t.advantage.item3_desc,
                      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                    }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-start p-6 rounded-3xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100 group">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-teal-600 shadow-sm border border-slate-200 group-hover:bg-teal-600 group-hover:text-white transition-all">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 mb-1">{item.title}</h4>
                        <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-2 gap-6 relative">
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-teal-50 rounded-full blur-[120px] opacity-40"></div>
                <div className="space-y-6 pt-12">
                  <div className="rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-2xl float">
                    <img src="https://images.unsplash.com/photo-1573496130141-20972021042f?q=80&w=2069" alt="Executive" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
                    <h5 className="text-4xl font-black mb-1">{t.analytics.stat1_val}</h5>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.advantage.promo_rate}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-teal-600 p-8 rounded-[2.5rem] text-white">
                    <h5 className="text-4xl font-black mb-1">{t.analytics.stat2_val}</h5>
                    <p className="text-xs font-bold text-teal-100 uppercase tracking-widest">{t.advantage.alumni}</p>
                  </div>
                  <div className="rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070" alt="Learning" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <CourseList courses={courses} onEnroll={handleApplyClick} />

        <section id="enterprise" className="py-40 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto space-y-10">
              <h2 className="text-sm font-black text-teal-600 uppercase tracking-[0.4em]">{t.enterprise.badge}</h2>
              <h3 className="text-6xl lg:text-7xl font-black font-heading leading-none text-slate-900">
                {t.enterprise.title}
              </h3>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                {t.enterprise.desc}
              </p>
              <div className="pt-10 flex flex-wrap justify-center gap-10">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl mb-4 flex items-center justify-center border border-slate-100 shadow-sm transition-all hover:scale-110 hover:shadow-lg">
                    <svg className="w-10 h-10 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-900">{t.enterprise.lms}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl mb-4 flex items-center justify-center border border-slate-100 shadow-sm transition-all hover:scale-110 hover:shadow-lg">
                    <svg className="w-10 h-10 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-900">{t.enterprise.insights}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl mb-4 flex items-center justify-center border border-slate-100 shadow-sm transition-all hover:scale-110 hover:shadow-lg">
                    <svg className="w-10 h-10 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04c0 4.835 1.39 9.14 3.846 12.714a11.952 11.952 0 0013.39 0c2.456-3.574 3.846-7.88 3.846-12.714z" /></svg>
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-900">{t.enterprise.skills}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="apply" className="py-20 px-6">
          <div className="max-w-7xl mx-auto innovative-gradient rounded-[4rem] p-12 lg:p-24 relative overflow-hidden text-center lg:text-left rtl:text-right">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-2/3 space-y-8">
                <h4 className="text-6xl lg:text-8xl font-black font-heading text-white leading-none">{t.apply_section.title}</h4>
                <p className="text-xl text-teal-50 font-medium max-w-xl">
                  {t.apply_section.desc}
                </p>
              </div>
              <div className="lg:w-1/3 w-full flex flex-col gap-4">
                <button
                  onClick={handleApplyClick}
                  className="bg-white text-slate-900 px-10 py-6 rounded-[2rem] font-black text-xl hover:bg-slate-100 transition-all shadow-2xl active:scale-95"
                >
                  {t.apply_section.cta_primary}
                </button>
                <button
                  onClick={handleProspectusClick}
                  className="bg-slate-900/40 backdrop-blur-md text-white border-2 border-white/20 px-10 py-6 rounded-[2rem] font-black text-xl hover:bg-white/10 transition-all active:scale-95"
                >
                  {t.apply_section.cta_secondary}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <AIAssistant />
      <RegistrationForm isOpen={isRegOpen} onClose={() => setIsRegOpen(false)} />
    </div>
  );
};

export default LandingPage;
