const { z } = require('zod');

const createCardSchema = z.object({
  cardHolder: z.string().optional(),
  spendingLimit: z.number().min(1000).optional(),
  pin: z.string().length(6)
});

const limitSchema = z.object({
  spendingLimit: z.number().min(1000)
});

const revealCardSchema = z.object({
  pin: z.string().length(6)
});

const cancelCardSchema = z.object({
  pin: z.string().length(6)
});

module.exports = {
  createCardSchema,
  limitSchema,
  revealCardSchema,
  cancelCardSchema
};
