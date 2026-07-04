// src/components/TaskTable.tsx
// Renders a table of tasks with badges, avatars, and empty-state handling.
// All data is driven by props — nothing is hardcoded.

import type { Task } from "../types";
import { tasks as mockTasks } from "../data/tasks";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import Avatar from "./Avatar";

interface TaskTableProps {
  /** Optional tasks to render; defaults to mock data */
  tasks?: Task[];
}

export default function TaskTable({ tasks }: TaskTableProps) {
  const rows = tasks && tasks.length > 0 ? tasks : mockTasks;

  // Empty state
  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-gray-500 font-medium m-0">No tasks available.</p>
        <p className="text-gray-400 text-sm m-0 mt-1">Create a new task to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
      {/* Table header label */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="text-left">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider m-0">Recent Tasks</h3>
          <p className="text-[11px] text-gray-400 m-0 mt-1">{rows.length} tasks assigned</p>
        </div>
        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
          Live Sync
        </span>
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="bg-gray-50/30">
              <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Title</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assignee</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {rows.map((task) => (
              <tr
                key={task.id}
                className="hover:bg-indigo-50/10 transition-colors duration-200 cursor-pointer group"
              >
                <td className="px-6 py-4 text-left">
                  <p className="text-sm font-semibold text-gray-800 m-0 group-hover:text-indigo-600 transition-colors duration-200">{task.title}</p>
                  <p className="text-xs text-gray-400 m-0 mt-1 truncate max-w-xs">{task.description}</p>
                </td>
                <td className="px-6 py-4 text-left">
                  <Avatar name={task.assignedTo} />
                </td>
                <td className="px-6 py-4 text-left">
                  <StatusBadge status={task.status} />
                </td>
                <td className="px-6 py-4 text-left">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="px-6 py-4 text-left text-xs font-medium text-gray-500">
                  {task.dueDate instanceof Date
                    ? task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 text-left text-xs font-medium text-gray-400">
                  {task.createdAt instanceof Date
                    ? task.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
