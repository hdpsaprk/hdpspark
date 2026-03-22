/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Lora', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        page: '#FAF9F5',
        surface: '#FFFFFF',
        card: '#FFFFFF',
        'card-inner': '#F3F0E8',
        'border-default': '#E8E6DC',
        'border-hover': '#D4D0C4',
        'border-active': '#D97757',
        accent: '#D97757',
        'accent-bg': '#D9775712',
        'accent-dark': '#C4623F',
        dark: '#141413',
      },
    },
  },
  plugins: [],
};
