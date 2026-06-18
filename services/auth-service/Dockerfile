FROM node:20-alpine
RUN npm install -g pnpm
RUN apk add --no-cache openssl libc6-compat
ENV CI=true
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm db:generate

# On ne se déplace pas dans le dossier du service
# On l'exécute depuis la racine /app
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "services/auth-service/index.js"]
