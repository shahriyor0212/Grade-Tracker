import React from 'react';

/**
 * Shared page header for all four academic views:
 * micro-label caps eyebrow, structural headline, muted description, optional actions.
 */
export default function ViewHeader({ label, title, description, actions = null }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
      <div className="space-y-1">
        <p className="font-label-caps text-label-caps uppercase text-on-surface-variant dark:text-night-muted">
          {label}
        </p>
        <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-night-ink tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-night-muted">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
