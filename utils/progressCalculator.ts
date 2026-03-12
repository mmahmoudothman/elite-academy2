import { CourseProgress } from '../types';

interface ProgressParams {
  sessionsAttended: number;
  totalSessions: number;
  recordingsWatched: number;
  totalRecordings: number;
  quizzesCompleted: number;
  totalQuizzes: number;
  capstonesCompleted: number;
  totalCapstones: number;
  quizAvgScore: number;
  capstoneAvgScore: number;
}

/**
 * Calculate the overall course progress percentage.
 * Weights: sessions 25%, recordings 15%, quizzes 30%, capstones 30%.
 * If a category has 0 total, its weight is redistributed proportionally.
 */
export function calculateCourseProgress(params: ProgressParams): Omit<CourseProgress, 'id' | 'userId' | 'studentId' | 'courseId' | 'recordingWatchPercent' | 'lastActivityAt' | 'updatedAt'> {
  const {
    sessionsAttended, totalSessions,
    recordingsWatched, totalRecordings,
    quizzesCompleted, totalQuizzes,
    capstonesCompleted, totalCapstones,
    quizAvgScore, capstoneAvgScore,
  } = params;

  // Completion ratios
  const sessionRatio = totalSessions > 0 ? sessionsAttended / totalSessions : 0;
  const recordingRatio = totalRecordings > 0 ? recordingsWatched / totalRecordings : 0;
  const quizRatio = totalQuizzes > 0 ? quizzesCompleted / totalQuizzes : 0;
  const capstoneRatio = totalCapstones > 0 ? capstonesCompleted / totalCapstones : 0;

  // Weighted calculation with redistribution
  const weights = [
    { ratio: sessionRatio, weight: 25, active: totalSessions > 0 },
    { ratio: recordingRatio, weight: 15, active: totalRecordings > 0 },
    { ratio: quizRatio, weight: 30, active: totalQuizzes > 0 },
    { ratio: capstoneRatio, weight: 30, active: totalCapstones > 0 },
  ];

  const totalActiveWeight = weights.filter(w => w.active).reduce((sum, w) => sum + w.weight, 0);

  let overallPercent = 0;
  if (totalActiveWeight > 0) {
    overallPercent = weights
      .filter(w => w.active)
      .reduce((sum, w) => sum + (w.ratio * (w.weight / totalActiveWeight) * 100), 0);
  }

  // Factor in score quality (blend completion with scores)
  const scoreCategories: { ratio: number; score: number; active: boolean }[] = [
    { ratio: quizRatio, score: quizAvgScore, active: totalQuizzes > 0 },
    { ratio: capstoneRatio, score: capstoneAvgScore, active: totalCapstones > 0 },
  ];

  const activeScoreCategories = scoreCategories.filter(c => c.active && c.ratio > 0);
  if (activeScoreCategories.length > 0) {
    const avgScore = activeScoreCategories.reduce((sum, c) => sum + c.score, 0) / activeScoreCategories.length;
    // Blend: 70% completion, 30% score quality
    overallPercent = overallPercent * 0.7 + avgScore * 0.3;
  }

  return {
    sessionsAttended,
    totalSessions,
    recordingsWatched,
    totalRecordings,
    quizzesCompleted,
    totalQuizzes,
    quizAvgScore,
    capstonesCompleted,
    totalCapstones,
    capstoneAvgScore,
    overallCompletionPercent: Math.round(Math.min(100, Math.max(0, overallPercent))),
  };
}

/**
 * Get the Tailwind color class for a progress percentage.
 */
export function getProgressColor(percent: number): string {
  if (percent >= 80) return 'bg-emerald-500';
  if (percent >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

/**
 * Get the text color class for a progress percentage.
 */
export function getProgressTextColor(percent: number): string {
  if (percent >= 80) return 'text-emerald-600';
  if (percent >= 50) return 'text-amber-600';
  return 'text-red-600';
}

/**
 * Get the background color class for a progress percentage badge.
 */
export function getProgressBgColor(percent: number): string {
  if (percent >= 80) return 'bg-emerald-50';
  if (percent >= 50) return 'bg-amber-50';
  return 'bg-red-50';
}

/**
 * Get a human-readable label for a progress percentage.
 */
export function getProgressLabel(percent: number): string {
  if (percent >= 80) return 'Excellent';
  if (percent >= 50) return 'Good';
  if (percent >= 25) return 'Needs Improvement';
  return 'At Risk';
}
