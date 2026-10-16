import React, { useState } from 'react';
import { 
  Plus, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Calendar, 
  Target, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp 
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
  onDeleteSubject 
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  const subjectMean = calculateSubjectMean(subject);
  const letterGrade = getLetterGrade(subjectMean);
  const badgeStyle = getScoreColorBadge(subjectMean);
  const color = getSubjectColor(subject.color);

  const exams = subject.exams || [];
  const gradedCount = exams.filter(e => typeof e.score === 'number' && !isNaN(e.score)).length;
  const target = subject.targetGrade;

  return (
    <div className={`rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 border-l-4 ${color.accentBorder}`}>
      
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          
          {/* Subject info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${color.badge}`}>
                {subject.code || 'SUBJECT'}
              </span>
              {target && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  <Target className="w-3 h-3 text-zinc-400" />
                  Target: {target}%
                </span>
              )}
            </div>
            
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
              {subject.name}
            </h3>
          </div>

          {/* Subject Mean Grade badge & Options menu */}
          <div className="flex items-center gap-2">
            
            {/* Grade Badge */}
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1.5">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  {subjectMean !== null ? `${subjectMean}%` : '—'}
                </span>
                {subjectMean !== null && (
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                    {letterGrade}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-400">
                {gradedCount} of {exams.length} scored
              </p>
            </div>

            {/* Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                title="Subject options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-1 z-30 text-xs">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEditSubject(subject);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-left"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Edit Subject</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDeleteSubject(subject.id);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition text-left"
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

        {/* Progress Bar against Target Goal (if specified) */}
        {target && (
          <div className="mt-3">
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  subjectMean !== null && subjectMean >= target ? 'bg-emerald-500' : color.bar
                }`}
                style={{ width: `${Math.min(100, Math.max(0, subjectMean !== null ? subjectMean : 0))}%` }}
              />
            </div>
          </div>
        )}

        {/* Toggle Collapse & Add Exam button */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{isExpanded ? 'Hide' : 'Show'} Exams ({exams.length})</span>
          </button>

          <button
            onClick={() => onAddExamToSubject(subject.id)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Exam</span>
          </button>
        </div>
      </div>

      {/* Exams Accordion Content */}
      {isExpanded && (
        <div className="bg-zinc-50/50 dark:bg-zinc-950/30 border-t border-zinc-100 dark:border-zinc-800/60 p-4 space-y-2.5">
          {exams.length === 0 ? (
            <div className="py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
              No exams added for this subject yet. Click "Add Exam" to track tests and dates.
            </div>
          ) : (
            exams.map((exam) => {
              const hasScore = typeof exam.score === 'number' && !isNaN(exam.score);
              const countdown = getCountdownInfo(exam.date, hasScore);
              const examBadge = getScoreColorBadge(hasScore ? exam.score : null);

              return (
                <div
                  key={exam.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition"
                >
                  {/* Left: Exam Details */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {exam.title}
                      </span>

                      {/* Countdown badge if upcoming / pending */}
                      {!hasScore && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          countdown.status === 'today' || countdown.status === 'tomorrow'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : countdown.status === 'overdue'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}>
                          {countdown.label}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      <span>{exam.date} ({formatReadableDate(exam.date)})</span>
                    </div>

                    {exam.notes && (
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">
                        {exam.notes}
                      </p>
                    )}
                  </div>

                  {/* Right: Score percentage & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800/80">
                    
                    {/* Score display or "Enter Score" prompt */}
                    {hasScore ? (
                      <div className="flex items-center gap-2">
                        <div className={`px-2.5 py-1 rounded-lg border font-mono text-sm font-bold ${examBadge.bg} ${examBadge.text} ${examBadge.border}`}>
                          {exam.score}%
                        </div>
                        <span className="text-[11px] font-semibold text-zinc-400">
                          {getLetterGrade(exam.score)}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => onQuickScore(subject.id, exam)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 transition"
                      >
                        <Clock className="w-3 h-3" />
                        <span>Enter Score</span>
                      </button>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => onEditExam(subject.id, exam)}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        title="Edit exam"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteExam(subject.id, exam.id)}
                        className="p-1 rounded text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        title="Delete exam"
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
