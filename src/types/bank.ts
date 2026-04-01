export type TransactionType = 'credit' | 'debit'

export interface Transaction {
  id: string
  type: TransactionType
  description: string
  amount: number
  createdAt: string
}

export interface AccountSnapshot {
  balance: number
  transactions: Transaction[]
}

export interface LoginResponse {
  token: string
  user: {
    email: string
    name: string
  }
}

export interface TransferPayload {
  recipientName: string
  amount: number
  note?: string
}
