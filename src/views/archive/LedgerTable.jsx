import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import Card from '../../components/ui/Card';
import { isGradedExam, getLetterGrade } from '../../utils/gradeCalculations';
import { formatReadableDate } from '../../utils/dateUtils';

function statusBadge(score) {
  if (score >= 85) {
    return (
      <span className="font-label-caps text-[9px] uppercase px-1.5 py-0.5 rounded border border-secondary/40 bg-secondary/5 text-secondary">
        Strong
      </span>
    );
  }
  if (score >= 60) {
    return (
      <span className="font-label-caps text-[9px] uppercase px-1.5 py-0.5 rounded border border-outline-variant dark:border-night-border text-on-surface-variant dark:text-night-muted">
        Pass
      </span>
    );
  }
  return (
    <span className="font-label-caps text-[9px] uppercase px-1.5 py-0.5 rounded border border-error/40 bg-error/5 text-error">
      Deficit
    </span>
  );
}

/**
 * Audited historical ledger: term pills, search, sortable columns and
 * verifiable status badges over every graded sit.
 */
export default function LedgerTable({ subjects = [] }) {
  const [term, setTerm] = useState('All Terms');
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const terms = useMemo(
    () => [...new Set(subjects.map((s) => s.term).filter(Boolean))],
    [subjects]
  );

  const rows = useMemo(() => {
    const flat = subjects.flatMap((subject) =>
      (subject.exams || [])
        .filter(isGradedExam)
        .map((exam) => ({
          ...exam,
          subjectId: subject.id,
          subjectName: subject.name,
          subjectCode: subject.code || '—',
          term: subject.term,
          examType: exam.examType || 'Assessment',
        }))
    );

    const q = query.trim().toLowerCase();
    const filtered = flat.filter((row) => {
      const matchesTerm = term === 'All Terms' || row.term === term;
      const matchesQuery =
        q === '' ||
        row.title.toLowerCase().includes(q) ||
        row.subjectName.toLowerCase().includes(q) ||
        row.subjectCode.toLowerCase().includes(q);
      return matchesTerm && matchesQuery;
    });

    filtered.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') cmp = String(a.date).localeCompare(String(b.date));
      else if (sortKey === 'score') cmp = a.score - b.score;
      else cmp = a.subjectName.localeCompare(b.subjectName);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return filtered;
  }, [subjects, term, query, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'date' ? 'desc' : 'asc');
    }
  };

  const sortIndicator = (key) => {
    if (sortKey !== key) return null;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3" aria-hidden="true" />
    ) : (
      <ChevronDown className="w-3 h-3" aria-hidden="true" />
    );
  };

  const totalGraded = subjects.reduce(
    (n, s) => n + (s.exams || []).filter(isGradedExam).length,
    0
  );

  return (
    <Card
      label="Historical Ledger"
      action={
        <span className="font-mono text-[11px] text-on-surface-variant dark:text-night-muted">
          {rows.length} / {totalGraded} records
        </span>
      }
    >
      {/* Term pills + search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-1.5">
          {['All Terms', ...terms].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTerm(t)}
              className={`px-2.5 py-1 rounded text-xs font-semibold border transition ${
                term === t
                  ? 'bg-on-surface text-white dark:bg-night-ink dark:text-night-canvas border-on-surface dark:border-night-ink'
                  : 'text-on-surface-variant dark:text-night-muted border-outline-variant dark:border-night-border hover:text-on-surface dark:hover:text-night-ink'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative sm:w-56">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-on-surface-variant dark:text-night-muted pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ledger..."
            aria-label="Search historical ledger"
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded bg-surface-container-low dark:bg-night-canvas border border-outline-variant dark:border-night-border text-on-surface dark:text-night-ink placeholder-on-surface-variant dark:placeholder-night-muted focus:outline-none focus:border-on-surface dark:focus:border-night-ink transition"
          />
        </div>
      </div>

      {/* Ledger table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left">
          <thead>
            <tr className="border-b border-outline-variant dark:border-night-border">
              <th scope="col" className="pb-2">
                <button
                  type="button"
                  onClick={() => toggleSort('date')}
                  className="inline-flex items-center gap-1 font-label-caps text-[10px] uppercase text-on-surface-variant dark:text-night-muted hover:text-on-surface dark:hover:text-night-ink transition"
                >
                  Date {sortIndicator('date')}
                </button>
              </th>
              <th scope="col" className="pb-2">
                <button
                  type="button"
                  onClick={() => toggleSort('subject')}
                  className="inline-flex items-center gap-1 font-label-caps text-[10px] uppercase text-on-surface-variant dark:text-night-muted hover:text-on-surface dark:hover:text-night-ink transition"
                >
                  Subject {sortIndicator('subject')}
                </button>
              </th>
              <th
                scope="col"
                className="pb-2 font-label-caps text-[10px] uppercase text-on-surface-variant dark:text-night-muted"
              >
                Type
              </th>
              <th
                scope="col"
                className="pb-2 font-label-caps text-[10px] uppercase text-on-surface-variant dark:text-night-muted"
              >
                Assessment
              </th>
              <th scope="col" className="pb-2 text-right">
                <button
                  type="button"
                  onClick={() => toggleSort('score')}
                  className="inline-flex items-center gap-1 font-label-caps text-[10px] uppercase text-on-surface-variant dark:text-night-muted hover:text-on-surface dark:hover:text-night-ink transition ml-auto"
                >
                  Score {sortIndicator('score')}
                </button>
              </th>
              <th
                scope="col"
                className="pb-2 text-right font-label-caps text-[10px] uppercase text-on-surface-variant dark:text-night-muted"
              >
                Grade
              </th>
              <th
                scope="col"
                className="pb-2 text-right font-label-caps text-[10px] uppercase text-on-surface-variant dark:text-night-muted"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant dark:divide-night-border">
            {rows.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-xs text-on-surface-variant dark:text-night-muted">
                  No records match the current filter.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container-low dark:hover:bg-night-canvas transition-colors">
                  <td className="py-2.5 pr-3 font-mono text-[11px] text-on-surface-variant dark:text-night-muted whitespace-nowrap">
                    {row.date}
                    <span className="block text-[9px] opacity-70">{formatReadableDate(row.date)}</span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className="text-xs font-semibold text-on-surface dark:text-night-ink">
                      {row.subjectName}
                    </span>
                    <span className="ml-1.5 font-mono text-[10px] text-on-surface-variant dark:text-night-muted">
                      {row.subjectCode}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className="font-label-caps text-[9px] uppercase px-1.5 py-0.5 rounded border border-outline-variant dark:border-night-border text-on-surface-variant dark:text-night-muted">
                      {row.examType}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-on-surface dark:text-night-ink max-w-[220px] truncate">
                    {row.title}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-mono text-xs font-semibold tabular-nums text-on-surface dark:text-night-ink">
                    {row.score}%
                  </td>
                  <td className="py-2.5 pr-3 text-right font-mono text-xs text-on-surface-variant dark:text-night-muted">
                    {getLetterGrade(row.score)}
                  </td>
                  <td className="py-2.5 text-right">{statusBadge(row.score)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
