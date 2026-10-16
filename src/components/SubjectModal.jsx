import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { SUBJECT_COLORS } from '../constants/colors';

export default function SubjectModal({ isOpen, onClose, onSave, editingSubject }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState('indigo');
  const [targetGrade, setTargetGrade] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingSubject) {
      setName(editingSubject.name || '');
      setCode(editingSubject.code || '');
      setColor(editingSubject.color || 'indigo');
      setTargetGrade(editingSubject.targetGrade !== undefined ? String(editingSubject.targetGrade) : '');
    } else {
      setName('');
      setCode('');
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
      id: editingSubject ? editingSubject.id : `subj-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      color,
      targetGrade: parsedTarget,
      exams: editingSubject ? editingSubject.exams : [],
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
            {editingSubject ? 'Edit Subject' : 'Add New Subject'}
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
          
          {/* Subject Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Subject Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Advanced Calculus, World History"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              autoFocus
            />
          </div>

          {/* Subject Code & Target Grade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Course Code
              </label>
              <input
                type="text"
                placeholder="e.g. MATH 240"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3.5 py-2 text-sm uppercase rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Target Grade (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="e.g. 90"
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Color Tag Picker */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Color Tag
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.values(SUBJECT_COLORS).map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setColor(item.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition ${
                    color === item.id
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${item.dot}`} />
                  <span className="truncate">{item.name}</span>
                </button>
              ))}
            </div>
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
              <span>{editingSubject ? 'Save Changes' : 'Create Subject'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
