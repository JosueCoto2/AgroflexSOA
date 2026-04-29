/**
 * QRScanner — Escáner QR autocontenido y reutilizable.
 *
 * A diferencia de EscanearQR (página completa), este componente puede
 * embeberse en cualquier contexto (modal, card, sección de una página).
 *
 * Uso:
 *   <QRScanner
 *     onResult={(token) => console.log('Token escaneado:', token)}
 *     lat={19.432}
 *     lng={-99.133}
 *     compact
 *   />
 *
 * Props:
 *   onResult   func     Callback con el token decodificado (string)
 *   lat        number   Latitud GPS actual (opcional, para validación geo)
 *   lng        number   Longitud GPS actual (opcional)
 *   compact    bool     Modo compacto (sin instrucciones extendidas)
 *   autoStart  bool     Solicitar cámara automáticamente al montar
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import {
  Camera, CameraOff, FlipHorizontal, Keyboard,
  QrCode, Loader2, X,
} from 'lucide-react'
import PropTypes from 'prop-types'

let _instanceCount = 0

// ─── Estilos del overlay de guía ────────────────────────────────────────────
const Corner = ({ pos }) => {
  const corners = {
    tl: 'top-0 left-0 border-t-4 border-l-4 rounded-tl-xl',
    tr: 'top-0 right-0 border-t-4 border-r-4 rounded-tr-xl',
    bl: 'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl',
    br: 'bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl',
  }
  return <span className={`absolute w-8 h-8 border-verde-400 ${corners[pos]}`} />
}

// ─── Vista: solicitar permiso ────────────────────────────────────────────────
const PantallaPermiso = ({ onSolicitar, onManual, compact }) => (
  <div className={`flex flex-col items-center text-center ${compact ? 'py-6 px-4' : 'py-10 px-6'}`}>
    <div className="w-16 h-16 bg-verde-50 rounded-card flex items-center justify-center mb-4 animate-pulse">
      <Camera className="w-8 h-8 text-verde-500" />
    </div>
    {!compact && (
      <p className="text-xs text-tinta-500 max-w-xs mb-5 leading-relaxed">
        Necesitamos acceso a tu cámara para escanear el código QR de entrega.
      </p>
    )}
    <div className={`flex ${compact ? 'flex-row gap-2' : 'flex-col gap-2 w-full max-w-xs'}`}>
      <button
        onClick={onSolicitar}
        className="flex items-center justify-center gap-2 px-5 py-3 bg-verde-400 hover:bg-verde-500 text-white text-sm font-bold rounded-btn transition-all active:scale-95 min-h-[44px]"
      >
        <Camera className="w-4 h-4" />
        Activar cámara
      </button>
      {onManual && (
        <button
          onClick={onManual}
          className="px-5 py-3 border border-tinta-200 text-tinta-600 hover:bg-tinta-50 text-sm font-semibold rounded-btn transition-all min-h-[44px]"
        >
          Código manual
        </button>
      )}
    </div>
  </div>
)

// ─── Vista: permiso denegado ─────────────────────────────────────────────────
const PantallaDenegado = ({ onManual }) => (
  <div className="flex flex-col items-center text-center py-8 px-6">
    <div className="w-16 h-16 bg-red-50 rounded-card flex items-center justify-center mb-4">
      <CameraOff className="w-8 h-8 text-red-400" />
    </div>
    <p className="text-sm font-semibold text-tinta-800 mb-1">Cámara bloqueada</p>
    <p className="text-xs text-tinta-500 max-w-xs mb-5 leading-relaxed">
      Habilita el permiso de cámara en la configuración de tu navegador o ingresa
      el código manualmente.
    </p>
    {onManual && (
      <button
        onClick={onManual}
        className="px-5 py-3 bg-tinta-800 hover:bg-tinta-900 text-white text-sm font-semibold rounded-btn transition-all min-h-[44px]"
      >
        Ingresar código manualmente
      </button>
    )}
  </div>
)

// ─── Vista: entrada manual ───────────────────────────────────────────────────
const EntradaManualInline = ({ onValidar, onVolver, isValidating }) => {
  const [codigo, setCodigo] = useState('')
  const tooShort = codigo.trim().length > 0 && codigo.trim().length < 6

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!codigo.trim() || isValidating) return
    onValidar(codigo.trim())
  }

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 gap-4">
      <div className="w-12 h-12 bg-tinta-100 rounded-card flex items-center justify-center">
        <Keyboard className="w-6 h-6 text-tinta-400" />
      </div>
      <p className="text-xs text-tinta-500 text-center max-w-xs">
        Escribe el código que aparece debajo del QR del productor.
      </p>
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-2">
        <input
          type="text"
          value={codigo}
          onChange={e => setCodigo(e.target.value)}
          placeholder="Ej: TXN-2024-ABCD1234"
          autoFocus
          className={[
            'w-full px-4 py-3 text-sm border rounded-card bg-white text-tinta-800 font-mono',
            'outline-none focus:ring-2 focus:ring-verde-500/30 focus:border-verde-400 transition-all min-h-[44px]',
            tooShort ? 'border-red-300 bg-red-50' : 'border-tinta-200',
          ].join(' ')}
        />
        {tooShort && (
          <p className="text-xs text-red-500">Mínimo 6 caracteres.</p>
        )}
        <button
          type="submit"
          disabled={!codigo.trim() || tooShort || isValidating}
          className="w-full flex items-center justify-center gap-2 py-3 bg-verde-400 hover:bg-verde-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-btn transition-all active:scale-95 min-h-[44px]"
        >
          {isValidating
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando…</>
            : 'Validar código'
          }
        </button>
      </form>
      {onVolver && (
        <button
          onClick={onVolver}
          className="text-xs text-tinta-400 hover:text-tinta-600 transition-colors"
        >
          ← Volver al escáner
        </button>
      )}
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────
const QRScanner = ({ onResult, lat, lng, compact, autoStart }) => {
  // ID único por instancia para evitar conflictos si hay varios montados
  const [elementId] = useState(() => {
    _instanceCount += 1
    return `qr-scanner-${_instanceCount}`
  })

  const [estado, setEstado] = useState('idle') // idle | requesting | denied | scanning | validating | manual
  const [facingMode, setFacingMode] = useState('environment')
  const scannerRef = useRef(null)

  // ── Detener escáner ──────────────────────────────────────────────────────
  const detener = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop() } catch { /* ya detenido */ }
      try { scannerRef.current.clear() }      catch { /* ignorar */     }
      scannerRef.current = null
    }
  }, [])

  useEffect(() => () => { detener() }, [detener])

  // ── Solicitar permiso ────────────────────────────────────────────────────
  const solicitarPermiso = useCallback(async () => {
    setEstado('requesting')
    try {
      await navigator.mediaDevices.getUserMedia({ video: true })
      setEstado('scanning')
    } catch {
      setEstado('denied')
    }
  }, [])

  // autoStart al montar
  useEffect(() => {
    if (autoStart) {
      if (!navigator.permissions) { solicitarPermiso(); return }
      navigator.permissions.query({ name: 'camera' }).then(perm => {
        if (perm.state === 'granted') solicitarPermiso()
      }).catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Iniciar escáner ──────────────────────────────────────────────────────
  useEffect(() => {
    if (estado !== 'scanning') return

    let cancelled = false
    const html5Qrcode = new Html5Qrcode(elementId)
    scannerRef.current = html5Qrcode

    html5Qrcode.start(
      { facingMode },
      { fps: 10, qrbox: { width: 230, height: 230 }, formatsToSupport: [0] },
      async (decodedText) => {
        if (cancelled) return
        await detener()
        if (onResult) onResult(decodedText)
      },
      () => {}
    ).catch(() => {
      if (!cancelled) setEstado('denied')
    })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, facingMode, elementId])

  // ── Cambiar cámara ───────────────────────────────────────────────────────
  const cambiarCamara = async () => {
    await detener()
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
    setEstado('scanning')
  }

  const isValidating = estado === 'validating'
  const isScanning   = estado === 'scanning'

  // ── Render ───────────────────────────────────────────────────────────────
  if (estado === 'idle' || estado === 'requesting') {
    return (
      <PantallaPermiso
        onSolicitar={solicitarPermiso}
        onManual={() => setEstado('manual')}
        compact={compact}
      />
    )
  }

  if (estado === 'denied') {
    return <PantallaDenegado onManual={() => setEstado('manual')} />
  }

  if (estado === 'manual') {
    return (
      <EntradaManualInline
        onValidar={(token) => { if (onResult) onResult(token) }}
        onVolver={() => setEstado('idle')}
        isValidating={isValidating}
      />
    )
  }

  // Estado scanning / validating
  return (
    <div className="flex flex-col items-center gap-4 w-full">

      {/* ── Visor ──────────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-sm">
        <div
          id={elementId}
          className="w-full aspect-square rounded-card overflow-hidden bg-black"
        />

        {/* Overlay de guía */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-52 h-52 border-2 border-white/50 rounded-card relative">
            <Corner pos="tl" />
            <Corner pos="tr" />
            <Corner pos="bl" />
            <Corner pos="br" />
            {isScanning && (
              <div className="absolute inset-x-2 h-0.5 bg-verde-400/80 rounded-full animate-[scan_2s_ease-in-out_infinite]" />
            )}
          </div>
        </div>

        {/* Overlay validating */}
        {isValidating && (
          <div className="absolute inset-0 bg-tinta-900/70 rounded-card flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 text-verde-400 animate-spin" />
            <p className="text-sm text-white font-semibold">Validando…</p>
          </div>
        )}
      </div>

      {/* ── Instrucción ────────────────────────────────────────────────── */}
      {!compact && isScanning && (
        <p className="text-xs text-tinta-400 text-center">
          Apunta la cámara al código QR del productor
        </p>
      )}

      {/* ── Controles ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <button
          onClick={cambiarCamara}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-tinta-100 hover:bg-tinta-200 text-tinta-600 text-xs font-semibold rounded-btn transition-all min-h-[44px]"
        >
          <FlipHorizontal className="w-4 h-4" />
          {facingMode === 'environment' ? 'Frontal' : 'Trasera'}
        </button>
        <button
          onClick={() => { detener(); setEstado('manual') }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-tinta-100 hover:bg-tinta-200 text-tinta-600 text-xs font-semibold rounded-btn transition-all min-h-[44px]"
        >
          <Keyboard className="w-4 h-4" />
          Código manual
        </button>
        <button
          onClick={() => { detener(); setEstado('idle') }}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-semibold rounded-btn transition-all min-h-[44px]"
          title="Cancelar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <QrCode className="w-4 h-4 text-tinta-300" />
    </div>
  )
}

QRScanner.propTypes = {
  onResult:  PropTypes.func,
  lat:       PropTypes.number,
  lng:       PropTypes.number,
  compact:   PropTypes.bool,
  autoStart: PropTypes.bool,
}

QRScanner.defaultProps = {
  onResult:  null,
  lat:       null,
  lng:       null,
  compact:   false,
  autoStart: false,
}

export default QRScanner
