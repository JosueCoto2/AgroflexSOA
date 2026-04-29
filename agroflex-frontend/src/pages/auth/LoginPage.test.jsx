import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import LoginPage from '../LoginPage'
import * as authHooks from '../../../hooks/useAuth'

// Mock the useAuth hook
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renderiza el formulario correctamente', () => {
    authHooks.useAuth.mockReturnValue({
      login: vi.fn(),
      isLoading: false,
      error: null,
    })

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('tu@ejemplo.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })

  test('muestra error si los campos están vacíos', async () => {
    authHooks.useAuth.mockReturnValue({
      login: vi.fn(),
      isLoading: false,
      error: null,
    })

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const submitButton = screen.getByRole('button', { name: /Iniciar sesión/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/El correo es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/La contraseña es requerida/i)).toBeInTheDocument()
    })
  })

  test('llama a authStore.login con datos correctos al submit', async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      roles: ['COMPRADOR'],
    })

    authHooks.useAuth.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
    })

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const correoInput = screen.getByPlaceholderText('tu@ejemplo.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')
    const submitButton = screen.getByRole('button', { name: /Iniciar sesión/i })

    fireEvent.change(correoInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Password123')
    })
  })
})
