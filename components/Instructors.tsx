
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from './LanguageContext';
import { Instructor } from '../types';
import MediaDisplay from './MediaDisplay';

interface InstructorsProps {
  instructors?: Instructor[];
}

const Instructors: React.FC<InstructorsProps> = ({ instructors }) => {
  const { language, t } = useLanguage();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [profileInstructor, setProfileInstructor] = useState<Instructor | null>(null);
  const instructorData = instructors ?? [];

  const closeVideo = () => setActiveVideo(null);

  const currentIndex = profileInstructor
    ? instructorData.findIndex(i => i.id === profileInstructor.id)
    : -1;

  const goToProfile = useCallback((index: number) => {
    if (index >= 0 && index < instructorData.length) {
      setProfileInstructor(instructorData[index]);
    }
  }, [instructorData]);

  useEffect(() => {
    if (!profileInstructor && !activeVideo) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeVideo) closeVideo();
        else setProfileInstructor(null);
      }
      if (profileInstructor && !activeVideo) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          goToProfile(Math.min(currentIndex + 1, instructorData.length - 1));
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          goToProfile(Math.max(currentIndex - 1, 0));
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [profileInstructor, activeVideo, currentIndex, instructorData.length, goToProfile]);

  useEffect(() => {
    if (profileInstructor || activeVideo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [profileInstructor, activeVideo]);

  const openProfile = (instructor: Instructor) => {
    setProfileInstructor(instructor);
  };

  return (
    <section id="instructors" className="py-16 sm:py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 lg:mb-24 max-w-3xl mx-auto space-y-4 sm:space-y-6">
          <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] sm:tracking-[0.4em]">{t.instructors.badge}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black font-heading leading-tight text-slate-900">
            {t.instructors.title}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-500 font-medium px-2">
            {t.instructors.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {instructorData.map((instructor) => (
            <div
              key={instructor.id}
              className="group flex flex-col h-full bg-slate-50 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] overflow-hidden border border-slate-100 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-100 hover:bg-white cursor-pointer"
              onClick={() => openProfile(instructor)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProfile(instructor); } }}
            >
              {/* Image area — aspect ratio scales proportionally with card width */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <MediaDisplay
                  src={instructor.image}
                  alt={instructor.name}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  fallbackIcon="user"
                  showPlayOverlay={false}
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/95 rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500 mb-2 sm:mb-3">
                    <svg className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-white text-[10px] sm:text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {t.instructors.view_profile}
                  </span>
                </div>
                {/* Video badge */}
                {instructor.videoUrl && (
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 rtl:right-auto rtl:left-3 sm:rtl:left-4 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1 sm:gap-1.5 shadow-lg">
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-700 uppercase tracking-wider">Video</span>
                  </div>
                )}
                {/* Specialization on hover */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1 sm:mb-2 block">{t.instructors.specialization}</span>
                  <p className="text-white font-bold text-sm sm:text-lg">{instructor.specialization}</p>
                </div>
              </div>

              <div className="p-5 sm:p-7 lg:p-10 flex flex-col flex-1">
                <div className="mb-4 sm:mb-6">
                  <h3 className={`text-lg sm:text-xl lg:text-2xl font-black font-heading mb-1 text-slate-900 group-hover:text-indigo-600 transition-colors ${language === 'ar' ? 'font-bold' : ''}`}>
                    {instructor.name}
                  </h3>
                  <p className="text-indigo-600 font-bold text-xs sm:text-sm uppercase tracking-widest">{instructor.role}</p>
                </div>

                <div className="space-y-4 sm:space-y-6 flex-1">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 sm:mb-3">{t.instructors.qualifications}</span>
                    <ul className="space-y-1.5 sm:space-y-2">
                      {instructor.qualifications.slice(0, 3).map((qual, idx) => (
                        <li key={idx} className="flex items-start gap-2 sm:gap-3 text-slate-600 text-xs sm:text-sm font-medium">
                          <div className="mt-1.5 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></div>
                          {qual}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed italic border-l-2 border-indigo-100 pl-3 sm:pl-4 rtl:border-l-0 rtl:border-r-2 rtl:pr-3 sm:rtl:pr-4 rtl:pl-0 line-clamp-2">
                    &ldquo;{instructor.bio}&rdquo;
                  </p>
                </div>

                <div className="mt-5 sm:mt-8 pt-5 sm:pt-8 border-t border-slate-100">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-tighter">{instructor.experience}</span>
                    <span className="text-indigo-600 font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 group-hover:gap-2 sm:group-hover:gap-3 transition-all whitespace-nowrap">
                      {t.instructors.view_profile}
                      <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1 ${language === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Board Profile Modal ===== */}
      {profileInstructor && (
        <div
          className="fixed inset-0 z-[120] overflow-y-auto"
          style={{ animation: 'modalFadeIn 0.3s ease-out' }}
          onClick={() => setProfileInstructor(null)}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" />

          {/* Scroll wrapper — uses min-h + flex for centering on large screens, scroll on small */}
          <div className="relative min-h-full flex items-start sm:items-center justify-center p-0 sm:p-4 lg:p-8">
            {/* Modal content */}
            <div
              className="relative bg-white w-full sm:max-w-2xl lg:max-w-3xl sm:rounded-2xl lg:rounded-[2rem] shadow-2xl sm:my-4 lg:my-8 overflow-hidden"
              style={{ animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Hero image header — taller on mobile to show faces, fixed on desktop */}
              <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-auto lg:h-80 bg-slate-900 overflow-hidden">
                <MediaDisplay
                  src={profileInstructor.image}
                  alt={profileInstructor.name}
                  className="w-full h-full object-cover object-top"
                  fallbackIcon="user"
                  showPlayOverlay={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-slate-900/10" />

                {/* Top bar: nav + close */}
                <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 lg:p-5 flex items-center justify-between z-10">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); goToProfile(currentIndex - 1); }}
                      disabled={currentIndex <= 0}
                      className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-white/15 hover:bg-white/25 disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-md rounded-full text-white transition-all"
                      aria-label="Previous instructor"
                    >
                      <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${language === 'ar' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-white/60 text-[10px] sm:text-xs font-bold tabular-nums">
                      {currentIndex + 1} / {instructorData.length}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); goToProfile(currentIndex + 1); }}
                      disabled={currentIndex >= instructorData.length - 1}
                      className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-white/15 hover:bg-white/25 disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-md rounded-full text-white transition-all"
                      aria-label="Next instructor"
                    >
                      <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${language === 'ar' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  <button
                    onClick={() => setProfileInstructor(null)}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-full text-white transition-all"
                    aria-label="Close"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Name + role */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
                  <div className="flex items-end justify-between gap-3 sm:gap-4">
                    <div className="min-w-0">
                      <p className="text-indigo-300 font-bold text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-1 sm:mb-2">{profileInstructor.role}</p>
                      <h3 className={`text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-white font-heading leading-tight truncate ${language === 'ar' ? 'font-bold' : ''}`}>
                        {profileInstructor.name}
                      </h3>
                    </div>
                    {/* Experience badge — hidden on small screens */}
                    <div className="hidden md:block bg-white/15 backdrop-blur-md rounded-xl lg:rounded-2xl px-3 py-2 sm:px-5 sm:py-3 flex-shrink-0">
                      <span className="text-white/60 text-[9px] sm:text-[10px] font-black uppercase tracking-widest block">{t.profile_modal.experience}</span>
                      <span className="text-white font-bold text-xs sm:text-sm">{profileInstructor.experience}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body content */}
              <div className="p-4 sm:p-6 lg:p-10 space-y-5 sm:space-y-6 lg:space-y-8">
                {/* Mobile experience badge */}
                <div className="md:hidden bg-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-slate-900 font-bold text-xs sm:text-sm">{profileInstructor.experience}</span>
                </div>

                {/* Specialization */}
                <div>
                  <span className="text-[9px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2 sm:mb-3">{t.profile_modal.specialization}</span>
                  <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl sm:rounded-2xl px-3 py-2 sm:px-5 sm:py-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="text-indigo-900 font-bold text-sm sm:text-base">{profileInstructor.specialization}</span>
                  </div>
                </div>

                {/* Qualifications */}
                <div>
                  <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 sm:mb-4">{t.profile_modal.qualifications}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {profileInstructor.qualifications.map((qual, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 sm:gap-3 bg-slate-50 rounded-lg sm:rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 border border-slate-100">
                        <div className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-md sm:rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-slate-700">{qual}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 sm:mb-3">{t.profile_modal.bio}</span>
                  <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-100">
                    <div className="flex gap-2 sm:gap-3">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-200 flex-shrink-0 -mt-0.5 sm:-mt-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      <p className="text-slate-600 leading-relaxed font-medium text-sm sm:text-base lg:text-lg">
                        {profileInstructor.bio}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                  {profileInstructor.videoUrl && (
                    <button
                      onClick={() => {
                        setProfileInstructor(null);
                        setTimeout(() => setActiveVideo(profileInstructor.videoUrl!), 150);
                      }}
                      className="flex-1 py-3 sm:py-4 bg-slate-900 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 sm:gap-3 active:scale-[0.98]"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      {t.instructors.watch_bio}
                    </button>
                  )}
                  <button
                    onClick={() => setProfileInstructor(null)}
                    className={`py-3 sm:py-4 border-2 border-slate-200 text-slate-600 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] ${profileInstructor.videoUrl ? 'sm:w-36 lg:w-40' : 'w-full'}`}
                  >
                    {t.profile_modal.close}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Video Modal ===== */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center p-2 sm:p-4 lg:p-24"
          style={{ animation: 'modalFadeIn 0.3s ease-out' }}
        >
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={closeVideo} />
          <div
            className="relative w-full max-w-5xl aspect-video bg-black rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl"
            style={{ animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <button
              onClick={closeVideo}
              className="absolute top-3 right-3 sm:top-6 sm:right-6 z-10 w-9 h-9 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all"
            >
              <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <MediaDisplay
              src={activeVideo}
              alt="Instructor video"
              className="w-full h-full object-contain"
              thumbnail={false}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Instructors;
