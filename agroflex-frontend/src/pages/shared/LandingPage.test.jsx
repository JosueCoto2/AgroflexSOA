import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BrowserRouter as Router } from 'react-router-dom'
import LandingPage from '../LandingPage'

// Mock del hook useAuth
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    roles: [],
    user: null,
    login: vi.fn(),
    logout: vi.fn()
  })
}))

// Mock del hook usePWAInstall
vi.mock('../../../hooks/usePWAInstall', () => ({
  usePWAInstall: () => ({
    puedeInstalar: false,
    yaInstalada: false,
    instalar: vi.fn(),
    instruccionesManual: 'Instrucciones aquí'
  })
}))

// Mock de useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('LandingPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renderiza sin errores', () => {
    render(
      <Router>
        <LandingPage />
      </Router>
    )
    expect(screen.getByText('🌾 AgroFlex')).toBeInTheDocument()
  })

  it('muestra el título del hero', () => {
    render(
      <Router>
        <LandingPage />
      </Router>
    )
    expect(screen.getByText(/Vende tu cosecha/)).toBeInTheDocument()
    expect(screen.getByText(/directo/)).toBeInTheDocument()
  })

  it('muestra ambos botones del hero', () => {
    render(
      <Router>
        <LandingPage />
      </Router>
    )
    expect(screen.getByText('Publicar mi cosecha')).toBeInTheDocument()
    expect(screen.getByText('Buscar lotes disponibles')).toBeInTheDocument()
  })

  it('muestra la sección "¿Cómo funciona?"', () => {
    render(
      <Router>
        <LandingPage />
      </Router>
    )
    expect(screen.getByText('¿Cómo funciona?')).toBeInTheDocument()
  })

  it('muestra los 4 pasos', () => {
    render(
      <Router>
        <LandingPage />
      </Router>
    )
    expect(screen.getByText('Regístrate gratis')).toBeInTheDocument()
    expect(screen.getByText('Publica tu lote')).toBeInTheDocument()
    expect(screen.getByText('El comprador paga seguro')).toBeInTheDocument()
    expect(screen.getByText('Escanea y cobra')).toBeInTheDocument()
  })

  it('muestra la sección de lotes disponibles', () => {
    render(
      <Router>
        <LandingPage />
      </Router>
    )
    expect(screen.getByText('Lotes disponibles ahora')).toBeInTheDocument()
  })

  it('muestra las 3 tarjetas de lote', () => {
    render(
      <Router>
        <LandingPage />
      </Router>
    )
    expect(screen.getByText('Jitomate Saladette')).toBeInTheDocument()
    expect(screen.getByText('Aguacate Hass')).toBeInTheDocument()
    expect(screen.getByText('Chile Serrano')).toBeInTheDocument()
  })

  it('muestra la sección de testimonios', () => {
    render(
      <Router>
        <LandingPage />
      </Router>
    )
    expect(screen.getByText('Lo que dicen los productores')).toBeInTheDocument()
  })

  it('muestra 2 testimonios', () => {
    render(
      <Router>
        <LandingPage />
      </Router>
    )
    expect(screen.getByText('José Mendoza')).toBeInTheDocument()
    expect(screen.getByText('Laura Ríos')).toBeInTheDocument()
  })

  it('muestra el footer', () => {
    render(
      <Router>
        <LandingPage />
      </Router>
    )
    expect(screen.getByText('Conectando el campo con el mercado')).toBeInTheDocument()
  })

  it('muestra la navbar', () => {
    render(
      <Router>
        <LandingPage />
      </Router>
    )
    const navButtons = screen.getAllByRole('button')
    expect(navButtons.length).toBeGreaterThan(0)
  })

  it('el tab bar está visible en mobile (DOM)', () => {
    render(
      <Router>
        <LandingPage />
      </Router>
    )
    const tabBar = screen.getByLabelText('Navegación principal')
    expect(tabBar).toBeInTheDocument()
  })

  it('muestra el enlace "Ver todos" del catálogo', () => {
    render(
      <Router>
        <LandingPage />
      </Router>
    )
    const verTodosLink = screen.getByText(/Ver todos/)
    expect(verTodosLink).toBeInTheDocument()
  })

  it('los botones del hero tienen aria-labels accesibles', () => {
    render(
      <Router>
        <LandingPage />
      </Router>
    )
    expect(screen.getByLabelText('Publicar tu cosecha ahora')).toBeInTheDocument()
    expect(screen.getByLabelText('Buscar lotes disponibles')).toBeInTheDocument()
  })
})
