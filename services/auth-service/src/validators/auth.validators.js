const { z } = require('zod');

const registerSchema = z.object({
  phoneNumber: z.string().regex(/^\+237[2368]\d{8}$/, 'Format de numéro camerounais invalide (+237XXXXXXXXX)'),
  fullName: z.string().min(2, 'Nom complet trop court'),
  pin: z.string().length(6, 'Le PIN doit contenir 6 chiffres').regex(/^\d+$/, 'Le PIN doit être numérique'),
  email: z.string().email('Email invalide').optional()
});

const verifyPhoneSchema = z.object({
  phoneNumber: z.string().regex(/^\+237[2368]\d{8}$/, 'Format de numéro camerounais invalide'),
  code: z.string().length(6, 'Le code doit contenir 6 chiffres')
});

const loginSchema = z.object({
  phoneNumber: z.string().regex(/^\+237[2368]\d{8}$/, 'Format de numéro camerounais invalide'),
  pin: z.string().length(6, 'Le PIN doit contenir 6 chiffres'),
  deviceInfo: z.object({
    os: z.string().optional(),
    model: z.string().optional(),
    appVersion: z.string().optional()
  }).optional()
});

const changePinSchema = z.object({
  currentPin: z.string().length(6, 'Le PIN doit contenir 6 chiffres'),
  newPin: z.string().length(6, 'Le PIN doit contenir 6 chiffres').regex(/^\d+$/, 'Le PIN doit être numérique')
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token requis')
});

module.exports = {
  registerSchema,
  verifyPhoneSchema,
  loginSchema,
  changePinSchema,
  refreshTokenSchema
};
