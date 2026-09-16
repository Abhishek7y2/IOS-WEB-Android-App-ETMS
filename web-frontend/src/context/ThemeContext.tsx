'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Theme = 'light' | 'dark';
export type ThemePreference = 'light' | 'dark' | 'auto';

// App ki current theme aur usko change karne ke sabhi available functions (Context ki type definition)
interface ThemeContextType {
  theme: Theme;
  themePreference: ThemePreference;
  setThemeManual: (theme: Theme) => void;
  resetToAuto: () => void;
}

const STORAGE_KEY = 'theme_preference';
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// System ka time check karke subah ke waqt (6am - 6pm) 'light' aur sham ke waqt 'dark' theme set karne ka logic
const getAutoTheme = (): Theme => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
};

const getStoredPreference = (): ThemePreference => {
  if (typeof window === 'undefined') return 'auto';
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'auto' ? stored : 'auto';
};

const resolveTheme = (preference: ThemePreference): Theme =>
  preference === 'auto' ? getAutoTheme() : preference;

// Asal me HTML ke tag par 'dark' class lagana taaki CSS me dark mode colors activate ho jayein
const applyThemeClass = (theme: Theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => getStoredPreference());
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
      return 'dark';
    }
    return resolveTheme(getStoredPreference());
  });

  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  // Agar user ne 'Auto' theme select ki hai toh time ke hisaab se theme update karna
  useEffect(() => {
    if (themePreference !== 'auto') return;

    const interval = window.setInterval(() => {
      const nextTheme = getAutoTheme();
      setTheme((current) => (current === nextTheme ? current : nextTheme));
    }, 60000);

    return () => window.clearInterval(interval);
  }, [themePreference]);

  const value = useMemo<ThemeContextType>(() => ({
    theme,
    themePreference,
    setThemeManual: (newTheme) => {
      localStorage.setItem(STORAGE_KEY, newTheme);
      setThemePreference(newTheme);
      setTheme(newTheme);
    },
    resetToAuto: () => {
      localStorage.setItem(STORAGE_KEY, 'auto');
      setThemePreference('auto');
      setTheme(getAutoTheme());
    },
  }), [theme, themePreference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

