/**
 * EscanearQR — Pantalla de escaneo QR para validar entregas (/escanear-qr).
 *
 * Flujo:
 *  1. idle/requesting → PermisoCamara (solicita acceso)
 *  2. denied          → PermisoCamara modo denegado → EntradaManual
 *  3. scanning        → EscanerVisor (html5-qrcode activo)
 *  4. manual          → EntradaManual
 *  5. validating      → spinner dentro de EscanerVisor
 *  6. success/error   → ResultadoValidacion
 *
 * Flujo SOA: EscanearQR → useQRScanner → qrService → axiosClient → qr-service
 *                       → useGeolocalizacion → navigator.geolocation
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, ChevronLeft } from 'lucide-react'
import { useQRScanner }        from '../../hooks/useQRScanner'
import { useGeolocalizacion }  from '../../hooks/useGeolocalizacion'
import PermisoCamara           from '../../components/qr/PermisoCamara/PermisoCamara'
import EscanerVisor            from '../../components/qr/EscanerVisor/EscanerVisor'
import ResultadoValidacion     from '../../components/qr/ResultadoValidacion/ResultadoValidacion'
import EntradaManual           from '../../components/qr/EntradaManual/EntradaManual'

export default function EscanearQR() {
  const [modoManual, setModoManual] = useState(false)
  const navigate = useNavigate()

  const {
    estado,
    resultado,
    facingMode,
    qrElementId,
    solicitarPermiso,
    iniciarEscaner,
    validarManual,
    reiniciar,
    cambiarCamara,
  } = useQRScanner()

  const { lat, lng, obtener: obtenerGPS } = useGeolocalizacion()

  // Obtener GPS en cuanto se monta la pantalla (silencioso)
  useEffect(() => { obtenerGPS() }, [obtenerGPS])

  // Verificar permiso de cámara al montar (si ya fue concedido antes)
  useEffect(() => {
    if (!navigator.permissions) return
    navigator.permissions.query({ name: 'camera' }).then(perm => {
      if (perm.state === 'granted') solicitarPermiso()
    }).catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleManualValidar = async (token) => {
    const coords = lat && lng ? { lat, lng } : await obtenerGPS()
    validarManual(token, coords.lat, coords.lng)
  }

  const handleIniciarEscaner = async () => {
    const coords = lat && lng ? { lat, lng } : await obtenerGPS()
    iniciarEscaner(coords.lat, coords.lng)
  }

  const mostrarResult = estado === 'success' || estado === 'error'
  const gpsActivo = lat && lng

  return (
    <div className="bg-campo-50 min-h-screen flex flex-col">

      {/* ── Header */}
      <div className="bg-verde-400 px-4 py-4 sticky top-0 z-20">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-sm font-semibold rounded-btn px-3 py-1.5 mb-3 transition-all active:scale-95 font-sans"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </button>
          <h1 className="text-xl font-black text-white font-display leading-tight">
            Confirmar entrega
          </h1>
          <p className="text-sm text-white/70 font-sans mt-0.5">
            Escanea el código QR que muestra el vendedor
          </p>
        </div>
      </div>

      {/* ── Contenido */}
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">

        {/* ── RESULTADO (éxito o error) */}
        {mostrarResult && (
          <div className="px-4 pt-6">
            <ResultadoValidacion
              resultado={resultado}
              onReintentar={() => { reiniciar(); setModoManual(false) }}
            />
          </div>
        )}

        {/* ── MODO MANUAL */}
        {!mostrarResult && modoManual && (
          <div className="px-4 pt-6">
            <EntradaManual
              onValidar={handleManualValidar}
              onVolver={estado !== 'denied' ? () => setModoManual(false) : undefined}
              isValidating={estado === 'validating'}
            />
          </div>
        )}

        {/* ── SOLICITAR PERMISO */}
        {!mostrarResult && !modoManual && (estado === 'idle' || estado === 'requesting' || estado === 'denied') && (
          <div className="px-4 pt-6">
            <PermisoCamara
              estado={estado}
              onSolicitar={solicitarPermiso}
              onManual={() => setModoManual(true)}
            />
          </div>
        )}

        {/* ── ESCÁNER ACTIVO */}
        {!mostrarResult && !modoManual && (estado === 'scanning' || estado === 'validating') && (
          <div className="relative">
            {/* Camera area */}
            <div className="relative w-full bg-black" style={{ minHeight: '300px' }}>
              <EscanerVisor
                qrElementId={qrElementId}
                estado={estado}
                facingMode={facingMode}
                onIniciar={handleIniciarEscaner}
                onCambiarCamara={cambiarCamara}
                onManual={() => setModoManual(true)}
                lat={lat}
                lng={lng}
              />

              {/* Green corner brackets */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-48 h-48">
                  {/* Top-left */}
                  <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-verde-400 opacity-90 animate-pulse" />
                  {/* Top-right */}
                  <span className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-verde-400 opacity-90 animate-pulse" />
                  {/* Bottom-left */}
                  <span className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-verde-400 opacity-90 animate-pulse" />
                  {/* Bottom-right */}
                  <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-verde-400 opacity-90 animate-pulse" />
                  <p className="absolute inset-x-0 bottom-[-28px] text-center text-sm text-white font-sans">
                    Apunta al código QR
                  </p>
                </div>
              </div>
            </div>

            {/* ── GPS floating card */}
            <div className="mx-4 mt-4 mb-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-card border border-campo-100 px-4 py-3 flex items-center gap-2.5 shadow-card">
                <MapPin className={`w-4 h-4 shrink-0 ${gpsActivo ? 'text-verde-400' : 'text-red-400'}`} />
                {gpsActivo ? (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-campo-700 font-sans">GPS activo</p>
                    <p className="text-[10px] text-campo-400 font-sans truncate">
                      {lat?.toFixed(5)}, {lng?.toFixed(5)}
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-red-600 font-sans">Activar ubicación</p>
                    <p className="text-[10px] text-campo-400 font-sans">
                      Se necesita GPS para confirmar la entrega
                    </p>
                  </div>
                )}
                {!gpsActivo && (
                  <button
                    onClick={() => obtenerGPS()}
                    className="shrink-0 text-[10px] font-bold text-verde-600 hover:text-verde-700 font-sans bg-verde-50 px-2 py-1 rounded-badge"
                  >
                    Activar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── GPS card for non-scanning states (idle/manual) */}
        {!mostrarResult && (estado === 'idle' || estado === 'requesting' || estado === 'denied' || modoManual) && (
          <div className="mx-4 mt-4 mb-4">
            <div className="bg-white rounded-card border border-campo-100 px-4 py-3 flex items-center gap-2.5 shadow-card">
              <MapPin className={`w-4 h-4 shrink-0 ${gpsActivo ? 'text-verde-400' : 'text-red-400'}`} />
              {gpsActivo ? (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-campo-700 font-sans">GPS activo</p>
                  <p className="text-[10px] text-campo-400 font-sans truncate">
                    {lat?.toFixed(5)}, {lng?.toFixed(5)}
                  </p>
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-red-600 font-sans">Activar ubicación</p>
                  <p className="text-[10px] text-campo-400 font-sans">
                    Se necesita GPS para confirmar la entrega
                  </p>
                </div>
              )}
              {!gpsActivo && (
                <button
                  onClick={() => obtenerGPS()}
                  className="shrink-0 text-[10px] font-bold text-verde-600 hover:text-verde-700 font-sans bg-verde-50 px-2 py-1 rounded-badge"
                >
                  Activar
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
