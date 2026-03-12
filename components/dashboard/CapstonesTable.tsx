import React, { useState, useMemo } from 'react';
import { Capstone, CapstoneSubmission, Course, CapstoneStatus } from '../../types';
import { useLanguage } from '../LanguageContext';

interface CapstonesTableProps {
  capstones: Capstone[];
  submissions: CapstoneSubmission[];
  courses: Course[];
  onAdd?: () => void;
  onEdit?: (capstone: Capstone) => void;
  onDelete?: (capstone: Capstone) => void;
  onViewSubmissions?: (capstone: Capstone) => void;
  onPublish?: (capstone: Capstone) => void;
  onClose?: (capstone: Capstone) => void;
}

const CapstonesTable: React.FC<CapstonesTableProps> = ({
  capstones, submissions, courses, onAdd, onEdit, onDelete, onViewSubmissions, onPublish, onClose,
}) => {
  const { t } = useLanguage();
  const d = t.dashboard;

  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterStatus, setFilterStatus] = useState<CapstoneStatus | ''>('');

  const courseMap = useMemo(() => {
    const map: Record<string, string> = {};
    courses.forEach(c => { map[c.id] = c.title; });
    return map;
  }, [courses]);

  const submissionsByCapstone = useMemo(() => {
    const map: Record<string, CapstoneSubmission[]> = {};
    submissions.forEach(s => {
      if (!map[s.capstoneId]) map[s.capstoneId] = [];
      map[s.capstoneId].push(s);
    });
    return map;
  }, [submissions]);

  const filtered = useMemo(() => {
    return capstones.filter(c => {
      if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCourse && c.courseId !== filterCourse) return false;
      if (filterStatus && c.status !== filterStatus) return false;
      return true;
    });
  }, [capstones, search, filterCourse, filterStatus]);

  const getStatusBadge = (status: CapstoneStatus) => {
    switch (status) {
      case 'draft':
        return <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold">{d.draft || 'Draft'}</span>;
      case 'published':
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">{d.active_status || 'Published'}</span>;
      case 'closed':
        return <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold">{d.closed || 'Closed'}</span>;
    }
  };

  const getAvgScore = (capstoneId: string, maxScore: number): string => {
    const subs = submissionsByCapstone[capstoneId] || [];
    const graded = subs.filter(s => s.status === 'graded' && s.score != null);
    if (graded.length === 0) return '-';
    const avg = graded.reduce((sum, s) => sum + (s.score || 0), 0) / graded.length;
    return `${Math.round(avg)}/${maxScore}`;
  };

  const uniqueCourses = useMemo(() => {
    const ids = [...new Set(capstones.map(c => c.courseId))];
    return ids.map(id => ({ id, title: courseMap[id] || id })).sort((a, b) => a.title.localeCompare(b.title));
  }, [capstones, courseMap]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <h2 className="text-2xl font-black text-slate-900">{d.capstones_tab || 'Capstones'}</h2>
        {onAdd && (
          <button
            onClick={onAdd}
            className="bg-[#0da993] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0da993]/90 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {d.create_capstone || 'Create Capstone'}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder={d.search_capstones || 'Search capstones...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-[#0da993] transition-all"
        />
        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-[#0da993] transition-all"
        >
          <option value="">{d.all_courses || 'All Courses'}</option>
          {uniqueCourses.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as CapstoneStatus | '')}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-[#0da993] transition-all"
        >
          <option value="">{d.all_statuses || 'All Statuses'}</option>
          <option value="draft">{d.draft || 'Draft'}</option>
          <option value="published">{d.active_status || 'Published'}</option>
          <option value="closed">{d.closed || 'Closed'}</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-400 font-medium">{d.no_capstones || 'No capstones found'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{d.col_title || 'Title'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden sm:table-cell">{d.col_course || 'Course'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden md:table-cell">{d.due_date || 'Due Date'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{d.col_status || 'Status'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden md:table-cell">{d.submissions_label || 'Submissions'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden lg:table-cell">{d.avg_score || 'Avg Score'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{d.col_actions || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((capstone) => {
                  const subs = submissionsByCapstone[capstone.id] || [];
                  return (
                    <tr key={capstone.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 max-w-[200px] truncate">{capstone.title}</td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="px-3 py-1 bg-[#0da993]/10 text-[#0da993] rounded-lg text-xs font-bold">
                          {courseMap[capstone.courseId] || capstone.courseId}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium hidden md:table-cell">
                        {capstone.dueDate ? new Date(capstone.dueDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(capstone.status)}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium hidden md:table-cell">{subs.length}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium hidden lg:table-cell">
                        {getAvgScore(capstone.id, capstone.maxScore)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(capstone)}
                              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#0da993] hover:bg-[#0da993]/10 rounded-lg transition-all"
                              title={d.edit || 'Edit'}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                          {onViewSubmissions && (
                            <button
                              onClick={() => onViewSubmissions(capstone)}
                              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#3d66f1] hover:bg-[#3d66f1]/10 rounded-lg transition-all"
                              title={d.view_submissions || 'View Submissions'}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                              </svg>
                            </button>
                          )}
                          {onPublish && capstone.status === 'draft' && (
                            <button
                              onClick={() => onPublish(capstone)}
                              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                              title={d.publish || 'Publish'}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                          {onClose && capstone.status === 'published' && (
                            <button
                              onClick={() => onClose(capstone)}
                              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                              title={d.close_capstone || 'Close'}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(capstone)}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CapstonesTable;
