import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import { getCountdownInfo } from '../../utils/dateUtils';
import { getSubjectColor } from '../../constants/colors';

/**
 * Fast transaction engine: inline score recording for pending exams —
 * no modal round-trip required.
 */
export default function QuickLogEngine({ subjects = [], onRecordScore }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

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
  const rows = pending.slice(0, 6);

  const handleRecord = (item) => {
    const raw = (values[item.id] || '').trim();
    const num = parseFloat(raw);
    if (raw === '' || isNaN(num) || num < 0 || num > 100) {
      setErrors((prev) => ({ ...prev, [item.id]: 'Enter 0–100' }));
      return;
    }
    setErrors((prev) => ({ ...prev, [item.id]: undefined }));
    setValues((prev) => ({ ...prev, [item.id]: '' }));
    onRecordScore(item.subjectId, item.id, Math.round(num * 10) / 10);
  };

  return (
    <Card
      label="Quick Log Engine"
      action={
        <span className="font-label-caps text-[10px] uppercase text-on-surface-variant dark:text-night-muted">
          Inline score entry
        </span>
      }
    >
      {rows.length === 0 ? (
        <p className="py-4 text-center text-xs text-on-surface-variant dark:text-night-muted">
          No pending exams — nothing to log.
        </p>
      ) : (
        <div className="divide-y divide-outline-variant dark:divide-night-border">
          {rows.map((item) => {
            const color = getSubjectColor(item.subjectColor);
            return (
              <div
                key={item.id}
                className="py-2.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${color.dot}`} aria-hidden="true" />
                  <span className="text-xs font-semibold text-on-surface dark:text-night-ink truncate">
                    {item.title}
                  </span>
                  <span className="font-label-caps text-[9px] uppercase text-on-surface-variant dark:text-night-muted shrink-0">
                    {item.subjectName}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-[10px] text-on-surface-variant dark:text-night-muted">
                    {item.countdown.label}
                  </span>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="—"
                      aria-label={`Score for ${item.title}`}
                      value={values[item.id] || ''}
                      onChange={(e) =>
                        setValues((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRecord(item);
                      }}
                      className={`w-16 h-8 px-2 pr-5 text-xs font-mono text-right rounded bg-surface-container-low dark:bg-night-canvas border text-on-surface dark:text-night-ink focus:outline-none transition ${
                        errors[item.id]
                          ? 'border-error'
                          : 'border-outline-variant dark:border-night-border focus:border-on-surface dark:focus:border-night-ink'
                      }`}
                    />
                    <span className="absolute right-1.5 top-1.5 text-[10px] text-on-surface-variant dark:text-night-muted pointer-events-none">
                      %
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRecord(item)}
                    className="h-8 px-3 rounded text-xs font-semibold text-white bg-on-surface dark:bg-night-ink dark:text-night-canvas hover:opacity-90 transition"
                  >
                    Log
                  </button>
                </div>

                {errors[item.id] && (
                  <span className="font-mono text-[10px] text-error sm:ml-auto">{errors[item.id]}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
