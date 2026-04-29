/**
 * PublicProfilePage — Perfil público de un vendedor/productor.
 * Ruta: /vendedor/:id
 * Visible para cualquier usuario (autenticado o no).
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MapPin, ShieldCheck, Star,
  AlertCircle, Loader2,
} from 'lucide-react'
import usersApi from '../../api/usersApi'
import ReseñasWidget from '../../components/shared/ReseñasWidget'

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

export default function PublicProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [perfil,    setPerfil]    = useState(null)
  const [insignias, setInsignias] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    Promise.all([
      usersApi.getPerfilPublico(id),
      usersApi.getInsignias(id),
    ])
      .then(([perfilRes, insigniasRes]) => {
        setPerfil(perfilRes.data)
        setInsignias(insigniasRes.data ?? [])
      })
      .catch(() => setError('No se pudo cargar el perfil de este vendedor.'))
      .finally(() => setLoading(false))
  }, [id])

  const nombre   = perfil ? `${perfil.nombre ?? ''} ${perfil.apellidos ?? ''}`.trim() : '...'
  const inicial  = nombre.charAt(0).toUpperCase()
  const promedio = parseFloat(perfil?.puntuacionRep ?? 0)
  const ubicacion = [perfil?.municipio, perfil?.estadoRepublica].filter(Boolean).join(', ')

  return (
    <div style={FONT} className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} />
            Regresar
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-100">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-100 flex items-center justify-center py-24">
            <Loader2 size={28} className="text-green-500 animate-spin" />
          </div>
        )}

        {/* Hero */}
        {!loading && perfil && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-green-700 via-green-500 to-lime-400" />
            <div className="px-5 pb-5 -mt-12">
              <div className="flex items-end justify-between mb-3">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-green-700 flex items-center justify-center flex-shrink-0">
                  {perfil.fotoPerfil ? (
                    <img src={perfil.fotoPerfil} alt={nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-white">{inicial}</span>
                  )}
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

              {/* Nombre y roles */}
              <div className="mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-slate-800">{nombre}</h1>
                  {perfil.validado && (
                    <ShieldCheck size={18} className="text-green-600 flex-shrink-0" />
                  )}
                </div>
                {ubicacion && (
                  <p className="flex items-center gap-1 text-sm text-slate-400 mt-0.5">
                    <MapPin size={13} />
                    {ubicacion}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(perfil.roles ?? []).map(r => (
                    <span key={r} className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${ROL_COLOR[r] ?? 'bg-slate-100 text-slate-600'}`}>
                      {ROL_LABEL[r] ?? r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Descripción (si el backend la devuelve) */}
              {perfil.descripcion && (
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 mt-3">
                  {perfil.descripcion}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Reputación */}
        {!loading && perfil && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-700">Reputación</h2>
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
              <p className="text-sm text-slate-400 text-center py-4">Este vendedor aún no tiene calificaciones</p>
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

        {/* Insignias */}
        {!loading && insignias.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h2 className="text-sm font-bold text-slate-700 mb-3">Insignias verificadas</h2>
            <div className="space-y-2.5">
              {insignias.filter(i => i.estadoVerificacion === 'APROBADA').map(ins => (
                <div key={ins.idInsignia} className="flex items-center gap-3 py-1">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={16} className="text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 capitalize">
                      {ROL_LABEL[ins.tipoDocumento] ?? ins.tipoDocumento}
                    </p>
                    {ins.nombreNegocio && (
                      <p className="text-xs text-slate-400 truncate">{ins.nombreNegocio}</p>
                    )}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                    Verificado
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
