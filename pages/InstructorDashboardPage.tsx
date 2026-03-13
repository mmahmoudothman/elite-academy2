import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  subscribeCourses, subscribeSessions, subscribeRecordings,
  subscribeQuizzes, subscribeCapstones, subscribeEnrollments,
  subscribeQuizSubmissions, subscribeCapstoneSubmissions, subscribeCourseProgressByCourse,
  createSession, editSession, removeSession,
  createRecording, editRecording, removeRecording,
  createQuiz, editQuiz, removeQuiz,
  createCapstone, editCapstone, removeCapstone,
  editCapstoneSubmission, subscribeAttendance,
} from '../services/firestoreService';
import { uploadImage } from '../services/firebase';
import {
  Course, LiveSession, Recording, Quiz, Capstone, Enrollment,
  QuizSubmission, CapstoneSubmission, CourseProgress,
  QuizQuestion, SessionAttendance,
} from '../types';

type InstructorTab = 'courses' | 'sessions' | 'recordings' | 'quizzes' | 'capstones' | 'progress';

const InstructorDashboardPage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const s = t.instructor;

  const [activeTab, setActiveTab] = useState<InstructorTab>('courses');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [capstones, setCapstones] = useState<Capstone[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  // Modal/form states
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showRecordingForm, setShowRecordingForm] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [showCapstoneForm, setShowCapstoneForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Submission viewing
  const [viewingQuizSubs, setViewingQuizSubs] = useState<string | null>(null);
  const [quizSubmissions, setQuizSubmissions] = useState<QuizSubmission[]>([]);
  const [viewingCapstoneSubs, setViewingCapstoneSubs] = useState<string | null>(null);
  const [capstoneSubmissions, setCapstoneSubmissions] = useState<CapstoneSubmission[]>([]);
  const [gradingSubmission, setGradingSubmission] = useState<CapstoneSubmission | null>(null);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');

  // Session attendance
  const [viewingAttendance, setViewingAttendance] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<SessionAttendance[]>([]);

  // Progress data
  const [courseProgressMap, setCourseProgressMap] = useState<Record<string, CourseProgress[]>>({});

  useEffect(() => {
    const unsubs: (() => void)[] = [];
    unsubs.push(subscribeCourses(setCourses));
    unsubs.push(subscribeSessions(setSessions));
    unsubs.push(subscribeRecordings(setRecordings));
    unsubs.push(subscribeQuizzes(setQuizzes));
    unsubs.push(subscribeCapstones(setCapstones));
    unsubs.push(subscribeEnrollments(setEnrollments));
    return () => unsubs.forEach(u => u());
  }, []);

  // Subscribe to quiz submissions when viewing
  useEffect(() => {
    if (!viewingQuizSubs) { setQuizSubmissions([]); return; }
    return subscribeQuizSubmissions((allSubs) => setQuizSubmissions(allSubs.filter(s => s.quizId === viewingQuizSubs)));
  }, [viewingQuizSubs]);

  // Subscribe to capstone submissions when viewing
  useEffect(() => {
    if (!viewingCapstoneSubs) { setCapstoneSubmissions([]); return; }
    return subscribeCapstoneSubmissions((allSubs) => setCapstoneSubmissions(allSubs.filter(s => s.capstoneId === viewingCapstoneSubs)));
  }, [viewingCapstoneSubs]);

  // Subscribe to attendance when viewing
  useEffect(() => {
    if (!viewingAttendance) { setAttendance([]); return; }
    return subscribeAttendance((allAttendance) => setAttendance(allAttendance.filter(a => a.sessionId === viewingAttendance)));
  }, [viewingAttendance]);

  const myCourses = useMemo(() => {
    if (!user) return [];
    return courses.filter(c =>
      c.instructor === user.displayName ||
      c.instructor?.toLowerCase().includes(user.displayName?.toLowerCase() || '')
    );
  }, [courses, user]);

  const myCourseIds = useMemo(() => myCourses.map(c => c.id), [myCourses]);

  const mySessions = useMemo(
    () => sessions.filter(s => myCourseIds.includes(s.courseId) || s.instructorId === user?.id),
    [sessions, myCourseIds, user]
  );

  const myRecordings = useMemo(
    () => recordings.filter(r => myCourseIds.includes(r.courseId)),
    [recordings, myCourseIds]
  );

  const myQuizzes = useMemo(
    () => quizzes.filter(q => myCourseIds.includes(q.courseId)),
    [quizzes, myCourseIds]
  );

  const myCapstones = useMemo(
    () => capstones.filter(c => myCourseIds.includes(c.courseId)),
    [capstones, myCourseIds]
  );

  const myStudentCount = useMemo(() => {
    return enrollments.filter(e => myCourseIds.includes(e.courseId) && e.status !== 'cancelled').length;
  }, [enrollments, myCourseIds]);

  // Subscribe to progress for each course
  useEffect(() => {
    if (activeTab !== 'progress') return;
    const unsubs: (() => void)[] = [];
    const progressMap: Record<string, CourseProgress[]> = {};
    myCourseIds.forEach(courseId => {
      unsubs.push(subscribeCourseProgressByCourse(courseId, (progress) => {
        setCourseProgressMap(prev => ({ ...prev, [courseId]: progress }));
      }));
    });
    return () => unsubs.forEach(u => u());
  }, [activeTab, myCourseIds.join(',')]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const tabs: { key: InstructorTab; label: string; icon: React.ReactNode }[] = [
    {
      key: 'courses', label: s.my_courses,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    },
    {
      key: 'sessions', label: s.sessions,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    },
    {
      key: 'recordings', label: s.recordings,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      key: 'quizzes', label: s.quizzes,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    },
    {
      key: 'capstones', label: s.capstones,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    },
    {
      key: 'progress', label: s.student_progress,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    },
  ];

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-slate-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#3d66f1] flex items-center justify-center">
            <span className="text-white font-black text-sm">EA</span>
          </div>
          <span className="text-lg font-black text-slate-900">Elite Academy</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSidebarOpen(false); setViewingQuizSubs(null); setViewingCapstoneSubs(null); setViewingAttendance(null); setGradingSubmission(null); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab.key ? 'bg-[#3d66f1]/10 text-[#3d66f1]' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-100 space-y-1">
        <button onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
          {language === 'en' ? 'العربية' : 'English'}
        </button>
        <Link to="/" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          {t.dashboard?.back_to_site || 'Back to Site'}
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          {t.dashboard?.logout || 'Logout'}
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'courses': return renderCourses();
      case 'sessions': return renderSessionsTab();
      case 'recordings': return renderRecordingsTab();
      case 'quizzes': return renderQuizzesTab();
      case 'capstones': return renderCapstonesTab();
      case 'progress': return renderProgressTab();
    }
  };

  const renderCourses = () => {
    if (myCourses.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <p className="text-slate-500">{s.no_courses}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {myCourses.map(course => {
          const enrolled = enrollments.filter(e => e.courseId === course.id && e.status !== 'cancelled').length;
          return (
            <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {course.image && (
                <div className="aspect-video bg-slate-100 overflow-hidden">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-5">
                <h3 className="font-bold text-slate-900 mb-1">{course.title}</h3>
                <p className="text-sm text-slate-500 mb-3">{course.category}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{s.total_students}: {enrolled}</span>
                  <span className="text-[#3d66f1] font-bold">{course.level}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // --- SESSIONS TAB ---
  const renderSessionsTab = () => {
    if (viewingAttendance) {
      const session = mySessions.find(s => s.id === viewingAttendance);
      return (
        <div className="space-y-4">
          <button onClick={() => setViewingAttendance(null)} className="flex items-center gap-2 text-slate-600 hover:text-[#3d66f1]">
            <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {s.back}
          </button>
          <h3 className="text-lg font-bold text-slate-900">{s.attendees} - {session?.title}</h3>
          {attendance.length === 0 ? (
            <p className="text-slate-500 py-8 text-center">{s.no_attendees}</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-start px-4 py-3 font-bold text-slate-700">Name</th>
                    <th className="text-start px-4 py-3 font-bold text-slate-700">Joined At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendance.map(a => (
                    <tr key={a.id}>
                      <td className="px-4 py-3 text-slate-900">{a.userId}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(a.joinedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{s.sessions}</h3>
          <button
            onClick={() => { setEditingItem(null); setShowSessionForm(true); }}
            className="px-4 py-2 bg-[#3d66f1] text-white rounded-xl text-sm font-bold hover:bg-[#3d66f1]/90 transition-colors"
          >
            {s.schedule_session}
          </button>
        </div>

        {showSessionForm && <SessionForm courses={myCourses} session={editingItem} onClose={() => setShowSessionForm(false)} />}

        <div className="space-y-3">
          {mySessions.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No sessions yet.</p>
          ) : (
            mySessions.sort((a, b) => b.scheduledStartTime - a.scheduledStartTime).map(session => {
              const course = courses.find(c => c.id === session.courseId);
              const statusColors: Record<string, string> = {
                scheduled: 'bg-blue-100 text-blue-700',
                live: 'bg-green-100 text-green-700',
                ended: 'bg-slate-100 text-slate-600',
                cancelled: 'bg-red-100 text-red-600',
              };
              // Build meeting URL for this session
              const jitsiDomain = 'meet.jit.si';
              const roomId = session.roomName || session.id;
              const displayName = user?.displayName || 'Instructor';
              const jitsiUrl = `https://${jitsiDomain}/${encodeURIComponent(roomId)}#userInfo.displayName="${encodeURIComponent(displayName)}"&config.prejoinConfig.enabled=false`;
              const sessionMeetingUrl = session.meetingUrl || jitsiUrl;

              return (
                <div key={session.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900">{session.title}</h4>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[session.status]}`}>
                          {session.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500">
                        {course && <span className="me-3">{course.title}</span>}
                        <span>{new Date(session.scheduledStartTime).toLocaleString()}</span>
                        <span className="ms-3">{Math.round((session.scheduledEndTime - session.scheduledStartTime) / 60000)} min</span>
                      </div>
                      {(session.status === 'scheduled' || session.status === 'live') && (
                        <div className="mt-2 flex items-center gap-2">
                          <code className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 truncate max-w-md select-all">
                            {sessionMeetingUrl}
                          </code>
                          <button
                            onClick={() => navigator.clipboard.writeText(sessionMeetingUrl)}
                            className="flex-shrink-0 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Copy URL"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {(session.status === 'scheduled' || session.status === 'live') && (
                        <a
                          href={sessionMeetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-[#0da993] text-white rounded-lg text-xs font-bold hover:bg-[#0b9882] flex items-center gap-1.5 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          {s.join_meeting || 'Join Meeting'}
                        </a>
                      )}
                      {session.status === 'scheduled' && (
                        <button onClick={() => {
                          editSession(session.id, { status: 'live', actualStartTime: Date.now() });
                          import('../services/telegramService').then(({ notifySessionStarted }) => {
                            notifySessionStarted(user?.displayName || 'Instructor', session.title, course?.title || '');
                          }).catch(() => {});
                        }} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700">
                          {s.start_session}
                        </button>
                      )}
                      {session.status === 'live' && (
                        <button onClick={() => editSession(session.id, { status: 'ended', actualEndTime: Date.now() })} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700">
                          {s.end_session}
                        </button>
                      )}
                      <button onClick={() => setViewingAttendance(session.id)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50">
                        {s.attendees}
                      </button>
                      <button
                        onClick={() => { setEditingItem(session); setShowSessionForm(true); }}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        {s.edit}
                      </button>
                      <button
                        onClick={() => { if (window.confirm(s.confirm_delete)) removeSession(session.id); }}
                        className="px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs"
                      >
                        {s.delete}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // --- RECORDINGS TAB ---
  const renderRecordingsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">{s.recordings}</h3>
        <button
          onClick={() => { setEditingItem(null); setShowRecordingForm(true); }}
          className="px-4 py-2 bg-[#3d66f1] text-white rounded-xl text-sm font-bold hover:bg-[#3d66f1]/90 transition-colors"
        >
          {s.upload_recording}
        </button>
      </div>

      {showRecordingForm && <RecordingForm courses={myCourses} recording={editingItem} onClose={() => setShowRecordingForm(false)} />}

      <div className="space-y-3">
        {myRecordings.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No recordings yet.</p>
        ) : (
          myRecordings.map(rec => {
            const course = courses.find(c => c.id === rec.courseId);
            return (
              <div key={rec.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900">{rec.title}</h4>
                  <div className="text-sm text-slate-500">
                    {course && <span className="me-3">{course.title}</span>}
                    <span className="capitalize">{rec.storageType.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingItem(rec); setShowRecordingForm(true); }} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50">{s.edit}</button>
                  <button onClick={() => { if (window.confirm(s.confirm_delete)) removeRecording(rec.id); }} className="px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs">{s.delete}</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // --- QUIZZES TAB ---
  const renderQuizzesTab = () => {
    if (viewingQuizSubs) {
      const quiz = myQuizzes.find(q => q.id === viewingQuizSubs);
      return (
        <div className="space-y-4">
          <button onClick={() => setViewingQuizSubs(null)} className="flex items-center gap-2 text-slate-600 hover:text-[#3d66f1]">
            <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {s.back}
          </button>
          <h3 className="text-lg font-bold text-slate-900">{s.submissions} - {quiz?.title}</h3>
          {quizSubmissions.length === 0 ? (
            <p className="text-slate-500 text-center py-8">{s.no_submissions}</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-start px-4 py-3 font-bold text-slate-700">Student</th>
                    <th className="text-start px-4 py-3 font-bold text-slate-700">{s.score}</th>
                    <th className="text-start px-4 py-3 font-bold text-slate-700">Status</th>
                    <th className="text-start px-4 py-3 font-bold text-slate-700">Attempt</th>
                    <th className="text-start px-4 py-3 font-bold text-slate-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quizSubmissions.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0)).map(sub => (
                    <tr key={sub.id}>
                      <td className="px-4 py-3 text-slate-900">{sub.userId}</td>
                      <td className="px-4 py-3 font-bold">{sub.percentage}%</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sub.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {sub.passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">#{sub.attemptNumber}</td>
                      <td className="px-4 py-3 text-slate-500">{sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{s.quizzes}</h3>
          <button
            onClick={() => { setEditingItem(null); setShowQuizForm(true); }}
            className="px-4 py-2 bg-[#3d66f1] text-white rounded-xl text-sm font-bold hover:bg-[#3d66f1]/90 transition-colors"
          >
            {s.create_quiz}
          </button>
        </div>

        {showQuizForm && <QuizForm courses={myCourses} quiz={editingItem} onClose={() => setShowQuizForm(false)} />}

        <div className="space-y-3">
          {myQuizzes.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No quizzes yet.</p>
          ) : (
            myQuizzes.map(quiz => {
              const course = courses.find(c => c.id === quiz.courseId);
              return (
                <div key={quiz.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{quiz.title}</h4>
                    <div className="text-sm text-slate-500">
                      {course && <span className="me-3">{course.title}</span>}
                      <span>{quiz.questionCount} questions</span>
                      {quiz.timeLimitMinutes && <span className="ms-3">{quiz.timeLimitMinutes} min</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setViewingQuizSubs(quiz.id)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50">{s.submissions}</button>
                    <button onClick={() => { setEditingItem(quiz); setShowQuizForm(true); }} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50">{s.edit}</button>
                    <button onClick={() => { if (window.confirm(s.confirm_delete)) removeQuiz(quiz.id); }} className="px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs">{s.delete}</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // --- CAPSTONES TAB ---
  const renderCapstonesTab = () => {
    if (gradingSubmission) {
      return (
        <div className="space-y-4">
          <button onClick={() => setGradingSubmission(null)} className="flex items-center gap-2 text-slate-600 hover:text-[#3d66f1]">
            <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {s.back}
          </button>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">{s.grade} - {gradingSubmission.userId}</h3>
            <div className="bg-slate-50 p-4 rounded-xl">
              <h4 className="font-bold text-sm text-slate-700 mb-2">Response:</h4>
              <div className="text-slate-700 whitespace-pre-wrap text-sm">{gradingSubmission.textResponse}</div>
            </div>
            {gradingSubmission.links.length > 0 && (
              <div>
                <h4 className="font-bold text-sm text-slate-700 mb-2">Links:</h4>
                {gradingSubmission.links.map((link, i) => (
                  <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="block text-sm text-[#3d66f1] hover:underline">{link}</a>
                ))}
              </div>
            )}
            {gradingSubmission.files.length > 0 && (
              <div>
                <h4 className="font-bold text-sm text-slate-700 mb-2">Files:</h4>
                {gradingSubmission.files.map((f, i) => (
                  <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="block text-sm text-[#3d66f1] hover:underline">{f.name}</a>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">{s.score}</label>
                <input
                  type="number" min="0" value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-[#3d66f1] outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">{s.feedback}</label>
              <textarea
                value={gradeFeedback} onChange={(e) => setGradeFeedback(e.target.value)}
                rows={4} placeholder={s.feedback_placeholder}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-[#3d66f1] outline-none resize-y"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  await editCapstoneSubmission(gradingSubmission.id, {
                    status: 'graded', score: Number(gradeScore), feedback: gradeFeedback,
                    gradedBy: user?.displayName, gradedAt: Date.now(),
                  });
                  setGradingSubmission(null);
                }}
                className="px-6 py-2.5 bg-[#3d66f1] text-white rounded-xl font-bold hover:bg-[#3d66f1]/90"
              >
                {s.save_grade}
              </button>
              <button
                onClick={async () => {
                  await editCapstoneSubmission(gradingSubmission.id, {
                    status: 'resubmit_requested', feedback: gradeFeedback,
                    gradedBy: user?.displayName, gradedAt: Date.now(),
                  });
                  setGradingSubmission(null);
                }}
                className="px-6 py-2.5 border border-amber-300 text-amber-700 rounded-xl font-bold hover:bg-amber-50"
              >
                {s.return_for_revision}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (viewingCapstoneSubs) {
      const cap = myCapstones.find(c => c.id === viewingCapstoneSubs);
      return (
        <div className="space-y-4">
          <button onClick={() => setViewingCapstoneSubs(null)} className="flex items-center gap-2 text-slate-600 hover:text-[#3d66f1]">
            <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {s.back}
          </button>
          <h3 className="text-lg font-bold text-slate-900">{s.submissions} - {cap?.title}</h3>
          {capstoneSubmissions.length === 0 ? (
            <p className="text-slate-500 text-center py-8">{s.no_submissions}</p>
          ) : (
            <div className="space-y-3">
              {capstoneSubmissions.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0)).map(sub => (
                <div key={sub.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900">{sub.userId}</h4>
                    <div className="text-sm text-slate-500">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        sub.status === 'graded' ? 'bg-green-100 text-green-700' :
                        sub.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                        sub.status === 'resubmit_requested' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{sub.status}</span>
                      {sub.score !== undefined && <span className="ms-3 font-medium">{s.score}: {sub.score}/{cap?.maxScore}</span>}
                      <span className="ms-3">{sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : '-'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setGradingSubmission(sub); setGradeScore(String(sub.score || '')); setGradeFeedback(sub.feedback || ''); }}
                    className="px-4 py-2 bg-[#3d66f1] text-white rounded-xl text-sm font-bold hover:bg-[#3d66f1]/90"
                  >
                    {sub.status === 'graded' ? s.view_submission : s.grade}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{s.capstones}</h3>
          <button
            onClick={() => { setEditingItem(null); setShowCapstoneForm(true); }}
            className="px-4 py-2 bg-[#3d66f1] text-white rounded-xl text-sm font-bold hover:bg-[#3d66f1]/90 transition-colors"
          >
            {s.create_capstone}
          </button>
        </div>

        {showCapstoneForm && <CapstoneForm courses={myCourses} capstone={editingItem} onClose={() => setShowCapstoneForm(false)} />}

        <div className="space-y-3">
          {myCapstones.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No capstones yet.</p>
          ) : (
            myCapstones.map(cap => {
              const course = courses.find(c => c.id === cap.courseId);
              return (
                <div key={cap.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{cap.title}</h4>
                    <div className="text-sm text-slate-500">
                      {course && <span className="me-3">{course.title}</span>}
                      {cap.dueDate && <span>Due: {new Date(cap.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setViewingCapstoneSubs(cap.id)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50">{s.submissions}</button>
                    <button onClick={() => { setEditingItem(cap); setShowCapstoneForm(true); }} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50">{s.edit}</button>
                    <button onClick={() => { if (window.confirm(s.confirm_delete)) removeCapstone(cap.id); }} className="px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs">{s.delete}</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // --- PROGRESS TAB ---
  const renderProgressTab = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900">{s.student_progress}</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <div className="text-sm text-slate-500">{s.total_students}</div>
            <div className="text-2xl font-black text-[#3d66f1]">{myStudentCount}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <div className="text-sm text-slate-500">{s.my_courses}</div>
            <div className="text-2xl font-black text-[#0da993]">{myCourses.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <div className="text-sm text-slate-500">{s.sessions}</div>
            <div className="text-2xl font-black text-[#f59e0b]">{mySessions.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <div className="text-sm text-slate-500">{s.quizzes}</div>
            <div className="text-2xl font-black text-[#8b5cf6]">{myQuizzes.length}</div>
          </div>
        </div>

        {myCourses.map(course => {
          const progressList = courseProgressMap[course.id] || [];
          const enrolled = enrollments.filter(e => e.courseId === course.id && e.status !== 'cancelled');
          const avgProgress = progressList.length > 0
            ? Math.round(progressList.reduce((sum, p) => sum + (p.overallCompletionPercent || 0), 0) / progressList.length)
            : 0;

          return (
            <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">{course.title}</h4>
                    <p className="text-sm text-slate-500">{enrolled.length} students enrolled</p>
                  </div>
                  <div className="text-end">
                    <div className="text-sm text-slate-500">Avg Progress</div>
                    <div className="text-xl font-black text-[#0da993]">{avgProgress}%</div>
                  </div>
                </div>
              </div>
              {progressList.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {progressList.map(p => {
                    const enrollment = enrolled.find(e => e.studentId === p.userId || e.studentEmail === p.userId);
                    return (
                      <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                        <span className="text-sm text-slate-700">{enrollment?.studentName || p.userId}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#0da993] rounded-full" style={{ width: `${p.overallCompletionPercent || 0}%` }} />
                          </div>
                          <span className="text-sm font-bold text-slate-700 w-10 text-end">{p.overallCompletionPercent || 0}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-5 text-center text-sm text-slate-400">No progress data yet</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 start-0 z-50 w-64 bg-white border-e border-slate-200 transform transition-transform lg:transform-none ${
        sidebarOpen ? 'translate-x-0 rtl:-translate-x-0' : '-translate-x-full rtl:translate-x-full lg:translate-x-0 lg:rtl:-translate-x-0'
      }`}>
        <Sidebar />
      </aside>

      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100">
                <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-black text-slate-900">{s.dashboard}</h1>
                <p className="text-sm text-slate-500">{user?.displayName}</p>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#3d66f1]/10 flex items-center justify-center">
              <span className="text-[#3d66f1] font-bold text-sm">{user?.displayName?.charAt(0).toUpperCase() || 'I'}</span>
            </div>
          </div>
        </header>
        <div className="px-4 lg:px-8 py-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// --- FORM COMPONENTS ---

const SessionForm: React.FC<{ courses: Course[]; session?: LiveSession; onClose: () => void }> = ({ courses, session, onClose }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const s = t.instructor;
  const [title, setTitle] = useState(session?.title || '');
  const [description, setDescription] = useState(session?.description || '');
  const [courseId, setCourseId] = useState(session?.courseId || (courses[0]?.id || ''));
  const [scheduledAt, setScheduledAt] = useState(session ? new Date(session.scheduledStartTime).toISOString().slice(0, 16) : '');
  const [duration, setDuration] = useState(String(session ? Math.round((session.scheduledEndTime - session.scheduledStartTime) / 60000) : 60));
  const [roomName, setRoomName] = useState(session?.roomName || `elite-${Date.now()}`);
  const [roomPassword, setRoomPassword] = useState(session?.roomPassword || '');
  const [meetingUrl, setMeetingUrl] = useState(session?.meetingUrl || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title || !courseId || !scheduledAt || !user) return;
    setSaving(true);
    const startTime = new Date(scheduledAt).getTime();
    const data: Record<string, any> = {
      courseId,
      title,
      description,
      instructorId: user.id,
      scheduledStartTime: startTime,
      scheduledEndTime: startTime + Number(duration) * 60000,
      status: 'scheduled' as const,
      platform: 'jitsi' as const,
      roomName,
      roomPassword: roomPassword || undefined,
      recordingEnabled: false,
      createdAt: session?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    if (meetingUrl.trim()) data.meetingUrl = meetingUrl.trim();
    if (session) {
      await editSession(session.id, data as any);
    } else {
      await createSession(data as any);
    }
    setSaving(false);
    onClose();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
      <h3 className="text-lg font-bold text-slate-900">{session ? s.edit : s.schedule_session}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label={s.session_title} required>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" />
        </FormField>
        <FormField label={s.session_course} required>
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="form-input">
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </FormField>
        <FormField label={s.session_date} required>
          <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="form-input" />
        </FormField>
        <FormField label={s.session_duration}>
          <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="form-input" />
        </FormField>
        <FormField label={s.session_room_name}>
          <input value={roomName} onChange={(e) => setRoomName(e.target.value)} className="form-input" />
        </FormField>
        <FormField label={s.session_room_password}>
          <input value={roomPassword} onChange={(e) => setRoomPassword(e.target.value)} className="form-input" />
        </FormField>
        <FormField label={s.meeting_url || 'Meeting URL (optional)'}>
          <input value={meetingUrl} onChange={(e) => setMeetingUrl(e.target.value)} placeholder="https://meet.google.com/... or leave blank for Jitsi" className="form-input" />
        </FormField>
      </div>
      <FormField label={s.session_description}>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="form-input resize-y" />
      </FormField>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-xl text-sm">{s.cancel}</button>
        <button onClick={handleSave} disabled={saving || !title || !scheduledAt} className="px-6 py-2 bg-[#3d66f1] text-white rounded-xl text-sm font-bold disabled:opacity-50">{saving ? '...' : s.save}</button>
      </div>
    </div>
  );
};

const RecordingForm: React.FC<{ courses: Course[]; recording?: Recording; onClose: () => void }> = ({ courses, recording, onClose }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const s = t.instructor;
  const [title, setTitle] = useState(recording?.title || '');
  const [description, setDescription] = useState(recording?.description || '');
  const [courseId, setCourseId] = useState(recording?.courseId || (courses[0]?.id || ''));
  const [type, setType] = useState(recording?.storageType || 'youtube_unlisted');
  const [url, setUrl] = useState(recording?.url || '');
  const [order, setOrder] = useState(String(recording?.order || 0));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const downloadUrl = await uploadImage(file, `recordings/${courseId}/${Date.now()}_${file.name}`);
      setUrl(downloadUrl);
      setType('firebase_storage');
    } catch { /* error handling */ }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!title || !courseId || !url) return;
    setSaving(true);
    const data = {
      courseId, title, description,
      storageType: type as Recording['storageType'],
      url,
      instructorId: user?.id || '',
      processingStatus: 'ready' as const,
      visibility: 'enrolled_only' as const,
      viewCount: recording?.viewCount || 0,
      order: Number(order),
      createdAt: recording?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    if (recording) {
      await editRecording(recording.id, data);
    } else {
      await createRecording(data);
    }
    setSaving(false);
    onClose();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
      <h3 className="text-lg font-bold text-slate-900">{recording ? s.edit : s.upload_recording}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label={s.recording_title} required>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" />
        </FormField>
        <FormField label={s.recording_course} required>
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="form-input">
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </FormField>
        <FormField label={s.recording_type}>
          <select value={type} onChange={(e) => setType(e.target.value as 'firebase_storage' | 'youtube_unlisted' | 'external_url')} className="form-input">
            <option value="youtube_unlisted">{s.type_youtube}</option>
            <option value="external_url">{s.type_external}</option>
            <option value="firebase_storage">{s.type_firebase}</option>
          </select>
        </FormField>
        <FormField label={s.recording_order}>
          <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className="form-input" />
        </FormField>
      </div>
      {type === 'firebase_storage' ? (
        <FormField label={s.type_firebase}>
          <div className="flex gap-3 items-center">
            <label className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 rounded-xl text-sm cursor-pointer hover:border-[#3d66f1]">
              {uploading ? '...' : s.type_firebase}
              <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
            </label>
            {url && <span className="text-xs text-green-600 truncate flex-1">Uploaded</span>}
          </div>
        </FormField>
      ) : (
        <FormField label={s.recording_url} required>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="form-input" />
        </FormField>
      )}
      <FormField label={s.recording_description}>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="form-input resize-y" />
      </FormField>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-xl text-sm">{s.cancel}</button>
        <button onClick={handleSave} disabled={saving || !title || !url} className="px-6 py-2 bg-[#3d66f1] text-white rounded-xl text-sm font-bold disabled:opacity-50">{saving ? '...' : s.save}</button>
      </div>
    </div>
  );
};

const QuizForm: React.FC<{ courses: Course[]; quiz?: Quiz; onClose: () => void }> = ({ courses, quiz, onClose }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const s = t.instructor;
  const [title, setTitle] = useState(quiz?.title || '');
  const [description, setDescription] = useState(quiz?.description || '');
  const [courseId, setCourseId] = useState(quiz?.courseId || (courses[0]?.id || ''));
  const [timeLimit, setTimeLimit] = useState(String(quiz?.timeLimitMinutes || ''));
  const [passingScore, setPassingScore] = useState(String(quiz?.passingScore || 60));
  const [maxAttempts, setMaxAttempts] = useState(String(quiz?.maxAttempts || 3));
  const [shuffleQuestions, setShuffleQuestions] = useState(quiz?.shuffleQuestions ?? false);
  const [showResults, setShowResults] = useState(quiz?.showResultsToStudent ?? true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, {
      id: `q_${Date.now()}`,
      questionText: '',
      questionType: 'mcq',
      options: [{ id: `o_${Date.now()}_0`, text: '', isCorrect: true }, { id: `o_${Date.now()}_1`, text: '', isCorrect: false }, { id: `o_${Date.now()}_2`, text: '', isCorrect: false }, { id: `o_${Date.now()}_3`, text: '', isCorrect: false }],
      correctAnswer: '0',
      marks: 1,
      order: questions.length,
      explanation: '',
    }]);
  };

  const updateQuestion = (idx: number, updates: Partial<QuizQuestion>) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], ...updates };
    setQuestions(updated);
  };

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    const q = questions[qIdx];
    const opts = [...(q.options || [])];
    opts[oIdx] = { ...opts[oIdx], text: value };
    updateQuestion(qIdx, { options: opts });
  };

  const addOption = (qIdx: number) => {
    const q = questions[qIdx];
    updateQuestion(qIdx, { options: [...(q.options || []), { id: `o_${Date.now()}`, text: '', isCorrect: false }] });
  };

  const setCorrectOption = (qIdx: number, correctIdx: number) => {
    const q = questions[qIdx];
    const opts = q.options.map((o, i) => ({ ...o, isCorrect: i === correctIdx }));
    updateQuestion(qIdx, { options: opts });
  };

  const handleSave = async () => {
    if (!title || !courseId || questions.length === 0) return;
    setSaving(true);
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    const data = {
      courseId, title, description,
      instructorId: user?.id || '',
      timeLimitMinutes: timeLimit ? Number(timeLimit) : undefined,
      passingScore: Number(passingScore),
      maxAttempts: Number(maxAttempts),
      shuffleQuestions,
      shuffleOptions: false,
      showResultsToStudent: showResults,
      status: 'published' as const,
      totalMarks,
      questionCount: questions.length,
      createdAt: quiz?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    if (quiz) {
      await editQuiz(quiz.id, data as any);
    } else {
      await createQuiz(data as any);
    }
    setSaving(false);
    onClose();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4 max-h-[80vh] overflow-y-auto">
      <h3 className="text-lg font-bold text-slate-900">{quiz ? s.edit : s.create_quiz}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label={s.quiz_title} required>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" />
        </FormField>
        <FormField label={s.quiz_course} required>
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="form-input">
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </FormField>
        <FormField label={s.quiz_time_limit}>
          <input type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} placeholder="No limit" className="form-input" />
        </FormField>
        <FormField label={s.quiz_passing_score}>
          <input type="number" value={passingScore} onChange={(e) => setPassingScore(e.target.value)} className="form-input" />
        </FormField>
        <FormField label={s.quiz_max_attempts}>
          <input type="number" value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value)} className="form-input" />
        </FormField>
        <div className="flex items-center gap-6 pt-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={shuffleQuestions} onChange={(e) => setShuffleQuestions(e.target.checked)} className="rounded" />
            {s.quiz_shuffle}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showResults} onChange={(e) => setShowResults(e.target.checked)} className="rounded" />
            {s.quiz_show_results}
          </label>
        </div>
      </div>
      <FormField label={s.quiz_description}>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="form-input resize-y" />
      </FormField>

      <div className="border-t border-slate-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-slate-900">Questions ({questions.length})</h4>
          <button onClick={addQuestion} className="px-4 py-1.5 bg-[#3d66f1] text-white rounded-lg text-sm font-bold">{s.add_question}</button>
        </div>
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">#{idx + 1}</span>
                <button onClick={() => removeQuestion(idx)} className="text-red-500 text-xs hover:underline">{s.remove_question}</button>
              </div>
              <FormField label={s.question_text}>
                <input value={q.questionText} onChange={(e) => updateQuestion(idx, { questionText: e.target.value })} className="form-input" />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label={s.question_type}>
                  <select value={q.questionType} onChange={(e) => updateQuestion(idx, {
                    questionType: e.target.value as QuizQuestion['questionType'],
                    options: e.target.value === 'mcq' ? [{ id: `o_${Date.now()}_0`, text: '', isCorrect: true }, { id: `o_${Date.now()}_1`, text: '', isCorrect: false }, { id: `o_${Date.now()}_2`, text: '', isCorrect: false }, { id: `o_${Date.now()}_3`, text: '', isCorrect: false }] : [],
                    correctAnswer: e.target.value === 'true_false' ? 'true' : undefined,
                  })} className="form-input">
                    <option value="mcq">{s.question_mcq}</option>
                    <option value="true_false">{s.question_true_false}</option>
                    <option value="short_answer">{s.question_short_answer}</option>
                  </select>
                </FormField>
                <FormField label={s.question_points}>
                  <input type="number" value={q.marks} onChange={(e) => updateQuestion(idx, { marks: Number(e.target.value) })} className="form-input" />
                </FormField>
              </div>
              {q.questionType === 'mcq' && q.options && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600">{s.question_options}</label>
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <input
                        type="radio" name={`correct_${q.id}`}
                        checked={opt.isCorrect}
                        onChange={() => setCorrectOption(idx, oIdx)}
                        className="text-[#3d66f1]"
                      />
                      <input
                        value={opt.text}
                        onChange={(e) => updateOption(idx, oIdx, e.target.value)}
                        placeholder={`Option ${oIdx + 1}`}
                        className="form-input flex-1"
                      />
                    </div>
                  ))}
                  <button onClick={() => addOption(idx)} className="text-xs text-[#3d66f1] font-medium">+ {s.question_add_option}</button>
                </div>
              )}
              {q.questionType === 'true_false' && (
                <FormField label={s.question_correct_answer}>
                  <select value={q.correctAnswer} onChange={(e) => updateQuestion(idx, { correctAnswer: e.target.value })} className="form-input">
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </FormField>
              )}
              {q.questionType === 'short_answer' && (
                <FormField label={s.question_correct_answer}>
                  <input value={q.correctAnswer} onChange={(e) => updateQuestion(idx, { correctAnswer: e.target.value })} className="form-input" />
                </FormField>
              )}
              <FormField label={s.question_explanation}>
                <input value={q.explanation || ''} onChange={(e) => updateQuestion(idx, { explanation: e.target.value })} className="form-input" />
              </FormField>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-xl text-sm">{s.cancel}</button>
        <button onClick={handleSave} disabled={saving || !title || questions.length === 0} className="px-6 py-2 bg-[#3d66f1] text-white rounded-xl text-sm font-bold disabled:opacity-50">{saving ? '...' : s.save}</button>
      </div>
    </div>
  );
};

const CapstoneForm: React.FC<{ courses: Course[]; capstone?: Capstone; onClose: () => void }> = ({ courses, capstone, onClose }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const s = t.instructor;
  const [title, setTitle] = useState(capstone?.title || '');
  const [instructions, setInstructions] = useState(capstone?.instructions || '');
  const [rubric, setRubric] = useState(capstone?.rubric || '');
  const [courseId, setCourseId] = useState(capstone?.courseId || (courses[0]?.id || ''));
  const [maxScore, setMaxScore] = useState(String(capstone?.maxScore || 100));
  const [dueDate, setDueDate] = useState(capstone?.dueDate ? new Date(capstone.dueDate).toISOString().slice(0, 10) : '');
  const [allowLateSubmission, setAllowLateSubmission] = useState(capstone?.allowLateSubmission ?? false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title || !courseId || !instructions) return;
    setSaving(true);
    const data = {
      courseId, title, instructions, rubric,
      instructorId: user?.id || '',
      maxScore: Number(maxScore),
      dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
      status: 'published' as const,
      allowLateSubmission,
      resources: capstone?.resources || [],
      createdAt: capstone?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    if (capstone) {
      await editCapstone(capstone.id, data as any);
    } else {
      await createCapstone(data as any);
    }
    setSaving(false);
    onClose();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
      <h3 className="text-lg font-bold text-slate-900">{capstone ? s.edit : s.create_capstone}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label={s.capstone_title} required>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" />
        </FormField>
        <FormField label={s.capstone_course} required>
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="form-input">
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </FormField>
        <FormField label={s.capstone_max_score}>
          <input type="number" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} className="form-input" />
        </FormField>
        <FormField label={s.capstone_due_date}>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="form-input" />
        </FormField>
        <div className="flex items-center gap-6 pt-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={allowLateSubmission} onChange={(e) => setAllowLateSubmission(e.target.checked)} className="rounded" />
            {s.capstone_allow_links || 'Allow Late Submission'}
          </label>
        </div>
      </div>
      <FormField label={s.capstone_instructions} required>
        <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={5} className="form-input resize-y" />
      </FormField>
      <FormField label={s.capstone_rubric}>
        <textarea value={rubric} onChange={(e) => setRubric(e.target.value)} rows={3} className="form-input resize-y" />
      </FormField>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-xl text-sm">{s.cancel}</button>
        <button onClick={handleSave} disabled={saving || !title || !instructions} className="px-6 py-2 bg-[#3d66f1] text-white rounded-xl text-sm font-bold disabled:opacity-50">{saving ? '...' : s.save}</button>
      </div>
    </div>
  );
};

const FormField: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-bold text-slate-700 mb-1">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        const existing = (child.props as any).className || '';
        if (existing === 'form-input') {
          return React.cloneElement(child as React.ReactElement<any>, {
            className: 'w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-[#3d66f1] focus:ring-1 focus:ring-[#3d66f1] outline-none text-sm',
          });
        }
      }
      return child;
    })}
  </div>
);

export default InstructorDashboardPage;
