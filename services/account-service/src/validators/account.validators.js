const { z } = require('zod');

exports.updateAccountSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  profilePhoto: z.string().url().optional()
});

exports.submitKycSchema = z.object({
  idType: z.enum(['NATIONAL_ID', 'PASSPORT', 'DRIVERS_LICENSE']),
  idNumber: z.string().min(5),
  idImageFront: z.string().url(),
  idImageBack: z.string().url().optional()
});
