/**
 * AgroFlexLogo — Logo reutilizable de AgroFlex.
 *
 * Props:
 *   size      — 'sm' | 'md' | 'lg'  (default: 'md')
 *   variant   — 'light' | 'dark'    (light = texto blanco para fondos oscuros,
 *                                    dark  = texto oscuro para fondos claros)
 *   showText  — boolean             (default: true)
 *   className — string extra para el wrapper
 */
const SIZES = {
  sm: { img: 'h-9 w-auto'  },
  md: { img: 'h-12 w-auto' },
  lg: { img: 'h-16 w-auto' },
}

export default function AgroFlexLogo({
  size      = 'md',
  variant   = 'light',
  showText  = false,
  className = '',
}) {
  const s         = SIZES[size] ?? SIZES.md
  const textColor = variant === 'light' ? 'text-white' : 'text-slate-900'

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src="/images/logo.png"
        alt="AgroFlex"
        className={`${s.img} object-contain flex-shrink-0`}
        draggable={false}
      />
      {showText && (
        <span
          className={`text-xl font-bold tracking-tight font-display ${textColor}`}
        >
          AgroFlex
        </span>
      )}
    </span>
  )
}
