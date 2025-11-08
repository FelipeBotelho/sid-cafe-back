# Sistema de Autenticação

Este projeto implementa um sistema robusto de autenticação JWT com as seguintes funcionalidades:

## Características

- **JWT (JSON Web Tokens)**: Access tokens de curta duração (24h) e refresh tokens de longa duração (7 dias)
- **Password Hashing**: Bcrypt com salt rounds configurável
- **Roles e Permissões**: Sistema de roles (USER, ADMIN, MODERATOR)
- **Refresh Token Rotation**: Tokens podem ser renovados de forma segura
- **Logout**: Invalidação de refresh tokens (individual e todas as sessões)
- **Rotas Protegidas**: Middleware para proteger endpoints

## Estrutura do Banco de Dados

### Tabela User
- `id`: Identificador único
- `email`: Email único do usuário
- `name`: Nome do usuário
- `password`: Hash da senha (bcrypt)
- `role`: Papel do usuário (USER, ADMIN, MODERATOR)
- `isActive`: Status ativo/inativo
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização

### Tabela RefreshToken
- `id`: Identificador único
- `token`: Token JWT
- `userId`: Referência ao usuário
- `expiresAt`: Data de expiração
- `isRevoked`: Status de revogação
- `createdAt`: Data de criação

## Endpoints da API

### Públicos (sem autenticação)

#### POST /auth/register
Registrar novo usuário

**Body:**
```json
{
  "email": "user@example.com",
  "name": "Nome do Usuário",
  "password": "senha123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "Nome do Usuário",
      "role": "USER",
      "isActive": true
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 86400
    }
  }
}
```

#### POST /auth/login
Login de usuário

**Body:**
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "Nome do Usuário",
      "role": "USER",
      "isActive": true
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 86400
    }
  }
}
```

#### POST /auth/refresh
Renovar access token usando refresh token

**Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token atualizado com sucesso",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 86400
  }
}
```

#### POST /auth/logout
Logout do usuário (invalidar refresh token específico)

**Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso",
  "data": null
}
```

### Protegidos (requerem autenticação)

**Header obrigatório:**
```
Authorization: Bearer <accessToken>
```

#### POST /auth/logout-all
Logout de todas as sessões do usuário

**Response (200):**
```json
{
  "success": true,
  "message": "Logout de todas as sessões realizado com sucesso",
  "data": null
}
```

#### GET /auth/me
Obter perfil do usuário autenticado

**Response (200):**
```json
{
  "success": true,
  "message": "Perfil recuperado com sucesso",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "Nome do Usuário",
    "role": "USER",
    "isActive": true
  }
}
```

#### GET /protected/profile
Exemplo de rota protegida (qualquer usuário autenticado)

**Response (200):**
```json
{
  "success": true,
  "message": "Dados do usuário autenticado",
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "role": "USER"
  }
}
```

#### GET /protected/admin
Exemplo de rota protegida (apenas ADMIN)

**Response (200):**
```json
{
  "success": true,
  "message": "Acesso administrativo concedido",
  "data": {
    "message": "Você tem acesso de administrador!"
  }
}
```

#### GET /protected/moderator
Exemplo de rota protegida (ADMIN ou MODERATOR)

**Response (200):**
```json
{
  "success": true,
  "message": "Acesso de moderação concedido",
  "data": {
    "message": "Você tem acesso de moderador!"
  }
}
```

## Middlewares de Autenticação

### authenticateToken
Verifica se o token JWT é válido e adiciona os dados do usuário ao request.

```typescript
import { authenticateToken } from './middleware/auth';

router.get('/rota-protegida', authenticateToken, (req: AuthRequest, res) => {
  console.log(req.user); // { userId, email, role }
});
```

### requireAdmin
Requer que o usuário seja ADMIN (deve ser usado após authenticateToken).

```typescript
import { authenticateToken, requireAdmin } from './middleware/auth';

router.get('/admin-only', authenticateToken, requireAdmin, handler);
```

### requireRoles
Requer que o usuário tenha uma das roles especificadas (deve ser usado após authenticateToken).

```typescript
import { authenticateToken, requireRoles } from './middleware/auth';

router.get(
  '/moderacao',
  authenticateToken,
  requireRoles('ADMIN', 'MODERATOR'),
  handler
);
```

### optionalAuth
Autenticação opcional - não retorna erro se o token não existir. Útil para rotas que funcionam com ou sem autenticação.

```typescript
import { optionalAuth } from './middleware/auth';

router.get('/conteudo', optionalAuth, (req: AuthRequest, res) => {
  if (req.user) {
    // Usuário autenticado
  } else {
    // Usuário anônimo
  }
});
```

## Respostas de Erro

### 400 Bad Request
```json
{
  "success": false,
  "message": "Erro na requisição",
  "error": "Detalhes do erro"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token inválido",
  "error": null
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Acesso negado. Permissão insuficiente",
  "error": null
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Recurso não encontrado",
  "error": null
}
```

## Fluxo de Autenticação

### 1. Registro
```
Cliente -> POST /auth/register
       <- { user, tokens }
Armazenar accessToken e refreshToken
```

### 2. Login
```
Cliente -> POST /auth/login
       <- { user, tokens }
Armazenar accessToken e refreshToken
```

### 3. Acessar Rota Protegida
```
Cliente -> GET /protected/profile
           Header: Authorization: Bearer <accessToken>
       <- Dados do usuário
```

### 4. Renovar Token (quando expira)
```
Cliente -> POST /auth/refresh
           Body: { refreshToken }
       <- { accessToken, refreshToken, expiresIn }
Atualizar tokens armazenados
```

### 5. Logout
```
Cliente -> POST /auth/logout
           Body: { refreshToken }
       <- Sucesso
Remover tokens armazenados
```

## Configuração

As configurações de JWT estão em `src/config/index.ts`:

```typescript
jwt: {
  secret: process.env.JWT_SECRET || 'seu-secret-aqui',
  expiresIn: '24h' // Duração do access token
}
```

**Importante:** Configure uma chave secreta forte em produção através da variável de ambiente `JWT_SECRET`.

## Segurança

- **Nunca** armazene o refresh token em localStorage (use httpOnly cookies em produção)
- **Sempre** use HTTPS em produção
- Implemente rate limiting para proteger contra ataques de força bruta
- Considere implementar refresh token rotation para maior segurança
- Monitore e invalide tokens suspeitos
- Use secrets fortes e únicos para JWT_SECRET

## Exemplos de Uso

### Frontend (JavaScript/TypeScript)

```javascript
// Registrar usuário
const register = async (email, name, password) => {
  const response = await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, password })
  });
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('accessToken', data.data.tokens.accessToken);
    localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
  }
  
  return data;
};

// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('accessToken', data.data.tokens.accessToken);
    localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
  }
  
  return data;
};

// Fazer requisição autenticada
const getProfile = async () => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:3000/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  // Se token expirou, renovar
  if (response.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      return getProfile(); // Tentar novamente
    }
  }
  
  return data;
};

// Renovar token
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('http://localhost:3000/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    return true;
  }
  
  return false;
};

// Logout
const logout = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  await fetch('http://localhost:3000/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};
```

## Testes

Use ferramentas como cURL, Postman ou Insomnia para testar os endpoints.

### Exemplo com cURL:

```bash
# Registrar
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"senha123"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"senha123"}'

# Acessar rota protegida
curl http://localhost:3000/protected/profile \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```
