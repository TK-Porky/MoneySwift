FROM node:20-alpine AS base
RUN npm install -g pnpm
RUN apk add --no-cache openssl libc6-compat

FROM base AS builder
WORKDIR /app
COPY . .
# On installe tout d'abord pour générer le dossier node_modules correct
RUN pnpm install --frozen-lockfile
RUN pnpm db:generate

# La commande deploy crée un dossier autonome avec TOUTES les dépendances (inclus @moneyswift/*)
# Le flag --legacy est nécessaire pour pnpm v10 si l'injection n'est pas par projet
RUN pnpm --filter=@moneyswift/auth-service --prod deploy --legacy /app/deployed

FROM base AS runner
WORKDIR /app/deployed
# On ne copie QUE le dossier autonome généré par pnpm deploy
COPY --from=builder /app/deployed ./
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "index.js"]
