import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ROUTES } from '../../routes/routeConfig'

const forgotPasswordSchema = yup
  .object()
  .shape({
    correo: yup
      .string()
      .email('Debe ser un correo válido')
      .required('El correo es requerido'),
  })
  .required()

const ForgotPasswordPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
  })
  const { forgotPassword, isLoading } = useAuth()
  const [successMessage, setSuccessMessage] = useState('')
  const [serverError, setServerError] = useState('')

  const onSubmit = async (data) => {
    setServerError('')
    setSuccessMessage('')
    try {
      await forgotPassword(data.correo)
      setSuccessMessage('Si el correo existe, recibirás instrucciones para resetear tu contraseña')
    } catch (err) {
      // Por seguridad, siempre mostrar el mismo mensaje
      setSuccessMessage('Si el correo existe, recibirás instrucciones para resetear tu contraseña')
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
          <p className="text-gray-600">Recupera tu contraseña</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            ¿Olvidaste tu contraseña?
          </h2>

          <p className="text-gray-600 mb-6">
            Ingresa tu correo electrónico y te enviaremos instrucciones para resetear tu contraseña.
          </p>

          {/* Éxito */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-900 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-900 px-4 py-3 rounded mb-4">
              {serverError}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Correo */}
            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                {...register('correo')}
                type="email"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.correo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="tu@ejemplo.com"
              />
              {errors.correo && (
                <p className="text-red-500 text-sm mt-1">{errors.correo.message}</p>
              )}
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
            >
              {isLoading ? 'Enviando...' : 'Enviar instrucciones'}
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

export default ForgotPasswordPage
