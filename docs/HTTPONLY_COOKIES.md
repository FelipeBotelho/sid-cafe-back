# 🔐 Migração para httpOnly Cookies

## ✅ O que foi atualizado no Backend

### 1. Instalação de Dependências
```bash
npm install cookie-parser @types/cookie-parser
```

### 2. Configuração do Express (`src/app.ts`)
```typescript
import cookieParser from 'cookie-parser';

app.use(cookieParser()); // Antes do body parsing
```

### 3. AuthController (`src/controllers/AuthController.ts`)

#### Register e Login:
```typescript
// Armazenar refresh token em httpOnly cookie
res.cookie('refreshToken', result.tokens.refreshToken, {
  httpOnly: true,                    // Não acessível via JavaScript
  secure: process.env.NODE_ENV === 'production', // HTTPS em produção
  sameSite: 'strict',                // Proteção contra CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000   // 7 dias
});

// Retornar apenas access token (não o refresh token)
this.sendSuccess(res, {
  user: result.user,
  accessToken: result.tokens.accessToken,
  expiresIn: result.tokens.expiresIn
}, 'Login realizado com sucesso');
```

#### Refresh Token:
```typescript
// Aceita refresh token do cookie OU body (retrocompatibilidade)
const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
```

#### Logout:
```typescript
// Limpar cookie
res.clearCookie('refreshToken');
```

## 📝 Mudanças nas Responses da API

### ANTES (menos seguro):
```json
{
  "success": true,
  "data": {
    "user": {...},
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",  // ❌ Exposto no JSON
      "expiresIn": 86400
    }
  }
}
```

### AGORA (mais seguro):
```json
{
  "success": true,
  "data": {
    "user": {...},
    "accessToken": "eyJhbGc...",     // ✅ Apenas access token
    "expiresIn": 86400
  }
}
```

**Refresh Token:** Enviado automaticamente no cookie `Set-Cookie: refreshToken=...`

## 🔄 Como o Frontend Deve Usar

### 1. Requisições devem incluir `credentials: 'include'`

#### Fetch API:
```javascript
fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  credentials: 'include', // IMPORTANTE!
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

#### Axios:
```javascript
const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true // IMPORTANTE!
});
```

### 2. Armazenar APENAS o access token

```javascript
// ✅ Fazer isso
sessionStorage.setItem('accessToken', data.accessToken);

// ❌ NÃO fazer isso (refresh token não vem mais no JSON)
sessionStorage.setItem('refreshToken', data.refreshToken); // undefined
```

### 3. Renovar token

```javascript
// Refresh token enviado automaticamente no cookie
const response = await fetch('http://localhost:3000/auth/refresh', {
  method: 'POST',
  credentials: 'include' // Cookie enviado automaticamente
});

const data = await response.json();
sessionStorage.setItem('accessToken', data.data.accessToken);
// Novo refresh token atualizado automaticamente no cookie
```

## 🎯 Arquivos de Exemplo Atualizados

### `/examples/secure-api-client.js`
- Cliente HTTP atualizado para usar cookies
- Renovação automática funcionando com cookies
- Documentação completa inline

### `/examples/SecureAuthContext.tsx`
- Context React com httpOnly cookies
- Axios interceptors configurados
- Exemplo completo de uso

## 🔒 Configuração CORS (Importante!)

### Backend já está configurado, mas se precisar ajustar:

```typescript
import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:3001',  // URL exata do frontend
  credentials: true                  // IMPORTANTE: permitir cookies
}));
```

**⚠️ ATENÇÃO:** 
- `credentials: true` + `origin: '*'` **NÃO FUNCIONA**
- Sempre especificar origin exato em produção

## 📊 Comparação: Antes vs Depois

| Aspecto | Versão Anterior | Versão httpOnly Cookies |
|---------|----------------|------------------------|
| **Refresh Token** | sessionStorage | httpOnly Cookie |
| **Access Token** | sessionStorage | sessionStorage |
| **Segurança XSS** | ⚠️ Vulnerável | ✅ Protegido |
| **JavaScript pode ler refresh token?** | ✅ Sim | ❌ Não |
| **Renovação automática** | ✅ Funciona | ✅ Funciona |
| **Complexidade frontend** | Simples | Simples |
| **Retrocompatibilidade** | - | ✅ Mantida* |

*O backend ainda aceita refresh token no body para retrocompatibilidade.

## 🚀 Como Testar

### 1. Iniciar backend:
```bash
npm run dev
```

### 2. Teste com cURL:
```bash
# Login (recebe cookie)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"senha123"}' \
  -c cookies.txt -v

# Renovar token (usa cookie automaticamente)
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -b cookies.txt -v

# Logout (limpa cookie)
curl -X POST http://localhost:3000/auth/logout \
  -b cookies.txt -v
```

### 3. Verificar no DevTools do Navegador:

**Application > Cookies > http://localhost:3000**
- Você verá o cookie `refreshToken` com:
  - ✅ HttpOnly: verdadeiro
  - ✅ SameSite: Strict
  - ✅ Expires: data futura

**Console:**
```javascript
// Tentar acessar o cookie via JavaScript
document.cookie // refreshToken NÃO aparecerá aqui (protegido!)
```

## ⚙️ Configuração para Produção

### `.env` (Produção):
```env
NODE_ENV=production
FRONTEND_URL=https://seuapp.com
```

### HTTPS Obrigatório:
O cookie com `secure: true` só funciona em HTTPS. Em produção:
- Backend: HTTPS
- Frontend: HTTPS
- Cookie: `secure: true`

## 🐛 Troubleshooting

### Cookie não está sendo enviado?
✅ Verificar `credentials: 'include'` (fetch) ou `withCredentials: true` (axios)
✅ Verificar CORS está permitindo credentials
✅ Frontend e backend devem estar no mesmo domínio ou configurar CORS corretamente

### Cookie não é salvo no navegador?
✅ Verificar se está usando `http://localhost` (não `file://`)
✅ Em produção, verificar HTTPS
✅ Verificar SameSite e Secure

### Renovação não funciona?
✅ Verificar se cookie está sendo enviado na requisição (Network > Headers > Cookie)
✅ Verificar se backend recebe `req.cookies.refreshToken`
✅ Verificar se cookie não expirou

## 📚 Próximos Passos Recomendados

1. ✅ **FEITO:** Backend configurado com cookies
2. 🔄 **Fazer:** Atualizar frontend para usar `credentials: 'include'`
3. 🔄 **Fazer:** Remover armazenamento de refresh token no sessionStorage
4. 🔄 **Fazer:** Testar fluxo completo (login → refresh → logout)
5. 🔒 **Produção:** Configurar HTTPS e `secure: true`

## 💡 Dicas Extras

- Use os arquivos em `/examples/` como referência
- O backend mantém retrocompatibilidade (ainda aceita refresh token no body)
- Em desenvolvimento, `secure: false` permite testar em HTTP
- Em produção, sempre use HTTPS com `secure: true`

---

**Pronto! Backend atualizado para máxima segurança com httpOnly cookies! 🎉**
