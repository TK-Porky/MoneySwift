Routes
──────────────────────────────────────────────────────────
POST   /api/v1/auth/register          Inscription
POST   /api/v1/auth/verify-phone      Vérification OTP SMS
POST   /api/v1/auth/login             Login (phone + PIN)
POST   /api/v1/auth/refresh           Renouveler le JWT
POST   /api/v1/auth/logout            Révoquer la session
POST   /api/v1/auth/pin/reset         Réinitialiser le PIN (OTP)
POST   /api/v1/auth/pin/change        Changer le PIN (ancien PIN requis)
GET    /api/v1/auth/sessions          Lister les sessions actives
DELETE /api/v1/auth/sessions/:id      Révoquer une session