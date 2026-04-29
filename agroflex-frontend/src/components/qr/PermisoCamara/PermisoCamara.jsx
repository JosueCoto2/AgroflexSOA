/**
 * PermisoCamara — Pantalla de solicitud de permiso de cámara.
 */
import { Camera, CameraOff } from 'lucide-react'

export default function PermisoCamara({ estado, onSolicitar, onManual }) {
  if (estado === 'denied') {
    return (
      <div className="flex flex-col items-center text-center py-16 px-6">
        <div className="w-20 h-20 bg-red-50 rounded-card flex items-center justify-center mb-5">
          <CameraOff className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-base font-bold text-tinta-800 mb-2">
          Acceso a cámara bloqueado
        </h2>
        <p className="text-sm text-tinta-500 max-w-xs mb-6 leading-relaxed">
          Sin acceso a la cámara no puedes escanear el QR. Puedes habilitar el
          permiso desde la configuración de tu navegador, o ingresar el código
          manualmente.
        </p>
        <button
          onClick={onManual}
          className="px-5 py-2.5 bg-tinta-800 hover:bg-tinta-900 text-white text-sm font-semibold rounded-btn transition-all active:scale-95"
        >
          Ingresar código manualmente
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center text-center py-16 px-6">
      <div className="w-20 h-20 bg-verde-50 rounded-card flex items-center justify-center mb-5 animate-pulse">
        <Camera className="w-10 h-10 text-verde-500" />
      </div>
      <h2 className="text-base font-bold text-tinta-800 mb-2">
        Necesitamos acceso a tu cámara
      </h2>
      <p className="text-sm text-tinta-500 max-w-xs mb-7 leading-relaxed">
        Para validar la entrega de tu pedido necesitamos usar la cámara de tu
        dispositivo. Tus datos están seguros y solo se usa para escanear el QR.
      </p>
      <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
        <button
          onClick={onSolicitar}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-verde-400 hover:bg-verde-500 text-white text-sm font-bold rounded-btn transition-all active:scale-95"
        >
          <Camera className="w-4 h-4" />
          Permitir cámara
        </button>
        <button
          onClick={onManual}
          className="flex-1 px-5 py-3 border border-tinta-200 text-tinta-600 hover:bg-tinta-50 text-sm font-semibold rounded-btn transition-all"
        >
          Ingresar código
        </button>
      </div>
    </div>
  )
}
