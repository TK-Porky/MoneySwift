FROM node:20-alpine AS builder
RUN npm install -g pnpm
RUN apk add --no-cache openssl libc6-compat
# Force le mode CI pour éviter les demandes de confirmation (TTY)
ENV CI=true
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm db:generate
RUN pnpm prune --prod

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app ./

WORKDIR /app/services/auth-service
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "index.js"]
