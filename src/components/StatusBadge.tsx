// src/components/StatusBadge.tsx
// Reusable colored pill badge for task status.
// Color is auto-determined from the status value — no hardcoding needed.

interface StatusBadgeProps {
  status: string;
}

// Maps each status to its Tailwind color classes
const statusStyles: Record<string, string> = {
  Completed: "bg-emerald-50 text-emerald-700 border border-emerald-100/80",
  InProgress: "bg-indigo-50 text-indigo-700 border border-indigo-100/80",
  Pending: "bg-amber-50 text-amber-700 border border-amber-100/80",
  OnHold: "bg-slate-50 text-slate-600 border border-slate-200/60",
};

// Formats "InProgress" → "In Progress" for display
function formatStatus(status: string): string {
  return status.replace(/([A-Z])/g, " $1").trim();
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status] || "bg-gray-100 text-gray-600";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style}`}>
      {formatStatus(status)}
    </span>
  );
}
