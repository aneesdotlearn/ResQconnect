/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: { DEFAULT: '#FCFAFB' },
        surface: {
          DEFAULT: '#0D0B10',
          gradientStart: '#2A0013',
          gradientEnd: '#0D0B10',
        },
        accent: {
          50: '#FFF1F7',
          100: '#FFD9E9',
          300: '#FF7BB0',
          400: '#FD2264',
          500: '#F20C63',
          600: '#FF2E7E',
          700: '#C4094F',
        },
        charcoal: '#111827',
        'text-secondary': '#D1D5DB',
        border: { DEFAULT: '#E9E9EF' },
        success: { 500: '#10B981' },
        warn: { 500: '#F59E0B' },
        error: { 50: '#FEF2F2', 500: '#EF4444', 600: '#DC2626' },
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'dark-gradient': 'linear-gradient(180deg, #2A0013 0%, #0D0B10 100%)',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(17, 24, 39, 0.08)',
        'neu-raised': '7px 7px 14px rgba(17, 24, 39, 0.12), -7px -7px 14px rgba(255, 255, 255, 0.9)',
        'neu-pressed': 'inset 4px 4px 8px rgba(17, 24, 39, 0.15), inset -4px -4px 8px rgba(255, 255, 255, 0.8)',
        'neu-fab': '10px 10px 22px rgba(178, 15, 79, 0.35), -8px -8px 18px rgba(255, 255, 255, 0.7)',
      },
      animation: {
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: { from: { transform: 'translateY(20px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
      },
    },
  },
  plugins: [],
};