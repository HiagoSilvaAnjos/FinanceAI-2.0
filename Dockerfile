# Dockerfile para FinanceAI - Versão Simplificada
FROM node:22-slim as builder
WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copiar arquivos de dependência e instalar TODAS as dependências (dev + prod)
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código fonte
COPY . .
RUN rm -f .env.local

# Configurar variáveis de ambiente para o build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build da aplicação
RUN npm run build

# Estágio de produção
FROM node:22-slim as runner
WORKDIR /app

# Instalar apenas ca-certificates para HTTPS
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Configurações de ambiente
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Criar usuário não-root
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nextjs

# Copiar apenas os arquivos necessários para produção
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Verificar se os arquivos foram copiados
RUN ls -la && ls -la .next/

USER nextjs

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação (usando o servidor standalone)
CMD ["node", "server.js"]