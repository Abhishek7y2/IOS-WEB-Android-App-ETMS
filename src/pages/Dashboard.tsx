// ─────────────────────────────────────────────
// pages/Dashboard.tsx
//
// The main dashboard page.
// This component does ONE thing: assemble all parts.
//
// It imports:
//   - data from data/tasks.ts
//   - components from components/
// No logic lives here — just layout and assembly.
// ─────────────────────────────────────────────

import { tasks, summaryCards } from '../data/tasks';
import TaskSummaryCard from '../components/TaskSummaryCard';
import TaskTable from '../components/TaskTable';
import ProgressBar from '../components/ProgressBar';

export default function Dashboard() {
  // Auto-calculate completed count from data — not hardcoded
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="space-y-6 w-full text-left">

      {/* ── Page heading ── */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight m-0">Dashboard</h2>
        <p className="text-xs text-gray-400 font-medium mt-1 m-0">
          Welcome back, Alex! Here's what's happening with your team today.
        </p>
      </div>

      {/* ── Summary Cards ──
          grid-cols-1: 1 column on mobile
          sm:grid-cols-2: 2 columns on small screens
          lg:grid-cols-4: 4 columns on large screens

          We loop over summaryCards and render a TaskSummaryCard for each one.
          The data comes from data/tasks.ts — not hardcoded here. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <TaskSummaryCard
            key={card.title}   // React needs a unique key when rendering lists
            title={card.title}
            count={card.count}
            icon={card.icon}
            colorClass={card.colorClass}
          />
        ))}
      </div>

      {/* ── Progress Bar ──
          Shows overall completion percentage.
          Values are derived from the tasks array — not hardcoded. */}
      <ProgressBar total={tasks.length} completed={completedCount} />

      {/* ── Task Table ──
          We pass the tasks array as a prop.
          TaskTable only knows how to display — it doesn't fetch data. */}
      <TaskTable tasks={tasks} />

    </div>
  );
}
