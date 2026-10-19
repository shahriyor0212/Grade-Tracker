import React from 'react';
import { calculateOverallStats } from '../../utils/gradeCalculations';

/**
 * Semester mission banner: Swiss card with motivational headline
 * and live standing readout, fully styled for light and dark modes.
 */
export default function MissionBanner({ subjects = [] }) {
  const stats = calculateOverallStats(subjects);

  return (
    <div className="rounded-lg bg-surface-container-lowest dark:bg-night-surface border border-outline-variant dark:border-night-border p-6 mb-4 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="font-label-caps text-label-caps uppercase text-on-surface-variant dark:text-night-muted">
            Semester Mission
          </p>
          <p className="font-headline-lg text-headline-lg tracking-tight text-on-surface dark:text-night-ink max-w-xl">
            “Excellence in intellect, courage in character.”
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-night-muted">
            Every assessment logged is a verified step toward your target.
          </p>
        </div>

        <div className="flex items-end gap-6 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-outline-variant dark:border-night-border">
          <div>
            <p className="font-label-caps text-[10px] uppercase text-on-surface-variant dark:text-night-muted">Standing</p>
            <p className="font-mono text-3xl font-semibold tabular-nums text-on-surface dark:text-night-ink">
              {stats.overallMean !== null ? `${stats.overallMean.toFixed(1)}%` : '—'}
            </p>
          </div>
          <div>
            <p className="font-label-caps text-[10px] uppercase text-on-surface-variant dark:text-night-muted">GPA</p>
            <p className="font-mono text-3xl font-semibold tabular-nums text-on-surface dark:text-night-ink">
              {stats.gpa !== null ? stats.gpa.toFixed(2) : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
