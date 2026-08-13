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
          DEFAULT: '#209552', 
          50: '#ebfef2',
          100: '#d0fbe2',
          200: '#a4f4c8',
          300: '#6de7a7',
          400: '#34d386',
          500: '#209552',
          600: '#157740',
          700: '#135e35',
          800: '#124a2c',
          900: '#113d26',
          950: '#092214',
        },
        secondary: {
          DEFAULT: '#DCAE56', 
          50: '#fcf8ef',
          100: '#f8eed4',
          200: '#f1daa6',
          300: '#eac071',
          400: '#DCAE56',
          500: '#d98f2b',
          600: '#be6c22',
          700: '#9e4d20',
          800: '#813e21',
          900: '#68341f',
          950: '#3c1a0e',
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
