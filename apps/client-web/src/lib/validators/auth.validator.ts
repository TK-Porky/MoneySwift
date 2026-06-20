import { z } from 'zod'

const cameroonPhone = z
  .string()
  .regex(/^\+237[0-9]{9}$/, 'Invalid Cameroonian number (+237XXXXXXXXX)')

export const registerSchema = z.object({
  fullName:    z.string().min(2, 'Full name is required'),
  phoneNumber: cameroonPhone,
  email:       z.string().email('Invalid email').optional().or(z.literal('')),
  pin:         z.string().length(6, 'PIN must be exactly 6 digits').regex(/^\d+$/, 'PIN must be numeric'),
  confirmPin:  z.string(),
}).refine((d) => d.pin === d.confirmPin, {
  message: 'PINs do not match',
  path:    ['confirmPin'],
})

export const loginSchema = z.object({
  phoneNumber: cameroonPhone,
  pin:         z.string().length(6, 'PIN must be 6 digits'),
})

export const verifyOtpSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Digits only'),
})

export const changePinSchema = z.object({
  currentPin: z.string().length(6),
  newPin:     z.string().length(6).regex(/^\d+$/, 'PIN must be numeric'),
  confirmPin: z.string(),
}).refine((d) => d.newPin === d.confirmPin, {
  message: 'PINs do not match',
  path:    ['confirmPin'],
})

export type RegisterInput   = z.infer<typeof registerSchema>
export type LoginInput      = z.infer<typeof loginSchema>
export type VerifyOtpInput  = z.infer<typeof verifyOtpSchema>
export type ChangePinInput  = z.infer<typeof changePinSchema>