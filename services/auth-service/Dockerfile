FROM node:20-alpine
RUN npm install -g pnpm
RUN apk add --no-cache openssl libc6-compat
ENV CI=true
WORKDIR /app
COPY . .
# Installation complète de tout le monorepo
RUN pnpm install --frozen-lockfile
RUN pnpm db:generate

# On ne fait SURTOUT PAS de prune à la racine ici car cela supprimerait les liens vers les packages/
WORKDIR /app/services/auth-service
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "index.js"]
