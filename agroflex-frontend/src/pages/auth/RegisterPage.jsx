import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import AgroFlexLogo from '../../components/common/Logo/AgroFlexLogo'
import { ROUTES } from '../../routes/routeConfig'

const schema = yup.object({
  nombre: yup.string().required('El nombre es requerido'),
  apellidos: yup.string().required('Los apellidos son requeridos'),
  correo: yup.string().email('Correo inválido').required('El correo es requerido'),
  telefono: yup.string().optional(),
  password: yup
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .matches(/[A-Z]/, 'Debe incluir al menos una mayúscula')
    .matches(/[0-9]/, 'Debe incluir al menos un número')
    .required('La contraseña es requerida'),
  confirmarPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
})

const RegisterPage = () => {
  const navigate = useNavigate()
  const { register: registerUser, isLoading, error, clearError, isAuthenticated } = useAuthStore()
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Si ya está autenticado, lo enviamos al catálogo
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.CATALOG, { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Limpiar errores residuales del store al entrar a la página
  useEffect(() => { clearError() }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) })

  // ── Registro directo ────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    clearError()
    try {
      await registerUser({
        nombre: data.nombre,
        apellidos: data.apellidos,
        correo: data.correo,
        telefono: data.telefono || null,
        password: data.password,
      })
      navigate(ROUTES.CATALOG, { replace: true })
    } catch {
      // El error se muestra desde el store
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">

      {/* Hero lateral para escritorio */}
      <aside className="hidden lg:flex lg:w-5/12 auth-hero-bg">
        <div className="auth-hero-overlay" />
        <div className="relative z-10 flex flex-col justify-between p-10 text-white">
          <div>
            <AgroFlexLogo size="lg" variant="light" showText={true} />
            <h2 className="auth-hero-title font-heading text-4xl lg:text-5xl mt-8 mb-4">¡Tu comunidad agrícola en línea!</h2>
            <p className="auth-hero-subtitle font-body text-lg lg:text-xl">
              Regístrate como usuario y, cuando estés listo, solicita la habilitación para vender tus cosechas o abrir tu tienda de insumos.
            </p>
          </div>
          <p className="text-white/70 text-xs">2026 AgroFlex · Conectando campo y ciudad</p>
        </div>
      </aside>

      <main className="flex-1 flex items-center justify-center py-10 px-4 lg:px-8">
        <div className="w-full max-w-md auth-form-wrapper">
          <div className="mb-6 text-center">
            <h1 className="font-display text-3xl text-slate-900 mb-2">Regístrate y vende en AgroFlex</h1>
            <p className="font-soft text-slate-600 text-sm">Crea tu cuenta en menos de un minuto y comienza a operar sin intermediarios.</p>
          </div>

          {/* Error global del store */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl
                            px-4 py-3 mb-5 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* ── Formulario de registro ──────────────────────────────── */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                {/* Nombre */}
                <div>
                  <label className="field-label">Nombre *</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2
                                               -translate-y-1/2 text-info"/>
                    <input {...register('nombre')} type="text"
                      placeholder="Tu nombre" className="input-field pl-9"/>
                  </div>
                  {errors.nombre && (
                    <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>
                  )}
                </div>

                {/* Apellidos */}
                <div>
                  <label className="field-label">Apellidos *</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2
                                               -translate-y-1/2 text-info"/>
                    <input {...register('apellidos')} type="text"
                      placeholder="Tus apellidos" className="input-field pl-9"/>
                  </div>
                  {errors.apellidos && (
                    <p className="text-red-500 text-xs mt-1">{errors.apellidos.message}</p>
                  )}
                </div>

                {/* Correo */}
                <div>
                  <label className="field-label">Correo electrónico *</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2
                                               -translate-y-1/2 text-info"/>
                    <input {...register('correo')} type="email"
                      placeholder="tu@correo.com" className="input-field pl-9"
                      autoComplete="email"/>
                  </div>
                  {errors.correo && (
                    <p className="text-red-500 text-xs mt-1">{errors.correo.message}</p>
                  )}
                </div>

                {/* Teléfono (opcional) */}
                <div>
                  <label className="field-label">Teléfono (opcional)</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2
                                                -translate-y-1/2 text-info"/>
                    <input {...register('telefono')} type="tel"
                      placeholder="10 dígitos" className="input-field pl-9"/>
                  </div>
                </div>

                {/* Contraseña */}
                <div>
                  <label className="field-label">Contraseña *</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2
                                               -translate-y-1/2 text-info"/>
                    <input {...register('password')}
                      type={showPass ? 'text' : 'password'}
                      placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
                      className="input-field pl-9 pr-9"
                      autoComplete="new-password"/>
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2
                                 text-campo-300 hover:text-campo-500
                                 min-h-0 p-0">
                      {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label className="field-label">Confirmar contraseña *</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2
                                               -translate-y-1/2 text-info"/>
                    <input {...register('confirmarPassword')}
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repite la contraseña"
                      className="input-field pl-9 pr-9"
                      autoComplete="new-password"/>
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2
                                 text-campo-300 hover:text-campo-500
                                 min-h-0 p-0">
                      {showConfirm ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                  {errors.confirmarPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmarPassword.message}</p>
                  )}
                </div>

                {/* Botón crear cuenta */}
                <button type="submit" disabled={isLoading}
                  className="btn-primary w-full justify-center mt-2">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" strokeOpacity=".25"/>
                        <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity=".75"/>
                      </svg>
                      Creando cuenta…
                    </span>
                  ) : (
                    <>
                      Crear mi cuenta
                      <ArrowRight size={14}/>
                    </>
                  )}
                </button>
              </form>

          <div className="mt-6 px-3 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm">
            <p className="font-semibold mb-1">Confianza y seguridad</p>
            <p className="font-body text-sm leading-relaxed">
              Transacciones seguras validadas en campo mediante Código QR. Tus datos están protegidos y en AgroFlex respetamos tu privacidad comercial.
            </p>
          </div>

          <p className="text-center text-slate-500 text-sm mt-5">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login"
              className="text-emerald-600 font-semibold hover:text-emerald-800">
              Inicia sesión
            </Link>
          </p>
        </div>

        <p className="text-center mt-4">
          <Link to="/" className="text-campo-300 text-xs hover:text-campo-500">
            ← Volver al inicio
          </Link>
        </p>
      </main>
    </div>
  )
}

export default RegisterPage
