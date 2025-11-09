# 🐘 PostgreSQL + Prisma ORM - SidCafe

Configuração do banco de dados PostgreSQL com Prisma ORM para o projeto SidCafe.

## 🚀 Quick Start

### 1. Iniciar o banco de dados
```bash
npm run db:start
```

### 2. Rodar migrations (primeira vez)
```bash
npm run prisma:migrate
```

### 3. Iniciar a aplicação
```bash
npm run dev
```

## 📦 Comandos Disponíveis

### Banco de Dados (Docker)
- `npm run db:start` - Inicia o PostgreSQL
- `npm run db:stop` - Para o PostgreSQL
- `npm run db:reset` - **CUIDADO!** Apaga tudo e recria

### Prisma ORM
- `npm run prisma:generate` - Gera o Prisma Client
- `npm run prisma:migrate` - Cria e aplica migrations
- `npm run prisma:studio` - Abre interface visual do Prisma

## 🗄️ Informações de Conexão

### PostgreSQL (Docker)
- **Host:** localhost
- **Porta:** 5432
- **Database:** sidcafe
- **Usuário:** sidcafe
- **Senha:** sidcafe123
- **URL:** `postgresql://sidcafe:sidcafe123@localhost:5432/sidcafe`

### Interface Visual
- **Prisma Studio:** `npm run prisma:studio` (http://localhost:5555)
- **Conectar com DBeaver/PgAdmin:** Use as credenciais acima

## 📝 Como Criar um Novo Modelo

### 1. Editar o Schema Prisma
```prisma
// prisma/schema.prisma

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}
```

### 2. Criar Migration
```bash
npm run prisma:migrate
```

### 3. Usar no Código
```typescript
import { prisma } from './database';

// Criar usuário
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'João Silva'
  }
});

// Buscar usuários
const users = await prisma.user.findMany();

// Buscar por ID
const user = await prisma.user.findUnique({
  where: { id: 1 }
});

// Atualizar
const updated = await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Novo Nome' }
});

// Deletar
await prisma.user.delete({
  where: { id: 1 }
});
```

## 🏗️ Estrutura de Arquivos

```
backend/
├── prisma/
│   ├── schema.prisma           # Definição dos modelos
│   └── migrations/             # Histórico de migrations
├── src/
│   └── database/
│       ├── connection.ts       # Configuração Prisma
│       └── index.ts            # Exports
├── docker-compose.yml          # Configuração Docker
├── .env                        # Variáveis de ambiente
└── prisma.config.ts           # Config Prisma
```

## 🔧 Variáveis de Ambiente

Arquivo `.env`:
```env
DATABASE_URL="postgresql://sidcafe:sidcafe123@localhost:5432/sidcafe?schema=public"
```

## 🌐 Deploy para Produção

### Opção 1: Database URL Simples
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

### Opção 2: Com Connection Pooling (Recomendado)
```env
DATABASE_URL="postgresql://user:password@host:5432/database?connection_limit=10&pool_timeout=10"
```

### Comandos de Deploy
```bash
# 1. Gerar Prisma Client
npm run prisma:generate

# 2. Rodar migrations em produção
npx prisma migrate deploy

# 3. Build da aplicação
npm run build

# 4. Iniciar
npm start
```

## 📊 Prisma Studio

Interface visual para gerenciar dados:
```bash
npm run prisma:studio
```
Abre em: http://localhost:5555

## 🔍 Queries Úteis

### Transações
```typescript
await prisma.$transaction([
  prisma.user.create({ data: { email: 'user1@example.com' } }),
  prisma.user.create({ data: { email: 'user2@example.com' } })
]);
```

### Raw SQL
```typescript
const result = await prisma.$queryRaw`SELECT * FROM users WHERE id = ${1}`;
```

### Aggregations
```typescript
const count = await prisma.user.count();
const avg = await prisma.user.aggregate({
  _avg: { age: true }
});
```

## 🛠️ Troubleshooting

### Erro: "Can't reach database server"
```bash
# Verificar se Docker está rodando
docker ps

# Iniciar banco
npm run db:start

# Verificar logs (Docker direto)
docker logs -f sidcafe-postgres
```

### Reset Completo do Banco
```bash
npm run db:reset
npm run prisma:migrate
```

### Regenerar Prisma Client
```bash
npm run prisma:generate
```

## 📚 Recursos

- [Documentação Prisma](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## ✅ Checklist de Setup

- [x] Docker instalado
- [x] PostgreSQL rodando (`npm run db:start`)
- [x] Migrations aplicadas (`npm run prisma:migrate`)
- [x] Prisma Client gerado (`npm run prisma:generate`)
- [x] `.env` configurado
- [x] Aplicação testada (`npm run dev`)