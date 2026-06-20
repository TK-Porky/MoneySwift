export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette MoneySwift
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
        // Neutrals
        surface: '#f8fafc',
        border:  '#e2e8f0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}