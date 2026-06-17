# Guide de Versionnement Professionnel

## Stratégie de Branches

Nous adoptons une architecture **GitFlow enrichie** pour assurer une traçabilité optimale et une séparation claire des environnements en entreprise.

### Branches Permanentes
- **`main`** (ou `production`) : Représente l'état livré en production. Seul le code stable et validé y est mergé et tagger.
- **`preprod`** : Environnement de recette et validation finale avant mise en production.
- **`develop`** : Branche d'intégration principale pour le développement en cours.

### Branches de Support
- **`feature/<ticket>-<description>`** : Développement de nouvelles fonctionnalités. Se branche depuis `develop` et est mergée dans `develop` et `preprod`.
- **`fix/<ticket>-<description>`** : Corrections de bugs. Se branche depuis `develop` ou `preprod` selon l'urgence.
- **`chore/<ticket>-<description>`** : Tâches de maintenance (mise à jour de dépendances, configurations, etc.).
- **`hotfix/<ticket>-<description>`** : Correctifs urgents en production. Se branche depuis `production` et est mergée dans `production`, `preprod` et `develop`.
- **`release/<version>`** : Préparation de version. Se branche depuis `develop` pour freeze les fonctionnalités avant recette.

### Règles de Nommage
- Utiliser des **préfixes standardisés** (`feature/`, `fix/`, etc.)
- Inclure l'**identifiant du ticket Jira** (ex: `PROJ-123`)
- Ajouter une **description courte et explicite** en kebab-case (ex: `feature/PROJ-123-add-auth-module`)

---

## Conventions de Commit

Nous suivons la spécification [Conventional Commits](https://www.conventionalcommits.org/) avec des ajustements pour l'entreprise.

### Format Standard
`<type>(<scope>): <description>`

### Types Obligatoires
| Type | Description | Exemple |
|------|-------------|---------|
| **`feat`** | Nouvelle fonctionnalité utilisateur | `feat(auth): implement OAuth2 login` |
| **`fix`** | Correction de bug utilisateur | `fix(api): resolve timeout on large payloads` |
| **`chore`** | Tâches techniques (config, deps) | `chore(deps): upgrade Node to v20` |
| **`docs`** | Documentation uniquement | `docs(readme): update installation guide` |
| **`style`** | Formatage (espaces, points-virgules) | `style(ui): fix indentation in components` |
| **`refactor`** | Refactorisation sans changement fonctionnel | `refactor(service): extract validation logic` |
| **`perf`** | Amélioration des performances | `perf(db): optimize query with index` |
| **`test`** | Ajout ou correction de tests | `test(auth): add unit tests for login` |
| **`ci`** | Modification des pipelines CI/CD | `ci(github): add security scanning workflow` |
| **`security`** | Correctif de sécurité | `security(auth): patch JWT vulnerability` |

### Règles Supplémentaires
- **Description** : Présent à l'impératif (ex: "add", "fix", "update"), en minuscules, max 50 caractères.
- **Corps du message** (optionnel) : Expliquer le "pourquoi" et le "comment" si nécessaire.
- **Référence au ticket** : Ajouter `[PROJ-123]` en fin de ligne ou dans le corps.

### Exemples de Commits Valides
```bash
feat(cart): add quantity selector for products [PROJ-456]
fix(payment): correct currency conversion for EUR [PROJ-789]
docs(api): update swagger documentation [PROJ-321]
refactor(backend): simplify error handling middleware [PROJ-654]