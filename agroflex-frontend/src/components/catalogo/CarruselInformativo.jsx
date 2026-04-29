/**
 * CarruselInformativo — Slides informativos por tipo de usuario.
 * 1 card mobile · 2 tablet · 3 desktop
 */
import { Sprout, Sun, Package, Truck } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

const slides = [
  {
    icon: Sprout,
    titulo: 'Para Productores',
    descripcion: 'Vende tus cosechas por volumen sin coyotes ni intermediarios.',
    iconBg: 'bg-verde-400/20',
    iconColor: 'text-verde-400',
    accent: 'border-l-verde-400',
  },
  {
    icon: Sun,
    titulo: 'Para Invernaderos',
    descripcion: 'Publica tu producción y llega a más compradores en la región.',
    iconBg: 'bg-ambar-400/20',
    iconColor: 'text-ambar-400',
    accent: 'border-l-ambar-400',
  },
  {
    icon: Package,
    titulo: 'Para Empaques',
    descripcion: 'Encuentra producto fresco directo del campo al mejor precio.',
    iconBg: 'bg-blue-400/20',
    iconColor: 'text-blue-400',
    accent: 'border-l-blue-400',
  },
  {
    icon: Truck,
    titulo: 'Para Proveedores',
    descripcion: 'Vende semillas y agroquímicos a quien los necesita hoy.',
    iconBg: 'bg-tinta-400/20',
    iconColor: 'text-tinta-300',
    accent: 'border-l-tinta-400',
  },
]

export default function CarruselInformativo() {
  return (
    <section className="px-4 sm:px-6 pt-5 pb-2 max-w-7xl mx-auto w-full">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={12}
        slidesPerView={1}
        breakpoints={{
          640:  { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true, dynamicBullets: true }}
        loop
        className="!pb-8"
      >
        {slides.map(({ icon: Icon, titulo, descripcion, iconBg, iconColor, accent }) => (
          <SwiperSlide key={titulo}>
            <div className={`bg-tinta-800 border border-tinta-700 border-l-2 ${accent} rounded-card p-5 flex items-start gap-4 select-none`}>
              <div className={`${iconBg} rounded-chip p-3 flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>
              <div>
                <p className="font-bold text-white text-sm mb-1 font-display">
                  {titulo}
                </p>
                <p className="text-xs text-tinta-400 leading-relaxed">{descripcion}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
