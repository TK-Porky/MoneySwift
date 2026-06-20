export const colors = {
  primary: {
    50:  '#eef9ff',
    100: '#d8f1ff',
    200: '#b9e7ff',
    300: '#89daff',
    400: '#52c4ff',
    500: '#2aa5ff',
    600: '#1485f5',
    700: '#0d6de1',
    800: '#1258b6',
    900: '#144d8f',
    950: '#112f57',
  },
  success: {
    50:  '#f0fdf4',
    500: '#22c55e',
    700: '#15803d',
  },
  warning: {
    50:  '#fffbeb',
    500: '#f59e0b',
    700: '#b45309',
  },
  danger: {
    50:  '#fef2f2',
    500: '#ef4444',
    700: '#b91c1c',
  },
  surface: '#f8fafc',
  border:  '#e2e8f0',
} as const

export type ColorTheme = typeof colors
export type ColorPalette = keyof ColorTheme
