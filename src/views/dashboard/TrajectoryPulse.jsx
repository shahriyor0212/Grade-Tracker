import React from 'react';
import Card from '../../components/ui/Card';
import { calculateSubjectStats } from '../../utils/gradeCalculations';
import { getSubjectColor } from '../../constants/colors';

/**
 * Module trajectory pulse: compact course summary cards with standing,
 * target gap, completion bar and required-score projection.
 */
export default function TrajectoryPulse({ subjects = [] }) {
  if (subjects.length === 0) return null;

  return (
    <Card label="Module Trajectory Pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {subjects.map((subject) => {
          const stats = calculateSubjectStats(subject);
          const color = getSubjectColor(subject.color);

          return (
            <div
              key={subject.id}
              className="rounded border border-outline-variant dark:border-night-border p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-label-caps text-[10px] uppercase text-on-surface-variant dark:text-night-muted">
                  <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} aria-hidden="true" />
                  <span className="truncate max-w-[70px]">{subject.code || '—'}</span>
                </span>
                <span className="font-mono text-label-numeric tabular-nums text-on-surface dark:text-night-ink">
                  {stats.mean !== null ? `${stats.mean}%` : '—'}
                </span>
              </div>

              <p className="mt-1.5 text-xs font-semibold text-on-surface dark:text-night-ink truncate">
                {subject.name}
              </p>

              {/* Completion bar */}
              <div className="mt-2 h-1 rounded-sm bg-surface-container-low dark:bg-night-canvas overflow-hidden">
                <div
                  className="h-full bg-on-surface/70 dark:bg-night-ink/70 transition-all duration-500"
                  style={{ width: `${Math.round(stats.completionRatio * 100)}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between font-mono text-[10px]">
                <span
                  className={
                    stats.gap === null
                      ? 'text-on-surface-variant dark:text-night-muted'
                      : stats.gap >= 0
                      ? 'text-secondary'
                      : 'text-error'
                  }
                >
                  {stats.gap !== null ? `${stats.gap > 0 ? '+' : ''}${stats.gap} vs target` : 'no target'}
                </span>
                <span className="text-on-surface-variant dark:text-night-muted">
                  {stats.pendingCount > 0 && stats.requiredScore !== null
                    ? `req ${stats.requiredScore}`
                    : `${stats.gradedCount}/${stats.totalExams}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
