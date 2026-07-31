/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // 60% — base background
        base: {
          DEFAULT: '#F8FAFC',
          50: '#FFFFFF',
          100: '#F8FAFC',
          200: '#EEF2F6',
        },
        // 30% — primary (navy blue): navbar, cards, buttons, icons, headings
        primary: {
          50: '#EFF3FC',
          100: '#D7E1F6',
          200: '#AFC3ED',
          300: '#7A9BDE',
          400: '#3F63BD',
          500: '#1E3A8A',
          600: '#1A3277',
          700: '#152A63',
          800: '#10214F',
          900: '#0B1836',
        },
        // 10% — accent (deep red): SOS, emergency alerts, danger indicators
        danger: {
          50: '#FDECEC',
          100: '#FAD1D1',
          200: '#F3A3A3',
          300: '#E97575',
          400: '#D14747',
          500: '#B91C1C',
          600: '#9B1717',
          700: '#7D1212',
          800: '#5E0D0D',
          900: '#400909',
        },
        safe: { 400: '#68d391', 500: '#48bb78', 600: '#38a169' },
        warn: { 400: '#f6ad55', 500: '#ed8936', 600: '#dd6b20' },
        // Text
        charcoal: '#111827',
        neutral: { 50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 800: '#1F2937', 900: '#111827' },
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
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