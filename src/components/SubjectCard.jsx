import React, { useState } from 'react';
import {
  Plus,
  MoreVertical,
  Edit3,
  Trash2,
  Calendar,
  Target,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { calculateSubjectMean, getLetterGrade, getScoreColorBadge } from '../utils/gradeCalculations';
import { getCountdownInfo, formatReadableDate } from '../utils/dateUtils';
import { getSubjectColor } from '../constants/colors';

export default function SubjectCard({
  subject,
  onAddExamToSubject,
  onEditExam,
  onDeleteExam,
  onQuickScore,
  onEditSubject,
  onDeleteSubject,
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  const subjectMean = calculateSubjectMean(subject);
  const letterGrade = getLetterGrade(subjectMean);
  const badgeStyle = getScoreColorBadge(subjectMean);
  const color = getSubjectColor(subject.color);

  const exams = subject.exams || [];
  const gradedCount = exams.filter((e) => typeof e.score === 'number' && !isNaN(e.score)).length;
  const target = subject.targetGrade;

  return (
    <div className="rounded-lg bg-surface-container-lowest dark:bg-night-surface border border-outline-variant dark:border-night-border overflow-hidden transition-colors hover:border-on-surface-variant/60 dark:hover:border-night-muted/50">
      {/* Header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Subject info */}
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${color.dot}`} aria-hidden="true" />
                <span className="font-label-caps text-[10px] uppercase text-on-surface dark:text-night-ink">
                  {subject.code || 'Subject'}
                </span>
              </span>
              {target && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-on-surface-variant dark:text-night-muted">
                  <Target className="w-3 h-3" aria-hidden="true" />
                  tgt {target}%
                </span>
              )}
              {subject.term && (
                <span className="font-label-caps text-[9px] uppercase px-1.5 py-0.5 rounded border border-outline-variant dark:border-night-border text-on-surface-variant dark:text-night-muted">
                  {subject.term}
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-semibold tracking-tight text-on-surface dark:text-night-ink truncate">
              {subject.name}
            </h3>
          </div>

          {/* Subject Mean badge & Options menu */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1.5">
                <span className="font-mono text-xl sm:text-2xl font-semibold tabular-nums text-on-surface dark:text-night-ink">
                  {subjectMean !== null ? `${subjectMean}%` : '—'}
                </span>
                {subjectMean !== null && (
                  <span
                    className={`font-label-caps text-[9px] uppercase px-1.5 py-0.5 rounded border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                  >
                    {letterGrade}
                  </span>
                )}
              </div>
              <p className="mt-0.5 font-label-caps text-[9px] uppercase text-on-surface-variant dark:text-night-muted">
                {gradedCount} / {exams.length} scored
              </p>
            </div>

            {/* Menu Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded text-on-surface-variant dark:text-night-muted hover:text-on-surface dark:hover:text-night-ink hover:bg-surface-container-low dark:hover:bg-night-canvas transition"
                title="Subject options"
                aria-label={`Options for ${subject.name}`}
                aria-expanded={showMenu}
                aria-haspopup="true"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-1 w-36 rounded bg-surface-container-lowest dark:bg-night-surface shadow-lg border border-outline-variant dark:border-night-border p-1 z-30 text-xs">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEditSubject(subject);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-on-surface dark:text-night-ink hover:bg-surface-container-low dark:hover:bg-night-canvas transition text-left"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-on-surface-variant dark:text-night-muted" />
                      <span>Edit Subject</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDeleteSubject(subject.id);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-error hover:bg-error/5 transition text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar against Target Goal */}
        {target && (
          <div className="mt-3">
            <div className="w-full bg-outline-variant/40 dark:bg-night-border h-0.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  subjectMean !== null && subjectMean >= target
                    ? 'bg-secondary'
                    : subjectMean !== null && subjectMean >= target - 5
                    ? 'bg-[#6366f1]'
                    : 'bg-error'
                }`}
                style={{
                  width: `${Math.min(100, Math.max(0, subjectMean !== null ? subjectMean : 0))}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Toggle Collapse & Add Exam */}
        <div className="mt-4 pt-3 border-t border-outline-variant dark:border-night-border flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Hide' : 'Show'} exams for ${subject.name}`}
            className="flex items-center gap-1.5 font-label-caps text-[10px] uppercase text-on-surface-variant dark:text-night-muted hover:text-on-surface dark:hover:text-night-ink transition"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{isExpanded ? 'Hide' : 'Show'} Assessments ({exams.length})</span>
          </button>

          <button
            onClick={() => onAddExamToSubject(subject.id)}
            className="inline-flex items-center gap-1 font-label-caps text-[10px] uppercase text-on-surface dark:text-night-ink hover:text-on-surface-variant dark:hover:text-night-muted transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Assessment</span>
          </button>
        </div>
      </div>

      {/* Exams Accordion Content */}
      {isExpanded && (
        <div className="border-t border-outline-variant dark:border-night-border bg-surface-container-low/50 dark:bg-night-canvas/40 p-3 sm:p-4 space-y-2">
          {exams.length === 0 ? (
            <div className="py-4 text-center font-label-caps text-[10px] uppercase text-on-surface-variant dark:text-night-muted">
              No assessments recorded
            </div>
          ) : (
            exams.map((exam) => {
              const hasScore = typeof exam.score === 'number' && !isNaN(exam.score);
              const countdown = getCountdownInfo(exam.date, hasScore);
              const examBadge = getScoreColorBadge(hasScore ? exam.score : null);
              const countdownTone =
                countdown.status === 'today' || countdown.status === 'tomorrow'
                  ? 'text-[#6366f1] border-[#6366f1]/40 bg-[#6366f1]/5'
                  : countdown.status === 'overdue'
                  ? 'text-error border-error/40 bg-error/5'
                  : 'text-on-surface-variant dark:text-night-muted border-outline-variant dark:border-night-border';

              return (
                <div
                  key={exam.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded border border-outline-variant dark:border-night-border bg-surface-container-lowest dark:bg-night-surface hover:border-on-surface-variant/60 dark:hover:border-night-muted/50 transition"
                >
                  {/* Left: Exam Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-semibold text-on-surface dark:text-night-ink">
                        {exam.title}
                      </span>

                      {exam.examType && (
                        <span className="font-label-caps text-[9px] uppercase px-1.5 py-0.5 rounded border border-outline-variant dark:border-night-border text-on-surface-variant dark:text-night-muted">
                          {exam.examType}
                        </span>
                      )}

                      {!hasScore && (
                        <span
                          className={`font-label-caps text-[9px] uppercase px-1.5 py-0.5 rounded border ${countdownTone}`}
                        >
                          {countdown.label}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-on-surface-variant dark:text-night-muted">
                      <Calendar className="w-3 h-3" aria-hidden="true" />
                      <span>{exam.date}</span>
                      <span className="opacity-70">({formatReadableDate(exam.date)})</span>
                    </div>

                    {exam.notes && (
                      <p className="mt-1 text-[11px] italic text-on-surface-variant dark:text-night-muted line-clamp-1">
                        {exam.notes}
                      </p>
                    )}
                  </div>

                  {/* Right: Score percentage & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant dark:border-night-border">
                    {/* Score display or "Enter Score" prompt */}
                    {hasScore ? (
                      <div className="flex items-center gap-2">
                        <div
                          className={`px-2 py-0.5 rounded border font-mono text-xs font-semibold tabular-nums ${examBadge.bg} ${examBadge.text} ${examBadge.border}`}
                        >
                          {exam.score}%
                        </div>
                        <span className="font-label-caps text-[9px] uppercase text-on-surface-variant dark:text-night-muted">
                          {getLetterGrade(exam.score)}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => onQuickScore(subject.id, exam)}
                        className="inline-flex items-center gap-1 px-2 py-1 font-label-caps text-[9px] uppercase rounded border border-outline-variant dark:border-night-border text-on-surface dark:text-night-ink hover:bg-on-surface hover:text-white dark:hover:bg-night-ink dark:hover:text-night-canvas transition"
                      >
                        <Clock className="w-3 h-3" />
                        <span>Enter Score</span>
                      </button>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition">
                      <button
                        type="button"
                        onClick={() => onEditExam(subject.id, exam)}
                        className="p-1 rounded text-on-surface-variant dark:text-night-muted hover:text-on-surface dark:hover:text-night-ink hover:bg-surface-container-low dark:hover:bg-night-canvas transition"
                        title="Edit exam"
                        aria-label={`Edit exam ${exam.title}`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteExam(subject.id, exam.id)}
                        className="p-1 rounded text-on-surface-variant dark:text-night-muted hover:text-error hover:bg-error/5 transition"
                        title="Delete exam"
                        aria-label={`Delete exam ${exam.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
