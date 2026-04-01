import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth-store'
import type { AccountSnapshot, LoginResponse, TransferPayload } from '@/types/bank'

const initialSnapshot: AccountSnapshot = {
  balance: 12847.52,
  transactions: [
    {
      id: 'tx-1',
      type: 'credit',
      description: 'TED recebida — Folha parceiro',
      amount: 3200,
      createdAt: '2026-03-28T14:22:00.000Z',
    },
    {
      id: 'tx-2',
      type: 'debit',
      description: 'Pagamento fornecedor — Cloud SaaS',
      amount: -189.9,
      createdAt: '2026-03-27T10:05:00.000Z',
    },
    {
      id: 'tx-3',
      type: 'debit',
      description: 'Transferência PIX enviada',
      amount: -450,
      createdAt: '2026-03-26T09:41:00.000Z',
    },
    {
      id: 'tx-4',
      type: 'credit',
      description: 'Conversão USDT → BRL',
      amount: 2100,
      createdAt: '2026-03-25T16:18:00.000Z',
    },
  ],
}

let bankSnapshot: AccountSnapshot = structuredClone(initialSnapshot)

export function resetBankMock() {
  bankSnapshot = structuredClone(initialSnapshot)
}

function jsonResponse<T>(
  config: InternalAxiosRequestConfig,
  data: T,
  status = 200,
): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status === 401 ? 'Unauthorized' : 'OK',
    headers: {},
    config,
  }
}

function parseBody<T>(config: InternalAxiosRequestConfig): T {
  if (config.data == null || config.data === '') return {} as T
  if (typeof config.data === 'string') return JSON.parse(config.data) as T
  return config.data as T
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const mockAxiosAdapter: AxiosAdapter = (config) => {
  return new Promise((resolve, reject) => {
    const delay = 180
    setTimeout(() => {
      try {
        const path = (config.url ?? '').replace(/^\//, '')
        const method = (config.method ?? 'get').toLowerCase()

        if (method === 'post' && path === 'auth/login') {
          const body = parseBody<{ email: string; password: string }>(config)
          if (!body.email?.trim()) {
            resolve(jsonResponse(config, { message: 'E-mail obrigatório' }, 400))
            return
          }
          const res: LoginResponse = {
            token: `mock.${btoa(body.email)}`,
            user: {
              email: body.email.trim(),
              name: 'Cliente Onda',
            },
          }
          resolve(jsonResponse(config, res))
          return
        }

        const token = useAuthStore.getState().token
        const authed = Boolean(token)

        if (method === 'get' && path === 'account') {
          if (!authed) {
            resolve(jsonResponse(config, { message: 'Não autorizado' }, 401))
            return
          }
          resolve(jsonResponse(config, bankSnapshot))
          return
        }

        if (method === 'post' && path === 'transfers') {
          if (!authed) {
            resolve(jsonResponse(config, { message: 'Não autorizado' }, 401))
            return
          }
          const body = parseBody<TransferPayload>(config)
          const amount = Number(body.amount)
          if (!body.recipientName?.trim() || Number.isNaN(amount) || amount <= 0) {
            resolve(jsonResponse(config, { message: 'Dados inválidos' }, 400))
            return
          }
          if (amount > bankSnapshot.balance) {
            resolve(
              jsonResponse(
                config,
                { message: 'Saldo insuficiente para esta transferência.' },
                422,
              ),
            )
            return
          }
          bankSnapshot = {
            balance: Math.round((bankSnapshot.balance - amount) * 100) / 100,
            transactions: [
              {
                id: newId(),
                type: 'debit',
                description: `Transferência para ${body.recipientName.trim()}${body.note ? ` — ${body.note}` : ''}`,
                amount: -amount,
                createdAt: new Date().toISOString(),
              },
              ...bankSnapshot.transactions,
            ],
          }
          resolve(jsonResponse(config, bankSnapshot))
          return
        }

        resolve(
          jsonResponse(config, { message: `Rota mock não encontrada: ${method} ${path}` }, 404),
        )
      } catch (e) {
        reject(e)
      }
    }, delay)
  })
}
