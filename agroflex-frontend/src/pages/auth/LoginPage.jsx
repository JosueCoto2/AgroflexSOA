import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { jwtDecode } from 'jwt-decode'
import useAuthStore from '../../store/authStore'
import authApi from '../../api/authApi'
import AgroFlexLogo from '../../components/common/Logo/AgroFlexLogo'
import { ROUTES } from '../../routes/routeConfig'

// Esquema de validación — simple y directo
const schema = yup.object({
  correo: yup
    .string()
    .email('Correo electrónico inválido')
    .required('El correo es requerido'),
  password: yup
    .string()
    .min(6, 'Mínimo 6 caracteres')
    .required('La contraseña es requerida'),
})

const loginSlides = [
  {
    title: 'Bienvenido de nuevo a AgroFlex. El campo conectado, sin intermediarios.',
    subtitle: 'Accede para gestionar tus ventas, compras o inventarios en tiempo real.',
  },
  {
    title: 'Ingresa a tu cuenta y sigue impulsando el comercio justo en nuestra región.',
    subtitle: 'Conectando a productores, empaques y proveedores a un clic de distancia.',
  },
  {
    title: 'Tu cosecha, tu precio. Inicia sesión en AgroFlex.',
    subtitle: 'Ingresa tus datos para continuar realizando transacciones directas y seguras.',
  },
];

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginConGoogle, isLoading, error, clearError, isAuthenticated } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const successMessage = location.state?.mensaje || ''

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.CATALOG, { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % loginSlides.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  // Limpiar errores residuales al entrar a la página
  useEffect(() => { clearError() }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) })

  // Submit — llama a authApi directamente, SIN pasar por el store.login()
  // que dispara . Solo correo + password, cero Firebase.
  const onSubmit = async (data) => {
    useAuthStore.setState({ isLoading: true, error: null })
    try {
      const response = await authApi.login(data.correo, data.password)
      const { accessToken, refreshToken, ...user } = response.data
      const decoded = jwtDecode(accessToken)
      const roles = decoded.roles || user.roles || []

      useAuthStore.setState({
        accessToken,
        refreshToken,
        user: { ...user, roles },
        isAuthenticated: true,
        isLoading: false,
      })

      navigate(ROUTES.CATALOG, { replace: true })
    } catch (err) {
      const message = err.response?.data?.message || 'Correo o contraseña incorrectos'
      useAuthStore.setState({ error: message, isLoading: false })
    }
  }

  // Login con Google — ÚNICO lugar donde se toca Firebase
  // TEMPORALMENTE DESACTIVADO — requiere dominio con TLD para OAuth
  /* const handleGoogle = async () => {
    clearError()
    try {
      await loginConGoogle()
      navigate(ROUTES.CATALOG, { replace: true })
    } catch (err) {
      // Error manejado por el store
    }
  } */

  return (
    <div className="min-h-screen flex">

      {/* ── LADO IZQUIERDO — solo desktop, fondo oscuro con overlay ── */}
      <div className="hidden lg:flex lg:w-1/2 auth-hero-bg">
        <div className="auth-hero-overlay" />
        <div className="relative z-10 auth-hero-panel text-white">
        {/* Decoraciones sutiles */}
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full
                        bg-white/10 -translate-y-1/4 translate-x-1/4" />
        <div className="absolute top-10 right-10 w-28 h-28 rounded-full
                        bg-white/7" />

        {/* Logo */}
        <div className="relative z-10">
          <AgroFlexLogo size="lg" variant="light" showText={false} />
        </div>

        {/* Contenido central */}
        <div className="relative z-10">
          <h2 className="auth-hero-title font-heading">
            {loginSlides[activeSlide].title}
          </h2>
          <p className="auth-hero-subtitle font-body">
            {loginSlides[activeSlide].subtitle}
          </p>
          <div className="flex items-center gap-2">            {loginSlides.map((_, index) => (
              <button
                key={`dot-${index}`}
                onClick={() => setActiveSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  activeSlide === index ? 'bg-white' : 'bg-white/40'
                }`}
                aria-label={`Ver frase ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 text-white/80 text-sm leading-relaxed">
          <p>Transacciones seguras validadas en campo mediante Código QR.</p>
          <p>Tus datos están protegidos. En AgroFlex respetamos tu privacidad comercial.</p>
        </div>

        <p className="text-white/60 text-xs relative z-10">
          © 2026 AgroFlex · Puebla, México
        </p>
      </div>
      </div>

      {/* ── LADO DERECHO — formulario limpio ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10
                      bg-slate-100 lg:px-16">

        {/* Logo mobile */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <AgroFlexLogo size="md" variant="dark" showText={false} />
        </div>

        <div className="auth-form-wrapper max-w-sm w-full mx-auto">
          <h1 className="font-display text-3xl text-slate-900 mb-1">
            Bienvenido de vuelta
          </h1>
          <p className="font-soft text-campo-400 text-sm mb-8">
            Inicia sesión en tu cuenta AgroFlex
          </p>

          {/* Mensaje de éxito (viene de RegisterPage) */}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl
                            px-4 py-3 mb-5 text-emerald-700 text-sm">
              {successMessage}
            </div>
          )}

          {/* Error del servidor */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl
                            px-4 py-3 mb-5 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5">

            {/* Campo correo */}
            <div>
              <label className="field-label">Correo electrónico</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2
                                            -translate-y-1/2 text-info" />
                <input
                  {...register('correo')}
                  type="email"
                  placeholder="tu@correo.com"
                  className="input-field pl-10"
                  autoComplete="email"
                />
              </div>
              {errors.correo && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.correo.message}
                </p>
              )}
            </div>

            {/* Campo contraseña */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="field-label mb-0">Contraseña</label>
                <Link to="/forgot-password"
                  className="text-xs text-emerald-600 font-medium
                             hover:text-emerald-800">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2
                                            -translate-y-1/2 text-info" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-campo-300 hover:text-campo-500
                             min-h-0 p-0"
                >
                  {showPassword
                    ? <EyeOff size={15} />
                    : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Botón submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity=".25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity=".75"/>
                  </svg>
                  Iniciando sesión…
                </span>
              ) : (
                <>
                  Entrar a mi cuenta
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Separador + Botón Google — TEMPORALMENTE DESACTIVADOS (requiere dominio con TLD para Google OAuth)
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-campo-100" />
            <span className="text-slate-400 text-xs">o continúa con</span>
            <div className="flex-1 h-px bg-campo-100" />
          </div>
          <button onClick={handleGoogle} disabled={isLoading} className="btn-secondary w-full justify-center gap-3">
            Iniciar sesión con Google
          </button>
          */}

          {/* Footer */}
          <p className="text-center text-campo-400 text-sm mt-6">
            ¿Aún no eres parte del ecosistema?{' '}
            <Link to="/register"
              className="text-emerald-600 font-semibold hover:text-emerald-800">
              Regístrate aquí
            </Link>
          </p>
          <p className="text-center mt-3">
            <Link to="/"
              className="text-slate-500 text-xs hover:text-slate-700">
              ← Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
