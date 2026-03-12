import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Course, Instructor, User, Enrollment, ContactSubmission, SiteConfig, Student, StudentGroup, Testimonial, FAQ, Category, NewsletterSubscription, AuditLogEntry, Ad, CourseFinancials, LiveSession, SessionAttendance, Recording, RecordingProgress, Quiz, QuizQuestion, QuizSubmission, Capstone, CapstoneSubmission, CourseProgress } from '../types';

// --- Courses ---
export function subscribeCourses(callback: (courses: Course[]) => void): Unsubscribe {
  const q = query(collection(db, 'courses'), orderBy('title'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Course));
  }, () => callback([]));
}

export async function fetchCourses(): Promise<Course[]> {
  const q = query(collection(db, 'courses'), orderBy('title'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Course);
}

export async function createCourse(data: Omit<Course, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'courses'), { ...data, createdAt: Date.now(), updatedAt: Date.now() });
  return docRef.id;
}

export async function editCourse(id: string, data: Partial<Course>): Promise<void> {
  const { id: _id, ...updateData } = data as Course;
  await updateDoc(doc(db, 'courses', id), { ...updateData, updatedAt: Date.now() });
}

export async function removeCourse(id: string): Promise<void> {
  await deleteDoc(doc(db, 'courses', id));
}

// --- Instructors ---
export function subscribeInstructors(callback: (instructors: Instructor[]) => void): Unsubscribe {
  const q = query(collection(db, 'instructors'), orderBy('name'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Instructor));
  }, () => callback([]));
}

export async function fetchInstructors(): Promise<Instructor[]> {
  const q = query(collection(db, 'instructors'), orderBy('name'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Instructor);
}

export async function createInstructor(data: Omit<Instructor, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'instructors'), { ...data, createdAt: Date.now(), updatedAt: Date.now() });
  return docRef.id;
}

export async function editInstructor(id: string, data: Partial<Instructor>): Promise<void> {
  const { id: _id, ...updateData } = data as Instructor;
  await updateDoc(doc(db, 'instructors', id), { ...updateData, updatedAt: Date.now() });
}

export async function removeInstructor(id: string): Promise<void> {
  await deleteDoc(doc(db, 'instructors', id));
}

// --- Users (system users) ---
export function subscribeUsers(callback: (users: User[]) => void): Unsubscribe {
  const q = query(collection(db, 'users'), orderBy('displayName'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as User));
  }, () => callback([]));
}

export function subscribeStudentUsers(callback: (students: User[]) => void): Unsubscribe {
  const q = query(collection(db, 'users'), where('role', '==', 'student'), orderBy('displayName'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as User));
  }, () => callback([]));
}

export async function fetchUsers(): Promise<User[]> {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('displayName')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as User);
}

export async function createUser(data: Omit<User, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'users'), { ...data, createdAt: Date.now(), updatedAt: Date.now() });
  return docRef.id;
}

export async function updateUser(id: string, data: Partial<User>): Promise<void> {
  await setDoc(doc(db, 'users', id), { ...data, updatedAt: Date.now() }, { merge: true });
}

export async function deleteUser(id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', id));
}

// --- Students ---
export function subscribeStudents(callback: (students: Student[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'students'), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Student));
  }, () => callback([]));
}

export async function createStudent(data: Omit<Student, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'students'), { ...data, createdAt: Date.now(), updatedAt: Date.now() });
  return docRef.id;
}

export async function editStudent(id: string, data: Partial<Student>): Promise<void> {
  const { id: _id, ...updateData } = data as Student;
  await updateDoc(doc(db, 'students', id), { ...updateData, updatedAt: Date.now() });
}

export async function removeStudent(id: string): Promise<void> {
  await deleteDoc(doc(db, 'students', id));
}

// --- Student Groups ---
export function subscribeGroups(callback: (groups: StudentGroup[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'groups'), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as StudentGroup));
  }, () => callback([]));
}

export async function createGroup(data: Omit<StudentGroup, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'groups'), { ...data, createdAt: Date.now(), updatedAt: Date.now() });
  return docRef.id;
}

export async function editGroup(id: string, data: Partial<StudentGroup>): Promise<void> {
  const { id: _id, ...updateData } = data as StudentGroup;
  await updateDoc(doc(db, 'groups', id), { ...updateData, updatedAt: Date.now() });
}

export async function removeGroup(id: string): Promise<void> {
  await deleteDoc(doc(db, 'groups', id));
}

// --- Enrollments ---
export function subscribeEnrollments(callback: (enrollments: Enrollment[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'enrollments'), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Enrollment));
  }, () => callback([]));
}

export async function fetchEnrollments(): Promise<Enrollment[]> {
  const snap = await getDocs(query(collection(db, 'enrollments'), orderBy('enrolledAt')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Enrollment);
}

export async function createEnrollment(data: Omit<Enrollment, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'enrollments'), { ...data, createdAt: Date.now() });
  return docRef.id;
}

export async function editEnrollment(id: string, data: Partial<Enrollment>): Promise<void> {
  const { id: _id, ...updateData } = data as Enrollment;
  await updateDoc(doc(db, 'enrollments', id), updateData);
}

export async function removeEnrollment(id: string): Promise<void> {
  await deleteDoc(doc(db, 'enrollments', id));
}

export async function getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]> {
  const q = query(collection(db, 'enrollments'), where('courseId', '==', courseId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Enrollment);
}

export async function getEnrollmentsByStudent(studentId: string): Promise<Enrollment[]> {
  const q = query(collection(db, 'enrollments'), where('studentId', '==', studentId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Enrollment);
}

// --- Contacts ---
export function subscribeContacts(callback: (contacts: ContactSubmission[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'contacts'), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ContactSubmission));
  }, () => callback([]));
}

export async function createContact(data: Omit<ContactSubmission, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'contacts'), { ...data, submittedAt: Date.now() });
  return docRef.id;
}

export async function editContact(id: string, data: Partial<ContactSubmission>): Promise<void> {
  const { id: _id, ...updateData } = data as ContactSubmission;
  await updateDoc(doc(db, 'contacts', id), updateData);
}

export async function removeContact(id: string): Promise<void> {
  await deleteDoc(doc(db, 'contacts', id));
}

// --- Testimonials ---
export function subscribeTestimonials(callback: (testimonials: Testimonial[]) => void): Unsubscribe {
  const q = query(collection(db, 'testimonials'), orderBy('order'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Testimonial));
  }, () => callback([]));
}

export async function createTestimonial(data: Omit<Testimonial, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'testimonials'), { ...data, createdAt: Date.now(), updatedAt: Date.now() });
  return docRef.id;
}

export async function editTestimonial(id: string, data: Partial<Testimonial>): Promise<void> {
  const { id: _id, ...updateData } = data as Testimonial;
  await updateDoc(doc(db, 'testimonials', id), { ...updateData, updatedAt: Date.now() });
}

export async function removeTestimonial(id: string): Promise<void> {
  await deleteDoc(doc(db, 'testimonials', id));
}

// --- FAQs ---
export function subscribeFaqs(callback: (faqs: FAQ[]) => void): Unsubscribe {
  const q = query(collection(db, 'faqs'), orderBy('order'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as FAQ));
  }, () => callback([]));
}

export async function createFaq(data: Omit<FAQ, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'faqs'), { ...data, createdAt: Date.now(), updatedAt: Date.now() });
  return docRef.id;
}

export async function editFaq(id: string, data: Partial<FAQ>): Promise<void> {
  const { id: _id, ...updateData } = data as FAQ;
  await updateDoc(doc(db, 'faqs', id), { ...updateData, updatedAt: Date.now() });
}

export async function removeFaq(id: string): Promise<void> {
  await deleteDoc(doc(db, 'faqs', id));
}

// --- Categories ---
export function subscribeCategories(callback: (categories: Category[]) => void): Unsubscribe {
  const q = query(collection(db, 'categories'), orderBy('order'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category));
  }, () => callback([]));
}

export async function createCategory(data: Omit<Category, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'categories'), { ...data, createdAt: Date.now(), updatedAt: Date.now() });
  return docRef.id;
}

export async function editCategory(id: string, data: Partial<Category>): Promise<void> {
  const { id: _id, ...updateData } = data as Category;
  await updateDoc(doc(db, 'categories', id), { ...updateData, updatedAt: Date.now() });
}

export async function removeCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, 'categories', id));
}

// --- Newsletters ---
export function subscribeNewsletters(callback: (newsletters: NewsletterSubscription[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'newsletters'), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as NewsletterSubscription));
  }, () => callback([]));
}

export async function createNewsletter(data: Omit<NewsletterSubscription, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'newsletters'), { ...data, subscribedAt: Date.now() });
  return docRef.id;
}

export async function removeNewsletter(id: string): Promise<void> {
  await deleteDoc(doc(db, 'newsletters', id));
}

// --- Ads ---
export function subscribeAds(callback: (ads: Ad[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'ads'), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Ad));
  }, () => callback([]));
}

export async function createAd(data: Omit<Ad, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'ads'), { ...data, createdAt: Date.now(), updatedAt: Date.now() });
  return docRef.id;
}

export async function editAd(id: string, data: Partial<Ad>): Promise<void> {
  const { id: _id, ...updateData } = data as Ad;
  await updateDoc(doc(db, 'ads', id), { ...updateData, updatedAt: Date.now() });
}

export async function removeAd(id: string): Promise<void> {
  await deleteDoc(doc(db, 'ads', id));
}

// --- Financials ---
export function subscribeFinancials(callback: (financials: CourseFinancials[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'financials'), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CourseFinancials));
  }, () => callback([]));
}

export async function createFinancial(data: Omit<CourseFinancials, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'financials'), { ...data, updatedAt: Date.now() });
  return docRef.id;
}

export async function editFinancial(id: string, data: Partial<CourseFinancials>): Promise<void> {
  const { id: _id, ...updateData } = data as CourseFinancials;
  await updateDoc(doc(db, 'financials', id), { ...updateData, updatedAt: Date.now() });
}

export async function removeFinancial(id: string): Promise<void> {
  await deleteDoc(doc(db, 'financials', id));
}

// --- Audit Log ---
export function subscribeAuditLog(callback: (log: AuditLogEntry[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'auditLog'), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AuditLogEntry));
  }, () => callback([]));
}

export async function createAuditLog(data: Omit<AuditLogEntry, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'auditLog'), data);
  return docRef.id;
}

// --- Live Sessions ---
export function subscribeLiveSessions(callback: (sessions: LiveSession[]) => void): Unsubscribe {
  const q = query(collection(db, 'liveSessions'), orderBy('scheduledStartTime'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LiveSession));
  }, () => callback([]));
}

export async function createLiveSession(data: Omit<LiveSession, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'liveSessions'), { ...data, createdAt: Date.now(), updatedAt: Date.now() });
  return docRef.id;
}

export async function editLiveSession(id: string, data: Partial<LiveSession>): Promise<void> {
  const { id: _id, ...updateData } = data as LiveSession;
  await updateDoc(doc(db, 'liveSessions', id), { ...updateData, updatedAt: Date.now() });
}

export async function removeLiveSession(id: string): Promise<void> {
  await deleteDoc(doc(db, 'liveSessions', id));
}

export async function getSessionsByCourse(courseId: string): Promise<LiveSession[]> {
  const q = query(collection(db, 'liveSessions'), where('courseId', '==', courseId), orderBy('scheduledStartTime'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LiveSession);
}

// --- Session Attendance ---
export function subscribeSessionAttendance(callback: (attendance: SessionAttendance[]) => void): Unsubscribe {
  const q = query(collection(db, 'sessionAttendance'), orderBy('joinedAt'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SessionAttendance));
  }, () => callback([]));
}

export function subscribeSessionAttendanceBySession(sessionId: string, callback: (attendance: SessionAttendance[]) => void): Unsubscribe {
  const q = query(collection(db, 'sessionAttendance'), where('sessionId', '==', sessionId), orderBy('joinedAt'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SessionAttendance));
  }, () => callback([]));
}

export async function createSessionAttendance(data: Omit<SessionAttendance, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'sessionAttendance'), data);
  return docRef.id;
}

export async function editSessionAttendance(id: string, data: Partial<SessionAttendance>): Promise<void> {
  const { id: _id, ...updateData } = data as SessionAttendance;
  await updateDoc(doc(db, 'sessionAttendance', id), updateData);
}

export async function removeSessionAttendance(id: string): Promise<void> {
  await deleteDoc(doc(db, 'sessionAttendance', id));
}

export async function getAttendanceBySession(sessionId: string): Promise<SessionAttendance[]> {
  const q = query(collection(db, 'sessionAttendance'), where('sessionId', '==', sessionId), orderBy('joinedAt'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SessionAttendance);
}

// --- Recordings ---
export function subscribeRecordings(callback: (recordings: Recording[]) => void): Unsubscribe {
  const q = query(collection(db, 'recordings'), orderBy('order'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Recording));
  }, () => callback([]));
}

export async function createRecording(data: Omit<Recording, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'recordings'), { ...data, createdAt: Date.now(), updatedAt: Date.now() });
  return docRef.id;
}

export async function editRecording(id: string, data: Partial<Recording>): Promise<void> {
  const { id: _id, ...updateData } = data as Recording;
  await updateDoc(doc(db, 'recordings', id), { ...updateData, updatedAt: Date.now() });
}

export async function removeRecording(id: string): Promise<void> {
  await deleteDoc(doc(db, 'recordings', id));
}

export async function getRecordingsByCourse(courseId: string): Promise<Recording[]> {
  const q = query(collection(db, 'recordings'), where('courseId', '==', courseId), orderBy('order'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Recording);
}

// --- Recording Progress ---
export async function setRecordingProgress(id: string, data: Omit<RecordingProgress, 'id'>): Promise<void> {
  await setDoc(doc(db, 'recordingProgress', id), { ...data, updatedAt: Date.now() }, { merge: true });
}

export async function getRecordingProgressByUserAndRecording(userId: string, recordingId: string): Promise<RecordingProgress | null> {
  const q = query(collection(db, 'recordingProgress'), where('userId', '==', userId), where('recordingId', '==', recordingId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as RecordingProgress;
}

// --- Quizzes ---
export function subscribeQuizzes(callback: (quizzes: Quiz[]) => void): Unsubscribe {
  const q = query(collection(db, 'quizzes'), orderBy('createdAt'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Quiz));
  }, () => callback([]));
}

export async function createQuiz(data: Omit<Quiz, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'quizzes'), { ...data, createdAt: Date.now(), updatedAt: Date.now() });
  return docRef.id;
}

export async function editQuiz(id: string, data: Partial<Quiz>): Promise<void> {
  const { id: _id, ...updateData } = data as Quiz;
  await updateDoc(doc(db, 'quizzes', id), { ...updateData, updatedAt: Date.now() });
}

export async function removeQuiz(id: string): Promise<void> {
  await deleteDoc(doc(db, 'quizzes', id));
}

export async function getQuizzesByCourse(courseId: string): Promise<Quiz[]> {
  const q = query(collection(db, 'quizzes'), where('courseId', '==', courseId), orderBy('createdAt'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Quiz);
}

// --- Quiz Questions (subcollection) ---
export function subscribeQuizQuestions(quizId: string, callback: (questions: QuizQuestion[]) => void): Unsubscribe {
  const q = query(collection(db, 'quizzes', quizId, 'questions'), orderBy('order'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as QuizQuestion));
  }, () => callback([]));
}

export async function createQuizQuestion(quizId: string, data: Omit<QuizQuestion, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'quizzes', quizId, 'questions'), data);
  return docRef.id;
}

export async function editQuizQuestion(quizId: string, questionId: string, data: Partial<QuizQuestion>): Promise<void> {
  const { id: _id, ...updateData } = data as QuizQuestion;
  await updateDoc(doc(db, 'quizzes', quizId, 'questions', questionId), updateData);
}

export async function removeQuizQuestion(quizId: string, questionId: string): Promise<void> {
  await deleteDoc(doc(db, 'quizzes', quizId, 'questions', questionId));
}

// --- Quiz Submissions ---
export function subscribeQuizSubmissions(callback: (submissions: QuizSubmission[]) => void): Unsubscribe {
  const q = query(collection(db, 'quizSubmissions'), orderBy('submittedAt'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as QuizSubmission));
  }, () => callback([]));
}

export function subscribeQuizSubmissionsByQuiz(quizId: string, callback: (submissions: QuizSubmission[]) => void): Unsubscribe {
  const q = query(collection(db, 'quizSubmissions'), where('quizId', '==', quizId));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as QuizSubmission));
  }, () => callback([]));
}

export async function createQuizSubmission(data: Omit<QuizSubmission, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'quizSubmissions'), data);
  return docRef.id;
}

export async function editQuizSubmission(id: string, data: Partial<QuizSubmission>): Promise<void> {
  const { id: _id, ...updateData } = data as QuizSubmission;
  await updateDoc(doc(db, 'quizSubmissions', id), updateData);
}

export async function removeQuizSubmission(id: string): Promise<void> {
  await deleteDoc(doc(db, 'quizSubmissions', id));
}

export async function getQuizSubmissionsByQuiz(quizId: string): Promise<QuizSubmission[]> {
  const q = query(collection(db, 'quizSubmissions'), where('quizId', '==', quizId), orderBy('submittedAt'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as QuizSubmission);
}

// --- Capstones ---
export function subscribeCapstones(callback: (capstones: Capstone[]) => void): Unsubscribe {
  const q = query(collection(db, 'capstones'), orderBy('createdAt'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Capstone));
  }, () => callback([]));
}

export async function createCapstone(data: Omit<Capstone, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'capstones'), { ...data, createdAt: Date.now(), updatedAt: Date.now() });
  return docRef.id;
}

export async function editCapstone(id: string, data: Partial<Capstone>): Promise<void> {
  const { id: _id, ...updateData } = data as Capstone;
  await updateDoc(doc(db, 'capstones', id), { ...updateData, updatedAt: Date.now() });
}

export async function removeCapstone(id: string): Promise<void> {
  await deleteDoc(doc(db, 'capstones', id));
}

export async function getCapstonesByCourse(courseId: string): Promise<Capstone[]> {
  const q = query(collection(db, 'capstones'), where('courseId', '==', courseId), orderBy('createdAt'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Capstone);
}

// --- Capstone Submissions ---
export function subscribeCapstoneSubmissions(callback: (submissions: CapstoneSubmission[]) => void): Unsubscribe {
  const q = query(collection(db, 'capstoneSubmissions'), orderBy('submittedAt'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CapstoneSubmission));
  }, () => callback([]));
}

export async function createCapstoneSubmission(data: Omit<CapstoneSubmission, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'capstoneSubmissions'), { ...data, createdAt: Date.now(), updatedAt: Date.now() });
  return docRef.id;
}

export async function editCapstoneSubmission(id: string, data: Partial<CapstoneSubmission>): Promise<void> {
  const { id: _id, ...updateData } = data as CapstoneSubmission;
  await updateDoc(doc(db, 'capstoneSubmissions', id), { ...updateData, updatedAt: Date.now() });
}

export async function removeCapstoneSubmission(id: string): Promise<void> {
  await deleteDoc(doc(db, 'capstoneSubmissions', id));
}

export async function getCapstoneSubmissionsByCapstone(capstoneId: string): Promise<CapstoneSubmission[]> {
  const q = query(collection(db, 'capstoneSubmissions'), where('capstoneId', '==', capstoneId), orderBy('submittedAt'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CapstoneSubmission);
}

// --- Course Progress ---
export async function setCourseProgress(userId: string, courseId: string, data: Omit<CourseProgress, 'id'>): Promise<void> {
  const compositeId = `${userId}_${courseId}`;
  await setDoc(doc(db, 'courseProgress', compositeId), { ...data, updatedAt: Date.now() }, { merge: true });
}

export async function getProgressByUser(userId: string): Promise<CourseProgress[]> {
  const q = query(collection(db, 'courseProgress'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CourseProgress);
}

export async function getProgressByCourse(courseId: string): Promise<CourseProgress[]> {
  const q = query(collection(db, 'courseProgress'), where('courseId', '==', courseId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CourseProgress);
}

// --- Aliases & User-scoped subscriptions ---
export const subscribeSessions = subscribeLiveSessions;
export const subscribeAttendance = subscribeSessionAttendance;
export const createSession = createLiveSession;
export const editSession = editLiveSession;
export const removeSession = removeLiveSession;

export function subscribeCourseProgress(userId: string, callback: (progress: CourseProgress[]) => void): Unsubscribe {
  const q = query(collection(db, 'courseProgress'), where('userId', '==', userId));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CourseProgress));
  }, () => callback([]));
}

export function subscribeUserQuizSubmissions(userId: string, callback: (submissions: QuizSubmission[]) => void): Unsubscribe {
  const q = query(collection(db, 'quizSubmissions'), where('userId', '==', userId), orderBy('submittedAt'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as QuizSubmission));
  }, () => callback([]));
}

export function subscribeUserCapstoneSubmissions(userId: string, callback: (submissions: CapstoneSubmission[]) => void): Unsubscribe {
  const q = query(collection(db, 'capstoneSubmissions'), where('userId', '==', userId), orderBy('submittedAt'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CapstoneSubmission));
  }, () => callback([]));
}

export function subscribeAllCourseProgress(callback: (progress: CourseProgress[]) => void): Unsubscribe {
  const q = query(collection(db, 'courseProgress'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CourseProgress));
  }, () => callback([]));
}

export function subscribeCourseProgressByCourse(courseId: string, callback: (progress: CourseProgress[]) => void): Unsubscribe {
  const q = query(collection(db, 'courseProgress'), where('courseId', '==', courseId));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CourseProgress));
  }, () => callback([]));
}

export function subscribeRecordingProgress(userId: string, callback: (progress: RecordingProgress[]) => void): Unsubscribe {
  const q = query(collection(db, 'recordingProgress'), where('userId', '==', userId));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as RecordingProgress));
  }, () => callback([]));
}

// --- Site Config ---
const SITE_CONFIG_DOC = 'main';

export function subscribeSiteConfig(callback: (config: SiteConfig | null) => void): Unsubscribe {
  return onSnapshot(doc(db, 'siteConfig', SITE_CONFIG_DOC), (snap) => {
    callback(snap.exists() ? (snap.data() as SiteConfig) : null);
  }, () => callback(null));
}

export async function getSiteConfig(): Promise<SiteConfig | null> {
  const snap = await getDoc(doc(db, 'siteConfig', SITE_CONFIG_DOC));
  return snap.exists() ? (snap.data() as SiteConfig) : null;
}

export async function updateSiteConfig(data: Partial<SiteConfig>): Promise<void> {
  await setDoc(doc(db, 'siteConfig', SITE_CONFIG_DOC), { ...data, updatedAt: Date.now() }, { merge: true });
}
