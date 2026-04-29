/**
 * LocationPickerMap — selector interactivo de ubicación del terreno.
 *
 * El productor puede:
 *   1. Elegir un municipio → el mapa vuela automáticamente a él (Nominatim/OSM).
 *   2. Hacer clic en el mapa para colocar/mover el marcador exacto.
 *   3. Detectar su ubicación actual con el botón "Usar mi ubicación".
 *   4. Ver coordenadas exactas en tiempo real.
 *
 * Props:
 *   value     — { lat: number, lng: number } | null
 *   onChange  — ({ lat, lng }) => void
 *   municipio — string | null  (nombre del municipio seleccionado)
 */
import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, ZoomControl, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Navigation, Loader2, MapPin, X } from 'lucide-react'

// Fix íconos Leaflet con Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const TERRENO_ICON = L.divIcon({
  html: `<div style="
    width:32px;height:32px;border-radius:50% 50% 50% 0;
    background:#16a34a;border:3px solid white;
    box-shadow:0 2px 8px rgba(0,0,0,0.35);
    transform:rotate(-45deg);
  "></div>`,
  iconSize:    [32, 32],
  iconAnchor:  [16, 32],
  popupAnchor: [0, -36],
  className:   '',
})

const CENTER_DEFAULT = [19.04, -98.20] // Puebla

// Sub-componente: captura clics en el mapa
function ClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) })
  return null
}

// Sub-componente: vuela a coordenadas cuando cambian
function FlyTo({ coords, zoom = 14 }) {
  const map = useMap()
  const prevRef = useRef(null)
  useEffect(() => {
    if (!coords) return
    const key = `${coords[0]},${coords[1]},${zoom}`
    if (prevRef.current === key) return
    prevRef.current = key
    map.flyTo(coords, zoom, { duration: 1.2 })
  }, [coords, zoom, map])
  return null
}

export default function LocationPickerMap({ value, onChange, municipio }) {
  const [geoLoading,   setGeoLoading]   = useState(false)
  const [geoError,     setGeoError]     = useState(null)
  const [municipioPos, setMunicipioPos] = useState(null) // coords del municipio para FlyTo
  const prevMunicipioRef = useRef(null)

  const markerPos = value ? [value.lat, value.lng] : null

  // Cuando cambia el municipio, geocodificarlo con Nominatim (OpenStreetMap, gratuito)
  useEffect(() => {
    if (!municipio || municipio === prevMunicipioRef.current) return
    prevMunicipioRef.current = municipio

    const query = encodeURIComponent(`${municipio}, Puebla, Mexico`)
    fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
      headers: { 'Accept-Language': 'es' },
    })
      .then(r => r.json())
      .then(results => {
        if (results.length > 0) {
          setMunicipioPos([parseFloat(results[0].lat), parseFloat(results[0].lon)])
        }
      })
      .catch(() => {}) // silencioso, el mapa simplemente no vuela
  }, [municipio])

  function handleMapClick({ lat, lng }) {
    onChange({ lat, lng })
    setGeoError(null)
  }

  function detectarUbicacion() {
    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización.')
      return
    }
    setGeoLoading(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGeoLoading(false)
      },
      (err) => {
        setGeoLoading(false)
        setGeoError(err.code === 1 ? 'Permiso denegado.' : 'No se pudo obtener ubicación.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  function limpiar() {
    onChange(null)
    setGeoError(null)
  }

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
      {/* Instrucción */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MapPin size={13} className="text-verde-500 flex-shrink-0" />
          {markerPos
            ? <span className="font-semibold text-slate-700">
                {markerPos[0].toFixed(5)}, {markerPos[1].toFixed(5)}
              </span>
            : municipioPos
              ? <span className="text-emerald-600 font-medium">Toca el punto exacto de tu terreno en {municipio}</span>
              : 'Elige un municipio arriba y el mapa irá ahí automáticamente'}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={detectarUbicacion}
            disabled={geoLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-verde-500 text-white hover:bg-verde-600 transition-colors disabled:opacity-60"
          >
            {geoLoading
              ? <Loader2 size={11} className="animate-spin" />
              : <Navigation size={11} />}
            Mi ubicación
          </button>
          {markerPos && (
            <button
              type="button"
              onClick={limpiar}
              className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Quitar marcador"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Error de geo */}
      {geoError && (
        <div className="px-3 py-1.5 bg-red-50 border-b border-red-100 text-xs text-red-600 font-medium">
          {geoError}
        </div>
      )}

      {/* Mapa */}
      <MapContainer
        center={CENTER_DEFAULT}
        zoom={9}
        style={{ width: '100%', height: '240px' }}
        zoomControl={false}
        className="z-0 cursor-crosshair"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <ZoomControl position="bottomright" />
        <ClickHandler onMapClick={handleMapClick} />
        {/* Vuela al municipio seleccionado (zoom 12 para ver el área completa) */}
        {municipioPos && !markerPos && (
          <FlyTo coords={municipioPos} zoom={12} />
        )}
        {markerPos && (
          <>
            <Marker position={markerPos} icon={TERRENO_ICON} />
            <FlyTo coords={markerPos} zoom={14} />
          </>
        )}
      </MapContainer>

      {/* Hint de ayuda debajo */}
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-200">
        <p className="text-[10px] text-slate-400 text-center">
          Puedes mover el marcador tocando otro punto del mapa en cualquier momento
        </p>
      </div>
    </div>
  )
}
