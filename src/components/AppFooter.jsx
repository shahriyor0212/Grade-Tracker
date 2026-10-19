import React from 'react';

export default function AppFooter() {
  return (
    <footer className="border-t border-outline-variant dark:border-night-border bg-surface-container-lowest dark:bg-night-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <p className="font-label-caps text-label-caps uppercase text-on-surface-variant dark:text-night-muted">
          Grade Tracker
        </p>

        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-on-surface-variant dark:text-night-muted">
            Made by Shahriyor Muhidinov
          </span>
          <span className="font-mono text-[11px] font-medium px-1.5 py-0.5 rounded border border-outline-variant dark:border-night-border text-on-surface dark:text-night-ink">
            v2.0
          </span>
        </div>
      </div>
    </footer>
  );
}
