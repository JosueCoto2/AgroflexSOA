import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Leaf, Package, Pencil, Trash2, AlertTriangle, X } from 'lucide-react'
import { ROUTES } from '../../routes/routeConfig'
import { getMisLotes, eliminarLote } from '../../api/catalogApi'

const FONT = { fontFamily: '"Inter", system-ui, sans-serif' }

// ─── Modal de confirmación de borrado ────────────────────────────────────────
function ConfirmDeleteModal({ lote, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
      <div style={FONT} className="bg-white rounded-card shadow-card w-full max-w-sm p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-btn bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-campo-700">Eliminar publicación</h3>
            <p className="text-xs text-campo-400 mt-1">
              ¿Estás seguro de que quieres eliminar <span className="font-semibold text-campo-600">"{lote.nombreProducto}"</span>? Esta acción no se puede deshacer.
            </p>
          </div>
          <button onClick={onCancel} className="ml-auto shrink-0 p-1 rounded-btn hover:bg-campo-100 transition-colors">
            <X className="w-4 h-4 text-campo-400" />
          </button>
        </div>
        <div className="flex gap-2 justify-end mt-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-btn text-sm font-medium text-campo-600 bg-campo-100 hover:bg-campo-200 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-btn text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function MyHarvestsPage() {
  const navigate = useNavigate()
  const [lotes,      setLotes]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [loteAEliminar, setLoteAEliminar] = useState(null)  // lote seleccionado para borrar
  const [eliminando, setEliminando] = useState(false)

  const cargarLotes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getMisLotes()
      setLotes(res.data ?? [])
    } catch (e) {
      setError('No se pudieron cargar tus publicaciones. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargarLotes() }, [cargarLotes])

  const handleEliminar = async () => {
    if (!loteAEliminar) return
    setEliminando(true)
    try {
      await eliminarLote(loteAEliminar.idLote)
      setLotes(prev => prev.filter(l => l.idLote !== loteAEliminar.idLote))
      setLoteAEliminar(null)
    } catch {
      // mantener modal abierto y mostrar error inline
    } finally {
      setEliminando(false)
    }
  }

  return (
    <div style={FONT} className="min-h-screen bg-gradient-to-b from-campo-50 via-campo-100 to-campo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-verde-700 via-verde-500 to-verde-400 px-4 py-4 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">Mis publicaciones</h1>
            {!loading && lotes.length > 0 && (
              <p className="text-xs text-verde-100 mt-0.5">{lotes.length} {lotes.length === 1 ? 'lote publicado' : 'lotes publicados'}</p>
            )}
          </div>
          <button
            onClick={() => navigate(ROUTES.PRODUCER_LOTS_NEW)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-btn bg-white/20 border border-white/30 text-white text-sm font-medium hover:bg-white/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo lote
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <SkeletonList />
        ) : error ? (
          <ErrorState mensaje={error} onRetry={cargarLotes} />
        ) : lotes.length === 0 ? (
          <EmptyState onPublish={() => navigate(ROUTES.PRODUCER_LOTS_NEW)} />
        ) : (
          <div className="space-y-3">
            {lotes.map(lote => (
              <LoteCard
                key={lote.idLote}
                lote={lote}
                onEditar={() => navigate(ROUTES.EDITAR_LOTE.replace(':id', lote.idLote))}
                onEliminar={() => setLoteAEliminar(lote)}
              />
            ))}
          </div>
        )}
      </div>

      {loteAEliminar && (
        <ConfirmDeleteModal
          lote={loteAEliminar}
          onConfirm={handleEliminar}
          onCancel={() => setLoteAEliminar(null)}
          loading={eliminando}
        />
      )}
    </div>
  )
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function LoteCard({ lote, onEditar, onEliminar }) {
  const navigate = useNavigate()
  const activo = lote.estadoLote === 'DISPONIBLE' || lote.estadoLote === 'ACTIVO'

  return (
    <div className="bg-white rounded-card shadow-card border border-campo-100 overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        {/* Imagen o icono */}
        <div className="w-14 h-14 rounded-btn bg-campo-100 overflow-hidden shrink-0">
          {lote.imagenUrl
            ? <img src={lote.imagenUrl} alt={lote.nombreProducto} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-verde-400" />
              </div>
          }
        </div>

        {/* Info */}
        <button
          onClick={() => navigate(`/catalog/${lote.idLote}`)}
          className="flex-1 min-w-0 text-left"
        >
          <p className="text-sm font-semibold text-campo-700 truncate">{lote.nombreProducto}</p>
          <p className="text-xs text-campo-400 mt-0.5">
            ${lote.precio} / {lote.unidadVenta}
            {lote.cantidadDisponible != null && ` · ${lote.cantidadDisponible} disponibles`}
          </p>
          {lote.ubicacion && (
            <p className="text-xs text-campo-400 truncate mt-0.5">{lote.ubicacion}</p>
          )}
        </button>

        {/* Estado chip */}
        <span className={`text-xs px-2 py-0.5 rounded-chip font-medium shrink-0 ${
          activo ? 'bg-verde-100 text-verde-700' : 'bg-ambar-50 text-ambar-700'
        }`}>
          {activo ? 'Activo' : 'Pausado'}
        </span>
      </div>

      {/* Acciones */}
      <div className="border-t border-campo-100 flex divide-x divide-campo-100">
        <button
          onClick={onEditar}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-campo-500 hover:bg-campo-50 hover:text-verde-700 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Editar
        </button>
        <button
          onClick={onEliminar}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-campo-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Eliminar
        </button>
      </div>
    </div>
  )
}

function EmptyState({ onPublish }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-verde-50 rounded-2xl flex items-center justify-center mb-4">
        <Leaf className="w-8 h-8 text-verde-400" />
      </div>
      <h2 className="text-base font-semibold text-campo-600 mb-2">Aún no tienes lotes publicados</h2>
      <p className="text-sm text-campo-400 max-w-xs mb-6">
        Publica tu primera cosecha o suministro para que los compradores puedan encontrarte.
      </p>
      <button
        onClick={onPublish}
        className="flex items-center gap-2 px-5 py-2.5 rounded-btn bg-verde-600 text-white text-sm font-semibold hover:bg-verde-700 transition-colors shadow-btn"
      >
        <Plus className="w-4 h-4" />
        Publicar primer lote
      </button>
    </div>
  )
}

function ErrorState({ mensaje, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-red-400" />
      </div>
      <p className="text-sm text-campo-500">{mensaje}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-btn bg-verde-600 text-white text-sm font-medium hover:bg-verde-700 transition-colors"
      >
        Reintentar
      </button>
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-card border border-campo-100 p-4 flex items-center gap-3 animate-pulse">
          <div className="w-14 h-14 rounded-btn bg-campo-100 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-campo-100 rounded w-3/4" />
            <div className="h-3 bg-campo-100 rounded w-1/2" />
          </div>
          <div className="h-5 w-12 bg-campo-100 rounded-chip" />
        </div>
      ))}
    </div>
  )
}
