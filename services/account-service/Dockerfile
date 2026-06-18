FROM node:20-alpine AS base
RUN npm install -g pnpm
RUN apk add --no-cache openssl libc6-compat

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm db:generate
RUN pnpm --filter=@moneyswift/account-service --prod deploy --legacy /app/deployed

FROM base AS runner
WORKDIR /app/deployed
COPY --from=builder /app/deployed ./
ENV NODE_ENV=production
EXPOSE 3002
CMD ["node", "index.js"]
