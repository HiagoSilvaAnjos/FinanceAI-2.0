# Dockerfile para Finance AI 2.0 - Versão Simplificada
FROM node:22-alpine as builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Remover arquivo de ambiente local se existir
RUN rm -f .env.local

# Definir variáveis de ambiente para build
ARG DATABASE_URL
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG NODE_ENV=production
ARG PORT=10000

ENV DATABASE_URL=${DATABASE_URL}
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}

# Build da aplicação (sem gerar Drizzle - assumindo que já foi gerado)
RUN npm run build:prod

# Limpar dependências de desenvolvimento
RUN npm prune --production

# Stage de produção
FROM node:22-alpine as runner

WORKDIR /app

# Instalar dumb-init para gerenciamento de processos
RUN apk add --no-cache dumb-init

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos necessários do builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle

# Configurar variáveis de ambiente de produção
ENV NODE_ENV=production
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
ENV HOSTNAME="0.0.0.0"

# Definir argumentos e variáveis de ambiente para runtime
ARG DATABASE_URL
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG PORT=10000

ENV DATABASE_URL=${DATABASE_URL}
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
ENV PORT=${PORT}

# Mudar para usuário não-root
USER nextjs

# Expor porta
EXPOSE ${PORT}

# Usar dumb-init para inicializar o processo
ENTRYPOINT ["dumb-init", "--"]

# Comando para iniciar a aplicação
CMD ["sh", "-c", "node server.js"]