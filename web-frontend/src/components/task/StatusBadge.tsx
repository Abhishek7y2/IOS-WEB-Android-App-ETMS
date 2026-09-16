import React from 'react';
import { TaskStatus } from '../../types';

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const statusConfig = {
    todo: {
      label: 'Pending',
      classes: 'bg-slate-100 text-slate-700 dark:bg-slate-900/80 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-bold shadow-sm',
    },
    in_progress: {
      label: 'In Progress',
      classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-bold shadow-sm',
    },
    'in-progress': {
      label: 'In Progress',
      classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-bold shadow-sm',
    },
    completed: {
      label: 'Completed',
      classes: 'bg-green-100 text-green-700 dark:bg-green-900/80 dark:text-green-300 border-green-300 dark:border-green-700 font-bold shadow-sm',
    },
    overdue: {
      label: 'Overdue',
      classes: 'bg-red-100 text-red-700 dark:bg-red-900/80 dark:text-red-300 border-red-300 dark:border-red-700 font-bold shadow-sm',
    },
  };

  const config = statusConfig[status] || statusConfig.todo;

  return (
    <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[11px] transition-colors duration-300 ${config.classes} ${className}`}>
      {config.label}
    </span>
  );
};

