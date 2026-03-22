/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        page: '#0A0E1A',
        surface: '#111827',
        card: '#161D2E',
        'card-inner': '#1E293B',
        'border-default': '#1F2D45',
        'border-hover': '#2D4A6B',
        'border-active': '#3B82F6',
        accent: '#3B82F6',
        'accent-bg': '#1E3A5F',
      },
    },
  },
  plugins: [],
};
