import React, { useState } from 'react';
import { Course, Instructor } from '../types';
import { useLanguage } from '../components/LanguageContext';
import { useDataManager } from '../hooks/useDataManager';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import StatsOverview from '../components/dashboard/StatsOverview';
import CoursesTable from '../components/dashboard/CoursesTable';
import InstructorsTable from '../components/dashboard/InstructorsTable';
import CourseFormModal from '../components/dashboard/CourseFormModal';
import InstructorFormModal from '../components/dashboard/InstructorFormModal';
import DeleteConfirmModal from '../components/dashboard/DeleteConfirmModal';

const AUTH_KEY = 'elite_dashboard_auth';

type Tab = 'overview' | 'courses' | 'instructors';

const DashboardPage: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem(AUTH_KEY) === 'true'
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });

  const usernameEmpty = touched.username && !username.trim();
  const passwordEmpty = touched.password && !password.trim();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ username: true, password: true });

    if (!username.trim() || !password.trim()) {
      setLoginError(t.dashboard.login_fields_required);
      return;
    }

    setLoggingIn(true);
    setLoginError('');

    // Brief delay for UX feedback
    setTimeout(() => {
      if (username === 'admin' && password === 'Elite@2026') {
        setLoginSuccess(true);
        setLoginError('');
        // Short pause to show success before redirecting
        setTimeout(() => {
          sessionStorage.setItem(AUTH_KEY, 'true');
          setIsAuthenticated(true);
        }, 800);
      } else {
        setLoginError(t.dashboard.login_error);
        setLoggingIn(false);
      }
    }, 600);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setLoginError('');
  };

  // --- Login screen ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 transition-all duration-300">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-500 ${loginSuccess ? 'bg-emerald-500' : 'bg-teal-600'}`}>
                {loginSuccess ? (
                  <svg className="w-7 h-7 text-white animate-[bounceIn_0.4s_ease-out]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-white font-bold text-2xl font-heading">E</span>
                )}
              </div>
              <h1 className="text-2xl font-black text-slate-900 font-heading">
                {t.dashboard.login_title}
              </h1>
              <p className="text-sm text-slate-400 font-medium mt-1">{t.dashboard.login_subtitle}</p>
            </div>

            {/* Success message */}
            {loginSuccess && (
              <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 animate-[fadeSlideIn_0.3s_ease-out]">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-emerald-700">{t.dashboard.login_success}</span>
              </div>
            )}

            {/* Error message */}
            {loginError && !loginSuccess && (
              <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-[fadeSlideIn_0.3s_ease-out]">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-red-600">{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Username field */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {t.dashboard.login_username}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-4 rtl:pr-4 flex items-center pointer-events-none">
                    <svg className={`w-4 h-4 transition-colors ${usernameEmpty ? 'text-red-400' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setLoginError(''); }}
                    onBlur={() => setTouched(prev => ({ ...prev, username: true }))}
                    placeholder={t.dashboard.login_username_placeholder}
                    disabled={loggingIn}
                    className={`w-full pl-11 rtl:pl-4 rtl:pr-11 pr-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all disabled:opacity-60 ${
                      usernameEmpty
                        ? 'border-red-300 focus:ring-red-400'
                        : 'border-slate-200 focus:ring-teal-500 focus:border-transparent'
                    }`}
                    autoFocus
                  />
                </div>
                {usernameEmpty && (
                  <p className="mt-1.5 text-xs font-bold text-red-500 animate-[fadeSlideIn_0.2s_ease-out]">
                    {t.dashboard.login_username_required}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {t.dashboard.login_password}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-4 rtl:pr-4 flex items-center pointer-events-none">
                    <svg className={`w-4 h-4 transition-colors ${passwordEmpty ? 'text-red-400' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
                    onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                    placeholder={t.dashboard.login_password_placeholder}
                    disabled={loggingIn}
                    className={`w-full pl-11 rtl:pl-12 rtl:pr-11 pr-12 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all disabled:opacity-60 ${
                      passwordEmpty
                        ? 'border-red-300 focus:ring-red-400'
                        : 'border-slate-200 focus:ring-teal-500 focus:border-transparent'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-4 rtl:pl-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordEmpty && (
                  <p className="mt-1.5 text-xs font-bold text-red-500 animate-[fadeSlideIn_0.2s_ease-out]">
                    {t.dashboard.login_password_required}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className={`w-full py-3 font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 ${
                  loginSuccess
                    ? 'bg-emerald-500 text-white focus:ring-emerald-500'
                    : 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500'
                } disabled:cursor-not-allowed`}
              >
                {loggingIn && !loginSuccess && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {loginSuccess ? t.dashboard.login_redirecting : loggingIn ? t.dashboard.login_signing_in : t.dashboard.login_button}
              </button>
            </form>

            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="mt-6 w-full text-center text-sm font-bold text-slate-400 hover:text-teal-600 transition-colors"
            >
              {language === 'en' ? 'العربية' : 'English'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Authenticated dashboard ---
  return <AuthenticatedDashboard onLogout={handleLogout} key="dashboard" />;
};

// Separated to avoid calling useDataManager when not authenticated
const AuthenticatedDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { t } = useLanguage();
  const {
    courses,
    instructors,
    stats,
    loading,
    error,
    addCourse,
    updateCourse,
    deleteCourse,
    addInstructor,
    updateInstructor,
    deleteInstructor,
    resetToDefaults,
  } = useDataManager();

  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Course modal state
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Instructor modal state
  const [instructorModalOpen, setInstructorModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'course' | 'instructor'; id: string } | null>(null);

  // Course handlers
  const handleAddCourse = () => {
    setEditingCourse(null);
    setCourseModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseModalOpen(true);
  };

  const handleDeleteCourse = (course: Course) => {
    setDeleteTarget({ type: 'course', id: course.id });
    setDeleteModalOpen(true);
  };

  const handleSaveCourse = (data: Omit<Course, 'id'>) => {
    if (editingCourse) {
      updateCourse(editingCourse.id, data);
    } else {
      addCourse(data);
    }
    setCourseModalOpen(false);
  };

  // Instructor handlers
  const handleAddInstructor = () => {
    setEditingInstructor(null);
    setInstructorModalOpen(true);
  };

  const handleEditInstructor = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    setInstructorModalOpen(true);
  };

  const handleDeleteInstructor = (instructor: Instructor) => {
    setDeleteTarget({ type: 'instructor', id: instructor.id });
    setDeleteModalOpen(true);
  };

  const handleSaveInstructor = (data: Omit<Instructor, 'id'>) => {
    if (editingInstructor) {
      updateInstructor(editingInstructor.id, data);
    } else {
      addInstructor(data);
    }
    setInstructorModalOpen(false);
  };

  // Delete confirm
  const handleConfirmDelete = () => {
    if (deleteTarget) {
      if (deleteTarget.type === 'course') {
        deleteCourse(deleteTarget.id);
      } else {
        deleteInstructor(deleteTarget.id);
      }
    }
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 font-heading">{t.dashboard.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={resetToDefaults}
              className="px-4 py-2 text-sm font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
            >
              {t.dashboard.reset_data}
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm font-bold text-amber-700">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Tab Content */}
        {!loading && activeTab === 'overview' && (
          <div className="space-y-8">
            <StatsOverview stats={stats} />
            <CoursesTable courses={courses} onAdd={handleAddCourse} onEdit={handleEditCourse} onDelete={handleDeleteCourse} />
            <InstructorsTable instructors={instructors} onAdd={handleAddInstructor} onEdit={handleEditInstructor} onDelete={handleDeleteInstructor} />
          </div>
        )}

        {!loading && activeTab === 'courses' && (
          <CoursesTable courses={courses} onAdd={handleAddCourse} onEdit={handleEditCourse} onDelete={handleDeleteCourse} />
        )}

        {!loading && activeTab === 'instructors' && (
          <InstructorsTable instructors={instructors} onAdd={handleAddInstructor} onEdit={handleEditInstructor} onDelete={handleDeleteInstructor} />
        )}
      </div>

      {/* Modals */}
      <CourseFormModal
        isOpen={courseModalOpen}
        course={editingCourse}
        onClose={() => setCourseModalOpen(false)}
        onSave={handleSaveCourse}
      />
      <InstructorFormModal
        isOpen={instructorModalOpen}
        instructor={editingInstructor}
        onClose={() => setInstructorModalOpen(false)}
        onSave={handleSaveInstructor}
      />
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </DashboardLayout>
  );
};

export default DashboardPage;
