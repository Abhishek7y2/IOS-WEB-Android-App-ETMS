import React from 'react';
import { Inbox, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  onClearFilters?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No tasks found',
  message = 'Try adjusting your filters, search term, or select a different summary card.',
  onClearFilters,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950/40">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-500 dark:bg-zinc-900/60 dark:text-zinc-500 shadow-inner">
        <Inbox className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-zinc-100">{title}</h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-sm leading-relaxed">{message}</p>
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 px-4 py-2 text-sm font-semibold transition-all duration-300 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 dark:text-zinc-200 cursor-pointer shadow-sm border border-zinc-200/30 dark:border-zinc-800/30"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Clear Active Filters</span>
        </button>
      )}
    </div>
  );
};

