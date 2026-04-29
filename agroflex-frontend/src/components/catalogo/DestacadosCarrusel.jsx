/**
 * DestacadosCarrusel — Carrusel horizontal de productos destacados.
 */
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, FreeMode } from 'swiper/modules'
import { Leaf, FlaskConical, MapPin, BadgeCheck } from 'lucide-react'
import 'swiper/css'
import 'swiper/css/free-mode'
import { ROUTES } from '../../routes/routeConfig'

const formatPrecio = (precio) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(precio)

export default function DestacadosCarrusel({ productos = [] }) {
  if (!productos.length) return null

  return (
    <section className="py-5 border-b border-tinta-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-xs font-semibold text-tinta-400 uppercase tracking-widest mb-3">
          Publicados recientemente
        </p>
      </div>

      <Swiper
        modules={[Autoplay, FreeMode]}
        spaceBetween={12}
        slidesPerView="auto"
        freeMode
        autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        className="!px-4 sm:!px-6"
      >
        {productos.map((p) => (
          <SwiperSlide key={p.id} style={{ width: 220 }}>
            <Link
              to={`${ROUTES.CATALOG}/${p.id}`}
              className="flex flex-col bg-white rounded-card border border-tinta-100 shadow-card overflow-hidden hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 group"
            >
              {/* Imagen */}
              <div className="relative h-32 bg-tinta-100 overflow-hidden">
                <img
                  src={p.imagen ?? `https://placehold.co/220x130?text=Producto`}
                  alt={p.nombre}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/220x130/e2e8f0/94a3b8?text=Sin+imagen'
                  }}
                />
                <div className="absolute top-2 left-2">
                  {p.tipo === 'cosecha' ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-verde-500/90 text-white text-[9px] font-bold rounded-chip backdrop-blur-sm">
                      <Leaf className="w-2 h-2" /> Cosecha
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-600/90 text-white text-[9px] font-bold rounded-chip backdrop-blur-sm">
                      <FlaskConical className="w-2 h-2" /> Suministro
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-3 flex-1 flex flex-col gap-1">
                <p className="text-xs font-semibold text-tinta-800 line-clamp-2 leading-snug">
                  {p.nombre}
                </p>
                <p className="text-sm font-black text-verde-600 font-display leading-tight">
                  {formatPrecio(p.precio)}
                  <span className="text-xs font-normal text-tinta-400 ml-1">/ {p.unidad}</span>
                </p>
                <div className="flex items-center gap-1 text-[10px] text-tinta-400 mt-auto">
                  <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                  <span className="truncate">{p.ubicacion?.municipio}</span>
                  {p.vendedor?.verificado && (
                    <BadgeCheck className="w-3 h-3 text-verde-400 flex-shrink-0 ml-auto" />
                  )}
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
