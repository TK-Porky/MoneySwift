import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { ApiResponse, Wallet } from '@/types'

export function useWallets() {
  return useQuery({
    queryKey: ['wallets'],
    queryFn:  async () => {
      const res = await api.get<ApiResponse<Wallet[]>>('/wallets')
      return res.data.data
    },
  })
}

export function useBalance() {
  return useQuery({
    queryKey: ['balance'],
    queryFn:  async () => {
      const res = await api.get<ApiResponse<{ balance: number; currency: string }>>('/wallets/balance')
      return res.data.data
    },
    refetchInterval: 30_000, // Rafraîchir toutes les 30s
  })
}