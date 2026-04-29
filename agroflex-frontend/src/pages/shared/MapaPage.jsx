/**
 * MapaPage — Mapa interactivo de productos agrícolas.
 *
 * Usa OpenStreetMap (gratuito, sin API key) + react-leaflet.
 * Muestra markers de productos del catálogo agrupados por municipio.
 * Detecta ubicación del usuario y filtra productos cercanos con Haversine.
 * Ruta: /mapa
 */
import { useState, useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useNavigate } from 'react-router-dom'
import {
  MapPin, Leaf, FlaskConical, Search, X, SlidersHorizontal,
  Navigation, Loader2, Radio,
} from 'lucide-react'
import { productoService } from '../../services/productoService'
import { ROUTES }          from '../../routes/routeConfig'
import { subscribeProductosUpdates } from '../../services/firebase'

// ── Fix íconos Leaflet con Vite ───────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ── Coordenadas de municipios ─────────────────────────────────────────────
const MUNICIPIO_COORDS = {
  'Tepeaca':                [18.9833, -97.9167],
  'Acatzingo':              [18.9800, -97.7900],
  'Huixcolotla':            [18.8961, -97.8250],
  'Tecali de Herrera':      [18.9000, -97.9500],
  'San Martín Texmelucan':  [19.2833, -98.4333],
  'Cholula':                [19.0633, -98.3053],
  'Tehuacán':               [18.4500, -97.3833],
  'Atlixco':                [18.9089, -98.4392],
  'Izúcar de Matamoros':    [18.5983, -98.4675],
  'Huejotzingo':            [19.1583, -98.4083],
  'Amozoc':                 [19.0489, -98.0578],
  'Tepatlaxco de Hidalgo':  [19.1000, -97.9667],
  'San Salvador el Verde':  [19.1950, -98.4833],
  'Tlahuapan':              [19.2500, -98.3417],
  'Palmar de Bravo':        [18.8167, -97.6833],
  'Libres':                 [19.4500, -97.6833],
  'Zacatlán':               [19.9333, -97.9667],
  'Chignahuapan':           [19.8333, -98.0333],
  'Teziutlán':              [19.8167, -97.3667],
  'Cuetzalan del Progreso': [20.0167, -97.5167],
  'Puebla':                 [19.0414, -98.2063],
  'Tlaxcala':               [19.3139, -98.2400],
  'Xicoténcatl':            [23.0000, -98.9500],
  'Apizaco':                [19.4167, -98.1333],
  'Huamantla':              [19.3167, -97.9167],
  'default':                [19.0414, -98.2063],
}

function getCoordsForProduct(producto) {
  // Primero usa coordenadas exactas marcadas por el productor
  if (producto.latitud != null && producto.longitud != null) {
    return [producto.latitud, producto.longitud]
  }
  // Fallback: centroide del municipio
  const municipio = producto.ubicacion?.municipio ?? ''
  return MUNICIPIO_COORDS[municipio] ?? MUNICIPIO_COORDS['default']
}

// ── Haversine — distancia en km entre dos coordenadas ────────────────────
function haversineKm([lat1, lon1], [lat2, lon2]) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Íconos custom según tipo ──────────────────────────────────────────────
function makeIcon(tipo, dimmed = false) {
  const color   = tipo === 'cosecha' ? '#16a34a' : '#2563eb'
  const opacity = dimmed ? '0.3' : '1'
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24S24 21 24 12C24 5.4 18.6 0 12 0z"
            fill="${color}" stroke="white" stroke-width="1.5" opacity="${opacity}"/>
      <circle cx="12" cy="12" r="5" fill="white" opacity="${opacity}"/>
    </svg>
  `)
  return L.icon({
    iconUrl:    `data:image/svg+xml,${svg}`,
    iconSize:   [24, 36],
    iconAnchor: [12, 36],
    popupAnchor:[0, -36],
  })
}

const ICON_COSECHA      = makeIcon('cosecha')
const ICON_SUMINISTRO   = makeIcon('suministro')
const ICON_COSECHA_DIM  = makeIcon('cosecha', true)
const ICON_SUMINISTRO_DIM = makeIcon('suministro', true)

const USER_ICON = L.divIcon({
  html: `<div style="
    width:18px;height:18px;border-radius:50%;
    background:#f97316;border:3px solid white;
    box-shadow:0 0 0 3px rgba(249,115,22,0.35);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  className: '',
})

function formatPrecio(precio) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(precio)
}

// ── Subcomponente: vuela al centro cuando userCoords cambia ───────────────
function FlyToUser({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo(coords, 11, { duration: 1.4 })
  }, [coords, map])
  return null
}

const RADIO_OPTIONS = [
  { label: '25 km',  value: 25  },
  { label: '50 km',  value: 50  },
  { label: '100 km', value: 100 },
  { label: '200 km', value: 200 },
]

// ── Componente principal ──────────────────────────────────────────────────
export default function MapaPage() {
  const navigate = useNavigate()

  const [productos,    setProductos]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [buscar,       setBuscar]       = useState('')
  const [tipoFiltro,   setTipoFiltro]   = useState('')
  const [panelOpen,    setPanelOpen]    = useState(false)

  // Geolocalización
  const [userCoords,   setUserCoords]   = useState(null)   // [lat, lng]
  const [geoLoading,   setGeoLoading]   = useState(false)
  const [geoError,     setGeoError]     = useState(null)
  const [cercaActivo,  setCercaActivo]  = useState(false)  // filtrar por radio
  const [radioKm,      setRadioKm]      = useState(50)

  function cargarProductos() {
    productoService.getAll({ size: 100 })
      .then(p => setProductos(p?.content ?? []))
      .catch(() => setProductos([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    cargarProductos()
    // Recarga el mapa cuando se publica un lote nuevo (trigger Firestore)
    const unsubscribe = subscribeProductosUpdates(() => cargarProductos())
    return () => unsubscribe()
  }, [])

  // ── Detectar ubicación ────────────────────────────────────────────────
  function detectarUbicacion() {
    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización.')
      return
    }
    setGeoLoading(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = [pos.coords.latitude, pos.coords.longitude]
        setUserCoords(coords)
        setCercaActivo(true)
        setGeoLoading(false)
      },
      err => {
        setGeoLoading(false)
        setGeoError(
          err.code === 1 ? 'Permiso de ubicación denegado.' : 'No se pudo obtener la ubicación.'
        )
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // ── Filtrado ───────────────────────────────────────────────────────────
  const { productosFiltrados, productosTotal } = useMemo(() => {
    const base = productos.filter(p => {
      const matchTipo   = !tipoFiltro || p.tipo === tipoFiltro
      const matchBuscar = !buscar || [p.nombre, p.ubicacion?.municipio, p.vendedor?.nombre]
        .some(v => v?.toLowerCase().includes(buscar.toLowerCase()))
      return matchTipo && matchBuscar
    })
    if (!cercaActivo || !userCoords) {
      return { productosFiltrados: base, productosTotal: base.length }
    }
    const cercanos = base.filter(p => {
      const coords = getCoordsForProduct(p)
      return haversineKm(userCoords, coords) <= radioKm
    })
    return { productosFiltrados: cercanos, productosTotal: base.length }
  }, [productos, buscar, tipoFiltro, cercaActivo, userCoords, radioKm])

  // Para atenuar markers fuera del radio (se muestran todos pero con distinto ícono)
  const productosBase = useMemo(() => {
    return productos.filter(p => {
      const matchTipo   = !tipoFiltro || p.tipo === tipoFiltro
      const matchBuscar = !buscar || [p.nombre, p.ubicacion?.municipio, p.vendedor?.nombre]
        .some(v => v?.toLowerCase().includes(buscar.toLowerCase()))
      return matchTipo && matchBuscar
    })
  }, [productos, buscar, tipoFiltro])

  const CENTER = [19.04, -98.20]

  return (
    <div className="relative w-full h-full bg-slate-100"
         style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>

      {/* ── Barra de búsqueda flotante ──────────────────────────────── */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-3">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2 px-3 py-2.5">
          <Search size={15} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Buscar producto, municipio o vendedor…"
            value={buscar}
            onChange={e => setBuscar(e.target.value)}
            className="flex-1 text-sm text-slate-700 outline-none placeholder:text-slate-300"
          />
          {buscar && (
            <button onClick={() => setBuscar('')} className="text-slate-300 hover:text-slate-500">
              <X size={14} />
            </button>
          )}
          <button
            onClick={() => setPanelOpen(v => !v)}
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${
              tipoFiltro ? 'bg-verde-500 text-white' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal size={13} />
          </button>
        </div>

        {/* Panel de filtros */}
        {panelOpen && (
          <div className="mt-2 bg-white rounded-xl shadow-lg border border-slate-100 p-3 space-y-3">
            <div className="flex gap-2">
              {[
                { value: '',           label: 'Todos',       icon: MapPin       },
                { value: 'cosecha',    label: 'Cosechas',    icon: Leaf         },
                { value: 'suministro', label: 'Suministros', icon: FlaskConical },
              ].map(opt => {
                const Icon = opt.icon
                return (
                  <button
                    key={opt.value}
                    onClick={() => { setTipoFiltro(opt.value); setPanelOpen(false) }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      tipoFiltro === opt.value
                        ? 'bg-verde-500 text-white border-verde-500'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={12} />
                    {opt.label}
                  </button>
                )
              })}
            </div>

            {/* Radio cuando hay ubicación */}
            {userCoords && (
              <div>
                <p className="text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Radio de búsqueda</p>
                <div className="flex gap-2">
                  {RADIO_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setRadioKm(opt.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        radioKm === opt.value
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Botón detectar ubicación ────────────────────────────────── */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        <button
          onClick={detectarUbicacion}
          disabled={geoLoading}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold shadow-lg border transition-all ${
            userCoords
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
          }`}
        >
          {geoLoading
            ? <Loader2 size={14} className="animate-spin" />
            : <Navigation size={14} />}
          {geoLoading ? 'Detectando…' : userCoords ? 'Mi ubicación' : 'Detectar ubicación'}
        </button>

        {/* Toggle filtro cercanos */}
        {userCoords && (
          <button
            onClick={() => setCercaActivo(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold shadow-lg border transition-all ${
              cercaActivo
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
            }`}
          >
            <Radio size={14} />
            {cercaActivo ? `Cerca (${radioKm} km)` : 'Ver cercanos'}
          </button>
        )}
      </div>

      {/* Error de geolocalización */}
      {geoError && (
        <div className="absolute top-16 right-3 z-[1000] bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3 py-2 rounded-xl shadow-lg max-w-[200px]">
          {geoError}
          <button onClick={() => setGeoError(null)} className="ml-2 text-red-400 hover:text-red-600">
            <X size={12} />
          </button>
        </div>
      )}

      {/* ── Contador flotante ───────────────────────────────────────── */}
      <div className="absolute bottom-6 left-3 z-[1000]">
        <div className="bg-white rounded-xl shadow-md border border-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
          {loading ? 'Cargando…' : cercaActivo && userCoords
            ? `${productosFiltrados.length} de ${productosTotal} cerca de ti`
            : `${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? 's' : ''} en el mapa`}
        </div>
      </div>

      {/* ── Leyenda ─────────────────────────────────────────────────── */}
      <div className="absolute bottom-6 right-3 z-[1000]">
        <div className="bg-white rounded-xl shadow-md border border-slate-100 px-3 py-2 space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-3 h-3 rounded-full bg-green-600 flex-shrink-0" /> Cosechas
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-3 h-3 rounded-full bg-blue-600 flex-shrink-0" /> Suministros
          </div>
          {userCoords && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0" /> Tu ubicación
            </div>
          )}
        </div>
      </div>

      {/* ── Mapa Leaflet ────────────────────────────────────────────── */}
      <MapContainer
        center={CENTER}
        zoom={9}
        style={{ width: '100%', minHeight: 'calc(100vh - 80px)' }}
        zoomControl={false}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <ZoomControl position="bottomright" />
        <FlyToUser coords={userCoords} />

        {/* Marcador + círculo de radio del usuario */}
        {userCoords && (
          <>
            <Marker position={userCoords} icon={USER_ICON} zIndexOffset={1000}>
              <Popup>
                <div className="text-xs font-semibold text-slate-700 p-1">Tu ubicación actual</div>
              </Popup>
            </Marker>
            {cercaActivo && (
              <Circle
                center={userCoords}
                radius={radioKm * 1000}
                pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.06, weight: 2, dashArray: '6 4' }}
              />
            )}
          </>
        )}

        {/* Markers de productos */}
        {productosBase.map(producto => {
          const coords = getCoordsForProduct(producto)
          const isCercano = !cercaActivo || !userCoords || haversineKm(userCoords, coords) <= radioKm
          const icon = producto.tipo === 'cosecha'
            ? (isCercano ? ICON_COSECHA     : ICON_COSECHA_DIM)
            : (isCercano ? ICON_SUMINISTRO  : ICON_SUMINISTRO_DIM)

          return (
            <Marker key={producto.id} position={coords} icon={icon}>
              <Popup maxWidth={240}>
                <div style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }} className="p-1 min-w-[200px]">
                  {producto.imagen && (
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                      onError={e => e.target.style.display = 'none'}
                    />
                  )}
                  <p className="font-bold text-sm text-slate-800 leading-tight mb-0.5">{producto.nombre}</p>
                  <p className="text-xs text-slate-400 mb-2">
                    {producto.ubicacion?.municipio}, {producto.ubicacion?.estado}
                    {userCoords && (
                      <span className="ml-1 font-semibold text-orange-500">
                        · {haversineKm(userCoords, coords).toFixed(0)} km
                      </span>
                    )}
                    {producto.latitud != null && (
                      <span className="ml-1 font-semibold text-green-600" title="Ubicación exacta marcada por el productor">
                        · 📍 exacta
                      </span>
                    )}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-bold text-verde-600">
                      {formatPrecio(producto.precio)}
                      <span className="text-xs font-normal text-slate-400"> / {producto.unidad}</span>
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      producto.tipo === 'cosecha' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {producto.tipo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-verde-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {producto.vendedor?.nombre?.charAt(0) ?? 'V'}
                    </div>
                    <span className="text-xs text-slate-500 truncate">{producto.vendedor?.nombre}</span>
                  </div>
                  <button
                    onClick={() => navigate(ROUTES.CATALOG_DETAILS.replace(':id', producto.id))}
                    className="w-full py-2 bg-verde-500 hover:bg-verde-600 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Ver detalle
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
