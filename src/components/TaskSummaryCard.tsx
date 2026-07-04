// ─────────────────────────────────────────────
// components/TaskSummaryCard.tsx
//
// A REUSABLE component — you pass data in as
// "props" and it just displays it. No logic inside.
//
// How to use it in another component:
//   <TaskSummaryCard title="Total Tasks" count={5} icon="📋" colorClass="bg-blue-50 text-blue-600" />
// ─────────────────────────────────────────────

import type { SummaryCard } from '../types';

// Props = the data this component needs from its parent
// We reuse the SummaryCard interface from types/index.ts
type TaskSummaryCardProps = SummaryCard;

export default function TaskSummaryCard({ title, count, icon, colorClass }: TaskSummaryCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 p-5 flex items-center gap-4">

      {/* Icon bubble — color changes based on the colorClass prop */}
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg shrink-0 transition-transform duration-300 group-hover:scale-110 ${colorClass}`}>
        {icon}
      </div>

      {/* Text section */}
      <div className="text-left">
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider m-0">{title}</p>
        <p className="text-2xl font-bold text-gray-900 m-0 mt-1 tracking-tight">{count}</p>
      </div>

    </div>
  );
}
