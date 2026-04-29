/**
 * ResultadoValidacion — Muestra el resultado de la validación QR.
 */
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle, AlertCircle, ShieldAlert, WifiOff,
  ArrowRight, RefreshCw,
} from 'lucide-react'
import { ROUTES } from '../../../routes/routeConfig'

const ERROR_CONFIG = {
  INVALID_TOKEN: {
    icon: AlertCircle,
    iconColor: 'text-red-500',
    bgColor:   'bg-red-50',
    titulo:    'Código QR no válido',
    mensaje:   'Este código QR no corresponde a ninguna transacción activa.',
  },
  ALREADY_USED: {
    icon: ShieldAlert,
    iconColor: 'text-ambar-500',
    bgColor:   'bg-ambar-50',
    titulo:    'Código QR ya utilizado',
    mensaje:   'Este código ya fue escaneado previamente.',
  },
  NETWORK_ERROR: {
    icon: WifiOff,
    iconColor: 'text-tinta-500',
    bgColor:   'bg-tinta-100',
    titulo:    'Sin conexión a internet',
    mensaje:   'La validación requiere conexión activa. Verifica tu red e inténtalo de nuevo.',
  },
  UNKNOWN: {
    icon: AlertCircle,
    iconColor: 'text-red-500',
    bgColor:   'bg-red-50',
    titulo:    'Error al validar',
    mensaje:   'Ocurrió un error inesperado. Por favor intenta de nuevo.',
  },
}

export default function ResultadoValidacion({ resultado, onReintentar }) {
  const navigate = useNavigate()

  if (resultado?.ok) {
    const d = resultado.data
    return (
      <div className="flex flex-col items-center text-center py-10 px-6 max-w-sm mx-auto">
        <div className="w-20 h-20 bg-verde-50 rounded-card flex items-center justify-center mb-5 animate-[bounce_0.6s_ease-out]">
          <CheckCircle className="w-10 h-10 text-verde-500" />
        </div>
        <h2 className="text-xl font-bold text-tinta-900 mb-1 font-display">
          ¡Entrega validada!
        </h2>
        <p className="text-sm text-tinta-500 mb-1">El pago ha sido liberado al vendedor.</p>

        {d && (
          <div className="w-full bg-verde-50 border border-verde-100 rounded-card p-4 mt-4 text-left space-y-1.5">
            {d.nombreProducto && (
              <Row label="Producto" value={d.nombreProducto} />
            )}
            {d.montoLiberado && (
              <Row label="Monto liberado" value={`$${Number(d.montoLiberado).toLocaleString('es-MX')} MXN`} />
            )}
            {d.fechaValidacion && (
              <Row label="Fecha" value={new Date(d.fechaValidacion).toLocaleString('es-MX')} />
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 w-full mt-6">
          <button
            onClick={() => navigate(ROUTES.MIS_PEDIDOS)}
            className="flex items-center justify-center gap-2 py-3 bg-verde-400 hover:bg-verde-500 text-white text-sm font-bold rounded-btn transition-all active:scale-95"
          >
            Ver mis pedidos
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(ROUTES.CATALOG)}
            className="py-3 border border-tinta-200 text-tinta-600 text-sm font-semibold rounded-btn hover:bg-tinta-50 transition-all"
          >
            Ir al catálogo
          </button>
        </div>
      </div>
    )
  }

  const errorTipo = resultado?.errorTipo ?? 'UNKNOWN'
  const cfg = ERROR_CONFIG[errorTipo] ?? ERROR_CONFIG.UNKNOWN
  const ErrorIcon = cfg.icon
  const usadoEn = resultado?.data?.usadoEn

  return (
    <div className="flex flex-col items-center text-center py-10 px-6 max-w-sm mx-auto">
      <div className={`w-20 h-20 ${cfg.bgColor} rounded-card flex items-center justify-center mb-5`}>
        <ErrorIcon className={`w-10 h-10 ${cfg.iconColor}`} />
      </div>
      <h2 className="text-base font-bold text-tinta-800 mb-2">{cfg.titulo}</h2>
      <p className="text-sm text-tinta-500 max-w-xs mb-2 leading-relaxed">{cfg.mensaje}</p>

      {errorTipo === 'ALREADY_USED' && usadoEn && (
        <p className="text-xs text-ambar-700 bg-ambar-50 px-3 py-1.5 rounded-chip mb-4">
          Utilizado el {new Date(usadoEn).toLocaleString('es-MX')}
        </p>
      )}

      <button
        onClick={onReintentar}
        className="flex items-center gap-2 px-5 py-2.5 bg-tinta-800 hover:bg-tinta-900 text-white text-sm font-semibold rounded-btn transition-all active:scale-95 mt-2"
      >
        <RefreshCw className="w-4 h-4" />
        Intentar de nuevo
      </button>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-tinta-500">{label}</span>
      <span className="font-semibold text-tinta-800">{value}</span>
    </div>
  )
}
