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
          imagem: {
            type: 'string',
            nullable: true,
            example: 'https://exemplo.com/imagens/cafe-expresso.jpg',
            description: 'URL da imagem do produto'
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
          imagem: {
            type: 'string',
            example: 'https://exemplo.com/imagens/cafe-americano.jpg',
            description: 'URL da imagem do produto'
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
      UpdateProductRequest: {
        type: 'object',
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
          imagem: {
            type: 'string',
            example: 'https://exemplo.com/imagens/cafe-americano.jpg',
            description: 'URL da imagem do produto'
          },
          categoriaId: {
            type: 'integer',
            example: 1
          },
          estoqueMinimo: {
            type: 'integer',
            example: 15,
            minimum: 0,
            default: 0
          },
          ativo: {
            type: 'boolean',
            example: true
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
      },
      
      // Schemas de vendas
      SaleItemRequest: {
        type: 'object',
        required: ['produtoId', 'quantidade'],
        properties: {
          produtoId: {
            type: 'integer',
            example: 1
          },
          quantidade: {
            type: 'integer',
            minimum: 1,
            example: 2
          },
          precoUnitario: {
            type: 'number',
            format: 'double',
            minimum: 0.01,
            example: 4.50,
            description: 'Preço unitário (opcional, usa o preço do produto se não informado)'
          }
        }
      },
      CreateSaleRequest: {
        type: 'object',
        required: ['clienteId', 'itens'],
        properties: {
          clienteId: {
            type: 'integer',
            example: 1
          },
          itens: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/SaleItemRequest'
            },
            minItems: 1
          },
          desconto: {
            type: 'number',
            format: 'double',
            minimum: 0,
            example: 5.00,
            description: 'Valor do desconto'
          },
          observacoes: {
            type: 'string',
            example: 'Venda com desconto promocional'
          }
        }
      },
      UpdateSaleRequest: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
            example: 'CONFIRMED'
          },
          desconto: {
            type: 'number',
            format: 'double',
            minimum: 0,
            example: 10.00
          },
          observacoes: {
            type: 'string',
            example: 'Venda confirmada pelo cliente'
          }
        }
      },
      SaleItemResponse: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          produtoId: {
            type: 'integer',
            example: 1
          },
          produto: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                example: 1
              },
              nome: {
                type: 'string',
                example: 'Café Expresso'
              },
              descricao: {
                type: 'string',
                example: 'Café forte e encorpado'
              },
              precoAtual: {
                type: 'string',
                example: '4.50',
                description: 'Preço atual do produto'
              }
            }
          },
          quantidade: {
            type: 'integer',
            example: 2
          },
          precoUnitario: {
            type: 'string',
            example: '4.50',
            description: 'Preço no momento da venda'
          },
          valorTotal: {
            type: 'string',
            example: '9.00'
          }
        }
      },
      SaleResponse: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          clienteId: {
            type: 'integer',
            example: 1
          },
          cliente: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                example: 1
              },
              name: {
                type: 'string',
                example: 'João Silva'
              },
              email: {
                type: 'string',
                example: 'joao@email.com'
              }
            }
          },
          itens: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/SaleItemResponse'
            }
          },
          valorTotal: {
            type: 'string',
            example: '50.00'
          },
          desconto: {
            type: 'string',
            example: '5.00'
          },
          valorFinal: {
            type: 'string',
            example: '45.00'
          },
          status: {
            type: 'string',
            enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
            example: 'CONFIRMED'
          },
          observacoes: {
            type: 'string',
            nullable: true,
            example: 'Venda com desconto promocional'
          },
          dataVenda: {
            type: 'string',
            format: 'date-time',
            example: '2025-11-09T14:30:00.000Z'
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
      SaleListResponse: {
        type: 'object',
        properties: {
          sales: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/SaleResponse'
            }
          },
          pagination: {
            $ref: '#/components/schemas/Pagination'
          },
          filters: {
            type: 'object',
            properties: {
              clienteId: {
                type: 'integer',
                example: 1
              },
              status: {
                type: 'string',
                enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']
              },
              dataInicio: {
                type: 'string',
                format: 'date'
              },
              dataFim: {
                type: 'string',
                format: 'date'
              },
              valorMin: {
                type: 'number'
              },
              valorMax: {
                type: 'number'
              }
            }
          }
        }
      },
      SaleStatsResponse: {
        type: 'object',
        properties: {
          totalVendas: {
            type: 'integer',
            example: 150
          },
          totalFaturamento: {
            type: 'string',
            example: '15750.50'
          },
          vendasHoje: {
            type: 'integer',
            example: 8
          },
          faturamentoHoje: {
            type: 'string',
            example: '420.00'
          },
          vendasMes: {
            type: 'integer',
            example: 45
          },
          faturamentoMes: {
            type: 'string',
            example: '3250.75'
          },
          statusDistribution: {
            type: 'object',
            properties: {
              PENDING: {
                type: 'integer',
                example: 5
              },
              CONFIRMED: {
                type: 'integer',
                example: 100
              },
              CANCELLED: {
                type: 'integer',
                example: 10
              },
              COMPLETED: {
                type: 'integer',
                example: 35
              }
            }
          },
          produtoMaisVendido: {
            type: 'object',
            nullable: true,
            properties: {
              id: {
                type: 'integer',
                example: 1
              },
              nome: {
                type: 'string',
                example: 'Café Expresso'
              },
              quantidadeVendida: {
                type: 'integer',
                example: 127
              }
            }
          },
          clienteTopFaturamento: {
            type: 'object',
            nullable: true,
            properties: {
              id: {
                type: 'integer',
                example: 1
              },
              name: {
                type: 'string',
                example: 'João Silva'
              },
              totalCompras: {
                type: 'string',
                example: '1250.75'
              }
            }
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
      name: 'Sales',
      description: 'Sistema de vendas e faturamento'
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