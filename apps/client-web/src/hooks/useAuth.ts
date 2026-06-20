import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { LoginInput, RegisterInput, VerifyOtpInput } from '@/lib/validators/auth.validator'
import type { LoginResponse, ApiResponse } from '@/types'

// ── Login ──────────────────────────────────────────────────────────
export function useLogin() {
  const { setAuth } = useAuthStore()
  const navigate    = useNavigate()

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const res = await api.post<ApiResponse<LoginResponse>>('/auth/login', data)
      return res.data.data
    },
    onSuccess: (data) => {
      setAuth(data.user, {
        accessToken:  data.accessToken,
        refreshToken: data.refreshToken,
      })
      navigate('/dashboard')
    },
  })
}

// ── Register ───────────────────────────────────────────────────────
export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      const res = await api.post<ApiResponse<{ userId: string; message: string }>>(
        '/auth/register',
        data
      )
      return res.data.data
    },
    onSuccess: (data) => {
      navigate('/verify-otp', { state: { userId: data.userId } })
    },
  })
}

// ── Verify OTP ─────────────────────────────────────────────────────
export function useVerifyOtp() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (data: VerifyOtpInput & { userId: string }) => {
      const res = await api.post<ApiResponse<{ verified: boolean }>>('/auth/verify-phone', data)
      return res.data.data
    },
    onSuccess: () => {
      navigate('/login')
    },
  })
}

// ── Logout ─────────────────────────────────────────────────────────
export function useLogout() {
  const { logout } = useAuthStore()
  const navigate   = useNavigate()

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout')
    },
    onSettled: () => {
      logout()
      navigate('/login')
    },
  })
}