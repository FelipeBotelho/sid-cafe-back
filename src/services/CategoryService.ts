import { prisma } from '../database';
import { 
  CreateCategoryDto, 
  UpdateCategoryDto, 
  CategoryListQuery,
  Category
} from '../types/category';

export class CategoryService {
  
  /**
   * Criar nova categoria
   */
  async create(data: CreateCategoryDto): Promise<Category> {
    // Verificar se já existe categoria com o mesmo nome
    const existingCategory = await prisma.category.findFirst({
      where: {
        nome: {
          equals: data.nome,
          mode: 'insensitive' // Case insensitive
        }
      }
    });

    if (existingCategory) {
      throw new Error('Já existe uma categoria com este nome');
    }

    const category = await prisma.category.create({
      data: {
        nome: data.nome.trim(),
        descricao: data.descricao?.trim() || null
      }
    });

    return category;
  }

  /**
   * Listar todas as categorias com paginação
   */
  async findAll(query: CategoryListQuery = {}) {
    const page = Math.max(1, parseInt(query.page || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20')));
    const skip = (page - 1) * limit;

    // Construir filtro de busca
    const where = query.search ? {
      OR: [
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
      ]
    } : {};

    // Construir ordenação
    const orderBy = this.buildOrderBy(query.orderBy, query.orderDir);

    // Buscar categorias e contar total
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy,
        skip,
        take: limit
      }),
      prisma.category.count({ where })
    ]);

    return {
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Buscar categoria por ID
   */
  async findById(id: number): Promise<Category | null> {
    const category = await prisma.category.findUnique({
      where: { id }
    });

    return category;
  }

  /**
   * Buscar categoria por nome
   */
  async findByNome(nome: string): Promise<Category | null> {
    const category = await prisma.category.findFirst({
      where: {
        nome: {
          equals: nome,
          mode: 'insensitive'
        }
      }
    });

    return category;
  }

  /**
   * Atualizar categoria
   */
  async update(id: number, data: UpdateCategoryDto): Promise<Category> {
    // Verificar se a categoria existe
    const existingCategory = await this.findById(id);
    if (!existingCategory) {
      throw new Error('Categoria não encontrada');
    }

    // Se está alterando o nome, verificar se não há conflito
    if (data.nome) {
      const nameConflict = await prisma.category.findFirst({
        where: {
          nome: {
            equals: data.nome,
            mode: 'insensitive'
          },
          id: {
            not: id
          }
        }
      });

      if (nameConflict) {
        throw new Error('Já existe uma categoria com este nome');
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        ...(data.nome && { nome: data.nome.trim() }),
        ...(data.descricao !== undefined && { 
          descricao: data.descricao?.trim() || null 
        })
      }
    });

    return updatedCategory;
  }

  /**
   * Deletar categoria
   */
  async delete(id: number): Promise<void> {
    // Verificar se a categoria existe
    const existingCategory = await this.findById(id);
    if (!existingCategory) {
      throw new Error('Categoria não encontrada');
    }

    // TODO: Verificar se há produtos vinculados a esta categoria
    // quando implementar o modelo de produtos

    await prisma.category.delete({
      where: { id }
    });
  }

  /**
   * Contar total de categorias
   */
  async count(): Promise<number> {
    return prisma.category.count();
  }

  /**
   * Construir ordenação para queries
   */
  private buildOrderBy(orderBy?: string, orderDir?: string) {
    const field = orderBy === 'createdAt' || orderBy === 'updatedAt' || orderBy === 'nome' 
      ? orderBy 
      : 'nome';
    
    const direction = orderDir === 'desc' ? 'desc' : 'asc';
    
    return { [field]: direction };
  }
}