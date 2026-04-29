/**
 * EntradaManual — Fallback para ingresar el código QR sin cámara.
 */
import { useState } from 'react'
import { Hash, ArrowRight, Loader2 } from 'lucide-react'

export default function EntradaManual({ onValidar, onVolver, isValidating }) {
  const [codigo, setCodigo] = useState('')
  const error = codigo.trim().length > 0 && codigo.trim().length < 20

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!codigo.trim() || isValidating) return
    onValidar(codigo.trim())
  }

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto px-4 py-8">
      <div className="w-16 h-16 bg-tinta-100 rounded-card flex items-center justify-center mb-5">
        <Hash className="w-8 h-8 text-tinta-400" />
      </div>
      <h2 className="text-base font-bold text-tinta-800 mb-1">Ingresar código manualmente</h2>
      <p className="text-xs text-tinta-400 text-center mb-6 max-w-xs">
        Escribe el código que aparece debajo del código QR del productor.
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-3">
        <input
          type="text"
          value={codigo}
          onChange={e => setCodigo(e.target.value.trim())}
          placeholder="Pega aquí el código de entrega del vendedor"
          autoFocus
          className={[
            'w-full px-4 py-3 text-sm border rounded-card bg-white text-tinta-800 font-mono',
            'outline-none focus:ring-2 focus:ring-verde-500/30 focus:border-verde-400 transition-all',
            error ? 'border-red-300 bg-red-50' : 'border-tinta-200',
          ].join(' ')}
        />
        {error && (
          <p className="text-xs text-red-500">Pega el código completo que aparece en la pantalla del vendedor.</p>
        )}

        <button
          type="submit"
          disabled={!codigo.trim() || error || isValidating}
          className="w-full flex items-center justify-center gap-2 py-3 bg-verde-400 hover:bg-verde-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-btn transition-all active:scale-95"
        >
          {isValidating
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Validando…</>
            : <><ArrowRight className="w-4 h-4" /> Validar código</>
          }
        </button>
      </form>

      {onVolver && (
        <button
          onClick={onVolver}
          className="mt-4 text-xs text-tinta-400 hover:text-tinta-600 transition-colors"
        >
          ← Volver al escáner
        </button>
      )}
    </div>
  )
}
