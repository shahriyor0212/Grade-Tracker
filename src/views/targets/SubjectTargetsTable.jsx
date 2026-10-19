import React from 'react';
import Card from '../../components/ui/Card';
import { calculateSubjectStats, isGradedExam } from '../../utils/gradeCalculations';

/**
 * Coursework subject targets: current standing vs declared target with
 * equal-weight required-score projection for pending assessments.
 */
export default function SubjectTargetsTable({ subjects = [] }) {
  return (
    <Card label="Coursework Targets">
      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[560px] text-left">
          <thead>
            <tr className="border-b border-outline-variant dark:border-night-border">
              {['Subject', 'Current', 'Target', 'Gap', 'Required', 'Status'].map((head) => (
                <th
                  key={head}
                  scope="col"
                  className="pb-2 font-label-caps text-[10px] uppercase text-on-surface-variant dark:text-night-muted font-semibold"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant dark:divide-night-border">
            {subjects.map((subject) => {
              const stats = calculateSubjectStats(subject);

              let status;
              if (stats.mean === null) {
                status = (
                  <span className="font-label-caps text-[9px] uppercase text-on-surface-variant dark:text-night-muted">
                    No scores
                  </span>
                );
              } else if (stats.gap !== null && stats.gap >= 0) {
                status = (
                  <span className="font-label-caps text-[9px] uppercase text-secondary">
                    On track
                  </span>
                );
              } else {
                status = (
                  <span className="font-label-caps text-[9px] uppercase text-error">Deficit</span>
                );
              }

              return (
                <tr key={subject.id}>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-on-surface-variant dark:text-night-muted">
                        {subject.code || '—'}
                      </span>
                      <span className="text-xs font-semibold text-on-surface dark:text-night-ink truncate max-w-[160px]">
                        {subject.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-xs tabular-nums text-on-surface dark:text-night-ink">
                    {stats.mean !== null ? `${stats.mean}%` : '—'}
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-xs tabular-nums text-on-surface-variant dark:text-night-muted">
                    {stats.target !== null ? `${stats.target}%` : '—'}
                  </td>
                  <td
                    className={`py-2.5 pr-3 font-mono text-xs tabular-nums ${
                      stats.gap === null
                        ? 'text-on-surface-variant dark:text-night-muted'
                        : stats.gap >= 0
                        ? 'text-secondary'
                        : 'text-error'
                    }`}
                  >
                    {stats.gap !== null ? `${stats.gap > 0 ? '+' : ''}${stats.gap}` : '—'}
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-xs tabular-nums text-on-surface dark:text-night-ink">
                    {stats.pendingCount > 0 && stats.requiredScore !== null ? (
                      <>
                        {stats.requiredScore}%
                        {!stats.targetAchievable && (
                          <span className="ml-1 text-[9px] text-error">cap</span>
                        )}
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-2.5">{status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 font-mono text-[10px] text-on-surface-variant dark:text-night-muted">
        Required = average needed across {subjects.reduce((n, s) => n + (s.exams || []).filter((e) => !isGradedExam(e)).length, 0)}{' '}
        pending exams to hold target. No weighting applied.
      </p>
    </Card>
  );
}
