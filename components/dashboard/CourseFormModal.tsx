import React, { useState, useEffect } from 'react';
import { Course, Category, Instructor } from '../../types';
import { useLanguage } from '../LanguageContext';
import ImageUploader from './ImageUploader';

interface CourseFormModalProps {
  isOpen: boolean;
  course: Course | null;
  onClose: () => void;
  onSave: (data: Omit<Course, 'id'>) => void;
  categories?: Category[];
  instructors?: Instructor[];
}

const EMPTY_COURSE: Omit<Course, 'id'> = {
  title: '',
  category: 'Strategy',
  instructor: '',
  price: 0,
  currency: 'EGP',
  rating: 0,
  enrolled: 0,
  duration: '',
  image: '',
  level: 'Beginner',
  description: '',
  capacity: 200,
};

const CourseFormModal: React.FC<CourseFormModalProps> = ({ isOpen, course, onClose, onSave, categories: propCategories = [], instructors: propInstructors = [] }) => {
  const { t } = useLanguage();
  const [form, setForm] = useState<Omit<Course, 'id'>>(EMPTY_COURSE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const categories = propCategories.filter(c => c.visible !== false);
  const instructors = propInstructors.filter(i => i.visible !== false);

  useEffect(() => {
    if (course) {
      const { id, ...rest } = course;
      setForm(rest);
    } else {
      setForm(EMPTY_COURSE);
    }
    setErrors({});
  }, [course, isOpen]);

  if (!isOpen) return null;

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = t.dashboard?.form_title_required || 'Title is required';
    if (!form.instructor.trim()) errs.instructor = t.dashboard?.form_instructor_required || 'Instructor is required';
    if (form.price < 0) errs.price = t.dashboard?.form_price_invalid || 'Price must be 0 or greater';
    if (!form.capacity || form.capacity <= 0) errs.capacity = t.dashboard?.form_capacity_invalid || 'Capacity must be greater than 0';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-5 sm:p-8 my-8" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 end-4 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-xl font-black text-slate-900 mb-6">
          {course ? t.dashboard.edit_course : t.dashboard.add_course}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard.field_title}</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors((prev) => ({ ...prev, title: '' })); }}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm ${errors.title ? 'border-red-400' : 'border-slate-100'}`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard.field_category}</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name.en}>{c.name.en}</option>
                ))}
                {form.category && !categories.find(c => c.name.en === form.category) && (
                  <option value={form.category}>{form.category} (custom)</option>
                )}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard.field_level}</label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value as Course['level'] })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard.field_instructor}</label>
            <select
              value={form.instructor}
              onChange={(e) => { setForm({ ...form, instructor: e.target.value }); setErrors((prev) => ({ ...prev, instructor: '' })); }}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm ${errors.instructor ? 'border-red-400' : 'border-slate-100'}`}
            >
              <option value="">{t.dashboard?.select_instructor || 'Select Instructor'}</option>
              {instructors.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
              {form.instructor && !instructors.find(i => i.name === form.instructor) && (
                <option value={form.instructor}>{form.instructor}</option>
              )}
            </select>
            {errors.instructor && <p className="text-red-500 text-xs mt-1">{errors.instructor}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard.field_price}</label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => { setForm({ ...form, price: Number(e.target.value) }); setErrors((prev) => ({ ...prev, price: '' })); }}
                className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm ${errors.price ? 'border-red-400' : 'border-slate-100'}`}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard.field_currency}</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value as Course['currency'] })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              >
                <option value="EGP">EGP</option>
                <option value="SAR">SAR</option>
                <option value="AED">AED</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard.field_duration}</label>
              <input
                required
                type="text"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g. 8 weeks, 3 months"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard.field_capacity || 'Capacity'}</label>
              <input
                type="number"
                min="1"
                value={form.capacity ?? 200}
                onChange={(e) => { setForm({ ...form, capacity: Number(e.target.value) }); setErrors((prev) => ({ ...prev, capacity: '' })); }}
                className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm ${errors.capacity ? 'border-red-400' : 'border-slate-100'}`}
              />
              {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard.field_rating}</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard.field_enrolled}</label>
              <input
                type="number"
                min="0"
                value={form.enrolled}
                onChange={(e) => setForm({ ...form, enrolled: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.start_date || 'Start Date'}</label>
              <input
                type="date"
                value={form.startDate ? new Date(form.startDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setForm({ ...form, startDate: e.target.value ? new Date(e.target.value).getTime() : undefined })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.end_date || 'End Date'}</label>
              <input
                type="date"
                value={form.endDate ? new Date(form.endDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setForm({ ...form, endDate: e.target.value ? new Date(e.target.value).getTime() : undefined })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.schedule || 'Schedule'}</label>
              <input
                type="text"
                value={form.schedule || ''}
                onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                placeholder="e.g. Mon/Wed 6-8 PM"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard.field_image}</label>
            <ImageUploader
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              storagePath="courses"
              aspectRatio={16 / 9}
              maxWidth={1200}
              quality={0.8}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard.field_description}</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#0da993] text-white py-3 rounded-xl font-black text-sm hover:bg-[#0da993]/90 transition-all mt-2"
          >
            {t.dashboard.save}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CourseFormModal;
