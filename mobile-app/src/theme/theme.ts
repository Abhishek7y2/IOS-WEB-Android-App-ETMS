import { darkColors, lightColors, ThemeColors } from './colors';

export interface Theme {
  mode: 'dark' | 'light' | 'slate';
  colors: ThemeColors;
}

export const getTheme = (mode: 'dark' | 'light' | 'slate'): Theme => {
  const isLight = mode === 'light';
  return {
    mode,
    colors: isLight ? lightColors : darkColors,
  };
};
