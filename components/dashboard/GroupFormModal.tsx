import React, { useState, useEffect } from 'react';
import { StudentGroup, Instructor, Course } from '../../types';
import { useLanguage } from '../LanguageContext';

interface GroupFormModalProps {
  isOpen: boolean;
  group?: StudentGroup | null;
  instructors: Instructor[];
  courses: Course[];
  onClose: () => void;
  onSave: (data: Omit<StudentGroup, 'id'>) => void;
}

const GROUP_COLORS = [
  '#0d9488', '#2563eb', '#7c3aed', '#db2777', '#ea580c',
  '#16a34a', '#0891b2', '#4f46e5', '#c026d3', '#dc2626',
];

const GroupFormModal: React.FC<GroupFormModalProps> = ({ isOpen, group, instructors, courses, onClose, onSave }) => {
  const { t } = useLanguage();
  const d = t.dashboard;
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [color, setColor] = useState('#0d9488');
  const [instructorId, setInstructorId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [capacity, setCapacity] = useState('');
  const [schedule, setSchedule] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (group) {
      setNameEn(group.name.en);
      setNameAr(group.name.ar);
      setDescEn(group.description?.en || '');
      setDescAr(group.description?.ar || '');
      setColor(group.color);
      setInstructorId(group.instructorId || '');
      setCourseId(group.courseId || '');
      setCapacity(group.capacity?.toString() || '');
      setSchedule(group.schedule || '');
      setStartDate(group.startDate ? new Date(group.startDate).toISOString().split('T')[0] : '');
      setEndDate(group.endDate ? new Date(group.endDate).toISOString().split('T')[0] : '');
      setIsActive(group.isActive);
    } else {
      setNameEn(''); setNameAr(''); setDescEn(''); setDescAr('');
      setColor('#0d9488'); setInstructorId(''); setCourseId('');
      setCapacity(''); setSchedule(''); setStartDate(''); setEndDate('');
      setIsActive(true);
    }
  }, [group, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() && !nameAr.trim()) return;

    const now = Date.now();
    onSave({
      name: { en: nameEn.trim() || nameAr.trim(), ar: nameAr.trim() || nameEn.trim() },
      description: (descEn || descAr) ? { en: descEn, ar: descAr } : undefined,
      color,
      instructorId: instructorId || undefined,
      courseId: courseId || undefined,
      capacity: capacity ? parseInt(capacity) : undefined,
      schedule: schedule || undefined,
      startDate: startDate ? new Date(startDate).getTime() : undefined,
      endDate: endDate ? new Date(endDate).getTime() : undefined,
      isActive,
      studentCount: group?.studentCount || 0,
      createdAt: group?.createdAt || now,
      updatedAt: now,
    });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-900">{group ? d.edit_group : d.create_group}</h2>
          <button onClick={onClose} className="absolute top-4 end-4 text-slate-400 hover:text-slate-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.name_en}</label>
              <input type="text" value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder={t.dashboard?.group_name_placeholder || "Group name"}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.name_ar}</label>
              <input type="text" value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="اسم المجموعة" dir="rtl"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.desc_en}</label>
              <textarea value={descEn} onChange={e => setDescEn(e.target.value)} rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.desc_ar}</label>
              <textarea value={descAr} onChange={e => setDescAr(e.target.value)} rows={2} dir="rtl"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.color}</label>
            <div className="flex items-center gap-2 flex-wrap">
              {GROUP_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-teal-500 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.course}</label>
              <select value={courseId} onChange={e => setCourseId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">{d.no_course}</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.instructor}</label>
              <select value={instructorId} onChange={e => setInstructorId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">{d.no_instructor}</option>
                {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.capacity}</label>
              <input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} min={0} placeholder="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.start_date}</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.end_date}</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.schedule}</label>
            <input type="text" value={schedule} onChange={e => setSchedule(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setIsActive(v => !v)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border transition-colors ${
                isActive ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              {isActive ? d.active : d.inactive}
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">{d.cancel}</button>
            <button type="submit" disabled={!nameEn.trim() && !nameAr.trim()}
              className="px-5 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors disabled:opacity-40">
              {group ? d.save_changes : d.create_group}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupFormModal;
