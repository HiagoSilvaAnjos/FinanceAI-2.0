# Dockerfile para produção - Finance AI 2.0
FROM node:22-alpine as builder

WORKDIR /app

# Instalar dependências do sistema necessárias para build
RUN apk add --no-cache libc6-compat

# Copiar arquivos de dependências
COPY package.json package-lock.json ./

# Instalar TODAS as dependências (incluindo devDependencies para o build)
RUN npm ci && npm cache clean --force

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build:simple

# Limpar dependências de desenvolvimento após o build
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

# Configurar variáveis de ambiente de produção
ENV NODE_ENV=production
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
ENV HOSTNAME="0.0.0.0"

ENV PORT=${PORT:-3000}

# Mudar para usuário não-root
USER nextjs

# Expor porta
EXPOSE ${PORT}

# Usar dumb-init como init system
ENTRYPOINT ["dumb-init", "--"]

# Comando para iniciar a aplicação
CMD ["node", "server.js"]