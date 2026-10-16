import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Percent } from 'lucide-react';
import { getTodayString, isValidDateString } from '../utils/dateUtils';

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
  const [isUpcoming, setIsUpcoming] = useState(false);
  const [score, setScore] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingExam) {
      setSubjectId(editingExam.subjectId || preselectedSubjectId || (subjects[0]?.id || ''));
      setTitle(editingExam.title || '');
      setDate(editingExam.date || getTodayString());
      if (typeof editingExam.score === 'number' && !isNaN(editingExam.score)) {
        setIsUpcoming(false);
        setScore(String(editingExam.score));
      } else {
        setIsUpcoming(true);
        setScore('');
      }
      setNotes(editingExam.notes || '');
    } else {
      setSubjectId(preselectedSubjectId || (subjects[0]?.id || ''));
      setTitle('');
      setDate(getTodayString());
      setIsUpcoming(false);
      setScore('');
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

    onSave({
      subjectId,
      exam: {
        id: editingExam ? editingExam.id : `exam-${Date.now()}`,
        title: title.trim(),
        date, // Stored strictly as YYYY-MM-DD string to avoid timezone skews
        score: parsedScore,
        notes: notes.trim(),
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            {editingExam ? 'Edit Exam' : 'Add Exam or Test'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Subject Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Subject <span className="text-rose-500">*</span>
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.code ? `(${s.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Exam Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Midterm 1, Final Exam, Pop Quiz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              autoFocus
            />
          </div>

          {/* Exam Date (Strictly YYYY-MM-DD input) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
              <span>Exam Date (YYYY-MM-DD) <span className="text-rose-500">*</span></span>
              <span className="text-[10px] text-zinc-400 font-normal">Stored safely as string</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Score section with Upcoming toggle */}
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-3">
            
            <div className="flex items-center justify-between">
              <label htmlFor="upcoming-checkbox" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
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
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-600 dark:bg-zinc-700 cursor-pointer"
              />
            </div>

            {!isUpcoming ? (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Score Percentage (%) <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-zinc-400 font-normal">Out of 100%</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="e.g. 88.5"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full px-3.5 py-2 pr-8 text-sm rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
                  />
                  <Percent className="w-3.5 h-3.5 absolute right-3 top-3 text-zinc-400 pointer-events-none" />
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                This exam is marked as upcoming. Its countdown will automatically appear on your schedule until you enter a score.
              </p>
            )}
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Room 204, Formula sheet allowed, 50% multiple choice"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{editingExam ? 'Save Changes' : 'Add Exam'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
