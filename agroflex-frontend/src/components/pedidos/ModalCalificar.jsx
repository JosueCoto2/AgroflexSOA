/**
 * ModalCalificar — Modal post-entrega para que el comprador califique al vendedor.
 *
 * Props:
 *   abierto     {boolean}   — controla visibilidad
 *   onCerrar    {function}  — callback al cerrar
 *   idOrden     {number}    — ID de la orden completada
 *   idVendedor  {number}    — ID del usuario a calificar
 *   nombreVendedor {string} — Nombre para mostrar en el título
 */
import { useState } from 'react'
import { Star, X, Send, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import usersApi from '../../api/usersApi'

// ── Componente de estrellas interactivo ────────────────────────────────────
const Estrellas = ({ valor, onChange }) => {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const activa = (hover || valor) >= n
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none transition-transform active:scale-90"
            aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
          >
            <Star
              size={32}
              className={activa
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-200 fill-slate-200'}
            />
          </button>
        )
      })}
    </div>
  )
}

const ETIQUETAS = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente']

export default function ModalCalificar({ abierto, onCerrar, idOrden, idVendedor, nombreVendedor }) {
  const [puntuacion, setPuntuacion] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviando,   setEnviando]   = useState(false)
  const [error,      setError]      = useState(null)
  const [enviado,    setEnviado]    = useState(false)

  if (!abierto) return null

  const handleCerrar = () => {
    if (enviando) return
    setPuntuacion(0)
    setComentario('')
    setError(null)
    setEnviado(false)
    onCerrar()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (puntuacion === 0) {
      setError('Selecciona una puntuación antes de enviar.')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      await usersApi.crearReseña({
        idCalificado: idVendedor,
        idOrden,
        tipoReseña: 'VENDEDOR',
        puntuacion,
        comentario: comentario.trim() || null,
      })
      setEnviado(true)
    } catch (err) {
      const msg = err?.response?.data?.mensaje
        ?? err?.response?.data?.message
        ?? 'No se pudo enviar la calificación. Inténtalo de nuevo.'
      setError(msg)
    } finally {
      setEnviando(false)
    }
  }

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && handleCerrar()}
    >
      {/* Panel */}
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Encabezado */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Califica tu experiencia</h2>
            {nombreVendedor && (
              <p className="text-xs text-slate-400 mt-0.5">
                Orden con <span className="font-medium text-slate-600">{nombreVendedor}</span>
              </p>
            )}
          </div>
          <button
            onClick={handleCerrar}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            aria-label="Cerrar"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        {/* ── Contenido */}
        <div className="px-5 py-5">
          {enviado ? (
            // Estado éxito
            <div className="flex flex-col items-center py-6 text-center gap-3">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle2 size={36} className="text-green-500" />
              </div>
              <p className="text-base font-bold text-slate-800">¡Gracias por tu reseña!</p>
              <p className="text-sm text-slate-400 max-w-xs">
                Tu calificación ayuda a otros compradores a tomar mejores decisiones.
              </p>
              <button
                onClick={handleCerrar}
                className="mt-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors active:scale-95"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Estrellas */}
              <div className="flex flex-col items-center gap-2 py-2">
                <Estrellas valor={puntuacion} onChange={setPuntuacion} />
                <span className={`text-sm font-semibold transition-colors ${
                  puntuacion > 0 ? 'text-amber-500' : 'text-slate-300'
                }`}>
                  {ETIQUETAS[puntuacion] || 'Toca para calificar'}
                </span>
              </div>

              {/* Comentario */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Comentario <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="¿Cómo fue tu experiencia con este vendedor?"
                  rows={3}
                  maxLength={500}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none transition"
                />
                <p className="text-right text-xs text-slate-300 mt-1">{comentario.length}/500</p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                  <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCerrar}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando || puntuacion === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {enviando
                    ? <Loader2 size={15} className="animate-spin" />
                    : <Send size={15} />}
                  {enviando ? 'Enviando…' : 'Publicar reseña'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
