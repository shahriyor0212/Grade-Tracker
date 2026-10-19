import React from 'react';
import Card from '../../components/ui/Card';
import { getCountdownInfo, formatShortDateWithDay } from '../../utils/dateUtils';
import { getSubjectColor } from '../../constants/colors';

/**
 * Impending assessment matrix: 3-column upcoming exam cards with countdowns,
 * revision readiness progress and quick score entry.
 */
export default function UpcomingMatrix({ subjects = [], onQuickScore, onAddExam }) {
  const pending = [];

  subjects.forEach((subject) => {
    (subject.exams || []).forEach((exam) => {
      if (exam.score === null || exam.score === undefined) {
        pending.push({
          ...exam,
          subjectId: subject.id,
          subjectName: subject.name,
          subjectColor: subject.color,
          countdown: getCountdownInfo(exam.date, false),
        });
      }
    });
  });

  pending.sort((a, b) => a.countdown.days - b.countdown.days);

  return (
    <Card
      label="Impending Assessments"
      action={
        <span className="font-mono text-[11px] text-on-surface-variant dark:text-night-muted">
          {pending.length} pending
        </span>
      }
    >
      {pending.length === 0 ? (
        <div className="py-8 text-center">
          <p className="font-label-caps text-label-caps uppercase text-on-surface-variant dark:text-night-muted">
            Matrix clear
          </p>
          <p className="mt-2 text-xs text-on-surface-variant dark:text-night-muted">
            Every scheduled assessment has a recorded score.
          </p>
          <button
            type="button"
            onClick={onAddExam}
            className="mt-3 h-8 px-3 rounded text-xs font-semibold text-white bg-on-surface dark:bg-night-ink dark:text-night-canvas hover:opacity-90 transition"
          >
            Schedule Exam
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {pending.map((item) => {
            const color = getSubjectColor(item.subjectColor);
            const isOverdue = item.countdown.days < 0;
            const isUrgent = item.countdown.days >= 0 && item.countdown.days <= 2;

            return (
              <div
                key={`${item.subjectId}-${item.id}`}
                className={`rounded border p-3.5 transition-colors ${
                  isOverdue
                    ? 'border-error/40 bg-error/5'
                    : isUrgent
                    ? 'border-[#6366f1]/40 bg-[#6366f1]/5'
                    : 'border-outline-variant dark:border-night-border hover:border-on-surface/40 dark:hover:border-night-ink/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-label-caps text-[10px] uppercase text-on-surface-variant dark:text-night-muted">
                    <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} aria-hidden="true" />
                    <span className="truncate max-w-[110px]">{item.subjectName}</span>
                  </span>
                  <span
                    className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                      isOverdue
                        ? 'text-error border-error/40'
                        : isUrgent
                        ? 'text-[#6366f1] border-[#6366f1]/40'
                        : 'text-on-surface-variant dark:text-night-muted border-outline-variant dark:border-night-border'
                    }`}
                  >
                    {item.countdown.label}
                  </span>
                </div>

                <h3 className="mt-2 text-sm font-semibold text-on-surface dark:text-night-ink truncate">
                  {item.title}
                </h3>
                <p className="mt-1 font-mono text-[11px] text-on-surface-variant dark:text-night-muted">
                  {formatShortDateWithDay(item.date)}
                </p>

                {/* Revision readiness */}
                <div className="mt-3">
                  <div className="flex items-center justify-between font-label-caps text-[9px] uppercase text-on-surface-variant dark:text-night-muted">
                    <span>Readiness</span>
                    <span className="font-mono">
                      {typeof item.readiness === 'number' ? `${item.readiness}%` : '—'}
                    </span>
                  </div>
                  <div className="mt-1 h-1 rounded-sm bg-surface-container-low dark:bg-night-canvas overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        typeof item.readiness === 'number' && item.readiness >= 60
                          ? 'bg-secondary'
                          : 'bg-[#6366f1]'
                      }`}
                      style={{ width: `${typeof item.readiness === 'number' ? item.readiness : 0}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onQuickScore(item.subjectId, item)}
                  className="mt-3 w-full h-8 rounded text-xs font-semibold border border-outline-variant dark:border-night-border text-on-surface-variant dark:text-night-muted hover:text-on-surface dark:hover:text-night-ink hover:bg-surface-container-low dark:hover:bg-night-canvas transition"
                >
                  Record Score
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
