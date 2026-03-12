import React, { useState, useEffect } from 'react';
import { Category } from '../../types';
import { useLanguage } from '../LanguageContext';

interface CategoryFormModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onSave: (data: Omit<Category, 'id'>) => void;
}

const EMPTY: Omit<Category, 'id'> = {
  name: { en: '', ar: '' },
  slug: '',
  description: { en: '', ar: '' },
  color: '#0d9488',
  icon: '',
  order: 0,
  visible: true,
  courseCount: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ isOpen, category, onClose, onSave }) => {
  const { t } = useLanguage();
  const [form, setForm] = useState<Omit<Category, 'id'>>({ ...EMPTY });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoSlug, setAutoSlug] = useState(true);

  useEffect(() => {
    if (category) {
      const { id, ...rest } = category;
      setForm(rest);
      setAutoSlug(false);
    } else {
      setForm({ ...EMPTY, createdAt: Date.now(), updatedAt: Date.now() });
      setAutoSlug(true);
    }
    setErrors({});
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleNameEnChange = (value: string) => {
    const newName = { ...form.name, en: value };
    const updates: Partial<Omit<Category, 'id'>> = { name: newName };
    if (autoSlug) {
      updates.slug = slugify(value);
    }
    setForm({ ...form, ...updates });
    setErrors(prev => ({ ...prev, nameEn: '' }));
  };

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!form.name.en.trim()) errs.nameEn = t.dashboard?.form_name_en_required || 'Name (EN) is required';
    if (!form.name.ar.trim()) errs.nameAr = t.dashboard?.form_name_ar_required || 'Name (AR) is required';
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
          {category ? (t.dashboard?.edit_category || 'Edit Category') : (t.dashboard?.add_category || 'Add Category')}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.col_name_en || 'Name (EN)'} *</label>
            <input
              type="text"
              value={form.name.en}
              onChange={(e) => handleNameEnChange(e.target.value)}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm ${errors.nameEn ? 'border-red-400' : 'border-slate-100'}`}
            />
            {errors.nameEn && <p className="text-red-500 text-xs mt-1">{errors.nameEn}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.col_name_ar || 'Name (AR)'} *</label>
            <input
              type="text"
              dir="rtl"
              value={form.name.ar}
              onChange={(e) => { setForm({ ...form, name: { ...form.name, ar: e.target.value } }); setErrors(prev => ({ ...prev, nameAr: '' })); }}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm ${errors.nameAr ? 'border-red-400' : 'border-slate-100'}`}
            />
            {errors.nameAr && <p className="text-red-500 text-xs mt-1">{errors.nameAr}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.label_slug || 'Slug'}</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => { setForm({ ...form, slug: e.target.value }); setAutoSlug(false); }}
              placeholder="auto-generated-from-name"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.label_description_en || 'Description (EN)'}</label>
            <textarea
              value={form.description?.en || ''}
              onChange={(e) => setForm({ ...form, description: { en: e.target.value, ar: form.description?.ar || '' } })}
              rows={2}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.label_description_ar || 'Description (AR)'}</label>
            <textarea
              dir="rtl"
              value={form.description?.ar || ''}
              onChange={(e) => setForm({ ...form, description: { en: form.description?.en || '', ar: e.target.value } })}
              rows={2}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.label_color || 'Color'}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color || '#0d9488'}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={form.color || '#0d9488'}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-xs font-mono"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.label_icon || 'Icon'}</label>
              <input
                type="text"
                value={form.icon || ''}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="e.g. emoji or class"
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

export default CategoryFormModal;
