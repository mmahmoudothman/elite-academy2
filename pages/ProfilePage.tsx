import React, { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../components/LanguageContext';
import { useDataManager } from '../hooks/useDataManager';
import { usePageView } from '../hooks/useAnalyticsTracker';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const getCountries = (t: any): Record<string, string> => ({
  EG: t.dashboard?.country_eg || 'Egypt',
  SA: t.dashboard?.country_sa || 'Saudi Arabia',
  AE: t.dashboard?.country_ae || 'UAE',
  KW: t.dashboard?.country_kw || 'Kuwait',
  QA: t.dashboard?.country_qa || 'Qatar',
  BH: t.dashboard?.country_bh || 'Bahrain',
  OM: t.dashboard?.country_om || 'Oman',
  JO: t.dashboard?.country_jo || 'Jordan',
  Other: t.dashboard?.country_other || 'Other',
});

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { enrollments, courses, updateStudent } = useDataManager() as any;
  usePageView('profile');
  const isRTL = language === 'ar';
  const COUNTRIES = getCountries(t);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    country: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        phone: user.phone || '',
        country: user.country || '',
      });
    }
  }, [user]);

  const userEnrollments = useMemo(() => {
    if (!user) return [];
    return (enrollments || []).filter(
      (e: any) => e.studentId === user.id || e.studentEmail === user.email
    );
  }, [enrollments, user]);

  const stats = useMemo(() => {
    const total = userEnrollments.length;
    const completed = userEnrollments.filter((e: any) => e.status === 'completed').length;
    const totalInvested = userEnrollments
      .filter((e: any) => e.paymentStatus === 'paid')
      .reduce((sum: number, e: any) => sum + e.paymentAmount, 0);
    return { total, completed, totalInvested };
  }, [userEnrollments]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#0da993] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateStudent(user.id, {
        displayName: formData.displayName,
        phone: formData.phone,
        country: formData.country,
        updatedAt: Date.now(),
      });
      toast.success(t?.profile_page?.profile_updated || 'Profile updated successfully');
      setIsEditing(false);
    } catch {
      toast.error(t?.profile_page?.profile_update_failed || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      super_admin: 'bg-red-100 text-red-700',
      admin: 'bg-purple-100 text-purple-700',
      instructor: 'bg-blue-100 text-blue-700',
      student: 'bg-[#0da993]/15 text-[#0da993]',
    };
    const labels: Record<string, string> = {
      super_admin: t.dashboard?.role_super_admin || 'Super Admin',
      admin: t.dashboard?.role_admin || 'Admin',
      instructor: t.dashboard?.role_instructor || 'Instructor',
      student: t.dashboard?.role_student || 'Student',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-black ${styles[role] || styles.student}`}>
        {labels[role] || role}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-[#0da993]/15 text-[#0da993]',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-black ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
        {status}
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-orange-100 text-orange-700',
      paid: 'bg-green-100 text-green-700',
      refunded: 'bg-slate-100 text-slate-600',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-black ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
        {status}
      </span>
    );
  };

  const memberSince = new Date(user.createdAt).toLocaleDateString(
    isRTL ? 'ar-EG' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className="min-h-screen bg-slate-50 transition-all duration-500">
      <Navbar onApplyClick={() => {}} />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Profile Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="h-32 sm:h-40 bg-gradient-to-r from-[#3d66f1] to-[#0da993] relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            </div>
            <div className="px-6 sm:px-8 pb-6 sm:pb-8 -mt-16 relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
                {/* Avatar */}
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-4xl sm:text-5xl font-black font-heading text-[#0da993] bg-[#0da993]/10 flex-shrink-0">
                  {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2 pb-1">
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3">
                    <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
                      {user.displayName}
                    </h1>
                    {getRoleBadge(user.role)}
                  </div>
                  <p className="text-slate-500 font-medium text-sm">
                    {t?.profile_page?.member_since || 'Member since'} {memberSince}
                  </p>
                </div>

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-5 py-2.5 rounded-xl font-black text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all active:scale-95"
                >
                  {isEditing
                    ? (t?.common?.cancel || 'Cancel')
                    : (t?.profile?.edit || 'Edit Profile')}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0da993]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#0da993]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{stats.total}</p>
                <p className="text-xs font-bold text-slate-400">{t?.profile_page?.courses_enrolled || 'Courses Enrolled'}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{stats.completed}</p>
                <p className="text-xs font-bold text-slate-400">{t?.profile_page?.completed_count || 'Completed'}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{stats.totalInvested.toLocaleString()}</p>
                <p className="text-xs font-bold text-slate-400">{t?.profile_page?.total_invested || 'Total Invested'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Info / Edit Form */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-5">
                <h2 className="text-lg font-black font-heading text-slate-900">
                  {t?.profile?.info || 'Account Info'}
                </h2>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                        {t?.profile?.name || 'Name'}
                      </label>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0da993] focus:border-transparent text-sm font-medium text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                        {t?.profile?.phone || 'Phone'}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0da993] focus:border-transparent text-sm font-medium text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                        {t?.profile?.country || 'Country'}
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0da993] focus:border-transparent text-sm font-medium text-slate-900 bg-white"
                      >
                        <option value="">{t?.profile_page?.select_country || 'Select country'}</option>
                        {Object.entries(COUNTRIES).map(([code, label]) => (
                          <option key={code} value={code}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full bg-[#0da993] text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-[#0da993]/90 transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving
                        ? (t?.profile_page?.saving || 'Saving...')
                        : (t?.profile?.save || 'Save Changes')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          {t?.profile?.name || 'Name'}
                        </p>
                        <p className="text-sm font-medium text-slate-900 truncate">{user.displayName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          {t?.profile_page?.email_address || 'Email'}
                        </p>
                        <p className="text-sm font-medium text-slate-900 truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          {t?.profile?.phone || 'Phone'}
                        </p>
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {user.phone || (t?.profile_page?.not_provided || 'Not provided')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          {t?.profile?.country || 'Country'}
                        </p>
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {COUNTRIES[user.country || ''] || user.country || (t?.profile_page?.not_provided || 'Not provided')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Settings */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-5">
                <h2 className="text-lg font-black font-heading text-slate-900">
                  {t?.profile_page?.account_settings || 'Account Settings'}
                </h2>

                <div className="space-y-4">
                  {/* Language Preference */}
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                      {t?.profile_page?.language_preference || 'Language Preference'}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setLanguage('en')}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-black transition-all ${
                          language === 'en'
                            ? 'bg-[#0da993] text-white shadow-lg shadow-[#0da993]/20'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setLanguage('ar')}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-black transition-all ${
                          language === 'ar'
                            ? 'bg-[#0da993] text-white shadow-lg shadow-[#0da993]/20'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        العربية
                      </button>
                    </div>
                  </div>

                  {/* Email (read-only) */}
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                      {t?.profile_page?.email_address || 'Email Address'}
                    </p>
                    <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600 font-medium">
                      {user.email}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {t?.profile_page?.email_cannot_change || 'Email cannot be changed'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enrollments Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black font-heading text-slate-900">
                    {t?.profile?.enrollments || 'My Enrollments'}
                  </h2>
                  <span className="text-xs font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                    {userEnrollments.length} {t?.profile_page?.courses_label || 'course(s)'}
                  </span>
                </div>

                {userEnrollments.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-400">
                      {t?.profile?.noEnrollments || 'You have not enrolled in any courses yet'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userEnrollments.map((enrollment: any) => {
                      const course = (courses || []).find((c: any) => c.id === enrollment.courseId);
                      return (
                        <div
                          key={enrollment.id}
                          className="rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all group overflow-hidden"
                        >
                          <div className="flex flex-col sm:flex-row">
                            {/* Course Image */}
                            {course?.image && (
                              <div className="sm:w-32 h-24 sm:h-auto flex-shrink-0">
                                <img
                                  src={course.image}
                                  alt={enrollment.courseTitle}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 p-4 sm:p-5">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-1.5">
                                  <h3 className="font-black text-slate-900 text-sm sm:text-base group-hover:text-[#0da993] transition-colors">
                                    {enrollment.courseTitle}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-2">
                                    {getStatusBadge(enrollment.status)}
                                    {getPaymentBadge(enrollment.paymentStatus)}
                                    {enrollment.paymentStatus === 'paid' && (
                                      <span className="text-xs font-bold text-slate-500">
                                        {enrollment.paymentAmount.toLocaleString()} {enrollment.paymentCurrency}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right sm:text-left flex-shrink-0">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    {t?.profile_page?.enrolled_date || 'Enrolled'}
                                  </p>
                                  <p className="text-sm font-medium text-slate-600">
                                    {new Date(enrollment.enrolledAt).toLocaleDateString(
                                      isRTL ? 'ar-EG' : 'en-US',
                                      { year: 'numeric', month: 'short', day: 'numeric' }
                                    )}
                                  </p>
                                  {enrollment.completedAt && (
                                    <>
                                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider mt-1">
                                        {t?.profile_page?.completed_date || 'Completed'}
                                      </p>
                                      <p className="text-sm font-medium text-emerald-600">
                                        {new Date(enrollment.completedAt).toLocaleDateString(
                                          isRTL ? 'ar-EG' : 'en-US',
                                          { year: 'numeric', month: 'short', day: 'numeric' }
                                        )}
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
