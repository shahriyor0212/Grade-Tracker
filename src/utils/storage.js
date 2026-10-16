/**
 * LocalStorage management module with strict try/catch safety guarantees.
 * Prevents app crashes if stored JSON is malformed, storage is disabled,
 * or browser quota limits are reached.
 */
import { getTodayString } from './dateUtils';

export const STORAGE_KEY = 'minimal_grade_tracker_data_v2';
export const THEME_KEY = 'grade_tracker_theme';

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
 * High-quality initial mock data to showcase the app immediately
 */
export const DEFAULT_INITIAL_SUBJECTS = [
  {
    id: 'subj-1',
    name: 'Advanced Calculus',
    code: 'MATH 241',
    color: 'indigo',
    targetGrade: 90,
    exams: [
      {
        id: 'exam-101',
        title: 'Quiz 1: Limits & Continuity',
        date: getRelativeDateString(-21),
        score: 94,
        notes: 'Covers Stewart Chapter 2',
      },
      {
        id: 'exam-102',
        title: 'Midterm 1: Differential Calculus',
        date: getRelativeDateString(-7),
        score: 88,
        notes: 'Room 304, Formula sheet provided',
      },
      {
        id: 'exam-103',
        title: 'Quiz 2: Integration Techniques',
        date: getRelativeDateString(3),
        score: null,
        notes: 'Focus on integration by parts',
      },
      {
        id: 'exam-104',
        title: 'Final Examination',
        date: getRelativeDateString(28),
        score: null,
        notes: 'Comprehensive 3-hour exam',
      },
    ],
  },
  {
    id: 'subj-2',
    name: 'Data Structures & Algorithms',
    code: 'CS 210',
    color: 'emerald',
    targetGrade: 92,
    exams: [
      {
        id: 'exam-201',
        title: 'Exam 1: Arrays, Stacks & Queues',
        date: getRelativeDateString(-14),
        score: 96,
        notes: 'Asymptotic notation & implementations',
      },
      {
        id: 'exam-202',
        title: 'Exam 2: Trees & Heaps',
        date: getRelativeDateString(1),
        score: null,
        notes: 'AVL Trees, BST, Binary Heaps',
      },
      {
        id: 'exam-203',
        title: 'Final Practicum & Theory',
        date: getRelativeDateString(20),
        score: null,
        notes: 'Graph algorithms & Dynamic Programming',
      },
    ],
  },
  {
    id: 'subj-3',
    name: 'Physics: Mechanics & Waves',
    code: 'PHYS 101',
    color: 'sky',
    targetGrade: 85,
    exams: [
      {
        id: 'exam-301',
        title: 'Newtonian Dynamics Test',
        date: getRelativeDateString(-28),
        score: 82,
        notes: 'Forces, friction, circular motion',
      },
      {
        id: 'exam-302',
        title: 'Midterm Test',
        date: getRelativeDateString(-10),
        score: 79,
        notes: 'Work, energy & momentum',
      },
      {
        id: 'exam-303',
        title: 'Waves & Oscillations Exam',
        date: getRelativeDateString(7),
        score: null,
        notes: 'Harmonic motion, resonance',
      },
    ],
  },
];

/**
 * Safely loads data from localStorage with try/catch protection.
 * If data doesn't exist, returns the default sample subjects.
 * If JSON parsing fails or data is corrupted, returns default and logs error.
 */
export function loadStoredSubjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_INITIAL_SUBJECTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
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
  } catch (e) {
    return 'light';
  }
}

/**
 * Safely saves theme preference
 */
export function saveStoredTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
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
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
