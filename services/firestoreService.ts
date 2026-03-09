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
import { Course, Instructor, User, Enrollment, ContactSubmission, SiteConfig } from '../types';

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

// --- Users ---
export function subscribeUsers(callback: (users: User[]) => void): Unsubscribe {
  const q = query(collection(db, 'users'), orderBy('displayName'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as User));
  }, () => callback([]));
}

export function subscribeStudents(callback: (students: User[]) => void): Unsubscribe {
  const q = query(collection(db, 'users'), where('role', '==', 'student'), orderBy('displayName'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as User));
  }, () => callback([]));
}

export async function fetchUsers(): Promise<User[]> {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('displayName')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as User);
}

export async function updateUser(id: string, data: Partial<User>): Promise<void> {
  await setDoc(doc(db, 'users', id), { ...data, updatedAt: Date.now() }, { merge: true });
}

export async function deleteUser(id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', id));
}

// --- Enrollments ---
export function subscribeEnrollments(callback: (enrollments: Enrollment[]) => void): Unsubscribe {
  const q = query(collection(db, 'enrollments'), orderBy('enrolledAt'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Enrollment));
  }, () => callback([]));
}

export async function fetchEnrollments(): Promise<Enrollment[]> {
  const snap = await getDocs(query(collection(db, 'enrollments'), orderBy('enrolledAt')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Enrollment);
}

export async function createEnrollment(data: Omit<Enrollment, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'enrollments'), data);
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
  const q = query(collection(db, 'contacts'), orderBy('submittedAt'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ContactSubmission));
  }, () => callback([]));
}

export async function createContact(data: Omit<ContactSubmission, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'contacts'), data);
  return docRef.id;
}

export async function editContact(id: string, data: Partial<ContactSubmission>): Promise<void> {
  const { id: _id, ...updateData } = data as ContactSubmission;
  await updateDoc(doc(db, 'contacts', id), updateData);
}

export async function removeContact(id: string): Promise<void> {
  await deleteDoc(doc(db, 'contacts', id));
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

// --- Seed helpers ---
export async function seedCourses(courses: Course[]): Promise<void> {
  const existing = await fetchCourses();
  if (existing.length > 0) return;
  for (const course of courses) {
    const { id, ...data } = course;
    await addDoc(collection(db, 'courses'), { ...data, capacity: data.capacity || 100, createdAt: Date.now(), updatedAt: Date.now() });
  }
}

export async function seedInstructors(instructors: Instructor[]): Promise<void> {
  const existing = await fetchInstructors();
  if (existing.length > 0) return;
  for (const instructor of instructors) {
    const { id, ...data } = instructor;
    await addDoc(collection(db, 'instructors'), { ...data, createdAt: Date.now(), updatedAt: Date.now() });
  }
}

export async function seedSiteConfig(config: SiteConfig): Promise<void> {
  const existing = await getSiteConfig();
  if (existing) return;
  await setDoc(doc(db, 'siteConfig', SITE_CONFIG_DOC), { ...config, updatedAt: Date.now() });
}
