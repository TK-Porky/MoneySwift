FROM node:20-alpine AS builder
RUN npm install -g pnpm
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm db:generate
# On supprime les dépendances de dev pour alléger l'image
RUN pnpm prune --prod

FROM node:20-alpine AS runner
WORKDIR /app
# On copie TOUT le projet (qui est maintenant léger grâce au prune)
# Cela préserve la structure /packages, /services, /node_modules
COPY --from=builder /app ./

# On se place dans le service pour l'exécution
WORKDIR /app/services/auth-service
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "index.js"]
