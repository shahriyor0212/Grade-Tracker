/**
 * LocalStorage management module with strict try/catch safety guarantees.
 * Prevents app crashes if stored JSON is malformed, storage is disabled,
 * or browser quota limits are reached.
 */
import { getTodayString } from './dateUtils';

export const STORAGE_KEY = 'minimal_grade_tracker_data_v3';
export const LEGACY_STORAGE_KEY = 'minimal_grade_tracker_data_v2';
export const THEME_KEY = 'grade_tracker_theme';
export const HABITS_KEY = 'grade_tracker_habits_v1';

/** Valid assessment categories available in the exam entry form. */
export const EXAM_TYPES = ['Quiz', 'Midterm', 'Practicum', 'Final'];

/** Active academic term computed dynamically based on current system date. */
export function getCurrentTerm(date = new Date()) {
  const month = date.getMonth();
  const year = date.getFullYear();
  if (month >= 0 && month <= 4) return `Spring ${year}`;
  if (month >= 5 && month <= 7) return `Summer ${year}`;
  return `Fall ${year}`;
}

export const ACTIVE_TERM = getCurrentTerm();

/**
 * Generates a collision-resistant unique ID using native crypto.randomUUID()
 * with a fallback for older environments.
 * 
 * @param {string} prefix - Optional prefix (e.g. 'subj', 'exam')
 * @returns {string} Unique identifier
 */
export function generateId(prefix = '') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return prefix ? `${prefix}-${crypto.randomUUID()}` : crypto.randomUUID();
  }
  return `${prefix ? `${prefix}-` : ''}${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}


/**
 * Daily scholar habit checklist template (Targets view)
 */
export const DEFAULT_HABITS = [
  { id: 'habit-1', label: '90-minute deep revision block' },
  { id: 'habit-2', label: 'Active recall flashcard review' },
  { id: 'habit-3', label: 'Past paper drill' },
  { id: 'habit-4', label: 'Consolidate lecture notes' },
  { id: 'habit-5', label: '7+ hours of sleep' },
];

/**
 * Initial subjects collection (empty for new users).
 */
export const DEFAULT_INITIAL_SUBJECTS = [];

/**
 * Normalizes any raw subject array (legacy storage or imported JSON) into the
 * current schema. Adds term/examType/readiness defaults so older v2 data keeps
 * working without an explicit migration step.
 *
 * @param {Array} raw - Untrusted subject list
 * @returns {Array} Valid subject objects in current schema
 */
export function normalizeSubjects(raw) {
  if (!Array.isArray(raw)) return [];

  return raw.map((subject) => ({
    id: subject && subject.id ? subject.id : generateId('subj'),
    name: subject && typeof subject.name === 'string' && subject.name.trim()
      ? subject.name.trim()
      : 'Untitled Subject',
    code: subject && typeof subject.code === 'string' ? subject.code : '',
    color: subject && typeof subject.color === 'string' ? subject.color : 'indigo',
    targetGrade:
      subject && typeof subject.targetGrade === 'number' && !isNaN(subject.targetGrade)
        ? subject.targetGrade
        : null,
    term:
      subject && typeof subject.term === 'string' && subject.term.trim()
        ? subject.term
        : ACTIVE_TERM,
    exams: Array.isArray(subject?.exams)
      ? subject.exams
          .filter((e) => e && typeof e === 'object')
          .map((exam) => ({
            id: exam.id ? exam.id : generateId('exam'),
            title: typeof exam.title === 'string' && exam.title.trim() ? exam.title : 'Untitled Exam',
            date: exam.date,
            score:
              typeof exam.score === 'number' && !isNaN(exam.score) && exam.score >= 0
                ? exam.score
                : null,
            notes: typeof exam.notes === 'string' ? exam.notes : '',
            examType:
              typeof exam.examType === 'string' && EXAM_TYPES.includes(exam.examType)
                ? exam.examType
                : null,
            readiness:
              typeof exam.readiness === 'number' && !isNaN(exam.readiness)
                ? Math.max(0, Math.min(100, exam.readiness))
                : null,
          }))
      : [],
  }));
}

/**
 * Safely loads data from localStorage with try/catch protection.
 * If data doesn't exist, returns an empty array for a clean starting state.
 * If JSON parsing fails or data is corrupted, returns an empty array.
 * Loaded data is normalized so legacy records gain the new fields.
 */
export function loadStoredSubjects() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Check legacy storage key to clean up old pre-populated mock data
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw);
        const isMockData =
          Array.isArray(legacyParsed) &&
          legacyParsed.length === 5 &&
          legacyParsed.every((s, i) => s.id === `subj-${i + 1}`);
        if (!isMockData && Array.isArray(legacyParsed)) {
          return normalizeSubjects(legacyParsed);
        }
      }
      return DEFAULT_INITIAL_SUBJECTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filter out old sample mock subjects if still present
      const isMockData =
        parsed.length === 5 && parsed.every((s, i) => s.id === `subj-${i + 1}`);
      if (isMockData) return [];
      return normalizeSubjects(parsed);
    }
    console.warn('[GradeTracker] Corrupted subjects structure in storage. Falling back to empty.');
    return DEFAULT_INITIAL_SUBJECTS;
  } catch (error) {
    console.error('[GradeTracker] Error parsing localStorage data:', error);
    return DEFAULT_INITIAL_SUBJECTS;
  }
}

/**
 * Safely saves data to localStorage with try/catch protection.
 * Catches QuotaExceededError or security exceptions.
 * 
 * @param {Array} subjects - List of subjects to persist
 * @returns {{ success: boolean, error?: Error }}
 */
export function saveStoredSubjects(subjects) {
  try {
    const serialized = JSON.stringify(subjects);
    localStorage.setItem(STORAGE_KEY, serialized);
    return { success: true };
  } catch (error) {
    console.error('[GradeTracker] Failed to save data to localStorage:', error);
    return { success: false, error };
  }
}

/**
 * Safely loads theme preference (light/dark)
 */
export function loadStoredTheme() {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === 'dark' || theme === 'light') return theme;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  } catch {
    return 'light';
  }
}

/**
 * Safely saves theme preference
 */
export function saveStoredTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    console.warn('Could not persist theme preference');
  }
}

/**
 * Exports current subjects data as a downloadable JSON file
 */
export function exportDataAsJSON(subjects) {
  try {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(subjects, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `grade_tracker_backup_${getTodayString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    return true;
  } catch (err) {
    console.error('Failed to export JSON:', err);
    return false;
  }
}

/**
 * Safely parses imported JSON text and validates structure
 */
export function parseImportedJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!Array.isArray(data)) {
      throw new Error('Imported JSON must be an array of subjects.');
    }
    // Basic schema validation
    for (const item of data) {
      if (!item.id || !item.name) {
        throw new Error('Subjects must have an id and name.');
      }
      if (item.exams && !Array.isArray(item.exams)) {
        throw new Error('Subject exams property must be an array.');
      }
    }
    return { success: true, data: normalizeSubjects(data) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Safely loads the daily scholar habit checklist state ({ habits, log }).
 * `log` maps a YYYY-MM-DD date string to an array of completed habit ids.
 */
export function loadStoredHabits() {
  const fallback = { habits: DEFAULT_HABITS, log: {} };
  try {
    const raw = localStorage.getItem(HABITS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      Array.isArray(parsed.habits) &&
      parsed.habits.length > 0
    ) {
      return {
        habits: parsed.habits,
        log: parsed.log && typeof parsed.log === 'object' ? parsed.log : {},
      };
    }
    return fallback;
  } catch (error) {
    console.error('[GradeTracker] Error parsing habit storage:', error);
    return fallback;
  }
}

/**
 * Safely persists the daily scholar habit checklist state.
 *
 * @param {{ habits: Array, log: Object }} state
 * @returns {{ success: boolean, error?: Error }}
 */
export function saveStoredHabits(state) {
  try {
    localStorage.setItem(HABITS_KEY, JSON.stringify(state));
    return { success: true };
  } catch (error) {
    console.error('[GradeTracker] Failed to save habits:', error);
    return { success: false, error };
  }
}
