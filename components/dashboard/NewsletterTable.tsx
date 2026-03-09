import React, { useState } from 'react';
import { NewsletterSubscription } from '../../types';

interface NewsletterTableProps {
  newsletters: NewsletterSubscription[];
  onDelete?: (newsletter: NewsletterSubscription) => void;
  onToggleActive?: (newsletter: NewsletterSubscription) => void;
}

const NewsletterTable: React.FC<NewsletterTableProps> = ({ newsletters, onDelete, onToggleActive }) => {
  const [search, setSearch] = useState('');

  const filtered = newsletters.filter(n =>
    n.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportAll = () => {
    const activeEmails = newsletters.filter(n => n.isActive !== false).map(n => n.email);
    const csvContent = 'Email\n' + activeEmails.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `newsletter_emails_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <h2 className="text-2xl font-black text-slate-900">Newsletter Subscribers</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-teal-500 outline-none transition-all w-64"
            />
          </div>
          <button
            onClick={handleExportAll}
            className="px-4 py-2.5 text-sm font-bold text-teal-600 border border-teal-200 rounded-xl hover:bg-teal-50 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export Emails
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-400 font-medium">No subscribers found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">Email</th>
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">Subscribed Date</th>
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">Source</th>
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">Active</th>
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => (
                  <tr key={sub.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{sub.email}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {new Date(sub.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                        {sub.source || 'website'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onToggleActive?.(sub)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          sub.isActive !== false
                            ? 'bg-green-50 text-green-600 hover:bg-green-100'
                            : 'bg-red-50 text-red-500 hover:bg-red-100'
                        }`}
                      >
                        {sub.isActive !== false ? 'Active' : 'Unsubscribed'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {sub.isActive !== false && (
                          <button
                            onClick={() => onToggleActive?.(sub)}
                            className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                            title="Unsubscribe"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => onDelete?.(sub)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
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

export default NewsletterTable;
