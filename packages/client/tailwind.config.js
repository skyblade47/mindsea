/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', '"STSong"', 'SimSun', 'serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      colors: {
        deep: {
          900: '#050510',
          800: '#0a0a1a',
          700: '#0f0f2a',
          600: '#151540',
          500: '#1a1a50',
        },
        abyss: {
          DEFAULT: '#06061a',
          light: '#0c0c30',
          dark: '#030310',
        },
        gold: {
          DEFAULT: '#d4a853',
          light: '#e8c97a',
          dark: '#a07830',
        },
        cyan: {
          DEFAULT: '#5bc0de',
          light: '#8ad4ee',
          dark: '#3a8ca8',
        },
        mist: {
          50: '#f0f0f5',
          100: '#d4d4e0',
          200: '#b8b8cc',
          300: '#8a8aa3',
          400: '#6b6b85',
          500: '#4d4d66',
          600: '#3a3a50',
          700: '#2a2a3d',
          800: '#1a1a2e',
          900: '#0d0d1a',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'typing-cursor': 'blink 1s step-end infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(212, 168, 83, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(212, 168, 83, 0.6)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};