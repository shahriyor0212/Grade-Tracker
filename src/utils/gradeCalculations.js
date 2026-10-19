/**
 * Grade calculation utilities.
 * Averages are simple arithmetic means of graded exams (no weights, no credit hours).
 * Adds GPA 4.0 translation, required-score projection,
 * readiness aggregation, and trajectory series for SVG charts.
 */

/**
 * Returns true when an exam record carries a valid numeric score.
 *
 * @param {Object} exam
 * @returns {boolean}
 */
export function isGradedExam(exam) {
  return !!exam && typeof exam.score === 'number' && !isNaN(exam.score) && exam.score >= 0;
}


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

  // Average of declared subject targets (used for the target buffer telemetry)
  const declaredTargets = (Array.isArray(subjects) ? subjects : [])
    .map((s) => s?.targetGrade)
    .filter((t) => typeof t === 'number' && !isNaN(t));
  const averageTarget =
    declaredTargets.length > 0
      ? Math.round(
          (declaredTargets.reduce((sum, t) => sum + t, 0) / declaredTargets.length) * 10
        ) / 10
      : null;
  const targetBuffer =
    overallMean !== null && averageTarget !== null
      ? Math.round((overallMean - averageTarget) * 10) / 10
      : null;

  return {
    overallMean,
    gpa: percentageToGpa(overallMean),
    averageTarget,
    targetBuffer,
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
 * Returns clinical color classes for a given percentage score
 */
export function getScoreColorBadge(score) {
  if (score === null || score === undefined) {
    return {
      bg: 'bg-surface-container-low dark:bg-night-canvas',
      text: 'text-on-surface-variant dark:text-night-muted',
      border: 'border-outline-variant dark:border-night-border',
    };
  }
  if (score >= 90) {
    return {
      bg: 'bg-secondary/10 dark:bg-secondary/15',
      text: 'text-secondary',
      border: 'border-secondary/30 dark:border-secondary/40',
    };
  }
  if (score >= 80) {
    return {
      bg: 'bg-[#6366f1]/10 dark:bg-[#6366f1]/15',
      text: 'text-[#6366f1]',
      border: 'border-[#6366f1]/30 dark:border-[#6366f1]/40',
    };
  }
  if (score >= 60) {
    return {
      bg: 'bg-transparent',
      text: 'text-on-surface-variant dark:text-night-muted',
      border: 'border-outline-variant dark:border-night-border',
    };
  }
  return {
    bg: 'bg-error/10 dark:bg-error/15',
    text: 'text-error',
    border: 'border-error/30 dark:border-error/40',
  };
}

/**
 * Translates a percentage (0-100) into a standard 4.0 GPA scale.
 * Pure scale mapping — no credit hours involved.
 *
 * @param {number} percentage
 * @returns {number|null}
 */
export function percentageToGpa(percentage) {
  if (typeof percentage !== 'number' || isNaN(percentage)) return null;
  if (percentage >= 93) return 4.0;
  if (percentage >= 90) return 3.7;
  if (percentage >= 87) return 3.3;
  if (percentage >= 83) return 3.0;
  if (percentage >= 80) return 2.7;
  if (percentage >= 77) return 2.3;
  if (percentage >= 73) return 2.0;
  if (percentage >= 70) return 1.7;
  if (percentage >= 67) return 1.3;
  if (percentage >= 60) return 1.0;
  return 0.0;
}

/**
 * Equal-weight required score: the average needed across all pending exams
 * for the overall mean to reach `target`.
 *
 * Required = (target × totalExams − gradedSum) / pendingCount, clamped to 0–100.
 *
 * @param {{ gradedSum: number, gradedCount: number, pendingCount: number, target: number|null }} params
 * @returns {number|null} Rounded to 1 decimal, or null when not applicable
 */
export function calculateRequiredScore({
  gradedSum = 0,
  gradedCount = 0,
  pendingCount = 0,
  target = null,
} = {}) {
  if (typeof target !== 'number' || isNaN(target)) return null;
  if (pendingCount <= 0) return null;

  const required = (target * (gradedCount + pendingCount) - gradedSum) / pendingCount;
  const clamped = Math.max(0, Math.min(100, required));
  return Math.round(clamped * 10) / 10;
}

/**
 * Builds a cumulative-average trajectory series from graded exams,
 * ordered by date — feeds the SVG sparkline / longitudinal plots.
 *
 * @param {Array} exams
 * @returns {Array<{ date: string, value: number }>}
 */
export function buildTrajectorySeries(exams = []) {
  if (!Array.isArray(exams)) return [];

  const graded = exams
    .filter(isGradedExam)
    .slice()
    .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));

  let runningSum = 0;
  return graded.map((exam, index) => {
    runningSum += exam.score;
    return {
      date: exam.date,
      value: Math.round((runningSum / (index + 1)) * 10) / 10,
    };
  });
}

/**
 * Mean revision readiness (0-100) across exams that declare it.
 *
 * @param {Array} exams
 * @returns {number|null}
 */
export function calculateAverageReadiness(exams = []) {
  if (!Array.isArray(exams)) return null;
  const withReadiness = exams.filter(
    (e) => e && typeof e.readiness === 'number' && !isNaN(e.readiness)
  );
  if (withReadiness.length === 0) return null;
  const mean =
    withReadiness.reduce((sum, e) => sum + e.readiness, 0) / withReadiness.length;
  return Math.round(mean * 10) / 10;
}

/**
 * Full per-subject insight bundle used by Dashboard, Targets and Analytics views.
 *
 * @param {Object} subject
 * @returns {{
 *   mean: number|null, letterGrade: string, gpa: number|null,
 *   gradedCount: number, pendingCount: number,
 *   totalExams: number, target: number|null, gap: number|null,
 *   requiredScore: number|null, targetAchievable: boolean|null,
 *   readiness: number|null, completionRatio: number,
 *   trajectory: Array<{date: string, value: number}>
 * }}
 */
export function calculateSubjectStats(subject) {
  const exams = Array.isArray(subject?.exams) ? subject.exams : [];
  const gradedExams = exams.filter(isGradedExam);
  const pendingExams = exams.filter((e) => !isGradedExam(e));

  const mean = calculateExamListMean(exams);
  const gradedSum = gradedExams.reduce((sum, e) => sum + e.score, 0);
  const target = typeof subject?.targetGrade === 'number' ? subject.targetGrade : null;

  const requiredScore = calculateRequiredScore({
    gradedSum,
    gradedCount: gradedExams.length,
    pendingCount: pendingExams.length,
    target,
  });

  const targetAchievable =
    target === null
      ? null
      : gradedSum + pendingExams.length * 100 >= target * exams.length;

  const gap = mean !== null && target !== null ? Math.round((mean - target) * 10) / 10 : null;

  return {
    mean,
    letterGrade: getLetterGrade(mean),
    gpa: percentageToGpa(mean),
    gradedCount: gradedExams.length,
    pendingCount: pendingExams.length,
    totalExams: exams.length,
    target,
    gap,
    requiredScore,
    targetAchievable,
    readiness: calculateAverageReadiness(exams),
    completionRatio: exams.length > 0 ? gradedExams.length / exams.length : 0,
    trajectory: buildTrajectorySeries(exams),
  };
}
