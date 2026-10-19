/**
 * LocalStorage management module with strict try/catch safety guarantees.
 * Prevents app crashes if stored JSON is malformed, storage is disabled,
 * or browser quota limits are reached.
 */
import { getTodayString } from './dateUtils';

export const STORAGE_KEY = 'minimal_grade_tracker_data_v2';
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
 * Creates relative YYYY-MM-DD date strings for sample data
 */
function getRelativeDateString(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
 * High-quality initial mock data to showcase the app immediately.
 * Active term subjects use relative dates; archived terms use fixed history dates.
 */
export const DEFAULT_INITIAL_SUBJECTS = [
  {
    id: 'subj-1',
    name: 'Advanced Calculus',
    code: 'MATH 241',
    color: 'indigo',
    term: ACTIVE_TERM,
    targetGrade: 90,
    exams: [
      {
        id: 'exam-101',
        title: 'Quiz 1: Limits & Continuity',
        date: getRelativeDateString(-21),
        score: 94,
        notes: 'Covers Stewart Chapter 2',
        examType: 'Quiz',
        readiness: null,
      },
      {
        id: 'exam-102',
        title: 'Midterm 1: Differential Calculus',
        date: getRelativeDateString(-7),
        score: 88,
        notes: 'Room 304, Formula sheet provided',
        examType: 'Midterm',
        readiness: null,
      },
      {
        id: 'exam-103',
        title: 'Quiz 2: Integration Techniques',
        date: getRelativeDateString(3),
        score: null,
        notes: 'Focus on integration by parts',
        examType: 'Quiz',
        readiness: 70,
      },
      {
        id: 'exam-104',
        title: 'Final Examination',
        date: getRelativeDateString(28),
        score: null,
        notes: 'Comprehensive 3-hour exam',
        examType: 'Final',
        readiness: 45,
      },
    ],
  },
  {
    id: 'subj-2',
    name: 'Data Structures & Algorithms',
    code: 'CS 210',
    color: 'emerald',
    term: ACTIVE_TERM,
    targetGrade: 92,
    exams: [
      {
        id: 'exam-201',
        title: 'Exam 1: Arrays, Stacks & Queues',
        date: getRelativeDateString(-14),
        score: 96,
        notes: 'Asymptotic notation & implementations',
        examType: 'Midterm',
        readiness: null,
      },
      {
        id: 'exam-202',
        title: 'Exam 2: Trees & Heaps',
        date: getRelativeDateString(1),
        score: null,
        notes: 'AVL Trees, BST, Binary Heaps',
        examType: 'Midterm',
        readiness: 60,
      },
      {
        id: 'exam-203',
        title: 'Final Practicum & Theory',
        date: getRelativeDateString(20),
        score: null,
        notes: 'Graph algorithms & Dynamic Programming',
        examType: 'Final',
        readiness: 35,
      },
    ],
  },
  {
    id: 'subj-3',
    name: 'Physics: Mechanics & Waves',
    code: 'PHYS 101',
    color: 'sky',
    term: ACTIVE_TERM,
    targetGrade: 85,
    exams: [
      {
        id: 'exam-301',
        title: 'Newtonian Dynamics Test',
        date: getRelativeDateString(-28),
        score: 82,
        notes: 'Forces, friction, circular motion',
        examType: 'Quiz',
        readiness: null,
      },
      {
        id: 'exam-302',
        title: 'Midterm Test',
        date: getRelativeDateString(-10),
        score: 79,
        notes: 'Work, energy & momentum',
        examType: 'Midterm',
        readiness: null,
      },
      {
        id: 'exam-303',
        title: 'Waves & Oscillations Exam',
        date: getRelativeDateString(7),
        score: null,
        notes: 'Harmonic motion, resonance',
        examType: 'Practicum',
        readiness: 55,
      },
    ],
  },
  {
    id: 'subj-4',
    name: 'Introduction to Statistics',
    code: 'STAT 110',
    color: 'teal',
    term: `Spring ${new Date().getFullYear() - 1}`,
    targetGrade: 88,
    exams: [
      {
        id: 'exam-401',
        title: 'Quiz 1: Descriptive Statistics',
        date: `${new Date().getFullYear() - 1}-02-15`,
        score: 91,
        notes: 'Distributions & sampling',
        examType: 'Quiz',
        readiness: null,
      },
      {
        id: 'exam-402',
        title: 'Midterm: Probability & Distributions',
        date: `${new Date().getFullYear() - 1}-03-18`,
        score: 86,
        notes: 'Bayes theorem emphasis',
        examType: 'Midterm',
        readiness: null,
      },
      {
        id: 'exam-403',
        title: 'Lab Practicum: Regression Analysis',
        date: `${new Date().getFullYear() - 1}-04-22`,
        score: 89,
        notes: 'Hands-on statistical software',
        examType: 'Practicum',
        readiness: null,
      },
      {
        id: 'exam-404',
        title: 'Final Examination',
        date: `${new Date().getFullYear() - 1}-05-10`,
        score: 93,
        notes: 'Cumulative, closed book',
        examType: 'Final',
        readiness: null,
      },
    ],
  },
  {
    id: 'subj-5',
    name: 'Academic Writing & Rhetoric',
    code: 'WRIT 101',
    color: 'violet',
    term: `Fall ${new Date().getFullYear() - 2}`,
    targetGrade: 85,
    exams: [
      {
        id: 'exam-501',
        title: 'Diagnostic Essay',
        date: `${new Date().getFullYear() - 2}-09-25`,
        score: 84,
        notes: 'Thesis construction baseline',
        examType: 'Quiz',
        readiness: null,
      },
      {
        id: 'exam-502',
        title: 'Midterm: Argumentative Writing',
        date: `${new Date().getFullYear() - 2}-10-30`,
        score: 87,
        notes: 'Counterargument required',
        examType: 'Midterm',
        readiness: null,
      },
      {
        id: 'exam-503',
        title: 'Practicum: Source Synthesis',
        date: `${new Date().getFullYear() - 2}-11-27`,
        score: 90,
        notes: 'Annotated bibliography review',
        examType: 'Practicum',
        readiness: null,
      },
      {
        id: 'exam-504',
        title: 'Final Portfolio',
        date: `${new Date().getFullYear() - 2}-12-18`,
        score: 92,
        notes: 'Collected semester writings',
        examType: 'Final',
        readiness: null,
      },
    ],
  },
];

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
 * If data doesn't exist, returns the default sample subjects.
 * If JSON parsing fails or data is corrupted, returns default and logs error.
 * Loaded data is normalized so legacy records gain the new fields.
 */
export function loadStoredSubjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_INITIAL_SUBJECTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return normalizeSubjects(parsed);
    }
    console.warn('[GradeTracker] Corrupted subjects structure in storage. Falling back to defaults.');
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
