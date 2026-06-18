FROM node:20-alpine AS builder
RUN npm install -g pnpm
RUN apk add --no-cache openssl libc6-compat
ENV CI=true
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm db:generate
RUN pnpm prune --prod

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app ./

WORKDIR /app/services/wallet-service
ENV NODE_ENV=production
EXPOSE 3003
CMD ["node", "index.js"]
