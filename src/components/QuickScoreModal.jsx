import React, { useState, useEffect } from 'react';
import { X, Check, Percent } from 'lucide-react';
import { formatReadableDate } from '../utils/dateUtils';

export default function QuickScoreModal({ isOpen, onClose, onSave, item }) {
  const [score, setScore] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (item?.exam) {
      setScore(item.exam.score !== null && item.exam.score !== undefined ? String(item.exam.score) : '');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
            Record Exam Score
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="mt-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
          <div className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
            {item.exam.title}
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            {formatReadableDate(item.exam.date)}
          </div>
        </div>

        {error && (
          <div className="mt-3 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Score Percentage (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="e.g. 92.5"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                autoFocus
                className="w-full px-3.5 py-2.5 pr-8 text-base font-mono font-bold rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <Percent className="w-4 h-4 absolute right-3 top-3.5 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Quick preset chips */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-1.5">
              Quick presets
            </div>
            <div className="flex flex-wrap gap-1.5">
              {presetScores.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setScore(String(preset))}
                  className="px-2 py-1 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-mono text-zinc-700 dark:text-zinc-300 transition"
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Score</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
