import React from 'react';
import ViewHeader from '../components/ViewHeader';
import Card from '../components/ui/Card';
import LedgerTable from './archive/LedgerTable';
import { percentageToGpa, isGradedExam, calculateSubjectStats } from '../utils/gradeCalculations';

/**
 * Archive view: historical milestones (GPA, archived sits, terms) plus the
 * searchable, sortable, term-filtered audited ledger.
 */
export default function ArchiveView({ subjects = [] }) {
  const gradedExams = subjects.flatMap((s) => (s.exams || []).filter(isGradedExam));
  const allScores = gradedExams.map((e) => e.score);
  const cumulativeMean =
    allScores.length > 0
      ? Math.round((allScores.reduce((sum, n) => sum + n, 0) / allScores.length) * 10) / 10
      : null;
  const cumulativeGpa = percentageToGpa(cumulativeMean);

  const terms = [...new Set(subjects.map((s) => s.term).filter(Boolean))];
  const concluded = subjects.filter((s) => calculateSubjectStats(s).pendingCount === 0).length;

  const milestones = [
    { label: 'Cumulative GPA', value: cumulativeGpa !== null ? cumulativeGpa.toFixed(2) : '—' },
    { label: 'Archived Sits', value: String(gradedExams.length) },
    { label: 'Terms Recorded', value: String(terms.length), sub: `${concluded} concluded` },
  ];

  return (
    <section>
      <ViewHeader
        label="Archive / Historical Record"
        title="Concluded Academic Ledger"
        description="Verifiable milestones across every recorded term."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {milestones.map((milestone) => (
          <Card key={milestone.label} label={milestone.label}>
            <p className="font-mono text-3xl font-semibold tabular-nums text-on-surface dark:text-night-ink">
              {milestone.value}
            </p>
            {milestone.sub && (
              <p className="mt-1.5 font-mono text-[10px] text-on-surface-variant dark:text-night-muted">
                {milestone.sub}
              </p>
            )}
          </Card>
        ))}
      </div>

      <LedgerTable subjects={subjects} />
    </section>
  );
}
