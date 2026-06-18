FROM node:20-alpine AS base
RUN npm install -g pnpm
# Install runtime/build dependencies for Prisma on Alpine
RUN apk add --no-cache openssl libc6-compat

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile --ignore-scripts=false
ENV DATABASE_URL="postgresql://build:build@localhost:5432/placeholder"
RUN pnpm db:generate
RUN pnpm --filter=@moneyswift/card-service --prod deploy --legacy /app/deployed

FROM base AS runner
WORKDIR /app/deployed
COPY --from=builder /app/deployed ./
ENV NODE_ENV=production
EXPOSE 3006
CMD ["node", "index.js"]
