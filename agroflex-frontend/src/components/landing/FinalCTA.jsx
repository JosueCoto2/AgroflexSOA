import { Rocket, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { ROUTES } from '../../routes/routeConfig'

export default function FinalCTA() {
  const [ref, isVisible] = useScrollReveal(0.15)
  const navigate = useNavigate()

  return (
    <section className="py-20 sm:py-28 bg-campo-50 relative overflow-hidden">
      {/* Fondo con patrón sutil */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #3BAF2A 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, #174F0E 0%, transparent 50%)`,
        }}
      />

      {/* Círculos decorativos */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-campo-200" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full border border-campo-200" />

      <div
        ref={ref}
        className={`relative max-w-3xl mx-auto px-6 text-center transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Ícono */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-verde-400/10 border border-verde-400/20 mb-8">
          <Rocket className="w-8 h-8 text-verde-500" />
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-tinta-900 leading-tight mb-6">
          El campo merece
          <br />
          <em className="not-italic text-verde-500">tecnología real</em>
        </h2>

        <p className="text-tinta-500 text-base sm:text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          Únete a AgroFlex hoy y comienza a vender o comprar cosechas con
          seguridad total. Sin coyotes, sin letras chiquitas.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(ROUTES.REGISTER)}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-verde-400 hover:bg-verde-500 text-white font-semibold text-base rounded-btn transition-all hover:-translate-y-0.5 shadow-btn active:scale-95"
          >
            Únete a AgroFlex gratis
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate(ROUTES.LOGIN)}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-campo-100 border border-campo-200 text-tinta-700 font-semibold text-base rounded-btn transition-all active:scale-95"
          >
            Ya tengo cuenta
          </button>
        </div>

        {/* Nota */}
        <p className="mt-6 text-xs text-tinta-400">
          Sin tarjeta de crédito · Sin costo de registro · Cancela cuando quieras
        </p>
      </div>
    </section>
  )
}
