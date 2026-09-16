import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="w-full space-y-4 animate-pulse">
      {/* Skeleton Header */}
      <div className="h-10 w-full rounded-lg bg-zinc-200 dark:bg-zinc-800"></div>
      
      {/* Skeleton Rows */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-zinc-200 py-4 dark:border-zinc-800"
          >
            <div className="space-y-2">
              <div className="h-4.5 w-48 rounded bg-zinc-200 dark:bg-zinc-700"></div>
              <div className="h-3.5 w-64 rounded bg-zinc-200 dark:bg-zinc-800/80"></div>
            </div>
            <div className="flex gap-4">
              <div className="h-5 w-16 rounded bg-zinc-200 dark:bg-zinc-800"></div>
              <div className="h-5 w-20 rounded bg-zinc-200 dark:bg-zinc-800"></div>
              <div className="h-5.5 w-14 rounded bg-zinc-200 dark:bg-zinc-800"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

