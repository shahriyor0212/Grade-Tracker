import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { SUBJECT_COLORS } from '../constants/colors';
import { generateId, ACTIVE_TERM } from '../utils/storage';

export default function SubjectModal({ isOpen, onClose, onSave, editingSubject }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [term, setTerm] = useState(ACTIVE_TERM);
  const [color, setColor] = useState('indigo');
  const [targetGrade, setTargetGrade] = useState('');
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
    if (editingSubject) {
      setName(editingSubject.name || '');
      setCode(editingSubject.code || '');
      setTerm(editingSubject.term || ACTIVE_TERM);
      setColor(editingSubject.color || 'indigo');
      setTargetGrade(
        editingSubject.targetGrade !== undefined && editingSubject.targetGrade !== null
          ? String(editingSubject.targetGrade)
          : ''
      );
    } else {
      setName('');
      setCode('');
      setTerm(ACTIVE_TERM);
      setColor('indigo');
      setTargetGrade('85');
    }
    setError('');
  }, [editingSubject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a subject name.');
      return;
    }

    let parsedTarget = null;
    if (targetGrade.trim() !== '') {
      const num = parseFloat(targetGrade);
      if (isNaN(num) || num < 0 || num > 100) {
        setError('Target grade must be a percentage between 0 and 100.');
        return;
      }
      parsedTarget = num;
    }

    onSave({
      id: editingSubject ? editingSubject.id : generateId('subj'),
      name: name.trim(),
      code: code.trim().toUpperCase(),
      term: term.trim() || ACTIVE_TERM,
      color,
      targetGrade: parsedTarget,
      exams: editingSubject ? editingSubject.exams : [],
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="subject-modal-title"
        className="modal-shell max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-outline-variant dark:border-night-border">
          <div>
            <p className="font-label-caps text-[10px] uppercase text-on-surface-variant dark:text-night-muted mb-1">
              {editingSubject ? 'Amend Course' : 'New Course'}
            </p>
            <h2 id="subject-modal-title" className="modal-title">
              {editingSubject ? 'Edit Subject' : 'Add Subject'}
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
          {/* Subject Name */}
          <div>
            <label htmlFor="subject-name-input" className="field-label">
              Subject Name *
            </label>
            <input
              id="subject-name-input"
              type="text"
              placeholder="e.g. Advanced Calculus, World History"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field-input"
              autoFocus
              required
            />
          </div>

          {/* Code, Term & Target */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="subject-code-input" className="field-label">
                Code
              </label>
              <input
                id="subject-code-input"
                type="text"
                placeholder="MATH 240"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="field-input uppercase"
              />
            </div>
            <div>
              <label htmlFor="subject-term-input" className="field-label">
                Term
              </label>
              <input
                id="subject-term-input"
                type="text"
                placeholder={ACTIVE_TERM}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="field-input"
              />
            </div>
            <div>
              <label htmlFor="target-grade-input" className="field-label">
                Target (%)
              </label>
              <input
                id="target-grade-input"
                type="number"
                min="0"
                max="100"
                placeholder="90"
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                className="field-input font-mono"
              />
            </div>
          </div>

          {/* Color Tag Picker */}
          <div>
            <label className="field-label">Color Tag</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.values(SUBJECT_COLORS).map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setColor(item.id)}
                  aria-label={`Select color ${item.name}`}
                  aria-pressed={color === item.id}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded border text-xs font-medium transition ${
                    color === item.id
                      ? 'border-on-surface dark:border-night-ink bg-surface-container-low dark:bg-night-canvas text-on-surface dark:text-night-ink font-semibold'
                      : 'border-outline-variant dark:border-night-border hover:border-on-surface-variant dark:hover:border-night-muted text-on-surface-variant dark:text-night-muted'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.dot}`} />
                  <span className="truncate">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Check className="w-3.5 h-3.5" />
              <span>{editingSubject ? 'Save Changes' : 'Create Subject'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
