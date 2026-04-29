import { Sprout, Sun, Package, Truck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { ROUTES } from '../../routes/routeConfig'

const roles = [
  {
    icon: Sprout,
    titulo: 'Productores',
    rol: 'PRODUCTOR',
    beneficio: 'Vende tus cosechas directo, sin coyotes y al precio que mereces.',
    color: 'from-verde-500 to-verde-400',
    imagen: '/images/roles/productores.png',
  },
  {
    icon: Sun,
    titulo: 'Invernaderos',
    rol: 'INVERNADERO',
    beneficio: 'Conecta tu producción controlada con compradores de calidad.',
    color: 'from-emerald-700 to-emerald-500',
    imagen: '/images/roles/invernadero.png',
  },
  {
    icon: Package,
    titulo: 'Empaques',
    rol: 'EMPAQUE',
    beneficio: 'Accede a lotes de campo y gestiona compras con trazabilidad total.',
    color: 'from-ambar-500 to-ambar-400',
    imagen: '/images/roles/empacadoras.jpg',
  },
  {
    icon: Truck,
    titulo: 'Insumos',
    rol: 'INSUMOS',
    beneficio: 'Publica tus agroinsumos y llega a productores verificados.',
    color: 'from-tinta-600 to-tinta-500',
    imagen: '/images/roles/insumos.png',
  },
]

export default function RolesSection() {
  const [ref, isVisible] = useScrollReveal(0.05)
  const navigate = useNavigate()

  return (
    <section id="roles" className="py-20 sm:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold text-emerald-600 uppercase tracking-[0.35em] mb-3">
            Para todo el ecosistema agrícola
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            ¿Quiénes crecen con AgroFlex?
          </h2>
          <p className="mt-4 text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Cada rol tiene su espacio: desde productores locales hasta invernaderos, empaques y proveedores de insumos. La plataforma está hecha para que todos crezcan con mayor transparencia y negocio justo.
          </p>
        </div>

        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
        >
          {roles.map((rol, idx) => {
            const Icon = rol.icon
            return (
              <div
                key={rol.titulo}
                className={`group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${idx * 120}ms` }}
              >
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={rol.imagen}
                    alt={rol.titulo}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                  <div className="absolute inset-x-0 top-0 p-5 flex items-center justify-between">
                    <div className={`rounded-2xl bg-white/10 px-3 py-2 backdrop-blur-sm border border-white/20 text-xs font-semibold uppercase tracking-[0.25em] text-white`}>
                      {rol.titulo}
                    </div>
                    <div className={`h-12 w-12 rounded-3xl bg-gradient-to-br ${rol.color} shadow-lg shadow-slate-950/20 flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-6 sm:p-7">
                  <div className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-slate-400">
                    <span className={`inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-br ${rol.color}`} />
                    <span>{rol.rol}</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900 leading-tight">
                    {rol.beneficio}
                  </p>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    En AgroFlex, este perfil tiene visibilidad preferente y acceso a soluciones para su actividad.
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
