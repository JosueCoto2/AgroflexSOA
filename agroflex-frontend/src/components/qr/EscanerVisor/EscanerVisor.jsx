/**
 * EscanerVisor — Visor de cámara con overlay de escaneo QR.
 */
import { useEffect } from 'react'
import { FlipHorizontal, QrCode, Keyboard, Loader2 } from 'lucide-react'

export default function EscanerVisor({
  qrElementId,
  estado,
  facingMode,
  onIniciar,
  onCambiarCamara,
  onManual,
  lat,
  lng,
}) {
  useEffect(() => {
    if (estado === 'scanning') {
      onIniciar(lat, lng)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado])

  const isValidating = estado === 'validating'

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Visor */}
      <div className="relative w-full max-w-sm">
        <div
          id={qrElementId}
          className="w-full aspect-square rounded-card overflow-hidden bg-black"
        />

        {/* Overlay de guía */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-52 h-52 border-2 border-white/70 rounded-card relative">
            <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-verde-400 rounded-tl-xl" />
            <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-verde-400 rounded-tr-xl" />
            <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-verde-400 rounded-bl-xl" />
            <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-verde-400 rounded-br-xl" />
            {!isValidating && (
              <div className="absolute inset-x-2 h-0.5 bg-verde-400/80 rounded-full animate-[scan_2s_ease-in-out_infinite]" />
            )}
          </div>
        </div>

        {/* Overlay de validación */}
        {isValidating && (
          <div className="absolute inset-0 bg-tinta-900/70 rounded-card flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 text-verde-400 animate-spin" />
            <p className="text-sm text-white font-semibold">Validando entrega…</p>
          </div>
        )}
      </div>

      {/* Instrucción */}
      {!isValidating && (
        <p className="text-xs text-tinta-400 text-center">
          Apunta la cámara al código QR del productor
        </p>
      )}

      {/* Controles */}
      <div className="flex items-center gap-3">
        <button
          onClick={onCambiarCamara}
          title="Cambiar cámara"
          className="flex items-center gap-2 px-4 py-2.5 bg-tinta-100 hover:bg-tinta-200 text-tinta-600 text-xs font-semibold rounded-btn transition-all"
        >
          <FlipHorizontal className="w-4 h-4" />
          {facingMode === 'environment' ? 'Frontal' : 'Trasera'}
        </button>
        <button
          onClick={onManual}
          className="flex items-center gap-2 px-4 py-2.5 bg-tinta-100 hover:bg-tinta-200 text-tinta-600 text-xs font-semibold rounded-btn transition-all"
        >
          <Keyboard className="w-4 h-4" />
          Código manual
        </button>
      </div>

      <QrCode className="w-5 h-5 text-tinta-300" />
    </div>
  )
}
