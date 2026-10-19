import React, { useState, useMemo } from 'react';
import Card from '../../components/ui/Card';
import { calculateSubjectStats, isGradedExam } from '../../utils/gradeCalculations';

/**
 * Interactive finals score simulator: hypothetical score on a subject's
 * pending exams → projected mean, error margin vs target, required average.
 */
export default function FinalsSimulator({ subjects = [] }) {
  const selectable = useMemo(
    () =>
      subjects.filter((subject) =>
        (subject.exams || []).some((e) => !isGradedExam(e))
      ),
    [subjects]
  );

  const [subjectId, setSubjectId] = useState(() => selectable[0]?.id || '');
  const [simScore, setSimScore] = useState(80);

  const subject =
    subjects.find((s) => s.id === subjectId) || selectable[0] || subjects[0] || null;

  if (!subject) {
    return (
      <Card label="Finals Simulator">
        <p className="text-xs text-on-surface-variant dark:text-night-muted">
          Add a subject with pending exams to run the simulator.
        </p>
      </Card>
    );
  }

  const stats = calculateSubjectStats(subject);
  const gradedSum = (subject.exams || [])
    .filter(isGradedExam)
    .reduce((sum, e) => sum + e.score, 0);

  const projected =
    stats.pendingCount > 0
      ? Math.round(
          ((gradedSum + stats.pendingCount * simScore) /
            (stats.gradedCount + stats.pendingCount)) *
            10
        ) / 10
      : stats.mean;

  const errorMargin =
    projected !== null && stats.target !== null
      ? Math.round((projected - stats.target) * 10) / 10
      : null;

  // Diverging indicator: ±10 points maps to full half-width
  const marginPct =
    errorMargin !== null ? Math.max(-100, Math.min(100, (errorMargin / 10) * 100)) : 0;

  return (
    <Card label="Finals Score Simulator">
      {/* Subject selector */}
      <div>
        <label
          htmlFor="sim-subject"
          className="font-label-caps text-[10px] uppercase text-on-surface-variant dark:text-night-muted"
        >
          Subject
        </label>
        <select
          id="sim-subject"
          value={subject.id}
          onChange={(e) => setSubjectId(e.target.value)}
          className="mt-1.5 w-full h-9 px-2.5 text-xs rounded bg-surface-container-low dark:bg-night-canvas border border-outline-variant dark:border-night-border text-on-surface dark:text-night-ink focus:outline-none focus:border-on-surface dark:focus:border-night-ink transition"
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} {s.code ? `(${s.code})` : ''}
            </option>
          ))}
        </select>
      </div>

      {stats.pendingCount === 0 ? (
        <p className="mt-4 text-xs text-on-surface-variant dark:text-night-muted">
          All assessments for this subject are graded — no pending component to simulate.
        </p>
      ) : (
        <>
          {/* Slider */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <label
                htmlFor="sim-slider"
                className="font-label-caps text-[10px] uppercase text-on-surface-variant dark:text-night-muted"
              >
                Projected score · {stats.pendingCount} pending
              </label>
              <span className="font-mono text-label-numeric tabular-nums text-on-surface dark:text-night-ink">
                {simScore}%
              </span>
            </div>
            <input
              id="sim-slider"
              type="range"
              min="0"
              max="100"
              step="1"
              value={simScore}
              onChange={(e) => setSimScore(Number(e.target.value))}
              className="mt-2.5 w-full accent-[#6366f1] cursor-pointer"
            />
            <div className="mt-1 flex justify-between font-mono text-[9px] text-on-surface-variant dark:text-night-muted">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Projected outcome */}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-outline-variant dark:border-night-border pt-3">
            <div>
              <p className="font-label-caps text-[9px] uppercase text-on-surface-variant dark:text-night-muted">
                Projected mean
              </p>
              <p className="font-mono text-2xl font-semibold tabular-nums text-on-surface dark:text-night-ink">
                {projected !== null ? `${projected}%` : '—'}
              </p>
            </div>
            <div>
              <p className="font-label-caps text-[9px] uppercase text-on-surface-variant dark:text-night-muted">
                Required avg
              </p>
              <p className="font-mono text-2xl font-semibold tabular-nums text-on-surface dark:text-night-ink">
                {stats.requiredScore !== null ? `${stats.requiredScore}%` : '—'}
              </p>
            </div>
          </div>

          {/* Error margin indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[9px] uppercase text-on-surface-variant dark:text-night-muted">
                Error margin vs target
              </span>
              <span
                className={`font-mono text-xs font-semibold ${
                  errorMargin === null
                    ? 'text-on-surface-variant dark:text-night-muted'
                    : errorMargin >= 0
                    ? 'text-secondary'
                    : 'text-error'
                }`}
              >
                {errorMargin !== null ? `${errorMargin > 0 ? '+' : ''}${errorMargin} pts` : 'no target'}
              </span>
            </div>

            <div className="relative mt-2 h-2 rounded-sm bg-surface-container-low dark:bg-night-canvas border border-outline-variant dark:border-night-border overflow-hidden">
              {errorMargin !== null && (
                <div
                  className={`absolute inset-y-0 transition-all duration-300 ${
                    marginPct >= 0 ? 'bg-secondary left-1/2' : 'bg-error'
                  }`}
                  style={
                    marginPct >= 0
                      ? { width: `${marginPct / 2}%` }
                      : { width: `${-marginPct / 2}%`, left: `${50 + marginPct / 2}%` }
                  }
                />
              )}
              <span className="absolute inset-y-0 left-1/2 w-px bg-on-surface/50 dark:bg-night-ink/50" />
            </div>
            <div className="mt-1 flex justify-between font-mono text-[9px] text-on-surface-variant dark:text-night-muted">
              <span>−10</span>
              <span>target {stats.target !== null ? `${stats.target}%` : '—'}</span>
              <span>+10</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-on-surface-variant dark:text-night-muted">
            {stats.targetAchievable === false
              ? 'Target unreachable even at 100% — revise the declared target.'
              : errorMargin !== null && errorMargin >= 0
              ? 'Projection clears the declared target.'
              : 'Projection still sits below target — raise the hypothetical score.'}
          </p>
        </>
      )}
    </Card>
  );
}
