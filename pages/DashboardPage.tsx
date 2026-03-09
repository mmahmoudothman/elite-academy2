import React, { useState } from 'react';
import { Course, Instructor, User, Testimonial, FAQ, Category, NewsletterSubscription, Enrollment, Ad, CourseFinancials, UserRole, Student, StudentGroup } from '../types';
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useDataManager } from '../hooks/useDataManager';
import DashboardLayout, { type Tab } from '../components/dashboard/DashboardLayout';
import StatsOverview from '../components/dashboard/StatsOverview';
import CoursesTable from '../components/dashboard/CoursesTable';
import InstructorsTable from '../components/dashboard/InstructorsTable';
import StudentsTable from '../components/dashboard/StudentsTable';
import EnrollmentsTable from '../components/dashboard/EnrollmentsTable';
import ContactsTable from '../components/dashboard/ContactsTable';
import AnalyticsOverview from '../components/dashboard/AnalyticsOverview';
import SiteConfigEditor from '../components/dashboard/SiteConfigEditor';
import CourseFormModal from '../components/dashboard/CourseFormModal';
import InstructorFormModal from '../components/dashboard/InstructorFormModal';
import DeleteConfirmModal from '../components/dashboard/DeleteConfirmModal';
import StudentFormModal from '../components/dashboard/StudentFormModal';
import TestimonialsTable from '../components/dashboard/TestimonialsTable';
import TestimonialFormModal from '../components/dashboard/TestimonialFormModal';
import FAQsTable from '../components/dashboard/FAQsTable';
import FAQFormModal from '../components/dashboard/FAQFormModal';
import CategoriesTable from '../components/dashboard/CategoriesTable';
import CategoryFormModal from '../components/dashboard/CategoryFormModal';
import AuditLogTable from '../components/dashboard/AuditLogTable';
import NewsletterTable from '../components/dashboard/NewsletterTable';
import UsersTable from '../components/dashboard/UsersTable';
import GroupsTable from '../components/dashboard/GroupsTable';
import GroupFormModal from '../components/dashboard/GroupFormModal';
import AdsTable from '../components/dashboard/AdsTable';
import AdFormModal from '../components/dashboard/AdFormModal';
import FinancialsTable from '../components/dashboard/FinancialsTable';
import RoleManagement from '../components/dashboard/RoleManagement';
import InvoiceView from '../components/enrollment/InvoiceView';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { exportToCsv } from '../utils/exportCsv';
import { isFirebaseConfigured } from '../services/firebase';
import { createUserAccount, updateUserAccount, deleteUserAccount, resetUserPassword } from '../services/localAuthService';

const DashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const { logout, user: currentUser } = useAuth();
  const { can } = usePermissions();

  const visibleTabs = React.useMemo(() => {
    const tabs: Tab[] = ['overview'];
    if (can('courses.view')) tabs.push('courses');
    if (can('instructors.view')) tabs.push('instructors');
    if (can('content.edit') || can('content.create')) tabs.push('categories');
    if (can('students.view')) tabs.push('students');
    if (can('students.view')) tabs.push('groups');
    if (can('users.view')) tabs.push('users');
    if (can('enrollments.view')) tabs.push('enrollments');
    if (can('contacts.view')) tabs.push('contacts');
    if (can('content.edit')) { tabs.push('newsletters'); tabs.push('testimonials'); tabs.push('faqs'); }
    if (can('ads.view')) tabs.push('ads');
    if (can('financials.view') || can('financial_reports.view')) tabs.push('financials');
    if (can('analytics.view')) tabs.push('analytics');
    if (can('roles.view') || can('roles.manage')) tabs.push('roles');
    if (can('audit.view')) tabs.push('audit');
    if (can('settings.view')) tabs.push('settings');
    return tabs;
  }, [currentUser?.role]);

  const {
    courses, instructors, enrollments, contacts,
    systemUsers, students, groups,
    stats, loading, error,
    testimonials = [], faqs = [], categories = [], newsletters = [], auditLog = [],
    ads = [], financials = [],
    addCourse, updateCourse, deleteCourse,
    addInstructor, updateInstructor, deleteInstructor,
    updateEnrollment, deleteEnrollment,
    updateContact, deleteContact,
    addSystemUser, updateSystemUser, deleteSystemUser,
    addStudent, updateStudent, deleteStudent,
    addGroup, updateGroup, deleteGroup,
    addTestimonial, updateTestimonial, deleteTestimonial,
    addFaq, updateFaq, deleteFaq,
    addCategory, updateCategory, deleteCategory,
    deleteNewsletter, updateNewsletter,
    addAd, updateAd, deleteAd,
    addFinancial, updateFinancial,
    addAuditLog,
    resetToDefaults,
  } = useDataManager() as any;

  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Course modals
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Instructor modals
  const [instructorModalOpen, setInstructorModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);

  // Testimonial modals
  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  // FAQ modals
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

  // Category modals
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Student modals
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Group modals
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<StudentGroup | null>(null);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string | undefined>(undefined);

  // Invoice modal
  const [invoiceEnrollment, setInvoiceEnrollment] = useState<Enrollment | null>(null);

  // Ad modal
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  const handleLogout = async () => { await logout(); };

  // ─── Course handlers ───
  const handleAddCourse = () => { setEditingCourse(null); setCourseModalOpen(true); };
  const handleEditCourse = (c: Course) => { setEditingCourse(c); setCourseModalOpen(true); };
  const handleDeleteCourse = (c: Course) => { setDeleteWarning(undefined); setDeleteTarget({ type: 'course', id: c.id }); setDeleteModalOpen(true); };
  const handleSaveCourse = (data: Omit<Course, 'id'>) => {
    if (editingCourse) updateCourse(editingCourse.id, data); else addCourse(data);
    setCourseModalOpen(false);
    toast.success(editingCourse ? (t.dashboard?.course_updated || 'Course updated') : (t.dashboard?.course_added || 'Course added'));
  };
  const handleToggleCourseVisibility = (c: Course) => {
    updateCourse(c.id, { visible: c.visible === false ? true : false });
  };

  // ─── Instructor handlers ───
  const handleAddInstructor = () => { setEditingInstructor(null); setInstructorModalOpen(true); };
  const handleEditInstructor = (i: Instructor) => { setEditingInstructor(i); setInstructorModalOpen(true); };
  const handleDeleteInstructor = (i: Instructor) => { setDeleteTarget({ type: 'instructor', id: i.id }); setDeleteModalOpen(true); };
  const handleSaveInstructor = (data: Omit<Instructor, 'id'>) => {
    if (editingInstructor) {
      const oldName = editingInstructor.name;
      updateInstructor(editingInstructor.id, data);
      if (data.name !== oldName) {
        courses.forEach((c: Course) => { if (c.instructor === oldName) updateCourse(c.id, { instructor: data.name }); });
      }
    } else addInstructor(data);
    setInstructorModalOpen(false);
    toast.success(editingInstructor ? (t.dashboard?.instructor_updated || 'Instructor updated') : (t.dashboard?.instructor_added || 'Instructor added'));
  };
  const handleToggleInstructorVisibility = (i: Instructor) => { updateInstructor(i.id, { visible: i.visible === false ? true : false }); };

  // ─── Enrollment handlers ───
  const handleUpdateEnrollmentStatus = (id: string, status: any) => {
    const enrollment = enrollments.find((e: any) => e.id === id);
    if (enrollment) {
      const wasCancelled = enrollment.status === 'cancelled';
      const isCancelling = status === 'cancelled';
      if (wasCancelled && !isCancelling) { const course = courses.find((c: any) => c.id === enrollment.courseId); if (course) updateCourse(course.id, { enrolled: course.enrolled + 1 }); }
      else if (!wasCancelled && isCancelling) { const course = courses.find((c: any) => c.id === enrollment.courseId); if (course && course.enrolled > 0) updateCourse(course.id, { enrolled: course.enrolled - 1 }); }
    }
    updateEnrollment(id, { status });
    toast.success(t.dashboard?.status_updated || 'Status updated');
  };
  const handleUpdatePaymentStatus = (id: string, paymentStatus: any) => { updateEnrollment(id, { paymentStatus }); toast.success(t.dashboard?.payment_status_updated || 'Payment status updated'); };

  // ─── Contact handlers ───
  const handleMarkRead = (id: string) => updateContact(id, { status: 'read' });
  const handleMarkResponded = (id: string) => { updateContact(id, { status: 'responded', respondedAt: Date.now() }); toast.success(t.dashboard?.marked_responded || 'Marked as responded'); };

  // ─── Student handlers (separate learner entities) ───
  const handleAddStudent = () => { setEditingStudent(null); setStudentModalOpen(true); };
  const handleViewStudent = (s: Student) => { setEditingStudent(s); setStudentModalOpen(true); };
  const handleToggleStudentActive = (s: Student) => {
    updateStudent(s.id, { isActive: !s.isActive });
    toast.success(s.isActive ? 'Student deactivated' : 'Student activated');
  };
  const handleDeleteStudent = (s: Student) => {
    deleteStudent(s.id);
    addAuditLog?.({ userId: currentUser?.id || '', userName: currentUser?.displayName || '', action: 'delete', entityType: 'student', entityId: s.id, details: `Deleted student: ${s.name} (${s.email})` });
    toast.success('Student deleted');
  };
  const handleSaveStudent = (data: Omit<Student, 'id'>) => {
    if (editingStudent) {
      updateStudent(editingStudent.id, data);
      toast.success('Student updated');
    } else {
      addStudent(data);
      addAuditLog?.({ userId: currentUser?.id || '', userName: currentUser?.displayName || '', action: 'create', entityType: 'student', details: `Added student: ${data.name} (${data.email})` });
      toast.success('Student added');
    }
    setStudentModalOpen(false);
  };

  // ─── Group handlers ───
  const handleAddGroup = () => { setEditingGroup(null); setGroupModalOpen(true); };
  const handleEditGroup = (g: StudentGroup) => { setEditingGroup(g); setGroupModalOpen(true); };
  const handleDeleteGroup = (g: StudentGroup) => {
    deleteGroup(g.id);
    addAuditLog?.({ userId: currentUser?.id || '', userName: currentUser?.displayName || '', action: 'delete', entityType: 'student', entityId: g.id, details: `Deleted group: ${g.name.en}` });
    toast.success('Group deleted');
  };
  const handleToggleGroupActive = (g: StudentGroup) => {
    updateGroup(g.id, { isActive: !g.isActive });
    toast.success(g.isActive ? 'Group deactivated' : 'Group activated');
  };
  const handleSaveGroup = (data: Omit<StudentGroup, 'id'>) => {
    if (editingGroup) {
      updateGroup(editingGroup.id, data);
      toast.success('Group updated');
    } else {
      addGroup(data);
      addAuditLog?.({ userId: currentUser?.id || '', userName: currentUser?.displayName || '', action: 'create', entityType: 'student', details: `Created group: ${data.name.en}` });
      toast.success('Group created');
    }
    setGroupModalOpen(false);
  };

  // ─── System User handlers (login accounts) ───
  const handleCreateUser = async (data: Omit<User, 'id'> & { password?: string }) => {
    try {
      if (!isFirebaseConfigured && data.password) {
        const newUser = await createUserAccount(data.email, data.password, data.displayName, data.role, data.isActive, { phone: data.phone, country: data.country });
        addSystemUser?.({ ...data, id: newUser.id } as any);
      } else {
        addSystemUser?.(data);
      }
      addAuditLog?.({ userId: currentUser?.id || '', userName: currentUser?.displayName || '', action: 'create', entityType: 'user', details: `Created user: ${data.displayName} (${data.email}) with role ${data.role}` });
      toast.success(t.dashboard?.create_user || 'User created');
    } catch (err: any) { toast.error(err.message || 'Failed to create user'); }
  };
  const handleToggleUserActive = async (u: User) => {
    const newActive = !u.isActive;
    updateSystemUser(u.id, { isActive: newActive });
    if (!isFirebaseConfigured) await updateUserAccount(u.id, { isActive: newActive }).catch(() => {});
    addAuditLog?.({ userId: currentUser?.id || '', userName: currentUser?.displayName || '', action: u.isActive ? 'deactivate' : 'activate', entityType: 'user', entityId: u.id, details: `${u.isActive ? 'Deactivated' : 'Activated'} user: ${u.displayName}` });
    toast.success(newActive ? (t.dashboard?.user_activated || 'User activated') : (t.dashboard?.user_deactivated || 'User deactivated'));
  };
  const handleChangeUserRole = async (id: string, role: UserRole) => {
    const user = systemUsers.find((s: User) => s.id === id);
    const oldRole = user?.role || 'unknown';
    updateSystemUser(id, { role });
    if (!isFirebaseConfigured) await updateUserAccount(id, { role }).catch(() => {});
    addAuditLog?.({ userId: currentUser?.id || '', userName: currentUser?.displayName || '', action: 'role_change', entityType: 'user', entityId: id, details: `Changed role of ${user?.displayName || id}: ${oldRole} → ${role}` });
    toast.success(t.dashboard?.role_changed || 'Role changed successfully');
  };
  const handleDeleteUser = (u: User) => {
    if (u.id === currentUser?.id) { toast.error('Cannot delete your own account'); return; }
    deleteSystemUser?.(u.id);
    if (!isFirebaseConfigured) deleteUserAccount(u.id);
    addAuditLog?.({ userId: currentUser?.id || '', userName: currentUser?.displayName || '', action: 'delete', entityType: 'user', entityId: u.id, details: `Deleted user: ${u.displayName} (${u.email})` });
    toast.success(t.dashboard?.deleted_successfully || 'User deleted');
  };
  const handleResetPassword = async (userId: string, newPassword: string) => {
    try {
      await resetUserPassword(userId, newPassword);
      const user = systemUsers.find((s: User) => s.id === userId);
      addAuditLog?.({ userId: currentUser?.id || '', userName: currentUser?.displayName || '', action: 'update', entityType: 'user', entityId: userId, details: `Reset password for: ${user?.displayName || userId}` });
      toast.success('Password reset successfully');
    } catch (err: any) { toast.error(err.message || 'Failed to reset password'); }
  };

  // ─── Testimonial handlers ───
  const handleAddTestimonial = () => { setEditingTestimonial(null); setTestimonialModalOpen(true); };
  const handleEditTestimonial = (t: Testimonial) => { setEditingTestimonial(t); setTestimonialModalOpen(true); };
  const handleDeleteTestimonial = (t: Testimonial) => { setDeleteTarget({ type: 'testimonial', id: t.id }); setDeleteModalOpen(true); };
  const handleSaveTestimonial = (data: Omit<Testimonial, 'id'>) => {
    if (editingTestimonial) updateTestimonial?.(editingTestimonial.id, data); else addTestimonial?.(data);
    setTestimonialModalOpen(false);
    toast.success(editingTestimonial ? 'Testimonial updated' : 'Testimonial added');
  };
  const handleToggleTestimonialVisibility = (tm: Testimonial) => { updateTestimonial?.(tm.id, { visible: !tm.visible }); };

  // ─── FAQ handlers ───
  const handleAddFaq = () => { setEditingFaq(null); setFaqModalOpen(true); };
  const handleEditFaq = (f: FAQ) => { setEditingFaq(f); setFaqModalOpen(true); };
  const handleDeleteFaq = (f: FAQ) => { setDeleteTarget({ type: 'faq', id: f.id }); setDeleteModalOpen(true); };
  const handleSaveFaq = (data: Omit<FAQ, 'id'>) => {
    if (editingFaq) updateFaq?.(editingFaq.id, data); else addFaq?.(data);
    setFaqModalOpen(false);
    toast.success(editingFaq ? 'FAQ updated' : 'FAQ added');
  };
  const handleToggleFaqVisibility = (f: FAQ) => { updateFaq?.(f.id, { visible: !(f as any).visible }); };
  const handleReorderFaq = (id: string, direction: 'up' | 'down') => {
    const sorted = [...(faqs || [])].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
    const idx = sorted.findIndex((f: any) => f.id === id);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    updateFaq?.(sorted[idx].id, { order: (sorted[swapIdx] as any).order ?? swapIdx });
    updateFaq?.(sorted[swapIdx].id, { order: (sorted[idx] as any).order ?? idx });
  };

  // ─── Category handlers ───
  const handleAddCategory = () => { setEditingCategory(null); setCategoryModalOpen(true); };
  const handleEditCategory = (c: Category) => { setEditingCategory(c); setCategoryModalOpen(true); };
  const handleDeleteCategory = (c: Category) => {
    const courseCount = courses.filter((course: Course) => course.category === c.name.en || course.category === c.name.ar).length;
    setDeleteWarning(courseCount > 0 ? `${courseCount} course(s) use this category.` : undefined);
    setDeleteTarget({ type: 'category', id: c.id }); setDeleteModalOpen(true);
  };
  const handleSaveCategory = (data: Omit<Category, 'id'>) => {
    if (editingCategory) updateCategory?.(editingCategory.id, data); else addCategory?.(data);
    setCategoryModalOpen(false);
    toast.success(editingCategory ? 'Category updated' : 'Category added');
  };
  const handleToggleCategoryVisibility = (c: Category) => { updateCategory?.(c.id, { visible: !(c as any).visible }); };

  // ─── Ad handlers ───
  const handleAddAd = () => { setEditingAd(null); setAdModalOpen(true); };
  const handleEditAd = (ad: Ad) => { setEditingAd(ad); setAdModalOpen(true); };
  const handleDeleteAd = (ad: Ad) => { setDeleteTarget({ type: 'ad', id: ad.id }); setDeleteModalOpen(true); };
  const handleSaveAd = (data: Omit<Ad, 'id'>) => {
    if (editingAd) updateAd?.(editingAd.id, data); else addAd?.(data);
    setAdModalOpen(false);
    toast.success(editingAd ? 'Ad updated' : 'Ad created');
  };
  const handleToggleAdStatus = (ad: Ad) => { updateAd?.(ad.id, { status: ad.status === 'active' ? 'paused' : 'active' }); };

  // ─── Financial handlers ───
  const handleSaveFinancial = (courseId: string, data: Partial<CourseFinancials>) => {
    const existing = financials.find((f: CourseFinancials) => f.courseId === courseId);
    if (existing) updateFinancial?.(existing.id, { ...data, updatedAt: Date.now() });
    else addFinancial?.({ courseId, instructorPayout: 0, currency: 'EGP', updatedAt: Date.now(), ...data });
    toast.success('Financials saved');
  };

  // ─── Newsletter handlers ───
  const handleDeleteNewsletter = (n: NewsletterSubscription) => { setDeleteTarget({ type: 'newsletter', id: n.id }); setDeleteModalOpen(true); };
  const handleToggleNewsletterActive = (n: NewsletterSubscription) => { updateNewsletter?.(n.id, { active: !(n as any).active }); };

  // ─── Delete confirm ───
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'course') {
      const relatedEnrollments = enrollments.filter((e: Enrollment) => e.courseId === deleteTarget.id);
      relatedEnrollments.forEach((e: Enrollment) => { if (e.status !== 'cancelled') updateEnrollment(e.id, { status: 'cancelled', notes: 'Auto-cancelled: course deleted' }); });
      deleteCourse(deleteTarget.id);
    } else if (deleteTarget.type === 'instructor') {
      const instructor = instructors.find((i: Instructor) => i.id === deleteTarget.id);
      if (instructor) courses.filter((c: Course) => c.instructor === instructor.name).forEach((c: Course) => updateCourse(c.id, { instructor: '' }));
      deleteInstructor(deleteTarget.id);
    } else if (deleteTarget.type === 'enrollment') {
      const enrollment = enrollments.find((e: Enrollment) => e.id === deleteTarget.id);
      if (enrollment && enrollment.status !== 'cancelled') { const course = courses.find((c: Course) => c.id === enrollment.courseId); if (course) updateCourse(course.id, { enrolled: Math.max(0, (course.enrolled || 0) - 1) }); }
      deleteEnrollment(deleteTarget.id);
    }
    else if (deleteTarget.type === 'contact') deleteContact(deleteTarget.id);
    else if (deleteTarget.type === 'testimonial') deleteTestimonial?.(deleteTarget.id);
    else if (deleteTarget.type === 'faq') deleteFaq?.(deleteTarget.id);
    else if (deleteTarget.type === 'category') deleteCategory?.(deleteTarget.id);
    else if (deleteTarget.type === 'newsletter') deleteNewsletter?.(deleteTarget.id);
    else if (deleteTarget.type === 'ad') deleteAd?.(deleteTarget.id);
    setDeleteModalOpen(false); setDeleteTarget(null); setDeleteWarning(undefined);
    toast.success(t.dashboard?.deleted_successfully || 'Deleted successfully');
  };

  const handleExport = () => {
    if (activeTab === 'students') {
      exportToCsv('students', ['Name', 'Email', 'Phone', 'Country', 'Level', 'Stage', 'Groups', 'Active', 'Joined'],
        students.map((s: Student) => [s.name, s.email, s.phone || '', s.country || '', s.level, s.lifecycleStage, s.groupIds.join(','), s.isActive ? 'Yes' : 'No', new Date(s.createdAt).toLocaleDateString()]));
      toast.success('Students exported');
    } else if (activeTab === 'enrollments') {
      exportToCsv('enrollments', ['Student', 'Email', 'Course', 'Status', 'Payment', 'Amount', 'Currency', 'Date'],
        enrollments.map((e: any) => [e.studentName, e.studentEmail, e.courseTitle, e.status, e.paymentStatus, String(e.paymentAmount), e.paymentCurrency, new Date(e.enrolledAt).toLocaleDateString()]));
      toast.success('Enrollments exported');
    } else if (activeTab === 'contacts') {
      exportToCsv('contacts', ['Name', 'Email', 'Phone', 'Subject', 'Status', 'Date'],
        contacts.map((c: any) => [c.name, c.email, c.phone || '', c.subject, c.status, new Date(c.submittedAt).toLocaleDateString()]));
      toast.success('Contacts exported');
    } else if (activeTab === 'courses') {
      exportToCsv('courses', ['Title', 'Category', 'Instructor', 'Price', 'Currency', 'Enrolled', 'Capacity'],
        courses.map((c: any) => [c.title, c.category, c.instructor, String(c.price), c.currency, String(c.enrolled), String(c.capacity)]));
      toast.success('Courses exported');
    }
  };

  const newContactsCount = contacts.filter((c: any) => c.status === 'new').length;

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} contactsBadge={newContactsCount} visibleTabs={visibleTabs} userRole={currentUser?.role}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">{t.dashboard.title}</h1>
          <div className="flex items-center gap-3">
            {can('analytics.export') && ['students', 'enrollments', 'contacts', 'courses'].includes(activeTab) && (
              <button onClick={handleExport} className="px-4 py-2 text-sm font-bold text-teal-600 border border-teal-200 rounded-xl hover:bg-teal-50 transition-all flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Export CSV
              </button>
            )}
            <button onClick={resetToDefaults} className="px-4 py-2 text-sm font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all">{t.dashboard.reset_data}</button>
          </div>
        </div>

        {error && <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm font-bold text-amber-700">{error}</div>}
        {loading && <LoadingSpinner fullPage />}

        {!loading && activeTab === 'overview' && (
          <div className="space-y-8">
            <StatsOverview stats={stats} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
                <h4 className="text-sm font-black text-slate-900 mb-4">{t.dashboard?.recent_enrollments || 'Recent Enrollments'}</h4>
                {enrollments.length === 0 ? <p className="text-sm text-slate-400 font-bold">No data yet</p> : (
                  <div className="space-y-3">
                    {[...enrollments].sort((a: any, b: any) => b.enrolledAt - a.enrolledAt).slice(0, 5).map((e: any) => (
                      <div key={e.id} className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className="min-w-0"><p className="text-sm font-bold text-slate-900 truncate">{e.studentName}</p><p className="text-xs text-slate-400 truncate">{e.courseTitle}</p></div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${e.status === 'confirmed' || e.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : e.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>{e.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
                <h4 className="text-sm font-black text-slate-900 mb-4">{t.dashboard?.top_courses || 'Top Courses'}</h4>
                {courses.length === 0 ? <p className="text-sm text-slate-400 font-bold">No data yet</p> : (
                  <div className="space-y-3">
                    {[...courses].sort((a: any, b: any) => b.enrolled - a.enrolled).slice(0, 5).map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className="min-w-0"><p className="text-sm font-bold text-slate-900 truncate">{c.title}</p><p className="text-xs text-slate-400">{c.category}</p></div>
                        <div className="flex items-center gap-2 flex-shrink-0"><span className="text-xs font-bold text-teal-600">{c.enrolled}/{c.capacity}</span><div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.min(100, (c.enrolled / c.capacity) * 100)}%` }} /></div></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <CoursesTable courses={courses} onAdd={can('courses.create') ? handleAddCourse : undefined} onEdit={can('courses.edit') ? handleEditCourse : undefined} onDelete={can('courses.delete') ? handleDeleteCourse : undefined} onToggleVisibility={can('courses.edit') ? handleToggleCourseVisibility : undefined} />
          </div>
        )}

        {!loading && activeTab === 'courses' && <CoursesTable courses={courses} onAdd={can('courses.create') ? handleAddCourse : undefined} onEdit={can('courses.edit') ? handleEditCourse : undefined} onDelete={can('courses.delete') ? handleDeleteCourse : undefined} onToggleVisibility={can('courses.edit') ? handleToggleCourseVisibility : undefined} />}
        {!loading && activeTab === 'instructors' && <InstructorsTable instructors={instructors} onAdd={can('instructors.create') ? handleAddInstructor : undefined} onEdit={can('instructors.edit') ? handleEditInstructor : undefined} onDelete={can('instructors.delete') ? handleDeleteInstructor : undefined} onToggleVisibility={can('instructors.edit') ? handleToggleInstructorVisibility : undefined} />}

        {!loading && activeTab === 'students' && (
          <StudentsTable
            students={students} groups={groups} instructors={instructors} courses={courses} enrollments={enrollments}
            onAdd={can('students.create') ? handleAddStudent : undefined}
            onView={can('students.view') ? handleViewStudent : undefined}
            onToggleActive={can('students.edit') ? handleToggleStudentActive : undefined}
            onUpdateStudent={can('students.edit') ? updateStudent : undefined}
            onDelete={can('students.delete') ? handleDeleteStudent : undefined}
          />
        )}

        {!loading && activeTab === 'groups' && (
          <GroupsTable
            groups={groups} instructors={instructors} courses={courses}
            onAdd={can('students.create') ? handleAddGroup : undefined}
            onEdit={can('students.edit') ? handleEditGroup : undefined}
            onDelete={can('students.delete') ? handleDeleteGroup : undefined}
            onToggleActive={can('students.edit') ? handleToggleGroupActive : undefined}
          />
        )}

        {!loading && activeTab === 'users' && (
          <UsersTable
            users={systemUsers}
            onToggleActive={can('users.edit') ? handleToggleUserActive : undefined}
            onChangeRole={can('roles.manage') ? handleChangeUserRole : undefined}
            onCreateUser={can('users.create') ? handleCreateUser : undefined}
            onDeleteUser={can('users.delete') ? handleDeleteUser : undefined}
            onResetPassword={can('users.edit') ? handleResetPassword : undefined}
          />
        )}

        {!loading && activeTab === 'enrollments' && (
          <EnrollmentsTable enrollments={enrollments}
            onUpdateStatus={can('enrollments.edit') ? handleUpdateEnrollmentStatus : undefined}
            onUpdatePayment={can('enrollments.edit') ? handleUpdatePaymentStatus : undefined}
            onDelete={can('enrollments.delete') ? (id: string) => { setDeleteTarget({ type: 'enrollment', id }); setDeleteModalOpen(true); } : undefined}
            onUpdateEnrollment={can('enrollments.edit') ? (id: string, data: any) => { updateEnrollment(id, data); toast.success('Enrollment updated'); } : undefined}
            onViewInvoice={(enrollment: Enrollment) => setInvoiceEnrollment(enrollment)}
          />
        )}

        {!loading && activeTab === 'contacts' && (
          <ContactsTable contacts={contacts}
            onMarkRead={can('contacts.edit') ? handleMarkRead : undefined}
            onMarkResponded={can('contacts.edit') ? handleMarkResponded : undefined}
            onDelete={can('contacts.delete') ? (id: string) => { setDeleteTarget({ type: 'contact', id }); setDeleteModalOpen(true); } : undefined}
            onReply={can('contacts.edit') ? (id: string, reply: string) => { updateContact(id, { adminReply: reply, status: 'responded', respondedAt: Date.now() }); toast.success('Reply saved'); } : undefined}
          />
        )}

        {!loading && activeTab === 'analytics' && <AnalyticsOverview enrollments={enrollments} courses={courses} stats={stats} />}
        {!loading && activeTab === 'settings' && (can('settings.edit') ? <SiteConfigEditor /> : <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center"><p className="text-slate-400 font-bold">No permission to edit settings.</p></div>)}
        {!loading && activeTab === 'testimonials' && <TestimonialsTable testimonials={testimonials} onAdd={can('content.create') ? handleAddTestimonial : undefined} onEdit={can('content.edit') ? handleEditTestimonial : undefined} onDelete={can('content.delete') ? handleDeleteTestimonial : undefined} onToggleVisibility={can('content.edit') ? handleToggleTestimonialVisibility : undefined} />}
        {!loading && activeTab === 'faqs' && <FAQsTable faqs={faqs} onAdd={can('content.create') ? handleAddFaq : undefined} onEdit={can('content.edit') ? handleEditFaq : undefined} onDelete={can('content.delete') ? handleDeleteFaq : undefined} onToggleVisibility={can('content.edit') ? handleToggleFaqVisibility : undefined} onReorder={can('content.edit') ? handleReorderFaq : undefined} />}
        {!loading && activeTab === 'categories' && <CategoriesTable categories={categories} onAdd={can('content.create') ? handleAddCategory : undefined} onEdit={can('content.edit') ? handleEditCategory : undefined} onDelete={can('content.delete') ? handleDeleteCategory : undefined} onToggleVisibility={can('content.edit') ? handleToggleCategoryVisibility : undefined} />}
        {!loading && activeTab === 'newsletters' && <NewsletterTable newsletters={newsletters} onDelete={handleDeleteNewsletter} onToggleActive={handleToggleNewsletterActive} />}
        {!loading && activeTab === 'audit' && <AuditLogTable auditLog={auditLog} />}
        {!loading && activeTab === 'ads' && <AdsTable ads={ads} onAdd={can('ads.create') ? handleAddAd : undefined} onEdit={can('ads.edit') ? handleEditAd : undefined} onDelete={can('ads.delete') ? handleDeleteAd : undefined} onToggleStatus={can('ads.edit') ? handleToggleAdStatus : undefined} />}
        {!loading && activeTab === 'financials' && <FinancialsTable courses={courses} enrollments={enrollments} financials={financials} onSaveFinancial={can('financials.edit') ? handleSaveFinancial : undefined} />}
        {!loading && activeTab === 'roles' && (can('roles.manage') ? <RoleManagement /> : <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center"><p className="text-slate-400 font-bold">No permission to manage roles.</p></div>)}
      </div>

      {/* Modals */}
      <CourseFormModal isOpen={courseModalOpen} course={editingCourse} onClose={() => setCourseModalOpen(false)} onSave={handleSaveCourse} />
      <InstructorFormModal isOpen={instructorModalOpen} instructor={editingInstructor} onClose={() => setInstructorModalOpen(false)} onSave={handleSaveInstructor} />
      <DeleteConfirmModal isOpen={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setDeleteWarning(undefined); }} onConfirm={handleConfirmDelete} warningMessage={deleteWarning} />
      <StudentFormModal isOpen={studentModalOpen} student={editingStudent} groups={groups} instructors={instructors} courses={courses} onClose={() => setStudentModalOpen(false)} onSave={handleSaveStudent} />
      <GroupFormModal isOpen={groupModalOpen} group={editingGroup} instructors={instructors} courses={courses} onClose={() => setGroupModalOpen(false)} onSave={handleSaveGroup} />
      <TestimonialFormModal isOpen={testimonialModalOpen} testimonial={editingTestimonial} courses={courses} onClose={() => setTestimonialModalOpen(false)} onSave={handleSaveTestimonial} />
      <FAQFormModal isOpen={faqModalOpen} faq={editingFaq} onClose={() => setFaqModalOpen(false)} onSave={handleSaveFaq} />
      <CategoryFormModal isOpen={categoryModalOpen} category={editingCategory} onClose={() => setCategoryModalOpen(false)} onSave={handleSaveCategory} />
      <AdFormModal isOpen={adModalOpen} ad={editingAd} onClose={() => setAdModalOpen(false)} onSave={handleSaveAd} />
      {invoiceEnrollment && <InvoiceView enrollment={invoiceEnrollment} isModal onClose={() => setInvoiceEnrollment(null)} />}
    </DashboardLayout>
  );
};

export default DashboardPage;
