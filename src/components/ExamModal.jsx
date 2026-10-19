import React, { useState, useEffect } from 'react';
import { X, Check, Percent } from 'lucide-react';
import { getTodayString, isValidDateString } from '../utils/dateUtils';
import { generateId, EXAM_TYPES } from '../utils/storage';

export default function ExamModal({
  isOpen,
  onClose,
  onSave,
  subjects = [],
  preselectedSubjectId = null,
  editingExam = null,
}) {
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [examType, setExamType] = useState('');
  const [isUpcoming, setIsUpcoming] = useState(false);
  const [score, setScore] = useState('');
  const [readiness, setReadiness] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (editingExam) {
      setSubjectId(editingExam.subjectId || preselectedSubjectId || (subjects[0]?.id || ''));
      setTitle(editingExam.title || '');
      setDate(editingExam.date || getTodayString());
      setExamType(editingExam.examType || '');
      if (typeof editingExam.score === 'number' && !isNaN(editingExam.score)) {
        setIsUpcoming(false);
        setScore(String(editingExam.score));
      } else {
        setIsUpcoming(true);
        setScore('');
      }
      setReadiness(
        editingExam.readiness !== null && editingExam.readiness !== undefined
          ? String(editingExam.readiness)
          : ''
      );
      setNotes(editingExam.notes || '');
    } else {
      setSubjectId(preselectedSubjectId || (subjects[0]?.id || ''));
      setTitle('');
      setDate(getTodayString());
      setExamType('');
      setIsUpcoming(false);
      setScore('');
      setReadiness('');
      setNotes('');
    }
    setError('');
  }, [editingExam, preselectedSubjectId, isOpen, subjects]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subjectId) {
      setError('Please select or create a subject first.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide an exam title (e.g., Midterm 1, Quiz 2).');
      return;
    }
    if (!isValidDateString(date)) {
      setError('Please provide a valid date in YYYY-MM-DD format.');
      return;
    }

    let parsedScore = null;
    if (!isUpcoming) {
      if (score.trim() === '') {
        setError('Please enter a percentage score (0-100) or check "Scheduled / Upcoming exam".');
        return;
      }
      const num = parseFloat(score);
      if (isNaN(num) || num < 0 || num > 100) {
        setError('Score must be a percentage between 0% and 100%.');
        return;
      }
      parsedScore = Math.round(num * 10) / 10;
    }

    let parsedReadiness = null;
    if (readiness.trim() !== '') {
      const num = parseFloat(readiness);
      if (isNaN(num) || num < 0 || num > 100) {
        setError('Readiness must be a percentage between 0% and 100%.');
        return;
      }
      parsedReadiness = Math.round(num);
    }

    onSave({
      subjectId,
      exam: {
        id: editingExam ? editingExam.id : generateId('exam'),
        title: title.trim(),
        date,
        score: parsedScore,
        notes: notes.trim(),
        examType: examType || null,
        readiness: parsedReadiness,
      },
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exam-modal-title"
        className="modal-shell max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-outline-variant dark:border-night-border">
          <div>
            <p className="font-label-caps text-[10px] uppercase text-on-surface-variant dark:text-night-muted mb-1">
              {editingExam ? 'Amend Record' : 'New Record'}
            </p>
            <h2 id="exam-modal-title" className="modal-title">
              {editingExam ? 'Edit Assessment' : 'Add Assessment'}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Close dialog" className="modal-close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div role="alert" className="modal-error">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject Selector */}
          <div>
            <label htmlFor="exam-subject-select" className="field-label">
              Subject *
            </label>
            <select
              id="exam-subject-select"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="field-select"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.code ? `(${s.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Title & Type */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label htmlFor="exam-title-input" className="field-label">
                Title *
              </label>
              <input
                id="exam-title-input"
                type="text"
                placeholder="e.g. Midterm 1, Final Exam"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="field-input"
                autoFocus
                required
              />
            </div>
            <div>
              <label htmlFor="exam-type-select" className="field-label">
                Type
              </label>
              <select
                id="exam-type-select"
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="field-select"
              >
                <option value="">—</option>
                {EXAM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Exam Date */}
          <div>
            <label htmlFor="exam-date-input" className="field-label flex items-center justify-between">
              <span>Date (YYYY-MM-DD) *</span>
              <span className="normal-case tracking-normal text-[10px] font-normal opacity-70">
                Stored as string
              </span>
            </label>
            <input
              id="exam-date-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="field-input font-mono"
              required
            />
          </div>

          {/* Score / Upcoming section */}
          <div className="p-3.5 rounded border border-outline-variant dark:border-night-border bg-surface-container-low dark:bg-night-canvas space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="upcoming-checkbox"
                className="font-label-caps text-[10px] uppercase text-on-surface dark:text-night-ink cursor-pointer select-none"
              >
                Scheduled / Future Exam
              </label>
              <input
                type="checkbox"
                id="upcoming-checkbox"
                checked={isUpcoming}
                onChange={(e) => {
                  setIsUpcoming(e.target.checked);
                  if (e.target.checked) setScore('');
                }}
                className="field-checkbox"
              />
            </div>

            {!isUpcoming ? (
              <div>
                <label htmlFor="exam-score-input" className="field-label flex items-center justify-between">
                  <span>Score (%) *</span>
                  <span className="normal-case tracking-normal text-[10px] font-normal opacity-70">
                    0–100
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="exam-score-input"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="e.g. 88.5"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="field-input pr-8 font-mono"
                  />
                  <Percent className="w-3.5 h-3.5 absolute right-3 top-2.5 text-on-surface-variant dark:text-night-muted pointer-events-none" />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="exam-readiness-input" className="field-label flex items-center justify-between">
                  <span>Readiness (%)</span>
                  <span className="normal-case tracking-normal text-[10px] font-normal opacity-70">
                    Optional
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="exam-readiness-input"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    placeholder="Self-assessed preparation"
                    value={readiness}
                    onChange={(e) => setReadiness(e.target.value)}
                    className="field-input pr-8 font-mono"
                  />
                  <Percent className="w-3.5 h-3.5 absolute right-3 top-2.5 text-on-surface-variant dark:text-night-muted pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* Optional Notes */}
          <div>
            <label htmlFor="exam-notes-input" className="field-label">
              Notes (Optional)
            </label>
            <input
              id="exam-notes-input"
              type="text"
              placeholder="e.g. Room 204, formula sheet allowed"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="field-input"
            />
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Check className="w-3.5 h-3.5" />
              <span>{editingExam ? 'Save Changes' : 'Add Assessment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
