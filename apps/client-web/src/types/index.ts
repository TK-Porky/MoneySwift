// ── Enums ─────────────────────────────────────────────────────────
export type TransactionType     = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'PAYMENT'
export type TransactionStatus   = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REVERSED'
export type WalletProvider      = 'MTN' | 'ORANGE' | 'MONEYSWIFT'
export type CardStatus          = 'ACTIVE' | 'FROZEN' | 'EXPIRED' | 'CANCELLED'
export type CardNetwork         = 'VISA' | 'MASTERCARD'
export type NotificationType    = 'TRANSACTION' | 'SECURITY' | 'PROMOTION' | 'SYSTEM'
export type KycStatus           = 'PENDING' | 'VERIFIED' | 'REJECTED'

// ── User ──────────────────────────────────────────────────────────
export interface User {
  id:          string
  phoneNumber: string
  fullName:    string
  email?:      string
  profilePhoto?: string
  kycStatus:   KycStatus
  isActive:    boolean
  createdAt:   string
}

// ── Account ───────────────────────────────────────────────────────
export interface Account {
  id:            string
  accountNumber: string
  accountType:   'PERSONAL' | 'BUSINESS'
  status:        'ACTIVE' | 'FROZEN' | 'CLOSED'
  createdAt:     string
}

// ── Wallet ────────────────────────────────────────────────────────
export interface Wallet {
  id:            string
  provider:      WalletProvider
  providerPhone?: string
  balance:       number
  currency:      string
  isPrimary:     boolean
}

// ── Transaction ───────────────────────────────────────────────────
export interface Transaction {
  id:          string
  reference:   string
  type:        TransactionType
  status:      TransactionStatus
  amount:      number
  fee:         number
  currency:    string
  description?: string
  provider?:   'MTN_MOMO' | 'ORANGE_MONEY' | 'ANGARA_PAY'
  initiatedAt: string
  completedAt?: string
  senderWallet?: {
    provider:      WalletProvider
    providerPhone?: string
  }
  receiverWallet?: {
    provider:      WalletProvider
    providerPhone?: string
  }
}

export interface PaginatedTransactions {
  data: Transaction[]
  meta: {
    page:       number
    limit:      number
    total:      number
    totalPages: number
  }
}

// ── Virtual Card ──────────────────────────────────────────────────
export interface VirtualCard {
  id:           string
  cardNumber:   string
  cardHolder:   string
  expiryMonth:  number
  expiryYear:   number
  network:      CardNetwork
  spendingLimit?: number
  status:       CardStatus
  createdAt:    string
}

// ── Notification ──────────────────────────────────────────────────
export interface Notification {
  id:        string
  type:      NotificationType
  title:     string
  body:      string
  channel:   'PUSH' | 'SMS' | 'EMAIL' | 'IN_APP'
  isRead:    boolean
  createdAt: string
}

// ── Auth ──────────────────────────────────────────────────────────
export interface AuthTokens {
  accessToken:  string
  refreshToken: string
}

export interface LoginResponse extends AuthTokens {
  user: User
}

// ── API Responses ─────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data:    T
  meta?:   Record<string, unknown>
}

export interface ApiError {
  success: false
  error:   string
  code?:   string
}