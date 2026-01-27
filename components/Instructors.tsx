
import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { INSTRUCTORS } from '../constants';

const Instructors: React.FC = () => {
  const { language, t } = useLanguage();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const closeVideo = () => setActiveVideo(null);

  const viewBoardProfile = (name: string) => {
    alert(language === 'ar' ? `جاري تحميل ملف السيرة الذاتية لـ ${name}...` : `Loading extended academic profile for ${name}...`);
  };

  return (
    <section id="instructors" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-24 max-w-3xl mx-auto space-y-6">
          <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.4em]">{t.instructors.badge}</span>
          <h2 className="text-5xl lg:text-6xl font-black font-heading leading-tight text-slate-900">
            {t.instructors.title}
          </h2>
          <p className="text-xl text-slate-500 font-medium">
            {t.instructors.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {INSTRUCTORS.map((instructor) => (
            <div key={instructor.id} className="group flex flex-col h-full bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-100 hover:bg-white">
              <div className="relative h-96 overflow-hidden cursor-pointer" onClick={() => instructor.videoUrl && setActiveVideo(instructor.videoUrl)}>
                <img 
                  src={instructor.image} 
                  alt={instructor.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                   <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                      <svg className="w-8 h-8 text-indigo-600 ml-1 rtl:mr-1 rtl:ml-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                   </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2 block">Specialization</span>
                  <p className="text-white font-bold text-lg">{instructor.specialization}</p>
                </div>
              </div>

              <div className="p-10 flex flex-col flex-1">
                <div className="mb-6">
                  <h3 className={`text-2xl font-black font-heading mb-1 text-slate-900 ${language === 'ar' ? 'font-bold' : ''}`}>
                    {instructor.name}
                  </h3>
                  <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest">{instructor.role}</p>
                </div>

                <div className="space-y-6 flex-1">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">{t.instructors.qualifications}</span>
                    <ul className="space-y-2">
                      {instructor.qualifications.map((qual, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-600 text-sm font-medium">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></div>
                          {qual}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-slate-500 text-sm leading-relaxed italic border-l-2 border-indigo-100 pl-4 rtl:border-l-0 rtl:border-r-2 rtl:pr-4">
                    "{instructor.bio}"
                  </p>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">{instructor.experience}</span>
                    <button 
                      onClick={() => viewBoardProfile(instructor.name)}
                      className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-2"
                    >
                      {t.instructors.view_profile}
                      <svg className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                  {instructor.videoUrl && (
                    <button 
                      onClick={() => setActiveVideo(instructor.videoUrl!)}
                      className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      {t.instructors.watch_bio}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 lg:p-24 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
            <button 
              onClick={closeVideo}
              className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <video 
              autoPlay 
              controls 
              className="w-full h-full object-contain"
              src={activeVideo}
            />
          </div>
          <div className="absolute inset-0 -z-10" onClick={closeVideo}></div>
        </div>
      )}
    </section>
  );
};

export default Instructors;
