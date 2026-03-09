import React, { useState, useMemo } from 'react';
import { StudentGroup, Instructor, Course } from '../../types';
import { useLanguage } from '../LanguageContext';
import EmptyState from '../ui/EmptyState';

interface GroupsTableProps {
  groups: StudentGroup[];
  instructors: Instructor[];
  courses: Course[];
  onAdd?: () => void;
  onEdit?: (group: StudentGroup) => void;
  onDelete?: (group: StudentGroup) => void;
  onToggleActive?: (group: StudentGroup) => void;
}

const GroupsTable: React.FC<GroupsTableProps> = ({ groups, instructors, courses, onAdd, onEdit, onDelete, onToggleActive }) => {
  const { language, t } = useLanguage();
  const d = t.dashboard;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [instructorFilter, setInstructorFilter] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return groups.filter(g => {
      const name = language === 'ar' ? g.name.ar : g.name.en;
      const matchSearch = name.toLowerCase().includes(q);
      const matchStatus = !statusFilter || (statusFilter === 'active' ? g.isActive : !g.isActive);
      const matchCourse = !courseFilter || g.courseId === courseFilter;
      const matchInstructor = !instructorFilter || g.instructorId === instructorFilter;
      return matchSearch && matchStatus && matchCourse && matchInstructor;
    });
  }, [groups, search, statusFilter, courseFilter, instructorFilter, language]);

  const getInstructorName = (id?: string) => {
    if (!id) return '-';
    return instructors.find(i => i.id === id)?.name || '-';
  };

  const getCourseName = (id?: string) => {
    if (!id) return '-';
    return courses.find(c => c.id === id)?.title || '-';
  };

  if (groups.length === 0 && !onAdd) {
    return <EmptyState title={d.no_groups} description={d.no_groups_desc} />;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100">
        <h3 className="text-lg font-black text-slate-900">{d.groups_tab}</h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={d.search_groups} className="w-full sm:w-56 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" />
          {onAdd && (
            <button onClick={onAdd} className="flex-shrink-0 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              <span className="hidden sm:inline">{d.add_group}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-3">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">{d.all_status}</option>
          <option value="active">{d.active}</option>
          <option value="inactive">{d.inactive}</option>
        </select>
        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)}
          className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">{d.all_courses}</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <select value={instructorFilter} onChange={e => setInstructorFilter(e.target.value)}
          className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">{d.all_instructors}</option>
          {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
        <span className="text-xs font-bold text-slate-400 ms-auto">
          {filtered.length} {d.of} {groups.length} {d.groups_label}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr className="text-left rtl:text-right">
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{d.groups_tab}</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:table-cell">{d.course}</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden md:table-cell">{d.instructor}</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{d.students_tab}</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden lg:table-cell">{d.schedule}</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{d.status}</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{d.col_actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(group => {
              const name = language === 'ar' ? group.name.ar : group.name.en;
              return (
                <tr key={group.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: group.color || '#0d9488' }}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-900">{name}</span>
                        {group.capacity && (
                          <p className="text-[10px] text-slate-400">{d.capacity}: {group.capacity}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 truncate max-w-[150px] hidden sm:table-cell">{getCourseName(group.courseId)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 truncate max-w-[150px] hidden md:table-cell">{getInstructorName(group.instructorId)}</td>
                  <td className="px-4 py-3">
                    <span className="bg-teal-50 text-teal-600 text-xs font-bold px-2 py-1 rounded-lg">
                      {group.studentCount}{group.capacity ? `/${group.capacity}` : ''}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">{group.schedule || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${group.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {group.isActive ? d.active : d.inactive}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {onEdit && (
                        <button onClick={() => onEdit(group)} className="text-teal-600 hover:text-teal-700 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                      )}
                      {onToggleActive && (
                        <button onClick={() => onToggleActive(group)} className="text-slate-400 hover:text-slate-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={group.isActive ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'} /></svg>
                        </button>
                      )}
                      {onDelete && (
                        deleteConfirmId === group.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => { onDelete(group); setDeleteConfirmId(null); }} className="text-[10px] font-bold bg-red-600 text-white px-2 py-1 rounded-lg">{d.confirm}</button>
                            <button onClick={() => setDeleteConfirmId(null)} className="text-[10px] font-bold text-slate-500 px-2 py-1">{d.cancel}</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirmId(group.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-sm text-slate-400">{d.no_match}</p>
          {onAdd && <button onClick={onAdd} className="mt-3 text-sm font-bold text-teal-600 hover:text-teal-700">{d.create_first_group}</button>}
        </div>
      )}
    </div>
  );
};

export default GroupsTable;
