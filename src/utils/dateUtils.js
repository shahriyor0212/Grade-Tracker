/**
 * Date utility functions storing and handling dates as strict 'YYYY-MM-DD' strings.
 * This avoids JavaScript's Date UTC-parsing timezone shifts that cause off-by-one errors
 * in countdown calculations.
 */

/**
 * Returns today's date in local calendar as YYYY-MM-DD
 */
export function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validates whether a string matches standard YYYY-MM-DD format
 */
export function isValidDateString(dateStr) {
  if (typeof dateStr !== 'string') return false;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  
  const [, , m, d] = match.map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  return true;
}

/**
 * Calculates the exact difference in calendar days between two YYYY-MM-DD strings.
 * Operates purely on year, month, and day integers at local midnight, eliminating timezone skews.
 */
export function getDaysDifference(targetDateStr, baseDateStr = getTodayString()) {
  if (!isValidDateString(targetDateStr) || !isValidDateString(baseDateStr)) {
    return null;
  }

  const [tYear, tMonth, tDay] = targetDateStr.split('-').map(Number);
  const [bYear, bMonth, bDay] = baseDateStr.split('-').map(Number);

  // Use UTC midnight for both to ensure exact 24-hour day difference with zero DST/local shift
  const targetUtc = Date.UTC(tYear, tMonth - 1, tDay);
  const baseUtc = Date.UTC(bYear, bMonth - 1, bDay);

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((targetUtc - baseUtc) / MS_PER_DAY);
}

/**
 * Returns a human-friendly countdown label and status classification
 */
export function getCountdownInfo(targetDateStr, isGraded = false) {
  const diffDays = getDaysDifference(targetDateStr);
  if (diffDays === null) {
    return { label: 'No date', status: 'unknown', days: 0 };
  }

  if (diffDays === 0) {
    return { label: 'Today', status: 'today', days: 0 };
  }
  if (diffDays === 1) {
    return { label: 'Tomorrow', status: 'tomorrow', days: 1 };
  }
  if (diffDays > 1) {
    return { label: `In ${diffDays} days`, status: 'upcoming', days: diffDays };
  }
  if (diffDays === -1) {
    return { 
      label: isGraded ? 'Yesterday' : 'Yesterday (Pending score)', 
      status: isGraded ? 'past' : 'overdue', 
      days: -1 
    };
  }
  return { 
    label: isGraded ? `${Math.abs(diffDays)} days ago` : `${Math.abs(diffDays)} days overdue`, 
    status: isGraded ? 'past' : 'overdue', 
    days: diffDays 
  };
}

/**
 * Formats a YYYY-MM-DD string into a clean readable date, e.g. "Oct 24, 2026"
 */
export function formatReadableDate(dateStr, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!isValidDateString(dateStr)) return dateStr || 'N/A';
  const [y, m, d] = dateStr.split('-').map(Number);
  // Construct date locally
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, options);
}

/**
 * Formats date into a short day-of-week + date, e.g. "Sat, Oct 24"
 */
export function formatShortDateWithDay(dateStr) {
  return formatReadableDate(dateStr, { weekday: 'short', month: 'short', day: 'numeric' });
}
