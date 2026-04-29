import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, ChevronDown, MapPin } from 'lucide-react'
import { crearProducto, publicarLote } from '../../api/catalogApi'
import { ROUTES } from '../../routes/routeConfig'
import ImageUploader from '../../components/shared/ImageUploader'
import { STORAGE_FOLDERS } from '../../services/storageService'
import useAuthStore from '../../store/authStore'
import MunicipioSelect from '../../components/shared/MunicipioSelect/MunicipioSelect'
import LocationPickerMap from '../../components/shared/LocationPickerMap/LocationPickerMap'
import { notificarNuevoLote } from '../../services/firebase'

const FONT = { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }

const UNIDADES = [
  { value: 'kg',       label: 'Kilogramo (kg)' },
  { value: 'tonelada', label: 'Tonelada' },
  { value: 'pieza',    label: 'Pieza' },
  { value: 'caja',     label: 'Caja' },
  { value: 'saco',     label: 'Saco' },
  { value: 'litro',    label: 'Litro' },
]

const INITIAL_FORM = {
  nombreProducto:     '',
  descripcion:        '',
  precio:             '',
  imagenUrl:          '',
  ubicacion:          '',
  cantidadDisponible: '',
  unidadVenta:        'kg',
  contacto:           '',
  latitud:            null,
  longitud:           null,
}

const inputCls = (err) =>
  `w-full px-3 py-2.5 rounded-2xl border text-sm transition-colors focus:outline-none focus:ring-2 ${
    err
      ? 'border-red-400 bg-red-50 focus:ring-red-200'
      : 'border-slate-200 bg-white focus:border-emerald-400 focus:ring-emerald-100'
  }`

const themeStyles = {
  cosecha: {
    heroFrom: 'from-emerald-700',
    heroTo:   'to-lime-500',
    accent:   'text-emerald-700',
    button:   'bg-emerald-600 hover:bg-emerald-700',
    badge:    'bg-emerald-50 text-emerald-800',
    panel:    'bg-emerald-50/70 border-emerald-100',
  },
  insumo: {
    heroFrom: 'from-emerald-800',
    heroTo:   'to-emerald-500',
    accent:   'text-ambar-700',
    button:   'bg-emerald-600 hover:bg-emerald-700',
    badge:    'bg-ambar-50 text-ambar-800',
    panel:    'bg-ambar-50/70 border-ambar-100',
  },
}

function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint  && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export default function PublishHarvestPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const user     = useAuthStore(s => s.user)

  const searchParams = new URLSearchParams(location.search)
  const defaultMode = location.pathname.includes('/supplier') || location.pathname.includes('/mi-tienda')
    ? 'insumo'
    : 'cosecha'
  const mode = searchParams.get('type') === 'insumos'
    ? 'insumo'
    : searchParams.get('type') === 'cosechas'
      ? 'cosecha'
      : defaultMode

  const [form,    setForm]    = useState(INITIAL_FORM)
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.nombreProducto.trim())
      e.nombreProducto = 'El nombre del producto es obligatorio'
    if (!form.precio || Number(form.precio) <= 0)
      e.precio = 'Ingresa un precio válido (mayor a 0)'
    if (!form.ubicacion.trim())
      e.ubicacion = 'La ubicación es obligatoria'
    if (isSupplier) {
      if (!form.cantidadDisponible || Number(form.cantidadDisponible) <= 0)
        e.cantidadDisponible = 'Ingresa la cantidad disponible'
      if (!form.unidadVenta)
        e.unidadVenta = 'Selecciona la unidad de venta'
    }
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      if (isSupplier) {
        const payload = {
          tipo:             'suministro',
          nombre:           form.nombreProducto.trim(),
          descripcion:      form.descripcion.trim() || null,
          precio:           Number(form.precio),
          unidad:           form.unidadVenta,
          stock:            Number(form.cantidadDisponible),
          municipio:        form.ubicacion.trim(),
          estadoRepublica:  'Puebla',
          imagenPrincipal:  form.imagenUrl || null,
        }

        await crearProducto(payload)
      } else {
        const payload = {
          nombreProducto:     form.nombreProducto.trim(),
          descripcion:        form.descripcion.trim() || null,
          precio:             Number(form.precio),
          imagenUrl:          form.imagenUrl || null,
          ubicacion:          form.ubicacion.trim(),
          cantidadDisponible: 1,      // cosecha = lote único; la cantidad va en la descripción
          unidadVenta:        'lote', // valor fijo; el comprador no elige cantidad
          contacto:           form.contacto.trim() || null,
          latitud:            form.latitud ?? null,
          longitud:           form.longitud ?? null,
        }

        const loteCreado = await publicarLote(payload)
        await notificarNuevoLote(loteCreado?.data?.idLote ?? null)
      }

      setSuccess(true)
      setTimeout(() => navigate(ROUTES.CATALOG), 1800)
    } catch (err) {
      const data = err.response?.data
      const msg  = data?.message || data?.error || data?.mensaje
                || (err.response?.status
                    ? `Error ${err.response.status}: ${err.response.statusText}`
                    : 'Error al publicar. Verifica que el servicio esté activo.')
      setErrors({ general: msg })
    } finally {
      setLoading(false)
    }
  }

  const isSupplier = mode === 'insumo'
  const pageTitle = isSupplier ? 'Publicar insumo' : 'Publicar cosecha'
  const productLabel = isSupplier ? 'Nombre del insumo' : 'Nombre del producto'
  const productPlaceholder = isSupplier
    ? 'Ej: Fertilizante orgánico, Semillas de maíz, Malla sombra'
    : 'Ej: Chile Poblano calibre 4'
  const descriptionHint = isSupplier
    ? 'Marca, uso, compatibilidad o tipo de insumo.'
    : 'Variedad, condición, notas de cosecha…'
  const locationLabel = isSupplier ? 'Municipio de entrega' : 'Municipio de origen'
  const locationHint = isSupplier
    ? 'Selecciona el municipio donde entregas o despachas tus insumos'
    : 'Selecciona el municipio de Puebla donde se encuentra la cosecha'
  const contactHint = isSupplier
    ? 'Teléfono, correo o WhatsApp para pedidos de insumos'
    : 'Teléfono o correo para que compradores se comuniquen'
  const submitText = isSupplier ? 'Publicar insumo' : 'Publicar cosecha'
  const theme = themeStyles[mode] || themeStyles.cosecha

  if (success) {
    return (
      <div style={FONT} className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">¡Publicación exitosa!</h2>
          <p className="text-slate-500 text-sm">Redirigiendo al catálogo…</p>
        </div>
      </div>
    )
  }

  return (
    <div style={FONT} className="min-h-screen bg-slate-50">

      <div className={`relative overflow-hidden rounded-[32px] bg-gradient-to-r ${theme.heroFrom} ${theme.heroTo} px-6 py-8 sm:px-8 sm:py-10 shadow-[0_40px_120px_rgba(15,23,42,0.16)] mx-4 mt-6 mb-8`}>
        <div className="absolute inset-y-0 right-0 w-72 opacity-30 blur-3xl bg-white/20" />
        <div className="relative max-w-6xl mx-auto text-white">
          <span className={`inline-flex items-center gap-2 rounded-full ${theme.badge} px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]`}>
            {isSupplier ? 'Proveedor' : 'Productor'}
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {pageTitle}
          </h1>
          <p className="mt-4 max-w-3xl text-sm sm:text-base leading-7 text-white/85">
            {isSupplier
              ? 'Publica tus insumos con un formulario optimizado para precio, stock y entrega.'
              : 'Publica tus cosechas con una presentación clara de origen, calidad y cantidad.'}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl bg-white/10 border border-white/15 p-4">
              <p className="text-sm font-semibold text-white">{isSupplier ? 'Entrega rápida' : 'Origen claro'}</p>
            </div>
            <div className="rounded-3xl bg-white/10 border border-white/15 p-4">
              <p className="text-sm font-semibold text-white">{isSupplier ? 'Controla tu stock' : 'Muestra frescura'}</p>
            </div>
            <div className="rounded-3xl bg-white/10 border border-white/15 p-4">
              <p className="text-sm font-semibold text-white">Publica con fotos reales</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 pb-10">
        <div className="grid gap-8 lg:grid-cols-[1.6fr_0.95fr]">
          <form onSubmit={handleSubmit} className="space-y-6">

        {/* Información básica */}
        <section className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">
            Información del {isSupplier ? 'insumo' : 'producto'}
          </h2>

          <Field label={productLabel} required error={errors.nombreProducto}>
            <input
              value={form.nombreProducto}
              onChange={e => set('nombreProducto', e.target.value)}
              placeholder={productPlaceholder}
              className={inputCls(errors.nombreProducto)}
              maxLength={200}
            />
          </Field>

          <Field label="Descripción" error={errors.descripcion}
            hint={descriptionHint}>
            <textarea
              value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              placeholder={isSupplier
                ? 'Fertilizante para maíz, semillas certificadas, agroquímico soluble…'
                : 'Cosecha de esta semana, sin pesticidas, calibre uniforme…'}
              rows={3}
              maxLength={5000}
              className={`${inputCls(false)} resize-none`}
            />
            <p className="text-right text-xs text-slate-400 mt-0.5">
              {form.descripcion.length}/5000
            </p>
          </Field>
        </section>

        {/* Precio y disponibilidad */}
        <section className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Precio y disponibilidad</h2>

          {/* Label diferente según modo */}
          <Field
            label={isSupplier ? 'Precio por unidad' : 'Precio del lote (total)'}
            required
            error={errors.precio}
            hint={isSupplier
              ? 'Precio unitario que cobras por cada kg, caja, saco, etc.'
              : '¿Cuánto cobras en total por toda esta cosecha? Ej: $4,500'
            }
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input
                type="number" min="0.01" step="0.01"
                value={form.precio}
                onChange={e => set('precio', e.target.value)}
                placeholder="0.00"
                className={`${inputCls(errors.precio)} pl-7`}
              />
            </div>
          </Field>

          {/* Cantidad + Unidad: solo para suministros */}
          {isSupplier && (
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Cantidad en stock"
                required
                error={errors.cantidadDisponible}
                hint="Unidades totales que tienes disponibles"
              >
                <input
                  type="number" min="0.001" step="0.001"
                  value={form.cantidadDisponible}
                  onChange={e => set('cantidadDisponible', e.target.value)}
                  placeholder="Ej: 100"
                  className={inputCls(errors.cantidadDisponible)}
                />
              </Field>

              <Field label="Unidad" required error={errors.unidadVenta}>
                <div className="relative">
                  <select
                    value={form.unidadVenta}
                    onChange={e => set('unidadVenta', e.target.value)}
                    className={`${inputCls(errors.unidadVenta)} appearance-none pr-8`}
                  >
                    {UNIDADES.map(u => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </Field>
            </div>
          )}
        </section>

        {/* Ubicación y contacto */}
        <section className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Ubicación y contacto</h2>

          <Field label={locationLabel} required error={errors.ubicacion}
            hint={locationHint}>
            <MunicipioSelect
              value={form.ubicacion}
              onChange={v => set('ubicacion', v)}
              error={errors.ubicacion}
            />
          </Field>

          {/* Marcador exacto en el mapa */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
              <MapPin size={12} className="text-verde-500" />
              Ubicación exacta del terreno
              <span className="font-normal text-slate-400">(opcional pero recomendado)</span>
            </label>
            <LocationPickerMap
              value={form.latitud != null ? { lat: form.latitud, lng: form.longitud } : null}
              municipio={form.ubicacion || null}
              onChange={(coords) => {
                setForm(f => ({
                  ...f,
                  latitud:  coords ? coords.lat  : null,
                  longitud: coords ? coords.lng : null,
                }))
              }}
            />
            {form.latitud != null && (
              <p className="mt-1 text-xs text-verde-600 font-medium">
                Marcador colocado — aparecerá en el mapa del catálogo
              </p>
            )}
          </div>

          <Field label="Contacto" error={errors.contacto}
            hint={contactHint}>
            <input
              value={form.contacto}
              onChange={e => set('contacto', e.target.value)}
              placeholder={isSupplier
                ? 'Ej: +52 222 123 4567 o tienda@ejemplo.com'
                : 'Ej: +52 222 123 4567 o productor@ejemplo.com'}
              className={inputCls(errors.contacto)}
              maxLength={200}
            />
          </Field>
        </section>

        {/* Imagen */}
        <section className="bg-white rounded-xl border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            Foto del producto{' '}
            <span className="font-normal text-slate-400">(opcional)</span>
          </h2>
          <ImageUploader
            carpeta={STORAGE_FOLDERS.PRODUCTOS}
            userId={user?.id ?? user?.idUsuario ?? 'anonimo'}
            onUpload={url => set('imagenUrl', url ?? '')}
            onError={msg => setErrors(e => ({ ...e, imagen: msg }))}
            textoBoton="Seleccionar foto del lote"
            imagenActual={form.imagenUrl || null}
          />
          {errors.imagen && (
            <p className="mt-1 text-xs text-red-500">{errors.imagen}</p>
          )}
        </section>

        {errors.general && (
          <p className="text-sm text-red-500 text-center bg-red-50 border border-red-200 rounded-lg p-3">
            {errors.general}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-3xl text-white font-semibold text-sm shadow-xl transition-all active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed ${theme.button}`}
        >
          {loading ? 'Publicando…' : submitText}
        </button>
      </form>

      <aside className="space-y-6">
        <div className={`rounded-[28px] border ${theme.panel} p-6 shadow-card`}>
          <p className="text-xs uppercase tracking-[0.28em] font-semibold text-slate-600 mb-3">Consejos</p>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Haz tu publicación irresistible</h2>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-3">
              <span className={`mt-1 h-2.5 w-2.5 rounded-full ${theme.accent} bg-opacity-20`} />
              {isSupplier ? 'Indica si el insumo viene en caja, saco o unidad.' : 'Especifica el tipo de cosecha y su condición.'}
            </li>
            <li className="flex gap-3">
              <span className={`mt-1 h-2.5 w-2.5 rounded-full ${theme.accent} bg-opacity-20`} />
              {isSupplier ? 'Incluye precio por unidad y disponibilidad exacta.' : 'Agrega la cantidad disponible y la unidad más relevante.'}
            </li>
            <li className="flex gap-3">
              <span className={`mt-1 h-2.5 w-2.5 rounded-full ${theme.accent} bg-opacity-20`} />
              {isSupplier ? 'Define tu plazo de entrega para compradores claros.' : 'Menciona si es cosecha reciente o recién cosechada.'}
            </li>
          </ul>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-card">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400 mb-3">Atajos</p>
          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Texto claro</p>
              <p className="text-xs text-slate-500 mt-1">Un buen título ayuda a que tu oferta se encuentre más rápido.</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Imagen real</p>
              <p className="text-xs text-slate-500 mt-1">Una foto limpia hace que los compradores confíen más en tu publicación.</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </main>
</div>
  )
}
