/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/components/**/*.{js,vue,ts}",
    "./app/layouts/**/*.vue",
    "./app/pages/**/*.vue",
    "./app/plugins/**/*.{js,ts}",
    "./app/app.vue",
    "./app/error.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E40AF', // blue-800
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
        secondary: {
          DEFAULT: '#DC2626', // red-600
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
          950: '#450A0A',
        },
        graphic: {
          red: '#C82323',
          grey: '#F9F9F9',
          border: '#E5E5E5',
          text: '#1A1A1A',
          muted: '#888888',
          placeholder: '#BBBBBB'
        },
        raffle: {
          red: '#DC2626',
          gold: '#FBBF24',
          green: '#059669',
          black: '#000000',
        }
      },
      fontFamily: {
        sans: ['Sora', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
