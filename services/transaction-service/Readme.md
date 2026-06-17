Routes
──────────────────────────────────────────────────────────
POST   /api/v1/transactions/deposit        Dépôt (MTN/Orange → MoneySwift)
POST   /api/v1/transactions/withdraw       Retrait (MoneySwift → MTN/Orange)
POST   /api/v1/transactions/transfer       Envoi d'argent (user → user)
GET    /api/v1/transactions                Historique paginé
GET    /api/v1/transactions/:reference     Détail d'une transaction
GET    /api/v1/transactions/stats          Résumé (total envoyé, reçu, etc.)