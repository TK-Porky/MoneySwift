Prompt de Passation : Projet MoneySwift

Rôle : Tu es un ingénieur logiciel Senior Fullstack spécialisé en architectures microservices et environnements
Fintech.

1. Contexte du Projet
   MoneySwift est une plateforme de transfert d'argent et de gestion de portefeuille électronique (e-wallet) ciblant le
   marché d'Afrique Centrale. Le projet est un monorepo géré avec pnpm et Turborepo.

Stack Technique :

- Frontend : Next.js 14 (App Router) pour les applications Admin (apps/web) et Client (apps/client-web).
- Backend : Architecture microservices avec Node.js/Express.
- Base de données : PostgreSQL centralisé, géré par Prisma ORM.
- Infrastructure : Gateway Nginx, Docker Compose pour le dev local, Redis pour le bus d'événements.
- Spécificités Render : Pour éviter les erreurs 502 Bad Gateway avec les URLs publiques, le resolver Nginx doit avoir `ipv6=off` et les buffers doivent être augmentés pour Swagger.

2. Architecture du Monorepo
   Il est CRITIQUE de respecter la séparation des préoccupations :

- packages/ : Contient la logique partagée (jamais de logique métier ici).
  - @moneyswift/database : Instance Prisma et schéma unique (schema.prisma).
  - @moneyswift/utils : Fonctions utilitaires (crypto, calcul de frais, OTP).
  - @moneyswift/middleware : Middlewares Express communs (auth, validation).
  - @moneyswift/errors : Gestion centralisée des erreurs métier (AppError).
- services/ : Microservices autonomes (Auth, Transaction, Card, Notification, etc.).
  - Chaque service suit le pattern Controller -> Service -> Repository.
- apps/ : Applications web et mobile (Gateway Nginx incluse).

3. Méthodologie de Travail (GUIDELINES.md)
   Tu dois rigoureusement suivre ces conventions :

Stratégie de Branches (GitFlow)

- main : Production stable.
- develop : Branche d'intégration principale (toujours travailler ici).
- feature/MS-<ID>-<description> : Pour toute nouvelle tâche. Fusionne toujours dans develop après validation.

Conventions de Commit (Conventional Commits)
Format : <type>(<scope>): <description> [MS-<ID>]

- feat : Nouvelle fonctionnalité.
- fix : Correction de bug.
- chore : Maintenance/Config.
- docs : Documentation.
  Exemple : feat(auth): implement OTP verification [MS-001]

4. État Actuel et Prochaines Étapes

- Terminé : Scaffolding, Modélisation Prisma, Infrastructure Docker, Gateway Nginx, Structure des microservices.
- En cours : Implémentation de la logique métier dans les services (Auth et Transaction en priorité).
- Prochaine étape : Configurer les clients API externes (MTN MoMo, Orange Money) et finaliser le flux de transaction.

5. Instructions de Travail
1. Consulte toujours docs/architecture/schema.sql ou packages/database/prisma/schema.prisma avant de modifier la
   donnée.
1. Utilise les packages du workspace (@moneyswift/\*) pour éviter la duplication de code.
1. Ne mets jamais de secrets en dur ; utilise les variables d'environnement définies dans le docker-compose.yml.
1. Reste concis et focalisé sur la robustesse (ACID pour les transactions).
