# 🗂️ API de Categorias

## 📋 Visão Geral

Sistema de categorias para o SID Café com controle de acesso:
- ✅ **Leitura**: Acesso público (qualquer pessoa)
- 🔒 **Criação/Edição/Exclusão**: Apenas administradores

## 🔗 Endpoints Disponíveis

### Base URL: `http://localhost:3000/categories`

| Método | Endpoint | Acesso | Descrição |
|--------|----------|--------|-----------|
| `GET` | `/categories` | 🌐 Público | Listar categorias |
| `GET` | `/categories/stats` | 🌐 Público | Estatísticas |
| `GET` | `/categories/:id` | 🌐 Público | Buscar por ID |
| `POST` | `/categories` | 🔒 Admin | Criar categoria |
| `PUT` | `/categories/:id` | 🔒 Admin | Atualizar categoria |
| `DELETE` | `/categories/:id` | 🔒 Admin | Deletar categoria |

---

## 📝 Detalhamento das APIs

### 1️⃣ **Listar Categorias** (Público)

**GET** `/categories`

**Query Parameters:**
```
page=1          // Página (padrão: 1)
limit=20        // Itens por página (padrão: 20, max: 100)
search=texto    // Busca por nome ou descrição
orderBy=nome    // Ordenar por: nome, createdAt, updatedAt
orderDir=asc    // Direção: asc ou desc
```

**Exemplo:**
```
GET /categories?page=1&limit=10&search=bebidas&orderBy=nome&orderDir=asc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "nome": "Bebidas Quentes",
        "descricao": "Cafés, chás e outras bebidas quentes",
        "createdAt": "2025-11-09T13:00:00.000Z",
        "updatedAt": "2025-11-09T13:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  },
  "message": "Categorias recuperadas com sucesso"
}
```

---

### 2️⃣ **Buscar Categoria por ID** (Público)

**GET** `/categories/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "Bebidas Quentes",
    "descricao": "Cafés, chás e outras bebidas quentes",
    "createdAt": "2025-11-09T13:00:00.000Z",
    "updatedAt": "2025-11-09T13:00:00.000Z"
  },
  "message": "Categoria encontrada"
}
```

---

### 3️⃣ **Estatísticas** (Público)

**GET** `/categories/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCategorias": 5
  },
  "message": "Estatísticas recuperadas com sucesso"
}
```

---

### 4️⃣ **Criar Categoria** (Admin)

**POST** `/categories`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "nome": "Bebidas Quentes",
  "descricao": "Cafés, chás e outras bebidas quentes"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "Bebidas Quentes",
    "descricao": "Cafés, chás e outras bebidas quentes",
    "createdAt": "2025-11-09T13:00:00.000Z",
    "updatedAt": "2025-11-09T13:00:00.000Z"
  },
  "message": "Categoria criada com sucesso"
}
```

---

### 5️⃣ **Atualizar Categoria** (Admin)

**PUT** `/categories/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "nome": "Bebidas Geladas",
  "descricao": "Sucos, refrigerantes e bebidas frias"
}
```

---

### 6️⃣ **Deletar Categoria** (Admin)

**DELETE** `/categories/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Categoria deletada com sucesso"
}
```

---

## 🔒 Autenticação para Admins

### 1. **Fazer Login como Admin:**

**POST** `/auth/login`
```json
{
  "email": "admin@sidcafe.com",
  "password": "admin123"
}
```

### 2. **Usar o Access Token:**

Adicione o token retornado no header Authorization:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ✅ Validações

### **Nome da Categoria:**
- ✅ Obrigatório
- ✅ Máximo 100 caracteres
- ✅ Único (case insensitive)
- ✅ Trimmed (espaços removidos)

### **Descrição:**
- ✅ Opcional
- ✅ Texto longo permitido
- ✅ Trimmed

---

## 🚨 Códigos de Erro

| Código | Descrição |
|--------|-----------|
| `400` | Dados inválidos ou já existente |
| `401` | Token inválido ou expirado |
| `403` | Acesso negado (não é admin) |
| `404` | Categoria não encontrada |
| `500` | Erro interno do servidor |

---

## 🧪 Testando no Postman

### **Collection Sugerida:**

1. **📁 SID Café - Categories**
   - 🌐 **GET** List Categories
   - 🌐 **GET** Get Category by ID
   - 🌐 **GET** Category Stats
   - 🔒 **POST** Create Category (Admin)
   - 🔒 **PUT** Update Category (Admin)  
   - 🔒 **DELETE** Delete Category (Admin)

### **Environment Variables:**
```
baseUrl = http://localhost:3000
accessToken = (será preenchido pelo script de login)
```

### **Script de Login (salvar token automaticamente):**

Na aba **Tests** do login:
```javascript
const response = pm.response.json();
if (response.success && response.data.accessToken) {
    pm.environment.set("accessToken", response.data.accessToken);
}
```

---

**Pronto! Sistema de categorias completamente funcional! 🎉**