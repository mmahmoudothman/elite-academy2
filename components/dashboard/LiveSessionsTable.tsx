import React, { useState, useMemo } from 'react';
import { LiveSession, Course, Instructor } from '../../types';
import { useLanguage } from '../LanguageContext';

interface LiveSessionsTableProps {
  sessions: LiveSession[];
  courses: Course[];
  instructors?: Instructor[];
  onAdd?: () => void;
  onEdit?: (session: LiveSession) => void;
  onDelete?: (session: LiveSession) => void;
  onStartSession?: (session: LiveSession) => void;
  onEndSession?: (session: LiveSession) => void;
  onViewAttendance?: (session: LiveSession) => void;
}

const LiveSessionsTable: React.FC<LiveSessionsTableProps> = ({
  sessions, courses, instructors = [], onAdd, onEdit, onDelete, onStartSession, onEndSession, onViewAttendance
}) => {
  const { t } = useLanguage();
  const d = t.dashboard;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [courseFilter, setCourseFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter && s.status !== statusFilter) return false;
      if (courseFilter && s.courseId !== courseFilter) return false;
      if (dateFrom) {
        const from = new Date(dateFrom).getTime();
        if (s.scheduledStartTime < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo).getTime() + 86400000;
        if (s.scheduledStartTime > to) return false;
      }
      return true;
    });
  }, [sessions, search, statusFilter, courseFilter, dateFrom, dateTo]);

  const statusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">{d.session_scheduled}</span>;
      case 'live':
        return (
          <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {d.session_live}
          </span>
        );
      case 'ended':
        return <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold">{d.session_ended}</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold">{d.session_cancelled}</span>;
      default:
        return null;
    }
  };

  const platformLabel = (platform: string) => {
    switch (platform) {
      case 'jitsi': return d.jitsi_meet;
      case 'google_meet': return d.google_meet;
      case 'youtube_live': return d.youtube_live;
      case 'external_link': return d.external_link;
      default: return platform;
    }
  };

  const formatDateTime = (ts: number) => {
    return new Date(ts).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-900">{d.sessions_tab}</h2>
        {onAdd && (
          <button
            onClick={onAdd}
            className="bg-[#0da993] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0da993]/90 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {d.schedule_session}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder={d.search_enrollments}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-[#0da993] transition-all"
          />
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-[#0da993] transition-all"
          >
            <option value="">{d.all_courses}</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-[#0da993] transition-all"
          >
            <option value="">{d.all_statuses}</option>
            <option value="scheduled">{d.session_scheduled}</option>
            <option value="live">{d.session_live}</option>
            <option value="ended">{d.session_ended}</option>
            <option value="cancelled">{d.session_cancelled}</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder={d.date_from}
            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-[#0da993] transition-all"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder={d.date_to}
            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-[#0da993] transition-all"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-400 font-medium">{d.no_sessions}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{d.session_title}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden sm:table-cell">{d.col_course}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden md:table-cell">{d.col_instructor}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden lg:table-cell">{d.col_date}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{d.session_status}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden md:table-cell">{d.session_platform}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{d.col_actions}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((session) => (
                  <tr key={session.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 max-w-[200px] truncate">{session.title}</td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="px-3 py-1 bg-[#0da993]/10 text-[#0da993] rounded-lg text-xs font-bold">{courses.find(c => c.id === session.courseId)?.title || session.courseId}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium hidden md:table-cell">{instructors.find(i => i.id === session.instructorId)?.name || session.instructorId}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium hidden lg:table-cell text-xs">
                      {formatDateTime(session.scheduledStartTime)}
                    </td>
                    <td className="px-6 py-4">{statusBadge(session.status)}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium hidden md:table-cell text-xs">
                      {platformLabel(session.platform)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {session.status === 'scheduled' && onStartSession && (
                          <button
                            onClick={() => onStartSession(session)}
                            className="px-2 py-1 text-xs font-bold text-green-600 hover:bg-green-50 rounded-lg transition-all"
                            title={d.start_session}
                          >
                            {d.start_session}
                          </button>
                        )}
                        {session.status === 'live' && onEndSession && (
                          <button
                            onClick={() => onEndSession(session)}
                            className="px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title={d.end_session}
                          >
                            {d.end_session}
                          </button>
                        )}
                        {onViewAttendance && (
                          <button
                            onClick={() => onViewAttendance(session)}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#3d66f1] hover:bg-[#3d66f1]/10 rounded-lg transition-all"
                            title={d.view_attendance}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(session)}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#0da993] hover:bg-[#0da993]/10 rounded-lg transition-all"
                            title={d.edit_action || 'Edit'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(session)}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title={d.delete || 'Delete'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
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

export default LiveSessionsTable;
