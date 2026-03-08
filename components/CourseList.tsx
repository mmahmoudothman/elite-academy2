
import React, { useState, useMemo } from 'react';
import { COURSES, CATEGORIES } from '../constants';
import { Course } from '../types';
import { useLanguage } from './LanguageContext';
import MediaDisplay from './MediaDisplay';

interface CourseListProps {
  courses?: Course[];
  onEnroll?: () => void;
}

const CourseList: React.FC<CourseListProps> = ({ courses, onEnroll }) => {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const courseData = courses ?? COURSES;

  const filteredCourses = useMemo(() => {
    return courseData.filter(course => {
      const matchesCategory = activeCategory === 'All' || course.category === activeCategory;
      return matchesCategory;
    });
  }, [activeCategory, courseData]);

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEnroll) onEnroll();
  };

  return (
    <section id="courses" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-teal-600 font-black uppercase tracking-[0.3em] text-xs mb-4">{t.courses.badge}</h2>
          <h3 className="text-4xl lg:text-5xl font-black font-heading text-slate-900">{t.courses.title}</h3>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all border ${
                activeCategory === category 
                  ? 'bg-teal-600 border-teal-600 text-white shadow-lg' 
                  : 'bg-white border-slate-200 text-slate-500 hover:border-teal-600'
              }`}
            >
              {category === 'All' ? (language === 'ar' ? 'الكل' : 'All') : category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => {
            return (
              <div 
                key={course.id} 
                onClick={() => setSelectedCourse(course)}
                className="group card-innovative rounded-[2rem] overflow-hidden flex flex-col cursor-pointer"
              >
                <div className="h-56 overflow-hidden relative">
                  <MediaDisplay
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    fallbackIcon="image"
                    showPlayOverlay={false}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-teal-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm">
                      {course.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-1 mb-4 text-orange-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <span className="text-sm font-bold text-slate-900">{course.rating}</span>
                  </div>
                  
                  <h4 className="text-xl font-black font-heading mb-3 text-slate-900 group-hover:text-teal-600 transition-colors leading-snug">
                    {course.title}
                  </h4>
                  
                  <p className="text-slate-500 text-sm mb-8 flex-1 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-slate-900">{course.price} <span className="text-xs text-teal-600 font-bold">{course.currency}</span></span>
                    </div>
                    <button 
                      onClick={handleEnrollClick}
                      className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-black text-xs hover:bg-teal-600 transition-all active:scale-95 shadow-lg shadow-slate-100"
                    >
                      {t.courses.enroll}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Course Detail Modal - Clean "Show" View */}
      {selectedCourse && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
          <div 
            className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 lg:p-12 my-8 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedCourse(null)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-8">
              <div className="space-y-4">
                <span className="bg-teal-50 text-teal-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg inline-block">
                  {selectedCourse.category}
                </span>
                <h3 className="text-3xl lg:text-4xl font-black font-heading text-slate-900 leading-tight">
                  {selectedCourse.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    {selectedCourse.rating}
                  </span>
                  <span>•</span>
                  <span>{selectedCourse.duration}</span>
                  <span>•</span>
                  <span>{selectedCourse.level}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-teal-600">{t.courses.details}</h4>
                <p className="text-slate-600 leading-relaxed font-medium text-lg">
                  {selectedCourse.description}
                </p>
              </div>

              {selectedCourse.prerequisites && selectedCourse.prerequisites.length > 0 && (
                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">{t.courses.prerequisites}</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedCourse.prerequisites.map((pre, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        {pre}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button 
                onClick={(e) => {
                  setSelectedCourse(null);
                  handleEnrollClick(e);
                }}
                className="w-full btn-action py-5 rounded-2xl font-black text-xl active:scale-95 shadow-2xl"
              >
                {t.courses.enroll} — {selectedCourse.price} {selectedCourse.currency}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CourseList;
