/**
 * PerfilPage — Perfil editable del usuario autenticado (/perfil).
 * Incluye: foto de perfil (Cloudinary), descripción opcional, datos personales,
 * reputación e insignias.
 */
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  User, Mail, Phone, MapPin, Pencil, Check, X,
  ShieldCheck, Star, AlertCircle, Loader2,
  Leaf, FlaskConical, ArrowRight, Camera, Info, FileText, Upload,
} from 'lucide-react'
import useAuthStore             from '../../store/authStore'
import usersApi                 from '../../api/usersApi'
import ReseñasWidget            from '../../components/shared/ReseñasWidget'
import { ROUTES }               from '../../routes/routeConfig'
import { subirArchivo, STORAGE_FOLDERS } from '../../services/storageService'

const FONT = { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }

const ROL_LABEL = {
  COMPRADOR:   'Comprador',
  PRODUCTOR:   'Productor',
  INVERNADERO: 'Invernadero',
  PROVEEDOR:   'Proveedor',
  ADMIN:       'Administrador',
}

const ROL_COLOR = {
  COMPRADOR:   'bg-sky-50 text-sky-700 border border-sky-100',
  PRODUCTOR:   'bg-green-50 text-green-700 border border-green-100',
  INVERNADERO: 'bg-teal-50 text-teal-700 border border-teal-100',
  PROVEEDOR:   'bg-blue-50 text-blue-700 border border-blue-100',
  ADMIN:       'bg-red-50 text-red-700 border border-red-100',
}

export default function PerfilPage() {
  const { user, accessToken } = useAuthStore()

  const [perfil,      setPerfil]      = useState(null)
  const [insignias,   setInsignias]   = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [editando,    setEditando]    = useState(false)
  const [guardando,   setGuardando]   = useState(false)
  const [guardadoOk,  setGuardadoOk]  = useState(false)
  const [subiendoFoto,  setSubiendoFoto]  = useState(false)
  const [fotoPreview,   setFotoPreview]   = useState(null)  // URL local (FileReader)
  const [fotoArchivo,   setFotoArchivo]   = useState(null)  // File seleccionado
  const [fotoError,     setFotoError]     = useState(null)  // Mensaje de error de validación

  const fotoInputRef = useRef(null)

  const FORMATOS_VALIDOS = ['image/jpeg', 'image/png', 'image/webp']
  const MAX_SIZE_MB = 2

  const [form, setForm] = useState({
    nombre: '', apellidos: '', telefono: '',
    direccion: '', estadoRepublica: '', municipio: '',
    fotoPerfil: '', descripcion: '',
  })

  useEffect(() => {
    if (accessToken) cargarPerfil()
  }, [accessToken])

  async function cargarPerfil() {
    setLoading(true)
    setError(null)
    try {
      const [perfilRes, insigniasRes] = await Promise.all([
        usersApi.getMiPerfil(),
        user?.idUsuario ? usersApi.getInsignias(user.idUsuario) : Promise.resolve({ data: [] }),
      ])
      const p = perfilRes.data
      setPerfil(p)
      setInsignias(insigniasRes.data ?? [])
      setForm({
        nombre:          p.nombre          ?? '',
        apellidos:       p.apellidos       ?? '',
        telefono:        p.telefono        ?? '',
        direccion:       p.direccion       ?? '',
        estadoRepublica: p.estadoRepublica ?? '',
        municipio:       p.municipio       ?? '',
        fotoPerfil:      p.fotoPerfil      ?? '',
        descripcion:     p.descripcion     ?? '',
      })
    } catch {
      setError('No se pudo cargar tu perfil. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGuardar() {
    setGuardando(true)
    try {
      const res = await usersApi.actualizarMiPerfil(form)
      setPerfil(res.data)
      setEditando(false)
      setGuardadoOk(true)
      setTimeout(() => setGuardadoOk(false), 3000)
    } catch {
      setError('No se pudieron guardar los cambios.')
    } finally {
      setGuardando(false)
    }
  }

  function handleCancelar() {
    if (!perfil) return
    setForm({
      nombre:          perfil.nombre          ?? '',
      apellidos:       perfil.apellidos       ?? '',
      telefono:        perfil.telefono        ?? '',
      direccion:       perfil.direccion       ?? '',
      estadoRepublica: perfil.estadoRepublica ?? '',
      municipio:       perfil.municipio       ?? '',
      fotoPerfil:      perfil.fotoPerfil      ?? '',
      descripcion:     perfil.descripcion     ?? '',
    })
    setEditando(false)
    setError(null)
  }

  // Paso 1 — validar y generar preview local (no sube nada todavía)
  function handleFotoSeleccionada(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setFotoError(null)

    if (!FORMATOS_VALIDOS.includes(file.type)) {
      setFotoError(`Formato no permitido: ${file.type || 'desconocido'}. Solo se aceptan JPG, PNG o WEBP.`)
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFotoError(`La imagen pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. El límite es ${MAX_SIZE_MB} MB.`)
      return
    }

    // Preview local inmediato
    const reader = new FileReader()
    reader.onload = ev => {
      setFotoPreview(ev.target.result)
      setFotoArchivo(file)
    }
    reader.readAsDataURL(file)
  }

  // Paso 2 — confirmar y subir a Cloudinary
  async function handleConfirmarFoto() {
    const userId = perfil?.idUsuario ?? user?.id
    if (!fotoArchivo || !userId) return
    setSubiendoFoto(true)
    setFotoError(null)
    try {
      const result = await subirArchivo({
        archivo: fotoArchivo,
        carpeta: STORAGE_FOLDERS.PERFILES,
        userId:  String(userId),
      })
      const updated = { ...form, fotoPerfil: result.url }
      setForm(updated)
      await usersApi.actualizarMiPerfil(updated)
      setPerfil(p => ({ ...p, fotoPerfil: result.url }))
      // Sincronizar foto al store para que el Navbar la muestre de inmediato
      useAuthStore.setState(s => ({ user: { ...s.user, fotoPerfil: result.url } }))
      setFotoPreview(null)
      setFotoArchivo(null)
    } catch {
      setFotoError('No se pudo subir la foto. Intenta de nuevo.')
    } finally {
      setSubiendoFoto(false)
    }
  }

  function handleCancelarFoto() {
    setFotoPreview(null)
    setFotoArchivo(null)
    setFotoError(null)
  }

  const roles   = perfil?.roles ?? user?.roles ?? []
  const nombre  = `${perfil?.nombre ?? user?.nombre ?? ''} ${perfil?.apellidos ?? ''}`.trim() || 'Usuario'
  const inicial = nombre.charAt(0).toUpperCase()
  const fotoPerfil = perfil?.fotoPerfil ?? null
  const isVendor = roles.some(r => ['PRODUCTOR', 'INVERNADERO', 'PROVEEDOR', 'ADMIN'].includes(r))
  const promedio = parseFloat(perfil?.puntuacionRep ?? 0)

  return (
    <div style={FONT} className="min-h-screen bg-slate-50">

      {/* ── Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-800">Mi Perfil</h1>
          {!loading && perfil && !editando && (
            <button
              onClick={() => setEditando(true)}
              className="flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
            >
              <Pencil size={15} />
              Editar perfil
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Alertas */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-100">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={cargarPerfil} className="underline text-xs">Reintentar</button>
          </div>
        )}
        {guardadoOk && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 text-sm rounded-xl px-4 py-3 border border-green-100">
            <Check size={16} />
            Perfil actualizado correctamente
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-2xl border border-slate-100 flex items-center justify-center py-20">
            <Loader2 size={28} className="text-green-500 animate-spin" />
          </div>
        )}

        {/* ── Modal de vista previa de foto */}
        {fotoPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-xs shadow-2xl overflow-hidden">
              <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">Vista previa</h3>
                <button onClick={handleCancelarFoto} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 flex flex-col items-center gap-4">
                {/* Preview circular */}
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-md">
                  <img src={fotoPreview} alt="Vista previa" className="w-full h-full object-cover" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">{fotoArchivo?.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {(fotoArchivo?.size / 1024 / 1024).toFixed(2)} MB · {fotoArchivo?.type.replace('image/', '').toUpperCase()}
                  </p>
                </div>
                {fotoError && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2 w-full">
                    <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600">{fotoError}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3 px-5 pb-5">
                <button
                  onClick={handleCancelarFoto}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarFoto}
                  disabled={subiendoFoto}
                  className="flex-1 py-2.5 rounded-xl bg-green-600 text-sm font-bold text-white hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {subiendoFoto
                    ? <><Loader2 size={14} className="animate-spin" /> Subiendo…</>
                    : <><Upload size={14} /> Usar esta foto</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Modal de error de validación (sin preview) */}
        {fotoError && !fotoPreview && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            <span className="flex-1">{fotoError}</span>
            <button onClick={() => setFotoError(null)} className="flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Hero del perfil */}
        {!loading && perfil && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">

            {/* Banner de color */}
            <div className="h-24 bg-gradient-to-r from-green-700 via-green-500 to-lime-400" />

            <div className="px-5 pb-5 -mt-12">
              {/* Avatar */}
              <div className="flex items-end justify-between mb-3">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-green-700 flex items-center justify-center">
                    {fotoPerfil ? (
                      <img src={fotoPerfil} alt={nombre} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-white">{inicial}</span>
                    )}
                  </div>
                  {/* Botón cambiar foto */}
                  <button
                    onClick={() => fotoInputRef.current?.click()}
                    disabled={subiendoFoto}
                    title="Cambiar foto de perfil"
                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center shadow-sm transition-colors disabled:opacity-60"
                  >
                    {subiendoFoto
                      ? <Loader2 size={13} className="animate-spin" />
                      : <Camera size={13} />}
                  </button>
                  <input
                    ref={fotoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFotoSeleccionada}
                  />
                </div>

                {/* Puntuación */}
                {promedio > 0 && (
                  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl">
                    <Star size={15} className="text-amber-400 fill-amber-400" />
                    <span className="font-bold text-slate-700 text-sm">{promedio.toFixed(1)}</span>
                    <span className="text-xs text-slate-400">({perfil.totalReseñas ?? 0})</span>
                  </div>
                )}
              </div>

              {/* Nombre y rol */}
              <div className="mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-800">{nombre}</h2>
                  {perfil.validado && (
                    <ShieldCheck size={18} className="text-green-600 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-slate-400 mb-2">{perfil.correo ?? user?.correo}</p>
                <div className="flex flex-wrap gap-1.5">
                  {roles.map(r => (
                    <span key={r} className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${ROL_COLOR[r] ?? 'bg-slate-100 text-slate-600'}`}>
                      {ROL_LABEL[r] ?? r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Descripción — modo vista */}
              {!editando && (
                perfil.descripcion ? (
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                    {perfil.descripcion}
                  </p>
                ) : (
                  <button
                    onClick={() => setEditando(true)}
                    className="w-full flex items-center gap-2 text-sm text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl px-4 py-3 hover:border-green-300 hover:text-green-600 transition-colors text-left"
                  >
                    <Info size={15} className="flex-shrink-0" />
                    Agrega una descripción para que otros sepan quién eres
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* ── Formulario de edición */}
        {!loading && perfil && editando && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Pencil size={15} className="text-green-600" />
              Editar información
            </h3>

            <form onSubmit={e => { e.preventDefault(); handleGuardar() }} className="space-y-4">

              {/* Descripción — campo destacado con prompt */}
              <div>
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1.5">
                  <FileText size={13} />
                  Descripción
                  <span className="ml-auto text-slate-300 font-normal">Opcional</span>
                </label>
                <textarea
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Cuéntale a los demás quién eres, qué ofreces o qué buscas en AgroFlex. Una buena descripción genera más confianza."
                  rows={3}
                  maxLength={1000}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none transition placeholder:text-slate-300"
                />
                {!form.descripcion && (
                  <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5 mt-1.5 flex items-center gap-1.5">
                    <Info size={12} />
                    Los perfiles con descripción generan más confianza entre compradores y vendedores
                  </p>
                )}
                <p className="text-xs text-slate-300 text-right mt-1">{form.descripcion.length}/1000</p>
              </div>

              <hr className="border-slate-100" />

              {/* Nombre y apellidos */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nombre"    value={form.nombre}    onChange={v => setForm(f => ({ ...f, nombre: v }))} />
                <Field label="Apellidos" value={form.apellidos} onChange={v => setForm(f => ({ ...f, apellidos: v }))} />
              </div>

              {/* Teléfono */}
              <Field label="Teléfono" value={form.telefono} onChange={v => setForm(f => ({ ...f, telefono: v }))} type="tel" />

              {/* Dirección */}
              <Field label="Dirección" value={form.direccion} onChange={v => setForm(f => ({ ...f, direccion: v }))} />

              {/* Estado y municipio */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Estado"    value={form.estadoRepublica} onChange={v => setForm(f => ({ ...f, estadoRepublica: v }))} />
                <Field label="Municipio" value={form.municipio}       onChange={v => setForm(f => ({ ...f, municipio: v }))} />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-60"
                >
                  {guardando ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {guardando ? 'Guardando…' : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelar}
                  disabled={guardando}
                  className="px-4 flex items-center gap-1.5 border border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-60"
                >
                  <X size={15} />
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Datos de contacto (vista) */}
        {!loading && perfil && !editando && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Información de contacto</h3>
            <dl className="space-y-3">
              <InfoRow icon={User}   label="Nombre completo" value={nombre} />
              <InfoRow icon={Mail}   label="Correo"          value={perfil.correo ?? '—'} />
              <InfoRow icon={Phone}  label="Teléfono"        value={perfil.telefono || '—'} />
              <InfoRow icon={MapPin} label="Ubicación"
                value={[perfil.municipio, perfil.estadoRepublica].filter(Boolean).join(', ') || '—'} />
              {perfil.direccion && (
                <InfoRow icon={MapPin} label="Dirección" value={perfil.direccion} />
              )}
            </dl>
          </div>
        )}

        {/* ── Reputación */}
        {!loading && perfil && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-700">Reputación</h3>
              {promedio > 0 && (
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} size={14}
                      className={promedio >= n ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
                  ))}
                </div>
              )}
            </div>

            {promedio === 0 && (perfil.totalReseñas ?? 0) === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Aún no tienes calificaciones</p>
            ) : (
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <p className="text-4xl font-extrabold text-slate-800 leading-none">{promedio.toFixed(1)}</p>
                  <p className="text-xs text-slate-400 mt-1">de 5.0</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500">
                    {perfil.totalReseñas ?? 0} {(perfil.totalReseñas ?? 0) === 1 ? 'calificación' : 'calificaciones'}
                  </p>
                  {perfil.validado && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1">
                      <ShieldCheck size={11} /> Perfil verificado
                    </span>
                  )}
                </div>
              </div>
            )}

            <ReseñasWidget idUsuario={perfil.idUsuario} />
          </div>
        )}

        {/* ── Insignias */}
        {!loading && insignias.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Insignias</h3>
            <div className="space-y-2.5">
              {insignias.map(ins => (
                <div key={ins.idInsignia} className="flex items-center gap-3 py-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    ins.estadoVerificacion === 'APROBADA' ? 'bg-green-50' : 'bg-slate-50'}`}>
                    <ShieldCheck size={16} className={
                      ins.estadoVerificacion === 'APROBADA' ? 'text-green-500' : 'text-slate-300'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 capitalize">
                      {ROL_LABEL[ins.tipoDocumento] ?? ins.tipoDocumento}
                    </p>
                    {ins.nombreNegocio && (
                      <p className="text-xs text-slate-400 truncate">{ins.nombreNegocio}</p>
                    )}
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    ins.estadoVerificacion === 'APROBADA'  ? 'bg-green-50 text-green-700 border border-green-100' :
                    ins.estadoVerificacion === 'PENDIENTE' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                    'bg-red-50 text-red-700 border border-red-100'}`}>
                    {ins.estadoVerificacion}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Mis publicaciones (solo vendedores) */}
        {!loading && perfil && isVendor && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-700">Mis publicaciones</h3>
              <Link
                to={ROUTES.MIS_COSECHAS}
                className="flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 transition-colors"
              >
                Ver todas
                <ArrowRight size={13} />
              </Link>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Gestiona tus cosechas e insumos publicados: edita precios, actualiza fotos o elimina lotes.
            </p>
            <Link
              to={ROUTES.MIS_COSECHAS}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
            >
              <Leaf size={15} />
              Ir a mis publicaciones
            </Link>
          </div>
        )}

        {/* ── Solicitar insignia (solo compradores) */}
        {!loading && perfil && !isVendor && (          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-green-600 mb-1">¿Quieres vender?</p>
              <h3 className="text-base font-bold text-slate-800">Solicita tu insignia de vendedor</h3>
              <p className="text-sm text-slate-500 mt-1">
                Obtén tu insignia para publicar cosechas o abrir una tienda de insumos.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link to={`${ROUTES.VERIFY_BADGE}?type=cosechas`}
                className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-green-50 p-4 hover:border-green-300 transition-colors">
                <Leaf className="w-5 h-5 text-green-600" />
                <p className="text-sm font-semibold text-slate-800">Cosechas</p>
                <span className="text-xs text-green-700 font-semibold flex items-center gap-1">
                  Pedir insignia <ArrowRight size={12} />
                </span>
              </Link>
              <Link to={`${ROUTES.VERIFY_BADGE}?type=insumos`}
                className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-sky-50 p-4 hover:border-sky-300 transition-colors">
                <FlaskConical className="w-5 h-5 text-sky-600" />
                <p className="text-sm font-semibold text-slate-800">Insumos</p>
                <span className="text-xs text-sky-700 font-semibold flex items-center gap-1">
                  Pedir insignia <ArrowRight size={12} />
                </span>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={14} className="text-slate-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700 truncate">{value}</p>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
      />
    </div>
  )
}
