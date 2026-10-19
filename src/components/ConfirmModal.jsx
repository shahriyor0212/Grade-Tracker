import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  isDestructive = true,
}) {
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-desc"
        className="modal-shell max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            className={`w-5 h-5 shrink-0 mt-0.5 ${
              isDestructive ? 'text-error' : 'text-[#6366f1]'
            }`}
            aria-hidden="true"
          />

          <div className="flex-1">
            <h3 id="confirm-modal-title" className="modal-title text-sm">
              {title}
            </h3>
            <p
              id="confirm-modal-desc"
              className="mt-1.5 text-xs text-on-surface-variant dark:text-night-muted"
            >
              {message}
            </p>
          </div>

          <button onClick={onClose} aria-label="Close dialog" className="modal-close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={isDestructive ? 'btn-destructive' : 'btn-primary'}
          >
            {isDestructive && <Trash2 className="w-3.5 h-3.5" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
