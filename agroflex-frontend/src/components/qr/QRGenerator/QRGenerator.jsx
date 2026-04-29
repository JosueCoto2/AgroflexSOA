/**
 * QRGenerator — Muestra el código QR de una orden para confirmar entrega.
 *
 * Uso:
 *   <QRGenerator
 *     tokenQr="TXN-2024-ABCD1234"
 *     estado="GENERADO"
 *     fechaExpiracion="2026-04-17T12:00:00"
 *     numeroOrden="AGF-000123"
 *     onRecargar={() => cargarQr()}
 *   />
 *
 * Props:
 *   tokenQr         string   Token único del QR (valor que se codifica)
 *   estado          string   'GENERADO' | 'ESCANEADO' | 'VALIDADO' | 'EXPIRADO' | 'INVALIDO'
 *   fechaExpiracion string   ISO 8601 — cuándo expira el QR
 *   numeroOrden     string   Número de orden legible (AGF-000123)
 *   loading         bool     Muestra skeleton mientras carga
 *   error           string   Mensaje de error si no se pudo obtener el QR
 *   onRecargar      func     Callback para reintentar la carga
 *   size            number   Tamaño del QR en px (default 220)
 */
import { useMemo, useState, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { ShieldCheck, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, Copy, Check } from 'lucide-react'
import PropTypes from 'prop-types'

// ─── Configuración visual por estado ────────────────────────────────────────
const ESTADO_CONFIG = {
  GENERADO: {
    badge:     'bg-slate-100 text-slate-600',
    label:     'Pendiente de escaneo',
    Icon:      Clock,
    iconColor: 'text-slate-400',
    qrOpacity: 'opacity-100',
  },
  ESCANEADO: {
    badge:     'bg-amber-100 text-amber-700',
    label:     'Escaneado — validando',
    Icon:      Clock,
    iconColor: 'text-amber-500',
    qrOpacity: 'opacity-80',
  },
  VALIDADO: {
    badge:     'bg-green-100 text-green-700',
    label:     'Entrega confirmada',
    Icon:      CheckCircle,
    iconColor: 'text-green-600',
    qrOpacity: 'opacity-50',
  },
  EXPIRADO: {
    badge:     'bg-red-100 text-red-600',
    label:     'QR expirado',
    Icon:      XCircle,
    iconColor: 'text-red-400',
    qrOpacity: 'opacity-30',
  },
  INVALIDO: {
    badge:     'bg-red-100 text-red-600',
    label:     'QR bloqueado',
    Icon:      AlertCircle,
    iconColor: 'text-red-500',
    qrOpacity: 'opacity-30',
  },
}

// ─── Skeleton de carga ───────────────────────────────────────────────────────
const QRSkeleton = ({ size }) => (
  <div className="flex flex-col items-center gap-4 w-full">
    <div
      className="bg-slate-100 rounded-2xl animate-pulse"
      style={{ width: size, height: size }}
    />
    <div className="h-4 w-32 bg-slate-100 rounded-full animate-pulse" />
    <div className="h-3 w-48 bg-slate-100 rounded-full animate-pulse" />
  </div>
)

// ─── Estado de error ─────────────────────────────────────────────────────────
const QRError = ({ mensaje, onRecargar }) => (
  <div className="flex flex-col items-center text-center py-8 px-4 gap-4">
    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
      <AlertCircle className="w-8 h-8 text-red-400" />
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-700 mb-1">No se pudo cargar el QR</p>
      <p className="text-xs text-slate-400">{mensaje}</p>
    </div>
    {onRecargar && (
      <button
        onClick={onRecargar}
        className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-semibold transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Reintentar
      </button>
    )}
  </div>
)

// ─── QR no disponible aún ────────────────────────────────────────────────────
const QRNoDisponible = () => (
  <div className="flex flex-col items-center text-center py-8 px-4 gap-3">
    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
      <Clock className="w-8 h-8 text-slate-300" />
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-600 mb-1">QR no disponible aún</p>
      <p className="text-xs text-slate-400 max-w-xs">
        El código QR se genera automáticamente cuando la orden es confirmada y el pago procesado.
      </p>
    </div>
  </div>
)

// ─── Componente principal ────────────────────────────────────────────────────
const QRGenerator = ({
  tokenQr,
  estado,
  fechaExpiracion,
  numeroOrden,
  loading,
  error,
  onRecargar,
  size,
}) => {
  const config = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.GENERADO
  const { Icon } = config
  const [copiado, setCopiado] = useState(false)

  const copiarToken = useCallback(() => {
    if (!tokenQr) return
    navigator.clipboard.writeText(tokenQr).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }).catch(() => {})
  }, [tokenQr])

  const expiracionFormateada = useMemo(() => {
    if (!fechaExpiracion) return null
    try {
      return new Date(fechaExpiracion).toLocaleString('es-MX', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
      })
    } catch {
      return null
    }
  }, [fechaExpiracion])

  const yaValidado = estado === 'VALIDADO'
  const expiradoOInvalido = estado === 'EXPIRADO' || estado === 'INVALIDO'

  if (loading) return <QRSkeleton size={size} />
  if (error) return <QRError mensaje={error} onRecargar={onRecargar} />
  if (!tokenQr) return <QRNoDisponible />

  return (
    <div className="flex flex-col items-center gap-5 w-full">

      {/* ── QR Image ─────────────────────────────────────────────────────── */}
      <div className={`relative bg-white p-5 rounded-2xl shadow-md transition-opacity ${config.qrOpacity}`}>
        <QRCodeSVG
          value={tokenQr}
          size={size}
          level="H"
          includeMargin
          fgColor="#1a5c2e"
        />

        {/* Overlay para estados terminales */}
        {(yaValidado || expiradoOInvalido) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-2xl">
            <Icon className={`w-14 h-14 ${config.iconColor}`} />
            <span className={`mt-2 text-xs font-bold px-3 py-1 rounded-full ${config.badge}`}>
              {config.label}
            </span>
          </div>
        )}
      </div>

      {/* ── Badge de estado ──────────────────────────────────────────────── */}
      {!yaValidado && !expiradoOInvalido && (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${config.badge}`}>
          <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
          {config.label}
        </span>
      )}

      {/* ── Instrucción (solo si el QR está activo) ──────────────────────── */}
      {!yaValidado && !expiradoOInvalido && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 w-full max-w-xs text-center">
          <ShieldCheck className="w-5 h-5 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-green-800 mb-1">
            Muéstrale este QR al comprador
          </p>
          <p className="text-xs text-green-600 leading-relaxed">
            El comprador lo escaneará al recibir el pedido para confirmar la entrega
            y liberar tu pago.
          </p>
        </div>
      )}

      {/* ── Código legible + Expiración ───────────────────────────────────── */}
      <div className="flex flex-col items-center gap-1 text-center">
        {numeroOrden && (
          <p className="text-xs font-mono text-slate-500 tracking-wide">{numeroOrden}</p>
        )}
        {expiracionFormateada && !expiradoOInvalido && (
          <p className="text-xs text-slate-400">
            Válido hasta: <span className="font-medium text-slate-500">{expiracionFormateada}</span>
          </p>
        )}
        {expiradoOInvalido && onRecargar && (
          <button
            onClick={onRecargar}
            className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 font-semibold transition-colors mt-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Solicitar nuevo QR
          </button>
        )}
      </div>

      {/* ── Código de entrega manual ─────────────────────────────────────── */}
      {tokenQr && !expiradoOInvalido && !yaValidado && (
        <div className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Código de entrega
          </p>
          <div className="flex items-center gap-2">
            <p className="flex-1 text-[11px] font-mono text-slate-700 break-all leading-relaxed">
              {tokenQr}
            </p>
            <button
              onClick={copiarToken}
              className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg px-2 py-1.5 transition-all active:scale-95"
              title="Copiar código"
            >
              {copiado
                ? <><Check className="w-3.5 h-3.5" /> Copiado</>  
                : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">
            El comprador puede escribir este código si no puede escanear el QR.
          </p>
        </div>
      )}
    </div>
  )
}

QRGenerator.propTypes = {
  tokenQr:         PropTypes.string,
  estado:          PropTypes.oneOf(['GENERADO', 'ESCANEADO', 'VALIDADO', 'EXPIRADO', 'INVALIDO']),
  fechaExpiracion: PropTypes.string,
  numeroOrden:     PropTypes.string,
  loading:         PropTypes.bool,
  error:           PropTypes.string,
  onRecargar:      PropTypes.func,
  size:            PropTypes.number,
}

QRGenerator.defaultProps = {
  tokenQr:         null,
  estado:          'GENERADO',
  fechaExpiracion: null,
  numeroOrden:     null,
  loading:         false,
  error:           null,
  onRecargar:      null,
  size:            220,
}

export default QRGenerator
