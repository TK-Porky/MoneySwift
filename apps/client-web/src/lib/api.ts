import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '@/types'

// ── Instance Axios ─────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:80/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor : injecter le JWT ─────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor : gérer le refresh token ─────────────────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Token expiré → tenter le refresh
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL ?? 'http://localhost:80/api/v1'}/auth/refresh`,
          { refreshToken }
        )

        localStorage.setItem('accessToken',  data.data.accessToken)
        localStorage.setItem('refreshToken', data.data.refreshToken)

        original.headers.Authorization = `Bearer ${data.data.accessToken}`
        return api(original)

      } catch {
        // Refresh échoué → déconnexion
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api