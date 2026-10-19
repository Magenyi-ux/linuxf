/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards'
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#F5F7FB',
          100: '#EEF2F7',
          200: '#E2E8F0',
          500: '#4599FF',
          600: '#1B74E4',
          700: '#0866FF',
          900: '#0F172A',
        },
        primary: {
          50: '#F5F7FB',
          100: '#DCE9FF',
          500: '#4599FF',
          600: '#0866FF',
          700: '#1B74E4',
        },
        accent: {
          500: '#0F172A',
          600: '#050505',
        }
      }
    }
  },
  plugins: [],
}
