import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Download, Star } from 'lucide-react'
import useCatalogStore from '../../../store/catalogStore'
import usePWAInstall from '../../../hooks/usePWAInstall'
import { ROUTES } from '../../../routes/routeConfig'

// ── Lotes Cercanos Widget ────────────────────────────────────────────────────
const LotesCercanosWidget = () => {
  const { lotesCercanos, isLoading } = useCatalogStore()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-tinta-100 rounded-card animate-pulse" />
        ))}
      </div>
    )
  }

  if (!lotesCercanos.length) {
    return (
      <p className="text-xs text-tinta-400 text-center py-2">
        Activa tu ubicación para ver lotes cercanos
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {lotesCercanos.slice(0, 4).map((lote) => (
        <Link
          key={lote.idLote}
          to={`/catalog/${lote.idLote}`}
          className="flex items-center gap-2.5 p-2 rounded-card hover:bg-tinta-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-chip bg-verde-50 flex items-center justify-center shrink-0 text-sm">
            🌱
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-tinta-800 truncate">{lote.titulo}</p>
            <p className="text-xs text-tinta-400 flex items-center gap-1 mt-0.5">
              <MapPin size={9} />
              {lote.municipio || lote.estadoRepublica || 'Cerca de ti'}
            </p>
          </div>
        </Link>
      ))}
      <Link
        to={ROUTES.MAPA}
        className="text-xs text-verde-600 font-semibold hover:text-verde-700 text-center mt-2 transition-colors"
      >
        Ver todos en el mapa →
      </Link>
    </div>
  )
}

// ── Productores Destacados Widget ────────────────────────────────────────────
const ProductoresDestacadosWidget = () => {
  const mockProductores = [
    { id: 1, nombre: 'Rancho El Fresno', calificacion: 4.9, lotes: 12 },
    { id: 2, nombre: 'Invernadero Morelos', calificacion: 4.7, lotes: 8 },
    { id: 3, nombre: 'Cosechas del Norte', calificacion: 4.8, lotes: 15 },
  ]

  return (
    <div className="flex flex-col gap-1">
      {mockProductores.map((p) => (
        <div key={p.id} className="flex items-center gap-2.5 p-2 rounded-card hover:bg-tinta-50 transition-colors">
          <div className="w-8 h-8 rounded-fab bg-verde-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {p.nombre.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-tinta-800 truncate">{p.nombre}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Star size={10} className="text-ambar-400 fill-ambar-400" />
              <span className="text-xs text-tinta-400">{p.calificacion} · {p.lotes} lotes</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── PWA Install Banner ───────────────────────────────────────────────────────
const PWAInstallBanner = () => {
  const { puedeInstalar, yaInstalada, instalar } = usePWAInstall()

  if (yaInstalada || !puedeInstalar) return null

  return (
    <div className="bg-verde-50 border border-verde-100 rounded-card p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Download size={16} className="text-verde-700 shrink-0" />
        <p className="text-sm font-semibold text-tinta-900">Instalar AgroFlex</p>
      </div>
      <p className="text-xs text-tinta-500">
        Accede más rápido desde tu dispositivo como una app nativa.
      </p>
      <button
        onClick={instalar}
        className="bg-verde-400 hover:bg-verde-500 text-white text-xs font-semibold px-3 py-2 rounded-btn transition-colors min-h-[36px]"
      >
        Instalar ahora
      </button>
    </div>
  )
}

// ── Panel Derecho ─────────────────────────────────────────────────────────────
const RightPanel = () => {
  const { fetchCercanos } = useCatalogStore()

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => fetchCercanos(coords.latitude, coords.longitude),
        () => {} // silencioso si niega permiso
      )
    }
  }, [fetchCercanos])

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-card p-4 border border-tinta-100 shadow-card">
        <h3 className="text-xs font-semibold text-tinta-500 uppercase tracking-wide mb-3">
          Lotes cerca de ti
        </h3>
        <LotesCercanosWidget />
      </div>

      <div className="bg-white rounded-card p-4 border border-tinta-100 shadow-card">
        <h3 className="text-xs font-semibold text-tinta-500 uppercase tracking-wide mb-3">
          Productores destacados
        </h3>
        <ProductoresDestacadosWidget />
      </div>

      <PWAInstallBanner />
    </div>
  )
}

export default RightPanel
