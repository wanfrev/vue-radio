/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef6ff',
          100: '#d9eaff',
          200: '#bcd9ff',
          300: '#8ec0ff',
          400: '#599cff',
          500: '#3478f6',
          600: '#1f5ce0',
          700: '#1a48b5',
          800: '#193d8f',
          900: '#193572',
        },
        cyber: {
          cyan:    '#22d3ee',
          pink:    '#f472b6',
          purple:  '#a855f7',
          violet:  '#7c3aed',
          deep:    '#0a0a1f',
          mid:     '#1a0a2e',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-soft':  'pulse-soft 2.4s ease-in-out infinite',
        'spin-slow':   'spin 6s linear infinite',
        'spin-slower': 'spin 12s linear infinite',
        'float':       'float 6s ease-in-out infinite',
        'glow-pulse':  'glow-pulse 4s ease-in-out infinite',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4', filter: 'blur(40px)' },
          '50%':      { opacity: '0.8', filter: 'blur(60px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
