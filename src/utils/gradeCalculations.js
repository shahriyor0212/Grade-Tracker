/**
 * Grade calculation utilities.
 * Averages are calculated as the simple arithmetic mean of all graded exams' scores.
 */

/**
 * Calculates the mean percentage grade of a list of exams.
 * Ignores exams that haven't been scored (score === null or undefined).
 * 
 * @param {Array} exams - Array of exam objects with a `score` property (number out of 100 or null)
 * @returns {number|null} Mean percentage out of 100, or null if no exams are graded
 */
export function calculateExamListMean(exams = []) {
  if (!Array.isArray(exams) || exams.length === 0) return null;

  const scoredExams = exams.filter(
    (e) => e && typeof e.score === 'number' && !isNaN(e.score) && e.score >= 0
  );

  if (scoredExams.length === 0) return null;

  const totalScore = scoredExams.reduce((sum, e) => sum + e.score, 0);
  const mean = totalScore / scoredExams.length;

  // Round to 1 decimal place (e.g., 88.5)
  return Math.round(mean * 10) / 10;
}

/**
 * Calculates the mean percentage grade for a single subject.
 */
export function calculateSubjectMean(subject) {
  if (!subject || !Array.isArray(subject.exams)) return null;
  return calculateExamListMean(subject.exams);
}

/**
 * Calculates the overall mean grade across ALL graded exams across all subjects.
 * 
 * @param {Array} subjects - List of subject objects
 * @returns {{ overallMean: number|null, totalGradedExams: number, totalUpcomingExams: number, totalExams: number }}
 */
export function calculateOverallStats(subjects = []) {
  if (!Array.isArray(subjects)) {
    return { overallMean: null, totalGradedExams: 0, totalUpcomingExams: 0, totalExams: 0 };
  }

  let totalScoreSum = 0;
  let totalGradedExams = 0;
  let totalUpcomingExams = 0;
  let totalExams = 0;

  for (const subject of subjects) {
    if (!Array.isArray(subject.exams)) continue;
    for (const exam of subject.exams) {
      totalExams += 1;
      if (typeof exam.score === 'number' && !isNaN(exam.score) && exam.score >= 0) {
        totalScoreSum += exam.score;
        totalGradedExams += 1;
      } else {
        totalUpcomingExams += 1;
      }
    }
  }

  const overallMean = totalGradedExams > 0 
    ? Math.round((totalScoreSum / totalGradedExams) * 10) / 10 
    : null;

  return {
    overallMean,
    totalGradedExams,
    totalUpcomingExams,
    totalExams,
    totalSubjects: subjects.length
  };
}

/**
 * Converts a percentage score (0-100) to a standard letter grade.
 */
export function getLetterGrade(percentage) {
  if (percentage === null || percentage === undefined || isNaN(percentage)) return '—';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 60) return 'D';
  return 'F';
}

/**
 * Returns color classes for a given percentage score
 */
export function getScoreColorBadge(score) {
  if (score === null || score === undefined) {
    return {
      bg: 'bg-zinc-100 dark:bg-zinc-800',
      text: 'text-zinc-600 dark:text-zinc-400',
      border: 'border-zinc-200 dark:border-zinc-700',
      ring: 'ring-zinc-400',
    };
  }
  if (score >= 90) {
    return {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-300 dark:border-emerald-800/80',
      ring: 'ring-emerald-500',
    };
  }
  if (score >= 80) {
    return {
      bg: 'bg-blue-500/10 dark:bg-blue-500/15',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-300 dark:border-blue-800/80',
      ring: 'ring-blue-500',
    };
  }
  if (score >= 70) {
    return {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-300 dark:border-amber-800/80',
      ring: 'ring-amber-500',
    };
  }
  return {
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-300 dark:border-rose-800/80',
    ring: 'ring-rose-500',
  };
}
