/**
 * ReseñasWidget — Muestra las reseñas públicas de un usuario + formulario para dejar una.
 *
 * Props:
 *   idUsuario  {number}  — ID del usuario a calificar
 *   idOrden    {number}  — ID de la orden (necesario para dejar reseña, opcional)
 *   tipoReseña {string}  — 'VENDEDOR' | 'COMPRADOR' (default 'VENDEDOR')
 */
import { useState, useEffect, useCallback } from 'react'
import { Star, Loader2, AlertCircle, ChevronDown, Send } from 'lucide-react'
import usersApi    from '../../api/usersApi'
import useAuthStore from '../../store/authStore'

// ── Estrellitas ────────────────────────────────────────────────────────────
function Estrellas({ valor, max = 5, tamaño = 14, interactivo = false, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const llena = interactivo ? (hover || valor) > i : valor > i
        return (
          <Star
            key={i}
            size={tamaño}
            className={`${llena ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} ${interactivo ? 'cursor-pointer transition-colors' : ''}`}
            onMouseEnter={() => interactivo && setHover(i + 1)}
            onMouseLeave={() => interactivo && setHover(0)}
            onClick={() => interactivo && onChange?.(i + 1)}
          />
        )
      })}
    </div>
  )
}

// ── Tarjeta de reseña individual ───────────────────────────────────────────
function TarjetaReseña({ reseña }) {
  const fecha = reseña.createdAt
    ? new Date(reseña.createdAt).toLocaleDateString('es-MX', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : ''

  return (
    <div className="py-3 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Estrellas valor={reseña.puntuacion} tamaño={13} />
        <span className="text-xs text-slate-300">{fecha}</span>
      </div>
      {reseña.comentario && (
        <p className="text-sm text-slate-600 leading-snug">{reseña.comentario}</p>
      )}
    </div>
  )
}

// ── Formulario nueva reseña ────────────────────────────────────────────────
function FormReseña({ idUsuario, idOrden, tipoReseña, onSuccess }) {
  const [puntuacion,  setPuntuacion]  = useState(0)
  const [comentario,  setComentario]  = useState('')
  const [enviando,    setEnviando]    = useState(false)
  const [error,       setError]       = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (puntuacion === 0) { setError('Selecciona una puntuación'); return }
    setEnviando(true)
    setError(null)
    try {
      await usersApi.crearReseña({
        idCalificado: idUsuario,
        idOrden,
        tipoReseña,
        puntuacion,
        comentario: comentario.trim() || null,
      })
      onSuccess?.()
    } catch (err) {
      const msg = err?.response?.data?.mensaje ?? err?.response?.data?.message
      setError(msg ?? 'No se pudo enviar la reseña.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t border-slate-100">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        Deja tu calificación
      </p>

      <div>
        <Estrellas valor={puntuacion} tamaño={22} interactivo onChange={setPuntuacion} />
      </div>

      <textarea
        value={comentario}
        onChange={e => setComentario(e.target.value)}
        placeholder="Comentario opcional…"
        rows={2}
        maxLength={500}
        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-verde-400 focus:border-transparent resize-none transition"
      />

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando || puntuacion === 0}
        className="flex items-center gap-2 bg-verde-500 hover:bg-verde-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
      >
        {enviando
          ? <Loader2 size={14} className="animate-spin" />
          : <Send size={14} />}
        {enviando ? 'Enviando…' : 'Publicar reseña'}
      </button>
    </form>
  )
}

// ── Widget principal ───────────────────────────────────────────────────────
export default function ReseñasWidget({ idUsuario, idOrden, tipoReseña = 'VENDEDOR' }) {
  const { isAuthenticated } = useAuthStore()

  const [reseñas,    setReseñas]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [page,       setPage]       = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [hayMas,     setHayMas]     = useState(false)
  const [yaReseñó,   setYaReseñó]   = useState(false)
  const [cargandoMas, setCargandoMas] = useState(false)

  const cargar = useCallback(async (pg = 0, acumular = false) => {
    pg === 0 ? setLoading(true) : setCargandoMas(true)
    setError(null)
    try {
      const res = await usersApi.getReseñas(idUsuario, pg, 5)
      const { content, totalPages: tp } = res.data
      setReseñas(prev => acumular ? [...prev, ...(content ?? [])] : (content ?? []))
      setTotalPages(tp ?? 1)
      setHayMas(pg + 1 < (tp ?? 1))
      setPage(pg)
    } catch {
      setError('No se pudieron cargar las reseñas.')
    } finally {
      setLoading(false)
      setCargandoMas(false)
    }
  }, [idUsuario])

  useEffect(() => {
    if (idUsuario) cargar(0)
  }, [idUsuario, cargar])

  function handleNuevaReseña() {
    setYaReseñó(true)
    cargar(0)
  }

  if (!idUsuario) return null

  const promedio = reseñas.length
    ? (reseñas.reduce((s, r) => s + r.puntuacion, 0) / reseñas.length).toFixed(1)
    : null

  const mostrarForm = isAuthenticated && idOrden && !yaReseñó

  return (
    <div className="space-y-1">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">Reseñas</h3>
        {promedio && (
          <div className="flex items-center gap-1">
            <Star size={13} className="text-amber-400 fill-amber-400" />
            <span className="text-sm font-bold text-slate-700">{promedio}</span>
            <span className="text-xs text-slate-400">({reseñas.length})</span>
          </div>
        )}
      </div>

      {/* Carga */}
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 size={20} className="text-slate-300 animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}

      {/* Sin reseñas */}
      {!loading && !error && reseñas.length === 0 && (
        <p className="text-xs text-slate-400 py-2">Sin reseñas aún</p>
      )}

      {/* Lista */}
      {!loading && reseñas.length > 0 && (
        <div className="divide-y divide-slate-50">
          {reseñas.map(r => <TarjetaReseña key={r.idReseña} reseña={r} />)}
        </div>
      )}

      {/* Cargar más */}
      {hayMas && !loading && (
        <button
          onClick={() => cargar(page + 1, true)}
          disabled={cargandoMas}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-60"
        >
          {cargandoMas
            ? <Loader2 size={12} className="animate-spin" />
            : <ChevronDown size={13} />}
          Ver más
        </button>
      )}

      {/* Formulario */}
      {mostrarForm && (
        <FormReseña
          idUsuario={idUsuario}
          idOrden={idOrden}
          tipoReseña={tipoReseña}
          onSuccess={handleNuevaReseña}
        />
      )}

      {/* Confirmación */}
      {yaReseñó && (
        <p className="text-xs text-green-600 font-semibold pt-1">
          ¡Gracias por tu reseña!
        </p>
      )}
    </div>
  )
}
