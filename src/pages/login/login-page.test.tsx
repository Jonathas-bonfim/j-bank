import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { resetBankMock } from '@/api/mock-adapter'
import { LoginPage } from '@/pages/login'
import { useAuthStore } from '@/stores/auth-store'

function renderLogin(initialPath = '/login') {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<div data-testid="dashboard">Painel</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    resetBankMock()
    localStorage.removeItem('j-bank-auth')
    useAuthStore.setState({ token: null, user: null })
  })

  afterEach(() => {
    useAuthStore.persist.clearStorage()
  })

  it('envia credenciais mock e navega para o painel', async () => {
    const user = userEvent.setup()
    renderLogin()

    await waitFor(() => {
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/e-mail/i), 'dev@ondafinance.test')
    await user.type(screen.getByLabelText(/senha/i), 'qualquer')
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))

    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    })

    expect(useAuthStore.getState().token).toBeTruthy()
    expect(useAuthStore.getState().user?.email).toBe('dev@ondafinance.test')
  })

  it('exibe erro de validação quando o e-mail é inválido', async () => {
    const user = userEvent.setup()
    renderLogin()

    await waitFor(() => expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument())

    await user.type(screen.getByLabelText(/e-mail/i), 'nao-e-um-email')
    await user.type(screen.getByLabelText(/senha/i), 'secret')
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))

    expect(await screen.findByText(/informe um e-mail válido/i)).toBeInTheDocument()
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument()
  })

  it('exibe erro quando a senha está vazia', async () => {
    const user = userEvent.setup()
    renderLogin()

    await waitFor(() => expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument())

    await user.type(screen.getByLabelText(/e-mail/i), 'valido@teste.com')
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))

    expect(await screen.findByText(/informe a senha/i)).toBeInTheDocument()
  })

  it('redireciona para o dashboard se já existir sessão', async () => {
    useAuthStore.setState({
      token: 'existente',
      user: { email: 'ja@logado.com', name: 'Logado' },
    })

    renderLogin('/login')

    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    })
  })
})
