import { UserPlus, ShoppingBag, QrCode } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const pasos = [
  {
    icon: UserPlus,
    numero: '01',
    titulo: 'Regístrate en segundos',
    descripcion: 'Crea tu cuenta gratis y comienza a publicar o descubrir lotes en Puebla sin barreras.',
    color: 'from-emerald-500 to-emerald-400',
  },
  {
    icon: ShoppingBag,
    numero: '02',
    titulo: 'Encuentra productos reales',
    descripcion: 'Accede al catálogo en vivo con los lotes más recientes de productores y empacadores de la región.',
    color: 'from-amber-500 to-amber-400',
  },
  {
    icon: QrCode,
    numero: '03',
    titulo: 'Entrega segura y pago confiable',
    descripcion: 'Valida la entrega con QR + GPS y libera el pago cuando todo se entrega correctamente.',
    color: 'from-slate-700 to-slate-500',
  },
]

export default function HowItWorks() {
  const [ref, isVisible] = useScrollReveal(0.1)

  return (
    <section id="como-funciona" className="py-24 sm:py-32 bg-slate-50 text-slate-900 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-14 sm:mb-20">
          <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-700 uppercase tracking-[0.35em]">
            Simple, rápido y seguro
          </span>
          <h2 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Así funciona AgroFlex
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-600 sm:text-base leading-relaxed">
            Tres pasos claros para llevar el producto del campo al mercado con confianza, visibilidad y pago protegido.
          </p>
        </div>

        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {pasos.map((paso, idx) => {
            const Icon = paso.icon
            return (
              <div
                key={paso.numero}
                className={`relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_22px_60px_rgba(15,23,42,0.08)] transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${idx * 130}ms` }}
              >
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-emerald-100 to-transparent blur-2xl" />
                <div className="absolute -left-10 bottom-10 h-24 w-24 rounded-full bg-gradient-to-br from-amber-200 to-transparent opacity-80" />

                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">
                    Paso {paso.numero}
                  </span>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br ${paso.color} shadow-lg shadow-slate-300/50`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {paso.titulo}
                </h3>
                <p className="text-sm leading-7 text-slate-600">
                  {paso.descripcion}
                </p>

                <div className="mt-8 flex items-center gap-3 text-sm text-slate-500 font-semibold">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                    {paso.numero}
                  </span>
                  <span>Comienza hoy</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
