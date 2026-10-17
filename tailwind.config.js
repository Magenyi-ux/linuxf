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
          50: '#FFF9E8',
          100: '#FFF1BF',
          200: '#FDE68A',
          500: '#F7C948',
          600: '#D9A514',
          700: '#9A6B00',
          900: '#1F1B12',
        },
        primary: {
          50: '#FFF9E8',
          100: '#FFF1BF',
          500: '#F7C948',
          600: '#E5B51B',
          700: '#B8860B',
        },
        accent: {
          500: '#1F1B12',
          600: '#11100B',
        }
      }
    }
  },
  plugins: [],
}
