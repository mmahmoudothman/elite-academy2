import { useMemo } from 'react';
import { Enrollment, Course } from '../types';

interface MonthlyData {
  month: string;
  enrollments: number;
  revenue: number;
}

interface CourseAnalytics {
  courseId: string;
  courseTitle: string;
  enrollments: number;
  revenue: number;
  avgRating: number;
}

interface DemographicData {
  country: string;
  count: number;
}

export function useAnalytics(enrollments: Enrollment[], courses: Course[]) {
  const monthlyData = useMemo((): MonthlyData[] => {
    const months: Record<string, MonthlyData> = {};
    const now = new Date();

    // Last 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en', { month: 'short', year: '2-digit' });
      months[key] = { month: label, enrollments: 0, revenue: 0 };
    }

    enrollments.forEach(e => {
      const d = new Date(e.enrolledAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (months[key]) {
        months[key].enrollments++;
        if (e.paymentStatus === 'paid') months[key].revenue += e.paymentAmount;
      }
    });

    return Object.values(months);
  }, [enrollments]);

  const courseAnalytics = useMemo((): CourseAnalytics[] => {
    const map: Record<string, CourseAnalytics> = {};

    courses.forEach(c => {
      map[c.id] = { courseId: c.id, courseTitle: c.title, enrollments: 0, revenue: 0, avgRating: c.rating };
    });

    enrollments.forEach(e => {
      if (map[e.courseId]) {
        map[e.courseId].enrollments++;
        if (e.paymentStatus === 'paid') map[e.courseId].revenue += e.paymentAmount;
      }
    });

    return Object.values(map).sort((a, b) => b.enrollments - a.enrollments);
  }, [enrollments, courses]);

  const demographics = useMemo((): DemographicData[] => {
    const countryMap: Record<string, number> = {};
    const seen = new Set<string>();
    const countryLabels: Record<string, string> = { EG: 'Egypt', SA: 'Saudi Arabia', AE: 'UAE', KW: 'Kuwait', QA: 'Qatar', BH: 'Bahrain', OM: 'Oman', JO: 'Jordan' };

    // Use students data if available via closure
    const studentMap = new Map<string, string>();
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('elite_academy_students');
        if (stored) {
          const students = JSON.parse(stored);
          students.forEach((s: any) => { if (s.country) studentMap.set(s.id, s.country); });
        }
      } catch { /* ignore */ }
    }

    enrollments.forEach(e => {
      if (!seen.has(e.studentId)) {
        seen.add(e.studentId);
        const code = studentMap.get(e.studentId) || 'Unknown';
        const country = countryLabels[code] || code;
        countryMap[country] = (countryMap[country] || 0) + 1;
      }
    });

    return Object.entries(countryMap).map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count);
  }, [enrollments]);

  const statusBreakdown = useMemo(() => {
    const counts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    enrollments.forEach(e => { counts[e.status]++; });
    return counts;
  }, [enrollments]);

  const paymentBreakdown = useMemo(() => {
    const counts = { pending: 0, paid: 0, refunded: 0 };
    enrollments.forEach(e => { counts[e.paymentStatus]++; });
    return counts;
  }, [enrollments]);

  const totalRevenue = useMemo(() =>
    enrollments.filter(e => e.paymentStatus === 'paid').reduce((sum, e) => sum + e.paymentAmount, 0)
  , [enrollments]);

  const categoryRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    const courseMap = Object.fromEntries(courses.map(c => [c.id, c]));
    enrollments.forEach(e => {
      if (e.paymentStatus === 'paid' && courseMap[e.courseId]) {
        const cat = courseMap[e.courseId].category;
        map[cat] = (map[cat] || 0) + e.paymentAmount;
      }
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [enrollments, courses]);

  return {
    monthlyData,
    courseAnalytics,
    demographics,
    statusBreakdown,
    paymentBreakdown,
    totalRevenue,
    categoryRevenue,
  };
}
