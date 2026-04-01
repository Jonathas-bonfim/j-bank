import axios from 'axios'
import { mockAxiosAdapter } from '@/api/mock-adapter'
import type { AccountSnapshot, LoginResponse, TransferPayload } from '@/types/bank'

export const api = axios.create({
  baseURL: '/api',
  adapter: mockAxiosAdapter,
  headers: { 'Content-Type': 'application/json' },
})

export async function loginRequest(email: string, password: string) {
  const { data } = await api.post<LoginResponse>('auth/login', { email, password })
  return data
}

export async function fetchAccount() {
  const { data } = await api.get<AccountSnapshot>('account')
  return data
}

export async function transferRequest(payload: TransferPayload) {
  const { data } = await api.post<AccountSnapshot>('transfers', payload)
  return data
}
