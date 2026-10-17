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
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#F5F5F3',
          100: '#EDEDEA',
          200: '#E1E3E3',
          500: '#788087',
          600: '#596168',
          700: '#454B50',
          900: '#25282B',
        },
        primary: {
          50: '#F5F5F3',
          100: '#E9EAE8',
          500: '#788087',
          600: '#454B50',
          700: '#30363B',
        },
        accent: {
          500: '#454B50',
          600: '#25282B',
        }
      }
    }
  },
  plugins: [],
}
