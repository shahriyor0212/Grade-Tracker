import React from 'react';
import ViewHeader from '../components/ViewHeader';
import MissionBanner from './targets/MissionBanner';
import SubjectTargetsTable from './targets/SubjectTargetsTable';
import FinalsSimulator from './targets/FinalsSimulator';
import HabitChecklist from './targets/HabitChecklist';

/**
 * Targets view: semester mission banner, coursework target matrix,
 * finals score simulator and the daily habit checklist.
 */
export default function TargetsView({ subjects = [] }) {
  return (
    <section>
      <ViewHeader
        label="Targets / Semester Plan"
        title="Course Targets"
        description="Course-level target grades, projected final scores and daily study habits."
      />

      <MissionBanner subjects={subjects} />

      {/* Target matrix + simulator */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <div className="xl:col-span-2">
          <SubjectTargetsTable subjects={subjects} />
        </div>
        <FinalsSimulator subjects={subjects} />
      </div>

      {/* Daily habits */}
      <HabitChecklist />
    </section>
  );
}
