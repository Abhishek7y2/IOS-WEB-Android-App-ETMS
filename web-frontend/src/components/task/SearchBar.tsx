import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search tasks...',
  className = '',
}) => {
  return (
    <div className={`relative flex-1 ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-10 py-2 text-sm font-medium text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-500"
      />
      <div className="absolute left-3.5 top-2.5 text-zinc-500 dark:text-zinc-500">
        <Search className="h-4.5 w-4.5" />
      </div>
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3.5 top-2.5 text-zinc-500 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer"
          title="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

