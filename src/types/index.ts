// ─────────────────────────────────────────────
// types/index.ts
// This file defines the "shape" of our data.
// TypeScript uses these to catch mistakes early.
// ─────────────────────────────────────────────

// A single task object
export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: 'Pending' | 'InProgress' | 'Completed' | 'OnHold';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate: Date;
  createdAt: Date;
}

// A single summary card (Total, Pending, etc.)
export interface SummaryCard {
  title: string;       // e.g. "Total Tasks"
  count: number;       // e.g. 5
  icon: string;        // emoji icon e.g. "📋"
  colorClass: string;  // Tailwind classes for the icon bubble background + text
}
