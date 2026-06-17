const { z } = require('zod');

const initiatePaymentSchema = z.object({
  amount: z.number().min(100),
  description: z.string().max(100).optional(),
  callbackUrl: z.string().url().optional()
});

module.exports = {
  initiatePaymentSchema
};
