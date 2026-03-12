import React, { useState, useEffect } from 'react';
import { FAQ } from '../../types';
import { useLanguage } from '../LanguageContext';

interface FAQFormModalProps {
  isOpen: boolean;
  faq: FAQ | null;
  onClose: () => void;
  onSave: (data: Omit<FAQ, 'id'>) => void;
}

const EMPTY: Omit<FAQ, 'id'> = {
  question: { en: '', ar: '' },
  answer: { en: '', ar: '' },
  category: '',
  order: 0,
  visible: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const FAQFormModal: React.FC<FAQFormModalProps> = ({ isOpen, faq, onClose, onSave }) => {
  const { t } = useLanguage();
  const [form, setForm] = useState<Omit<FAQ, 'id'>>({ ...EMPTY });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (faq) {
      const { id, ...rest } = faq;
      setForm(rest);
    } else {
      setForm({ ...EMPTY, createdAt: Date.now(), updatedAt: Date.now() });
    }
    setErrors({});
  }, [faq, isOpen]);

  if (!isOpen) return null;

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!form.question.en.trim()) errs.questionEn = t.dashboard?.form_question_en_required || 'Question (EN) is required';
    if (!form.question.ar.trim()) errs.questionAr = t.dashboard?.form_question_ar_required || 'Question (AR) is required';
    if (!form.answer.en.trim()) errs.answerEn = t.dashboard?.form_answer_en_required || 'Answer (EN) is required';
    if (!form.answer.ar.trim()) errs.answerAr = t.dashboard?.form_answer_ar_required || 'Answer (AR) is required';
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
          {faq ? (t.dashboard?.edit_faq || 'Edit FAQ') : (t.dashboard?.add_faq || 'Add FAQ')}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.label_question_en || 'Question (EN)'} *</label>
            <input
              type="text"
              value={form.question.en}
              onChange={(e) => { setForm({ ...form, question: { ...form.question, en: e.target.value } }); setErrors(prev => ({ ...prev, questionEn: '' })); }}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm ${errors.questionEn ? 'border-red-400' : 'border-slate-100'}`}
            />
            {errors.questionEn && <p className="text-red-500 text-xs mt-1">{errors.questionEn}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.label_question_ar || 'Question (AR)'} *</label>
            <input
              type="text"
              dir="rtl"
              value={form.question.ar}
              onChange={(e) => { setForm({ ...form, question: { ...form.question, ar: e.target.value } }); setErrors(prev => ({ ...prev, questionAr: '' })); }}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm ${errors.questionAr ? 'border-red-400' : 'border-slate-100'}`}
            />
            {errors.questionAr && <p className="text-red-500 text-xs mt-1">{errors.questionAr}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.label_answer_en || 'Answer (EN)'} *</label>
            <textarea
              value={form.answer.en}
              onChange={(e) => { setForm({ ...form, answer: { ...form.answer, en: e.target.value } }); setErrors(prev => ({ ...prev, answerEn: '' })); }}
              rows={3}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm resize-none ${errors.answerEn ? 'border-red-400' : 'border-slate-100'}`}
            />
            {errors.answerEn && <p className="text-red-500 text-xs mt-1">{errors.answerEn}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.label_answer_ar || 'Answer (AR)'} *</label>
            <textarea
              dir="rtl"
              value={form.answer.ar}
              onChange={(e) => { setForm({ ...form, answer: { ...form.answer, ar: e.target.value } }); setErrors(prev => ({ ...prev, answerAr: '' })); }}
              rows={3}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm resize-none ${errors.answerAr ? 'border-red-400' : 'border-slate-100'}`}
            />
            {errors.answerAr && <p className="text-red-500 text-xs mt-1">{errors.answerAr}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.label_category || 'Category'}</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. General, Billing"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
            </div>
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
          </div>

          <div className="space-y-1">
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

export default FAQFormModal;
