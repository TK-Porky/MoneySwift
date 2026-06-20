import { z } from 'zod'

const cameroonPhone = z
  .string()
  .regex(/^\+237[0-9]{9}$/, 'Invalid Cameroonian number (+237XXXXXXXXX)')

export const depositSchema = z.object({
  provider:      z.enum(['MTN', 'ORANGE']),
  providerPhone: cameroonPhone,
  amount:        z.number({ error: 'Amount is required' })
                  .min(100, 'Minimum amount is 100 XAF')
                  .max(5_000_000, 'Maximum amount is 5,000,000 XAF'),
  pin:           z.string().length(6, 'PIN must be 6 digits'),
})

export const withdrawSchema = depositSchema

export const transferSchema = z.object({
  toPhone:     cameroonPhone,
  amount:      z.number({ error: 'Amount is required' })
                .min(100, 'Minimum amount is 100 XAF'),
  pin:         z.string().length(6, 'PIN must be 6 digits'),
  description: z.string().max(100).optional(),
})

export type DepositInput   = z.infer<typeof depositSchema>
export type WithdrawInput  = z.infer<typeof withdrawSchema>
export type TransferInput  = z.infer<typeof transferSchema>