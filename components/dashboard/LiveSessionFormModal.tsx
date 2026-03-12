import React, { useState, useEffect } from 'react';
import { LiveSession, Course, Instructor, StudentGroup, SessionPlatform } from '../../types';
import { useLanguage } from '../LanguageContext';
import { generateJitsiRoomName, getJitsiMeetUrl } from '../../utils/jitsi';

interface LiveSessionFormModalProps {
  isOpen: boolean;
  session: LiveSession | null;
  courses: Course[];
  instructors: Instructor[];
  groups: StudentGroup[];
  onClose: () => void;
  onSave: (data: Omit<LiveSession, 'id'>) => void;
}

const EMPTY_SESSION: Omit<LiveSession, 'id'> = {
  title: '',
  courseId: '',
  instructorId: '',
  scheduledStartTime: Date.now() + 3600000,
  scheduledEndTime: Date.now() + 7200000,
  status: 'scheduled',
  platform: 'jitsi',
  roomName: '',
  roomPassword: '',
  recordingEnabled: false,
  maxParticipants: undefined,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const LiveSessionFormModal: React.FC<LiveSessionFormModalProps> = ({
  isOpen, session, courses, instructors, groups, onClose, onSave
}) => {
  const { t } = useLanguage();
  const d = t.dashboard;
  const [form, setForm] = useState<Omit<LiveSession, 'id'>>(EMPTY_SESSION);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredGroups = form.courseId
    ? groups.filter(g => g.courseId === form.courseId)
    : groups;

  useEffect(() => {
    if (session) {
      const { id, ...rest } = session;
      setForm(rest);
    } else {
      setForm(EMPTY_SESSION);
    }
    setErrors({});
  }, [session, isOpen]);

  if (!isOpen) return null;

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = d.form_title_required || 'Title is required';
    if (!form.courseId) errs.courseId = 'Course is required';
    if (!form.instructorId) errs.instructorId = d.form_instructor_required || 'Instructor is required';
    if (!form.scheduledStartTime) errs.scheduledStartTime = 'Start time is required';
    if (!form.scheduledEndTime) errs.scheduledEndTime = 'End time is required';
    if (form.scheduledEndTime <= form.scheduledStartTime) errs.scheduledEndTime = 'End time must be after start time';
    if (form.platform !== 'jitsi' && !form.meetingUrl?.trim()) errs.meetingUrl = 'Meeting URL is required for this platform';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    let finalForm = { ...form };
    if (form.platform === 'jitsi' && !form.roomName) {
      const roomName = generateJitsiRoomName(form.courseId);
      finalForm = { ...finalForm, roomName, meetingUrl: getJitsiMeetUrl(roomName) };
    }
    onSave(finalForm);
  };

  const handleCourseChange = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    const matchedInstructor = course ? instructors.find(i => i.name === course.instructor) : null;
    setForm({
      ...form,
      courseId,
      instructorId: matchedInstructor?.id || form.instructorId,
      groupId: undefined,
    });
    setErrors(prev => ({ ...prev, courseId: '' }));
  };

  const handleGroupChange = (groupId: string) => {
    setForm({
      ...form,
      groupId: groupId || undefined,
    });
  };

  const handlePlatformChange = (platform: SessionPlatform) => {
    const updated = { ...form, platform, meetingUrl: '' };
    if (platform === 'jitsi') {
      const roomName = generateJitsiRoomName(form.courseId || 'session');
      updated.roomName = roomName;
      updated.meetingUrl = getJitsiMeetUrl(roomName);
    } else {
      updated.roomName = '';
    }
    setForm(updated);
  };

  const handleAutoGenerateRoom = () => {
    const roomName = generateJitsiRoomName(form.courseId || 'session');
    setForm({ ...form, roomName, meetingUrl: getJitsiMeetUrl(roomName) });
  };

  const toDatetimeLocal = (ts: number) => {
    const d = new Date(ts);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };

  const fromDatetimeLocal = (val: string) => new Date(val).getTime();

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-5 sm:p-8 my-8" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 end-4 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-xl font-black text-slate-900 mb-6">
          {session ? d.edit_action || 'Edit Session' : d.schedule_session}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.session_title}</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors(prev => ({ ...prev, title: '' })); }}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm ${errors.title ? 'border-red-400' : 'border-slate-100'}`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Course & Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.col_course}</label>
              <select
                value={form.courseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm ${errors.courseId ? 'border-red-400' : 'border-slate-100'}`}
              >
                <option value="">{d.all_courses}</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              {errors.courseId && <p className="text-red-500 text-xs mt-1">{errors.courseId}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.groups_tab}</label>
              <select
                value={form.groupId || ''}
                onChange={(e) => handleGroupChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              >
                <option value="">{d.all_groups}</option>
                {filteredGroups.map(g => (
                  <option key={g.id} value={g.id}>{g.name.en}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Instructor */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.col_instructor}</label>
            <select
              value={form.instructorId}
              onChange={(e) => { setForm({ ...form, instructorId: e.target.value }); setErrors(prev => ({ ...prev, instructorId: '' })); }}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm ${errors.instructorId ? 'border-red-400' : 'border-slate-100'}`}
            >
              <option value="">{d.all_instructors}</option>
              {instructors.map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
            {errors.instructorId && <p className="text-red-500 text-xs mt-1">{errors.instructorId}</p>}
          </div>

          {/* Scheduled Start/End */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.start_date}</label>
              <input
                type="datetime-local"
                value={toDatetimeLocal(form.scheduledStartTime)}
                onChange={(e) => { setForm({ ...form, scheduledStartTime: fromDatetimeLocal(e.target.value) }); setErrors(prev => ({ ...prev, scheduledStartTime: '' })); }}
                className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm ${errors.scheduledStartTime ? 'border-red-400' : 'border-slate-100'}`}
              />
              {errors.scheduledStartTime && <p className="text-red-500 text-xs mt-1">{errors.scheduledStartTime}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.end_date}</label>
              <input
                type="datetime-local"
                value={toDatetimeLocal(form.scheduledEndTime)}
                onChange={(e) => { setForm({ ...form, scheduledEndTime: fromDatetimeLocal(e.target.value) }); setErrors(prev => ({ ...prev, scheduledEndTime: '' })); }}
                className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm ${errors.scheduledEndTime ? 'border-red-400' : 'border-slate-100'}`}
              />
              {errors.scheduledEndTime && <p className="text-red-500 text-xs mt-1">{errors.scheduledEndTime}</p>}
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.session_platform}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {([
                { key: 'jitsi' as SessionPlatform, label: d.jitsi_meet },
                { key: 'google_meet' as SessionPlatform, label: d.google_meet },
                { key: 'youtube_live' as SessionPlatform, label: d.youtube_live },
                { key: 'external_link' as SessionPlatform, label: d.external_link },
              ]).map(p => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handlePlatformChange(p.key)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                    form.platform === p.key
                      ? 'bg-[#0da993] text-white border-[#0da993]'
                      : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-[#0da993]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Platform-specific fields */}
          {form.platform === 'jitsi' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.room_name}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.roomName || ''}
                    onChange={(e) => setForm({ ...form, roomName: e.target.value, meetingUrl: getJitsiMeetUrl(e.target.value) })}
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAutoGenerateRoom}
                    className="px-3 py-2 bg-[#3d66f1]/10 text-[#3d66f1] rounded-xl text-xs font-bold hover:bg-[#3d66f1]/20 transition-all whitespace-nowrap"
                  >
                    {d.auto_generate}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.room_password}</label>
                <input
                  type="text"
                  value={form.roomPassword || ''}
                  onChange={(e) => setForm({ ...form, roomPassword: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
                />
              </div>
            </div>
          )}

          {form.platform !== 'jitsi' && (
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {form.platform === 'google_meet' ? d.google_meet : form.platform === 'youtube_live' ? d.youtube_live : d.external_link} URL
              </label>
              <input
                type="url"
                value={form.meetingUrl || ''}
                onChange={(e) => { setForm({ ...form, meetingUrl: e.target.value }); setErrors(prev => ({ ...prev, meetingUrl: '' })); }}
                placeholder="https://..."
                className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm ${errors.meetingUrl ? 'border-red-400' : 'border-slate-100'}`}
              />
              {errors.meetingUrl && <p className="text-red-500 text-xs mt-1">{errors.meetingUrl}</p>}
            </div>
          )}

          {/* Recording & Max Participants */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.recording_enabled}</label>
              <button
                type="button"
                onClick={() => setForm({ ...form, recordingEnabled: !form.recordingEnabled })}
                className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
                  form.recordingEnabled
                    ? 'bg-[#0da993]/10 text-[#0da993] border-[#0da993]'
                    : 'bg-slate-50 text-slate-400 border-slate-100'
                }`}
              >
                {form.recordingEnabled ? d.yes : d.no}
              </button>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.max_participants}</label>
              <input
                type="number"
                min="0"
                value={form.maxParticipants ?? ''}
                onChange={(e) => setForm({ ...form, maxParticipants: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#0da993] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0da993] text-white py-3 rounded-xl font-black text-sm hover:bg-[#0da993]/90 transition-all mt-2"
          >
            {d.save}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LiveSessionFormModal;
