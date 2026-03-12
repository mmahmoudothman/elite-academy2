import React, { useState, useMemo, useCallback } from 'react';
import { Student, StudentGroup, Instructor, Course, Enrollment } from '../../types';
import { useLanguage } from '../LanguageContext';
import { exportToCsv } from '../../utils/exportCsv';
import EmptyState from '../ui/EmptyState';

interface StudentsTableProps {
  students: Student[];
  groups: StudentGroup[];
  instructors: Instructor[];
  courses: Course[];
  enrollments: Enrollment[];
  onAdd?: () => void;
  onView?: (student: Student) => void;
  onToggleActive?: (student: Student) => void;
  onUpdateStudent?: (id: string, data: Partial<Student>) => void;
  onDelete?: (student: Student) => void;
}

type SortField = 'name' | 'email' | 'country' | 'createdAt' | 'lifecycleStage' | 'level';
type SortDir = 'asc' | 'desc';

const LIFECYCLE_STAGES = ['lead', 'prospect', 'enrolled', 'active', 'alumni', 'inactive'] as const;
const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

const STAGE_COLORS: Record<string, string> = {
  lead: 'bg-blue-100 text-blue-700',
  prospect: 'bg-purple-100 text-purple-700',
  enrolled: 'bg-teal-100 text-teal-700',
  active: 'bg-emerald-100 text-emerald-700',
  alumni: 'bg-amber-100 text-amber-700',
  inactive: 'bg-slate-100 text-slate-500',
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-purple-100 text-purple-700',
};

const StudentsTable: React.FC<StudentsTableProps> = ({
  students, groups, instructors, courses, enrollments,
  onAdd, onView, onToggleActive, onUpdateStudent, onDelete,
}) => {
  const { t, language } = useLanguage();
  const d = t.dashboard;
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Filters
  const [stageFilter, setStageFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [instructorFilter, setInstructorFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Sort
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');

  // Delete confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const stageLabels: Record<string, string> = {
    lead: d.stage_lead, prospect: d.stage_prospect, enrolled: d.stage_enrolled,
    active: d.stage_active, alumni: d.stage_alumni, inactive: d.stage_inactive,
  };

  const levelLabels: Record<string, string> = {
    beginner: d.level_beginner, intermediate: d.level_intermediate, advanced: d.level_advanced,
  };

  const countryLabels: Record<string, string> = {
    EG: d.country_eg, SA: d.country_sa, AE: d.country_ae, KW: d.country_kw,
    QA: d.country_qa, BH: d.country_bh, OM: d.country_om, JO: d.country_jo, Other: d.country_other,
  };

  const enrollmentCounts = useMemo(() => {
    const map: Record<string, number> = {};
    enrollments.forEach(e => { map[e.studentId] = (map[e.studentId] || 0) + 1; });
    return map;
  }, [enrollments]);

  const countries = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => { if (s.country) set.add(s.country); });
    return Array.from(set).sort();
  }, [students]);

  const getInstructorName = (id?: string) => {
    if (!id) return '';
    return instructors.find(i => i.id === id)?.name || '';
  };

  const getGroupName = (id: string) => {
    const g = groups.find(grp => grp.id === id);
    if (!g) return id;
    return language === 'ar' ? g.name.ar : g.name.en;
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.phone || '').includes(q) ||
        (s.tags || []).some(tag => tag.toLowerCase().includes(q));
      const matchStage = !stageFilter || s.lifecycleStage === stageFilter;
      const matchLevel = !levelFilter || s.level === levelFilter;
      const matchCountry = !countryFilter || s.country === countryFilter;
      const matchGroup = !groupFilter || s.groupIds.includes(groupFilter);
      const matchInstructor = !instructorFilter || s.assignedInstructorId === instructorFilter;
      const matchCourse = !courseFilter || s.enrolledCourseIds.includes(courseFilter);
      const matchStatus = !statusFilter ||
        (statusFilter === 'active' && s.isActive) ||
        (statusFilter === 'inactive' && !s.isActive);
      return matchSearch && matchStage && matchLevel && matchCountry && matchGroup && matchInstructor && matchCourse && matchStatus;
    });
  }, [students, search, stageFilter, levelFilter, countryFilter, groupFilter, instructorFilter, courseFilter, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'email': cmp = a.email.localeCompare(b.email); break;
        case 'country': cmp = (a.country || '').localeCompare(b.country || ''); break;
        case 'createdAt': cmp = a.createdAt - b.createdAt; break;
        case 'lifecycleStage': cmp = a.lifecycleStage.localeCompare(b.lifecycleStage); break;
        case 'level': cmp = a.level.localeCompare(b.level); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(sorted.length / pageSize);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  }, [sortField]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds(prev => prev.size === paged.length ? new Set() : new Set(paged.map(s => s.id)));
  }, [paged]);

  const handleBulkAction = useCallback(() => {
    if (!bulkAction || selectedIds.size === 0) return;
    const selected = students.filter(s => selectedIds.has(s.id));
    if (bulkAction === 'export') {
      exportToCsv('students_selected',
        [d.col_name, d.email, d.phone, d.country, d.level, d.stage, d.groups, d.active, d.joined],
        selected.map(s => [
          s.name, s.email, s.phone || '', s.country || '',
          s.level, s.lifecycleStage, s.groupIds.map(getGroupName).join(', '),
          s.isActive ? d.active : d.inactive, new Date(s.createdAt).toLocaleDateString()
        ])
      );
    } else if (bulkAction === 'activate' && onUpdateStudent) {
      selected.forEach(s => onUpdateStudent(s.id, { isActive: true }));
    } else if (bulkAction === 'deactivate' && onUpdateStudent) {
      selected.forEach(s => onUpdateStudent(s.id, { isActive: false }));
    } else if (LIFECYCLE_STAGES.includes(bulkAction as any) && onUpdateStudent) {
      selected.forEach(s => onUpdateStudent(s.id, { lifecycleStage: bulkAction as any }));
    } else if (bulkAction.startsWith('group:') && onUpdateStudent) {
      const gid = bulkAction.replace('group:', '');
      selected.forEach(s => {
        if (!s.groupIds.includes(gid)) {
          onUpdateStudent(s.id, { groupIds: [...s.groupIds, gid] });
        }
      });
    }
    setBulkAction('');
    setSelectedIds(new Set());
  }, [bulkAction, selectedIds, students, onUpdateStudent]);

  const activeFilterCount = [stageFilter, levelFilter, countryFilter, groupFilter, instructorFilter, courseFilter, statusFilter].filter(Boolean).length;

  const clearFilters = () => {
    setStageFilter(''); setLevelFilter(''); setCountryFilter('');
    setGroupFilter(''); setInstructorFilter(''); setCourseFilter('');
    setStatusFilter(''); setSearch(''); setPage(0);
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => (
    <span className="inline-block ms-1">
      {sortField === field ? (
        sortDir === 'asc'
          ? <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          : <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      ) : (
        <svg className="w-3 h-3 inline opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
      )}
    </span>
  );

  if (students.length === 0 && !onAdd) {
    return <EmptyState title={d.no_students} description={d.no_students_desc} />;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-black text-slate-900">{d.students_tab}</h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{students.length}</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder={d.search_students}
            className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" />
          {onAdd && (
            <button onClick={onAdd} className="flex-shrink-0 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              <span className="hidden sm:inline">{d.add_student}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-4 sm:px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-2">
        <select value={groupFilter} onChange={e => { setGroupFilter(e.target.value); setPage(0); }}
          className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">{d.all_groups}</option>
          {groups.map(g => <option key={g.id} value={g.id}>{language === 'ar' ? g.name.ar : g.name.en}</option>)}
        </select>
        <select value={courseFilter} onChange={e => { setCourseFilter(e.target.value); setPage(0); }}
          className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">{d.all_courses}</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <select value={instructorFilter} onChange={e => { setInstructorFilter(e.target.value); setPage(0); }}
          className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">{d.all_instructors}</option>
          {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
        <select value={levelFilter} onChange={e => { setLevelFilter(e.target.value); setPage(0); }}
          className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">{d.all_levels}</option>
          {LEVELS.map(l => <option key={l} value={l}>{levelLabels[l]}</option>)}
        </select>
        <select value={stageFilter} onChange={e => { setStageFilter(e.target.value); setPage(0); }}
          className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">{d.all_stages}</option>
          {LIFECYCLE_STAGES.map(s => <option key={s} value={s}>{stageLabels[s]}</option>)}
        </select>
        <select value={countryFilter} onChange={e => { setCountryFilter(e.target.value); setPage(0); }}
          className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">{d.all_countries}</option>
          {countries.map(c => <option key={c} value={c}>{countryLabels[c] || c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">{d.all_status}</option>
          <option value="active">{d.active}</option>
          <option value="inactive">{d.inactive}</option>
        </select>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:text-red-600 px-2 py-1">
            {d.clear} ({activeFilterCount})
          </button>
        )}
        <span className="text-xs font-bold text-slate-400 ms-auto">
          {sorted.length} {d.of} {students.length}
        </span>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="px-4 sm:px-6 py-3 border-b border-slate-100 bg-teal-50 flex flex-wrap items-center gap-3">
          <span className="text-xs font-black text-teal-700">{selectedIds.size} {d.selected}</span>
          <select value={bulkAction} onChange={e => setBulkAction(e.target.value)}
            className="text-xs font-bold bg-white border border-teal-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">{d.bulk_actions}</option>
            <option value="export">{d.bulk_export}</option>
            <optgroup label={d.bulk_change_status}>
              <option value="activate">{d.set_active}</option>
              <option value="deactivate">{d.set_inactive}</option>
            </optgroup>
            <optgroup label={d.change_stage}>
              {LIFECYCLE_STAGES.map(s => <option key={s} value={s}>{d.stage}: {stageLabels[s]}</option>)}
            </optgroup>
            {groups.length > 0 && (
              <optgroup label={d.bulk_add_to_group}>
                {groups.map(g => <option key={g.id} value={`group:${g.id}`}>{language === 'ar' ? g.name.ar : g.name.en}</option>)}
              </optgroup>
            )}
          </select>
          <button onClick={handleBulkAction} disabled={!bulkAction}
            className="text-xs font-black text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-all">{d.apply_action}</button>
          <button onClick={() => setSelectedIds(new Set())} className="text-xs font-bold text-slate-500 hover:text-slate-700">{d.clear}</button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr className="text-start">
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={paged.length > 0 && selectedIds.size === paged.length} onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
              </th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer select-none hover:text-slate-600" onClick={() => handleSort('name')}>
                {d.col_name}<SortIcon field="name" />
              </th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer select-none hover:text-slate-600 hidden sm:table-cell" onClick={() => handleSort('email')}>
                {d.email}<SortIcon field="email" />
              </th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden lg:table-cell">{d.groups}</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden md:table-cell cursor-pointer select-none hover:text-slate-600" onClick={() => handleSort('level')}>
                {d.level}<SortIcon field="level" />
              </th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden lg:table-cell cursor-pointer select-none hover:text-slate-600" onClick={() => handleSort('lifecycleStage')}>
                {d.stage}<SortIcon field="lifecycleStage" />
              </th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden md:table-cell">{d.instructor}</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{d.status}</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{d.col_actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paged.map(student => (
              <tr key={student.id} className={`hover:bg-slate-50/50 transition-colors ${selectedIds.has(student.id) ? 'bg-teal-50/30' : ''}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedIds.has(student.id)} onChange={() => toggleSelect(student.id)}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 font-bold text-xs flex-shrink-0">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-sm text-slate-900 truncate block max-w-[150px]">{student.name}</span>
                      {student.phone && <span className="text-[10px] text-slate-400 block truncate">{student.phone}</span>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 truncate max-w-[160px] hidden sm:table-cell">{student.email}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {student.groupIds.length > 0 ? student.groupIds.slice(0, 2).map(gid => {
                      const grp = groups.find(g => g.id === gid);
                      return grp ? (
                        <span key={gid} className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white truncate max-w-[80px]"
                          style={{ backgroundColor: grp.color }}>{language === 'ar' ? grp.name.ar : grp.name.en}</span>
                      ) : null;
                    }) : <span className="text-xs text-slate-300">-</span>}
                    {student.groupIds.length > 2 && <span className="text-[10px] text-slate-400">+{student.groupIds.length - 2}</span>}
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${LEVEL_COLORS[student.level] || 'bg-slate-100 text-slate-500'}`}>
                    {levelLabels[student.level]}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${STAGE_COLORS[student.lifecycleStage] || 'bg-slate-100 text-slate-500'}`}>
                    {stageLabels[student.lifecycleStage]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600 truncate max-w-[100px] hidden md:table-cell">
                  {getInstructorName(student.assignedInstructorId) || '-'}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${student.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {student.isActive ? d.active : d.inactive}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {onView && (
                      <button onClick={() => onView(student)} className="text-teal-600 hover:text-teal-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                    )}
                    {onToggleActive && (
                      <button onClick={() => onToggleActive(student)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={student.isActive ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'} /></svg>
                      </button>
                    )}
                    {onDelete && (
                      deleteConfirmId === student.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => { onDelete(student); setDeleteConfirmId(null); }} className="text-[10px] font-bold bg-red-600 text-white px-2 py-1 rounded-lg">{d.confirm}</button>
                          <button onClick={() => setDeleteConfirmId(null)} className="text-[10px] font-bold text-slate-500 px-2 py-1">{d.cancel}</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirmId(student.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">{page * pageSize + 1}-{Math.min((page + 1) * pageSize, sorted.length)} / {sorted.length}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-all">{d.prev}</button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-all">{d.next_page}</button>
          </div>
        </div>
      )}

      {filtered.length === 0 && students.length > 0 && (
        <div className="p-8 text-center">
          <p className="text-sm text-slate-400">{d.no_match}</p>
          <button onClick={clearFilters} className="mt-2 text-sm font-bold text-teal-600 hover:text-teal-700">{d.clear_all_filters}</button>
        </div>
      )}
    </div>
  );
};

export default StudentsTable;
