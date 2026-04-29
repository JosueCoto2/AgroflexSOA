import { useState, useEffect } from 'react'

// ── Secciones de la landing
import Navbar       from '../../components/landing/Navbar'
import HeroCarousel from '../../components/landing/HeroCarousel'
import HowItWorks   from '../../components/landing/HowItWorks'
import RolesSection from '../../components/landing/RolesSection'
import TrustSignals from '../../components/landing/TrustSignals'
import Gallery      from '../../components/landing/Gallery'
import FinalCTA     from '../../components/landing/FinalCTA'
import Footer       from '../../components/landing/Footer'

function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)

  // ── Detectar scroll para efecto en navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="w-full min-h-screen">
      {/* Navbar fijo */}
      <Navbar isScrolled={isScrolled} />

      {/* 1. Hero con carrusel Swiper */}
      <HeroCarousel />

      {/* 2. Cómo funciona — 3 pasos */}
      <HowItWorks />

      {/* 3. Para quién es — roles */}
      <RolesSection />

      {/* 4. Trust signals — confianza */}
      <TrustSignals />

      {/* 5. Galería de productos */}
      <Gallery />

      {/* 6. CTA final */}
      <FinalCTA />

      {/* 7. Footer */}
      <Footer />
    </div>
  )
}

export { LandingPage }
export default LandingPage
