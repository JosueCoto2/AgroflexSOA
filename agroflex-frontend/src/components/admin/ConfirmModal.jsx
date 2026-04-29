import { useEffect, useRef, useState } from 'react'
import { X, Loader2 } from 'lucide-react'

/**
 * ConfirmModal — Modal genérico de confirmación.
 * Props: open, title, message, icon, confirmLabel, cancelLabel,
 *        confirmClass, onConfirm(motivo), onCancel,
 *        requireMotivo (boolean), motivoLabel, loading
 */
export default function ConfirmModal({
  open,
  title,
  message,
  icon: Icon,
  confirmLabel = 'Confirmar',
  cancelLabel  = 'Cancelar',
  confirmClass = 'bg-green-600 hover:bg-green-700 text-white',
  onConfirm,
  onCancel,
  requireMotivo = false,
  motivoLabel   = 'Motivo',
  loading       = false,
}) {
  const [motivo, setMotivo] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setMotivo('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  if (!open) return null

  const canConfirm = !requireMotivo || motivo.trim().length >= 3

  const handleConfirm = () => {
    if (!canConfirm || loading) return
    onConfirm(motivo.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm animate-fade-up overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-slate-600" />
                </div>
              )}
              <h3 className="text-base font-bold text-slate-800">{title}</h3>
            </div>
            <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensaje */}
          <p className="text-sm text-slate-600 mb-4">{message}</p>

          {/* Campo motivo */}
          {requireMotivo && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">{motivoLabel}</label>
              <textarea
                ref={inputRef}
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
                rows={3}
                placeholder="Escribe el motivo..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all resize-none"
              />
              {motivo.trim().length > 0 && motivo.trim().length < 3 && (
                <p className="text-xs text-red-500 mt-1">Mínimo 3 caracteres</p>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-2.5 px-4 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={handleConfirm}
              disabled={!canConfirm || loading}
              className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 ${confirmClass}`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
