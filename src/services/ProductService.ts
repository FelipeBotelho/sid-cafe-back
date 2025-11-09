import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../database';
import { 
  CreateProductDto, 
  UpdateProductDto, 
  UpdateStockDto,
  ProductListQuery,
  Product,
  ProductWithCategory
} from '../types/product';

export class ProductService {
  
  /**
   * Criar novo produto
   */
  async create(data: CreateProductDto): Promise<ProductWithCategory> {
    // Verificar se a categoria existe
    const category = await prisma.category.findUnique({
      where: { id: data.categoriaId }
    });

    if (!category) {
      throw new Error('Categoria não encontrada');
    }

    // Verificar se já existe produto ativo com o mesmo nome
    const existingProduct = await prisma.product.findFirst({
      where: {
        nome: {
          equals: data.nome,
          mode: 'insensitive'
        },
        ativo: true // Apenas produtos ativos
      }
    });

    if (existingProduct) {
      throw new Error('Já existe um produto ativo com este nome');
    }

    // Validar preço
    if (data.preco <= 0) {
      throw new Error('Preço deve ser maior que zero');
    }

    const product = await prisma.product.create({
      data: {
        nome: data.nome.trim(),
        descricao: data.descricao?.trim() || null,
        preco: new Decimal(data.preco),
        imagem: data.imagem?.trim() || null,
        categoriaId: data.categoriaId,
        estoqueAtual: data.estoqueAtual || 0,
        estoqueMinimo: data.estoqueMinimo || 0
      },
      include: {
        categoria: true
      }
    });

    return product;
  }

  /**
   * Listar produtos com paginação e filtros
   */
  async findAll(query: ProductListQuery = {}) {
    const page = Math.max(1, parseInt(query.page || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20')));
    const skip = (page - 1) * limit;

    // Construir filtros
    const where = this.buildWhereClause(query);
    
    // Construir ordenação
    const orderBy = this.buildOrderBy(query.orderBy, query.orderDir);

    // Buscar produtos e contar total
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          categoria: true
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    // Buscar filtros adicionais para ajudar o frontend
    const filters = await this.buildFilterData(query);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters
    };
  }

  /**
   * Buscar produto por ID
   */
  async findById(id: number): Promise<ProductWithCategory | null> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        categoria: true
      }
    });

    return product;
  }

  /**
   * Buscar produtos por categoria
   */
  async findByCategory(categoriaId: number, query: ProductListQuery = {}) {
    const page = Math.max(1, parseInt(query.page || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20')));
    const skip = (page - 1) * limit;

    // Verificar se a categoria existe
    const category = await prisma.category.findUnique({
      where: { id: categoriaId }
    });

    if (!category) {
      throw new Error('Categoria não encontrada');
    }

    // Construir filtros baseados na categoria e query
    const where: any = {
      categoriaId
    };

    // Aplicar filtros adicionais
    if (query.onlyActive !== 'false') {
      where.ativo = true;
    }

    if (query.search) {
      where.OR = [
        {
          nome: {
            contains: query.search,
            mode: 'insensitive' as const
          }
        },
        {
          descricao: {
            contains: query.search,
            mode: 'insensitive' as const
          }
        }
      ];
    }

    // Filtros de preço
    if (query.precoMin || query.precoMax) {
      where.preco = {};
      if (query.precoMin) {
        where.preco.gte = new Decimal(query.precoMin);
      }
      if (query.precoMax) {
        where.preco.lte = new Decimal(query.precoMax);
      }
    }

    // Construir ordenação
    const orderBy = this.buildOrderBy(query.orderBy || query.sortBy, query.orderDir || query.sortOrder);

    // Buscar produtos e contar total
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          categoria: true
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    return {
      products,
      category,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  }

  /**
   * Atualizar produto
   */
  async update(id: number, data: UpdateProductDto): Promise<ProductWithCategory> {
    // Verificar se o produto existe
    const existingProduct = await this.findById(id);
    if (!existingProduct) {
      throw new Error('Produto não encontrado');
    }

    // Se está alterando o nome, verificar conflito apenas com produtos ativos
    if (data.nome) {
      const nameConflict = await prisma.product.findFirst({
        where: {
          nome: {
            equals: data.nome,
            mode: 'insensitive'
          },
          id: {
            not: id
          },
          ativo: true // Apenas produtos ativos
        }
      });

      if (nameConflict) {
        throw new Error('Já existe um produto ativo com este nome');
      }
    }

    // Se está alterando a categoria, verificar se existe
    if (data.categoriaId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoriaId }
      });

      if (!category) {
        throw new Error('Categoria não encontrada');
      }
    }

    // Validar preço se fornecido
    if (data.preco !== undefined && data.preco <= 0) {
      throw new Error('Preço deve ser maior que zero');
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(data.nome && { nome: data.nome.trim() }),
        ...(data.descricao !== undefined && { 
          descricao: data.descricao?.trim() || null 
        }),
        ...(data.preco !== undefined && { preco: new Decimal(data.preco) }),
        ...(data.imagem !== undefined && { 
          imagem: data.imagem?.trim() || null 
        }),
        ...(data.categoriaId && { categoriaId: data.categoriaId }),
        ...(data.estoqueMinimo !== undefined && { estoqueMinimo: data.estoqueMinimo }),
        ...(data.ativo !== undefined && { ativo: data.ativo })
      },
      include: {
        categoria: true
      }
    });

    return updatedProduct;
  }

  /**
   * Soft delete do produto
   */
  async softDelete(id: number): Promise<void> {
    const existingProduct = await this.findById(id);
    if (!existingProduct) {
      throw new Error('Produto não encontrado');
    }

    await prisma.product.update({
      where: { id },
      data: { ativo: false }
    });
  }

  /**
   * Reativar produto
   */
  async activate(id: number): Promise<ProductWithCategory> {
    const existingProduct = await this.findById(id);
    if (!existingProduct) {
      throw new Error('Produto não encontrado');
    }

    const reactivatedProduct = await prisma.product.update({
      where: { id },
      data: { ativo: true },
      include: {
        categoria: true
      }
    });

    return reactivatedProduct;
  }

  /**
   * Atualizar estoque
   */
  async updateStock(id: number, data: UpdateStockDto): Promise<ProductWithCategory> {
    const product = await this.findById(id);
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    let novoEstoque: number;

    if (data.tipo === 'entrada') {
      novoEstoque = product.estoqueAtual + data.quantidade;
    } else if (data.tipo === 'saida') {
      novoEstoque = product.estoqueAtual - data.quantidade;
      
      if (novoEstoque < 0) {
        throw new Error('Estoque insuficiente para a saída solicitada');
      }
    } else {
      throw new Error('Tipo de movimentação inválido');
    }

    // TODO: Aqui no futuro seria ideal salvar um histórico da movimentação
    // em uma tabela StockMovement para auditoria

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        estoqueAtual: novoEstoque
      },
      include: {
        categoria: true
      }
    });

    return updatedProduct;
  }

  /**
   * Buscar produtos em falta
   */
  async findOutOfStock(): Promise<ProductWithCategory[]> {
    const products = await prisma.product.findMany({
      where: {
        ativo: true,
        estoqueAtual: { lte: 0 }
      },
      include: {
        categoria: true
      },
      orderBy: {
        estoqueAtual: 'asc'
      }
    });

    return products;
  }

  /**
   * Obter estatísticas de produtos
   */
  async getStats() {
    const [
      totalProdutos,
      totalAtivos,
      totalInativos,
      produtoMaisCaro,
      produtoMaisBarato,
      categoriasComProdutos,
      produtosEmFalta,
      valorTotalEstoque
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { ativo: true } }),
      prisma.product.count({ where: { ativo: false } }),
      prisma.product.findFirst({
        where: { ativo: true },
        include: { categoria: true },
        orderBy: { preco: 'desc' }
      }),
      prisma.product.findFirst({
        where: { ativo: true },
        include: { categoria: true },
        orderBy: { preco: 'asc' }
      }),
      prisma.category.count({
        where: {
          produtos: {
            some: { ativo: true }
          }
        }
      }),
      this.findOutOfStock(),
      this.calculateTotalStockValue()
    ]);

    return {
      totalProdutos,
      totalAtivos,
      totalInativos,
      totalEmFalta: produtosEmFalta.length,
      valorTotalEstoque,
      produtoMaisCaro,
      produtoMaisBarato,
      categoriasComProdutos
    };
  }

  /**
   * Calcular valor total do estoque
   */
  private async calculateTotalStockValue(): Promise<string> {
    const result = await prisma.$queryRaw<Array<{ total: bigint }>>`
      SELECT COALESCE(SUM(preco * estoque_atual), 0) as total 
      FROM products 
      WHERE ativo = true
    `;
    
    return result[0]?.total?.toString() || '0';
  }

  /**
   * Construir cláusula WHERE para queries
   */
  private buildWhereClause(query: ProductListQuery) {
    const where: any = {};

    // Filtro por status ativo/inativo
    if (query.ativo !== undefined) {
      where.ativo = query.ativo === 'true';
    }

    // Filtro por categoria
    if (query.categoriaId) {
      where.categoriaId = parseInt(query.categoriaId);
    }

    // Filtro de busca por texto
    if (query.search) {
      where.OR = [
        {
          nome: {
            contains: query.search,
            mode: 'insensitive' as const
          }
        },
        {
          descricao: {
            contains: query.search,
            mode: 'insensitive' as const
          }
        }
      ];
    }

    // Filtro por produtos em falta
    if (query.emFalta === 'true') {
      where.estoqueAtual = { lte: 0 };
    }

    // Filtros de preço
    if (query.precoMin || query.precoMax) {
      where.preco = {};
      if (query.precoMin) {
        where.preco.gte = new Decimal(query.precoMin);
      }
      if (query.precoMax) {
        where.preco.lte = new Decimal(query.precoMax);
      }
    }

    return where;
  }

  /**
   * Construir ordenação
   */
  private buildOrderBy(orderBy?: string, orderDir?: string) {
    const direction = (orderDir === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';
    
    // Mapear nomes do Swagger para nomes do banco
    const fieldMap: Record<string, string> = {
      'name': 'nome',
      'price': 'preco', 
      'stock': 'estoqueAtual',
      'createdAt': 'createdAt'
    };
    
    const field = orderBy ? (fieldMap[orderBy] || orderBy) : 'nome';
    
    console.log(`[DEBUG] OrderBy: ${orderBy}, Field mapped: ${field}, Direction: ${direction}`);
    
    switch (field) {
      case 'preco':
        return { preco: direction };
      case 'estoqueAtual':
        return { estoqueAtual: direction };
      case 'createdAt':
        return { createdAt: direction };
      case 'updatedAt':
        return { updatedAt: direction };
      case 'nome':
        return { nome: direction };
      default:
        return { nome: direction };
    }
  }

  /**
   * Construir dados de filtro para o frontend
   */
  private async buildFilterData(query: ProductListQuery) {
    // Simplificado por enquanto
    return {
      categorias: [],
      precoRange: {
        min: '0',
        max: '1000'
      }
    };
  }
}