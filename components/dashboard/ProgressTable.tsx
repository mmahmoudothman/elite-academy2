import React, { useState, useMemo } from 'react';
import { CourseProgress, Course, Student } from '../../types';
import { useLanguage } from '../LanguageContext';
import { getProgressColor, getProgressTextColor, getProgressBgColor } from '../../utils/progressCalculator';

interface ProgressTableProps {
  progress: CourseProgress[];
  courses: Course[];
  students?: Student[];
}

const ProgressTable: React.FC<ProgressTableProps> = ({ progress, courses, students = [] }) => {
  const getStudentName = (userId: string) => {
    const student = students.find(st => st.userId === userId || st.id === userId);
    return student?.name || userId;
  };
  const getStudentEmail = (userId: string) => {
    const student = students.find(st => st.userId === userId || st.id === userId);
    return student?.email || '';
  };
  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || courseId;
  };
  const { t } = useLanguage();
  const d = t.dashboard;

  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const uniqueCourses = useMemo(() => {
    const ids = [...new Set(progress.map(p => p.courseId))];
    const courseMap: Record<string, string> = {};
    courses.forEach(c => { courseMap[c.id] = c.title; });
    return ids.map(id => ({ id, title: courseMap[id] || id })).sort((a, b) => a.title.localeCompare(b.title));
  }, [progress, courses]);

  const filtered = useMemo(() => {
    return progress.filter(p => {
      const sName = getStudentName(p.userId);
      const sEmail = getStudentEmail(p.userId);
      if (search && !sName.toLowerCase().includes(search.toLowerCase()) && !sEmail.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCourse && p.courseId !== filterCourse) return false;
      return true;
    });
  }, [progress, search, filterCourse]);

  const overallStats = useMemo(() => {
    if (filtered.length === 0) return { avgCompletion: 0, topPerformers: 0, atRisk: 0 };
    const avgCompletion = Math.round(filtered.reduce((sum, p) => sum + p.overallCompletionPercent, 0) / filtered.length);
    const topPerformers = filtered.filter(p => p.overallCompletionPercent >= 80).length;
    const atRisk = filtered.filter(p => p.overallCompletionPercent < 50).length;
    return { avgCompletion, topPerformers, atRisk };
  }, [filtered]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <h2 className="text-2xl font-black text-slate-900">{d.progress_tab || 'Progress'}</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{overallStats.avgCompletion}%</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d.avg_completion || 'Avg Completion'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-600">{overallStats.topPerformers}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d.top_performers || 'Top Performers'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-black text-red-600">{overallStats.atRisk}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d.at_risk || 'At Risk'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder={d.search_students || 'Search by student name...'}
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
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-400 font-medium">{d.no_progress || 'No progress data found'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{d.col_student || 'Student'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden sm:table-cell">{d.col_course || 'Course'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden md:table-cell">{d.sessions_attended || 'Sessions'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden md:table-cell">{d.recordings_watched || 'Recordings'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden lg:table-cell">{d.quizzes_completed || 'Quizzes'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden lg:table-cell">{d.capstones_completed || 'Capstones'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{d.overall_progress || 'Overall'}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((prog) => (
                  <React.Fragment key={prog.id}>
                    <tr
                      className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(expandedId === prog.id ? null : prog.id)}
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 truncate max-w-[150px]">{getStudentName(prog.userId)}</p>
                        <p className="text-xs text-slate-400">{getStudentEmail(prog.userId)}</p>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="px-3 py-1 bg-[#0da993]/10 text-[#0da993] rounded-lg text-xs font-bold truncate max-w-[120px] inline-block">
                          {getCourseName(prog.courseId)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium hidden md:table-cell">
                        {prog.sessionsAttended}/{prog.totalSessions}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium hidden md:table-cell">
                        {prog.recordingsWatched}/{prog.totalRecordings}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium hidden lg:table-cell">
                        {prog.quizzesCompleted}/{prog.totalQuizzes} ({prog.quizAvgScore}%)
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium hidden lg:table-cell">
                        {prog.capstonesCompleted}/{prog.totalCapstones} ({prog.capstoneAvgScore}%)
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getProgressColor(prog.overallCompletionPercent)}`}
                              style={{ width: `${prog.overallCompletionPercent}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold ${getProgressTextColor(prog.overallCompletionPercent)}`}>
                            {prog.overallCompletionPercent}%
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Detail Row */}
                    {expandedId === prog.id && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl p-3 border border-slate-100">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.sessions_attended || 'Sessions Attended'}</p>
                              <p className="text-lg font-black text-slate-900">{prog.sessionsAttended}<span className="text-sm text-slate-400 font-medium">/{prog.totalSessions}</span></p>
                              <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                <div className={`h-full rounded-full ${getProgressColor(prog.totalSessions > 0 ? (prog.sessionsAttended / prog.totalSessions) * 100 : 0)}`} style={{ width: `${prog.totalSessions > 0 ? (prog.sessionsAttended / prog.totalSessions) * 100 : 0}%` }} />
                              </div>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-slate-100">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.recordings_watched || 'Recordings Watched'}</p>
                              <p className="text-lg font-black text-slate-900">{prog.recordingsWatched}<span className="text-sm text-slate-400 font-medium">/{prog.totalRecordings}</span></p>
                              <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                <div className={`h-full rounded-full ${getProgressColor(prog.totalRecordings > 0 ? (prog.recordingsWatched / prog.totalRecordings) * 100 : 0)}`} style={{ width: `${prog.totalRecordings > 0 ? (prog.recordingsWatched / prog.totalRecordings) * 100 : 0}%` }} />
                              </div>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-slate-100">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.quizzes_completed || 'Quizzes Completed'}</p>
                              <p className="text-lg font-black text-slate-900">{prog.quizzesCompleted}<span className="text-sm text-slate-400 font-medium">/{prog.totalQuizzes}</span></p>
                              <p className="text-xs text-slate-500 font-medium mt-0.5">{d.avg_score || 'Avg'}: {prog.quizAvgScore}%</p>
                              <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                <div className={`h-full rounded-full ${getProgressColor(prog.quizAvgScore)}`} style={{ width: `${prog.quizAvgScore}%` }} />
                              </div>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-slate-100">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.capstones_completed || 'Capstones Completed'}</p>
                              <p className="text-lg font-black text-slate-900">{prog.capstonesCompleted}<span className="text-sm text-slate-400 font-medium">/{prog.totalCapstones}</span></p>
                              <p className="text-xs text-slate-500 font-medium mt-0.5">{d.avg_score || 'Avg'}: {prog.capstoneAvgScore}%</p>
                              <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                <div className={`h-full rounded-full ${getProgressColor(prog.capstoneAvgScore)}`} style={{ width: `${prog.capstoneAvgScore}%` }} />
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getProgressBgColor(prog.overallCompletionPercent)} ${getProgressTextColor(prog.overallCompletionPercent)}`}>
                              {prog.overallCompletionPercent >= 80 ? (d.excellent || 'Excellent') :
                               prog.overallCompletionPercent >= 50 ? (d.good || 'Good') :
                               prog.overallCompletionPercent >= 25 ? (d.needs_improvement || 'Needs Improvement') :
                               (d.at_risk || 'At Risk')}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              {d.overall_progress || 'Overall'}: {prog.overallCompletionPercent}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTable;
