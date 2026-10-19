import React, { useState } from 'react';
import { Check } from 'lucide-react';
import Card from '../../components/ui/Card';
import { loadStoredHabits, saveStoredHabits } from '../../utils/storage';
import { getTodayString } from '../../utils/dateUtils';

/**
 * Daily scholar focus checklist: habit template + per-day completion log,
 * persisted under its own localStorage key.
 */
export default function HabitChecklist() {
  const [state] = useState(() => loadStoredHabits());
  const today = getTodayString();
  const completed = state.log[today] || [];
  const [localLog, setLocalLog] = useState(state.log);

  const toggle = (habitId) => {
    setLocalLog((prev) => {
      const dayList = prev[today] || [];
      const nextDay = dayList.includes(habitId)
        ? dayList.filter((id) => id !== habitId)
        : [...dayList, habitId];
      const next = { ...prev, [today]: nextDay };
      saveStoredHabits({ habits: state.habits, log: next });
      return next;
    });
  };

  const doneToday = (localLog[today] || []).length;
  const total = state.habits.length;

  return (
    <Card
      label="Daily Scholar Focus"
      action={
        <span className="font-mono text-[11px] text-on-surface-variant dark:text-night-muted">
          {doneToday}/{total} · {today}
        </span>
      }
    >
      <ul className="divide-y divide-outline-variant dark:divide-night-border">
        {state.habits.map((habit) => {
          const isDone = completed.includes(habit.id);
          const doneNow = (localLog[today] || []).includes(habit.id);
          const checked = isDone || doneNow;

          return (
            <li key={habit.id} className="py-2.5 first:pt-0 last:pb-0">
              <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => toggle(habit.id)}
                className="w-full flex items-center gap-3 text-left group"
              >
                <span
                  className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition ${
                    checked
                      ? 'bg-secondary border-secondary text-white'
                      : 'border-outline-variant dark:border-night-border group-hover:border-on-surface dark:group-hover:border-night-ink'
                  }`}
                  aria-hidden="true"
                >
                  {checked && <Check className="w-3 h-3" />}
                </span>
                <span
                  className={`text-xs transition ${
                    checked
                      ? 'text-on-surface-variant dark:text-night-muted line-through'
                      : 'text-on-surface dark:text-night-ink'
                  }`}
                >
                  {habit.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 h-1 rounded-sm bg-surface-container-low dark:bg-night-canvas overflow-hidden">
        <div
          className="h-full bg-secondary transition-all duration-300"
          style={{ width: `${total > 0 ? (doneToday / total) * 100 : 0}%` }}
        />
      </div>
    </Card>
  );
}
