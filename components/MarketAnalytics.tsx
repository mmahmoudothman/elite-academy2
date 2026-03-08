
import React from 'react';
import { useLanguage } from './LanguageContext';

const MarketAnalytics: React.FC = () => {
  const { t } = useLanguage();

  const skills = [
    { name: t.analytics.skill1, value: 92, color: 'bg-indigo-600' },
    { name: t.analytics.skill2, value: 88, color: 'bg-teal-500' },
    { name: t.analytics.skill3, value: 75, color: 'bg-blue-500' },
    { name: t.analytics.skill4, value: 82, color: 'bg-indigo-400' },
  ];

  const handleDownload = () => {
    alert(t.analytics.download + '...');
  };

  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5">
            <h2 className="text-xs sm:text-sm font-black text-indigo-600 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-3 sm:mb-4">{t.analytics.stat4_label}</h2>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black font-heading leading-tight text-slate-900 mb-4 sm:mb-6">
              {t.analytics.title}
            </h3>
            <p className="text-base sm:text-lg text-slate-600 font-medium mb-8 sm:mb-10">
              {t.analytics.subtitle}
            </p>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {[
                { val: t.analytics.stat1_val, label: t.analytics.stat1_label },
                { val: t.analytics.stat2_val, label: t.analytics.stat2_label },
                { val: t.analytics.stat3_val, label: t.analytics.stat3_label },
                { val: t.analytics.stat4_val, label: t.analytics.stat4_label }
              ].map((stat, i) => (
                <div key={i} className="border-l-4 border-indigo-600 pl-4 sm:pl-6 rtl:border-l-0 rtl:border-r-4 rtl:pr-4 sm:rtl:pr-6">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-1">{stat.val}</div>
                  <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white p-5 sm:p-7 lg:p-10 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] shadow-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-6 sm:mb-8 lg:mb-10">
                <h4 className="font-black text-slate-900 text-sm sm:text-base">{t.analytics.chart_label}</h4>
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-100"></span>
                  <span className="w-3 h-3 rounded-full bg-indigo-200"></span>
                  <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
                </div>
              </div>

              <div className="space-y-8">
                {skills.map((skill, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm font-bold text-slate-700">
                      <span>{skill.name}</span>
                      <span>{skill.value}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${skill.color} rounded-full transition-all duration-1000`} 
                        style={{ width: `${skill.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 pt-8 border-t border-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.analytics.trend_label}</p>
                    <p className="text-sm font-black text-slate-900">{t.analytics.trend_val}</p>
                  </div>
                </div>
                <button 
                  onClick={handleDownload}
                  className="text-indigo-600 font-bold text-sm hover:underline"
                >
                  {t.analytics.download}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketAnalytics;
