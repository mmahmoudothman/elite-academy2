import React, { useState } from 'react';
import { AuditLogEntry } from '../../types';

interface AuditLogTableProps {
  auditLog: AuditLogEntry[];
}

const AuditLogTable: React.FC<AuditLogTableProps> = ({ auditLog }) => {
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const actions = Array.from(new Set(auditLog.map(l => l.action)));
  const entityTypes = Array.from(new Set(auditLog.map(l => l.entityType)));

  const filtered = auditLog
    .filter(l => {
      if (actionFilter && l.action !== actionFilter) return false;
      if (entityFilter && l.entityType !== entityFilter) return false;
      if (dateFrom) {
        const from = new Date(dateFrom).getTime();
        if (l.timestamp < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo).getTime() + 86400000; // end of day
        if (l.timestamp > to) return false;
      }
      return true;
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-50 text-green-600';
      case 'update': return 'bg-blue-50 text-blue-600';
      case 'delete': return 'bg-red-50 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <h2 className="text-2xl font-black text-slate-900">Audit Log</h2>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-teal-500 outline-none transition-all"
          >
            <option value="">All Actions</option>
            {actions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-teal-500 outline-none transition-all"
          >
            <option value="">All Entities</option>
            {entityTypes.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500">From:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 focus:border-teal-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500">To:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 focus:border-teal-500 outline-none transition-all"
            />
          </div>
          {(actionFilter || entityFilter || dateFrom || dateTo) && (
            <button
              onClick={() => { setActionFilter(''); setEntityFilter(''); setDateFrom(''); setDateTo(''); }}
              className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-400 font-medium">No audit log entries found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">Timestamp</th>
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">User</th>
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">Action</th>
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">Entity Type</th>
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">Entity ID</th>
                  <th className="text-left rtl:text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{entry.userName || entry.userId}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getActionColor(entry.action)}`}>
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{entry.entityType}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded">{entry.entityId}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium max-w-[300px] truncate">
                      {entry.details || '-'}
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

export default AuditLogTable;
