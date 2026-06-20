import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { ApiResponse, VirtualCard } from '@/types'

export function useCards() {
  return useQuery({
    queryKey: ['cards'],
    queryFn:  async () => {
      const res = await api.get<ApiResponse<VirtualCard[]>>('/cards')
      return res.data.data
    },
  })
}

export function useCreateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { cardHolder?: string; spendingLimit?: number; pin: string }) => {
      const res = await api.post<ApiResponse<VirtualCard & { cvv: string; warning: string }>>(
        '/cards',
        data
      )
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}

export function useFreezeCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (cardId: string) => {
      const res = await api.patch<ApiResponse<VirtualCard>>(`/cards/${cardId}/freeze`)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}