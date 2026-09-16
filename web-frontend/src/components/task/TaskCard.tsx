'use client';

import React, { useState } from 'react';
import { CalendarDays, ChevronDown, Pencil, Trash2, UserRound, Eye, Paperclip } from 'lucide-react';
import { Task } from '../../types';
import { formatDate } from '../../utils/format';
import { useTasks } from '../../context/TaskContext';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '../../context/AuthContext';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  onDelete?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onView?: (task: Task) => void;
}

const priorityColors = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900/80 dark:text-green-300 border-green-300 dark:border-green-700 font-bold shadow-sm',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-bold shadow-sm',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-bold shadow-sm',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/80 dark:text-red-300 border-red-300 dark:border-red-700 font-bold shadow-sm',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/80 dark:text-red-300 border-red-300 dark:border-red-700 font-bold shadow-sm',
};

const statuses: Array<{ value: Task['status']; label: string }> = [
  { value: 'todo', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onDelete, onEdit, onView }) => {
  const { employees } = useTasks();
  const { user } = useAuth();
  const isAdmin = (user?.role === 'admin' || user?.role === 'superadmin');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const employee = employees.find((emp) => emp.id === task.assignedTo);
  const employeeName = employee ? employee.name : 'Unassigned';

  const handleStatusChange = (status: Task['status']) => {
    onStatusChange?.(task.id, status);
    setIsStatusMenuOpen(false);
  };

  return (
    <article className="relative flex min-h-72 flex-col rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          <h3 className="text-base font-bold leading-snug text-zinc-950 transition-colors duration-300 dark:text-zinc-50">{task.title}</h3>
        </div>
        <StatusBadge status={task.status} />
      </div>

      <p className="mt-3 text-sm leading-6 text-zinc-600 transition-colors duration-300 dark:text-zinc-400 break-words">
        {(() => {
          if (!task.description) return 'No description provided.';
          if (task.description.length <= 25) return task.description;
          return task.description.slice(0, 25) + '...';
        })()}
      </p>

      <div className="mt-auto space-y-4 pt-5">
        <div className="grid gap-3 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600 transition-colors duration-300 dark:bg-zinc-900/70 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-zinc-500 dark:text-zinc-500" />
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {employeeName}{employee?.designation ? ` (${employee.designation})` : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-zinc-500 dark:text-zinc-500" />
            <span>Due {formatDate(task.dueDate)}</span>
          </div>
          {task.attachments && task.attachments.length > 0 && (
            <div className="flex items-center gap-1.5 font-bold text-teal-700 dark:text-teal-400 pt-1 border-t border-zinc-200/50 dark:border-zinc-800/50">
              <Paperclip className="h-3.5 w-3.5" />
              <span>{task.attachments.length} attachment(s)</span>
            </div>
          )}
        </div>

        <div className="flex w-full items-center justify-between gap-3 pt-4">
          {onStatusChange && (isAdmin || task.assignedTo === user?.id) && (
            <div className="relative min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setIsStatusMenuOpen((current) => !current)}
                aria-expanded={isStatusMenuOpen}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2 py-2 text-xs font-semibold text-zinc-800 shadow-sm transition-all duration-300 hover:border-blue-300 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-blue-700 dark:hover:border-blue-300"
              >
                Change Status
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${isStatusMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isStatusMenuOpen && (
                <div className="absolute bottom-11 left-0 z-20 w-full overflow-hidden rounded-lg border border-zinc-200 bg-white p-1 shadow-lg transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-950">
                  {statuses.map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => handleStatusChange(status.value)}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs font-semibold transition-colors duration-200 ${task.status === status.value
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                          : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50'
                        }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            {onView && (
              <button
                type="button"
                onClick={() => onView(task)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 dark:text-emerald-450 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-300 cursor-pointer"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </button>
            )}
            {isAdmin && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(task)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-white px-2.5 py-2 text-xs font-semibold text-blue-600 transition-colors duration-300 hover:border-blue-350 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:border-blue-900/60 dark:bg-zinc-900 dark:text-blue-400 dark:hover:border-blue-700 dark:hover:bg-blue-950/20 dark:hover:text-blue-300"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
            {isAdmin && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(task)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-500 transition-colors duration-300 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                aria-label={`Delete ${task.title}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
