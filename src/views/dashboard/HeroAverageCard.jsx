import React from 'react';
import Card from '../../components/ui/Card';
import { calculateOverallStats, buildTrajectorySeries, getLetterGrade } from '../../utils/gradeCalculations';
import { computeDomain, pointCoords, toPath, toAreaPath, yForValue } from '../../utils/chartUtils';

const W = 320;
const H = 96;

/**
 * Dashboard bento hero: 44px tabular overall average, GPA readout
 * and an SVG progression sparkline with cohort benchmark line + milestone dots.
 */
export default function HeroAverageCard({ subjects = [] }) {
  const stats = calculateOverallStats(subjects);

  const allExams = subjects.flatMap((s) => s.exams || []);
  const trajectory = buildTrajectorySeries(allExams);
  const values = trajectory.map((p) => p.value);

  const benchmark = stats.averageTarget !== null ? stats.averageTarget : 85;
  const domain = computeDomain(values.length > 0 ? [...values, benchmark] : [benchmark, benchmark + 1], 50, 100);
  const coords = pointCoords(values, W, H, domain);
  const benchmarkY = yForValue(benchmark, H, domain);

  return (
    <Card
      label="Overall Average"
      action={
        stats.overallMean !== null ? (
          <span className="font-label-caps text-[10px] uppercase px-1.5 py-0.5 rounded border border-secondary/40 bg-secondary/5 text-secondary">
            {getLetterGrade(stats.overallMean)}
          </span>
        ) : (
          <span className="font-label-caps text-[10px] uppercase px-1.5 py-0.5 rounded border border-outline-variant dark:border-night-border text-on-surface-variant dark:text-night-muted">
            No data
          </span>
        )
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
        {/* Hero number */}
        <div>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[44px] leading-[44px] font-semibold tracking-tight text-on-surface dark:text-night-ink tabular-nums">
              {stats.overallMean !== null ? stats.overallMean.toFixed(1) : '—'}
              <span className="text-[24px] text-on-surface-variant dark:text-night-muted">%</span>
            </span>
            {stats.overallMean !== null && (
              <span className="font-mono text-label-numeric text-on-surface-variant dark:text-night-muted">
                {getLetterGrade(stats.overallMean)} · GPA {stats.gpa !== null ? stats.gpa.toFixed(2) : '—'}
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-outline-variant dark:border-night-border pt-3">
            <div>
              <p className="font-label-caps text-[10px] uppercase text-on-surface-variant dark:text-night-muted">
                Graded
              </p>
              <p className="font-mono text-label-numeric text-on-surface dark:text-night-ink">
                {stats.totalGradedExams}
                <span className="text-on-surface-variant dark:text-night-muted">/{stats.totalExams}</span>
              </p>
            </div>
            <div>
              <p className="font-label-caps text-[10px] uppercase text-on-surface-variant dark:text-night-muted">
                Subjects
              </p>
              <p className="font-mono text-label-numeric text-on-surface dark:text-night-ink">
                {stats.totalSubjects}
              </p>
            </div>
            <div>
              <p className="font-label-caps text-[10px] uppercase text-on-surface-variant dark:text-night-muted">
                Buffer
              </p>
              <p
                className={`font-mono text-label-numeric ${
                  stats.targetBuffer !== null && stats.targetBuffer >= 0
                    ? 'text-secondary'
                    : 'text-error'
                }`}
              >
                {stats.targetBuffer !== null ? `${stats.targetBuffer > 0 ? '+' : ''}${stats.targetBuffer}` : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Progression sparkline */}
        <div>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-24"
            role="img"
            aria-label="Cumulative average progression with cohort benchmark"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="hero-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#006c4a" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#006c4a" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Cohort benchmark */}
            <line
              x1="0"
              y1={benchmarkY}
              x2={W}
              y2={benchmarkY}
              stroke="#6366f1"
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {coords.length > 0 && (
              <>
                <path d={toAreaPath(coords, H)} fill="url(#hero-area)" />
                <path
                  d={toPath(coords)}
                  fill="none"
                  stroke="#006c4a"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Milestone checkpoints */}
                {coords.map((c, i) => (
                  <circle
                    key={i}
                    cx={c.x}
                    cy={c.y}
                    r="2.5"
                    fill="#f8f9ff"
                    stroke="#006c4a"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </>
            )}
          </svg>

          <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-on-surface-variant dark:text-night-muted">
            <span>{trajectory.length > 0 ? trajectory[0].date : '—'}</span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-px border-t border-dashed border-[#6366f1]" />
              Target {benchmark}%
            </span>
            <span>{trajectory.length > 0 ? trajectory[trajectory.length - 1].date : '—'}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
