FROM node:20-alpine AS base
RUN npm install -g pnpm
RUN apk add --no-cache openssl libc6-compat
ENV CI=true
WORKDIR /app

# Étape de build
FROM base AS builder
COPY . .
# Avec node-linker=hoisted, pnpm crée un node_modules classique et plat
RUN pnpm install --frozen-lockfile
RUN pnpm db:generate
RUN pnpm prune --prod

# Étape finale
FROM base AS runner
# On copie le node_modules plat et les packages partagés
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/auth-service ./services/auth-service
COPY --from=builder /app/package.json ./package.json

WORKDIR /app/services/auth-service
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "index.js"]
