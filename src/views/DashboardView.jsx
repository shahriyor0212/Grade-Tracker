import React, { useState } from 'react';
import { Search, Plus, BookOpen } from 'lucide-react';
import ViewHeader from '../components/ViewHeader';
import HeroAverageCard from './dashboard/HeroAverageCard';
import UpcomingMatrix from './dashboard/UpcomingMatrix';
import TrajectoryPulse from './dashboard/TrajectoryPulse';
import QuickLogEngine from './dashboard/QuickLogEngine';
import SubjectCard from '../components/SubjectCard';

/**
 * Dashboard view: hero average, impending assessment matrix, module
 * trajectory pulse, inline quick log engine and the full CRUD subjects grid.
 * Search/filter state is local.
 */
export default function DashboardView({
  subjects = [],
  onAddSubject,
  onAddExam,
  onResetData,
  onEditSubject,
  onDeleteSubject,
  onEditExam,
  onDeleteExam,
  onQuickScore,
  onQuickScoreSave,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'upcoming', 'graded'

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subject.code && subject.code.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterMode === 'upcoming') {
      return (subject.exams || []).some((e) => e.score === null || e.score === undefined);
    }
    if (filterMode === 'graded') {
      return (subject.exams || []).some((e) => typeof e.score === 'number');
    }
    return true;
  });

  const filterPills = [
    { id: 'all', label: 'All' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'graded', label: 'Graded' },
  ];

  return (
    <section>
      <ViewHeader
        label="Dashboard / Semester 1"
        title="Semester Overview"
        description="Live standing, impending assessments and course trajectories."
        actions={
          <button
            type="button"
            onClick={() => onAddExam()}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-semibold text-white bg-on-surface dark:bg-night-ink dark:text-night-canvas hover:opacity-90 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Exam</span>
          </button>
        }
      />

      {/* Hero average */}
      <div className="mb-4">
        <HeroAverageCard subjects={subjects} />
      </div>

      {/* Impending assessment matrix */}
      <div className="mb-4">
        <UpcomingMatrix subjects={subjects} onQuickScore={onQuickScore} onAddExam={onAddExam} />
      </div>

      {/* Course summary + inline transaction engine */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-8">
        <div className="xl:col-span-2">
          <TrajectoryPulse subjects={subjects} />
        </div>
        <QuickLogEngine subjects={subjects} onRecordScore={onQuickScoreSave} />
      </div>

      {/* Subjects Section Header & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-on-surface-variant dark:text-night-muted" />
          <h2 className="font-headline-md text-headline-md text-on-surface dark:text-night-ink tracking-tight">
            Enrolled Subjects & Exam Grades
          </h2>
        </div>

        {/* Search & Filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-on-surface-variant dark:text-night-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search subject or code..."
              aria-label="Search subjects by name or course code"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded bg-white dark:bg-night-surface border border-outline-variant dark:border-night-border text-on-surface dark:text-night-ink placeholder-on-surface-variant dark:placeholder-night-muted focus:outline-none focus:border-on-surface dark:focus:border-night-ink transition"
            />
          </div>

          <div className="inline-flex rounded bg-surface-container-lowest dark:bg-night-surface border border-outline-variant dark:border-night-border p-0.5">
            {filterPills.map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => setFilterMode(pill.id)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                  filterMode === pill.id
                    ? 'bg-on-surface text-white dark:bg-night-ink dark:text-night-canvas'
                    : 'text-on-surface-variant dark:text-night-muted hover:text-on-surface dark:hover:text-night-ink'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      {filteredSubjects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-outline-variant dark:border-night-border p-12 text-center">
          <BookOpen className="w-10 h-10 mx-auto text-outline-variant dark:text-night-border mb-3" />
          <h3 className="text-sm font-semibold text-on-surface dark:text-night-ink">
            {searchQuery ? 'No matching subjects found' : 'No subjects added yet'}
          </h3>
          <p className="text-xs text-on-surface-variant dark:text-night-muted mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Try tweaking your search term or filter'
              : 'Create your first subject to start tracking tests, dates, and performance percentages.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onAddSubject}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-on-surface dark:bg-night-ink dark:text-night-canvas rounded hover:opacity-90 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Subject</span>
            </button>
            {subjects.length === 0 && (
              <button
                type="button"
                onClick={onResetData}
                className="px-3.5 py-2 text-xs font-semibold text-on-surface-variant dark:text-night-muted border border-outline-variant dark:border-night-border rounded hover:bg-surface-container-low dark:hover:bg-night-surface transition"
              >
                Load Sample Data
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredSubjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onAddExamToSubject={(subjectId) => onAddExam(subjectId)}
              onEditExam={onEditExam}
              onDeleteExam={onDeleteExam}
              onQuickScore={onQuickScore}
              onEditSubject={onEditSubject}
              onDeleteSubject={onDeleteSubject}
            />
          ))}
        </div>
      )}
    </section>
  );
}
