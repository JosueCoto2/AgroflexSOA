import { ShieldCheck, MapPin, BadgeCheck, CreditCard } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const trustItems = [
  {
    icon: ShieldCheck,
    titulo: 'Pagos en garantía (Escrow)',
    descripcion: 'El dinero queda retenido en la plataforma y solo se libera cuando el comprador confirma la entrega.',
    color: 'text-verde-500',
  },
  {
    icon: MapPin,
    titulo: 'Validación GPS en entrega',
    descripcion: 'Verificamos que la entrega ocurra en el lugar correcto con coordenadas GPS en tiempo real.',
    color: 'text-campo-500',
  },
  {
    icon: BadgeCheck,
    titulo: 'Perfiles verificados',
    descripcion: 'Productores y proveedores presentan documentos oficiales para obtener su insignia de confianza.',
    color: 'text-ambar-500',
  },
  {
    icon: CreditCard,
    titulo: 'Pagos con Stripe y PayPal',
    descripcion: 'Integración con pasarelas de pago líderes mundiales para máxima seguridad en cada transacción.',
    color: 'text-verde-500',
  },
]

export default function TrustSignals() {
  const [ref, isVisible] = useScrollReveal(0.1)

  return (
    <section id="confianza" className="py-20 sm:py-28 bg-campo-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold text-verde-500 uppercase tracking-widest mb-3">
            Tu dinero y tu producción, protegidos
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-tinta-900">
            Construido sobre confianza
          </h2>
          <p className="mt-4 text-tinta-500 max-w-xl mx-auto leading-relaxed">
            AgroFlex usa tecnología de punta para que productores y compradores
            hagan negocios seguros, sin sorpresas.
          </p>
        </div>

        {/* Items */}
        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {trustItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={item.titulo}
                className={`flex flex-col gap-4 p-6 rounded-2xl border border-campo-100 bg-white shadow-card hover:shadow-card-hover transition-all duration-300 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${idx * 120}ms`, transitionDuration: '600ms' }}
              >
                <div className="w-12 h-12 rounded-xl bg-campo-50 border border-campo-100 flex items-center justify-center">
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h3 className="text-base font-semibold text-tinta-900">
                  {item.titulo}
                </h3>
                <p className="text-sm text-tinta-500 leading-relaxed">
                  {item.descripcion}
                </p>
              </div>
            )
          })}
        </div>

        {/* Logos de pasarelas */}
        <div className="mt-16 flex flex-col items-center gap-4">
          <p className="text-xs text-tinta-400 uppercase tracking-widest">
            Pasarelas de pago integradas
          </p>
          <div className="flex items-center gap-8 opacity-30 hover:opacity-60 transition-opacity">
            <svg viewBox="0 0 60 25" className="h-7 fill-tinta-700" aria-label="Stripe">
              <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.23c0-1.85-1.28-2.58-2.06-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.87zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.84zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.9 0 1.85 6.29.97 6.29 5.88z" />
            </svg>
            <svg viewBox="0 0 100 26" className="h-6 fill-tinta-700" aria-label="PayPal">
              <path d="M12.237 2.6H5.45a.94.94 0 0 0-.93.8L1.68 21.94a.57.57 0 0 0 .56.65h3.27a.94.94 0 0 0 .93-.8l.65-4.15a.94.94 0 0 1 .93-.8h2.17c4.52 0 7.13-2.19 7.81-6.53.31-1.9.01-3.39-.87-4.44-.96-1.15-2.67-1.27-4.92-1.27zm.79 6.43c-.38 2.48-2.26 2.48-4.08 2.48h-1.04l.73-4.6a.56.56 0 0 1 .56-.47h.48c1.24 0 2.41 0 3.01.71.37.42.48 1.05.34 1.88zm19.78-.11h-3.28a.56.56 0 0 0-.56.47l-.15.93-.23-.33c-.72-1.05-2.33-1.4-3.94-1.4-3.68 0-6.83 2.79-7.44 6.7-.32 1.95.13 3.82 1.23 5.12.1.12 1.05 1.22 2.9 1.22 2.97 0 4.62-1.91 4.62-1.91l-.15.92a.56.56 0 0 0 .56.65h2.95a.94.94 0 0 0 .93-.8l1.77-11.21a.57.57 0 0 0-.21-.36zm-4.56 6.48c-.32 1.9-1.84 3.18-3.76 3.18-.97 0-1.74-.31-2.24-.9-.5-.58-.69-1.41-.53-2.33.3-1.88 1.84-3.2 3.73-3.2.95 0 1.71.31 2.22.9.52.6.72 1.43.58 2.35zm23.78-6.48h-3.3a.94.94 0 0 0-.78.41l-4.49 6.62-1.9-6.36a.94.94 0 0 0-.9-.67h-3.24a.57.57 0 0 0-.54.75l3.58 10.5-3.37 4.75a.57.57 0 0 0 .47.9h3.28a.94.94 0 0 0 .78-.4l10.82-15.6a.57.57 0 0 0-.41-.9z" />
              <path d="M62.237 2.6h-6.79a.94.94 0 0 0-.93.8l-2.84 18.54a.57.57 0 0 0 .56.65h3.53a.66.66 0 0 0 .65-.56l.81-5.1a.94.94 0 0 1 .93-.8h2.16c4.53 0 7.14-2.19 7.82-6.53.31-1.9.01-3.39-.88-4.44-.96-1.15-2.66-1.27-4.92-1.27zm.79 6.43c-.37 2.48-2.25 2.48-4.07 2.48h-1.04l.73-4.6a.56.56 0 0 1 .56-.47h.47c1.25 0 2.42 0 3.02.71.37.42.48 1.05.33 1.88zm19.78-.11h-3.27a.56.56 0 0 0-.56.47l-.15.93-.23-.33c-.72-1.05-2.33-1.4-3.94-1.4-3.68 0-6.83 2.79-7.44 6.7-.32 1.95.13 3.82 1.23 5.12.1.12 1.06 1.22 2.91 1.22 2.97 0 4.62-1.91 4.62-1.91l-.15.92a.56.56 0 0 0 .56.65h2.95a.94.94 0 0 0 .93-.8l1.77-11.21a.57.57 0 0 0-.56-.36zm-4.56 6.48c-.32 1.9-1.84 3.18-3.76 3.18-.97 0-1.74-.31-2.24-.9-.5-.58-.69-1.41-.53-2.33.3-1.88 1.84-3.2 3.73-3.2.95 0 1.71.31 2.22.9.52.6.72 1.43.58 2.35zm8.57-12.49-2.88 18.28a.57.57 0 0 0 .56.65h2.82a.94.94 0 0 0 .93-.8l2.84-18.54a.57.57 0 0 0-.56-.66h-3.15a.56.56 0 0 0-.56.47z" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
