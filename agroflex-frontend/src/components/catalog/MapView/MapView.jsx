import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { MapPin, Navigation } from 'lucide-react'
import { formatPrecio } from '../../../utils/formatters'

/**
 * MapView — Mapa interactivo de lotes.
 *
 * Usa react-leaflet. Si no está instalado:
 *   npm install react-leaflet leaflet
 *   npm install react-leaflet-cluster (opcional, para clustering)
 *
 * Los estilos CSS de Leaflet deben importarse en index.css o main.jsx:
 *   import 'leaflet/dist/leaflet.css'
 */

let MapContainer, TileLayer, Marker, Popup, useMap
let leaflet

try {
  // Importación dinámica para no romper el build si leaflet no está instalado
  const reactLeaflet = require('react-leaflet')
  MapContainer = reactLeaflet.MapContainer
  TileLayer = reactLeaflet.TileLayer
  Marker = reactLeaflet.Marker
  Popup = reactLeaflet.Popup
  useMap = reactLeaflet.useMap
  leaflet = require('leaflet')

  // Corregir el ícono de Leaflet (bug conocido con Vite/Webpack)
  delete leaflet.Icon.Default.prototype._getIconUrl
  leaflet.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
} catch {
  // react-leaflet no instalado aún
}

// ─── Sub-componente para centrar el mapa en el usuario ──────────────────────
const BotonGeolocalizacion = ({ onCentrar }) => {
  const map = useMap ? useMap() : null

  const handleClick = () => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        map?.setView([coords.latitude, coords.longitude], 12)
        onCentrar?.([coords.latitude, coords.longitude])
      },
      () => alert('No se pudo obtener tu ubicación')
    )
  }

  if (!map) return null

  return (
    <button
      type="button"
      onClick={handleClick}
      className="absolute bottom-4 right-4 z-[1000] bg-white border border-slate-200 rounded-lg p-3 shadow-md hover:bg-slate-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
      title="Usar mi ubicación"
    >
      <Navigation size={18} className="text-green-700" />
    </button>
  )
}

BotonGeolocalizacion.propTypes = {
  onCentrar: PropTypes.func,
}

BotonGeolocalizacion.defaultProps = {
  onCentrar: null,
}

// ─── Fallback cuando react-leaflet no está disponible ───────────────────────
const MapFallback = ({ lotes, onSelectLote }) => (
  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
    <MapPin size={32} className="text-green-600 mx-auto mb-3" />
    <p className="text-slate-700 font-medium mb-1">Mapa no disponible</p>
    <p className="text-slate-500 text-sm mb-4">
      Instala react-leaflet para ver el mapa:
    </p>
    <code className="bg-white border border-slate-200 rounded px-3 py-1 text-xs font-mono text-slate-700">
      npm install react-leaflet leaflet
    </code>

    {lotes.length > 0 && (
      <div className="mt-4 grid gap-2">
        {lotes.slice(0, 5).map((lote) => (
          <button
            key={lote.idLote}
            type="button"
            onClick={() => onSelectLote?.(lote)}
            className="text-left bg-white border border-slate-200 rounded-lg p-3 hover:border-green-400 transition-colors"
          >
            <p className="text-sm font-medium text-slate-800">{lote.titulo}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin size={10} />
              {[lote.municipio, lote.estadoRepublica].filter(Boolean).join(', ')}
            </p>
          </button>
        ))}
      </div>
    )}
  </div>
)

MapFallback.propTypes = {
  lotes: PropTypes.array.isRequired,
  onSelectLote: PropTypes.func,
}

MapFallback.defaultProps = {
  onSelectLote: null,
}

// ─── Componente principal ────────────────────────────────────────────────────
const MapView = ({ lotes, centro, onSelectLote }) => {
  if (!MapContainer) {
    return <MapFallback lotes={lotes} onSelectLote={onSelectLote} />
  }

  const lotesConCoordenadas = lotes.filter(
    (l) => l.latitud != null && l.longitud != null
  )

  const centroMapa = centro || [23.6345, -102.5528] // Centro de México

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-200">
      <MapContainer
        center={centroMapa}
        zoom={6}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {lotesConCoordenadas.map((lote) => (
          <Marker key={lote.idLote} position={[lote.latitud, lote.longitud]}>
            <Popup>
              <div className="min-w-[180px]">
                {lote.imagenPrincipalUrl && (
                  <img
                    src={lote.imagenPrincipalUrl}
                    alt={lote.titulo}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                )}
                <p className="font-semibold text-sm text-slate-800 leading-snug">
                  {lote.titulo}
                </p>
                <p className="text-lime-700 font-bold text-base mt-1">
                  {formatPrecio(lote.precioUnitario)}
                  <span className="text-xs font-normal text-slate-500">
                    {' '}/ {lote.unidadVenta}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => onSelectLote?.(lote)}
                  className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded py-2 transition-colors"
                >
                  Ver detalle
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        <BotonGeolocalizacion />
      </MapContainer>

      {lotesConCoordenadas.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 rounded-xl pointer-events-none">
          <p className="text-slate-500 text-sm">Sin lotes con ubicación disponible</p>
        </div>
      )}
    </div>
  )
}

MapView.propTypes = {
  lotes: PropTypes.arrayOf(
    PropTypes.shape({
      idLote: PropTypes.number.isRequired,
      titulo: PropTypes.string.isRequired,
      latitud: PropTypes.number,
      longitud: PropTypes.number,
      precioUnitario: PropTypes.number,
      unidadVenta: PropTypes.string,
      imagenPrincipalUrl: PropTypes.string,
    })
  ).isRequired,
  centro: PropTypes.arrayOf(PropTypes.number),
  onSelectLote: PropTypes.func,
}

MapView.defaultProps = {
  centro: null,
  onSelectLote: null,
}

export default MapView
