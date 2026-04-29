/**
 * AdminBroadcast — Envío masivo de notificaciones in-app a usuarios.
 *
 * Permite al admin seleccionar un segmento (todos, por rol) y enviar un mensaje
 * que aparecerá en la campana de notificaciones de cada usuario.
 * Flujo SOA: → adminService.enviarBroadcast() → admin-service (8089) → tabla notificaciones
 */
import { useState } from 'react'
import { Megaphone, Send, Users, CheckCircle } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { useToast } from '../../components/admin/ToastNotification'

const FONT = { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }

const SEGMENTOS = [
  { value: '',           label: 'Todos los usuarios' },
  { value: 'COMPRADOR',  label: 'Compradores' },
  { value: 'PRODUCTOR',  label: 'Productores' },
  { value: 'INVERNADERO',label: 'Invernaderos' },
  { value: 'PROVEEDOR',  label: 'Proveedores' },
  { value: 'EMPAQUE',    label: 'Empacadores' },
]

const TEMPLATES = [
  { titulo: 'Mantenimiento programado', mensaje: 'La plataforma AgroFlex estará en mantenimiento el día de hoy de 02:00 a 04:00 AM. Disculpe las molestias.' },
  { titulo: '¡Nuevas funciones disponibles!', mensaje: 'Hemos lanzado nuevas mejoras en la plataforma. Explora las novedades en tu panel.' },
  { titulo: 'Recordatorio de seguridad', mensaje: 'Te recomendamos actualizar tu contraseña y revisar los dispositivos vinculados a tu cuenta.' },
]

export default function AdminBroadcast() {
  const { toast } = useToast()

  const [titulo,    setTitulo]    = useState('')
  const [mensaje,   setMensaje]   = useState('')
  const [segmento,  setSegmento]  = useState('')
  const [loading,   setLoading]   = useState(false)
  const [resultado, setResultado] = useState(null)

  const handleTemplate = (t) => {
    setTitulo(t.titulo)
    setMensaje(t.mensaje)
  }

  const handleEnviar = async (e) => {
    e.preventDefault()
    if (!titulo.trim() || !mensaje.trim()) {
      toast.error('El título y el mensaje son obligatorios')
      return
    }

    setLoading(true)
    setResultado(null)
    try {
      const res = await adminService.enviarBroadcast({
        titulo:   titulo.trim(),
        mensaje:  mensaje.trim(),
        segmento: segmento || null,
      })
      setResultado(res)
      toast.success(`Mensaje enviado a ${res.enviadas} usuarios`)
      setTitulo('')
      setMensaje('')
      setSegmento('')
    } catch {
      toast.error('Error al enviar el mensaje')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={FONT}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
          <Megaphone className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Notificaciones masivas</h1>
          <p className="text-sm text-slate-400">Envía anuncios a todos tus usuarios o por segmento</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Formulario principal */}
        <div className="lg:col-span-2">
          <form onSubmit={handleEnviar} className="bg-white rounded-2xl shadow-card p-6 space-y-4">
            {/* Segmento */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <Users className="inline w-3.5 h-3.5 mr-1 text-slate-400" />
                Destinatarios
              </label>
              <select
                value={segmento}
                onChange={e => setSegmento(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 bg-white text-slate-700 transition-all"
              >
                {SEGMENTOS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Título</label>
              <input
                type="text"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder="Ej: Mantenimiento programado"
                maxLength={200}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
              />
              <p className="text-xs text-slate-400 mt-1 text-right">{titulo.length}/200</p>
            </div>

            {/* Mensaje */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mensaje</label>
              <textarea
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
                placeholder="Escribe el cuerpo del mensaje..."
                rows={5}
                maxLength={500}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 resize-none transition-all"
              />
              <p className="text-xs text-slate-400 mt-1 text-right">{mensaje.length}/500</p>
            </div>

            <button
              type="submit"
              disabled={loading || !titulo.trim() || !mensaje.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar notificación
                </>
              )}
            </button>
          </form>

          {/* Resultado */}
          {resultado && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-700">Notificación enviada</p>
                <p className="text-xs text-green-600 mt-0.5">
                  {resultado.enviadas} notificaciones para segmento: <strong>{resultado.segmento}</strong>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Panel lateral: plantillas */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Plantillas rápidas</h3>
            <div className="space-y-2">
              {TEMPLATES.map((t, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleTemplate(t)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
                >
                  <p className="text-xs font-semibold text-slate-700 group-hover:text-purple-700">{t.titulo}</p>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{t.mensaje}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Notas</h3>
            <ul className="space-y-1.5">
              {[
                'Solo usuarios con cuentas activas reciben la notificación.',
                'Las notificaciones aparecen en la campana de la app.',
                'No se envía correo ni SMS — solo notificación in-app.',
              ].map((note, i) => (
                <li key={i} className="text-xs text-slate-500 flex gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
