'use client';

import React, { useEffect, useState } from 'react';

type TextScale = 'small' | 'normal' | 'large';

const scaleValues: Record<TextScale, string> = {
  small: '14px',
  normal: '16px',
  large: '18px',
};

export const AccessibilityToggle: React.FC = () => {
  const [scale, setScale] = useState<TextScale>('normal');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = window.localStorage.getItem('accessibility_scale') as TextScale;
    if (stored && scaleValues[stored]) {
      setScale(stored);
      document.documentElement.style.fontSize = scaleValues[stored];
    }
  }, []);

  const handleScaleChange = (newScale: TextScale) => {
    setScale(newScale);
    window.localStorage.setItem('accessibility_scale', newScale);
    document.documentElement.style.fontSize = scaleValues[newScale];
  };

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-1 rounded-xl border border-zinc-200/60 bg-zinc-100/50 p-1 shadow-sm transition-colors duration-300 dark:border-zinc-800/60 dark:bg-zinc-900/50">
      <button
        type="button"
        onClick={() => handleScaleChange('small')}
        className={`flex h-8 px-2 items-center justify-center rounded-lg transition-all duration-300 font-bold hover:bg-white hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:hover:bg-zinc-805 dark:hover:text-zinc-50 cursor-pointer text-xs ${
          scale === 'small'
            ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-800 dark:text-blue-400'
            : 'text-zinc-600 dark:text-zinc-400'
        }`}
        title="Decrease text size"
        aria-label="Decrease text size"
      >
        A-
      </button>
      <button
        type="button"
        onClick={() => handleScaleChange('normal')}
        className={`flex h-8 px-2 items-center justify-center rounded-lg transition-all duration-300 font-bold hover:bg-white hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:hover:bg-zinc-805 dark:hover:text-zinc-50 cursor-pointer text-sm ${
          scale === 'normal'
            ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-800 dark:text-blue-400'
            : 'text-zinc-600 dark:text-zinc-400'
        }`}
        title="Normal text size"
        aria-label="Normal text size"
      >
        A
      </button>
      <button
        type="button"
        onClick={() => handleScaleChange('large')}
        className={`flex h-8 px-2 items-center justify-center rounded-lg transition-all duration-300 font-bold hover:bg-white hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:hover:bg-zinc-805 dark:hover:text-zinc-50 cursor-pointer text-base ${
          scale === 'large'
            ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-800 dark:text-blue-400'
            : 'text-zinc-600 dark:text-zinc-400'
        }`}
        title="Increase text size"
        aria-label="Increase text size"
      >
        A+
      </button>
    </div>
  );
};
