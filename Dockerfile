# Dockerfile para FinanceAI
FROM node:22-slim as builder
WORKDIR /app

# Instalar dependências do sistema necessárias
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar arquivos de dependências
COPY package.json package-lock.json ./

# Limpar cache e reinstalar dependências
RUN npm cache clean --force
RUN npm ci --verbose --no-optional

# Copiar código fonte
COPY . .
RUN rm -f .env.local

# Configurar variáveis de ambiente para o build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=1

# Tentar o build - se falhar, mostrar logs detalhados
RUN npm run build 2>&1 | tee build.log || (cat build.log && exit 1)

# Limpar dependências de desenvolvimento
RUN npm prune --production

# Estágio de produção
FROM node:22-slim as runner
WORKDIR /app

# Instalar apenas as dependências de runtime necessárias
RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Configurações de ambiente
ENV NODE_ENV=production
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
ENV NEXT_TELEMETRY_DISABLED=1

# Variáveis de ambiente para produção
ARG DATABASE_URL
ARG PORT=3000
ARG BETTER_AUTH_SECRET

ENV DATABASE_URL=${DATABASE_URL}
ENV PORT=${PORT}
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}

# Criar usuário não-root
RUN groupadd --gid 1001 nodejs
RUN useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nextjs

# Copiar arquivos necessários do estágio anterior
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/package-lock.json ./package-lock.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs

# Expor porta
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/health || exit 1

# Comando para iniciar a aplicação
CMD ["sh", "-c", "NODE_ENV=production npx next start -H 0.0.0.0 -p ${PORT}"]