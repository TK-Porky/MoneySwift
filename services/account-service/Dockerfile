FROM node:20-alpine AS builder
RUN npm install -g pnpm
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm db:generate

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/account-service ./services/account-service
COPY --from=builder /app/package.json ./package.json

WORKDIR /app/services/account-service
ENV NODE_ENV=production
EXPOSE 3002
CMD ["node", "index.js"]
