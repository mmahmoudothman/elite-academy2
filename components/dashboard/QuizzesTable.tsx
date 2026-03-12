import React, { useState, useMemo } from 'react';
import { Quiz, Course } from '../../types';
import { useLanguage } from '../LanguageContext';

interface QuizzesTableProps {
  quizzes: Quiz[];
  courses: Course[];
  onAdd?: () => void;
  onEdit?: (quiz: Quiz) => void;
  onEditQuestions?: (quiz: Quiz) => void;
  onViewSubmissions?: (quiz: Quiz) => void;
  onPublish?: (quiz: Quiz) => void;
  onClose?: (quiz: Quiz) => void;
  onDelete?: (quiz: Quiz) => void;
}

const QuizzesTable: React.FC<QuizzesTableProps> = ({
  quizzes, courses, onAdd, onEdit, onEditQuestions, onViewSubmissions, onPublish, onClose, onDelete,
}) => {
  const { t } = useLanguage();
  const d = t.dashboard;
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = useMemo(() => {
    return quizzes.filter(q => {
      if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCourse && q.courseId !== filterCourse) return false;
      if (filterStatus && q.status !== filterStatus) return false;
      return true;
    });
  }, [quizzes, search, filterCourse, filterStatus]);

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || courseId;
  };

  const getStatusBadge = (status: Quiz['status']) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      draft: { bg: 'bg-slate-100', text: 'text-slate-500', label: d.draft || 'Draft' },
      published: { bg: 'bg-green-50', text: 'text-green-600', label: d.published || 'Published' },
      closed: { bg: 'bg-red-50', text: 'text-red-600', label: d.closed || 'Closed' },
    };
    const s = map[status] || map.draft;
    return <span className={`px-3 py-1 rounded-lg text-xs font-bold ${s.bg} ${s.text}`}>{s.label}</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-900">{d.quizzes_tab || 'Quizzes'}</h2>
        {onAdd && (
          <button
            onClick={onAdd}
            className="bg-[#0da993] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0da993]/90 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {d.create_quiz || 'Create Quiz'}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder={d.search_quizzes || 'Search quizzes...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-[#0da993] focus:bg-white outline-none transition-all min-w-[200px]"
        />
        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-[#0da993] focus:bg-white outline-none transition-all"
        >
          <option value="">{d.filter_all_courses || 'All Courses'}</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-[#0da993] focus:bg-white outline-none transition-all"
        >
          <option value="">{d.filter_all_statuses || 'All Statuses'}</option>
          <option value="draft">{d.draft || 'Draft'}</option>
          <option value="published">{d.published || 'Published'}</option>
          <option value="closed">{d.closed || 'Closed'}</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-400 font-medium">{d.no_quizzes || 'No quizzes found'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{d.quiz_title || 'Title'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden sm:table-cell">{d.col_course || 'Course'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden md:table-cell">{d.questions_count || 'Questions'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden md:table-cell">{d.time_limit || 'Time Limit'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden sm:table-cell">{d.col_status || 'Status'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden lg:table-cell">{d.submissions || 'Submissions'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden lg:table-cell">{d.avg_score || 'Avg Score'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{d.col_actions || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((quiz) => (
                  <tr key={quiz.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 max-w-[200px] truncate">{quiz.title}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium hidden sm:table-cell">{getCourseName(quiz.courseId)}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium hidden md:table-cell">{quiz.questionCount}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium hidden md:table-cell">
                      {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : '-'}
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">{getStatusBadge(quiz.status)}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium hidden lg:table-cell">{0 /* submissionCount not on Quiz */}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium hidden lg:table-cell">
                      {0 /* submissionCount not on Quiz */ > 0 ? `${Math.round(0 /* avgScore not on Quiz */)}%` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(quiz)}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#0da993] hover:bg-[#0da993]/10 rounded-lg transition-all"
                            title={d.edit || 'Edit'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        {onEditQuestions && (
                          <button
                            onClick={() => onEditQuestions(quiz)}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#3d66f1] hover:bg-[#3d66f1]/10 rounded-lg transition-all"
                            title={d.edit_questions || 'Edit Questions'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                          </button>
                        )}
                        {onViewSubmissions && (
                          <button
                            onClick={() => onViewSubmissions(quiz)}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-all"
                            title={d.submissions || 'Submissions'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </button>
                        )}
                        {quiz.status === 'draft' && onPublish && (
                          <button
                            onClick={() => onPublish(quiz)}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all"
                            title={d.publish || 'Publish'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        {quiz.status === 'published' && onClose && (
                          <button
                            onClick={() => onClose(quiz)}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                            title={d.close_quiz || 'Close'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(quiz)}
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

export default QuizzesTable;
