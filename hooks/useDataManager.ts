import { useState, useEffect, useMemo, useCallback } from 'react';
import { Course, Instructor, Enrollment, ContactSubmission, User, DashboardStats, Testimonial, FAQ, Category, AuditLogEntry, NewsletterSubscription, Ad, CourseFinancials, Student, StudentGroup } from '../types';
import * as fs from '../services/firestoreService';

export function useDataManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [systemUsers, setSystemUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newsletters, setNewsletters] = useState<NewsletterSubscription[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [financials, setFinancials] = useState<CourseFinancials[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to all Firestore collections
  useEffect(() => {
    setLoading(true);
    let loaded = 0;
    const total = 14;
    const checkDone = () => { loaded++; if (loaded >= total) setLoading(false); };

    const unsubs = [
      fs.subscribeCourses((data) => { setCourses(data); checkDone(); }),
      fs.subscribeInstructors((data) => { setInstructors(data); checkDone(); }),
      fs.subscribeEnrollments((data) => { setEnrollments(data); checkDone(); }),
      fs.subscribeContacts((data) => { setContacts(data); checkDone(); }),
      fs.subscribeUsers((data) => { setSystemUsers(data); checkDone(); }),
      fs.subscribeStudents((data) => { setStudents(data); checkDone(); }),
      fs.subscribeGroups((data) => { setGroups(data); checkDone(); }),
      fs.subscribeTestimonials((data) => { setTestimonials(data); checkDone(); }),
      fs.subscribeFaqs((data) => { setFaqs(data); checkDone(); }),
      fs.subscribeCategories((data) => { setCategories(data); checkDone(); }),
      fs.subscribeNewsletters((data) => { setNewsletters(data); checkDone(); }),
      fs.subscribeAuditLog((data) => { setAuditLog(data); checkDone(); }),
      fs.subscribeAds((data) => { setAds(data); checkDone(); }),
      fs.subscribeFinancials((data) => { setFinancials(data); checkDone(); }),
    ];

    return () => unsubs.forEach(u => u());
  }, []);

  const stats: DashboardStats = useMemo(() => ({
    totalCourses: courses.length,
    totalInstructors: instructors.length,
    totalEnrollments: enrollments.length,
    totalRevenue: enrollments.filter(e => e.paymentStatus === 'paid').reduce((sum, e) => sum + e.paymentAmount, 0),
    totalStudents: students.length,
    totalContacts: contacts.filter(c => c.status === 'new').length,
  }), [courses, instructors, enrollments, students, contacts]);

  // --- Course CRUD ---
  const addCourse = useCallback(async (course: Omit<Course, 'id'>) => {
    try { await fs.createCourse(course); } catch (e: any) { setError(e.message); }
  }, []);
  const updateCourse = useCallback(async (id: string, data: Partial<Course>) => {
    try { await fs.editCourse(id, data); } catch (e: any) { setError(e.message); }
  }, []);
  const deleteCourse = useCallback(async (id: string) => {
    try { await fs.removeCourse(id); } catch (e: any) { setError(e.message); }
  }, []);

  // --- Instructor CRUD ---
  const addInstructor = useCallback(async (instructor: Omit<Instructor, 'id'>) => {
    try { await fs.createInstructor(instructor); } catch (e: any) { setError(e.message); }
  }, []);
  const updateInstructor = useCallback(async (id: string, data: Partial<Instructor>) => {
    try { await fs.editInstructor(id, data); } catch (e: any) { setError(e.message); }
  }, []);
  const deleteInstructor = useCallback(async (id: string) => {
    try { await fs.removeInstructor(id); } catch (e: any) { setError(e.message); }
  }, []);

  // --- Enrollment CRUD ---
  const addEnrollment = useCallback(async (enrollment: Omit<Enrollment, 'id'>) => {
    try { await fs.createEnrollment(enrollment); } catch (e: any) { setError(e.message); }
  }, []);
  const updateEnrollment = useCallback(async (id: string, data: Partial<Enrollment>) => {
    try { await fs.editEnrollment(id, data); } catch (e: any) { setError(e.message); }
  }, []);
  const deleteEnrollment = useCallback(async (id: string) => {
    try { await fs.removeEnrollment(id); } catch (e: any) { setError(e.message); }
  }, []);

  // --- Contact CRUD ---
  const addContact = useCallback(async (contact: Omit<ContactSubmission, 'id'>) => {
    try { await fs.createContact(contact); } catch (e: any) { setError(e.message); }
  }, []);
  const updateContact = useCallback(async (id: string, data: Partial<ContactSubmission>) => {
    try { await fs.editContact(id, data); } catch (e: any) { setError(e.message); }
  }, []);
  const deleteContact = useCallback(async (id: string) => {
    try { await fs.removeContact(id); } catch (e: any) { setError(e.message); }
  }, []);

  // --- System User CRUD ---
  const addSystemUser = useCallback(async (user: Omit<User, 'id'> & { id?: string }) => {
    try {
      const { password, ...userData } = user as any;
      if (user.id) {
        await fs.updateUser(user.id, userData);
      } else {
        await fs.createUser(userData);
      }
    } catch (e: any) { setError(e.message); }
  }, []);
  const updateSystemUser = useCallback(async (id: string, data: Partial<User>) => {
    try { await fs.updateUser(id, data); } catch (e: any) { setError(e.message); }
  }, []);
  const deleteSystemUser = useCallback(async (id: string) => {
    try { await fs.deleteUser(id); } catch (e: any) { setError(e.message); }
  }, []);

  // --- Student CRUD ---
  const addStudent = useCallback(async (student: Omit<Student, 'id'>) => {
    try {
      await fs.createStudent(student);
      // Update group student counts
      if (student.groupIds?.length) {
        for (const gid of student.groupIds) {
          const group = groups.find(g => g.id === gid);
          if (group) await fs.editGroup(gid, { studentCount: group.studentCount + 1 });
        }
      }
    } catch (e: any) { setError(e.message); }
  }, [groups]);

  const updateStudent = useCallback(async (id: string, data: Partial<Student>) => {
    try { await fs.editStudent(id, data); } catch (e: any) { setError(e.message); }
  }, []);

  const deleteStudent = useCallback(async (id: string) => {
    try {
      const student = students.find(s => s.id === id);
      await fs.removeStudent(id);
      // Update group student counts
      if (student?.groupIds?.length) {
        for (const gid of student.groupIds) {
          const group = groups.find(g => g.id === gid);
          if (group) await fs.editGroup(gid, { studentCount: Math.max(0, group.studentCount - 1) });
        }
      }
    } catch (e: any) { setError(e.message); }
  }, [students, groups]);

  // --- Student Group CRUD ---
  const addGroup = useCallback(async (group: Omit<StudentGroup, 'id'>) => {
    try { await fs.createGroup(group); } catch (e: any) { setError(e.message); }
  }, []);
  const updateGroup = useCallback(async (id: string, data: Partial<StudentGroup>) => {
    try { await fs.editGroup(id, data); } catch (e: any) { setError(e.message); }
  }, []);
  const deleteGroup = useCallback(async (id: string) => {
    try {
      // Remove group from all students
      const affectedStudents = students.filter(s => s.groupIds.includes(id));
      for (const s of affectedStudents) {
        await fs.editStudent(s.id, { groupIds: s.groupIds.filter(gid => gid !== id) });
      }
      await fs.removeGroup(id);
    } catch (e: any) { setError(e.message); }
  }, [students]);

  // --- Testimonial CRUD ---
  const addTestimonial = useCallback(async (testimonial: Omit<Testimonial, 'id'>) => {
    try { await fs.createTestimonial(testimonial); } catch (e: any) { setError(e.message); }
  }, []);
  const updateTestimonial = useCallback(async (id: string, data: Partial<Testimonial>) => {
    try { await fs.editTestimonial(id, data); } catch (e: any) { setError(e.message); }
  }, []);
  const deleteTestimonial = useCallback(async (id: string) => {
    try { await fs.removeTestimonial(id); } catch (e: any) { setError(e.message); }
  }, []);

  // --- FAQ CRUD ---
  const addFaq = useCallback(async (faq: Omit<FAQ, 'id'>) => {
    try { await fs.createFaq(faq); } catch (e: any) { setError(e.message); }
  }, []);
  const updateFaq = useCallback(async (id: string, data: Partial<FAQ>) => {
    try { await fs.editFaq(id, data); } catch (e: any) { setError(e.message); }
  }, []);
  const deleteFaq = useCallback(async (id: string) => {
    try { await fs.removeFaq(id); } catch (e: any) { setError(e.message); }
  }, []);

  // --- Category CRUD ---
  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    try { await fs.createCategory(category); } catch (e: any) { setError(e.message); }
  }, []);
  const updateCategory = useCallback(async (id: string, data: Partial<Category>) => {
    try { await fs.editCategory(id, data); } catch (e: any) { setError(e.message); }
  }, []);
  const deleteCategory = useCallback(async (id: string) => {
    try { await fs.removeCategory(id); } catch (e: any) { setError(e.message); }
  }, []);

  // --- Newsletter CRUD ---
  const addNewsletter = useCallback(async (subscription: Omit<NewsletterSubscription, 'id'>) => {
    try { await fs.createNewsletter(subscription); } catch (e: any) { setError(e.message); }
  }, []);
  const deleteNewsletter = useCallback(async (id: string) => {
    try { await fs.removeNewsletter(id); } catch (e: any) { setError(e.message); }
  }, []);

  // --- Ad CRUD ---
  const addAd = useCallback(async (ad: Omit<Ad, 'id'>) => {
    try { await fs.createAd(ad); } catch (e: any) { setError(e.message); }
  }, []);
  const updateAd = useCallback(async (id: string, data: Partial<Ad>) => {
    try { await fs.editAd(id, data); } catch (e: any) { setError(e.message); }
  }, []);
  const deleteAd = useCallback(async (id: string) => {
    try { await fs.removeAd(id); } catch (e: any) { setError(e.message); }
  }, []);

  // --- Course Financials CRUD ---
  const addFinancial = useCallback(async (financial: Omit<CourseFinancials, 'id'>) => {
    try { await fs.createFinancial(financial); } catch (e: any) { setError(e.message); }
  }, []);
  const updateFinancial = useCallback(async (id: string, data: Partial<CourseFinancials>) => {
    try { await fs.editFinancial(id, data); } catch (e: any) { setError(e.message); }
  }, []);
  const deleteFinancial = useCallback(async (id: string) => {
    try { await fs.removeFinancial(id); } catch (e: any) { setError(e.message); }
  }, []);

  // --- Audit Log ---
  const addAuditLog = useCallback(async (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    try { await fs.createAuditLog({ ...entry, timestamp: Date.now() }); } catch (e: any) { setError(e.message); }
  }, []);

  // --- Reset (clears nothing — data lives in Firestore) ---
  const resetToDefaults = () => {
    // No-op: data is managed in Firestore via the dashboard
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
