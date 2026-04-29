import { useMemo } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { useProductos } from '../../hooks/useProductos'
import { ROUTES } from '../../routes/routeConfig'

const FALLBACK_ITEMS = [
  {
    id: 'fallback-1',
    imagen: '/images/hero/productores.jpg',
    nombre: 'Jitomate Saladette',
    ubicacion: 'Tepeaca, Puebla',
    categoria: 'Hortalizas',
    precio: '8.50 / kg',
  },
  {
    id: 'fallback-2',
    imagen: '/images/hero/invernaderos.png',
    nombre: 'Chile Serrano',
    ubicacion: 'Acatzingo, Puebla',
    categoria: 'Hortalizas',
    precio: '12.00 / kg',
  },
  {
    id: 'fallback-3',
    imagen: '/images/hero/empaque.png',
    nombre: 'Calabacita',
    ubicacion: 'Huixcolotla, Puebla',
    categoria: 'Hortalizas',
    precio: '7.00 / kg',
  },
  {
    id: 'fallback-4',
    imagen: '/images/hero/productores.jpg',
    nombre: 'Pimiento Morrón',
    ubicacion: 'Tecali de Herrera, Puebla',
    categoria: 'Hortalizas',
    precio: '14.50 / kg',
  },
]

export default function Gallery() {
  const [ref, isVisible] = useScrollReveal(0.05)
  const navigate = useNavigate()
  const { productos, error } = useProductos()

  const items = useMemo(() => {
    if (productos?.length > 0) {
      return productos.slice(0, 4).map((producto, index) => ({
        id: producto.id ?? `producto-${index}`,
        imagen: producto.imagen || '/images/hero/invernaderos.png',
        nombre: producto.nombre || 'Producto agrícola',
        ubicacion: producto.ubicacion?.municipio
          ? `${producto.ubicacion.municipio}, ${producto.ubicacion.estado || 'Puebla'}`
          : 'Puebla',
        categoria: producto.tipo === 'suministro' ? 'Insumo' : 'Cosecha',
        precio: producto.precio != null ? `${producto.precio.toFixed(2)} / ${producto.unidad || 'unidad'}` : 'Precio disponible',
      }))
    }
    return FALLBACK_ITEMS
  }, [productos])

  return (
    <section id="galeria" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="inline-block text-xs font-semibold text-verde-500 uppercase tracking-widest mb-3">
              Catálogo en vivo
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-tinta-900 leading-tight">
              Los productos más recientes
              <br />
              desde el corazón de Puebla
            </h2>
          </div>
          <p className="text-sm text-tinta-400 max-w-xs text-right hidden sm:block">
            Esta sección se actualiza con los lotes que llegan al catálogo. Regístrate para ver la información completa.
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-3xl border border-rosa-100 bg-rosa-50 p-5 text-sm text-rosa-700">
            No fue posible cargar los últimos productos del catálogo.
          </div>
        )}

        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        >
          {items.map((item, idx) => (
            <div
              key={item.id}
              className={`group relative overflow-hidden rounded-3xl bg-tinta-100 shadow-sm shadow-tinta-200/10 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              } transition-all duration-700`}
              style={{ transitionDelay: `${idx * 100}ms`, aspectRatio: '4 / 3' }}
            >
              <img
                src={item.imagen}
                alt={item.nombre}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-tinta-950/80 via-tinta-950/20 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
                  {item.categoria}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">{item.nombre}</h3>
                  <p className="text-xs text-white/70">{item.ubicacion}</p>
                  <p className="text-sm font-semibold text-white">{item.precio}</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/85">
                    Regístrate para ver más
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.REGISTER)}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-tinta-900 transition hover:bg-tinta-50"
                  >
                    Registrarse
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-tinta-500">
              Aquí se muestran los lotes más recientes que llegan al catálogo. Si quieres acceder a la información completa, crea tu cuenta gratis.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(ROUTES.CATALOG)}
              className="rounded-full bg-tinta-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-tinta-800"
            >
              Ver catálogo completo
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.REGISTER)}
              className="rounded-full border border-tinta-200 bg-white px-5 py-3 text-sm font-semibold text-tinta-900 transition hover:bg-tinta-50"
            >
              Regístrate ahora
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
