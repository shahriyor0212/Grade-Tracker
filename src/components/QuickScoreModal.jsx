import React, { useState, useEffect } from 'react';
import { X, Check, Percent } from 'lucide-react';
import { formatReadableDate } from '../utils/dateUtils';

export default function QuickScoreModal({ isOpen, onClose, onSave, item }) {
  const [score, setScore] = useState('');
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
    if (item?.exam) {
      setScore(
        item.exam.score !== null && item.exam.score !== undefined ? String(item.exam.score) : ''
      );
    } else {
      setScore('');
    }
    setError('');
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (score.trim() === '') {
      setError('Please enter a percentage score.');
      return;
    }
    const num = parseFloat(score);
    if (isNaN(num) || num < 0 || num > 100) {
      setError('Score must be a number between 0% and 100%.');
      return;
    }

    const rounded = Math.round(num * 10) / 10;
    onSave(item.subjectId, item.exam.id, rounded);
    onClose();
  };

  const presetScores = [100, 95, 90, 85, 80, 75];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-score-title"
        className="modal-shell max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant dark:border-night-border">
          <div>
            <p className="font-label-caps text-[10px] uppercase text-on-surface-variant dark:text-night-muted mb-1">
              Score Entry
            </p>
            <h2 id="quick-score-title" className="modal-title">
              Record Score
            </h2>
          </div>
          <button onClick={onClose} aria-label="Close dialog" className="modal-close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="p-3 rounded border border-outline-variant dark:border-night-border bg-surface-container-low dark:bg-night-canvas">
          <div className="text-xs font-semibold text-on-surface dark:text-night-ink truncate">
            {item.exam.title}
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-on-surface-variant dark:text-night-muted">
            {item.exam.date} · {formatReadableDate(item.exam.date)}
          </div>
        </div>

        {error && (
          <div role="alert" className="modal-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="quick-score-input" className="field-label">
              Score (%)
            </label>
            <div className="relative">
              <input
                id="quick-score-input"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="e.g. 92.5"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                autoFocus
                className="field-input pr-8 font-mono text-base font-semibold"
              />
              <Percent className="w-4 h-4 absolute right-3 top-2.5 text-on-surface-variant dark:text-night-muted pointer-events-none" />
            </div>
          </div>

          {/* Quick preset chips */}
          <div>
            <div className="font-label-caps text-[10px] uppercase text-on-surface-variant dark:text-night-muted mb-1.5">
              Quick Presets
            </div>
            <div className="flex flex-wrap gap-1.5">
              {presetScores.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setScore(String(preset))}
                  aria-label={`Set score to ${preset} percent`}
                  className="px-2 py-1 text-xs font-mono rounded border border-outline-variant dark:border-night-border text-on-surface-variant dark:text-night-muted hover:border-on-surface dark:hover:border-night-ink hover:text-on-surface dark:hover:text-night-ink transition"
                >
                  {preset}%
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
              <span>Save Score</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
