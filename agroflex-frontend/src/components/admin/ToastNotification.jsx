/**
 * ToastNotification — sistema de notificaciones toast para el panel admin.
 *
 * Uso:
 *   import { useToast, ToastContainer } from './ToastNotification'
 *   const { toast } = useToast()
 *   toast.success('Acción completada')
 *   toast.error('Algo salió mal')
 */
import { useState, useCallback, createContext, useContext, useEffect } from 'react'
import { CheckCircle, XCircle, X, Loader2 } from 'lucide-react'

const ToastCtx = createContext(null)

let _addToast = null

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, msg, type }])
    if (type !== 'loading') {
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
    }
    return id
  }, [])

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  _addToast = add

  return (
    <ToastCtx.Provider value={{ add, remove }}>
      {children}
      {/* Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <Toast key={t.id} {...t} onDismiss={() => remove(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

function Toast({ msg, type, onDismiss }) {
  const icons = {
    success: <CheckCircle className="w-4 h-4 text-green-600" />,
    error:   <XCircle className="w-4 h-4 text-red-500" />,
    loading: <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />,
  }
  const bg = {
    success: 'bg-white border-green-200',
    error:   'bg-white border-red-200',
    loading: 'bg-white border-blue-200',
  }

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-card text-sm font-medium text-slate-700 animate-fade-up ${bg[type] ?? bg.success}`}
      style={{ minWidth: 220, maxWidth: 340 }}
    >
      {icons[type]}
      <span className="flex-1">{msg}</span>
      <button onClick={onDismiss} className="text-slate-300 hover:text-slate-500 ml-1">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  return {
    toast: {
      success: (msg) => ctx?.add(msg, 'success'),
      error:   (msg) => ctx?.add(msg, 'error'),
      loading: (msg) => ctx?.add(msg, 'loading'),
    }
  }
}
