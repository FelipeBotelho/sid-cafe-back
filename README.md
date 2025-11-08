# API Node.js TypeScript Express

Uma API REST moderna construída com Node.js, TypeScript, Express e Prisma ORM, seguindo arquitetura modular e boas práticas de desenvolvimento. Inclui sistema completo de autenticação JWT com refresh tokens e controle de permissões.

## 🚀 Características

- **Node.js** com **TypeScript** para tipagem estática
- **Express.js** para criação de APIs REST
- **Prisma ORM** para gerenciamento do banco de dados
- **PostgreSQL** como banco de dados
- **Docker** para ambiente isolado
- **Autenticação JWT** com access e refresh tokens
- **httpOnly Cookies** para refresh tokens (máxima segurança)
- **Sistema de Roles** (USER, ADMIN, MODERATOR)
- **Middlewares de autorização** para rotas protegidas
- **Arquitetura Modular** com separação de responsabilidades
- **Controllers organizados** com classe base reutilizável
- **Services** para lógica de negócio
- **Sistema de rotas modular** (públicas e protegidas)
- **Utilities e helpers** para funções comuns
- **Configuração centralizada**

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/              # Configurações da aplicação
│   │   └── index.ts
│   ├── controllers/         # Controllers da API
│   │   ├── BaseController.ts    # Classe base para controllers
│   │   ├── HealthController.ts  # Controller de health check
│   │   ├── AuthController.ts    # Controller de autenticação
│   │   └── index.ts
│   ├── database/            # Configuração do banco
│   │   └── connection.ts       # Prisma Client singleton
│   ├── middleware/          # Middlewares customizados
│   │   ├── errorHandler.ts     # Tratamento de erros
│   │   ├── logger.ts           # Logging de requests
│   │   ├── validation.ts       # Validações
│   │   ├── auth.ts             # Autenticação JWT
│   │   └── index.ts
│   ├── routes/              # Definição de rotas
│   │   ├── health.ts           # Rotas de health check
│   │   ├── auth.ts             # Rotas de autenticação
│   │   ├── protected.ts        # Rotas protegidas (exemplo)
│   │   └── index.ts            # Router principal
│   ├── services/            # Lógica de negócio
│   │   ├── HealthService.ts    # Service de health check
│   │   ├── AuthService.ts      # Service de autenticação
│   │   └── index.ts
│   ├── types/               # Definições TypeScript
│   │   ├── index.ts            # Interfaces e tipos gerais
│   │   └── auth.ts             # Tipos de autenticação
│   ├── utils/               # Utilities e helpers
│   │   ├── helpers.ts          # Funções utilitárias
│   │   └── index.ts
│   └── app.ts              # Arquivo principal da aplicação
├── prisma/                 # Configuração do Prisma
│   ├── schema.prisma          # Schema do banco de dados
│   └── migrations/            # Migrations do banco
├── dist/                   # Código compilado (gerado)
├── .github/                # Configurações GitHub
├── AUTH.md                 # Documentação completa de autenticação
├── DATABASE.md             # Documentação do banco de dados
├── api-tests.http          # Testes HTTP da API
├── test-auth.sh            # Script de testes automatizados
├── package.json
├── tsconfig.json
├── .env                    # Variáveis de ambiente
├── .gitignore
└── README.md
```

## 🛠️ Scripts Disponíveis

- `npm run dev` - Executa a API em modo desenvolvimento com ts-node
- `npm run build` - Compila TypeScript para JavaScript na pasta dist/
- `npm start` - Executa a aplicação compilada
- `npm run watch` - Compila TypeScript em modo watch

## 🏃‍♂️ Como Executar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Iniciar o banco de dados PostgreSQL:**
   ```bash
   npm run db:start
   ```

3. **Executar migrations do Prisma:**
   ```bash
   npm run prisma:migrate
   ```

4. **Executar em modo desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acessar a API:**
   - URL principal: http://localhost:3000
   - Health check: http://localhost:3000/health
   - Health detalhado: http://localhost:3000/health/detailed
   - API versioned: http://localhost:3000/api/v1/

## 🔐 Endpoints da API

### Públicos (sem autenticação)

#### Health Check
- `GET /` - Mensagem de boas-vindas da API
- `GET /health` - Health check básico
- `GET /health/detailed` - Health check detalhado com informações do sistema e banco

#### Autenticação
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Login de usuário
- `POST /auth/refresh` - Renovar access token usando refresh token
- `POST /auth/logout` - Logout (invalidar refresh token)

### Protegidos (requerem autenticação)

**Header obrigatório:** `Authorization: Bearer <accessToken>`

- `POST /auth/logout-all` - Logout de todas as sessões
- `GET /auth/me` - Obter perfil do usuário autenticado
- `GET /protected/profile` - Exemplo: rota protegida (qualquer usuário autenticado)
- `GET /protected/admin` - Exemplo: rota protegida (apenas ADMIN)
- `GET /protected/moderator` - Exemplo: rota protegida (ADMIN ou MODERATOR)

**Veja [docs/AUTH.md](./docs/AUTH.md) para documentação completa da autenticação.**

## 🏗️ Arquitetura

### Controllers
Controlam o fluxo de dados entre routes e services. Herdam de `BaseController` que fornece métodos utilitários para responses padronizadas.

### Middleware
- **errorHandler**: Tratamento global de erros
- **requestLogger**: Log de requisições e responses
- **validation**: Validações de entrada
- **security**: Headers de segurança básicos

### Services
Contêm a lógica de negócio da aplicação. Separados dos controllers para facilitar testes e reutilização.

### Types
Definições TypeScript centralizadas para manter consistência de tipos em todo projeto.

### Utils
Funções utilitárias e helpers reutilizáveis.

## 🔧 Como Adicionar Nova Feature

### 1. Criar um novo Controller

```typescript
// src/controllers/UserController.ts
import { CustomRequest, CustomResponse } from '../types';
import { BaseController } from './BaseController';
import { asyncHandler } from '../middleware';

export class UserController extends BaseController {
  getUsers = asyncHandler(async (req: CustomRequest, res: CustomResponse) => {
    // Implementar lógica
    this.sendSuccess(res, users, 'Usuários listados com sucesso');
  });
}
```

### 2. Criar um Service

```typescript
// src/services/UserService.ts
export class UserService {
  async getUsers() {
    // Lógica de negócio
    return users;
  }
}
```

### 3. Criar Routes

```typescript
// src/routes/users.ts
import { Router } from 'express';
import { UserController } from '../controllers';

const router = Router();
const userController = new UserController();

router.get('/users', userController.getUsers);

export default router;
```

### 4. Registrar no Router Principal

```typescript
// src/routes/index.ts
import userRoutes from './users';

router.use('/', userRoutes);
```

## � Configuração

As configurações ficam centralizadas em `src/config/index.ts`. Variáveis de ambiente suportadas:

- `PORT` - Porta do servidor (padrão: 3000)
- `NODE_ENV` - Ambiente (development/production)
- `DATABASE_URL` - URL de conexão com PostgreSQL
- `JWT_SECRET` - Chave secreta para assinar tokens JWT (IMPORTANTE: use uma chave forte em produção!)

Crie um arquivo `.env` na raiz do projeto (use `.env.example` como base):

```env
# Servidor
PORT=3000
NODE_ENV=development

# Banco de Dados
DATABASE_URL="postgresql://sidcafe:sidcafe123@localhost:5432/sidcafe?schema=public"

# JWT (MUDE EM PRODUÇÃO!)
JWT_SECRET=seu-secret-super-secreto-aqui-mude-em-producao
```

## 📦 Dependências

### Produção
- **express** - Framework web para Node.js
- **@prisma/client** - Prisma ORM Client
- **dotenv** - Gerenciamento de variáveis de ambiente

### Desenvolvimento
- **typescript** - Linguagem TypeScript
- **ts-node** - Execução direta de TypeScript
- **prisma** - Prisma CLI
- **@types/express** - Tipagens para Express
- **@types/node** - Tipagens para Node.js

## 🗄️ Banco de Dados

### PostgreSQL com Docker
O projeto usa PostgreSQL rodando em container Docker para facilitar o desenvolvimento.

```bash
# Iniciar banco
npm run db:start

# Parar banco
npm run db:stop

# Ver logs
npm run db:logs

# Interface PgAdmin
npm run db:admin  # http://localhost:8080
```

### Prisma ORM
ORM moderno para TypeScript com type-safety completo.

```bash
# Gerar Prisma Client
npm run prisma:generate

# Criar migration
npm run prisma:migrate

# Interface visual
npm run prisma:studio  # http://localhost:5555
```

**Veja [docs/DATABASE.md](./docs/DATABASE.md) para documentação completa do banco de dados.**

## 🚀 Deploy

Para fazer deploy em produção:

1. **Compile o código:**
   ```bash
   npm run build
   ```

2. **Execute a aplicação:**
   ```bash
   npm start
   ```

## 📝 Padrões de Response

Todas as responses seguem o padrão:

```typescript
{
  "success": boolean,
  "message": string,
  "data?": any,
  "error?": string,
  "timestamp": string
}
```

## 🔍 Logging

O sistema inclui logging automático de:
- Requisições recebidas
- Responses enviadas
- Erros ocorridos
- Duração das requisições

## ✨ Próximos Passos

- [ ] Documentação Swagger/OpenAPI
- [ ] Testes automatizados (Jest/Supertest)
- [ ] Rate limiting
- [ ] Caching Redis
- [ ] Upload de arquivos
- [ ] Logs estruturados (Winston/Pino)
- [ ] Validação de schemas (Zod/Joi)
- [ ] CI/CD pipelines

## 🧪 Testes

Para testar a API de autenticação:

1. **Via script automatizado:**
   ```bash
   ./test-auth.sh
   ```

2. **Via arquivo HTTP (VS Code REST Client):**
   - Abra o arquivo `api-tests.http`
   - Instale a extensão "REST Client" no VS Code
   - Clique em "Send Request" acima de cada requisição

3. **Via cURL, Postman ou Insomnia:**
   - Veja exemplos em [AUTH.md](./AUTH.md)

## 📚 Documentação

- **[docs/AUTH.md](./docs/AUTH.md)** - Sistema de autenticação completo
- **[docs/DATABASE.md](./docs/DATABASE.md)** - Banco de dados e Prisma ORM
- **[docs/FRONTEND_INTEGRATION.md](./docs/FRONTEND_INTEGRATION.md)** - Integração com frontend (httpOnly cookies)
- **[docs/HTTPONLY_COOKIES.md](./docs/HTTPONLY_COOKIES.md)** - Guia de migração para cookies seguros
- **[examples/](./examples/)** - Exemplos de código para integração

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

Felipe Botelho Rodrigues