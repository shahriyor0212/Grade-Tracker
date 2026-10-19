import React, { useState, useEffect } from 'react';
import AppHeader from './components/AppHeader';
import AppFooter from './components/AppFooter';
import DashboardView from './views/DashboardView';
import TargetsView from './views/TargetsView';
import ArchiveView from './views/ArchiveView';
import SubjectModal from './components/SubjectModal';
import ExamModal from './components/ExamModal';
import QuickScoreModal from './components/QuickScoreModal';
import ConfirmModal from './components/ConfirmModal';

import {
  loadStoredSubjects,
  saveStoredSubjects,
  loadStoredTheme,
  saveStoredTheme,
} from './utils/storage';
import { DEFAULT_VIEW, isValidView } from './constants/views';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [subjects, setSubjects] = useState(() => loadStoredSubjects());
  const [theme, setTheme] = useState(() => loadStoredTheme());
  const [activeView, setActiveView] = useState(() => {
    const hashView = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
    return isValidView(hashView) ? hashView : DEFAULT_VIEW;
  });

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

  // Reflect active tab in the URL hash (deep-linkable tabs)
  useEffect(() => {
    window.location.hash = activeView;
  }, [activeView]);

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
  // Accepts an optional subjectId (from a subject card) — falls back to first subject.
  const openExamModal = (subjectId) => {
    setExamModal({
      isOpen: true,
      preselectedSubjectId:
        typeof subjectId === 'string' && subjectId ? subjectId : subjects[0]?.id || null,
      editingExam: null,
    });
  };

  const handleEditExam = (subjectId, exam) => {
    setExamModal({
      isOpen: true,
      preselectedSubjectId: subjectId,
      editingExam: { ...exam, subjectId },
    });
  };

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

  // Clear all data
  const promptResetData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Clear All Data?',
      message: 'This will permanently remove all your subjects and exam records.',
      onConfirm: () => {
        setSubjects([]);
      },
    });
  };

  // Import JSON handler
  const handleImportData = (importedSubjects) => {
    setSubjects(importedSubjects);
  };

  const openQuickScore = (subjectId, exam) => {
    setQuickScoreModal({ isOpen: true, item: { subjectId, exam } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface dark:bg-night-canvas text-on-surface dark:text-night-ink transition-colors duration-200">

      {/* Fixed 56px Swiss telemetry header */}
      <AppHeader
        subjects={subjects}
        activeView={activeView}
        onViewChange={setActiveView}
        onAddSubject={() => setSubjectModal({ isOpen: true, editingSubject: null })}
        onAddExam={openExamModal}
        theme={theme}
        onToggleTheme={toggleTheme}
        onImportData={handleImportData}
        onResetData={promptResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Storage Warning Alert if quota reached */}
        {storageWarning && (
          <div className="mb-6 p-4 rounded border border-error/40 bg-error/5 text-error text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{storageWarning}</span>
          </div>
        )}

        {activeView === 'dashboard' && (
          <DashboardView
            subjects={subjects}
            onAddSubject={() => setSubjectModal({ isOpen: true, editingSubject: null })}
            onAddExam={openExamModal}
            onEditSubject={(subjectToEdit) =>
              setSubjectModal({ isOpen: true, editingSubject: subjectToEdit })
            }
            onDeleteSubject={promptDeleteSubject}
            onEditExam={handleEditExam}
            onDeleteExam={promptDeleteExam}
            onQuickScore={openQuickScore}
            onQuickScoreSave={handleQuickScoreSave}
          />
        )}

        {activeView === 'targets' && <TargetsView subjects={subjects} />}

        {activeView === 'archive' && <ArchiveView subjects={subjects} />}
      </main>

      {/* Clinical academic footer */}
      <AppFooter />

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
