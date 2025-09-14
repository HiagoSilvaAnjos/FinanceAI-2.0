# Dockerfile para FinanceAI

FROM node:22-slim as builder
WORKDIR /app

# Instalar dependências do sistema necessárias
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copiar arquivos de dependências
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código fonte
COPY . .
RUN rm -f .env.local

# Build da aplicação
RUN npm run build && npm prune --production

# Estágio de produção
FROM node:22-slim as runner
WORKDIR /app

# Instalar apenas as dependências de runtime necessárias
RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copiar arquivos necessários do estágio anterior
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules

# Configurações de ambiente
ENV NODE_ENV=production
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Variáveis de ambiente para produção
ARG DATABASE_URL
ARG PORT=3000

ENV DATABASE_URL=${DATABASE_URL}
ENV PORT=${PORT}

# Criar usuário não-root
RUN groupadd --gid 1001 nodejs
RUN useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nextjs

# Mudar ownership dos arquivos
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expor porta
EXPOSE ${PORT}

# Comando para iniciar a aplicação
CMD ["sh", "-c", "NODE_ENV=production npx next start -H 0.0.0.0 -p ${PORT}"]