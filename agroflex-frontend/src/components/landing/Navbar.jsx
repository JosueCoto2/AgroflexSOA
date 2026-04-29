import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { ROUTES } from '../../routes/routeConfig'
import AgroFlexLogo from '../common/Logo/AgroFlexLogo'

const navLinks = [
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Para quién',    href: '#roles' },
  { label: 'Confianza',     href: '#confianza' },
  { label: 'Galería',       href: '#galeria' },
]

export default function Navbar({ isScrolled }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const whiteMode = !isScrolled && !menuOpen

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        menuOpen
          ? 'bg-white/95 border-b border-campo-100 shadow-[0_20px_60px_rgba(31,107,20,0.08)] backdrop-blur-xl'
          : isScrolled
            ? 'bg-white/95 border-b border-campo-100 shadow-[0_20px_60px_rgba(31,107,20,0.08)] backdrop-blur-xl'
            : 'bg-slate-950/60 border-b border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3">
          <AgroFlexLogo
            size="lg"
            variant={whiteMode ? 'light' : 'light'}
            className="max-h-16"
          />
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`text-base font-semibold uppercase tracking-[0.08em] transition-colors ${
                whiteMode
                  ? 'text-white/95 hover:text-white'
                  : 'text-tinta-700 hover:text-verde-500'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate(ROUTES.LOGIN)}
            className={`px-5 py-3 text-base font-semibold rounded-btn border transition-all ${
              isScrolled
                ? 'border-verde-400 text-verde-600 hover:bg-verde-50'
                : 'border-white/70 text-white hover:bg-white/15'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => navigate(ROUTES.REGISTER)}
            className="btn-primary px-6 py-3 text-base"
          >
            Regístrate
          </button>
        </div>

        {/* Hamburger mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-3 rounded-xl transition-colors ${
            whiteMode ? 'text-white' : 'text-tinta-700 bg-white/10 hover:bg-white/20'
          }`}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-tinta-100 px-6 py-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-tinta-700 hover:text-verde-600 py-2 border-b border-tinta-50"
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-3">
            <button
              onClick={() => { navigate(ROUTES.LOGIN); setMenuOpen(false) }}
              className="w-full py-3 text-sm font-semibold text-verde-600 border-2 border-verde-400 rounded-btn hover:bg-verde-50 transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => { navigate(ROUTES.REGISTER); setMenuOpen(false) }}
              className="w-full py-3 text-sm font-semibold text-white bg-verde-400 rounded-btn hover:bg-verde-500 transition-colors"
            >
              Regístrate
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
