# Integração Frontend com a API de Autenticação

Guia completo de como integrar a API de autenticação com aplicações frontend usando **httpOnly Cookies** (máxima segurança).

## 📋 Índice

- [Fluxo de Autenticação](#fluxo-de-autenticação)
- [Armazenamento Seguro de Tokens](#armazenamento-seguro-de-tokens)
- [Implementação JavaScript Vanilla](#implementação-javascript-vanilla)
- [Implementação React](#implementação-react)
- [Implementação Vue](#implementação-vue)
- [Axios Interceptors](#axios-interceptors)
- [Configuração CORS](#configuração-cors)
- [Boas Práticas de Segurança](#boas-práticas-de-segurança)

---

## 🔄 Fluxo de Autenticação

### 1. Como funciona?

```
┌─────────────┐                                  ┌─────────────┐
│   Frontend  │                                  │   Backend   │
└──────┬──────┘                                  └──────┬──────┘
       │                                                │
       │  POST /auth/login                             │
       │  { email, password }                          │
       ├──────────────────────────────────────────────>│
       │                                                │
       │  200 OK                                        │
       │  { accessToken, refreshToken }                │
       │<──────────────────────────────────────────────┤
       │                                                │
       │  Armazena tokens                              │
       │                                                │
       │  GET /protected/profile                        │
       │  Header: Authorization: Bearer <accessToken>   │
       ├──────────────────────────────────────────────>│
       │                                                │
       │  200 OK                                        │
       │  { user data }                                 │
       │<──────────────────────────────────────────────┤
```

### 2. Token Expirado - Renovação Automática

```
┌─────────────┐                                  ┌─────────────┐
│   Frontend  │                                  │   Backend   │
└──────┬──────┘                                  └──────┬──────┘
       │                                                │
       │  GET /protected/profile                        │
       │  Header: Authorization: Bearer <accessToken>   │
       ├──────────────────────────────────────────────>│
       │                                                │
       │  401 Unauthorized                              │
       │  { error: "Token expirado" }                   │
       │<──────────────────────────────────────────────┤
       │                                                │
       │  POST /auth/refresh                            │
       │  { refreshToken }                              │
       ├──────────────────────────────────────────────>│
       │                                                │
       │  200 OK                                        │
       │  { accessToken, refreshToken }                │
       │<──────────────────────────────────────────────┤
       │                                                │
       │  Atualiza tokens                               │
       │                                                │
       │  Repetir requisição original                   │
       │  GET /protected/profile                        │
       │  Header: Authorization: Bearer <novo token>    │
       ├──────────────────────────────────────────────>│
       │                                                │
       │  200 OK                                        │
       │  { user data }                                 │
       │<──────────────────────────────────────────────┤
```

---

## 🔐 Armazenamento Seguro de Tokens

### ✅ **Solução Implementada: httpOnly Cookies**

Esta API usa **httpOnly cookies** para máxima segurança:

| Token | Onde Armazenado | Acessível via JS? | Segurança |
|-------|-----------------|-------------------|-----------|
| **Access Token** | sessionStorage | ✅ Sim (necessário) | ⭐⭐⭐⭐ |
| **Refresh Token** | httpOnly Cookie | ❌ Não | ⭐⭐⭐⭐⭐ |

### Por que httpOnly Cookies?

#### ✅ **Vantagens:**
- Refresh token **NÃO acessível** via JavaScript
- Protegido contra ataques XSS
- Gerenciado automaticamente pelo navegador
- Enviado automaticamente em cada requisição

#### ⚠️ **Access Token no sessionStorage:**
- **Por quê?** Precisa ser acessível para adicionar no header `Authorization: Bearer <token>`
- **Segurança:** OK, pois access token expira em 24h (janela curta de exposição)
- **Refresh token protegido** é o que importa (7 dias de validade)

### Como Funciona?

```javascript
// 1. Login - Backend responde:
Response JSON: {
  user: {...},
  accessToken: "eyJhbGc..." // ✅ No JSON
}
Set-Cookie: refreshToken=eyJhbGc...; HttpOnly; Secure; SameSite=Strict

// 2. Frontend armazena apenas access token:
sessionStorage.setItem('accessToken', data.accessToken);
// Refresh token já está no cookie (automático)

// 3. Requisições protegidas:
fetch('/protected/route', {
  credentials: 'include', // Envia cookie automaticamente
  headers: {
    'Authorization': `Bearer ${accessToken}` // Access token do sessionStorage
  }
});

// 4. Renovar token quando expirar:
fetch('/auth/refresh', {
  method: 'POST',
  credentials: 'include' // Refresh token enviado automaticamente no cookie
});
```

---

## 🌐 Implementação JavaScript Vanilla

Veja o arquivo completo: [`examples/secure-api-client.js`](../examples/secure-api-client.js)

```javascript
class SecureApiClient {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.accessToken = sessionStorage.getItem('accessToken');
  }

  async request(endpoint, options = {}) {
    const config = {
      ...options,
      credentials: 'include', // IMPORTANTE: envia cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    // Adicionar access token se existir
    if (this.accessToken && !options.skipAuth) {
      config.headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    // Renovação automática se token expirou
    if (response.status === 401 && !endpoint.includes('/auth/refresh')) {
      await this.refreshAccessToken();
      config.headers.Authorization = `Bearer ${this.accessToken}`;
      return fetch(`${this.baseURL}${endpoint}`, config);
    }

    return response.json();
  }

  async refreshAccessToken() {
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include' // Cookie enviado automaticamente
    });

    const data = await response.json();
    this.accessToken = data.data.accessToken;
    sessionStorage.setItem('accessToken', data.data.accessToken);
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true
    });

    this.accessToken = data.data.accessToken;
    sessionStorage.setItem('accessToken', data.data.accessToken);
    // Refresh token já está no cookie
    return data.data;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.accessToken = null;
    sessionStorage.removeItem('accessToken');
    // Cookie limpo pelo servidor
  }
}

const api = new SecureApiClient();
```

---

## ⚛️ Implementação React

Veja o arquivo completo: [`examples/SecureAuthContext.tsx`](../examples/SecureAuthContext.tsx)

### Context de Autenticação

```tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    // Carregar access token e verificar autenticação
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      setAccessToken(token);
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        // Token inválido, tentar renovar
        await refreshToken();
      }
    } catch (error) {
      clearAuth();
    }
  };

  const refreshToken = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include' // Cookie enviado automaticamente
      });

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.data.accessToken);
        sessionStorage.setItem('accessToken', data.data.accessToken);
        return true;
      }
    } catch (error) {
      clearAuth();
    }
    return false;
  };

  const clearAuth = () => {
    setUser(null);
    setAccessToken(null);
    sessionStorage.removeItem('accessToken');
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include', // Receber cookie
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    setUser(data.data.user);
    setAccessToken(data.data.accessToken);
    sessionStorage.setItem('accessToken', data.data.accessToken);
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include' // Cookie enviado automaticamente
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};
```

### Uso em Componente

```tsx
import { useAuth } from './contexts/AuthContext';

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 🎨 Implementação Vue 3

### Store Pinia

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);

  const API_URL = 'http://localhost:3000';
  const isAuthenticated = computed(() => !!user.value);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include', // Receber cookie
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    user.value = data.data.user;
    accessToken.value = data.data.accessToken;
    sessionStorage.setItem('accessToken', data.data.accessToken);
  };

  const logout = async () => {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include' // Cookie enviado automaticamente
    });
    
    user.value = null;
    accessToken.value = null;
    sessionStorage.removeItem('accessToken');
  };

  return { user, accessToken, isAuthenticated, login, logout };
});
```

### Uso em Componente

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');

const handleLogin = async () => {
  try {
    await authStore.login(email.value, password.value);
    router.push('/dashboard');
  } catch (err) {
    alert(err.message);
  }
};
</script>

<template>
  <form @submit.prevent="handleLogin">
    <input v-model="email" type="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Senha" required />
    <button type="submit">Entrar</button>
  </form>
</template>
```

---

## 📡 Axios Interceptors (Renovação Automática)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true // IMPORTANTE: enviar cookies
});

// Adicionar access token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Renovar token automaticamente quando expirar
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Renovar token (cookie enviado automaticamente)
        const response = await axios.post(
          'http://localhost:3000/auth/refresh',
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;
        sessionStorage.setItem('accessToken', accessToken);

        // Repetir requisição original
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        sessionStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// USO:
import api from './services/api';

async function fetchData() {
  const response = await api.get('/protected/profile');
  return response.data;
}
```

---

## 🌐 Configuração CORS

### Backend (já configurado)

```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true // IMPORTANTE: permitir cookies
}));
```

**⚠️ IMPORTANTE:**
- `credentials: true` + `origin: '*'` **NÃO FUNCIONA**
- Sempre especificar origin exato
- Em produção, use a URL real do frontend

### Frontend

Todas as requisições devem incluir:

```javascript
// Fetch API
fetch(url, {
  credentials: 'include'
});

// Axios
axios.create({
  withCredentials: true
});
```

---

## 🔒 Boas Práticas de Segurança

### 1. **HTTPS em Produção** ✅
```javascript
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.seudominio.com'
  : 'http://localhost:3000';
```

### 2. **Nunca expor tokens em logs** ❌
```javascript
// ❌ NÃO faça isso:
console.log('Token:', accessToken);

// ✅ Faça isso:
console.log('Autenticado:', !!accessToken);
```

### 3. **Limpar dados ao sair** ✅
```javascript
window.addEventListener('beforeunload', () => {
  // Considere limpar dados sensíveis se necessário
});
```

### 4. **Timeout de Inatividade** ✅
```javascript
let inactivityTimer: NodeJS.Timeout;

const resetTimer = () => {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    authService.logout();
    window.location.href = '/login';
  }, 30 * 60 * 1000); // 30 minutos
};

document.addEventListener('mousemove', resetTimer);
document.addEventListener('keypress', resetTimer);
```

### 5. **Validar role no frontend (UX) e backend (Segurança)** ✅
```tsx
// Frontend - apenas para UX
const Dashboard = () => {
  const { user } = useAuth();
  
  return (
    <div>
      {user?.role === 'ADMIN' && <AdminPanel />}
      <UserContent />
    </div>
  );
};
// Backend sempre valida (segurança real) ✅
```

### 6. **Content Security Policy** ✅
```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; connect-src 'self' http://localhost:3000"
>
```

---

## 📝 Checklist de Integração

### Backend
- [x] cookie-parser instalado
- [x] Cookies configurados (httpOnly, secure, sameSite)
- [x] CORS permitindo credentials
- [x] Endpoints de auth funcionando

### Frontend
- [ ] `credentials: 'include'` em todas as requisições
- [ ] Access token em sessionStorage
- [ ] Refresh token NÃO armazenado (vem no cookie)
- [ ] Renovação automática implementada
- [ ] Logout limpa sessionStorage
- [ ] CORS origin configurado corretamente

---

## 🎯 Resumo

### ✅ **O que fazer:**

1. **Todas as requisições:**
   ```javascript
   credentials: 'include' // ou withCredentials: true
   ```

2. **Login/Register:**
   ```javascript
   sessionStorage.setItem('accessToken', data.accessToken);
   // Refresh token vem automaticamente no cookie
   ```

3. **Requisições protegidas:**
   ```javascript
   headers: { 'Authorization': `Bearer ${accessToken}` }
   ```

4. **Renovar token:**
   ```javascript
   // Cookie enviado automaticamente
   POST /auth/refresh (com credentials: 'include')
   ```

5. **Logout:**
   ```javascript
   sessionStorage.clear();
   // Cookie limpo pelo servidor
   ```

### � **Segurança Garantida:**

| Item | Status |
|------|--------|
| Refresh token protegido | ✅ httpOnly Cookie |
| Access token | ✅ sessionStorage (expira em 24h) |
| XSS Protection | ✅ Refresh token não acessível via JS |
| CSRF Protection | ✅ SameSite: Strict |
| HTTPS | ✅ Secure: true em produção |

---

## 📚 Arquivos de Referência

- [`examples/secure-api-client.js`](../examples/secure-api-client.js) - Cliente JavaScript completo
- [`examples/SecureAuthContext.tsx`](../examples/SecureAuthContext.tsx) - Context React completo
- [`HTTPONLY_COOKIES.md`](./HTTPONLY_COOKIES.md) - Guia de migração do backend
- [`AUTH.md`](./AUTH.md) - Documentação completa da API

---

**Pronto para integrar com máxima segurança! 🔐**
