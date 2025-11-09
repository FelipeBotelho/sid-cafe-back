# 🛒 API de Produtos

## 📋 Visão Geral

Sistema completo de produtos para o SID Café com controle de estoque:
- ✅ **Leitura**: Acesso público (qualquer pessoa)
- 🔒 **Criação/Edição/Exclusão**: Apenas administradores
- 📦 **Gestão de Estoque**: Controle de entrada e saída de produtos

## 🔗 Endpoints Disponíveis

### Base URL: `http://localhost:3000/products`

| Método | Endpoint | Acesso | Descrição |
|--------|----------|--------|-----------|
| `GET` | `/products` | 🌐 Público | Listar produtos |
| `GET` | `/products/stats` | 🌐 Público | Estatísticas |
| `GET` | `/products/out-of-stock` | 🌐 Público | Produtos em falta |
| `GET` | `/products/category/:id` | 🌐 Público | Produtos por categoria |
| `GET` | `/products/:id` | 🌐 Público | Buscar por ID |
| `POST` | `/products` | 🔒 Admin | Criar produto |
| `PUT` | `/products/:id` | 🔒 Admin | Atualizar produto |
| `DELETE` | `/products/:id` | 🔒 Admin | Desativar produto |
| `POST` | `/products/:id/activate` | 🔒 Admin | Reativar produto |
| `POST` | `/products/:id/stock` | 🔒 Admin | Gerenciar estoque |

---

## 📝 Detalhamento das APIs

### 1️⃣ **Listar Produtos** (Público)

**GET** `/products`

**Query Parameters:**
```
page=1              // Página (padrão: 1)
limit=20            // Itens por página (padrão: 20, max: 100)
search=texto        // Busca por nome ou descrição
categoriaId=1       // Filtrar por categoria
emFalta=true        // Apenas produtos em falta
ativo=true          // true/false para status ativo
orderBy=nome        // nome, preco, estoqueAtual, createdAt, updatedAt
orderDir=asc        // asc ou desc
precoMin=10.00      // Preço mínimo
precoMax=50.00      // Preço máximo
```

**Exemplo:**
```
GET /products?page=1&limit=10&categoriaId=1&orderBy=preco&orderDir=asc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "nome": "Café Expresso",
        "descricao": "Café forte e encorpado",
        "preco": "4.50",
        "categoriaId": 1,
        "categoria": {
          "id": 1,
          "nome": "Bebidas Quentes",
          "descricao": "Cafés e chás"
        },
        "estoqueAtual": 25,
        "estoqueMinimo": 10,
        "ativo": true,
        "emFalta": false,
        "createdAt": "2025-11-09T14:00:00.000Z",
        "updatedAt": "2025-11-09T14:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    },
    "filters": {
      "categorias": [],
      "precoRange": {
        "min": "0",
        "max": "1000"
      }
    }
  },
  "message": "Produtos recuperados com sucesso"
}
```

---

### 2️⃣ **Buscar Produto por ID** (Público)

**GET** `/products/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "Café Expresso",
    "descricao": "Café forte e encorpado",
    "preco": "4.50",
    "categoriaId": 1,
    "categoria": {
      "id": 1,
      "nome": "Bebidas Quentes",
      "descricao": "Cafés e chás"
    },
    "estoqueAtual": 25,
    "estoqueMinimo": 10,
    "ativo": true,
    "emFalta": false,
    "createdAt": "2025-11-09T14:00:00.000Z",
    "updatedAt": "2025-11-09T14:00:00.000Z"
  },
  "message": "Produto encontrado"
}
```

---

### 3️⃣ **Produtos por Categoria** (Público)

**GET** `/products/category/:id`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Café Expresso",
      "preco": "4.50",
      "estoqueAtual": 25,
      "emFalta": false,
      // ... outros campos
    }
  ],
  "message": "Produtos da categoria recuperados com sucesso"
}
```

---

### 4️⃣ **Produtos em Falta** (Público)

**GET** `/products/out-of-stock`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "nome": "Açúcar Cristal",
      "estoqueAtual": 0,
      "estoqueMinimo": 5,
      "emFalta": true,
      // ... outros campos
    }
  ],
  "message": "Produtos em falta recuperados com sucesso"
}
```

---

### 5️⃣ **Estatísticas** (Público)

**GET** `/products/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProdutos": 15,
    "totalAtivos": 12,
    "totalInativos": 3,
    "totalEmFalta": 2,
    "valorTotalEstoque": "1250.75",
    "produtoMaisCaro": {
      "id": 1,
      "nome": "Café Premium",
      "preco": "25.00"
    },
    "produtoMaisBarato": {
      "id": 8,
      "nome": "Açúcar",
      "preco": "2.50"
    },
    "categoriasComProdutos": 4
  },
  "message": "Estatísticas recuperadas com sucesso"
}
```

---

### 6️⃣ **Criar Produto** (Admin)

**POST** `/products`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "nome": "Café Americano",
  "descricao": "Café suave e aromático",
  "preco": 3.50,
  "categoriaId": 1,
  "estoqueAtual": 50,
  "estoqueMinimo": 15
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "nome": "Café Americano",
    "descricao": "Café suave e aromático",
    "preco": "3.50",
    "categoriaId": 1,
    "categoria": {
      "id": 1,
      "nome": "Bebidas Quentes"
    },
    "estoqueAtual": 50,
    "estoqueMinimo": 15,
    "ativo": true,
    "emFalta": false,
    "createdAt": "2025-11-09T14:30:00.000Z",
    "updatedAt": "2025-11-09T14:30:00.000Z"
  },
  "message": "Produto criado com sucesso"
}
```

---

### 7️⃣ **Atualizar Produto** (Admin)

**PUT** `/products/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "nome": "Café Americano Premium",
  "preco": 4.00,
  "estoqueMinimo": 20
}
```

---

### 8️⃣ **Gerenciar Estoque** (Admin)

**POST** `/products/:id/stock`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Entrada de estoque:**
```json
{
  "quantidade": 30,
  "tipo": "entrada",
  "motivo": "Compra de fornecedor"
}
```

**Saída de estoque:**
```json
{
  "quantidade": 5,
  "tipo": "saida",
  "motivo": "Venda no balcão"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "Café Expresso",
    "estoqueAtual": 55, // Atualizado
    "emFalta": false,
    // ... outros campos
  },
  "message": "Estoque adicionado com sucesso"
}
```

---

### 9️⃣ **Desativar Produto** (Admin)

**DELETE** `/products/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Produto desativado com sucesso"
}
```

---

### 🔟 **Reativar Produto** (Admin)

**POST** `/products/:id/activate`

**Headers:**
```
Authorization: Bearer {accessToken}
```

---

## 📊 Modelo de Dados

### **Product**
```typescript
{
  id: number;
  nome: string;          // Max 150 caracteres
  descricao: string?;    // Opcional, texto longo
  preco: Decimal;        // Até 99.999.999,99
  categoriaId: number;   // FK para Category
  estoqueAtual: number;  // Quantidade atual
  estoqueMinimo: number; // Para alertas de falta
  ativo: boolean;        // Soft delete
  createdAt: Date;
  updatedAt: Date;
}
```

---

## ✅ Validações

### **Nome do Produto:**
- ✅ Obrigatório
- ✅ Máximo 150 caracteres
- ✅ Único (case insensitive)
- ✅ Trimmed

### **Preço:**
- ✅ Obrigatório
- ✅ Maior que zero
- ✅ Decimal com 2 casas

### **Categoria:**
- ✅ Obrigatória
- ✅ Deve existir no banco

### **Estoque:**
- ✅ Não pode ficar negativo
- ✅ Entrada/saída controlada

---

## 🚨 Códigos de Erro

| Código | Descrição |
|--------|-----------|
| `400` | Dados inválidos, produto já existe, estoque insuficiente |
| `401` | Token inválido ou expirado |
| `403` | Acesso negado (não é admin) |
| `404` | Produto/categoria não encontrado |
| `500` | Erro interno do servidor |

---

## 🎯 Features Especiais

### **🔍 Busca Inteligente**
- Busca por nome ou descrição
- Case insensitive
- Filtros combinados

### **📦 Controle de Estoque**
- Estoque atual vs estoque mínimo
- Flag automática de "em falta"
- Histórico de movimentações (futuro)

### **💰 Filtros de Preço**
- Range de preços dinâmico
- Ordenação por valor
- Estatísticas de valor

### **🏷️ Gestão de Categorias**
- Produtos agrupados por categoria
- Relacionamento forte (Restrict)
- Contadores automáticos

---

## 🧪 Testando no Postman

### **Collection Sugerida:**

1. **📁 SID Café - Products**
   - 🌐 **GET** List Products
   - 🌐 **GET** Product by ID
   - 🌐 **GET** Products by Category
   - 🌐 **GET** Out of Stock Products
   - 🌐 **GET** Product Stats
   - 🔒 **POST** Create Product (Admin)
   - 🔒 **PUT** Update Product (Admin)
   - 🔒 **POST** Update Stock (Admin)
   - 🔒 **DELETE** Deactivate Product (Admin)
   - 🔒 **POST** Activate Product (Admin)

### **Fluxo de Teste Recomendado:**

1. **Login Admin** → Obter token
2. **Criar Categorias** → Base para produtos
3. **Criar Produtos** → Com diferentes preços e estoques
4. **Testar Filtros** → Busca, categoria, preço
5. **Gerenciar Estoque** → Entrada e saída
6. **Verificar Estatísticas** → Relatórios automáticos

---

**Sistema de produtos completamente funcional com gestão de estoque integrada! 🎉**