/**
 * VerifyBadgePage — Solicitud de insignia de vendedor.
 *
 * Flujo:
 *  1. Seleccionar rol: Productor | Proveedor
 *  2. Datos básicos del negocio
 *  → Auto-aprobado → redirige al catálogo
 */
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Leaf, FlaskConical,
  MapPin, Building2, Sprout,
} from 'lucide-react'
import { useAuth }     from '../../hooks/useAuth'
import { ROUTES }      from '../../routes/routeConfig'

// ── Roles disponibles para solicitar
const ROLES_OPCIONES = [
  {
    id:              'PRODUCTOR',
    label:           'Productor',
    icon:            Leaf,
    color:           'green',
    descripcion:     'Cultivas y cosechas productos agrícolas para venta directa.',
    ejemplos:        'Chile, jitomate, cebolla, maíz…',
    pageTitle:       'Cuéntanos sobre tu actividad',
    nameLabel:       'Nombre del productor o rancho',
    placeholderName: 'Ej. Rancho San José o un nombre simple',
  },
  {
    id:              'PROVEEDOR',
    label:           'Proveedor',
    icon:            FlaskConical,
    color:           'blue',
    descripcion:     'Vendes insumos, herramientas o servicios al sector agrícola.',
    ejemplos:        'Fertilizantes, semillas, malla sombra…',
    pageTitle:       'Cuéntanos sobre tu negocio',
    nameLabel:       'Nombre del negocio',
    placeholderName: 'Ej. AgroInsumos La Sierra',
  },
]

const colorStyles = {
  green: {
    ring:    'ring-green-500',
    bg:      'bg-green-50',
    icon:    'bg-green-100 text-green-600',
    badge:   'bg-green-600 text-white',
    check:   'border-green-500 bg-green-500',
  },
  teal: {
    ring:    'ring-teal-500',
    bg:      'bg-teal-50',
    icon:    'bg-teal-100 text-teal-600',
    badge:   'bg-teal-600 text-white',
    check:   'border-teal-500 bg-teal-500',
  },
  blue: {
    ring:    'ring-blue-500',
    bg:      'bg-blue-50',
    icon:    'bg-blue-100 text-blue-600',
    badge:   'bg-blue-600 text-white',
    check:   'border-blue-500 bg-blue-500',
  },
}

const ROLE_HELP = {
  PRODUCTOR: {
    title: 'Perfecto para productores',
    description: 'No necesitas un nombre comercial complejo. Un rancho simple, un campo o tu propio nombre bastan.',
    note: 'Publica cosechas frescas con un perfil directo y fácil de reconocer.',
  },
  PROVEEDOR: {
    title: 'Ideal para proveedores',
    description: 'Elige un nombre claro para que compradores identifiquen tu tienda de insumos.',
    note: 'Vende fertilizantes, semillas y herramientas con confianza y visibilidad.',
  },
}

// ── Componente indicador de pasos
function StepIndicator({ step }) {
  const steps = ['Tipo', 'Datos']
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => {
        const idx     = i + 1
        const done    = step > idx
        const current = step === idx
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className={[
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                done    ? 'bg-green-600 text-white' :
                current ? 'bg-slate-900 text-white' :
                          'bg-slate-100 text-slate-400',
              ].join(' ')}>
                {done ? '✓' : idx}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${current ? 'text-slate-900' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-px ${step > idx ? 'bg-green-500' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── PASO 1: Selección de rol
function Step1RolSelector({ rolSeleccionado, onChange, onNext }) {
  return (
    <div className="space-y-6">
      <div>
        <span className="section-label">Paso 1</span>
        <StepIndicator step={1} />
        <h2 className="section-title text-slate-900">Elige tu perfil vendedor</h2>
        <p className="mt-3 text-sm text-slate-500 max-w-2xl">
          Selecciona si quieres publicar cosechas como productor o abrir tu tienda de insumos como proveedor.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {ROLES_OPCIONES.map(({ id, label, icon: Icon, color, descripcion, ejemplos }) => {
          const styles = colorStyles[color]
          const selected = rolSeleccionado === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={[
                'group relative overflow-hidden rounded-[24px] border transition-all text-left p-6 min-h-[220px] shadow-sm',
                selected
                  ? `border-emerald-300 bg-emerald-50 shadow-md ring-1 ring-emerald-200`
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg',
              ].join(' ')}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{label}</p>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">{descripcion}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${styles.icon}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-auto">
                <p className="text-[11px] text-slate-400 italic">{ejemplos}</p>
                {selected && (
                  <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    ✓ Seleccionado
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        disabled={!rolSeleccionado}
        onClick={onNext}
        className="btn-primary w-full justify-center"
      >
        Siguiente
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// ── PASO 2: Formulario de datos
function Step2Datos({ rol, form, onChange, onBack, onSubmit, loading, serverError }) {
  const rolInfo = ROLES_OPCIONES.find(r => r.id === rol)
  const Icon = rolInfo?.icon

  const handleChange = (field) => (e) => onChange(field, e.target.value)

  const canSubmit = form.nombre.trim() && form.municipio.trim() && form.estado.trim()

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <span className="section-label">Paso 2</span>
        <StepIndicator step={2} />
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{rolInfo?.label ?? 'Perfil vendedor'}</span>
          {rolInfo && Icon && (
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${colorStyles[rolInfo.color]?.bg ?? 'bg-slate-100'} ${colorStyles[rolInfo.color]?.icon ?? 'text-slate-700'}`}>
              <Icon className="w-3.5 h-3.5" />
              {rolInfo.label}
            </span>
          )}
        </div>
        <h2 className="section-title text-slate-900">
          {rolInfo?.pageTitle ?? 'Cuéntanos sobre tu negocio'}
        </h2>
        <p className="mt-3 text-sm text-slate-500 max-w-2xl">
          Esta información ayuda a verificar tu identidad como{' '}
          <strong className="text-slate-700">{rolInfo?.label}</strong>.
        </p>
        <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {rol === 'PRODUCTOR'
            ? 'Un nombre sencillo es suficiente: tu rancho, parcela o tu nombre personal funcionarán muy bien.'
            : 'Un nombre claro hace que compradores identifiquen mejor tu tienda de insumos.'}
        </div>
      </div>

      {serverError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <span className="mt-0.5">⚠</span>
          <span>{serverError}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">

        {/* Nombre del negocio */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
            {rolInfo?.nameLabel ?? 'Nombre del negocio o rancho'} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={form.nombre}
              onChange={handleChange('nombre')}
              placeholder={rolInfo?.placeholderName ?? 'Ej. Rancho San José, Rancho La Esperanza…'}
              maxLength={120}
              required
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
            />
          </div>
        </div>

        {/* Municipio */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
            Municipio <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={form.municipio}
              onChange={handleChange('municipio')}
              placeholder="Ej. Tepeaca"
              maxLength={80}
              required
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
            />
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
            Estado <span className="text-red-500">*</span>
          </label>
          <select
            value={form.estado}
            onChange={handleChange('estado')}
            required
            className="input-field"
          >
            <option value="">Selecciona un estado…</option>
            {ESTADOS_MX.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>

        {/* Descripción */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
            Descripción de tu actividad{' '}
            <span className="text-slate-400 font-normal normal-case">(opcional)</span>
          </label>
          <textarea
            value={form.descripcion}
            onChange={handleChange('descripcion')}
            placeholder="Describe brevemente qué produces o vendes, cuánto tiempo llevas en el negocio, etc."
            rows={3}
            maxLength={500}
            className="input-field resize-none"
          />
          <p className="text-[11px] text-slate-400 mt-1 text-right">
            {form.descripcion.length}/500
          </p>
        </div>

      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary w-full sm:w-auto justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
          Atrás
        </button>
        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="btn-primary w-full sm:w-auto justify-center"
        >
          {loading ? 'Enviando…' : 'Enviar solicitud'}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </form>
  )
}

// ── Componente principal
export default function VerifyBadgePage() {
  const { user, solicitarInsignia } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const type = searchParams.get('type')
  const directMode = type === 'cosechas' || type === 'insumos'
  const initialRole = type === 'insumos' ? 'PROVEEDOR' : type === 'cosechas' ? 'PRODUCTOR' : ''

  const [step,        setStep]        = useState(directMode ? 2 : 1)
  const [rol,         setRol]         = useState(initialRole)
  const [loading,     setLoading]     = useState(false)
  const [serverError, setServerError] = useState('')
  const [form,        setForm]        = useState({
    nombre:      '',
    municipio:   '',
    estado:      '',
    descripcion: '',
  })

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setServerError('')
    try {
      await solicitarInsignia({
        rol,
        nombreNegocio: form.nombre,
        municipio:     form.municipio,
        estado:        form.estado,
        descripcion:   form.descripcion || null,
      })
      // Navegar directo al catálogo — el store ya tiene el nuevo rol
      navigate(ROUTES.CATALOG, { replace: true })
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Error al enviar la solicitud'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-slate-50 flex flex-col"
      style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
    >
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 pt-6">
        <div className="overflow-hidden rounded-[28px] bg-gradient-to-r from-emerald-800 via-emerald-700 to-lime-500 p-6 shadow-card text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                Solicitud de insignia
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight">
                Activa tu perfil vendedor en AgroFlex
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
                Completa tu solicitud y publica cosechas o insumos directamente en la plataforma. El proceso es rápido y el diseño está pensado para que sea sencillo.
              </p>
            </div>
            <div className="rounded-3xl bg-white/10 border border-white/15 px-4 py-3 text-sm font-semibold text-white backdrop-blur-sm">
              Paso {step} de 2
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {!directMode && step === 1 && (
              <div className="card p-6">
                <Step1RolSelector
                  rolSeleccionado={rol}
                  onChange={setRol}
                  onNext={() => setStep(2)}
                />
              </div>
            )}
            {step === 2 && (
              <div className="card p-6">
                <Step2Datos
                  rol={rol}
                  form={form}
                  onChange={handleFormChange}
                  onBack={() => directMode ? navigate(-1) : setStep(1)}
                  onSubmit={handleSubmit}
                  loading={loading}
                  serverError={serverError}
                />
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="page-section p-5">
              <p className="section-label">Consejo</p>
              <h2 className="section-title">{ROLE_HELP[rol]?.title ?? 'Consejo rápido'}</h2>
              <p className="mt-3 text-sm text-slate-600">
                {ROLE_HELP[rol]?.description ?? 'Selecciona un perfil para ver recomendaciones personalizadas y completar tu solicitud con confianza.'}
              </p>
              <p className="mt-4 text-xs text-slate-400">
                {ROLE_HELP[rol]?.note ?? 'Este paso solo activa tu insignia vendedor. Tu registro como usuario sigue igual.'}
              </p>
            </div>

            <div className="page-section p-5">
              <p className="section-label">¿Qué sigue?</p>
              <h2 className="section-title">Publicación rápida</h2>
              <p className="mt-3 text-sm text-slate-600">
                Después de enviar tu solicitud, podrás publicar tu primer producto en el catálogo. La solicitud se procesa automáticamente cuando la información básica está lista.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

// ── Lista de estados de México
const ESTADOS_MX = [
  'Aguascalientes','Baja California','Baja California Sur','Campeche',
  'Chiapas','Chihuahua','Ciudad de México','Coahuila','Colima',
  'Durango','Guanajuato','Guerrero','Hidalgo','Jalisco','Estado de México',
  'Michoacán','Morelos','Nayarit','Nuevo León','Oaxaca','Puebla',
  'Querétaro','Quintana Roo','San Luis Potosí','Sinaloa','Sonora',
  'Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatán','Zacatecas',
]
