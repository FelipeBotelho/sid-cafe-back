import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { CategoryService } from '../services/CategoryService';
import { 
  CreateCategoryDto, 
  UpdateCategoryDto, 
  CategoryListQuery,
  CategoryResponse 
} from '../types/category';

export class CategoryController extends BaseController {
  private categoryService: CategoryService;

  constructor() {
    super();
    this.categoryService = new CategoryService();
  }

  /**
   * Criar nova categoria
   * POST /categories
   * Acesso: Admin apenas
   */
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const categoryDto: CreateCategoryDto = req.body;

      // Validações básicas
      if (!categoryDto.nome || categoryDto.nome.trim().length === 0) {
        this.sendError(res, 'Nome da categoria é obrigatório', 400);
        return;
      }

      if (categoryDto.nome.length > 100) {
        this.sendError(res, 'Nome da categoria deve ter no máximo 100 caracteres', 400);
        return;
      }

      const category = await this.categoryService.create(categoryDto);
      
      const response: CategoryResponse = this.formatCategoryResponse(category);
      
      this.sendSuccess(res, response, 'Categoria criada com sucesso', 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar categoria';
      this.sendError(res, message, 400);
    }
  };

  /**
   * Listar categorias com paginação
   * GET /categories
   * Acesso: Público
   */
  findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const query: CategoryListQuery = req.query;

      const result = await this.categoryService.findAll(query);
      
      const response = {
        categories: result.categories.map((cat: any) => this.formatCategoryResponse(cat)),
        pagination: result.pagination
      };

      this.sendSuccess(res, response, 'Categorias recuperadas com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar categorias';
      this.sendError(res, message, 500);
    }
  };

  /**
   * Buscar categoria por ID
   * GET /categories/:id
   * Acesso: Público
   */
  findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        this.sendError(res, 'ID inválido', 400);
        return;
      }

      const category = await this.categoryService.findById(id);

      if (!category) {
        this.sendError(res, 'Categoria não encontrada', 404);
        return;
      }

      const response: CategoryResponse = this.formatCategoryResponse(category);
      
      this.sendSuccess(res, response, 'Categoria encontrada');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar categoria';
      this.sendError(res, message, 500);
    }
  };

  /**
   * Atualizar categoria
   * PUT /categories/:id
   * Acesso: Admin apenas
   */
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const updateDto: UpdateCategoryDto = req.body;

      if (isNaN(id)) {
        this.sendError(res, 'ID inválido', 400);
        return;
      }

      // Validações
      if (updateDto.nome !== undefined) {
        if (!updateDto.nome || updateDto.nome.trim().length === 0) {
          this.sendError(res, 'Nome da categoria não pode estar vazio', 400);
          return;
        }

        if (updateDto.nome.length > 100) {
          this.sendError(res, 'Nome da categoria deve ter no máximo 100 caracteres', 400);
          return;
        }
      }

      const updatedCategory = await this.categoryService.update(id, updateDto);
      
      const response: CategoryResponse = this.formatCategoryResponse(updatedCategory);
      
      this.sendSuccess(res, response, 'Categoria atualizada com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar categoria';
      
      if (message === 'Categoria não encontrada') {
        this.sendError(res, message, 404);
      } else {
        this.sendError(res, message, 400);
      }
    }
  };

  /**
   * Deletar categoria
   * DELETE /categories/:id
   * Acesso: Admin apenas
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        this.sendError(res, 'ID inválido', 400);
        return;
      }

      await this.categoryService.delete(id);
      
      this.sendSuccess(res, null, 'Categoria deletada com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar categoria';
      
      if (message === 'Categoria não encontrada') {
        this.sendError(res, message, 404);
      } else {
        this.sendError(res, message, 400);
      }
    }
  };

  /**
   * Obter estatísticas de categorias
   * GET /categories/stats
   * Acesso: Público
   */
  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const total = await this.categoryService.count();
      
      const stats = {
        totalCategorias: total
        // TODO: Adicionar mais estatísticas quando implementar produtos
        // totalProdutosPorCategoria, categoriaMaisUsada, etc.
      };

      this.sendSuccess(res, stats, 'Estatísticas recuperadas com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar estatísticas';
      this.sendError(res, message, 500);
    }
  };

  /**
   * Formatar resposta da categoria
   */
  private formatCategoryResponse(category: any): CategoryResponse {
    return {
      id: category.id,
      nome: category.nome,
      descricao: category.descricao,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString()
    };
  }
}