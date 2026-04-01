import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { resetBankMock } from '@/api/mock-adapter'
import { TransferPage } from '@/pages/transfer'
import { ROUTES } from '@/routes/paths'
import { useAuthStore } from '@/stores/auth-store'

function renderTransfer() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[ROUTES.transfer]}>
        <Routes>
          <Route path={ROUTES.transfer} element={<TransferPage />} />
          <Route path={ROUTES.dashboard} element={<div data-testid="dashboard">Painel</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('TransferPage', () => {
  beforeEach(() => {
    resetBankMock()
    localStorage.removeItem('j-bank-auth')
    useAuthStore.setState({
      token: 'test.token',
      user: { email: 'cliente@teste.com', name: 'Cliente' },
    })
  })

  afterEach(() => {
    useAuthStore.persist.clearStorage()
    useAuthStore.setState({ token: null, user: null })
  })

  it('carrega saldo e exibe o formulário', async () => {
    renderTransfer()

    expect(await screen.findByRole('heading', { name: /transferência/i })).toBeInTheDocument()
    expect(await screen.findByText(/12\.847,52/)).toBeInTheDocument()
    expect(screen.getByLabelText(/favorecido/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/valor \(brl\)/i)).toBeInTheDocument()
  })

  it('formata o valor com máscara BRL (milhar e duas decimais)', async () => {
    renderTransfer()

    const amount = await screen.findByLabelText(/valor \(brl\)/i)

    fireEvent.change(amount, { target: { value: '123456' } })
    expect(amount).toHaveValue('1.234,56')

    fireEvent.change(amount, { target: { value: '1000' } })
    expect(amount).toHaveValue('10,00')
  })

  it('exige favorecido e valor ao enviar vazio', async () => {
    const user = userEvent.setup()
    renderTransfer()

    await screen.findByLabelText(/favorecido/i)

    await user.click(screen.getByRole('button', { name: /confirmar transferência/i }))

    expect(await screen.findByText(/informe o nome do favorecido/i)).toBeInTheDocument()
    expect(await screen.findByText(/informe o valor/i)).toBeInTheDocument()
  })

  it('exige pelo menos dois caracteres no favorecido', async () => {
    const user = userEvent.setup()
    renderTransfer()

    await screen.findByLabelText(/favorecido/i)

    await user.type(screen.getByLabelText(/favorecido/i), 'X')
    const amount = screen.getByLabelText(/valor \(brl\)/i)
    fireEvent.change(amount, { target: { value: '100' } })

    await user.click(screen.getByRole('button', { name: /confirmar transferência/i }))

    expect(await screen.findByText(/informe o nome do favorecido/i)).toBeInTheDocument()
  })

  it('rejeita valor acima do saldo disponível', async () => {
    const user = userEvent.setup()
    renderTransfer()

    await screen.findByLabelText(/favorecido/i)

    await user.type(screen.getByLabelText(/favorecido/i), 'Fornecedor SA')
    const amount = screen.getByLabelText(/valor \(brl\)/i)
    fireEvent.change(amount, { target: { value: '1284753' } })

    await user.click(screen.getByRole('button', { name: /confirmar transferência/i }))

    expect(await screen.findByText(/saldo insuficiente para esta transferência/i)).toBeInTheDocument()
  })

  it('confirma transferência e navega para o dashboard', async () => {
    const user = userEvent.setup()
    renderTransfer()

    await screen.findByLabelText(/favorecido/i)

    await user.type(screen.getByLabelText(/favorecido/i), 'Maria Souza')
    fireEvent.change(screen.getByLabelText(/valor \(brl\)/i), { target: { value: '1000' } })

    await user.click(screen.getByRole('button', { name: /confirmar transferência/i }))

    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    })
  })
})
