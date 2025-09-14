# Configuração de Ambientes - FinanceAI

Este projeto suporta dois ambientes distintos: **desenvolvimento** e **produção**.

## 🚀 Ambientes Configurados

### Desenvolvimento (`.env.local`)

- **Banco de dados**: PostgreSQL local via Docker
- **URL**: `postgresql://local_user:local_password@localhost:5432/local_db`
- **Uso**: Desenvolvimento local com dados isolados

### Produção (`.env.production`)

- **Banco de dados**: Neon DB (PostgreSQL na nuvem)
- **URL**: `postgresql://usuario:senha@host.neon.tech/database?sslmode=require`
- **Uso**: Ambiente de produção com dados persistentes

## 📋 Como Usar

### Desenvolvimento Local

```bash
# Iniciar serviços Docker (PostgreSQL)
npm run services:up

# Executar aplicação em modo desenvolvimento
npm run dev

# Ver logs dos serviços Docker
npm run services:logs

# Parar serviços Docker
npm run services:stop
```

### Produção Local (testando com Neon DB)

```bash
# Executar em modo produção localmente
npm run dev:prod

# Build para produção
npm run build:prod

# Iniciar aplicação em modo produção
npm run start:prod
```

## 🔧 Configuração do Neon DB

1. Acesse [Neon Console](https://console.neon.tech/)
2. Crie um novo projeto
3. Copie a connection string
4. Atualize o arquivo `.env.production` com sua URL real:

```env
DATABASE_URL=postgresql://seu_usuario:sua_senha@seu_host.neon.tech/seu_database?sslmode=require
```

## 📁 Arquivos de Ambiente

- `.env.example` - Template com todas as variáveis necessárias
- `.env.local` - Configurações de desenvolvimento (não versionado)
- `.env.production` - Configurações de produção (não versionado)

## 🐳 Docker Services

O Docker Compose está configurado com:

- PostgreSQL 17
- Health checks automáticos
- Volume persistente para dados
- Configurações otimizadas para desenvolvimento

## 🚀 Deploy na Vercel (Recomendado)

### Deploy Automático

1. **Push para GitHub**: Faça commit e push do código
2. **Conectar Vercel**: Acesse [vercel.com](https://vercel.com) e importe o repositório
3. **Configurar Variáveis**: Adicione `DATABASE_URL` do Neon DB nas Environment Variables
4. **Deploy**: Automático! A Vercel detecta Next.js e faz tudo

### Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login e deploy
vercel login
npm run vercel:deploy    # Produção
npm run vercel:preview   # Preview
```

### Variáveis de Ambiente na Vercel

```env
DATABASE_URL=postgresql://usuario:senha@host.neon.tech/database?sslmode=require
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
```

## 🐳 Docker (Backup para Futuro)

### Quando Usar

- Deploy em servidores próprios
- Migração da Vercel para outras plataformas
- Ambientes corporativos
- Controle total da infraestrutura

### Build da Aplicação

```bash
# Construir imagem Docker
npm run docker:build

# Executar container com variáveis de produção
npm run docker:run

# Build e execução em um comando
npm run docker:build-run
```

### Deploy Manual

```bash
# Build da imagem
docker build -t financeai-app .

# Executar com variáveis de ambiente
docker run -p 3000:3000 \
  -e DATABASE_URL="sua_url_neon_db" \
  -e PORT=3000 \
  financeai-app
```

## ⚠️ Importante

- Os arquivos `.env*` estão no `.gitignore` por segurança
- Sempre use `.env.local` para desenvolvimento
- Configure `.env.production` apenas quando necessário
- Nunca commite credenciais reais no repositório
- O Dockerfile está otimizado para produção com Drizzle ORM
