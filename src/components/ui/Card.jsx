import React from 'react';

/**
 * Flat hairline container used across all four views.
 * Replaces the playful shadow cards with the Swiss 1px-border surface.
 */
export default function Card({ label = null, action = null, className = '', bodyClassName = '', children }) {
  return (
    <div
      className={`rounded-lg border border-outline-variant dark:border-night-border bg-surface-container-lowest dark:bg-night-surface ${className}`}
    >
      {label && (
        <div className="flex items-center justify-between gap-3 px-5 pt-4">
          <p className="font-label-caps text-label-caps uppercase text-on-surface-variant dark:text-night-muted">
            {label}
          </p>
          {action}
        </div>
      )}
      <div className={label ? `p-5 pt-3 ${bodyClassName}` : `p-5 ${bodyClassName}`}>{children}</div>
    </div>
  );
}
