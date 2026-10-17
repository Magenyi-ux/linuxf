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
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          900: '#172033',
        },
        primary: {
          50: '#F4F7FB',
          100: '#EAF0F7',
          500: '#334155',
          600: '#18243A',
          700: '#101827',
        },
        accent: {
          500: '#1F1B12',
          600: '#11100B',
        },
        midnight: {
          900: '#101827',
          800: '#18243A',
          700: '#243249',
        },
        light: {
          50: '#F4F7FB',
          100: '#EAF0F7',
          200: '#E2E8F0',
        }
      }
    }
  },
  plugins: [],
}
