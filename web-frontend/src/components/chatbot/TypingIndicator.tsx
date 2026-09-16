import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator = () => {
  return (
    <div className="flex w-full mb-6 justify-start">
      <div className="flex flex-row items-end gap-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-zinc-800 text-zinc-100 dark:bg-zinc-200 dark:text-zinc-900">
          <Bot size={16} />
        </div>
        <div className="px-4 py-3 rounded-2xl bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-bl-sm">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
