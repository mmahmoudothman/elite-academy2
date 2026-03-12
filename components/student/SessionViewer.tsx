import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { LiveSession } from '../../types';
import { createSessionAttendance } from '../../services/firestoreService';

interface SessionViewerProps {
  session: LiveSession;
  onBack: () => void;
}

const SessionViewer: React.FC<SessionViewerProps> = ({ session, onBack }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const s = t.student;
  const [attendanceRecorded, setAttendanceRecorded] = useState(false);
  const attendanceRef = useRef(false);

  useEffect(() => {
    if (!user || attendanceRef.current) return;
    attendanceRef.current = true;

    createSessionAttendance({
      sessionId: session.id,
      userId: user.id,
      courseId: session.courseId,
      joinedAt: Date.now(),
      status: 'joined',
    }).then(() => {
      setAttendanceRecorded(true);
    }).catch(() => {
      attendanceRef.current = false;
    });
  }, [user, session.id]);

  const formatDate = (ts: number): string => {
    return new Date(ts).toLocaleString();
  };

  const durationMinutes = Math.round((session.scheduledEndTime - session.scheduledStartTime) / 60000);

  const jitsiDomain = 'meet.jit.si';
  const roomName = session.roomName || session.id;
  const displayName = user?.displayName || 'Student';
  const jitsiUrl = `https://${jitsiDomain}/${encodeURIComponent(roomName)}#userInfo.displayName="${encodeURIComponent(displayName)}"${session.roomPassword ? `&config.prejoinConfig.enabled=false` : ''}`;

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-[#0da993] transition-colors mb-4"
      >
        <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {s.back}
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{session.title}</h2>
              <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDate(session.scheduledStartTime)}
                </span>
                <span>{durationMinutes} {s.minutes_abbr}</span>
              </div>
            </div>
            {attendanceRecorded && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {s.attendance_recorded}
              </span>
            )}
          </div>
        </div>

        {/* Meeting URL bar */}
        <div className="px-4 py-3 bg-[#0da993]/5 border-b border-slate-100 flex items-center gap-2 flex-wrap">
          <svg className="w-4 h-4 text-[#0da993] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <code className="flex-1 text-sm text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 truncate select-all">
            {session.meetingUrl || jitsiUrl}
          </code>
          <button
            onClick={() => { navigator.clipboard.writeText(session.meetingUrl || jitsiUrl); }}
            className="flex-shrink-0 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            title="Copy"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <a
            href={session.meetingUrl || jitsiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 px-3 py-1.5 text-xs font-bold text-white bg-[#0da993] rounded-lg hover:bg-[#0da993]/90 transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open
          </a>
        </div>

        <div className="aspect-video">
          <iframe
            src={jitsiUrl}
            className="w-full h-full"
            allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
            allowFullScreen
            title={session.title}
          />
        </div>

        {session.description && (
          <div className="p-4 border-t border-slate-100">
            <p className="text-slate-600 text-sm">{session.description}</p>
          </div>
        )}

        {session.roomPassword && (
          <div className="px-4 pb-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm">
              <span className="font-medium text-amber-800">{s.room_password_label}: </span>
              <code className="bg-amber-100 px-2 py-0.5 rounded text-amber-900">{session.roomPassword}</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionViewer;
