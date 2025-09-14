# Dockerfile para FinanceAI - Versão Otimizada
FROM node:22-slim as base
WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Estágio de instalação de dependências
FROM base as deps
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

# Estágio de build
FROM base as builder
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN rm -f .env.local

# Configurar variáveis de ambiente para o build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=1

# Build da aplicação com logs detalhados
RUN echo "Starting build..." && \
    npm run build && \
    echo "Build completed successfully!" && \
    ls -la .next/ && \
    echo "Contents of .next:" && \
    find .next -type f -name "*.json" | head -10

# Estágio de produção
FROM base as runner
WORKDIR /app

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
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nextjs

# Copiar dependências de produção
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copiar arquivos do build
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Verificar se o build foi copiado corretamente
RUN echo "Checking build files..." && \
    ls -la .next/ && \
    test -f .next/BUILD_ID && echo "BUILD_ID found" || echo "BUILD_ID missing" && \
    test -d .next/server && echo "Server files found" || echo "Server files missing"

USER nextjs

# Expor porta
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/ || exit 1

# Comando para iniciar a aplicação
CMD ["sh", "-c", "echo 'Starting Next.js...' && NODE_ENV=production npx next start -H 0.0.0.0 -p ${PORT}"]