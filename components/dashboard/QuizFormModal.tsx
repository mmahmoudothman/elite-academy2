import React, { useState, useEffect } from 'react';
import { Quiz, QuizStatus, Course, StudentGroup } from '../../types';
import { useLanguage } from '../LanguageContext';

interface QuizFormModalProps {
  isOpen: boolean;
  quiz: Quiz | null;
  courses: Course[];
  groups: StudentGroup[];
  onClose: () => void;
  onSave: (data: Omit<Quiz, 'id'>) => void;
}

const EMPTY_QUIZ: Omit<Quiz, 'id'> = {
  title: '',
  description: '',
  instructions: '',
  courseId: '',
  groupId: '',
  instructorId: '',
  timeLimitMinutes: undefined,
  dueDate: undefined,
  passingScore: 60,
  maxAttempts: 1,
  shuffleQuestions: false,
  shuffleOptions: false,
  showResultsToStudent: true,
  status: 'draft',
  questionCount: 0,
  totalMarks: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const QuizFormModal: React.FC<QuizFormModalProps> = ({ isOpen, quiz, courses, groups, onClose, onSave }) => {
  const { t } = useLanguage();
  const d = t.dashboard;
  const [form, setForm] = useState<Omit<Quiz, 'id'>>(EMPTY_QUIZ);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredGroups = groups.filter(g => !form.courseId || g.courseId === form.courseId);

  useEffect(() => {
    if (quiz) {
      const { id, ...rest } = quiz;
      setForm(rest);
    } else {
      setForm(EMPTY_QUIZ);
    }
    setErrors({});
  }, [quiz, isOpen]);

  if (!isOpen) return null;

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = d.form_title_required || 'Title is required';
    if (!form.courseId) errs.courseId = 'Course is required';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave({
      ...form,
      updatedAt: Date.now(),
      createdAt: form.createdAt || Date.now(),
    });
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
          {quiz ? (d.edit_quiz || 'Edit Quiz') : (d.create_quiz || 'Create Quiz')}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.quiz_title || 'Quiz Title'}</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors(prev => ({ ...prev, title: '' })); }}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm ${errors.title ? 'border-red-400' : 'border-slate-100'}`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.field_description || 'Description'}</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm resize-none"
            />
          </div>

          {/* Instructions */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.instructions || 'Instructions'}</label>
            <textarea
              value={form.instructions || ''}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              rows={2}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm resize-none"
            />
          </div>

          {/* Course & Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.label_course || 'Course'}</label>
              <select
                value={form.courseId}
                onChange={(e) => { setForm({ ...form, courseId: e.target.value, groupId: '' }); setErrors(prev => ({ ...prev, courseId: '' })); }}
                className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm ${errors.courseId ? 'border-red-400' : 'border-slate-100'}`}
              >
                <option value="">Select Course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              {errors.courseId && <p className="text-red-500 text-xs mt-1">{errors.courseId}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.groups_tab || 'Group'}</label>
              <select
                value={form.groupId || ''}
                onChange={(e) => setForm({ ...form, groupId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              >
                <option value="">{d.none_option || 'None'}</option>
                {filteredGroups.map(g => <option key={g.id} value={g.id}>{g.name.en}</option>)}
              </select>
            </div>
          </div>

          {/* Time Limit & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.time_limit || 'Time Limit (min)'}</label>
              <input
                type="number"
                min="0"
                value={form.timeLimitMinutes ?? ''}
                onChange={(e) => setForm({ ...form, timeLimitMinutes: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Optional"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.due_date || 'Due Date'}</label>
              <input
                type="datetime-local"
                value={form.dueDate ? new Date(form.dueDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value ? new Date(e.target.value).getTime() : undefined })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
            </div>
          </div>

          {/* Passing Score & Max Attempts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.passing_score || 'Passing Score %'}</label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.passingScore}
                onChange={(e) => setForm({ ...form, passingScore: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.max_attempts || 'Max Attempts'}</label>
              <input
                type="number"
                min="1"
                value={form.maxAttempts}
                onChange={(e) => setForm({ ...form, maxAttempts: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            {[
              { key: 'shuffleQuestions', label: d.shuffle_questions || 'Shuffle Questions' },
              { key: 'shuffleOptions', label: d.shuffle_options || 'Shuffle Options' },
              { key: 'showResultsToStudent', label: d.show_results || 'Show Results to Student' },
            ].map(toggle => (
              <label key={toggle.key} className="flex items-center gap-3 cursor-pointer">
                <div
                  className={`w-10 h-6 rounded-full transition-all relative ${(form as any)[toggle.key] ? 'bg-[#0da993]' : 'bg-slate-200'}`}
                  onClick={() => setForm({ ...form, [toggle.key]: !(form as any)[toggle.key] })}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${(form as any)[toggle.key] ? 'end-1' : 'start-1'}`} />
                </div>
                <span className="text-sm font-bold text-slate-700">{toggle.label}</span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-[#0da993] text-white py-3 rounded-xl font-black text-sm hover:bg-[#0da993]/90 transition-all mt-2"
          >
            {d.save || 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuizFormModal;
