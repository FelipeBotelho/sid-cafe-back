/**
 * API Client com httpOnly Cookies - Vanilla JavaScript
 * Versão mais segura usando cookies para refresh tokens
 */

class SecureApiClient {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.accessToken = null;
    this.isRefreshing = false;
    this.failedQueue = [];
    
    // Carregar access token do sessionStorage (se existir)
    this.loadAccessToken();
  }

  /**
   * Carregar apenas access token do sessionStorage
   * Refresh token fica no httpOnly cookie (não acessível via JS)
   */
  loadAccessToken() {
    this.accessToken = sessionStorage.getItem('accessToken');
  }

  /**
   * Salvar apenas access token no sessionStorage
   */
  saveAccessToken(accessToken) {
    this.accessToken = accessToken;
    sessionStorage.setItem('accessToken', accessToken);
  }

  /**
   * Limpar tokens
   */
  clearTokens() {
    this.accessToken = null;
    sessionStorage.removeItem('accessToken');
    // O cookie será limpo pelo servidor no logout
  }

  /**
   * Processar fila de requisições após renovar token
   */
  processQueue(error, token = null) {
    this.failedQueue.forEach(promise => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  /**
   * Renovar token usando o refresh token do cookie
   */
  async refreshAccessToken() {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // IMPORTANTE: envia cookies automaticamente
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Erro ao renovar token');
      }

      const data = await response.json();
      this.saveAccessToken(data.data.accessToken);
      // Refresh token é atualizado automaticamente no cookie pelo servidor
      return data.data.accessToken;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Fazer requisição HTTP
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      credentials: 'include', // SEMPRE enviar cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    // Adicionar token de autenticação se existir
    if (this.accessToken && !options.skipAuth) {
      config.headers.Authorization = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, config);

      // Se não autenticado e não é a rota de refresh
      if (response.status === 401 && !endpoint.includes('/auth/refresh')) {
        // Se já está renovando, adicionar à fila
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          })
            .then(token => {
              config.headers.Authorization = `Bearer ${token}`;
              return fetch(url, config);
            })
            .then(response => response.json());
        }

        // Renovar token
        this.isRefreshing = true;

        try {
          const newToken = await this.refreshAccessToken();
          this.isRefreshing = false;
          this.processQueue(null, newToken);

          // Repetir requisição original
          config.headers.Authorization = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, config);
          return retryResponse.json();
        } catch (refreshError) {
          this.isRefreshing = false;
          this.processQueue(refreshError, null);
          this.clearTokens();
          
          // Redirecionar para login
          if (typeof window !== 'undefined') {
            window.location.href = '/login.html';
          }
          
          throw refreshError;
        }
      }

      // Retornar JSON da resposta
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('Erro na requisição:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // ==================== AUTH METHODS ====================

  /**
   * Registrar novo usuário
   */
  async register(email, name, password) {
    const data = await this.post('/auth/register', { email, name, password }, { skipAuth: true });
    this.saveAccessToken(data.data.accessToken);
    // Refresh token é salvo automaticamente no cookie pelo servidor
    return data.data;
  }

  /**
   * Fazer login
   */
  async login(email, password) {
    const data = await this.post('/auth/login', { email, password }, { skipAuth: true });
    this.saveAccessToken(data.data.accessToken);
    // Refresh token é salvo automaticamente no cookie pelo servidor
    return data.data;
  }

  /**
   * Fazer logout
   */
  async logout() {
    // Refresh token vem automaticamente do cookie
    await this.post('/auth/logout');
    this.clearTokens();
    // Cookie é limpo pelo servidor
  }

  /**
   * Fazer logout de todas as sessões
   */
  async logoutAll() {
    await this.post('/auth/logout-all');
    this.clearTokens();
  }

  /**
   * Obter perfil do usuário
   */
  async getProfile() {
    const data = await this.get('/auth/me');
    return data.data;
  }

  /**
   * Verificar se está autenticado
   */
  isAuthenticated() {
    return !!this.accessToken;
  }
}

// ==================== CRIAR INSTÂNCIA ====================

const api = new SecureApiClient('http://localhost:3000');

// ==================== EXEMPLO DE USO ====================

async function handleLogin() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const result = await api.login(email, password);
    console.log('Login realizado:', result.user);
    console.log('Access Token armazenado em sessionStorage');
    console.log('Refresh Token armazenado em httpOnly cookie (não acessível via JS)');
    
    window.location.href = '/dashboard.html';
  } catch (error) {
    alert('Erro ao fazer login: ' + error.message);
  }
}

async function handleLogout() {
  try {
    await api.logout();
    console.log('Logout realizado - cookie limpo pelo servidor');
    window.location.href = '/login.html';
  } catch (error) {
    alert('Erro ao fazer logout: ' + error.message);
  }
}

// Exportar para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SecureApiClient, api };
}

// ==================== PRINCIPAIS DIFERENÇAS ====================

/*
VERSÃO ANTERIOR (menos segura):
- Access Token: sessionStorage ✅
- Refresh Token: sessionStorage ⚠️ (acessível via JavaScript)

VERSÃO ATUAL (mais segura):
- Access Token: sessionStorage ✅ (precisa estar acessível para enviar nas requisições)
- Refresh Token: httpOnly Cookie ✅ (NÃO acessível via JavaScript)

VANTAGENS:
✅ Refresh token protegido contra XSS
✅ Renovação automática funciona igual
✅ Mesmo código no frontend (fetch com credentials: 'include')
✅ Cookie gerenciado automaticamente pelo navegador

IMPORTANTE:
- SEMPRE usar `credentials: 'include'` nas requisições fetch
- Em produção, usar HTTPS (secure: true no cookie)
- Backend já configurado para enviar/receber cookies
*/
