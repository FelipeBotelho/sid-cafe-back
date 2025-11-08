# API Node.js TypeScript Express

Uma API REST moderna construída com Node.js, TypeScript e Express, seguindo arquitetura modular e boas práticas de desenvolvimento.

## 🚀 Características

- **Node.js** com **TypeScript** para tipagem estática
- **Express.js** para criação de APIs REST
- **Arquitetura Modular** com separação de responsabilidades
- **Middleware customizados** para logging, validação e tratamento de erros
- **Controllers organizados** com classe base reutilizável
- **Services** para lógica de negócio
- **Sistema de rotas modular**
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
│   │   ├── ExampleController.ts # Exemplo de controller
│   │   └── index.ts
│   ├── middleware/          # Middlewares customizados
│   │   ├── errorHandler.ts     # Tratamento de erros
│   │   ├── logger.ts           # Logging de requests
│   │   ├── validation.ts       # Validações
│   │   └── index.ts
│   ├── routes/              # Definição de rotas
│   │   ├── health.ts           # Rotas de health check
│   │   └── index.ts            # Router principal
│   ├── services/            # Lógica de negócio
│   │   ├── HealthService.ts    # Service de health check
│   │   └── index.ts
│   ├── types/               # Definições TypeScript
│   │   └── index.ts            # Interfaces e tipos
│   ├── utils/               # Utilities e helpers
│   │   ├── helpers.ts          # Funções utilitárias
│   │   └── index.ts
│   └── app.ts              # Arquivo principal da aplicação
├── dist/                   # Código compilado (gerado)
├── .github/                # Configurações GitHub
├── package.json
├── tsconfig.json
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

2. **Executar em modo desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Acessar a API:**
   - URL principal: http://localhost:3000
   - Health check: http://localhost:3000/health
   - Health detalhado: http://localhost:3000/health/detailed
   - API versioned: http://localhost:3000/api/v1/

## � Endpoints Disponíveis

### Health Check
- `GET /` - Mensagem de boas-vindas da API
- `GET /health` - Health check básico
- `GET /health/detailed` - Health check detalhado com informações do sistema

### API v1 (Prefixo: `/api/v1/`)
- Todos os endpoints também disponíveis com versionamento

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

## 🔐 Configuração

As configurações ficam centralizadas em `src/config/index.ts`. Variáveis de ambiente suportadas:

- `PORT` - Porta do servidor (padrão: 3000)
- `NODE_ENV` - Ambiente (development/production)
- `API_VERSION` - Versão da API (padrão: v1)

## 📦 Dependências

### Produção
- **express** - Framework web para Node.js

### Desenvolvimento
- **typescript** - Linguagem TypeScript
- **ts-node** - Execução direta de TypeScript
- **@types/express** - Tipagens para Express
- **@types/node** - Tipagens para Node.js

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

## ✨ Features Futuras

- [ ] Autenticação JWT
- [ ] Integração com banco de dados
- [ ] Documentação Swagger/OpenAPI
- [ ] Testes automatizados
- [ ] Rate limiting
- [ ] Caching Redis
- [ ] Containerização Docker