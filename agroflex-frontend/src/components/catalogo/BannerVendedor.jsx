/**
 * BannerVendedor — Banner "¿Quieres vender en AgroFlex?"
 * Solo visible para usuarios SIN rol vendedor activo.
 */
import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgePlus, ArrowRight, X, Info } from 'lucide-react'
import { authService } from '../../services/authService'
import { ROUTES } from '../../routes/routeConfig'

const SELLER_ROLES = ['PRODUCTOR', 'INVERNADERO', 'PROVEEDOR', 'ADMIN']

export default function BannerVendedor() {
  const ref            = useRef(null)
  const [visible, setVisible]     = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const roles = authService.getRoles()
  const esSeller = roles.some(r => SELLER_ROLES.includes(r))
  if (esSeller || dismissed) return null

  return (
    <>
      <section
        ref={ref}
        className={`
          mx-4 sm:mx-6 my-4 max-w-7xl lg:mx-auto
          transition-all duration-700
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-tinta-900 via-tinta-800 to-verde-900 border border-tinta-700 p-5 sm:p-6">
          {/* Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-3 right-3 p-1.5 rounded-chip bg-white/10 hover:bg-white/20 text-tinta-300 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pr-6">
            {/* Ícono */}
            <div className="w-12 h-12 bg-verde-400/20 rounded-card flex items-center justify-center flex-shrink-0">
              <BadgePlus className="w-6 h-6 text-verde-300" />
            </div>

            {/* Texto */}
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-bold text-white mb-0.5 font-display">
                ¿Quieres vender en AgroFlex?
              </h3>
              <p className="text-sm text-tinta-300 leading-snug">
                Solicita tu insignia de vendedor verificado y empieza a publicar tus productos hoy.
              </p>
            </div>

            {/* Botones */}
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-btn bg-white/10 hover:bg-white/15 text-tinta-200 text-sm font-medium transition-all"
              >
                <Info className="w-4 h-4" />
                Saber más
              </button>
              <Link
                to={ROUTES.VERIFY_BADGE}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-btn bg-verde-400 hover:bg-verde-500 text-white text-sm font-bold transition-all active:scale-95"
              >
                Solicitar insignia
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modal "Saber más" */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-tinta-800 border border-tinta-700 rounded-card shadow-xl max-w-sm w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-verde-400/15 rounded-card flex items-center justify-center">
                <BadgePlus className="w-5 h-5 text-verde-400" />
              </div>
              <h2 className="text-lg font-bold text-white font-display">
                Insignia de vendedor
              </h2>
            </div>
            <ul className="space-y-2.5 text-sm text-tinta-300 mb-6">
              {[
                'Publica cosechas, suministros o insumos',
                'Recibe pedidos con pago en garantía (escrow)',
                'Validación QR en cada entrega',
                'Reputación y calificaciones de compradores',
                'Visibilidad en toda la región Tepeaca-Acatzingo',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-verde-400 mt-0.5 font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 border border-tinta-600 rounded-btn text-sm font-semibold text-tinta-300 hover:bg-white/5 transition-colors"
              >
                Cerrar
              </button>
              <Link
                to={ROUTES.VERIFY_BADGE}
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 bg-verde-400 hover:bg-verde-500 rounded-btn text-sm font-bold text-white text-center transition-all"
              >
                Solicitar ahora
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
