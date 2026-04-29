import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Save } from 'lucide-react'
import { getLoteDetalle, actualizarLote } from '../../api/catalogApi'
import { ROUTES } from '../../routes/routeConfig'
import ImageUploader from '../../components/shared/ImageUploader'
import { STORAGE_FOLDERS } from '../../services/storageService'
import MunicipioSelect from '../../components/shared/MunicipioSelect/MunicipioSelect'

const FONT = { fontFamily: '"Inter", system-ui, sans-serif' }

const inputCls = (err) =>
  `w-full px-3 py-2.5 rounded-[13px] border text-sm transition-colors focus:outline-none focus:ring-2 ${
    err
      ? 'border-red-400 bg-red-50 focus:ring-red-200'
      : 'border-campo-200 bg-white focus:border-verde-400 focus:ring-verde-100'
  }`

function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-campo-600 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-campo-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export default function EditLotePage() {
  const navigate  = useNavigate()
  const { id }    = useParams()

  const [form,    setForm]    = useState(null)   // null mientras carga
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [success, setSuccess] = useState(false)
  const [loadErr, setLoadErr] = useState(null)

  // Cargar datos actuales del lote
  useEffect(() => {
    if (!id) return
    getLoteDetalle(id)
      .then(res => {
        const l = res.data
        setForm({
          nombreProducto:     l.nombreProducto     ?? '',
          descripcion:        l.descripcion        ?? '',
          precio:             l.precio             ?? '',
          imagenUrl:          l.imagenUrl          ?? '',
          ubicacion:          l.ubicacion          ?? '',
          cantidadDisponible: l.cantidadDisponible ?? '',
          unidadVenta:        l.unidadVenta        ?? 'kg',
          contacto:           l.contacto           ?? '',
        })
      })
      .catch(() => setLoadErr('No se pudo cargar la publicación.'))
      .finally(() => setLoading(false))
  }, [id])

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.nombreProducto.trim()) e.nombreProducto = 'El nombre es obligatorio'
    if (!form.precio || Number(form.precio) <= 0) e.precio = 'Ingresa un precio válido'
    if (!form.ubicacion.trim()) e.ubicacion = 'La ubicación es obligatoria'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSaving(true)
    try {
      await actualizarLote(id, {
        nombreProducto:     form.nombreProducto.trim(),
        descripcion:        form.descripcion.trim() || null,
        precio:             Number(form.precio),
        imagenUrl:          form.imagenUrl || null,
        ubicacion:          form.ubicacion.trim(),
        cantidadDisponible: form.cantidadDisponible ? Number(form.cantidadDisponible) : undefined,
        unidadVenta:        form.unidadVenta || undefined,
        contacto:           form.contacto.trim() || null,
      })
      setSuccess(true)
      setTimeout(() => navigate(ROUTES.MIS_COSECHAS), 1600)
    } catch (err) {
      const data = err.response?.data
      const msg  = data?.message || data?.error || data?.mensaje
                || `Error ${err.response?.status ?? ''}: No se pudo guardar.`
      setErrors({ general: msg })
    } finally {
      setSaving(false)
    }
  }

  // ── Estados de pantalla completa ──────────────────────────────────────────
  if (loading) {
    return (
      <div style={FONT} className="min-h-screen bg-campo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-campo-400">
          <div className="w-8 h-8 border-2 border-verde-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Cargando publicación…</p>
        </div>
      </div>
    )
  }

  if (loadErr) {
    return (
      <div style={FONT} className="min-h-screen bg-campo-50 flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-sm text-campo-500">{loadErr}</p>
        <button
          onClick={() => navigate(ROUTES.MIS_COSECHAS)}
          className="px-4 py-2 rounded-btn bg-verde-600 text-white text-sm font-medium hover:bg-verde-700 transition-colors"
        >
          Volver a mis publicaciones
        </button>
      </div>
    )
  }

  if (success) {
    return (
      <div style={FONT} className="min-h-screen flex items-center justify-center bg-campo-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-verde-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-verde-600" />
          </div>
          <h2 className="text-lg font-bold text-campo-700 mb-1">¡Cambios guardados!</h2>
          <p className="text-sm text-campo-400">Redirigiendo a tus publicaciones…</p>
        </div>
      </div>
    )
  }

  // ── Formulario de edición ─────────────────────────────────────────────────
  return (
    <div style={FONT} className="min-h-screen bg-campo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-verde-700 via-verde-600 to-verde-500 px-4 py-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(ROUTES.MIS_COSECHAS)}
            className="p-1.5 rounded-btn bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <h1 className="text-base font-bold text-white">Editar publicación</h1>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-16">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Error general */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-card px-4 py-3 text-sm text-red-600">
              {errors.general}
            </div>
          )}

          {/* Información del producto */}
          <section className="bg-white rounded-card shadow-card border border-campo-100 p-4 space-y-4">
            <h2 className="text-sm font-semibold text-campo-600">Información del producto</h2>

            <Field label="Nombre del producto" required error={errors.nombreProducto}>
              <input
                value={form.nombreProducto}
                onChange={e => set('nombreProducto', e.target.value)}
                placeholder="Ej: Chile Poblano calibre 4"
                className={inputCls(errors.nombreProducto)}
                maxLength={200}
              />
            </Field>

            <Field label="Descripción" hint="Variedad, condición, notas de cosecha…">
              <textarea
                value={form.descripcion}
                onChange={e => set('descripcion', e.target.value)}
                rows={3}
                maxLength={5000}
                placeholder="Describe tu producto…"
                className={`${inputCls(false)} resize-none`}
              />
              <p className="text-right text-xs text-campo-400 mt-0.5">
                {form.descripcion.length}/5000
              </p>
            </Field>
          </section>

          {/* Precio y cantidad */}
          <section className="bg-white rounded-card shadow-card border border-campo-100 p-4 space-y-4">
            <h2 className="text-sm font-semibold text-campo-600">Precio y cantidad</h2>

            <Field label="Precio" required error={errors.precio} hint="Precio por unidad de venta (MXN)">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-campo-400 text-sm">$</span>
                <input
                  type="number" min="0.01" step="0.01"
                  value={form.precio}
                  onChange={e => set('precio', e.target.value)}
                  placeholder="0.00"
                  className={`${inputCls(errors.precio)} pl-7`}
                />
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Cantidad disponible" error={errors.cantidadDisponible}>
                <input
                  type="number" min="0" step="0.01"
                  value={form.cantidadDisponible}
                  onChange={e => set('cantidadDisponible', e.target.value)}
                  placeholder="0"
                  className={inputCls(errors.cantidadDisponible)}
                />
              </Field>
              <Field label="Unidad de venta">
                <select
                  value={form.unidadVenta}
                  onChange={e => set('unidadVenta', e.target.value)}
                  className={inputCls(false)}
                >
                  {['kg', 'tonelada', 'pieza', 'caja', 'saco', 'litro', 'lote'].map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          {/* Ubicación */}
          <section className="bg-white rounded-card shadow-card border border-campo-100 p-4 space-y-4">
            <h2 className="text-sm font-semibold text-campo-600">Ubicación</h2>
            <Field label="Municipio de origen" required error={errors.ubicacion}>
              <MunicipioSelect
                value={form.ubicacion}
                onChange={v => set('ubicacion', v)}
                hasError={!!errors.ubicacion}
              />
            </Field>
          </section>

          {/* Imagen */}
          <section className="bg-white rounded-card shadow-card border border-campo-100 p-4 space-y-4">
            <h2 className="text-sm font-semibold text-campo-600">Foto del producto</h2>
            <ImageUploader
              value={form.imagenUrl}
              onChange={url => set('imagenUrl', url)}
              folder={STORAGE_FOLDERS.LOTES}
            />
          </section>

          {/* Contacto */}
          <section className="bg-white rounded-card shadow-card border border-campo-100 p-4 space-y-4">
            <h2 className="text-sm font-semibold text-campo-600">Contacto</h2>
            <Field label="Teléfono o correo de contacto" hint="Dato visible para compradores interesados">
              <input
                value={form.contacto}
                onChange={e => set('contacto', e.target.value)}
                placeholder="Ej: 2221234567 o tu@correo.com"
                className={inputCls(false)}
                maxLength={150}
              />
            </Field>
          </section>

          {/* Botón guardar */}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-btn bg-verde-600 text-white font-semibold text-sm hover:bg-verde-700 transition-colors shadow-btn disabled:opacity-60"
          >
            {saving
              ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Guardando…</>
              : <><Save className="w-4 h-4" /> Guardar cambios</>
            }
          </button>
        </form>
      </main>
    </div>
  )
}
