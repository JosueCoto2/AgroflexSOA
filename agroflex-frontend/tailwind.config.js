/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        verde: {
          50:  '#F0FBEE',
          100: '#D8F5D0',
          200: '#A8EE9A',
          300: '#6DD45A',
          400: '#3BAF2A',
          500: '#2A8A1C',
          600: '#1F6B14',
          700: '#174F0E',
        },
        campo: {
          50:  '#F6FCF4',
          100: '#EAF9E4',
          200: '#D0ECC8',
          300: '#A8C8A0',
          400: '#7A9E72',
          500: '#4A6E44',
          600: '#2A4828',
          700: '#1A2E18',
        },
        ambar: {
          50:  '#FFF8E8',
          100: '#FFE8A8',
          400: '#F5A623',
          500: '#E09010',
          700: '#A06408',
        },
        info: {
          50:  '#EFF6FF',
          400: '#60A5FA',
          600: '#2563EB',
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'hero':  ['30px', { lineHeight:'1.1', letterSpacing:'-0.8px', fontWeight:'800' }],
        'h1':    ['24px', { lineHeight:'1.2', letterSpacing:'-0.5px', fontWeight:'700' }],
        'h2':    ['19px', { lineHeight:'1.3', letterSpacing:'-0.3px', fontWeight:'700' }],
        'h3':    ['15px', { lineHeight:'1.4', letterSpacing:'-0.2px', fontWeight:'700' }],
        'body':  ['13px', { lineHeight:'1.6', fontWeight:'400' }],
        'sm':    ['12px', { lineHeight:'1.5' }],
        'xs':    ['11px', { lineHeight:'1.4' }],
        'label': ['9px',  { lineHeight:'1.3', letterSpacing:'0.8px', fontWeight:'600' }],
      },
      borderRadius: {
        'card':  '18px',
        'btn':   '13px',
        'chip':  '10px',
        'badge': '7px',
        'fab':   '14px',
        'icon':  '11px',
      },
      boxShadow: {
        'card':        '0 2px 12px rgba(59,175,42,0.07)',
        'card-hover':  '0 6px 24px rgba(59,175,42,0.14)',
        'btn':         '0 4px 14px rgba(59,175,42,0.3)',
        'fab':         '0 5px 18px rgba(59,175,42,0.4)',
        'input-focus': '0 0 0 3px rgba(59,175,42,0.12)',
        'nav':         '0 1px 8px rgba(59,175,42,0.08)',
      },
      animation: {
        'fade-up': 'fadeUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'pulse-g': 'pulseG 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:  { '0%':{ opacity:'0', transform:'translateY(10px)' }, '100%':{ opacity:'1', transform:'translateY(0)' } },
        fadeIn:  { '0%':{ opacity:'0' }, '100%':{ opacity:'1' } },
        pulseG:  { '0%,100%':{ boxShadow:'0 0 0 0 rgba(59,175,42,0.3)' }, '50%':{ boxShadow:'0 0 0 8px rgba(59,175,42,0)' } },
      },
    },
  },
  plugins: [],
};
