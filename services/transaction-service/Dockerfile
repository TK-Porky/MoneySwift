FROM node:20-alpine AS base
RUN npm install -g pnpm
RUN apk add --no-cache openssl libc6-compat
ENV CI=true
WORKDIR /app

FROM base AS builder
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm db:generate
RUN pnpm prune --prod

FROM base AS runner
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/transaction-service ./services/transaction-service
COPY --from=builder /app/package.json ./package.json

WORKDIR /app/services/transaction-service
ENV NODE_ENV=production
EXPOSE 3004
CMD ["node", "index.js"]
