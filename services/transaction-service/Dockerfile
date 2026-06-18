FROM node:20-alpine
RUN npm install -g pnpm
RUN apk add --no-cache openssl libc6-compat
ENV CI=true
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm db:generate

ENV NODE_ENV=production
EXPOSE 3004
CMD ["node", "services/transaction-service/index.js"]
