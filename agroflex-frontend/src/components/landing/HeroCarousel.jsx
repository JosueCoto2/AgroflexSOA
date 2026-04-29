import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { ROUTES } from '../../routes/routeConfig'
import 'swiper/css'
import 'swiper/css/pagination'

// ── IMÁGENES DEL CARRUSEL — REEMPLAZAR con fotos reales del proyecto
const heroImages = [
  {
    src: '/images/hero/productores.jpg',
    alt: 'Productores de Tepeaca',
  },
  {
    src: '/images/hero/invernaderos.png',
    alt: 'Invernaderos AgroFlex',
  },
  {
    src: '/images/hero/empaque.png',
    alt: 'Centro de empaque Huixcolotla',
  },
]

export default function HeroCarousel() {
  const swiperRef = useRef(null)
  const navigate = useNavigate()

  return (
    <section className="relative w-full min-h-screen overflow-hidden">
      {/* Carrusel Swiper — NO eliminar */}
      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        className="w-full h-screen"
        style={{
          '--swiper-pagination-color': '#3BAF2A',
          '--swiper-pagination-bullet-inactive-color': 'rgba(255,255,255,0.5)',
          '--swiper-pagination-bullet-inactive-opacity': '1',
          '--swiper-pagination-bottom': '32px',
        }}
      >
        {heroImages.map((img, i) => (
          <SwiperSlide key={i}>
            <div className="relative w-full h-full">
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover rounded-none"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Flechas de navegación */}
      <button
        onClick={() => swiperRef.current?.slidePrev()}
        aria-label="Slide anterior"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => swiperRef.current?.slideNext()}
        aria-label="Siguiente slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Contenido hero encima del carrusel */}
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            {/* Badge superior */}
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/25 text-white text-xs font-semibold uppercase tracking-[0.28em] px-3 py-2 rounded-full mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
              <span className="w-2 h-2 rounded-full bg-verde-300" />
              Ventas directas de la región poblana
            </div>

            {/* Headline principal */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.05] mb-6 tracking-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
              Vende tu cosecha con confianza
              <br />
              <span className="text-verde-300">a compradores reales</span>
            </h1>

            {/* Subtítulo */}
            <p className="text-base sm:text-lg text-white leading-relaxed mb-10 max-w-2xl drop-shadow-[0_6px_20px_rgba(0,0,0,0.25)]">
              Impulsa tu producción local con una plataforma simple, pagos seguros y publicación de lotes en tiempo real.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate(ROUTES.CATALOG)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-verde-400 hover:bg-verde-500 text-white text-base font-semibold rounded-btn transition-all shadow-btn hover:-translate-y-0.5 active:scale-95"
              >
                Explorar catálogo
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate(ROUTES.REGISTER)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/15 hover:bg-white/25 border border-white/25 text-white text-base font-semibold rounded-btn backdrop-blur-sm transition-all active:scale-95"
              >
                Regístrate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/50 text-xs">
        <span>Desliza</span>
        <div className="w-0.5 h-8 bg-gradient-to-b from-white/40 to-transparent rounded-full animate-bounce-soft" />
      </div>
    </section>
  )
}
