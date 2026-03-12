import React, { useState, useEffect } from 'react';
import { Testimonial, Course } from '../../types';
import { useLanguage } from '../LanguageContext';

interface TestimonialFormModalProps {
  isOpen: boolean;
  testimonial: Testimonial | null;
  courses?: Course[];
  onClose: () => void;
  onSave: (data: Omit<Testimonial, 'id'>) => void;
}

const EMPTY: Omit<Testimonial, 'id'> = {
  studentName: '',
  studentRole: '',
  content: '',
  rating: 5,
  courseId: '',
  image: '',
  order: 0,
  visible: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const TestimonialFormModal: React.FC<TestimonialFormModalProps> = ({ isOpen, testimonial, courses = [], onClose, onSave }) => {
  const { t } = useLanguage();
  const [form, setForm] = useState<Omit<Testimonial, 'id'>>({ ...EMPTY });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (testimonial) {
      setForm({ ...EMPTY, ...testimonial });
    } else {
      setForm({ ...EMPTY });
    }
    setErrors({});
  }, [testimonial, isOpen]);

  if (!isOpen) return null;

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!form.studentName.trim()) errs.studentName = t.dashboard?.form_student_name_required || 'Student name is required';
    if (!form.content.trim()) errs.content = t.dashboard?.form_content_required || 'Content is required';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave({ ...form, updatedAt: Date.now() });
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
          {testimonial ? (t.dashboard?.edit_testimonial || 'Edit Testimonial') : (t.dashboard?.add_testimonial || 'Add Testimonial')}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.label_student_name || 'Student Name'} *</label>
            <input
              type="text"
              value={form.studentName}
              onChange={(e) => { setForm({ ...form, studentName: e.target.value }); setErrors(prev => ({ ...prev, studentName: '' })); }}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm ${errors.studentName ? 'border-red-400' : 'border-slate-100'}`}
            />
            {errors.studentName && <p className="text-red-500 text-xs mt-1">{errors.studentName}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.label_student_role || 'Student Role'}</label>
            <input
              type="text"
              value={form.studentRole}
              onChange={(e) => setForm({ ...form, studentRole: e.target.value })}
              placeholder="e.g. Software Engineer"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.label_content || 'Content'} *</label>
            <textarea
              value={form.content}
              onChange={(e) => { setForm({ ...form, content: e.target.value }); setErrors(prev => ({ ...prev, content: '' })); }}
              rows={4}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm resize-none ${errors.content ? 'border-red-400' : 'border-slate-100'}`}
            />
            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.label_rating || 'Rating'}</label>
              <select
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              >
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} {n > 1 ? (t.dashboard?.stars || 'Stars') : (t.dashboard?.star || 'Star')}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.label_course || 'Course'}</label>
              <select
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              >
                <option value="">{t.dashboard?.none_option || 'None'}</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.label_image_url || 'Image URL'}</label>
            <input
              type="text"
              value={form.image || ''}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://..."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.label_order || 'Order'}</label>
              <input
                type="number"
                min="0"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
            </div>
            <div className="space-y-1 flex items-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.visible !== false}
                  onChange={(e) => setForm({ ...form, visible: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm font-bold text-slate-700">{t.dashboard?.label_visible || 'Visible'}</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-black text-sm hover:bg-teal-700 transition-all mt-2"
          >
            {t.dashboard?.save || 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TestimonialFormModal;
