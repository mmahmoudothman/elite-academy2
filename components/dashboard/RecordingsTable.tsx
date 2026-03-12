import React, { useState, useMemo } from 'react';
import { Recording, Course, StudentGroup } from '../../types';
import { useLanguage } from '../LanguageContext';

interface RecordingsTableProps {
  recordings: Recording[];
  courses: Course[];
  groups: StudentGroup[];
  onAdd?: () => void;
  onEdit?: (recording: Recording) => void;
  onDelete?: (recording: Recording) => void;
  onPreview?: (recording: Recording) => void;
}

const RecordingsTable: React.FC<RecordingsTableProps> = ({ recordings, courses, groups, onAdd, onEdit, onDelete, onPreview }) => {
  const { t } = useLanguage();
  const d = t.dashboard;
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('');

  const filtered = useMemo(() => {
    return recordings.filter(r => {
      if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCourse && r.courseId !== filterCourse) return false;
      if (filterType && r.storageType !== filterType) return false;
      if (filterVisibility && r.visibility !== filterVisibility) return false;
      return true;
    });
  }, [recordings, search, filterCourse, filterType, filterVisibility]);

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || courseId;
  };

  const getStatusBadge = (status: Recording['processingStatus']) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      uploading: { bg: 'bg-amber-50', text: 'text-amber-600', label: d.uploading || 'Uploading' },
      processing: { bg: 'bg-blue-50', text: 'text-blue-600', label: d.processing_status || 'Processing' },
      ready: { bg: 'bg-green-50', text: 'text-green-600', label: d.ready || 'Ready' },
      failed: { bg: 'bg-red-50', text: 'text-red-600', label: d.failed || 'Failed' },
    };
    const s = map[status] || map.ready;
    return <span className={`px-3 py-1 rounded-lg text-xs font-bold ${s.bg} ${s.text}`}>{s.label}</span>;
  };

  const getTypeBadge = (type: Recording['storageType']) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      firebase_storage: { bg: 'bg-orange-50', text: 'text-orange-600', label: d.firebase_storage || 'Upload File' },
      youtube_unlisted: { bg: 'bg-red-50', text: 'text-red-600', label: d.youtube_url || 'YouTube' },
      external_url: { bg: 'bg-purple-50', text: 'text-purple-600', label: d.external_url || 'External' },
    };
    const s = map[type] || map.external;
    return <span className={`px-3 py-1 rounded-lg text-xs font-bold ${s.bg} ${s.text}`}>{s.label}</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-900">{d.recordings_tab || 'Recordings'}</h2>
        {onAdd && (
          <button
            onClick={onAdd}
            className="bg-[#0da993] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0da993]/90 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {d.upload_recording || 'Upload Recording'}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder={d.search_recordings || 'Search recordings...'}
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
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-[#0da993] focus:bg-white outline-none transition-all"
        >
          <option value="">{d.all_types || 'All Types'}</option>
          <option value="firebase_storage">{d.firebase_storage || 'Upload File'}</option>
          <option value="youtube_unlisted">{d.youtube_url || 'YouTube'}</option>
          <option value="external_url">{d.external_url || 'External'}</option>
        </select>
        <select
          value={filterVisibility}
          onChange={(e) => setFilterVisibility(e.target.value)}
          className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-[#0da993] focus:bg-white outline-none transition-all"
        >
          <option value="">{d.all_visibility || 'All Visibility'}</option>
          <option value="enrolled_only">{d.enrolled_only || 'Enrolled Only'}</option>
          <option value="public">{d.public_visibility || 'Public'}</option>
          <option value="unlisted">{d.unlisted_visibility || 'Unlisted'}</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-400 font-medium">{d.no_recordings || 'No recordings found'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{d.recording_title || 'Title'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden sm:table-cell">{d.col_course || 'Course'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden md:table-cell">{d.storage_type || 'Type'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden md:table-cell">{d.field_duration || 'Duration'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden sm:table-cell">{d.processing_status || 'Status'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hidden lg:table-cell">{d.view_count || 'Views'}</th>
                  <th className="text-start px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-400">{d.col_actions || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((recording) => (
                  <tr key={recording.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 max-w-[200px] truncate">{recording.title}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium hidden sm:table-cell">{getCourseName(recording.courseId)}</td>
                    <td className="px-6 py-4 hidden md:table-cell">{getTypeBadge(recording.storageType)}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium hidden md:table-cell">{recording.durationSeconds ? `${Math.floor(recording.durationSeconds / 60)}:${(recording.durationSeconds % 60).toString().padStart(2, '0')}` : '-'}</td>
                    <td className="px-6 py-4 hidden sm:table-cell">{getStatusBadge(recording.processingStatus)}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium hidden lg:table-cell">{recording.viewCount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {onPreview && (
                          <button
                            onClick={() => onPreview(recording)}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#3d66f1] hover:bg-[#3d66f1]/10 rounded-lg transition-all"
                            title={d.preview || 'Preview'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(recording)}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#0da993] hover:bg-[#0da993]/10 rounded-lg transition-all"
                            title={d.edit || 'Edit'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(recording)}
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

export default RecordingsTable;
