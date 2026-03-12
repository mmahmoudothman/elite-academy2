import { useState, useEffect, useCallback } from 'react';
import { Capstone, CapstoneSubmission, CourseProgress } from '../types';
import * as fs from '../services/firestoreService';

export function useLearningData(userId?: string) {
  const [capstones, setCapstones] = useState<Capstone[]>([]);
  const [submissions, setSubmissions] = useState<CapstoneSubmission[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let loaded = 0;
    const total = userId ? 3 : 2;
    const checkDone = () => { loaded++; if (loaded >= total) setLoading(false); };

    const unsubs = [
      fs.subscribeCapstones((data) => { setCapstones(data); checkDone(); }),
      fs.subscribeCapstoneSubmissions((data) => { setSubmissions(data); checkDone(); }),
    ];

    if (userId) {
      unsubs.push(
        fs.subscribeCourseProgress(userId, (data) => { setProgress(data); checkDone(); }),
      );
    } else {
      setLoading(false);
    }

    return () => unsubs.forEach(u => u());
  }, [userId]);

  // --- Capstone CRUD ---
  const addCapstone = useCallback(async (data: Omit<Capstone, 'id'>) => {
    await fs.createCapstone(data);
  }, []);

  const updateCapstone = useCallback(async (id: string, data: Partial<Capstone>) => {
    await fs.editCapstone(id, data);
  }, []);

  const deleteCapstone = useCallback(async (id: string) => {
    await fs.removeCapstone(id);
  }, []);

  // --- Submission CRUD ---
  const addSubmission = useCallback(async (data: Omit<CapstoneSubmission, 'id'>) => {
    await fs.createCapstoneSubmission(data);
  }, []);

  const updateSubmission = useCallback(async (id: string, data: Partial<CapstoneSubmission>) => {
    await fs.editCapstoneSubmission(id, data);
  }, []);

  const deleteSubmission = useCallback(async (id: string) => {
    await fs.removeCapstoneSubmission(id);
  }, []);

  // --- Progress CRUD ---
  const addProgress = useCallback(async (uId: string, courseId: string, data: Omit<CourseProgress, 'id'>) => {
    await fs.setCourseProgress(uId, courseId, data);
  }, []);

  const updateProgress = useCallback(async (uId: string, courseId: string, data: Omit<CourseProgress, 'id'>) => {
    await fs.setCourseProgress(uId, courseId, data);
  }, []);

  return {
    capstones,
    submissions,
    progress,
    loading,
    addCapstone,
    updateCapstone,
    deleteCapstone,
    addSubmission,
    updateSubmission,
    deleteSubmission,
    addProgress,
    updateProgress,
  };
}
