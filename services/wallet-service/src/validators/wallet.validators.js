const { z } = require('zod');

const linkOperatorSchema = z.object({
  provider: z.enum(['MTN', 'ORANGE']),
  providerPhone: z.string().regex(/^\+237[2368]\d{8}$/)
});

module.exports = {
  linkOperatorSchema
};
