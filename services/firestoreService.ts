import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Course, Instructor } from '../types';

const COURSES_COLLECTION = 'courses';
const INSTRUCTORS_COLLECTION = 'instructors';

// --- Courses ---

export async function fetchCourses(): Promise<Course[]> {
  const q = query(collection(db, COURSES_COLLECTION), orderBy('title'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Course);
}

export function subscribeCourses(callback: (courses: Course[]) => void): Unsubscribe {
  const q = query(collection(db, COURSES_COLLECTION), orderBy('title'));
  return onSnapshot(q, (snapshot) => {
    const courses = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Course);
    callback(courses);
  });
}

export async function createCourse(data: Omit<Course, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, COURSES_COLLECTION), data);
  return docRef.id;
}

export async function editCourse(id: string, data: Partial<Course>): Promise<void> {
  const { id: _id, ...updateData } = data as Course;
  await updateDoc(doc(db, COURSES_COLLECTION, id), updateData);
}

export async function removeCourse(id: string): Promise<void> {
  await deleteDoc(doc(db, COURSES_COLLECTION, id));
}

// --- Instructors ---

export async function fetchInstructors(): Promise<Instructor[]> {
  const q = query(collection(db, INSTRUCTORS_COLLECTION), orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Instructor);
}

export function subscribeInstructors(callback: (instructors: Instructor[]) => void): Unsubscribe {
  const q = query(collection(db, INSTRUCTORS_COLLECTION), orderBy('name'));
  return onSnapshot(q, (snapshot) => {
    const instructors = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Instructor);
    callback(instructors);
  });
}

export async function createInstructor(data: Omit<Instructor, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, INSTRUCTORS_COLLECTION), data);
  return docRef.id;
}

export async function editInstructor(id: string, data: Partial<Instructor>): Promise<void> {
  const { id: _id, ...updateData } = data as Instructor;
  await updateDoc(doc(db, INSTRUCTORS_COLLECTION, id), updateData);
}

export async function removeInstructor(id: string): Promise<void> {
  await deleteDoc(doc(db, INSTRUCTORS_COLLECTION, id));
}

// --- Seed helpers ---

export async function seedCourses(courses: Course[]): Promise<void> {
  const existing = await fetchCourses();
  if (existing.length > 0) return;
  for (const course of courses) {
    const { id, ...data } = course;
    await addDoc(collection(db, COURSES_COLLECTION), data);
  }
}

export async function seedInstructors(instructors: Instructor[]): Promise<void> {
  const existing = await fetchInstructors();
  if (existing.length > 0) return;
  for (const instructor of instructors) {
    const { id, ...data } = instructor;
    await addDoc(collection(db, INSTRUCTORS_COLLECTION), data);
  }
}
