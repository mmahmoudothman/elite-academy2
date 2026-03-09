import React, { useState, useMemo } from 'react';
import { Enrollment } from '../../types';
import { useLanguage } from '../LanguageContext';
import EmptyState from '../ui/EmptyState';

interface EnrollmentsTableProps {
  enrollments: Enrollment[];
  onUpdateStatus?: (id: string, status: Enrollment['status']) => void;
  onUpdatePayment?: (id: string, status: Enrollment['paymentStatus']) => void;
  onDelete?: (id: string) => void;
  onUpdateEnrollment?: (id: string, data: Partial<Enrollment>) => void;
  onViewInvoice?: (enrollment: Enrollment) => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600',
  confirmed: 'bg-blue-50 text-blue-600',
  completed: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-red-50 text-red-500',
};

const paymentColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600',
  paid: 'bg-emerald-50 text-emerald-600',
  refunded: 'bg-red-50 text-red-500',
};

const EnrollmentsTable: React.FC<EnrollmentsTableProps> = ({ enrollments, onUpdateStatus, onUpdatePayment, onDelete, onUpdateEnrollment, onViewInvoice }) => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);

  // Unique course titles for filter
  const courseOptions = useMemo(() => {
    const titles = new Set(enrollments.map(e => e.courseTitle));
    return Array.from(titles).sort();
  }, [enrollments]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const fromTs = dateFrom ? new Date(dateFrom).getTime() : 0;
    const toTs = dateTo ? new Date(dateTo + 'T23:59:59').getTime() : Infinity;
    return enrollments
      .filter(e => statusFilter === 'all' || e.status === statusFilter)
      .filter(e => paymentFilter === 'all' || e.paymentStatus === paymentFilter)
      .filter(e => courseFilter === 'all' || e.courseTitle === courseFilter)
      .filter(e => e.enrolledAt >= fromTs && e.enrolledAt <= toTs)
      .filter(e => e.studentName.toLowerCase().includes(q) || e.courseTitle.toLowerCase().includes(q) || e.studentEmail.toLowerCase().includes(q) || (e.invoiceNumber || '').toLowerCase().includes(q))
      .sort((a, b) => b.enrolledAt - a.enrolledAt);
  }, [enrollments, search, statusFilter, paymentFilter, courseFilter, dateFrom, dateTo]);

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  // Summary stats
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return {
      total: enrollments.length,
      pendingPayments: enrollments.filter(e => e.paymentStatus === 'pending' && e.status !== 'cancelled').length,
      totalRevenue: enrollments.filter(e => e.paymentStatus === 'paid').reduce((s, e) => s + e.paymentAmount, 0),
      monthRevenue: enrollments.filter(e => e.paymentStatus === 'paid' && e.enrolledAt >= monthStart).reduce((s, e) => s + e.paymentAmount, 0),
    };
  }, [enrollments]);

  const handleSaveNotes = (id: string) => {
    if (onUpdateEnrollment) {
      onUpdateEnrollment(id, { adminNotes: notesValue });
    }
    setEditingNotes(null);
  };

  const handleCancelEnrollment = (id: string) => {
    onUpdateStatus?.(id, 'cancelled');
    setCancelConfirm(null);
  };

  if (enrollments.length === 0) {
    return <EmptyState title={t.dashboard?.no_enrollments || 'No enrollments yet'} description={t.dashboard?.no_enrollments_desc || 'Enrollments will appear here when students sign up for courses.'} />;
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Enrollments</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Payments</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.pendingPayments}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Revenue</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">This Month</p>
          <p className="text-2xl font-black text-teal-600 mt-1">{stats.monthRevenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header & Filters */}
        <div className="p-4 sm:p-6 border-b border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-lg font-black text-slate-900">{t.dashboard?.enrollments_tab || 'Enrollments'} ({filtered.length})</h3>
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder={t.dashboard?.search_enrollments || 'Search by name, email, invoice...'} className="w-full sm:w-56 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none">
              <option value="all">{t.dashboard?.all_statuses || 'All Statuses'}</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setPage(0); }} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none">
              <option value="all">All Payments</option>
              <option value="pending">Payment Pending</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
            <select value={courseFilter} onChange={e => { setCourseFilter(e.target.value); setPage(0); }} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none max-w-[180px]">
              <option value="all">All Courses</option>
              {courseOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0); }} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="From" />
            <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0); }} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="To" />
            {(statusFilter !== 'all' || paymentFilter !== 'all' || courseFilter !== 'all' || dateFrom || dateTo) && (
              <button onClick={() => { setStatusFilter('all'); setPaymentFilter('all'); setCourseFilter('all'); setDateFrom(''); setDateTo(''); setPage(0); }} className="text-xs font-bold text-red-500 hover:text-red-700 px-3 py-2">
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-left rtl:text-right">
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.col_student || 'Student'}</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.col_course || 'Course'}</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:table-cell">Invoice #</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:table-cell">{t.dashboard?.col_status || 'Status'}</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden md:table-cell">{t.dashboard?.col_payment || 'Payment'}</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden md:table-cell">Method</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden lg:table-cell">{t.dashboard?.col_amount || 'Amount'}</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden lg:table-cell">{t.dashboard?.col_date || 'Date'}</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{t.dashboard?.col_actions || 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paged.map(enrollment => (
                <React.Fragment key={enrollment.id}>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-sm text-slate-900 truncate max-w-[140px]">{enrollment.studentName}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[140px]">{enrollment.studentEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-700 truncate max-w-[160px]">{enrollment.courseTitle}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs font-mono text-slate-500">{enrollment.invoiceNumber || '-'}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${statusColors[enrollment.status]}`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${paymentColors[enrollment.paymentStatus]}`}>
                        {enrollment.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-slate-500 capitalize">{(enrollment.paymentMethod || '-').replace(/_/g, ' ')}</span>
                      {enrollment.paymentReference && (
                        <p className="text-[10px] text-slate-400 font-mono">{enrollment.paymentReference}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm font-bold text-slate-900">
                      {enrollment.paymentAmount} {enrollment.paymentCurrency}
                      {enrollment.installmentPlan && (
                        <span className="ms-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {enrollment.installmentCount || 2}x
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-slate-400">{new Date(enrollment.enrolledAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {/* Status workflow buttons */}
                        {onUpdateStatus && enrollment.status === 'pending' && (
                          <button onClick={() => onUpdateStatus(enrollment.id, 'confirmed')} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Confirm">
                            Confirm
                          </button>
                        )}
                        {onUpdateStatus && enrollment.status === 'confirmed' && (
                          <button onClick={() => onUpdateStatus(enrollment.id, 'completed')} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Complete">
                            Complete
                          </button>
                        )}
                        {onUpdateStatus && enrollment.status !== 'cancelled' && (
                          cancelConfirm === enrollment.id ? (
                            <div className="flex gap-1">
                              <button onClick={() => handleCancelEnrollment(enrollment.id)} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200">Yes</button>
                              <button onClick={() => setCancelConfirm(null)} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200">No</button>
                            </div>
                          ) : (
                            <button onClick={() => setCancelConfirm(enrollment.id)} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Cancel">
                              Cancel
                            </button>
                          )
                        )}
                        {/* Payment status */}
                        {onUpdatePayment && enrollment.paymentStatus === 'pending' && enrollment.status !== 'cancelled' && (
                          <button onClick={() => onUpdatePayment(enrollment.id, 'paid')} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors" title="Mark Paid">
                            Paid
                          </button>
                        )}
                        {/* Admin notes toggle */}
                        <button onClick={() => { if (expandedNotes === enrollment.id) { setExpandedNotes(null); } else { setExpandedNotes(enrollment.id); } }} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors" title="Notes">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        {/* Invoice */}
                        {onViewInvoice && enrollment.invoiceNumber && (
                          <button onClick={() => onViewInvoice(enrollment)} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors" title="Invoice">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </button>
                        )}
                        {/* Delete */}
                        {onDelete && (
                        <button onClick={() => onDelete(enrollment.id)} className="text-red-400 hover:text-red-600 transition-colors p-2 w-8 h-8 flex items-center justify-center" title="Delete">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* Expandable admin notes row */}
                  {expandedNotes === enrollment.id && (
                    <tr className="bg-slate-50/80">
                      <td colSpan={9} className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2 flex-shrink-0">Admin Notes:</span>
                          {editingNotes === enrollment.id ? (
                            <div className="flex-1 flex gap-2">
                              <textarea value={notesValue} onChange={e => setNotesValue(e.target.value)} className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" rows={2} placeholder="Add admin notes..." />
                              <div className="flex flex-col gap-1">
                                <button onClick={() => handleSaveNotes(enrollment.id)} className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700">Save</button>
                                <button onClick={() => setEditingNotes(null)} className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex items-start gap-2">
                              <p className="text-xs text-slate-600 flex-1">{enrollment.adminNotes || <span className="text-slate-400 italic">No notes</span>}</p>
                              <button onClick={() => { setEditingNotes(enrollment.id); setNotesValue(enrollment.adminNotes || ''); }} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex-shrink-0">
                                Edit
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">{page * pageSize + 1}-{Math.min((page + 1) * pageSize, filtered.length)} / {filtered.length}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-all">Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-all">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollmentsTable;
