// ─── DESIGN SYSTEM — AgroFlex Brand Colors ───────────────────────────────────
// Paleta Verde #3BAF2A — color principal de AgroFlex

export const COLORS = {
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
  semantic: {
    success: '#3BAF2A',
    warning: '#F5A623',
    error:   '#DC2626',
    info:    '#2563EB',
    bg:      '#F6FCF4',
    surface: '#FFFFFF',
    border:  '#D0ECC8',
    text:    '#4A6E44',
    textMuted: '#7A9E72',
    textDark:  '#1A2E18',
  },
};

// ─── TIPOGRAFÍA ───────────────────────────────────────────────────────────────
export const FONTS = {
  display: ['Syne', 'system-ui', 'sans-serif'],           // h1/h2/h3/logos/precios
  sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'], // body/buttons/labels
  mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
}

export const TYPOGRAPHY = {
  fontFamily: FONTS,
  fontSize: {
    xs:    '11px',
    sm:    '12px',
    base:  '14px',
    md:    '16px',
    lg:    '20px',
    xl:    '24px',
    '2xl': '32px',
  },
  fontWeight: {
    regular:  '400',
    medium:   '500',
    semibold: '600',
    bold:     '700',
  },
  lineHeight: {
    tight:   '1.2',
    normal:  '1.6',
    relaxed: '1.7',
  },
  letterSpacing: {
    label: '0.06em',
    tight: '-0.02em',
  },
}

// ─── ESPACIADO ────────────────────────────────────────────────────────────────
export const SPACING = {
  xs:      '4px',
  sm:      '8px',
  md:      '12px',
  lg:      '16px',
  xl:      '20px',
  '2xl':   '24px',
  '3xl':   '32px',
  '4xl':   '48px',
  section: '24px',
  pagePad: '16px',
}

// ─── BORDER RADIUS ───────────────────────────────────────────────────────────
export const RADIUS = {
  sm:   '6px',
  md:   '8px',
  lg:   '12px',
  xl:   '16px',
  '2xl':'20px',
  '3xl':'24px',
  card: '20px',
  btn:  '12px',
  chip: '8px',
  fab:  '16px',
  full: '9999px',
}

// ─── SOMBRAS ─────────────────────────────────────────────────────────────────
export const SHADOWS = {
  none:      'none',
  sm:        '0 1px 4px rgba(59,175,42,0.06)',
  md:        '0 2px 12px rgba(59,175,42,0.07)',
  card:      '0 2px 12px rgba(59,175,42,0.07)',
  cardHover: '0 6px 24px rgba(59,175,42,0.14)',
  btn:       '0 4px 14px rgba(59,175,42,0.3)',
  fab:       '0 5px 18px rgba(59,175,42,0.4)',
  nav:       '0 1px 8px rgba(59,175,42,0.08)',
};

// ─── BREAKPOINTS (mobile-first) ───────────────────────────────────────────────
export const BREAKPOINTS = {
  sm:  '640px',
  md:  '768px',
  lg:  '1024px',
  xl:  '1280px',
}

// ─── TRANSICIONES ─────────────────────────────────────────────────────────────
export const TRANSITIONS = {
  fast:   'all 0.15s ease',
  normal: 'all 0.25s ease',
  slow:   'all 0.4s ease',
  spring: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
}

// ─── Z-INDEX ──────────────────────────────────────────────────────────────────
export const Z_INDEX = {
  base:    0,
  card:    10,
  sticky:  100,
  overlay: 200,
  modal:   300,
  toast:   400,
}
