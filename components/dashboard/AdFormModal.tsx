import React, { useState, useEffect } from 'react';
import { Ad, AdPlacement, AdStatus } from '../../types';
import { useLanguage } from '../LanguageContext';

interface AdFormModalProps {
  isOpen: boolean;
  ad: Ad | null;
  onClose: () => void;
  onSave: (data: Omit<Ad, 'id'>) => void;
}

const EMPTY: Omit<Ad, 'id'> = {
  title: { en: '', ar: '' },
  content: { en: '', ar: '' },
  image: '',
  link: '',
  placement: 'banner',
  status: 'draft',
  startDate: Date.now(),
  endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
  targetPages: [],
  priority: 1,
  impressions: 0,
  clicks: 0,
  visible: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const toDateInputValue = (ts: number): string => {
  const d = new Date(ts);
  return d.toISOString().split('T')[0];
};

const fromDateInputValue = (val: string): number => {
  return new Date(val).getTime();
};

const AdFormModal: React.FC<AdFormModalProps> = ({ isOpen, ad, onClose, onSave }) => {
  const { t } = useLanguage();
  const [form, setForm] = useState<Omit<Ad, 'id'>>({ ...EMPTY });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (ad) {
      setForm({ ...EMPTY, ...ad });
    } else {
      setForm({ ...EMPTY, createdAt: Date.now(), updatedAt: Date.now(), startDate: Date.now(), endDate: Date.now() + 7 * 24 * 60 * 60 * 1000 });
    }
    setErrors({});
  }, [ad, isOpen]);

  if (!isOpen) return null;

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!form.title.en.trim() && !form.title.ar.trim()) errs.title = 'Title is required in at least one language';
    if (!form.content.en.trim() && !form.content.ar.trim()) errs.content = 'Content is required in at least one language';
    if (form.endDate <= form.startDate) errs.endDate = 'End date must be after start date';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const data: Omit<Ad, 'id'> = {
      ...form,
      updatedAt: Date.now(),
    };

    if (ad) {
      // Preserve existing impressions/clicks when editing
      data.impressions = ad.impressions;
      data.clicks = ad.clicks;
    } else {
      data.impressions = 0;
      data.clicks = 0;
      data.createdAt = Date.now();
    }

    onSave(data);
  };

  const inputClass = (field?: string) =>
    `w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm ${field && errors[field] ? 'border-red-400' : 'border-slate-100'}`;

  const labelClass = 'text-[10px] font-black uppercase tracking-widest text-slate-400';

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
          {ad ? (t.dashboard?.ad_updated || 'Edit Ad') : (t.dashboard?.ad_created || 'Add Ad')}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pe-1">
          {/* Title EN */}
          <div className="space-y-1">
            <label className={labelClass}>{t.dashboard?.ad_title || 'Ad Title'} (EN) *</label>
            <input
              type="text"
              value={form.title.en}
              onChange={(e) => { setForm({ ...form, title: { ...form.title, en: e.target.value } }); setErrors(prev => ({ ...prev, title: '' })); }}
              className={inputClass('title')}
            />
          </div>

          {/* Title AR */}
          <div className="space-y-1">
            <label className={labelClass}>{t.dashboard?.ad_title || 'Ad Title'} (AR) *</label>
            <input
              type="text"
              dir="rtl"
              value={form.title.ar}
              onChange={(e) => { setForm({ ...form, title: { ...form.title, ar: e.target.value } }); setErrors(prev => ({ ...prev, title: '' })); }}
              className={inputClass('title')}
            />
          </div>

          {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}

          {/* Content EN */}
          <div className="space-y-1">
            <label className={labelClass}>{t.dashboard?.ad_content || 'Ad Content'} (EN) *</label>
            <textarea
              value={form.content.en}
              onChange={(e) => { setForm({ ...form, content: { ...form.content, en: e.target.value } }); setErrors(prev => ({ ...prev, content: '' })); }}
              rows={3}
              className={`${inputClass('content')} resize-none`}
            />
          </div>

          {/* Content AR */}
          <div className="space-y-1">
            <label className={labelClass}>{t.dashboard?.ad_content || 'Ad Content'} (AR) *</label>
            <textarea
              dir="rtl"
              value={form.content.ar}
              onChange={(e) => { setForm({ ...form, content: { ...form.content, ar: e.target.value } }); setErrors(prev => ({ ...prev, content: '' })); }}
              rows={3}
              className={`${inputClass('content')} resize-none`}
            />
          </div>

          {errors.content && <p className="text-red-500 text-xs">{errors.content}</p>}

          {/* Image URL */}
          <div className="space-y-1">
            <label className={labelClass}>{t.dashboard?.field_image || 'Image URL'}</label>
            <input
              type="text"
              value={form.image || ''}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://..."
              className={inputClass()}
            />
          </div>

          {/* Link URL */}
          <div className="space-y-1">
            <label className={labelClass}>Link URL</label>
            <input
              type="text"
              value={form.link || ''}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="https://..."
              className={inputClass()}
            />
          </div>

          {/* Placement & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>{t.dashboard?.ad_placement || 'Placement'}</label>
              <select
                value={form.placement}
                onChange={(e) => setForm({ ...form, placement: e.target.value as AdPlacement })}
                className={inputClass()}
              >
                <option value="banner">{t.dashboard?.banner || 'Banner'}</option>
                <option value="popup">{t.dashboard?.popup || 'Popup'}</option>
                <option value="sidebar">{t.dashboard?.sidebar_placement || 'Sidebar'}</option>
                <option value="inline">{t.dashboard?.inline_ad || 'Inline'}</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>{t.dashboard?.ad_status || 'Status'}</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as AdStatus })}
                className={inputClass()}
              >
                <option value="draft">{t.dashboard?.draft || 'Draft'}</option>
                <option value="active">{t.dashboard?.active_status || 'Active'}</option>
                <option value="paused">{t.dashboard?.paused || 'Paused'}</option>
              </select>
            </div>
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>{t.dashboard?.start_date || 'Start Date'}</label>
              <input
                type="date"
                value={toDateInputValue(form.startDate)}
                onChange={(e) => setForm({ ...form, startDate: fromDateInputValue(e.target.value) })}
                className={inputClass()}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>{t.dashboard?.end_date || 'End Date'}</label>
              <input
                type="date"
                value={toDateInputValue(form.endDate)}
                onChange={(e) => { setForm({ ...form, endDate: fromDateInputValue(e.target.value) }); setErrors(prev => ({ ...prev, endDate: '' })); }}
                className={inputClass('endDate')}
              />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Target Pages & Priority */}
          <div className="space-y-1">
            <label className={labelClass}>{t.dashboard?.target_pages || 'Target Pages'} (comma-separated)</label>
            <input
              type="text"
              value={(form.targetPages || []).join(', ')}
              onChange={(e) => setForm({ ...form, targetPages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              placeholder="home, courses, about"
              className={inputClass()}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass}>{t.dashboard?.priority || 'Priority'} (1-10)</label>
            <input
              type="number"
              min={1}
              max={10}
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: Math.min(10, Math.max(1, Number(e.target.value))) })}
              className={inputClass()}
            />
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

export default AdFormModal;
