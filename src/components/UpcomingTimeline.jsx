import React from 'react';
import { Calendar, Clock, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { getCountdownInfo, formatReadableDate } from '../utils/dateUtils';
import { getSubjectColor } from '../constants/colors';

export default function UpcomingTimeline({ subjects = [], onQuickScore, onAddExam }) {
  // Aggregate all upcoming or un-scored exams
  const upcomingList = [];

  subjects.forEach(subject => {
    (subject.exams || []).forEach(exam => {
      // Upcoming if no score recorded yet
      if (exam.score === null || exam.score === undefined) {
        const countdown = getCountdownInfo(exam.date, false);
        upcomingList.push({
          ...exam,
          subjectId: subject.id,
          subjectName: subject.name,
          subjectCode: subject.code,
          subjectColor: subject.color,
          countdown,
        });
      }
    });
  });

  // Sort chronologically by days difference: overdue first, then today, tomorrow, etc.
  upcomingList.sort((a, b) => a.countdown.days - b.countdown.days);

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs mb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
              Upcoming Exam Dates & Countdowns
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Chronological schedule of future assessments
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
          {upcomingList.length} Upcoming
        </span>
      </div>

      {/* List */}
      {upcomingList.length === 0 ? (
        <div className="py-8 text-center text-zinc-400 dark:text-zinc-500">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500/80" />
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">All exams scored and up to date!</p>
          <p className="text-xs text-zinc-400 mt-1">Schedule your next exam date to begin tracking countdowns.</p>
          <button
            onClick={onAddExam}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg transition"
          >
            Add New Exam Date
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {upcomingList.map(item => {
            const color = getSubjectColor(item.subjectColor);
            const isUrgent = item.countdown.days <= 1 && item.countdown.days >= 0;
            const isOverdue = item.countdown.days < 0;

            return (
              <div 
                key={`${item.subjectId}-${item.id}`}
                className={`relative group rounded-xl p-3.5 border transition-all duration-200 ${
                  isUrgent
                    ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-300 dark:border-amber-800/70 shadow-xs'
                    : isOverdue
                    ? 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-300 dark:border-rose-800/70'
                    : 'bg-zinc-50/70 dark:bg-zinc-800/40 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {/* Subject badge & Countdown pill */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${color.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                    <span className="truncate max-w-[120px]">{item.subjectName}</span>
                  </span>

                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                    isUrgent
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      : isOverdue
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                      : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                  }`}>
                    {item.countdown.label}
                  </span>
                </div>

                {/* Exam Title */}
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                  {item.title}
                </h3>

                {/* Date and Notes */}
                <div className="mt-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="w-3 h-3 text-zinc-400" />
                    {item.date} ({formatReadableDate(item.date)})
                  </span>
                </div>

                {item.notes && (
                  <p className="mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 italic">
                    "{item.notes}"
                  </p>
                )}

                {/* Quick Score Action */}
                <div className="mt-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                    {isOverdue && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                    Score pending
                  </span>

                  <button
                    onClick={() => onQuickScore(item.subjectId, item)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 group-hover:underline"
                  >
                    <span>Record Score</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
