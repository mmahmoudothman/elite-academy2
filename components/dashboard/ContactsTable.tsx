import React, { useState, useMemo } from 'react';
import { ContactSubmission } from '../../types';
import { useLanguage } from '../LanguageContext';
import EmptyState from '../ui/EmptyState';

interface ContactsTableProps {
  contacts: ContactSubmission[];
  onMarkRead?: (id: string) => void;
  onMarkResponded?: (id: string) => void;
  onDelete?: (id: string) => void;
  onReply?: (id: string, reply: string) => void;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-50 text-blue-600',
  read: 'bg-amber-50 text-amber-600',
  responded: 'bg-emerald-50 text-emerald-600',
};

const inquiryTypeColors: Record<string, string> = {
  general: 'bg-slate-100 text-slate-600',
  course_info: 'bg-[#3d66f1]/10 text-[#3d66f1]',
  corporate: 'bg-purple-50 text-purple-600',
  partnership: 'bg-[#0da993]/10 text-[#0da993]',
  technical: 'bg-orange-50 text-orange-600',
  billing: 'bg-rose-50 text-rose-600',
  feedback: 'bg-cyan-50 text-cyan-600',
};

const inquiryTypeLabelsEN: Record<string, string> = {
  general: 'General',
  course_info: 'Course Info',
  corporate: 'Corporate',
  partnership: 'Partnership',
  technical: 'Technical',
  billing: 'Billing',
  feedback: 'Feedback',
};

const ContactsTable: React.FC<ContactsTableProps> = ({ contacts, onMarkRead, onMarkResponded, onDelete, onReply }) => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [page, setPage] = useState(0);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const pageSize = 10;

  // Summary stats
  const stats = useMemo(() => {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const totalMessages = contacts.length;
    const newUnread = contacts.filter(c => c.status === 'new').length;
    const thisWeek = contacts.filter(c => c.submittedAt >= oneWeekAgo).length;

    // Avg response time
    const responded = contacts.filter(c => c.status === 'responded' && c.respondedAt && c.submittedAt);
    let avgResponseMs = 0;
    if (responded.length > 0) {
      const totalMs = responded.reduce((sum, c) => sum + ((c.respondedAt || 0) - c.submittedAt), 0);
      avgResponseMs = totalMs / responded.length;
    }

    return { totalMessages, newUnread, thisWeek, avgResponseMs, respondedCount: responded.length };
  }, [contacts]);

  const formatResponseTime = (ms: number): string => {
    if (ms <= 0) return t.dashboard?.no_response_data || 'N/A';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours} ${t.dashboard?.hours || 'hours'} ${minutes} ${t.dashboard?.minutes || 'min'}`;
    return `${minutes} ${t.dashboard?.minutes || 'min'}`;
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const fromTs = dateFrom ? new Date(dateFrom).getTime() : 0;
    const toTs = dateTo ? new Date(dateTo + 'T23:59:59').getTime() : Infinity;

    return contacts
      .filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q) || (c.inquiryType || '').toLowerCase().includes(q);
        const matchesDate = c.submittedAt >= fromTs && c.submittedAt <= toTs;
        return matchesSearch && matchesDate;
      })
      .sort((a, b) => b.submittedAt - a.submittedAt);
  }, [contacts, search, dateFrom, dateTo]);

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const getInquiryTypeLabel = (type?: string): string => {
    if (!type) return '';
    const key = `inquiry_${type}` as keyof typeof t.contact;
    return (t.contact as any)?.[key] || inquiryTypeLabelsEN[type] || type;
  };

  const handleSendReply = (contactId: string) => {
    if (!replyText.trim() || !onReply) return;
    onReply(contactId, replyText.trim());
    setReplyingTo(null);
    setReplyText('');
  };

  if (contacts.length === 0) {
    return <EmptyState title={t.dashboard?.no_contacts || 'No messages yet'} description={t.dashboard?.no_contacts_desc || 'Contact submissions will appear here.'} />;
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t.dashboard?.total_messages || 'Total Messages'}</p>
          <p className="text-2xl font-black text-slate-900">{stats.totalMessages}</p>
        </div>
        <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">{t.dashboard?.new_unread || 'New (Unread)'}</p>
          <p className="text-2xl font-black text-blue-600">{stats.newUnread}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#0da993]/20 p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#0da993] mb-1">{t.dashboard?.avg_response_time || 'Avg Response Time'}</p>
          <p className="text-lg font-black text-[#0da993]">{stats.respondedCount > 0 ? formatResponseTime(stats.avgResponseMs) : (t.dashboard?.no_response_data || 'N/A')}</p>
        </div>
        <div className="bg-white rounded-2xl border border-purple-100 p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-1">{t.dashboard?.this_week_messages || 'This Week'}</p>
          <p className="text-2xl font-black text-purple-600">{stats.thisWeek}</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 flex flex-col gap-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-lg font-black text-slate-900">
              {t.dashboard?.contacts_tab || 'Contact Messages'} ({filtered.length})
              {stats.newUnread > 0 && (
                <span className="ms-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{stats.newUnread} {t.dashboard?.new_label || 'new'}</span>
              )}
            </h3>
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder={t.dashboard?.search_contacts || 'Search messages...'} className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0da993] focus:bg-white transition-all" />
          </div>

          {/* Date Range Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.filter_by_date || 'Filter by Date'}:</span>
            <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0); }} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0da993] transition-all" />
            <span className="text-xs text-slate-400 font-bold">-</span>
            <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0); }} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0da993] transition-all" />
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(''); setDateTo(''); setPage(0); }} className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors px-2 py-1">
                {t.dashboard?.clear_date_filter || 'Clear'}
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {paged.map(contact => (
            <div key={contact.id} className={`p-4 sm:p-5 hover:bg-slate-50/50 transition-colors ${contact.status === 'new' ? 'bg-blue-50/30' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { setExpanded(expanded === contact.id ? null : contact.id); if (contact.status === 'new') onMarkRead?.(contact.id); }}>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{contact.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${statusColors[contact.status]}`}>{contact.status}</span>
                    {/* Inquiry Type Badge */}
                    {contact.inquiryType && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${inquiryTypeColors[contact.inquiryType] || 'bg-slate-100 text-slate-500'}`}>
                        {getInquiryTypeLabel(contact.inquiryType)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-1">
                    {contact.email} {contact.phone && `| ${contact.phone}`}
                    {/* Source Page */}
                    {contact.sourcePage && (
                      <span className="ms-2 text-[10px] text-slate-300">
                        ({t.dashboard?.col_source_page || 'Source'}: {contact.sourcePage === 'direct' ? 'Direct' : contact.sourcePage})
                      </span>
                    )}
                  </p>
                  <p className="text-sm font-bold text-slate-700">{contact.subject}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(contact.submittedAt).toLocaleDateString()} {new Date(contact.submittedAt).toLocaleTimeString()}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {onMarkResponded && contact.status !== 'responded' && (
                    <button onClick={() => onMarkResponded(contact.id)} className="text-emerald-500 hover:text-emerald-600 transition-colors" title={t.dashboard?.marked_responded || "Mark responded"}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </button>
                  )}
                  {onDelete && (
                  <button onClick={() => onDelete(contact.id)} className="text-red-400 hover:text-red-600 transition-colors" title={t.dashboard?.delete || "Delete"}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                  )}
                </div>
              </div>

              {expanded === contact.id && (
                <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{contact.message}</p>

                  {/* Show existing admin reply if present */}
                  {contact.adminReply && (
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">{t.dashboard?.admin_reply || 'Admin Reply'}</p>
                      <p className="text-sm text-emerald-700 whitespace-pre-wrap">{contact.adminReply}</p>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    <a href={`mailto:${contact.email}?subject=Re: ${contact.subject}`} className="text-xs font-bold text-[#0da993] hover:text-[#0da993] flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      {t.dashboard?.reply || 'Reply via Email'}
                    </a>
                    {onReply && (
                      <button onClick={() => { setReplyingTo(replyingTo === contact.id ? null : contact.id); setReplyText(contact.adminReply || ''); }} className="text-xs font-bold text-[#3d66f1] hover:text-[#3d66f1] flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                        {t.dashboard?.admin_reply || 'Admin Reply'}
                      </button>
                    )}
                  </div>

                  {/* Inline Reply Textarea */}
                  {replyingTo === contact.id && onReply && (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        rows={3}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0da993] transition-all resize-none"
                        placeholder={t.dashboard?.admin_reply_placeholder || 'Type your reply here...'}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSendReply(contact.id)}
                          disabled={!replyText.trim()}
                          className="px-4 py-2 bg-[#0da993] text-white text-xs font-bold rounded-lg hover:bg-[#0da993]/90 transition-all disabled:opacity-40"
                        >
                          {t.dashboard?.send_reply || 'Send Reply'}
                        </button>
                        <button
                          onClick={() => { setReplyingTo(null); setReplyText(''); }}
                          className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all"
                        >
                          {t.dashboard?.cancel_reply || 'Cancel'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">{page * pageSize + 1}-{Math.min((page + 1) * pageSize, filtered.length)} / {filtered.length}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-all">{t.dashboard?.prev || 'Prev'}</button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-all">{t.dashboard?.next_page || 'Next'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsTable;
