# MoneySwift - Fintech API Gateway & Microservices

Plateforme de transfert d'argent et de gestion de portefeuille électronique ciblant le marché d'Afrique Centrale.

## 🚀 Architecture

- **Gateway** : Nginx agissant comme point d'entrée unique.
- **Microservices** : Auth, Account, Wallet, Transaction, Card, Notification.
- **Base de données** : PostgreSQL avec Prisma ORM.
- **Infrastructure** : Déploiement optimisé pour Render.

## 🛠 Installation & Setup

1. **Installation des dépendances** :
   ```bash
   pnpm install
   ```

2. **Initialisation de la base de données** :
   Assurez-vous que votre `DATABASE_URL` est configurée dans votre fichier `.env`.
   ```bash
   pnpm db:push
   ```

3. **Lancement en local (Dev)** :
   ```bash
   pnpm dev
   ```

## 🌐 Déploiement sur Render

### Configuration Nginx
Pour éviter les erreurs **502 Bad Gateway** lors de l'utilisation d'URLs publiques sur Render :
- Le resolver doit désactiver l'IPv6 : `resolver 8.8.8.8 1.1.1.1 valid=30s ipv6=off;`
- Les buffers doivent être augmentés pour supporter les définitions Swagger volumineuses.
- Le paramètre `proxy_ssl_name` doit être configuré pour le handshake SSL/SNI.

### Documentation API
Accessible via la Gateway : `https://<votre-url-gateway>.onrender.com/api-docs/`

## 🧪 Tests
Exécutez la suite de tests avec :
```bash
pnpm test
```
