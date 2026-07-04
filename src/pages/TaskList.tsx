// ─────────────────────────────────────────────
// pages/TaskList.tsx
//
// A simple placeholder page for the Tasks section.
// You can build this out later — for now it shows
// the same task table in a slightly different layout.
// ─────────────────────────────────────────────

import { tasks } from '../data/tasks';
import TaskTable from '../components/TaskTable';

export default function TaskList() {
  return (
    <div className="space-y-6 w-full text-left">

      {/* Page heading */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight m-0">All Tasks</h2>
        <p className="text-xs text-gray-400 font-medium mt-1 m-0">
          A complete list of all tasks across the team.
        </p>
      </div>

      {/* Reuse the same TaskTable component from Dashboard */}
      <TaskTable tasks={tasks} />

    </div>
  );
}
