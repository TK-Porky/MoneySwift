const { z } = require('zod');

const depositSchema = z.object({
  provider: z.enum(['MTN', 'ORANGE']),
  providerPhone: z.string().regex(/^\+237[2368]\d{8}$/),
  amount: z.number().min(100).max(5000000)
});

const withdrawSchema = z.object({
  provider: z.enum(['MTN', 'ORANGE']),
  providerPhone: z.string().regex(/^\+237[2368]\d{8}$/),
  amount: z.number().min(100).max(5000000),
  pin: z.string().length(6)
});

const transferSchema = z.object({
  toPhone: z.string().regex(/^\+237[2368]\d{8}$/),
  amount: z.number().min(100),
  pin: z.string().length(6),
  description: z.string().max(100).optional()
});

const historySchema = z.object({
  page: z.string().optional().transform(v => parseInt(v) || 1),
  limit: z.string().optional().transform(v => parseInt(v) || 20),
  type: z.enum(['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

module.exports = {
  depositSchema,
  withdrawSchema,
  transferSchema,
  historySchema
};
