# Grade Tracker

Swiss/Nordic-precision academic grade tracker. Track subjects, assessments, targets and habits with live averages, GPA mapping, required-score math, trajectory sparklines and a searchable historical ledger — all persisted to LocalStorage. No accounts, no backend, no weights, no credit hours.

## Stack

- React 19 + Vite 8
- Tailwind CSS 3.4 (`darkMode: 'class'`), custom design tokens in `tailwind.config.js`
- lucide-react icons
- Inter + JetBrains Mono (via Google Fonts in `index.html`)

## Commands

```bash
npm install      # install dependencies
npm run dev      # start dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
npm run lint     # oxlint over src/ (0 errors expected)
```

## Views

| View | Purpose |
| --- | --- |
| **Dashboard** | Hero average + sparkline, upcoming assessment matrix, trajectory pulse, quick-log engine, full CRUD grid |
| **Targets** | Mission banner, per-subject targets table (current/target/gap/required), finals simulator with error margin, daily habit checklist |
| **Archive** | Historical milestones + searchable, sortable, term-filtered ledger of every graded sit |

Navigation is a 3-tab switcher in `AppHeader`; the active view is mirrored to the URL hash (`#dashboard`, `#targets`, `#archive`).

## Data model

Subjects and exams live under `localStorage["minimal_grade_tracker_data_v2"]`:

```jsonc
{
  "subjects": [
    {
      "id": "subj_...",
      "name": "Advanced Calculus",
      "code": "MATH 240",
      "color": "indigo",
      "term": "Fall 2024",
      "targetGrade": 90,          // null = no target
      "exams": [
        {
          "id": "exam_...",
          "title": "Midterm 1",
          "date": "2024-10-15",   // strict YYYY-MM-DD string
          "score": 87.5,          // null = pending / upcoming
          "notes": "",
          "examType": "Midterm",  // Quiz | Midterm | Practicum | Final | null
          "readiness": 80         // self-assessed 0-100, pending exams only
        }
      ]
    }
  ]
}
```

Habits are stored separately under `localStorage["grade_tracker_habits_v1"]` as `{ habits: [{ id, label }], log: { "YYYY-MM-DD": [habitIds] } }`.

Data is normalized on load (`normalizeSubjects` in `src/utils/storage.js`) so legacy records without `examType`/`readiness`/`term` load cleanly. Import/export via JSON reuses the same shape.

## Grading math (no weights)

All averages are simple arithmetic means of graded exams (pending exams excluded).

- **GPA** — percentage mapped to a standard 4.0 scale
- **Required score** — equal-weight: `(target × totalExams − gradedSum) / pendingCount`, clamped to 0–100
- **Volatility** — population standard deviation of a subject's scores: <3 stable, 3–6 variable, ≥6 volatile
- **Cohort median** — per-exam-index median of cumulative-average trajectories
- **Risk vector** — count/deficit of subjects below target plus pending load
- **Study distribution** — priority-weighted split of a daily study budget (60/120/180 min)

The last four are implemented as pure helpers but are **not yet surfaced in any view** — they're reserved for a future Analytics tab. All pure functions live in `src/utils/gradeCalculations.js`; SVG chart geometry in `src/utils/chartUtils.js`.

## Design tokens

Defined in `tailwind.config.js`:

- **Light** — `surface` #f8f9ff, `surface-container-lowest` #ffffff, `on-surface` #0b1c30, `on-surface-variant` #45464d, `outline` #76777d, `outline-variant` #c6c6cd, `secondary` #006c4a, `error` #ba1a1a
- **Dark** (`night-*`) — canvas #0f172a, surface #131b2e, border #213145, ink #eaf1ff, muted #9aa7c0
- **Accent** — indigo `#6366f1` (active targets, urgent countdowns)
- **Type** — `headline-xl/lg/md`, `label-caps` (11px uppercase +0.05em), `label-numeric`, `label-tabular-lg`, `body-lg/md/sm`
- **Geometry** — 4px/8px radii, hairline 1px borders, 4px spacing rhythm
- Shared modal/field/button classes in `src/index.css` (`modal-shell`, `btn-primary`, `field-input`, …)

## Project structure

```
src/
├── App.jsx                  # view state, CRUD handlers, modal wiring
├── index.css                # base + shared component classes
├── constants/               # views registry, subject color palette
├── components/              # AppHeader/Footer, ViewHeader, modals, SubjectCard
│   └── ui/Card.jsx
├── utils/                   # storage, gradeCalculations, dateUtils, chartUtils
└── views/
    ├── dashboard/           # hero, matrix, pulse, quick-log
    ├── targets/             # mission, table, simulator, habits
    └── archive/             # milestones, ledger table
```
