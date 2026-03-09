import React from 'react';
import { useLanguage } from './LanguageContext';
import { Testimonial } from '../types';

const Testimonials: React.FC = () => {
  const { t, language } = useLanguage();

  const getTestimonials = (): Testimonial[] => {
    try {
      const stored = localStorage.getItem('elite_academy_testimonials');
      if (!stored) return [];
      const all: Testimonial[] = JSON.parse(stored);
      return all
        .filter(item => item.visible)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    } catch {
      return [];
    }
  };

  const testimonials = getTestimonials();

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-amber-400' : 'text-slate-200'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <section className="py-16 sm:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6">
            <span className="text-teal-700 font-bold text-[10px] sm:text-xs uppercase tracking-widest">
              {t.testimonials?.badge || (language === 'ar' ? 'آراء الطلاب' : 'TESTIMONIALS')}
            </span>
          </div>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading leading-tight text-slate-900">
            {t.testimonials?.title || (language === 'ar' ? 'ماذا يقول طلابنا' : 'What Our Students Say')}
          </h3>
        </div>

        {testimonials.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium text-sm">
              {t.testimonials?.no_testimonials || (language === 'ar' ? 'ستظهر آراء الطلاب هنا قريباً!' : 'Student testimonials will appear here soon!')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map(testimonial => (
              <div
                key={testimonial.id}
                className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  {testimonial.image ? (
                    <img
                      src={testimonial.image}
                      alt={testimonial.studentName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 font-bold text-lg">
                      {testimonial.studentName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-black text-slate-900 text-sm truncate">{testimonial.studentName}</h4>
                    {testimonial.studentRole && (
                      <p className="text-xs text-slate-400 font-medium truncate">{testimonial.studentRole}</p>
                    )}
                  </div>
                </div>

                {renderStars(testimonial.rating)}

                <p className="mt-4 text-slate-600 text-sm leading-relaxed font-medium">
                  "{testimonial.content}"
                </p>

                {testimonial.courseId && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">
                      {testimonial.courseId}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
