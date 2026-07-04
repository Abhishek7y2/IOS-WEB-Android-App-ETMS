// src/components/PriorityBadge.tsx
// Reusable colored pill badge for task priority.
// Color is auto-determined from the priority value — no hardcoding needed.

interface PriorityBadgeProps {
  priority: string;
}

// Maps each priority to its Tailwind color classes
const priorityStyles: Record<string, string> = {
  Critical: "bg-rose-50 text-rose-700 border border-rose-100/80",
  High: "bg-orange-50 text-orange-700 border border-orange-100/80",
  Medium: "bg-amber-50 text-amber-700 border border-amber-100/80",
  Low: "bg-slate-50 text-slate-600 border border-slate-200/60",
};

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const style = priorityStyles[priority] || "bg-gray-100 text-gray-600";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style}`}>
      {priority}
    </span>
  );
}
