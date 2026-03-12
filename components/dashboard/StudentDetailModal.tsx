import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, Enrollment, Course } from '../../types';
import { useLanguage } from '../LanguageContext';

interface StudentDetailModalProps {
  isOpen: boolean;
  student: User | null;
  enrollments: Enrollment[];
  courses: Course[];
  currentUserId?: string;
  onClose: () => void;
  onSave: (id: string, data: Partial<User>) => void;
  onRoleChange?: (id: string, role: UserRole) => void;
}

const COUNTRIES = [
  { code: 'EG', label: 'Egypt' },
  { code: 'SA', label: 'Saudi Arabia' },
  { code: 'AE', label: 'UAE' },
  { code: 'KW', label: 'Kuwait' },
  { code: 'QA', label: 'Qatar' },
  { code: 'BH', label: 'Bahrain' },
  { code: 'OM', label: 'Oman' },
  { code: 'JO', label: 'Jordan' },
  { code: 'Other', label: 'Other' },
];

const ROLES: UserRole[] = ['super_admin', 'admin', 'instructor', 'student'];

const LIFECYCLE_STAGES = ['lead', 'prospect', 'enrolled', 'active', 'alumni'] as const;
type LifecycleStage = typeof LIFECYCLE_STAGES[number] | 'inactive';

const STAGE_COLORS: Record<string, string> = {
  lead: 'bg-blue-100 text-blue-700 border-blue-200',
  prospect: 'bg-purple-100 text-purple-700 border-purple-200',
  enrolled: 'bg-[#0da993]/15 text-[#0da993] border-[#0da993]/20',
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  alumni: 'bg-amber-100 text-amber-700 border-amber-200',
  inactive: 'bg-slate-100 text-slate-500 border-slate-200',
};

const STAGE_RING: Record<string, string> = {
  lead: 'ring-blue-500',
  prospect: 'ring-purple-500',
  enrolled: 'ring-[#0da993]',
  active: 'ring-emerald-500',
  alumni: 'ring-amber-500',
  inactive: 'ring-slate-400',
};

const SOURCE_OPTIONS = ['website', 'referral', 'social', 'ad', 'other'] as const;

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-[#0da993]/15 text-[#0da993]',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700',
  refunded: 'bg-orange-100 text-orange-700',
};

type TabKey = 'overview' | 'enrollments' | 'activity' | 'notes';

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  student,
  enrollments,
  courses,
  currentUserId,
  onClose,
  onSave,
  onRoleChange,
}) => {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [isActive, setIsActive] = useState(true);
  const [lifecycleStage, setLifecycleStage] = useState<LifecycleStage | ''>('');
  const [source, setSource] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [notes, setNotes] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const isSelf = !!(currentUserId && student && currentUserId === student.id);

  useEffect(() => {
    if (student) {
      setDisplayName(student.displayName || '');
      setPhone(student.phone || '');
      setCountry(student.country || '');
      setRole(student.role);
      setIsActive(student.isActive);
      setLifecycleStage(student.lifecycleStage || '');
      setSource(student.source || '');
      setTags(student.tags ? [...student.tags] : []);
      setNotes(student.notes || '');
      setHasChanges(false);
      setActiveTab('overview');
      setTagInput('');
    }
  }, [student]);

  const studentEnrollments = useMemo(() =>
    enrollments.filter(e => e.studentId === student?.id),
    [enrollments, student?.id]
  );

  const stats = useMemo(() => {
    const totalCourses = studentEnrollments.length;
    const completed = studentEnrollments.filter(e => e.status === 'completed').length;
    const totalSpent = studentEnrollments
      .filter(e => e.paymentStatus === 'paid')
      .reduce((sum, e) => sum + e.paymentAmount, 0);
    return { totalCourses, completed, totalSpent };
  }, [studentEnrollments]);

  const activityTimeline = useMemo(() => {
    if (!student) return [];
    const events: { date: number; label: string; type: string }[] = [];
    events.push({ date: student.createdAt, label: 'Account created', type: 'create' });
    studentEnrollments.forEach(e => {
      events.push({ date: e.enrolledAt, label: `Enrolled in ${e.courseTitle}`, type: 'enroll' });
      if (e.paymentStatus === 'paid') {
        events.push({ date: e.enrolledAt + 3600000, label: `Payment received for ${e.courseTitle} (${e.paymentAmount} ${e.paymentCurrency})`, type: 'payment' });
      }
      if (e.completedAt) {
        events.push({ date: e.completedAt, label: `Completed ${e.courseTitle}`, type: 'complete' });
      }
      if (e.status === 'cancelled') {
        events.push({ date: e.enrolledAt + 86400000, label: `Cancelled ${e.courseTitle}`, type: 'cancel' });
      }
    });
    return events.sort((a, b) => b.date - a.date);
  }, [student, studentEnrollments]);

  if (!isOpen || !student) return null;

  const handleFieldChange = (setter: (val: string) => void, value: string) => {
    setter(value);
    setHasChanges(true);
  };

  const handleRoleChange = (newRole: UserRole) => {
    if (isSelf) return;
    setRole(newRole);
    setHasChanges(true);
  };

  const handleToggleActive = () => {
    setIsActive(prev => !prev);
    setHasChanges(true);
  };

  const handleStageChange = (stage: LifecycleStage) => {
    setLifecycleStage(stage);
    setHasChanges(true);
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags(prev => [...prev, tag]);
      setHasChanges(true);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
    setHasChanges(true);
  };

  const handleSave = () => {
    const data: Partial<User> = {};
    if (displayName !== student.displayName) data.displayName = displayName;
    if (phone !== (student.phone || '')) data.phone = phone;
    if (country !== (student.country || '')) data.country = country;
    if (role !== student.role && !isSelf) data.role = role;
    if (isActive !== student.isActive) data.isActive = isActive;
    if (lifecycleStage !== (student.lifecycleStage || '')) data.lifecycleStage = lifecycleStage as any || undefined;
    if (source !== (student.source || '')) data.source = source as any || undefined;
    if (notes !== (student.notes || '')) data.notes = notes;
    if (JSON.stringify(tags) !== JSON.stringify(student.tags || [])) data.tags = tags;

    if (Object.keys(data).length > 0) {
      if (data.role && onRoleChange) {
        const { role: newRole, ...rest } = data;
        if (Object.keys(rest).length > 0) {
          onSave(student.id, rest);
        }
        onRoleChange(student.id, newRole);
      } else {
        onSave(student.id, data);
      }
    }
    setHasChanges(false);
  };

  const avatarLetter = (student.displayName || student.email || '?').charAt(0).toUpperCase();

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const formatDateTime = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const roleLabel = (r: UserRole) => {
    const labels: Record<UserRole, string> = { super_admin: 'Super Admin', admin: 'Admin', content_creator: 'Content Creator', moderator: 'Moderator', instructor: 'Instructor', student: 'Student' };
    return labels[r] || r;
  };

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'enrollments', label: `Enrollments (${studentEnrollments.length})` },
    { key: 'activity', label: 'Activity' },
    { key: 'notes', label: 'Notes' },
  ];

  const timelineIcon = (type: string) => {
    switch (type) {
      case 'create': return 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z';
      case 'enroll': return 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253';
      case 'payment': return 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z';
      case 'complete': return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'cancel': return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      default: return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  };

  const timelineColor = (type: string) => {
    switch (type) {
      case 'create': return 'text-blue-500 bg-blue-50';
      case 'enroll': return 'text-[#0da993] bg-[#0da993]/10';
      case 'payment': return 'text-green-500 bg-green-50';
      case 'complete': return 'text-emerald-500 bg-emerald-50';
      case 'cancel': return 'text-red-500 bg-red-50';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 end-4 z-10 text-slate-400 hover:text-slate-700 transition-colors" aria-label="Close">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header with Avatar */}
        <div className="p-6 sm:p-8 pb-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-[#0da993] flex items-center justify-center text-white text-2xl font-black shrink-0">
              {avatarLetter}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                {student.displayName || student.email}
              </h2>
              <p className="text-sm text-slate-500 truncate">{student.email}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${student.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {student.isActive ? (t.dashboard?.active || 'Active') : (t.dashboard?.inactive || 'Inactive')}
                </span>
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                  {roleLabel(student.role)}
                </span>
                {student.source && (
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-[#3d66f1]/10 text-[#3d66f1]">
                    via {student.source}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-[#0da993]">{stats.totalCourses}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Enrolled</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-emerald-600">{stats.completed}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Completed</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-blue-600">{stats.totalSpent.toLocaleString()}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Spent</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-sm font-black text-slate-700">{formatDate(student.createdAt)}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Member Since</p>
            </div>
          </div>

          {/* Lifecycle Stage Pipeline */}
          <div className="mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Lifecycle Stage</p>
            <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
              {LIFECYCLE_STAGES.map((stage, idx) => {
                const isCurrentStage = lifecycleStage === stage;
                return (
                  <React.Fragment key={stage}>
                    <button
                      onClick={() => handleStageChange(stage)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap border ${
                        isCurrentStage
                          ? `${STAGE_COLORS[stage]} ring-2 ${STAGE_RING[stage]}`
                          : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {stage}
                    </button>
                    {idx < LIFECYCLE_STAGES.length - 1 && (
                      <svg className="w-3 h-3 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Tags</p>
            <div className="flex flex-wrap items-center gap-2">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </span>
              ))}
              <div className="inline-flex items-center gap-1">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                  placeholder="Add tag..."
                  className="w-24 text-xs bg-transparent border border-dashed border-slate-300 rounded-full px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#0da993] focus:border-[#0da993]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-100 px-6 sm:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-[#0da993] text-[#0da993]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8 pt-5">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Info Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-slate-400 text-xs mb-1">{t.dashboard?.phone || 'Phone'}</p>
                  <p className="text-slate-700 font-semibold">{student.phone || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-slate-400 text-xs mb-1">{t.dashboard?.country || 'Country'}</p>
                  <p className="text-slate-700 font-semibold">
                    {COUNTRIES.find(c => c.code === student.country)?.label || student.country || '-'}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-slate-400 text-xs mb-1">Last Login</p>
                  <p className="text-slate-700 font-semibold">{student.lastLogin ? formatDate(student.lastLogin) : '-'}</p>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-4">
                  {t.dashboard?.editDetails || 'Edit Details'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.dashboard?.displayName || 'Display Name'}</label>
                    <input type="text" value={displayName} onChange={e => handleFieldChange(setDisplayName, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0da993] focus:border-transparent transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.dashboard?.phone || 'Phone'}</label>
                    <input type="text" value={phone} onChange={e => handleFieldChange(setPhone, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0da993] focus:border-transparent transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.dashboard?.country || 'Country'}</label>
                    <select value={country} onChange={e => handleFieldChange(setCountry, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0da993] focus:border-transparent transition-shadow">
                      <option value="">{t.dashboard?.selectCountry || 'Select country'}</option>
                      {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.dashboard?.role || 'Role'}</label>
                    <select value={role} onChange={e => handleRoleChange(e.target.value as UserRole)} disabled={isSelf}
                      className={`w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0da993] focus:border-transparent transition-shadow ${isSelf ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {ROLES.map(r => <option key={r} value={r}>{roleLabel(r)}</option>)}
                    </select>
                    {isSelf && <p className="text-xs text-amber-600 mt-1">{t.dashboard?.cannotChangeOwnRole || 'You cannot change your own role.'}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Source</label>
                    <select value={source} onChange={e => { setSource(e.target.value); setHasChanges(true); }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0da993] focus:border-transparent transition-shadow">
                      <option value="">Select source</option>
                      {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.dashboard?.status || 'Status'}</label>
                    <button type="button" onClick={handleToggleActive}
                      className={`w-full px-3 py-2 border rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                          : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                      }`}>
                      {isActive ? (t.dashboard?.active || 'Active') : (t.dashboard?.inactive || 'Inactive')}
                      {' — '}{t.dashboard?.clickToToggle || 'Click to toggle'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enrollments Tab */}
          {activeTab === 'enrollments' && (
            <div>
              {studentEnrollments.length === 0 ? (
                <p className="text-sm text-slate-400 italic text-center py-8">{t.dashboard?.noEnrollments || 'No enrollments found.'}</p>
              ) : (
                <div className="space-y-3">
                  {studentEnrollments.map(enrollment => {
                    const course = courses.find(c => c.id === enrollment.courseId);
                    return (
                      <div key={enrollment.id} className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50/50 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            {course?.image && (
                              <img src={course.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0 hidden sm:block" />
                            )}
                            <div>
                              <h4 className="font-bold text-sm text-slate-900">{enrollment.courseTitle}</h4>
                              <p className="text-xs text-slate-400 mt-0.5">
                                Enrolled {formatDate(enrollment.enrolledAt)}
                                {enrollment.completedAt && ` — Completed ${formatDate(enrollment.completedAt)}`}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColors[enrollment.status] || 'bg-slate-100 text-slate-600'}`}>
                                  {enrollment.status}
                                </span>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColors[enrollment.paymentStatus] || 'bg-slate-100 text-slate-600'}`}>
                                  {enrollment.paymentStatus}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-end flex-shrink-0">
                            <p className="text-sm font-black text-slate-900">
                              {enrollment.paymentAmount.toLocaleString()} {enrollment.paymentCurrency}
                            </p>
                            {enrollment.paymentMethod && (
                              <p className="text-[10px] text-slate-400 uppercase mt-0.5">{enrollment.paymentMethod.replace('_', ' ')}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div>
              {activityTimeline.length === 0 ? (
                <p className="text-sm text-slate-400 italic text-center py-8">No activity recorded.</p>
              ) : (
                <div className="relative">
                  <div className="absolute start-4 top-0 bottom-0 w-px bg-slate-200" />
                  <div className="space-y-4">
                    {activityTimeline.map((event, idx) => (
                      <div key={idx} className="flex items-start gap-4 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${timelineColor(event.type)}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={timelineIcon(event.type)} />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0 pb-1">
                          <p className="text-sm font-medium text-slate-700">{event.label}</p>
                          <p className="text-xs text-slate-400">{formatDateTime(event.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Internal Admin Notes</p>
              <textarea
                value={notes}
                onChange={e => { setNotes(e.target.value); setHasChanges(true); }}
                rows={6}
                placeholder="Add internal notes about this student..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0da993] focus:border-transparent transition-shadow resize-none"
              />
              {student.notes && (
                <p className="text-[10px] text-slate-400">
                  Last saved notes will be preserved when you click Save Changes.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-6 sm:p-8 pt-5">
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
            {t.dashboard?.cancel || 'Cancel'}
          </button>
          <button onClick={handleSave} disabled={!hasChanges}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all ${
              hasChanges ? 'bg-[#0da993] hover:bg-[#0da993]/90 shadow-lg shadow-[#0da993]/20' : 'bg-slate-300 cursor-not-allowed'
            }`}>
            {t.dashboard?.saveChanges || 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;
