Routes
──────────────────────────────────────────────────────────
POST   /api/v1/cards                  Créer une carte virtuelle
GET    /api/v1/cards                  Lister mes cartes
GET    /api/v1/cards/:id              Détail d'une carte
PATCH  /api/v1/cards/:id/freeze       Geler/dégeler une carte
DELETE /api/v1/cards/:id              Annuler une carte
PATCH  /api/v1/cards/:id/limit        Modifier le plafond de dépenses
GET    /api/v1/cards/:id/reveal       Afficher numéro + CVV (PIN requis)