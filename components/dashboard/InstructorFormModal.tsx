import React, { useState, useEffect } from 'react';
import { Instructor } from '../../types';
import { useLanguage } from '../LanguageContext';
import ImageUploader from './ImageUploader';

interface InstructorFormModalProps {
  isOpen: boolean;
  instructor: Instructor | null;
  onClose: () => void;
  onSave: (data: Omit<Instructor, 'id'>) => void;
}

const EMPTY_INSTRUCTOR: Omit<Instructor, 'id'> = {
  name: '',
  role: '',
  experience: '',
  qualifications: [],
  bio: '',
  image: '',
  specialization: '',
  videoUrl: '',
};

const InstructorFormModal: React.FC<InstructorFormModalProps> = ({ isOpen, instructor, onClose, onSave }) => {
  const { t } = useLanguage();
  const [form, setForm] = useState<Omit<Instructor, 'id'>>(EMPTY_INSTRUCTOR);
  const [qualText, setQualText] = useState('');

  useEffect(() => {
    if (instructor) {
      const { id, ...rest } = instructor;
      setForm(rest);
      setQualText(rest.qualifications.join('\n'));
    } else {
      setForm(EMPTY_INSTRUCTOR);
      setQualText('');
    }
  }, [instructor, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qualifications = qualText.split('\n').map(q => q.trim()).filter(Boolean);
    onSave({ ...form, qualifications });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 my-8" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-xl font-black text-slate-900 mb-6">
          {instructor ? t.dashboard.edit_instructor : t.dashboard.add_instructor}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard.field_name}</label>
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard.field_role}</label>
              <input
                required
                type="text"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard.field_specialization}</label>
              <input
                required
                type="text"
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard.field_experience}</label>
            <input
              required
              type="text"
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
              placeholder="e.g. 15+ Years Executive Experience"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard.field_image}</label>
            <ImageUploader
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              storagePath="instructors"
              aspectRatio={1}
              maxWidth={800}
              quality={0.85}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard.field_qualifications}</label>
            <textarea
              value={qualText}
              onChange={(e) => setQualText(e.target.value)}
              rows={3}
              placeholder="PhD in Strategic Management&#10;Former McKinsey Consultant"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard.field_bio}</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard.field_video_url}</label>
            <input
              type="text"
              value={form.videoUrl || ''}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              placeholder="https://..."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-black text-sm hover:bg-teal-700 transition-all mt-2"
          >
            {t.dashboard.save}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InstructorFormModal;
