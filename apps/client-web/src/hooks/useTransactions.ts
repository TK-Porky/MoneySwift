import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { ApiResponse, PaginatedTransactions, Transaction } from '@/types'
import type { DepositInput, WithdrawInput, TransferInput } from '@/lib/validators/transaction.validator'

interface HistoryParams {
  page?:      number
  limit?:     number
  type?:      string
  startDate?: string
  endDate?:   string
}

export function useTransactions(params: HistoryParams = {}) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn:  async () => {
      const res = await api.get<ApiResponse<PaginatedTransactions['data']> & {
        meta: PaginatedTransactions['meta']
      }>('/transactions', { params })
      return res.data
    },
  })
}

export function useTransaction(reference: string) {
  return useQuery({
    queryKey: ['transaction', reference],
    queryFn:  async () => {
      const res = await api.get<ApiResponse<Transaction>>(`/transactions/${reference}`)
      return res.data.data
    },
    enabled: !!reference,
  })
}

export function useDeposit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: DepositInput) => {
      const res = await api.post<ApiResponse<{ reference: string; status: string }>>(
        '/transactions/deposit',
        data
      )
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useWithdraw() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: WithdrawInput) => {
      const res = await api.post<ApiResponse<{ reference: string; status: string }>>(
        '/transactions/withdraw',
        data
      )
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TransferInput) => {
      const res = await api.post<ApiResponse<{ reference: string; status: string }>>(
        '/transactions/transfer',
        data
      )
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}