FROM node:20-alpine AS base
RUN npm install -g pnpm
# Install runtime/build dependencies for Prisma on Alpine
RUN apk add --no-cache openssl libc6-compat

FROM base AS deps
WORKDIR /app
# 1. Copy only manifest files first
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/database/package.json ./packages/database/
COPY packages/errors/package.json ./packages/errors/
COPY packages/events/package.json ./packages/events/
COPY packages/middleware/package.json ./packages/middleware/
COPY packages/utils/package.json ./packages/utils/
COPY packages/integrations/package.json ./packages/integrations/
COPY services/payment-service/package.json ./services/payment-service/

# 2. Install dependencies (may fail build scripts if pnpm-lock is missing, but should work)
# --ignore-scripts=false force pnpm à exécuter les postinstall
RUN pnpm install --frozen-lockfile --ignore-scripts=false

# 3. Copy shared packages source
COPY packages/ ./packages/

FROM base AS builder
WORKDIR /app
# 4. Generate Prisma Client (critical step)
ENV DATABASE_URL="postgresql://build:build@localhost:5432/placeholder"
RUN ./node_modules/.bin/prisma generate --schema=packages/database/prisma/schema.prisma

# 5. Copy the specific service source
COPY services/payment-service/ ./services/payment-service/

FROM base AS runner
WORKDIR /app
# Copy built artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/payment-service ./services/payment-service
COPY --from=builder /app/package.json ./package.json

WORKDIR /app/services/payment-service
ENV NODE_ENV=production
EXPOSE 3005
CMD ["node", "index.js"]
