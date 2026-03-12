import React, { useState, useEffect } from 'react';
import { Student, StudentGroup, Instructor, Course, StudentLevel, LifecycleStage, StudentGender } from '../../types';
import { useLanguage } from '../LanguageContext';

interface StudentFormModalProps {
  isOpen: boolean;
  student?: Student | null;
  groups: StudentGroup[];
  instructors: Instructor[];
  courses: Course[];
  onClose: () => void;
  onSave: (data: Omit<Student, 'id'>) => void;
}

const LEVELS: StudentLevel[] = ['beginner', 'intermediate', 'advanced'];
const STAGES: LifecycleStage[] = ['lead', 'prospect', 'enrolled', 'active', 'alumni', 'inactive'];
const SOURCES = ['website', 'referral', 'social', 'ad', 'walk_in', 'other'] as const;

const StudentFormModal: React.FC<StudentFormModalProps> = ({ isOpen, student, groups, instructors, courses, onClose, onSave }) => {
  const { language, t } = useLanguage();
  const d = t.dashboard;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('EG');
  const [gender, setGender] = useState<StudentGender | ''>('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [level, setLevel] = useState<StudentLevel>('beginner');
  const [lifecycleStage, setLifecycleStage] = useState<LifecycleStage>('lead');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [assignedInstructorId, setAssignedInstructorId] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [source, setSource] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [isActive, setIsActive] = useState(true);

  const countryOptions = [
    { code: 'EG', label: d.country_eg }, { code: 'SA', label: d.country_sa },
    { code: 'AE', label: d.country_ae }, { code: 'KW', label: d.country_kw },
    { code: 'QA', label: d.country_qa }, { code: 'BH', label: d.country_bh },
    { code: 'OM', label: d.country_om }, { code: 'JO', label: d.country_jo },
    { code: 'Other', label: d.country_other },
  ];

  const levelLabels: Record<string, string> = {
    beginner: d.level_beginner, intermediate: d.level_intermediate, advanced: d.level_advanced,
  };

  const stageLabels: Record<string, string> = {
    lead: d.stage_lead, prospect: d.stage_prospect, enrolled: d.stage_enrolled,
    active: d.stage_active, alumni: d.stage_alumni, inactive: d.stage_inactive,
  };

  const sourceLabels: Record<string, string> = {
    website: d.source_website, referral: d.source_referral, social: d.source_social,
    ad: d.source_ad, walk_in: d.source_walk_in, other: d.source_other,
  };

  useEffect(() => {
    if (student) {
      setName(student.name); setEmail(student.email); setPhone(student.phone || '');
      setCountry(student.country || 'EG'); setGender(student.gender || '');
      setDateOfBirth(student.dateOfBirth || ''); setNationalId(student.nationalId || '');
      setLevel(student.level); setLifecycleStage(student.lifecycleStage);
      setSelectedGroups([...student.groupIds]);
      setAssignedInstructorId(student.assignedInstructorId || '');
      setSelectedCourses([...student.enrolledCourseIds]);
      setSource(student.source || ''); setParentName(student.parentName || '');
      setParentPhone(student.parentPhone || ''); setAddress(student.address || '');
      setNotes(student.notes || ''); setTags((student.tags || []).join(', '));
      setIsActive(student.isActive);
    } else {
      setName(''); setEmail(''); setPhone(''); setCountry('EG'); setGender('');
      setDateOfBirth(''); setNationalId(''); setLevel('beginner'); setLifecycleStage('lead');
      setSelectedGroups([]); setAssignedInstructorId(''); setSelectedCourses([]);
      setSource(''); setParentName(''); setParentPhone(''); setAddress('');
      setNotes(''); setTags(''); setIsActive(true);
    }
  }, [student, isOpen]);

  if (!isOpen) return null;

  const toggleGroup = (gid: string) => {
    setSelectedGroups(prev => prev.includes(gid) ? prev.filter(id => id !== gid) : [...prev, gid]);
  };

  const toggleCourse = (cid: string) => {
    setSelectedCourses(prev => prev.includes(cid) ? prev.filter(id => id !== cid) : [...prev, cid]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const now = Date.now();
    onSave({
      name: name.trim(),
      email: email.trim(),
      phone: phone || undefined,
      country: country || undefined,
      gender: gender || undefined,
      dateOfBirth: dateOfBirth || undefined,
      nationalId: nationalId || undefined,
      level,
      lifecycleStage,
      groupIds: selectedGroups,
      assignedInstructorId: assignedInstructorId || undefined,
      enrolledCourseIds: selectedCourses,
      source: source as any || undefined,
      parentName: parentName || undefined,
      parentPhone: parentPhone || undefined,
      address: address || undefined,
      notes: notes || undefined,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      isActive,
      preferredLanguage: language as 'en' | 'ar',
      createdAt: student?.createdAt || now,
      updatedAt: now,
    });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">{student ? d.edit_student : d.add_student}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Personal Info */}
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.personal_info}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.full_name} *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0da993]" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.email} *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0da993]" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.phone}</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+20..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0da993]" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.country}</label>
              <select value={country} onChange={e => setCountry(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0da993]">
                {countryOptions.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.gender}</label>
              <select value={gender} onChange={e => setGender(e.target.value as StudentGender)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0da993]">
                <option value="">{d.not_specified}</option>
                <option value="male">{d.male}</option>
                <option value="female">{d.female}</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.date_of_birth}</label>
              <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0da993]" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.national_id}</label>
              <input type="text" value={nationalId} onChange={e => setNationalId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0da993]" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.source}</label>
              <select value={source} onChange={e => setSource(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0da993]">
                <option value="">{d.select_source}</option>
                {SOURCES.map(s => <option key={s} value={s}>{sourceLabels[s]}</option>)}
              </select>
            </div>
          </div>

          {/* Guardian Info */}
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 pt-2">{d.guardian_parent}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.parent_name}</label>
              <input type="text" value={parentName} onChange={e => setParentName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0da993]" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.parent_phone}</label>
              <input type="tel" value={parentPhone} onChange={e => setParentPhone(e.target.value)} placeholder="+20..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0da993]" />
            </div>
          </div>

          {/* Academic Info */}
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 pt-2">{d.academic}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.level}</label>
              <select value={level} onChange={e => setLevel(e.target.value as StudentLevel)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0da993]">
                {LEVELS.map(l => <option key={l} value={l}>{levelLabels[l]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.stage}</label>
              <select value={lifecycleStage} onChange={e => setLifecycleStage(e.target.value as LifecycleStage)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0da993]">
                {STAGES.map(s => <option key={s} value={s}>{stageLabels[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.instructor}</label>
              <select value={assignedInstructorId} onChange={e => setAssignedInstructorId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0da993]">
                <option value="">{d.no_instructor}</option>
                {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
          </div>

          {/* Groups */}
          {groups.length > 0 && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{d.groups}</label>
              <div className="flex flex-wrap gap-2">
                {groups.filter(g => g.isActive).map(g => {
                  const selected = selectedGroups.includes(g.id);
                  const gName = language === 'ar' ? g.name.ar : g.name.en;
                  return (
                    <button key={g.id} type="button" onClick={() => toggleGroup(g.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                        selected ? 'text-white border-transparent' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                      style={selected ? { backgroundColor: g.color } : undefined}>
                      {gName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Courses */}
          {courses.length > 0 && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{d.enrolled_courses}</label>
              <div className="flex flex-wrap gap-2">
                {courses.slice(0, 20).map(c => {
                  const selected = selectedCourses.includes(c.id);
                  return (
                    <button key={c.id} type="button" onClick={() => toggleCourse(c.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                        selected ? 'bg-[#0da993] text-white border-[#0da993]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}>
                      {c.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.address}</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0da993]" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.tags_comma}</label>
              <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="tag1, tag2"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0da993]" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.notes}</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0da993] resize-none" />
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
            <button type="submit" disabled={!name.trim() || !email.trim()}
              className="px-5 py-2.5 text-sm font-bold text-white bg-[#0da993] hover:bg-[#0da993]/90 rounded-xl transition-colors disabled:opacity-40">
              {student ? d.save_changes : d.add_student}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentFormModal;
