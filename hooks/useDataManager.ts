import { useState, useEffect, useMemo, useCallback } from 'react';
import { Course, Instructor, Enrollment, ContactSubmission, User, DashboardStats, Testimonial, FAQ, Category, AuditLogEntry, NewsletterSubscription, Ad, CourseFinancials, Student, StudentGroup } from '../types';
import { COURSES, INSTRUCTORS, SEED_STUDENTS, SEED_GROUPS, SEED_ENROLLMENTS, SEED_TESTIMONIALS, SEED_FAQS, SEED_CATEGORIES, SEED_NEWSLETTERS, SEED_ADS } from '../constants';
import { isFirebaseConfigured } from '../services/firebase';
import * as fs from '../services/firestoreService';
import { getAllLocalUsers } from '../services/localAuthService';

const STORAGE_KEYS = {
  courses: 'elite_academy_courses',
  instructors: 'elite_academy_instructors',
  enrollments: 'elite_academy_enrollments',
  contacts: 'elite_academy_contacts',
  systemUsers: 'elite_academy_students', // legacy key, now used for system users
  students: 'elite_academy_student_records',
  groups: 'elite_academy_student_groups',
  testimonials: 'elite_academy_testimonials',
  faqs: 'elite_academy_faqs',
  categories: 'elite_academy_categories',
  newsletters: 'elite_academy_newsletters',
  auditLog: 'elite_academy_audit_log',
  ads: 'elite_academy_ads',
  financials: 'elite_academy_financials',
};

function loadFromStorage<T>(key: string, fallback: T[]): T[] {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return fallback;
}

export function useDataManager() {
  const [courses, setCourses] = useState<Course[]>(() =>
    isFirebaseConfigured ? [] : loadFromStorage<Course>(STORAGE_KEYS.courses, COURSES)
  );
  const [instructors, setInstructors] = useState<Instructor[]>(() =>
    isFirebaseConfigured ? [] : loadFromStorage<Instructor>(STORAGE_KEYS.instructors, INSTRUCTORS)
  );
  const [enrollments, setEnrollments] = useState<Enrollment[]>(() =>
    isFirebaseConfigured ? [] : loadFromStorage<Enrollment>(STORAGE_KEYS.enrollments, SEED_ENROLLMENTS)
  );
  const [contacts, setContacts] = useState<ContactSubmission[]>(() =>
    isFirebaseConfigured ? [] : loadFromStorage<ContactSubmission>(STORAGE_KEYS.contacts, [])
  );
  // System users — platform admins, instructors, moderators, etc.
  const [systemUsers, setSystemUsers] = useState<User[]>(() => {
    if (isFirebaseConfigured) return [];
    const stored = loadFromStorage<User>(STORAGE_KEYS.systemUsers, []);
    const authUsers = getAllLocalUsers();
    const storedIds = new Set(stored.map(s => s.id));
    const merged = [...stored];
    for (const au of authUsers) {
      if (!storedIds.has(au.id)) {
        merged.push(au);
      }
    }
    return merged;
  });
  // Students — separate learner entities
  const [students, setStudents] = useState<Student[]>(() =>
    loadFromStorage<Student>(STORAGE_KEYS.students, SEED_STUDENTS)
  );
  // Student groups — cohorts, class sections, batches
  const [groups, setGroups] = useState<StudentGroup[]>(() =>
    loadFromStorage<StudentGroup>(STORAGE_KEYS.groups, SEED_GROUPS)
  );
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() =>
    loadFromStorage<Testimonial>(STORAGE_KEYS.testimonials, SEED_TESTIMONIALS)
  );
  const [faqs, setFaqs] = useState<FAQ[]>(() =>
    loadFromStorage<FAQ>(STORAGE_KEYS.faqs, SEED_FAQS)
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    loadFromStorage<Category>(STORAGE_KEYS.categories, SEED_CATEGORIES)
  );
  const [newsletters, setNewsletters] = useState<NewsletterSubscription[]>(() =>
    loadFromStorage<NewsletterSubscription>(STORAGE_KEYS.newsletters, SEED_NEWSLETTERS)
  );
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(() =>
    loadFromStorage<AuditLogEntry>(STORAGE_KEYS.auditLog, [])
  );
  const [ads, setAds] = useState<Ad[]>(() =>
    loadFromStorage<Ad>(STORAGE_KEYS.ads, SEED_ADS)
  );
  const [financials, setFinancials] = useState<CourseFinancials[]>(() =>
    loadFromStorage<CourseFinancials>(STORAGE_KEYS.financials, [])
  );
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    setLoading(true);
    let loaded = 0;
    const checkDone = () => { loaded++; if (loaded >= 4) setLoading(false); };

    const unsubs = [
      fs.subscribeCourses((data) => { setCourses(data); checkDone(); }),
      fs.subscribeInstructors((data) => { setInstructors(data); checkDone(); }),
      fs.subscribeEnrollments((data) => { setEnrollments(data); checkDone(); }),
      fs.subscribeContacts((data) => { setContacts(data); checkDone(); }),
      fs.subscribeStudents((data) => { setSystemUsers(data); }),
    ];

    return () => unsubs.forEach(u => u());
  }, []);

  // localStorage persistence
  useEffect(() => { if (!isFirebaseConfigured) localStorage.setItem(STORAGE_KEYS.courses, JSON.stringify(courses)); }, [courses]);
  useEffect(() => { if (!isFirebaseConfigured) localStorage.setItem(STORAGE_KEYS.instructors, JSON.stringify(instructors)); }, [instructors]);
  useEffect(() => { if (!isFirebaseConfigured) localStorage.setItem(STORAGE_KEYS.enrollments, JSON.stringify(enrollments)); }, [enrollments]);
  useEffect(() => { if (!isFirebaseConfigured) localStorage.setItem(STORAGE_KEYS.contacts, JSON.stringify(contacts)); }, [contacts]);
  useEffect(() => { if (!isFirebaseConfigured) localStorage.setItem(STORAGE_KEYS.systemUsers, JSON.stringify(systemUsers)); }, [systemUsers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.groups, JSON.stringify(groups)); }, [groups]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.testimonials, JSON.stringify(testimonials)); }, [testimonials]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.faqs, JSON.stringify(faqs)); }, [faqs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.newsletters, JSON.stringify(newsletters)); }, [newsletters]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.auditLog, JSON.stringify(auditLog)); }, [auditLog]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ads, JSON.stringify(ads)); }, [ads]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.financials, JSON.stringify(financials)); }, [financials]);

  const stats: DashboardStats = useMemo(() => ({
    totalCourses: courses.length,
    totalInstructors: instructors.length,
    totalEnrollments: enrollments.length,
    totalRevenue: enrollments.filter(e => e.paymentStatus === 'paid').reduce((sum, e) => sum + e.paymentAmount, 0),
    totalStudents: students.length,
    totalContacts: contacts.filter(c => c.status === 'new').length,
  }), [courses, instructors, enrollments, students, contacts]);

  // --- Recalculate category course counts ---
  const recalcCategoryCounts = useCallback((coursesData: Course[]) => {
    setCategories(prev => {
      const counts: Record<string, number> = {};
      coursesData.forEach(c => {
        if (c.category) counts[c.category] = (counts[c.category] || 0) + 1;
      });
      return prev.map(cat => ({
        ...cat,
        courseCount: counts[cat.name.en] || counts[cat.name.ar] || 0,
      }));
    });
  }, []);

  // --- Course CRUD ---
  const addCourse = useCallback(async (course: Omit<Course, 'id'>) => {
    try {
      if (isFirebaseConfigured) { await fs.createCourse(course); } else {
        const id = `course_${Date.now()}`;
        setCourses(prev => { const updated = [...prev, { ...course, id }]; recalcCategoryCounts(updated); return updated; });
      }
    } catch (e: any) { setError(e.message); }
  }, [recalcCategoryCounts]);

  const updateCourse = useCallback(async (id: string, data: Partial<Course>) => {
    try {
      if (isFirebaseConfigured) { await fs.editCourse(id, data); } else {
        setCourses(prev => { const updated = prev.map(c => (c.id === id ? { ...c, ...data } : c)); if (data.category !== undefined) recalcCategoryCounts(updated); return updated; });
      }
    } catch (e: any) { setError(e.message); }
  }, [recalcCategoryCounts]);

  const deleteCourse = useCallback(async (id: string) => {
    try {
      if (isFirebaseConfigured) { await fs.removeCourse(id); } else {
        setCourses(prev => { const updated = prev.filter(c => c.id !== id); recalcCategoryCounts(updated); return updated; });
      }
    } catch (e: any) { setError(e.message); }
  }, [recalcCategoryCounts]);

  // --- Instructor CRUD ---
  const addInstructor = useCallback(async (instructor: Omit<Instructor, 'id'>) => {
    try {
      if (isFirebaseConfigured) { await fs.createInstructor(instructor); } else {
        const id = `inst_${Date.now()}`;
        setInstructors(prev => [...prev, { ...instructor, id }]);
      }
    } catch (e: any) { setError(e.message); }
  }, []);
  const updateInstructor = useCallback(async (id: string, data: Partial<Instructor>) => {
    try {
      if (isFirebaseConfigured) { await fs.editInstructor(id, data); } else {
        setInstructors(prev => prev.map(i => (i.id === id ? { ...i, ...data } : i)));
      }
    } catch (e: any) { setError(e.message); }
  }, []);
  const deleteInstructor = useCallback(async (id: string) => {
    try {
      if (isFirebaseConfigured) { await fs.removeInstructor(id); } else {
        setInstructors(prev => prev.filter(i => i.id !== id));
      }
    } catch (e: any) { setError(e.message); }
  }, []);

  // --- Enrollment CRUD ---
  const addEnrollment = useCallback(async (enrollment: Omit<Enrollment, 'id'>) => {
    try {
      if (isFirebaseConfigured) { await fs.createEnrollment(enrollment); } else {
        const id = `enroll_${Date.now()}`;
        setEnrollments(prev => [...prev, { ...enrollment, id }]);
      }
    } catch (e: any) { setError(e.message); }
  }, []);
  const updateEnrollment = useCallback(async (id: string, data: Partial<Enrollment>) => {
    try {
      if (isFirebaseConfigured) { await fs.editEnrollment(id, data); } else {
        setEnrollments(prev => prev.map(e => (e.id === id ? { ...e, ...data } : e)));
      }
    } catch (e: any) { setError(e.message); }
  }, []);
  const deleteEnrollment = useCallback(async (id: string) => {
    try {
      if (isFirebaseConfigured) { await fs.removeEnrollment(id); } else {
        setEnrollments(prev => prev.filter(e => e.id !== id));
      }
    } catch (e: any) { setError(e.message); }
  }, []);

  // --- Contact CRUD ---
  const addContact = useCallback(async (contact: Omit<ContactSubmission, 'id'>) => {
    try {
      if (isFirebaseConfigured) { await fs.createContact(contact); } else {
        const id = `contact_${Date.now()}`;
        setContacts(prev => [...prev, { ...contact, id }]);
      }
    } catch (e: any) { setError(e.message); }
  }, []);
  const updateContact = useCallback(async (id: string, data: Partial<ContactSubmission>) => {
    try {
      if (isFirebaseConfigured) { await fs.editContact(id, data); } else {
        setContacts(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
      }
    } catch (e: any) { setError(e.message); }
  }, []);
  const deleteContact = useCallback(async (id: string) => {
    try {
      if (isFirebaseConfigured) { await fs.removeContact(id); } else {
        setContacts(prev => prev.filter(c => c.id !== id));
      }
    } catch (e: any) { setError(e.message); }
  }, []);

  // --- System User management (for Users tab / login accounts) ---
  const addSystemUser = useCallback(async (user: Omit<User, 'id'> & { id?: string }) => {
    try {
      const id = user.id || `user_${Date.now()}`;
      const { password, ...userData } = user as any;
      setSystemUsers(prev => [...prev, { ...userData, id } as User]);
    } catch (e: any) { setError(e.message); }
  }, []);
  const updateSystemUser = useCallback(async (id: string, data: Partial<User>) => {
    try {
      if (isFirebaseConfigured) { await fs.updateUser(id, data); } else {
        setSystemUsers(prev => prev.map(s => (s.id === id ? { ...s, ...data } : s)));
      }
    } catch (e: any) { setError(e.message); }
  }, []);
  const deleteSystemUser = useCallback(async (id: string) => {
    try {
      if (isFirebaseConfigured) { await fs.deleteUser(id); } else {
        setSystemUsers(prev => prev.filter(s => s.id !== id));
      }
    } catch (e: any) { setError(e.message); }
  }, []);

  // --- Student CRUD (separate learner entities) ---
  const addStudent = useCallback(async (student: Omit<Student, 'id'>) => {
    try {
      const id = `stu_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
      setStudents(prev => [...prev, { ...student, id }]);
      // Update group student counts
      if (student.groupIds?.length) {
        setGroups(prev => prev.map(g =>
          student.groupIds.includes(g.id) ? { ...g, studentCount: g.studentCount + 1 } : g
        ));
      }
    } catch (e: any) { setError(e.message); }
  }, []);

  const updateStudent = useCallback(async (id: string, data: Partial<Student>) => {
    try {
      setStudents(prev => prev.map(s => (s.id === id ? { ...s, ...data, updatedAt: Date.now() } : s)));
    } catch (e: any) { setError(e.message); }
  }, []);

  const deleteStudent = useCallback(async (id: string) => {
    try {
      const student = students.find(s => s.id === id);
      setStudents(prev => prev.filter(s => s.id !== id));
      // Update group student counts
      if (student?.groupIds?.length) {
        setGroups(prev => prev.map(g =>
          student.groupIds.includes(g.id) ? { ...g, studentCount: Math.max(0, g.studentCount - 1) } : g
        ));
      }
    } catch (e: any) { setError(e.message); }
  }, [students]);

  // --- Student Group CRUD ---
  const addGroup = useCallback(async (group: Omit<StudentGroup, 'id'>) => {
    const id = `grp_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    setGroups(prev => [...prev, { ...group, id }]);
  }, []);

  const updateGroup = useCallback(async (id: string, data: Partial<StudentGroup>) => {
    setGroups(prev => prev.map(g => (g.id === id ? { ...g, ...data, updatedAt: Date.now() } : g)));
  }, []);

  const deleteGroup = useCallback(async (id: string) => {
    // Remove group from all students
    setStudents(prev => prev.map(s => ({
      ...s,
      groupIds: s.groupIds.filter(gid => gid !== id),
    })));
    setGroups(prev => prev.filter(g => g.id !== id));
  }, []);

  // --- Testimonial CRUD ---
  const addTestimonial = useCallback(async (testimonial: Omit<Testimonial, 'id'>) => {
    const id = `testimonial_${Date.now()}`;
    setTestimonials(prev => [...prev, { ...testimonial, id }]);
  }, []);
  const updateTestimonial = useCallback(async (id: string, data: Partial<Testimonial>) => {
    setTestimonials(prev => prev.map(t => (t.id === id ? { ...t, ...data } : t)));
  }, []);
  const deleteTestimonial = useCallback(async (id: string) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
  }, []);

  // --- FAQ CRUD ---
  const addFaq = useCallback(async (faq: Omit<FAQ, 'id'>) => {
    const id = `faq_${Date.now()}`;
    setFaqs(prev => [...prev, { ...faq, id }]);
  }, []);
  const updateFaq = useCallback(async (id: string, data: Partial<FAQ>) => {
    setFaqs(prev => prev.map(f => (f.id === id ? { ...f, ...data } : f)));
  }, []);
  const deleteFaq = useCallback(async (id: string) => {
    setFaqs(prev => prev.filter(f => f.id !== id));
  }, []);

  // --- Category CRUD ---
  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    const id = `cat_${Date.now()}`;
    setCategories(prev => [...prev, { ...category, id }]);
  }, []);
  const updateCategory = useCallback(async (id: string, data: Partial<Category>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
  }, []);
  const deleteCategory = useCallback(async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  // --- Newsletter CRUD ---
  const addNewsletter = useCallback(async (subscription: Omit<NewsletterSubscription, 'id'>) => {
    const id = `newsletter_${Date.now()}`;
    setNewsletters(prev => [...prev, { ...subscription, id }]);
  }, []);
  const deleteNewsletter = useCallback(async (id: string) => {
    setNewsletters(prev => prev.filter(n => n.id !== id));
  }, []);

  // --- Ad CRUD ---
  const addAd = useCallback(async (ad: Omit<Ad, 'id'>) => {
    const id = `ad_${Date.now()}`;
    setAds(prev => [...prev, { ...ad, id }]);
  }, []);
  const updateAd = useCallback(async (id: string, data: Partial<Ad>) => {
    setAds(prev => prev.map(a => (a.id === id ? { ...a, ...data } : a)));
  }, []);
  const deleteAd = useCallback(async (id: string) => {
    setAds(prev => prev.filter(a => a.id !== id));
  }, []);

  // --- Course Financials CRUD ---
  const addFinancial = useCallback(async (financial: Omit<CourseFinancials, 'id'>) => {
    const id = `fin_${Date.now()}`;
    setFinancials(prev => [...prev, { ...financial, id }]);
  }, []);
  const updateFinancial = useCallback(async (id: string, data: Partial<CourseFinancials>) => {
    setFinancials(prev => prev.map(f => (f.id === id ? { ...f, ...data } : f)));
  }, []);
  const deleteFinancial = useCallback(async (id: string) => {
    setFinancials(prev => prev.filter(f => f.id !== id));
  }, []);

  // --- Audit Log ---
  const addAuditLog = useCallback(async (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const id = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setAuditLog(prev => [{ ...entry, id, timestamp: Date.now() }, ...prev]);
  }, []);

  const resetToDefaults = () => {
    setCourses([...COURSES]);
    setInstructors([...INSTRUCTORS]);
    setEnrollments([...SEED_ENROLLMENTS]);
    setContacts([]);
    setStudents([...SEED_STUDENTS]);
    setGroups([...SEED_GROUPS]);
    setTestimonials([...SEED_TESTIMONIALS]);
    setFaqs([...SEED_FAQS]);
    setCategories([...SEED_CATEGORIES]);
    setNewsletters([...SEED_NEWSLETTERS]);
    setAuditLog([]);
    setAds([...SEED_ADS]);
    setFinancials([]);
  };

  return {
    courses, instructors, enrollments, contacts,
    systemUsers, students, groups,
    testimonials, faqs, categories, newsletters, auditLog,
    stats, loading, error,
    addCourse, updateCourse, deleteCourse,
    addInstructor, updateInstructor, deleteInstructor,
    addEnrollment, updateEnrollment, deleteEnrollment,
    addContact, updateContact, deleteContact,
    addSystemUser, updateSystemUser, deleteSystemUser,
    addStudent, updateStudent, deleteStudent,
    addGroup, updateGroup, deleteGroup,
    addTestimonial, updateTestimonial, deleteTestimonial,
    addFaq, updateFaq, deleteFaq,
    addCategory, updateCategory, deleteCategory,
    addNewsletter, deleteNewsletter,
    addAuditLog,
    ads, financials,
    addAd, updateAd, deleteAd,
    addFinancial, updateFinancial, deleteFinancial,
    resetToDefaults,
  };
}
