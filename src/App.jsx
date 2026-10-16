import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import UpcomingTimeline from './components/UpcomingTimeline';
import SubjectCard from './components/SubjectCard';
import SubjectModal from './components/SubjectModal';
import ExamModal from './components/ExamModal';
import QuickScoreModal from './components/QuickScoreModal';
import ConfirmModal from './components/ConfirmModal';

import { 
  loadStoredSubjects, 
  saveStoredSubjects, 
  loadStoredTheme, 
  saveStoredTheme,
  DEFAULT_INITIAL_SUBJECTS 
} from './utils/storage';
import { Search, Plus, BookOpen, AlertCircle } from 'lucide-react';

export default function App() {
  const [subjects, setSubjects] = useState(() => loadStoredSubjects());
  const [theme, setTheme] = useState(() => loadStoredTheme());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'upcoming', 'graded'

  // Modals state
  const [subjectModal, setSubjectModal] = useState({ isOpen: false, editingSubject: null });
  const [examModal, setExamModal] = useState({ isOpen: false, preselectedSubjectId: null, editingExam: null });
  const [quickScoreModal, setQuickScoreModal] = useState({ isOpen: false, item: null });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: () => {}, title: '', message: '' });
  const [storageWarning, setStorageWarning] = useState(null);

  // Sync theme with HTML class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveStoredTheme(theme);
  }, [theme]);

  // Sync subjects to localStorage with safe try/catch wrapper
  useEffect(() => {
    const result = saveStoredSubjects(subjects);
    if (!result.success) {
      setStorageWarning('Warning: Could not save data to browser local storage (quota reached or storage disabled).');
    } else {
      setStorageWarning(null);
    }
  }, [subjects]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // --- Handlers: Subjects ---
  const handleSaveSubject = (subjectData) => {
    setSubjects(prev => {
      const exists = prev.some(s => s.id === subjectData.id);
      if (exists) {
        return prev.map(s => s.id === subjectData.id ? { ...s, ...subjectData } : s);
      }
      return [...prev, subjectData];
    });
  };

  const promptDeleteSubject = (subjectId) => {
    const target = subjects.find(s => s.id === subjectId);
    setConfirmModal({
      isOpen: true,
      title: `Delete "${target?.name || 'Subject'}"?`,
      message: 'This will permanently remove this subject and all of its associated exams.',
      onConfirm: () => {
        setSubjects(prev => prev.filter(s => s.id !== subjectId));
      },
    });
  };

  // --- Handlers: Exams ---
  const handleSaveExam = ({ subjectId, exam }) => {
    setSubjects(prev => {
      return prev.map(subject => {
        if (subject.id !== subjectId) {
          // If editing an exam that switched subjects, remove it from the old subject
          if (subject.exams?.some(e => e.id === exam.id)) {
            return {
              ...subject,
              exams: subject.exams.filter(e => e.id !== exam.id),
            };
          }
          return subject;
        }

        const currentExams = subject.exams || [];
        const exists = currentExams.some(e => e.id === exam.id);
        const updatedExams = exists
          ? currentExams.map(e => (e.id === exam.id ? exam : e))
          : [...currentExams, exam];

        return {
          ...subject,
          exams: updatedExams,
        };
      });
    });
  };

  const promptDeleteExam = (subjectId, examId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Exam?',
      message: 'This exam record and its score will be permanently deleted.',
      onConfirm: () => {
        setSubjects(prev =>
          prev.map(s => {
            if (s.id !== subjectId) return s;
            return {
              ...s,
              exams: (s.exams || []).filter(e => e.id !== examId),
            };
          })
        );
      },
    });
  };

  const handleQuickScoreSave = (subjectId, examId, newScore) => {
    setSubjects(prev =>
      prev.map(s => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          exams: (s.exams || []).map(e => {
            if (e.id !== examId) return e;
            return { ...e, score: newScore };
          }),
        };
      })
    );
  };

  // Reset to initial demo data
  const promptResetData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset to Sample Data?',
      message: 'This will replace your current data with the realistic demo subjects and exams.',
      onConfirm: () => {
        setSubjects(DEFAULT_INITIAL_SUBJECTS);
      },
    });
  };

  // Import JSON handler
  const handleImportData = (importedSubjects) => {
    setSubjects(importedSubjects);
  };

  // --- Filtering & Search ---
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = 
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subject.code && subject.code.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterMode === 'upcoming') {
      return (subject.exams || []).some(e => e.score === null || e.score === undefined);
    }
    if (filterMode === 'graded') {
      return (subject.exams || []).some(e => typeof e.score === 'number');
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar
        subjects={subjects}
        onAddSubject={() => setSubjectModal({ isOpen: true, editingSubject: null })}
        onAddExam={() => setExamModal({ isOpen: true, preselectedSubjectId: subjects[0]?.id || null, editingExam: null })}
        theme={theme}
        onToggleTheme={toggleTheme}
        onImportData={handleImportData}
        onResetData={promptResetData}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Storage Warning Alert if quota reached */}
        {storageWarning && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>{storageWarning}</span>
          </div>
        )}

        {/* High-level Overview Dashboard */}
        <StatsOverview subjects={subjects} />

        {/* Chronological Upcoming Timeline */}
        <UpcomingTimeline
          subjects={subjects}
          onQuickScore={(subjectId, exam) => {
            setQuickScoreModal({
              isOpen: true,
              item: { subjectId, exam },
            });
          }}
          onAddExam={() => setExamModal({ isOpen: true, preselectedSubjectId: subjects[0]?.id || null, editingExam: null })}
        />

        {/* Subjects Section Header & Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
              Enrolled Subjects & Exam Grades
            </h2>
          </div>

          {/* Search & Filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search subject or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div className="inline-flex rounded-xl bg-zinc-200/60 dark:bg-zinc-800 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterMode === 'all'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('upcoming')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterMode === 'upcoming'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilterMode('graded')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterMode === 'graded'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Graded
              </button>
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        {filteredSubjects.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <BookOpen className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {searchQuery ? 'No matching subjects found' : 'No subjects added yet'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              {searchQuery 
                ? 'Try tweaking your search term or filter' 
                : 'Create your first subject to start tracking tests, dates, and performance percentages.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setSubjectModal({ isOpen: true, editingSubject: null })}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Subject</span>
              </button>
              {subjects.length === 0 && (
                <button
                  onClick={promptResetData}
                  className="px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 rounded-xl transition"
                >
                  Load Sample Data
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredSubjects.map(subject => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onAddExamToSubject={(subjectId) => {
                  setExamModal({
                    isOpen: true,
                    preselectedSubjectId: subjectId,
                    editingExam: null,
                  });
                }}
                onEditExam={(subjectId, exam) => {
                  setExamModal({
                    isOpen: true,
                    preselectedSubjectId: subjectId,
                    editingExam: { ...exam, subjectId },
                  });
                }}
                onDeleteExam={promptDeleteExam}
                onQuickScore={(subjectId, exam) => {
                  setQuickScoreModal({
                    isOpen: true,
                    item: { subjectId, exam },
                  });
                }}
                onEditSubject={(subjectToEdit) => {
                  setSubjectModal({
                    isOpen: true,
                    editingSubject: subjectToEdit,
                  });
                }}
                onDeleteSubject={promptDeleteSubject}
              />
            ))}
          </div>
        )}

      </main>

      {/* Modals */}
      <SubjectModal
        isOpen={subjectModal.isOpen}
        editingSubject={subjectModal.editingSubject}
        onClose={() => setSubjectModal({ isOpen: false, editingSubject: null })}
        onSave={handleSaveSubject}
      />

      <ExamModal
        isOpen={examModal.isOpen}
        editingExam={examModal.editingExam}
        preselectedSubjectId={examModal.preselectedSubjectId}
        subjects={subjects}
        onClose={() => setExamModal({ isOpen: false, preselectedSubjectId: null, editingExam: null })}
        onSave={handleSaveExam}
      />

      <QuickScoreModal
        isOpen={quickScoreModal.isOpen}
        item={quickScoreModal.item}
        onClose={() => setQuickScoreModal({ isOpen: false, item: null })}
        onSave={handleQuickScoreSave}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
      />

    </div>
  );
}
