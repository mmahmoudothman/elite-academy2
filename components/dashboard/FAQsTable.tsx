import React, { useState } from 'react';
import { FAQ } from '../../types';
import { useLanguage } from '../LanguageContext';

interface FAQsTableProps {
  faqs: FAQ[];
  onAdd?: () => void;
  onEdit?: (faq: FAQ) => void;
  onDelete?: (faq: FAQ) => void;
  onToggleVisibility?: (faq: FAQ) => void;
  onReorder?: (id: string, direction: 'up' | 'down') => void;
}

const FAQsTable: React.FC<FAQsTableProps> = ({ faqs, onAdd, onEdit, onDelete, onToggleVisibility, onReorder }) => {
  const { t } = useLanguage();
  const d = t.dashboard;
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const categories = Array.from(new Set(faqs.map(f => f.category).filter(Boolean)));

  const filtered = faqs.filter(f => {
    const matchesSearch = !search ||
      f.question.en.toLowerCase().includes(search.toLowerCase()) ||
      f.question.ar.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || f.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <h2 className="text-2xl font-black text-slate-900">{d?.faqs_tab || 'FAQs'}</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <svg className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder={d?.search_faqs || "Search FAQs..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-10 pe-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-[#0da993] outline-none transition-all w-56"
            />
          </div>
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-[#0da993] outline-none transition-all"
            >
              <option value="">{d?.all_categories || 'All Categories'}</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          {onAdd && (
          <button
            onClick={onAdd}
            className="bg-[#0da993] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0da993]/90 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {d?.add_faq || 'Add FAQ'}
          </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-400 font-medium">{d?.no_faqs_found || 'No FAQs found'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{d?.col_question_en || 'Question (EN)'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{d?.col_question_ar || 'Question (AR)'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{d?.col_category || 'Category'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{d?.col_order || 'Order'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{d?.col_visibility || 'Visible'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{d?.col_actions || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((faq) => (
                  <tr key={faq.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 max-w-[250px] truncate">{faq.question.en}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 max-w-[250px] truncate" dir="rtl">{faq.question.ar}</td>
                    <td className="px-6 py-4">
                      {faq.category ? (
                        <span className="px-3 py-1 bg-[#0da993]/10 text-[#0da993] rounded-lg text-xs font-bold">{faq.category}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-600 font-medium">{faq.order ?? 0}</span>
                        {onReorder && (
                          <div className="flex flex-col ms-2">
                            <button onClick={() => onReorder(faq.id, 'up')} className="text-slate-400 hover:text-slate-600 transition-colors">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                            </button>
                            <button onClick={() => onReorder(faq.id, 'down')} className="text-slate-400 hover:text-slate-600 transition-colors">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onToggleVisibility?.(faq)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          faq.visible !== false
                            ? 'bg-green-50 text-green-600 hover:bg-green-100'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {faq.visible !== false ? (
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            {d?.visible || 'Visible'}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            {d?.hidden || 'Hidden'}
                          </span>
                        )}
                      </button>
                    </td>
                    {(onEdit || onDelete) && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {onEdit && (
                        <button
                          onClick={() => onEdit(faq)}
                          className="p-2 text-slate-400 hover:text-[#0da993] hover:bg-[#0da993]/10 rounded-lg transition-all"
                          title={d?.edit || "Edit"}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        )}
                        {onDelete && (
                        <button
                          onClick={() => onDelete(faq)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title={d?.delete || "Delete"}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        )}
                      </div>
                    </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQsTable;
