import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  subscribeCourses, subscribeEnrollments, subscribeSessions,
  subscribeRecordings, subscribeQuizzes, subscribeCapstones,
  subscribeCourseProgress, subscribeUserQuizSubmissions,
  subscribeUserCapstoneSubmissions, subscribeRecordingProgress,
} from '../services/firestoreService';
import {
  Course, Enrollment, LiveSession, Recording, Quiz, Capstone,
  CourseProgress, QuizSubmission, CapstoneSubmission as CapstoneSubmissionType,
  RecordingProgress,
} from '../types';
import QuizTaker from '../components/student/QuizTaker';
import CapstoneSubmissionComponent from '../components/student/CapstoneSubmission';
import SessionViewer from '../components/student/SessionViewer';
import RecordingPlayer from '../components/student/RecordingPlayer';

type StudentTab = 'courses' | 'sessions' | 'recordings' | 'quizzes' | 'capstones' | 'progress';

const StudentDashboardPage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const s = t.student;

  const [activeTab, setActiveTab] = useState<StudentTab>('courses');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [capstones, setCapstones] = useState<Capstone[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [quizSubmissions, setQuizSubmissions] = useState<QuizSubmission[]>([]);
  const [capstoneSubmissions, setCapstoneSubmissions] = useState<CapstoneSubmissionType[]>([]);
  const [recordingProgress, setRecordingProgress] = useState<RecordingProgress[]>([]);

  // Detail views
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedCapstone, setSelectedCapstone] = useState<Capstone | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsubs: (() => void)[] = [];
    unsubs.push(subscribeCourses(setCourses));
    unsubs.push(subscribeEnrollments(setEnrollments));
    unsubs.push(subscribeSessions(setSessions));
    unsubs.push(subscribeRecordings(setRecordings));
    unsubs.push(subscribeQuizzes(setQuizzes));
    unsubs.push(subscribeCapstones(setCapstones));
    unsubs.push(subscribeCourseProgress(user.id, setCourseProgress));
    unsubs.push(subscribeUserQuizSubmissions(user.id, setQuizSubmissions));
    unsubs.push(subscribeUserCapstoneSubmissions(user.id, setCapstoneSubmissions));
    unsubs.push(subscribeRecordingProgress(user.id, setRecordingProgress));
    return () => unsubs.forEach(u => u());
  }, [user]);

  // Filter to enrolled course IDs
  const enrolledCourseIds = useMemo(() => {
    if (!user) return [];
    return enrollments
      .filter(e => (e.studentId === user.id || e.studentEmail === user.email) && e.status !== 'cancelled')
      .map(e => e.courseId);
  }, [enrollments, user]);

  const enrolledCourses = useMemo(
    () => courses.filter(c => enrolledCourseIds.includes(c.id)),
    [courses, enrolledCourseIds]
  );

  const mySessions = useMemo(
    () => sessions.filter(s => enrolledCourseIds.includes(s.courseId)),
    [sessions, enrolledCourseIds]
  );

  const myRecordings = useMemo(
    () => recordings.filter(r => enrolledCourseIds.includes(r.courseId) && r.visibility !== 'unlisted'),
    [recordings, enrolledCourseIds]
  );

  const myQuizzes = useMemo(
    () => quizzes.filter(q => enrolledCourseIds.includes(q.courseId) && q.status === 'published'),
    [quizzes, enrolledCourseIds]
  );

  const myCapstones = useMemo(
    () => capstones.filter(c => enrolledCourseIds.includes(c.courseId) && c.status === 'published'),
    [capstones, enrolledCourseIds]
  );

  // Stats
  const sessionsAttended = useMemo(() => {
    return courseProgress.reduce((sum, p) => sum + (p.sessionsAttended || 0), 0);
  }, [courseProgress]);

  const quizAvg = useMemo(() => {
    if (quizSubmissions.length === 0) return 0;
    const total = quizSubmissions.reduce((sum, qs) => sum + qs.percentage, 0);
    return Math.round(total / quizSubmissions.length);
  }, [quizSubmissions]);

  const overallProgress = useMemo(() => {
    if (courseProgress.length === 0) return 0;
    const total = courseProgress.reduce((sum, p) => sum + (p.overallCompletionPercent || 0), 0);
    return Math.round(total / courseProgress.length);
  }, [courseProgress]);

  const tabs: { key: StudentTab; label: string; icon: React.ReactNode }[] = [
    {
      key: 'courses', label: s.my_courses,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    },
    {
      key: 'sessions', label: s.live_sessions,
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
      key: 'progress', label: s.my_progress,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getCourseForId = (id: string) => courses.find(c => c.id === id);

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-slate-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#0da993] flex items-center justify-center">
            <span className="text-white font-black text-sm">EA</span>
          </div>
          <span className="text-lg font-black text-slate-900">Elite Academy</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSidebarOpen(false); setSelectedSession(null); setSelectedRecording(null); setSelectedQuiz(null); setSelectedCapstone(null); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[#0da993]/10 text-[#0da993]'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-100 space-y-1">
        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
          {language === 'en' ? 'العربية' : 'English'}
        </button>
        <Link
          to="/"
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          {t.dashboard?.back_to_site || 'Back to Site'}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          {t.dashboard?.logout || 'Logout'}
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    // Detail views
    if (selectedSession) {
      return <SessionViewer session={selectedSession} onBack={() => setSelectedSession(null)} />;
    }
    if (selectedRecording) {
      const rp = recordingProgress.find(p => p.recordingId === selectedRecording.id);
      return (
        <RecordingPlayer
          recording={selectedRecording}
          progress={rp}
          onBack={() => setSelectedRecording(null)}
        />
      );
    }
    if (selectedQuiz) {
      const subs = quizSubmissions.filter(sub => sub.quizId === selectedQuiz.id);
      return (
        <QuizTaker
          quiz={selectedQuiz}
          existingSubmissions={subs}
          onBack={() => setSelectedQuiz(null)}
          onSubmitted={() => {}}
        />
      );
    }
    if (selectedCapstone) {
      const sub = capstoneSubmissions.find(cs => cs.capstoneId === selectedCapstone.id);
      return (
        <CapstoneSubmissionComponent
          capstone={selectedCapstone}
          existingSubmission={sub}
          onBack={() => setSelectedCapstone(null)}
          onSubmitted={() => setSelectedCapstone(null)}
        />
      );
    }

    switch (activeTab) {
      case 'courses': return renderCourses();
      case 'sessions': return renderSessions();
      case 'recordings': return renderRecordings();
      case 'quizzes': return renderQuizzes();
      case 'capstones': return renderCapstones();
      case 'progress': return renderProgress();
      default: return renderCourses();
    }
  };

  const renderCourses = () => {
    if (enrolledCourses.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{s.no_courses}</h3>
          <Link to="/" className="inline-block px-6 py-2.5 bg-[#0da993] text-white rounded-xl font-bold text-sm hover:bg-[#0da993]/90 transition-colors">
            {s.browse_courses}
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {enrolledCourses.map(course => {
          const progress = courseProgress.find(p => p.courseId === course.id);
          const pct = progress?.overallCompletionPercent || 0;
          return (
            <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              {course.image && (
                <div className="aspect-video bg-slate-100 overflow-hidden">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-5">
                <h3 className="font-bold text-slate-900 mb-1">{course.title}</h3>
                <p className="text-sm text-slate-500 mb-3">{course.instructor}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{s.overall_progress}</span>
                    <span className="font-bold text-[#0da993]">{pct}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0da993] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSessions = () => {
    const now = Date.now();
    const upcoming = mySessions.filter(s => s.status === 'scheduled' || s.status === 'live').sort((a, b) => a.scheduledStartTime - b.scheduledStartTime);
    const past = mySessions.filter(s => s.status === 'ended' || s.status === 'cancelled').sort((a, b) => b.scheduledStartTime - a.scheduledStartTime);

    if (mySessions.length === 0) {
      return <EmptyState message={s.no_sessions} icon="video" />;
    }

    const statusBadge = (status: string) => {
      const styles: Record<string, string> = {
        scheduled: 'bg-blue-100 text-blue-700',
        live: 'bg-green-100 text-green-700 animate-pulse',
        completed: 'bg-slate-100 text-slate-600',
        cancelled: 'bg-red-100 text-red-600',
      };
      const labels: Record<string, string> = {
        scheduled: s.session_scheduled,
        live: s.session_live,
        ended: s.session_completed,
        cancelled: s.session_cancelled,
      };
      return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.scheduled}`}>
          {labels[status] || status}
        </span>
      );
    };

    return (
      <div className="space-y-6">
        {upcoming.length > 0 && (
          <div>
            <h3 className="font-bold text-slate-900 mb-3">{s.upcoming_sessions}</h3>
            <div className="space-y-3">
              {upcoming.map(session => {
                const course = getCourseForId(session.courseId);
                return (
                  <div key={session.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900 truncate">{session.title}</h4>
                        {statusBadge(session.status)}
                      </div>
                      <div className="text-sm text-slate-500 space-x-3 rtl:space-x-reverse">
                        {course && <span>{course.title}</span>}
                        <span>{new Date(session.scheduledStartTime).toLocaleString()}</span>
                        <span>{Math.round((session.scheduledEndTime - session.scheduledStartTime) / 60000)} {s.minutes_abbr}</span>
                      </div>
                    </div>
                    {(session.status === 'scheduled' || session.status === 'live') && (
                      <button
                        onClick={() => setSelectedSession(session)}
                        className="flex-shrink-0 px-4 py-2 bg-[#0da993] text-white rounded-xl text-sm font-bold hover:bg-[#0da993]/90 transition-colors"
                      >
                        {s.join_session}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {past.length > 0 && (
          <div>
            <h3 className="font-bold text-slate-900 mb-3">{s.past_sessions}</h3>
            <div className="space-y-3">
              {past.map(session => {
                const course = getCourseForId(session.courseId);
                return (
                  <div key={session.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 opacity-75">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900">{session.title}</h4>
                      {statusBadge(session.status)}
                    </div>
                    <div className="text-sm text-slate-500">
                      {course && <span className="me-3">{course.title}</span>}
                      <span>{new Date(session.scheduledStartTime).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRecordings = () => {
    if (myRecordings.length === 0) {
      return <EmptyState message={s.no_recordings} icon="play" />;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {myRecordings.map(rec => {
          const rp = recordingProgress.find(p => p.recordingId === rec.id);
          const course = getCourseForId(rec.courseId);
          const pct = rp && rp.totalSeconds > 0 ? Math.round((rp.watchedSeconds / rp.totalSeconds) * 100) : 0;
          return (
            <div
              key={rec.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedRecording(rec)}
            >
              <div className="aspect-video bg-slate-800 flex items-center justify-center relative">
                {rec.thumbnailUrl ? (
                  <img src={rec.thumbnailUrl} alt={rec.title} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-16 h-16 text-white/30" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                )}
                {rp?.completed && (
                  <div className="absolute top-2 end-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                    {s.recording_completed}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 text-[#0da993] ms-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-slate-900 mb-1 truncate">{rec.title}</h4>
                {course && <p className="text-xs text-slate-500 mb-2">{course.title}</p>}
                {pct > 0 && (
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0da993] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderQuizzes = () => {
    if (myQuizzes.length === 0) {
      return <EmptyState message={s.no_quizzes} icon="quiz" />;
    }

    return (
      <div className="space-y-3">
        {myQuizzes.map(quiz => {
          const subs = quizSubmissions.filter(sub => sub.quizId === quiz.id);
          const best = subs.length > 0 ? subs.reduce((b, sub) => sub.percentage > b.percentage ? sub : b) : null;
          const course = getCourseForId(quiz.courseId);

          let status = s.quiz_not_started;
          let statusColor = 'bg-slate-100 text-slate-600';
          if (best) {
            if (best.passed) {
              status = s.quiz_passed;
              statusColor = 'bg-green-100 text-green-700';
            } else {
              status = s.quiz_failed;
              statusColor = 'bg-red-100 text-red-600';
            }
          }

          return (
            <div key={quiz.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-slate-900">{quiz.title}</h4>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor}`}>{status}</span>
                </div>
                <div className="text-sm text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                  {course && <span>{course.title}</span>}
                  <span>{quiz.questionCount} {s.quiz_question}s</span>
                  <span>{quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} ${s.quiz_minutes}` : s.quiz_no_limit}</span>
                  {best && <span>{s.quiz_score}: {best.percentage}%</span>}
                  <span>{s.quiz_attempts}: {subs.length}/{quiz.maxAttempts}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedQuiz(quiz)}
                className="flex-shrink-0 px-4 py-2 bg-[#3d66f1] text-white rounded-xl text-sm font-bold hover:bg-[#3d66f1]/90 transition-colors"
              >
                {best ? (subs.length < quiz.maxAttempts ? s.quiz_try_again : s.quiz_results) : s.start_quiz}
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCapstones = () => {
    if (myCapstones.length === 0) {
      return <EmptyState message={s.no_capstones} icon="capstone" />;
    }

    const statusMap: Record<string, { label: string; color: string }> = {
      assigned: { label: s.capstone_draft, color: 'bg-slate-100 text-slate-600' },
      submitted: { label: s.capstone_submitted, color: 'bg-blue-100 text-blue-700' },
      under_review: { label: s.capstone_submitted, color: 'bg-yellow-100 text-yellow-700' },
      graded: { label: s.capstone_graded, color: 'bg-green-100 text-green-700' },
      late: { label: s.capstone_returned, color: 'bg-red-100 text-red-600' },
      resubmit_requested: { label: s.capstone_returned, color: 'bg-amber-100 text-amber-700' },
    };

    return (
      <div className="space-y-3">
        {myCapstones.map(cap => {
          const sub = capstoneSubmissions.find(cs => cs.capstoneId === cap.id);
          const course = getCourseForId(cap.courseId);
          const st = sub ? statusMap[sub.status] : null;

          return (
            <div key={cap.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-slate-900">{cap.title}</h4>
                  {st && <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>}
                </div>
                <div className="text-sm text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                  {course && <span>{course.title}</span>}
                  {cap.dueDate && <span>{s.capstone_due_date}: {new Date(cap.dueDate).toLocaleDateString()}</span>}
                  {sub?.score !== undefined && <span>{s.capstone_score}: {sub.score}/{cap.maxScore}</span>}
                </div>
              </div>
              <button
                onClick={() => setSelectedCapstone(cap)}
                className="flex-shrink-0 px-4 py-2 bg-[#3d66f1] text-white rounded-xl text-sm font-bold hover:bg-[#3d66f1]/90 transition-colors"
              >
                {sub ? (sub.status === 'graded' ? s.quiz_results : s.submit_capstone) : s.submit_capstone}
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const renderProgress = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900">{s.progress_overview}</h3>

        {/* Overall stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label={s.courses_enrolled} value={enrolledCourses.length} color="#0da993" />
          <StatCard label={s.sessions_attended} value={sessionsAttended} color="#3d66f1" />
          <StatCard label={s.quiz_average} value={`${quizAvg}%`} color="#f59e0b" />
          <StatCard label={s.overall_progress} value={`${overallProgress}%`} color="#0da993" />
        </div>

        {/* Per-course progress */}
        <h3 className="text-lg font-bold text-slate-900 mt-8">{s.progress_by_course}</h3>
        {enrolledCourses.length === 0 ? (
          <p className="text-slate-500">{s.no_courses}</p>
        ) : (
          <div className="space-y-4">
            {enrolledCourses.map(course => {
              const cp = courseProgress.find(p => p.courseId === course.id);
              const courseRecordings = myRecordings.filter(r => r.courseId === course.id);
              const courseQuizzes = myQuizzes.filter(q => q.courseId === course.id);
              const courseSessions = mySessions.filter(sess => sess.courseId === course.id);
              const courseCapstoneItems = myCapstones.filter(c => c.courseId === course.id);

              const watchedCount = cp?.recordingsWatched || 0;
              const quizCount = cp?.quizzesCompleted || 0;
              const sessionCount = cp?.sessionsAttended || 0;

              return (
                <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900">{course.title}</h4>
                      <p className="text-sm text-slate-500">{course.instructor}</p>
                    </div>
                    <div className="text-2xl font-black text-[#0da993]">{cp?.overallCompletionPercent || 0}%</div>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-[#0da993] rounded-full transition-all duration-500" style={{ width: `${cp?.overallCompletionPercent || 0}%` }} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <div className="text-slate-500">{s.progress_recordings_watched}</div>
                      <div className="font-bold text-slate-900">{watchedCount} / {courseRecordings.length}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <div className="text-slate-500">{s.progress_quizzes_completed}</div>
                      <div className="font-bold text-slate-900">{quizCount} / {courseQuizzes.length}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <div className="text-slate-500">{s.progress_sessions_attended}</div>
                      <div className="font-bold text-slate-900">{sessionCount} / {courseSessions.length}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <div className="text-slate-500">{s.progress_capstone_status}</div>
                      <div className="font-bold text-slate-900">
                        {cp?.capstonesCompleted && cp.capstonesCompleted > 0 ? `${cp.capstoneAvgScore}%` : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 start-0 z-50 w-64 bg-white border-e border-slate-200 transform transition-transform lg:transform-none ${
        sidebarOpen ? 'translate-x-0 rtl:-translate-x-0' : '-translate-x-full rtl:translate-x-full lg:translate-x-0 lg:rtl:-translate-x-0'
      }`}>
        <Sidebar />
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
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
                <p className="text-sm text-slate-500">{s.welcome}, {user?.displayName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#0da993]/10 flex items-center justify-center">
                <span className="text-[#0da993] font-bold text-sm">
                  {user?.displayName?.charAt(0).toUpperCase() || 'S'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Stats bar */}
        <div className="px-4 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label={s.courses_enrolled} value={enrolledCourses.length} color="#0da993" />
            <StatCard label={s.sessions_attended} value={sessionsAttended} color="#3d66f1" />
            <StatCard label={s.quiz_average} value={`${quizAvg}%`} color="#f59e0b" />
            <StatCard label={s.overall_progress} value={`${overallProgress}%`} color="#0da993" />
          </div>

          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
    <div className="text-sm text-slate-500 mb-1">{label}</div>
    <div className="text-2xl font-black" style={{ color }}>{value}</div>
  </div>
);

const EmptyState: React.FC<{ message: string; icon: string }> = ({ message }) => (
  <div className="text-center py-16">
    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    </div>
    <p className="text-slate-500">{message}</p>
  </div>
);

export default StudentDashboardPage;
