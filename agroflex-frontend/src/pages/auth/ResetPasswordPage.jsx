import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ROUTES } from '../../routes/routeConfig'

const resetPasswordSchema = yup
  .object()
  .shape({
    newPassword: yup
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .matches(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .matches(/[0-9]/, 'Debe contener al menos un número')
      .required('La nueva contraseña es requerida'),
    confirmarPassword: yup
      .string()
      .oneOf([yup.ref('newPassword')], 'Las contraseñas deben coincidir')
      .required('Confirmar contraseña es requerido'),
  })
  .required()

const ResetPasswordPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  })
  const { resetPassword, isLoading } = useAuth()
  const [successMessage, setSuccessMessage] = useState('')
  const [serverError, setServerError] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get('token')

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Token no válido
            </h2>
            <p className="text-gray-600 mb-6">
              No se encontró un token válido. Solicita un nuevo reset de contraseña.
            </p>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="inline-block bg-green-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-700"
            >
              Solicitar nuevo token
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const onSubmit = async (data) => {
    setServerError('')
    setSuccessMessage('')
    try {
      await resetPassword(token, data.newPassword)
      setSuccessMessage('Contraseña actualizada exitosamente')
      setTimeout(() => {
        navigate(ROUTES.LOGIN)
      }, 2000)
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
        'Error al resetear la contraseña'
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-700 mb-2">
            AgroFlex
          </h1>
          <p className="text-gray-600">Nueva contraseña</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Resetear contraseña
          </h2>

          {/* Éxito */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-900 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}

          {/* Errores */}
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-900 px-4 py-3 rounded mb-4">
              {serverError}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nueva Contraseña */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Nueva contraseña
              </label>
              <input
                {...register('newPassword')}
                type="password"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.newPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label htmlFor="confirmarPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar contraseña
              </label>
              <input
                {...register('confirmarPassword')}
                type="password"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.confirmarPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              {errors.confirmarPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmarPassword.message}</p>
              )}
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
            >
              {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <Link to={ROUTES.LOGIN} className="text-green-600 hover:text-green-700 font-semibold">
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
