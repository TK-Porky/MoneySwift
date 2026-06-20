import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthTokens } from '@/types'

interface AuthState {
  user:         User | null
  accessToken:  string | null
  refreshToken: string | null
  isAuth:       boolean

  // Actions
  setAuth:   (user: User, tokens: AuthTokens) => void
  setUser:   (user: User) => void
  logout:    () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:         null,
      accessToken:  null,
      refreshToken: null,
      isAuth:       false,

      setAuth: (user, tokens) => {
        localStorage.setItem('accessToken',  tokens.accessToken)
        localStorage.setItem('refreshToken', tokens.refreshToken)
        set({
          user,
          accessToken:  tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuth:       true,
        })
      },

      setUser: (user) => set({ user }),

      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({
          user:         null,
          accessToken:  null,
          refreshToken: null,
          isAuth:       false,
        })
      },
    }),
    {
      name:    'moneyswift-auth',
      // Ne persister que l'essentiel — pas les tokens (déjà dans localStorage)
      partialize: (state) => ({ user: state.user, isAuth: state.isAuth }),
    }
  )
)