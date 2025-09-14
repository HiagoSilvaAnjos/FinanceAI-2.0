# Dockerfile para FinanceAI
# Mantido como backup para futuras necessidades de deploy

FROM node:22-alpine as builder
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código fonte
COPY . .
RUN rm -f .env.local

# Build da aplicação
RUN npm run build && npm prune --production

# Estágio de produção
FROM node:22-alpine as runner
WORKDIR /app

# Copiar arquivos necessários do estágio anterior
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src

# Configurações de ambiente
ENV NODE_ENV=production
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Variáveis de ambiente para produção
ARG DATABASE_URL
ARG PORT=3000

ENV DATABASE_URL=${DATABASE_URL}
ENV PORT=${PORT}

# Expor porta
EXPOSE ${PORT}

# Comando para iniciar a aplicação
CMD ["sh", "-c", "NODE_ENV=production npx next start -H 0.0.0.0 -p ${PORT}"]
