import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from '../config';

// Configuração básica do OpenAPI
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SID Café API',
    version: '1.0.0',
    description: `
      API REST completa para sistema de café com Node.js, TypeScript, Express e Prisma.
      
      ## Funcionalidades
      
      - 🔐 **Autenticação JWT** com access e refresh tokens
      - 🍪 **httpOnly Cookies** para máxima segurança
      - 👥 **Sistema de Roles** (USER, ADMIN, MODERATOR)
      - 🗂️ **Gestão de Categorias** com CRUD completo
      - 🛒 **Gestão de Produtos** com controle de estoque
      - 🔍 **Busca e Filtros** avançados
      - 📊 **Paginação** automática
      - 📈 **Estatísticas** e relatórios
      
      ## Autenticação
      
      Esta API usa JWT com refresh tokens armazenados em httpOnly cookies:
      
      1. **Login:** Receba access token + cookie com refresh token
      2. **Requisições:** Use \`Authorization: Bearer <accessToken>\` no header
      3. **Renovação:** Endpoint automático usando cookie
      
      ## Níveis de Acesso
      
      - **🌐 Público:** Leitura de categorias e produtos
      - **👤 Usuário:** Perfil próprio após login
      - **👑 Admin:** CRUD completo de categorias e produtos
    `,
    contact: {
      name: 'Felipe Botelho',
      email: 'felipe@sidcafe.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: 'Servidor de Desenvolvimento'
    },
    {
      url: 'https://api.sidcafe.com',
      description: 'Servidor de Produção'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtido através do login'
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
        description: 'Refresh token em httpOnly cookie (automático)'
      }
    },
    schemas: {
      // Schemas de resposta padrão
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          data: {
            type: 'object',
            description: 'Dados retornados'
          },
          message: {
            type: 'string',
            example: 'Operação realizada com sucesso'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'string',
            example: 'Mensagem de erro'
          },
          details: {
            type: 'object',
            description: 'Detalhes adicionais do erro'
          }
        }
      },
      
      // Schemas de paginação
      Pagination: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            example: 1,
            description: 'Página atual'
          },
          limit: {
            type: 'integer',
            example: 20,
            description: 'Itens por página'
          },
          total: {
            type: 'integer',
            example: 100,
            description: 'Total de itens'
          },
          totalPages: {
            type: 'integer',
            example: 5,
            description: 'Total de páginas'
          }
        }
      },
      PaginationInfo: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            example: 1,
            description: 'Página atual'
          },
          limit: {
            type: 'integer',
            example: 20,
            description: 'Itens por página'
          },
          total: {
            type: 'integer',
            example: 100,
            description: 'Total de itens'
          },
          totalPages: {
            type: 'integer',
            example: 5,
            description: 'Total de páginas'
          }
        }
      },
      
      // Schemas de autenticação
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'admin@sidcafe.com'
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'admin123'
          }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: {
            type: 'string',
            example: 'Felipe Botelho',
            maxLength: 100
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'felipe@sidcafe.com'
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'senha123',
            minLength: 6
          }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: {
            $ref: '#/components/schemas/User'
          },
          accessToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          expiresIn: {
            type: 'integer',
            example: 86400,
            description: 'Tempo de vida do access token em segundos'
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          name: {
            type: 'string',
            example: 'Felipe Botelho'
          },
          email: {
            type: 'string',
            example: 'felipe@sidcafe.com'
          },
          role: {
            type: 'string',
            enum: ['USER', 'ADMIN', 'MODERATOR'],
            example: 'ADMIN'
          },
          isActive: {
            type: 'boolean',
            example: true
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-11-09T14:00:00.000Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-11-09T14:00:00.000Z'
          }
        }
      },
      
      // Schemas de categoria
      Category: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          nome: {
            type: 'string',
            example: 'Bebidas Quentes',
            maxLength: 100
          },
          descricao: {
            type: 'string',
            nullable: true,
            example: 'Cafés, chás e outras bebidas quentes'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      CreateCategoryRequest: {
        type: 'object',
        required: ['nome'],
        properties: {
          nome: {
            type: 'string',
            example: 'Bebidas Quentes',
            maxLength: 100
          },
          descricao: {
            type: 'string',
            example: 'Cafés, chás e outras bebidas quentes'
          }
        }
      },
      UpdateCategoryRequest: {
        type: 'object',
        properties: {
          nome: {
            type: 'string',
            example: 'Bebidas Quentes',
            maxLength: 100
          },
          descricao: {
            type: 'string',
            example: 'Cafés, chás e outras bebidas quentes'
          }
        }
      },
      
      // Schemas de produto
      Product: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          nome: {
            type: 'string',
            example: 'Café Expresso',
            maxLength: 150
          },
          descricao: {
            type: 'string',
            nullable: true,
            example: 'Café forte e encorpado'
          },
          preco: {
            type: 'string',
            example: '4.50',
            description: 'Preço em formato decimal'
          },
          categoriaId: {
            type: 'integer',
            example: 1
          },
          categoria: {
            $ref: '#/components/schemas/Category'
          },
          estoqueAtual: {
            type: 'integer',
            example: 25
          },
          estoqueMinimo: {
            type: 'integer',
            example: 10
          },
          ativo: {
            type: 'boolean',
            example: true
          },
          emFalta: {
            type: 'boolean',
            example: false,
            description: 'Calculado automaticamente (estoqueAtual <= estoqueMinimo)'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      CreateProductRequest: {
        type: 'object',
        required: ['nome', 'preco', 'categoriaId'],
        properties: {
          nome: {
            type: 'string',
            example: 'Café Americano',
            maxLength: 150
          },
          descricao: {
            type: 'string',
            example: 'Café suave e aromático'
          },
          preco: {
            type: 'number',
            format: 'double',
            example: 3.50,
            minimum: 0.01
          },
          categoriaId: {
            type: 'integer',
            example: 1
          },
          estoqueAtual: {
            type: 'integer',
            example: 50,
            minimum: 0,
            default: 0
          },
          estoqueMinimo: {
            type: 'integer',
            example: 15,
            minimum: 0,
            default: 0
          }
        }
      },
      UpdateStockRequest: {
        type: 'object',
        required: ['quantidade', 'tipo'],
        properties: {
          quantidade: {
            type: 'integer',
            example: 30,
            minimum: 1
          },
          tipo: {
            type: 'string',
            enum: ['entrada', 'saida'],
            example: 'entrada'
          },
          motivo: {
            type: 'string',
            example: 'Compra de fornecedor'
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'Endpoints de autenticação e autorização'
    },
    {
      name: 'Categories',
      description: 'Gestão de categorias de produtos'
    },
    {
      name: 'Products',
      description: 'Gestão de produtos e controle de estoque'
    },
    {
      name: 'Health',
      description: 'Endpoints de monitoramento e saúde da API'
    }
  ]
};

// Opções do swagger-jsdoc
const swaggerOptions = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};

// Gerar especificação OpenAPI
export const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Opções de customização do Swagger UI
export const swaggerUiOptions = {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { color: #8B4513; }
  `,
  customSiteTitle: 'SID Café API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestDuration: true,
    tryItOutEnabled: true,
    requestInterceptor: (request: any) => {
      // Adicionar automaticamente credentials para cookies
      request.credentials = 'include';
      return request;
    }
  }
};

export { swaggerUi };