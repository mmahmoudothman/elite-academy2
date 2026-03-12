import React, { useEffect, useState } from 'react';
import { LiveSession, SessionAttendance, Student } from '../../types';
import { useLanguage } from '../LanguageContext';
import { subscribeSessionAttendanceBySession } from '../../services/firestoreService';

interface SessionAttendanceModalProps {
  isOpen: boolean;
  session: LiveSession | null;
  students?: Student[];
  onClose: () => void;
}

const SessionAttendanceModal: React.FC<SessionAttendanceModalProps> = ({ isOpen, session, students = [], onClose }) => {
  const { t } = useLanguage();
  const d = t.dashboard;
  const [attendance, setAttendance] = useState<SessionAttendance[]>([]);

  useEffect(() => {
    if (!isOpen || !session) {
      setAttendance([]);
      return;
    }
    const unsub = subscribeSessionAttendanceBySession(session.id, setAttendance);
    return () => unsub();
  }, [isOpen, session?.id]);

  if (!isOpen || !session) return null;

  const totalAttendees = attendance.length;
  const avgDuration = totalAttendees > 0
    ? Math.round(attendance.reduce((sum, a) => sum + (a.durationMinutes || 0), 0) / totalAttendees)
    : 0;

  const formatTime = (ts?: number) => {
    if (!ts) return '-';
    return new Date(ts).toLocaleString(undefined, {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '-';
    if (minutes < 60) return `${minutes} ${d.minutes || 'min'}`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const handleExportCsv = () => {
    const headers = [
      'Student Name',
      'Join Time',
      'Leave Time',
      'Duration (min)',
      'Status'
    ];
    const getStudentName = (userId: string) => {
      const student = students.find(st => st.userId === userId || st.id === userId);
      return student?.name || userId;
    };
    const rows = attendance.map(a => [
      getStudentName(a.userId),
      a.joinedAt ? new Date(a.joinedAt).toISOString() : '',
      a.leftAt ? new Date(a.leftAt).toISOString() : '',
      String(a.durationMinutes || 0),
      a.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${session.title.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-5 sm:p-8 my-8" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 end-4 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-xl font-black text-slate-900 mb-2">{d.attendance_title}</h3>
        <p className="text-sm text-slate-400 font-bold mb-6">{session.title}</p>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.total_attendees}</p>
            <p className="text-2xl font-black text-slate-900">{totalAttendees}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.avg_duration}</p>
            <p className="text-2xl font-black text-slate-900">{formatDuration(avgDuration)}</p>
          </div>
        </div>

        {/* Attendance Table */}
        {attendance.length === 0 ? (
          <div className="bg-slate-50 rounded-xl p-8 text-center">
            <p className="text-slate-400 font-medium">{d.no_sessions}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-start px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-400">{d.col_name}</th>
                    <th className="text-start px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-400">{d.join_time}</th>
                    <th className="text-start px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-400">{d.leave_time}</th>
                    <th className="text-start px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-400">{d.duration}</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((a) => (
                    <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">{students.find(st => st.userId === a.userId || st.id === a.userId)?.name || a.userId}</td>
                      <td className="px-4 py-3 text-slate-600 font-medium text-xs">{formatTime(a.joinedAt)}</td>
                      <td className="px-4 py-3 text-slate-600 font-medium text-xs">{formatTime(a.leftAt)}</td>
                      <td className="px-4 py-3 text-slate-600 font-medium text-xs">{formatDuration(a.durationMinutes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Export Button */}
        {attendance.length > 0 && (
          <button
            onClick={handleExportCsv}
            className="w-full bg-[#3d66f1] text-white py-3 rounded-xl font-black text-sm hover:bg-[#3d66f1]/90 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {d.export_csv}
          </button>
        )}
      </div>
    </div>
  );
};

export default SessionAttendanceModal;
