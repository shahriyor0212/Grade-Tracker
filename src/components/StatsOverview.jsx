import React from 'react';
import { Award, BookOpen, Calendar, CheckCircle2, TrendingUp } from 'lucide-react';
import { calculateOverallStats, getLetterGrade, getScoreColorBadge } from '../utils/gradeCalculations';
import { getCountdownInfo, formatShortDateWithDay } from '../utils/dateUtils';

export default function StatsOverview({ subjects = [] }) {
  const stats = calculateOverallStats(subjects);
  const badgeStyle = getScoreColorBadge(stats.overallMean);
  const letterGrade = getLetterGrade(stats.overallMean);

  // Find the closest upcoming exam across all subjects
  const allUpcomingExams = [];
  subjects.forEach(subject => {
    (subject.exams || []).forEach(exam => {
      // If it's upcoming (no score or countdown >= 0)
      if (exam.score === null || exam.score === undefined) {
        const info = getCountdownInfo(exam.date, false);
        allUpcomingExams.push({
          ...exam,
          subjectName: subject.name,
          subjectColor: subject.color,
          countdown: info,
        });
      }
    });
  });

  // Sort by days difference ascending (nearest first)
  allUpcomingExams.sort((a, b) => a.countdown.days - b.countdown.days);
  const nextExam = allUpcomingExams.find(e => e.countdown.days >= 0) || allUpcomingExams[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
      {/* 1. Overall Mean Grade */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
          <span className="text-xs font-semibold tracking-wider uppercase">Overall Average</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {stats.overallMean !== null ? `${stats.overallMean}%` : '—'}
          </span>
          {stats.overallMean !== null && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
              Grade: {letterGrade}
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
          <span>Mean of {stats.totalGradedExams} graded {stats.totalGradedExams === 1 ? 'exam' : 'exams'}</span>
        </p>
      </div>

      {/* 2. Subjects Enrolled */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
          <span className="text-xs font-semibold tracking-wider uppercase">Enrolled Subjects</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {stats.totalSubjects}
          </span>
          <span className="text-xs font-medium text-zinc-400">Active</span>
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Tracking across all semesters
        </p>
      </div>

      {/* 3. Graded vs Upcoming Progress */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
          <span className="text-xs font-semibold tracking-wider uppercase">Exam Progress</span>
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {stats.totalGradedExams}
            <span className="text-lg text-zinc-400 font-normal">/{stats.totalExams}</span>
          </span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
            {stats.totalExams > 0 ? `${Math.round((stats.totalGradedExams / stats.totalExams) * 100)}%` : '0%'}
          </span>
        </div>
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${stats.totalExams > 0 ? (stats.totalGradedExams / stats.totalExams) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* 4. Next Upcoming Exam Card */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
          <span className="text-xs font-semibold tracking-wider uppercase">Next Countdown</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        {nextExam ? (
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                {nextExam.title}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                nextExam.countdown.status === 'today' || nextExam.countdown.status === 'tomorrow'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                  : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
              }`}>
                {nextExam.countdown.label}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 truncate">
              {nextExam.subjectName} • {formatShortDateWithDay(nextExam.date)}
            </p>
          </div>
        ) : (
          <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
            No upcoming exams scheduled. You're all caught up!
          </div>
        )}
      </div>

    </div>
  );
}
