import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import HarvestCard from './HarvestCard'

const loteBase = {
  idLote: 1,
  titulo: 'Tomates Cherry Premium',
  tipoCultivo: 'Tomate',
  categoriaCultivo: 'Hortalizas',
  precioUnitario: 25,
  unidadVenta: 'kg',
  gradoCalidad: 'EXTRA',
  esOrganico: true,
  municipio: 'Zapopan',
  estadoRepublica: 'Jalisco',
  nombreProductor: 'Juan Pérez',
  reputacionProductor: 4.5,
  imagenPrincipalUrl: null,
}

const renderCard = (props = {}) =>
  render(
    <MemoryRouter>
      <HarvestCard lote={{ ...loteBase, ...props.lote }} onVerDetalle={props.onVerDetalle} />
    </MemoryRouter>
  )

describe('HarvestCard', () => {
  it('renderiza sin errores', () => {
    renderCard()
    expect(screen.getByText('Tomates Cherry Premium')).toBeInTheDocument()
  })

  it('muestra el precio formateado en pesos', () => {
    renderCard()
    expect(screen.getByText(/\$25/)).toBeInTheDocument()
  })

  it('muestra la ubicación del lote', () => {
    renderCard()
    expect(screen.getByText(/Zapopan/)).toBeInTheDocument()
    expect(screen.getByText(/Jalisco/)).toBeInTheDocument()
  })

  it('muestra badge orgánico cuando esOrganico es true', () => {
    renderCard()
    expect(screen.getByText(/Orgánico/i)).toBeInTheDocument()
  })

  it('no muestra badge orgánico cuando esOrganico es false', () => {
    renderCard({ lote: { esOrganico: false } })
    expect(screen.queryByText(/Orgánico/i)).not.toBeInTheDocument()
  })

  it('llama onVerDetalle al hacer click en el botón', async () => {
    const onVerDetalle = vi.fn()
    renderCard({ onVerDetalle })
    await userEvent.click(screen.getByRole('button', { name: /Ver detalle/i }))
    expect(onVerDetalle).toHaveBeenCalledTimes(1)
    expect(onVerDetalle).toHaveBeenCalledWith(expect.objectContaining({ idLote: 1 }))
  })

  it('muestra emoji de cultivo cuando no hay imagen', () => {
    renderCard({ lote: { imagenPrincipalUrl: null } })
    // El emoji 🥕 debe estar presente para Hortalizas
    expect(screen.getByText('🥕')).toBeInTheDocument()
  })

  it('muestra la imagen cuando imagenPrincipalUrl está disponible', () => {
    renderCard({ lote: { imagenPrincipalUrl: 'https://example.com/tomate.jpg' } })
    const img = screen.getByAltText('Tomates Cherry Premium')
    expect(img).toHaveAttribute('src', 'https://example.com/tomate.jpg')
  })
})
