import { Instagram, Facebook, Twitter, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../routes/routeConfig'
import AgroFlexLogo from '../common/Logo/AgroFlexLogo'

const socialLinks = [
  { icon: Instagram, href: '#', label: 'Instagram de AgroFlex' },
  { icon: Facebook,  href: '#', label: 'Facebook de AgroFlex' },
  { icon: Twitter,   href: '#', label: 'Twitter de AgroFlex' },
]

const footerLinks = [
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Para quién',    href: '#roles' },
  { label: 'Confianza',     href: '#confianza' },
]

const legalLinks = [
  { label: 'Términos de uso', href: '#' },
  { label: 'Privacidad',      href: '#' },
  { label: 'Contacto',        href: '#' },
]

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="bg-campo-50 border-t border-campo-100 text-tinta-500">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        {/* Grid principal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Logo + descripción */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <AgroFlexLogo size="md" variant="dark" />
            </div>
            <p className="text-sm leading-relaxed max-w-xs mb-5">
              Marketplace agrícola mexicano que elimina intermediarios y
              conecta el campo con el mercado de forma segura y transparente.
            </p>
            <div className="flex items-center gap-2 text-xs text-tinta-400">
              <MapPin className="w-3.5 h-3.5 text-verde-500" />
              Tepeaca · Acatzingo · Huixcolotla, Puebla
            </div>
          </div>

          {/* Links navegación */}
          <div>
            <h4 className="text-sm font-semibold text-tinta-800 mb-4">Plataforma</h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm hover:text-verde-600 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <button
                  onClick={() => navigate(ROUTES.CATALOG)}
                  className="text-sm hover:text-verde-600 transition-colors text-left"
                >
                  Catálogo
                </button>
              </li>
            </ul>
          </div>

          {/* Cuenta + Social */}
          <div>
            <h4 className="text-sm font-semibold text-tinta-800 mb-4">Mi cuenta</h4>
            <ul className="flex flex-col gap-3 mb-6">
              <li>
                <button
                  onClick={() => navigate(ROUTES.LOGIN)}
                  className="text-sm hover:text-verde-600 transition-colors text-left"
                >
                  Iniciar sesión
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate(ROUTES.REGISTER)}
                  className="text-sm hover:text-verde-600 transition-colors text-left"
                >
                  Registrarse gratis
                </button>
              </li>
            </ul>

            {/* Redes sociales */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white border border-campo-100 flex items-center justify-center text-tinta-400 hover:bg-verde-400 hover:border-verde-400 hover:text-white transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="border-t border-campo-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-tinta-400">
            © {new Date().getFullYear()} AgroFlex · México · Todos los derechos reservados
          </p>
          <div className="flex items-center gap-5">
            {legalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs text-tinta-400 hover:text-tinta-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
