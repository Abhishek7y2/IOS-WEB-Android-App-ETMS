'use client';

import React from 'react';
import { Moon, Sparkles, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, themePreference, setThemeManual, resetToAuto } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-xl border border-zinc-200/60 bg-zinc-100/50 p-1 shadow-sm transition-colors duration-300 dark:border-zinc-800/60 dark:bg-zinc-900/50">
      <button
        type="button"
        onClick={() => setThemeManual(theme === 'light' ? 'dark' : 'light')}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 hover:bg-white hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:hover:bg-zinc-805 dark:hover:text-zinc-50 cursor-pointer ${
          themePreference !== 'auto'
            ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-800 dark:text-blue-400'
            : 'text-zinc-600 dark:text-zinc-400'
        }`}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <Sun className="h-4.5 w-4.5 text-amber-500 animate-spin-slow" /> : <Moon className="h-4.5 w-4.5 text-indigo-400" />}
      </button>
      <button
        type="button"
        onClick={resetToAuto}
        className={`hidden sm:flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold tracking-wider transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 cursor-pointer ${
          themePreference === 'auto'
            ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-800 dark:text-blue-400'
            : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
        }`}
        title="Follow local time: light from 6 AM to 5:59 PM, dark from 6 PM to 5:59 AM"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Auto
      </button>
    </div>
  );
};
