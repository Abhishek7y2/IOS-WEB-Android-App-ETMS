import React, { createContext, useContext, useState, useEffect } from 'react';
import { getItem, setItem } from '../services/storage';

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  // Base properties
  bg: string;
  cardBg: string;
  headerBg: string;
  textPrimary: string;
  textSecondary: string;
  borderColor: string;
  accent: string;
  accentLight: string;

  // Semantic and modern alias tokens
  background: string;
  card: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
}

const darkColors: ThemeColors = {
  bg: '#0f172a',
  cardBg: '#1e293b',
  headerBg: '#0f172a',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  borderColor: '#334155',
  accent: '#14b8a6',
  accentLight: '#134e4a66',

  background: '#0f172a',
  card: '#1e293b',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  border: '#334155',
  primary: '#14b8a6',
  primaryLight: '#2dd4bf',
  secondary: '#64748b',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#38bdf8',
};

const lightColors: ThemeColors = {
  bg: '#f8fafc',
  cardBg: '#ffffff',
  headerBg: '#ffffff',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  borderColor: '#e2e8f0',
  accent: '#0d9488',
  accentLight: '#f0fdfa',

  background: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  textMuted: '#64748b',
  border: '#e2e8f0',
  primary: '#0d9488',
  primaryLight: '#ccfbf1',
  secondary: '#94a3b8',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#0284c7',
};

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    getItem('app_theme_mode').then((saved: string | null) => {
      if (saved === 'light' || saved === 'dark') {
        setMode(saved);
      }
    });
  }, []);

  const toggleTheme = () => {
    const nextMode = mode === 'dark' ? 'light' : 'dark';
    setMode(nextMode);
    setItem('app_theme_mode', nextMode);
  };

  const colors = mode === 'dark' ? darkColors : lightColors;
  const isDark = mode === 'dark';

  return (
    <ThemeContext.Provider value={{ mode, isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
