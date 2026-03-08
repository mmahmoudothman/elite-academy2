import { useState, useEffect, useMemo } from 'react';
import { Course, Instructor, DashboardStats } from '../types';
import { COURSES, INSTRUCTORS } from '../constants';

const STORAGE_KEYS = {
  courses: 'elite_academy_courses',
  instructors: 'elite_academy_instructors',
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
    loadFromStorage<Course>(STORAGE_KEYS.courses, COURSES)
  );
  const [instructors, setInstructors] = useState<Instructor[]>(() =>
    loadFromStorage<Instructor>(STORAGE_KEYS.instructors, INSTRUCTORS)
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.courses, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.instructors, JSON.stringify(instructors));
  }, [instructors]);

  const stats: DashboardStats = useMemo(() => ({
    totalCourses: courses.length,
    totalInstructors: instructors.length,
    totalEnrollments: courses.reduce((sum, c) => sum + c.enrolled, 0),
    totalRevenue: courses.reduce((sum, c) => sum + c.price * c.enrolled, 0),
  }), [courses, instructors]);

  const addCourse = (course: Omit<Course, 'id'>) => {
    const id = `course_${Date.now()}`;
    setCourses(prev => [...prev, { ...course, id }]);
  };

  const updateCourse = (id: string, data: Partial<Course>) => {
    setCourses(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const addInstructor = (instructor: Omit<Instructor, 'id'>) => {
    const id = `inst_${Date.now()}`;
    setInstructors(prev => [...prev, { ...instructor, id }]);
  };

  const updateInstructor = (id: string, data: Partial<Instructor>) => {
    setInstructors(prev => prev.map(i => (i.id === id ? { ...i, ...data } : i)));
  };

  const deleteInstructor = (id: string) => {
    setInstructors(prev => prev.filter(i => i.id !== id));
  };

  const resetToDefaults = () => {
    setCourses([...COURSES]);
    setInstructors([...INSTRUCTORS]);
  };

  return {
    courses,
    instructors,
    stats,
    loading: false,
    error: null,
    addCourse,
    updateCourse,
    deleteCourse,
    addInstructor,
    updateInstructor,
    deleteInstructor,
    resetToDefaults,
  };
}
