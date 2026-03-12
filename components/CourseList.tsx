
import React, { useState, useMemo } from 'react';
import { Course } from '../types';
import { useLanguage } from './LanguageContext';
import MediaDisplay from './MediaDisplay';
import { useAnalyticsTracker } from '../hooks/useAnalyticsTracker';
import { CourseCardSkeleton } from './ui/Skeleton';

interface CourseListProps {
  courses?: Course[];
  onEnroll?: (course: Course) => void;
  loading?: boolean;
}

const CourseList: React.FC<CourseListProps> = ({ courses, onEnroll, loading }) => {
  const { t, language } = useLanguage();
  const { track } = useAnalyticsTracker();
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const courseData = courses ?? [];

  const dynamicCategories = useMemo(() => {
    const cats = new Set(courseData.map(c => c.category));
    return ['All', ...Array.from(cats).sort()];
  }, [courseData]);

  const filteredCourses = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return courseData.filter(course => {
      const matchesCategory = activeCategory === 'All' || course.category === activeCategory;
      const matchesSearch = !q || course.title.toLowerCase().includes(q) || (course.description || '').toLowerCase().includes(q) || course.instructor.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, courseData, searchQuery]);

  const handleEnrollClick = (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();
    track('cta_click', { entityType: 'course', entityId: course.id, metadata: { action: 'enroll', courseTitle: course.title } });
    if (onEnroll) onEnroll(course);
  };

  const handleCourseView = (course: Course) => {
    track('course_view', { entityType: 'course', entityId: course.id, metadata: { courseTitle: course.title } });
    setSelectedCourse(course);
  };

  return (
    <section id="courses" className="py-16 sm:py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-teal-600 font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs mb-3 sm:mb-4">{t.courses.badge}</h2>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black font-heading text-slate-900">{t.courses.title}</h3>
        </div>

        <div className="flex justify-center mb-6 px-4">
          <div className="relative w-full max-w-md">
            <svg className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.courses?.search_programs || (language === 'ar' ? 'ابحث عن البرامج...' : 'Search programs...')}
              className="w-full ps-11 pe-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12 px-2">
          {dynamicCategories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm transition-all border ${
                activeCategory === category
                  ? 'bg-teal-600 border-teal-600 text-white shadow-lg'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-teal-600'
              }`}
            >
              {category === 'All' ? (t.courses?.all_category || (language === 'ar' ? 'الكل' : 'All')) : category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)
          ) : filteredCourses.map(course => {
            return (
              <div
                key={course.id}
                onClick={() => handleCourseView(course)}
                className="group card-innovative rounded-xl sm:rounded-2xl lg:rounded-[2rem] overflow-hidden flex flex-col cursor-pointer"
              >
                <div className="aspect-[16/9] overflow-hidden relative">
                  <MediaDisplay
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    fallbackIcon="image"
                    showPlayOverlay={false}
                  />
                  <div className="absolute top-3 start-3 sm:top-4 sm:start-4">
                    <span className="bg-white/90 backdrop-blur-sm text-teal-600 text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 sm:px-3 rounded-lg shadow-sm">
                      {course.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 lg:p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-1 mb-3 sm:mb-4 text-orange-500">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">{course.rating}</span>
                  </div>

                  <h4 className="text-base sm:text-lg lg:text-xl font-black font-heading mb-2 sm:mb-3 text-slate-900 group-hover:text-teal-600 transition-colors leading-snug">
                    {course.title}
                  </h4>

                  <p className="text-slate-500 text-xs sm:text-sm mb-5 sm:mb-8 flex-1 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-slate-50 gap-3">
                    <div className="flex flex-col min-w-0">
                      <span className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 truncate">{course.price} <span className="text-[10px] sm:text-xs text-teal-600 font-bold">{course.currency}</span></span>
                    </div>
                    <button
                      onClick={(e) => handleEnrollClick(e, course)}
                      disabled={course.capacity > 0 && course.enrolled >= course.capacity}
                      className={`px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-3.5 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs transition-all shadow-lg shadow-slate-100 flex-shrink-0 ${course.capacity > 0 && course.enrolled >= course.capacity ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-teal-600 active:scale-95'}`}
                    >
                      {course.capacity > 0 && course.enrolled >= course.capacity ? (t.enrollment?.full_short || 'Full') : t.courses.enroll}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div
          className="fixed inset-0 z-[160] overflow-y-auto"
          style={{ animation: 'modalFadeIn 0.3s ease-out' }}
          onClick={() => setSelectedCourse(null)}
        >
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative min-h-full flex items-start sm:items-center justify-center p-0 sm:p-4">
            <div
              className="relative bg-white w-full sm:max-w-xl lg:max-w-2xl sm:rounded-2xl lg:rounded-[2.5rem] shadow-2xl p-5 sm:p-8 lg:p-12 sm:my-4 lg:my-8"
              style={{ animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-4 end-4 sm:top-6 sm:end-6 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all z-10"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="space-y-5 sm:space-y-6 lg:space-y-8">
                <div className="space-y-3 sm:space-y-4 pe-8">
                  <span className="bg-teal-50 text-teal-600 text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 sm:px-3 py-1 rounded-lg inline-block">
                    {selectedCourse.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black font-heading text-slate-900 leading-tight">
                    {selectedCourse.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      {selectedCourse.rating}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>{selectedCourse.duration}</span>
                    <span className="text-slate-300">•</span>
                    <span>{selectedCourse.level}</span>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-teal-600">{t.courses.details}</h4>
                  <p className="text-slate-600 leading-relaxed font-medium text-sm sm:text-base lg:text-lg">
                    {selectedCourse.description}
                  </p>
                </div>

                {selectedCourse.prerequisites && selectedCourse.prerequisites.length > 0 && (
                  <div className="pt-4 sm:pt-6 border-t border-slate-100">
                    <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 mb-3 sm:mb-4">{t.courses.prerequisites}</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {selectedCourse.prerequisites.map((pre, i) => (
                        <li key={i} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-slate-700 bg-slate-50 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                          {pre}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={(e) => {
                    const c = selectedCourse;
                    setSelectedCourse(null);
                    if (c) handleEnrollClick(e, c);
                  }}
                  className="w-full btn-action py-3.5 sm:py-4 lg:py-5 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base lg:text-xl active:scale-95 shadow-2xl"
                >
                  {t.courses.enroll} — {selectedCourse.price} {selectedCourse.currency}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CourseList;
