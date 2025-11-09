import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { ProductService } from '../services/ProductService';
import { 
  CreateProductDto, 
  UpdateProductDto, 
  UpdateStockDto,
  ProductListQuery,
  ProductResponse 
} from '../types/product';

export class ProductController extends BaseController {
  private productService: ProductService;

  constructor() {
    super();
    this.productService = new ProductService();
  }

  /**
   * Criar novo produto
   * POST /products
   * Acesso: Admin apenas
   */
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const productDto: CreateProductDto = req.body;

      // Validações básicas
      if (!productDto.nome || productDto.nome.trim().length === 0) {
        this.sendError(res, 'Nome do produto é obrigatório', 400);
        return;
      }

      if (productDto.nome.length > 150) {
        this.sendError(res, 'Nome do produto deve ter no máximo 150 caracteres', 400);
        return;
      }

      if (!productDto.preco || productDto.preco <= 0) {
        this.sendError(res, 'Preço deve ser maior que zero', 400);
        return;
      }

      if (!productDto.categoriaId) {
        this.sendError(res, 'Categoria é obrigatória', 400);
        return;
      }

      const product = await this.productService.create(productDto);
      
      const response: ProductResponse = this.formatProductResponse(product);
      
      this.sendSuccess(res, response, 'Produto criado com sucesso', 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar produto';
      this.sendError(res, message, 400);
    }
  };

  /**
   * Listar produtos com paginação e filtros
   * GET /products
   * Acesso: Público
   */
  findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const query: ProductListQuery = req.query;

      const result = await this.productService.findAll(query);
      
      const response = {
        products: result.products.map((product: any) => this.formatProductResponse(product)),
        pagination: result.pagination,
        filters: result.filters
      };

      this.sendSuccess(res, response, 'Produtos recuperados com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar produtos';
      this.sendError(res, message, 500);
    }
  };

  /**
   * Buscar produto por ID
   * GET /products/:id
   * Acesso: Público
   */
  findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        this.sendError(res, 'ID inválido', 400);
        return;
      }

      const product = await this.productService.findById(id);

      if (!product) {
        this.sendError(res, 'Produto não encontrado', 404);
        return;
      }

      const response: ProductResponse = this.formatProductResponse(product);
      
      this.sendSuccess(res, response, 'Produto encontrado');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar produto';
      this.sendError(res, message, 500);
    }
  };

  /**
   * Buscar produtos por categoria
   * GET /products/category/:id
   * Acesso: Público
   */
  findByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const categoriaId = parseInt(req.params.id);

      if (isNaN(categoriaId)) {
        this.sendError(res, 'ID da categoria inválido', 400);
        return;
      }

      const query: ProductListQuery = req.query;
      const result = await this.productService.findByCategory(categoriaId, query);
      
      const response = {
        products: result.products.map((product: any) => this.formatProductResponse(product)),
        category: result.category,
        pagination: result.pagination
      };
      
      this.sendSuccess(res, response, 'Produtos da categoria recuperados com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar produtos da categoria';
      
      if (message === 'Categoria não encontrada') {
        this.sendError(res, message, 404);
      } else {
        this.sendError(res, message, 500);
      }
    }
  };

  /**
   * Atualizar produto
   * PUT /products/:id
   * Acesso: Admin apenas
   */
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const updateDto: UpdateProductDto = req.body;

      if (isNaN(id)) {
        this.sendError(res, 'ID inválido', 400);
        return;
      }

      // Validações
      if (updateDto.nome !== undefined) {
        if (!updateDto.nome || updateDto.nome.trim().length === 0) {
          this.sendError(res, 'Nome do produto não pode estar vazio', 400);
          return;
        }

        if (updateDto.nome.length > 150) {
          this.sendError(res, 'Nome do produto deve ter no máximo 150 caracteres', 400);
          return;
        }
      }

      if (updateDto.preco !== undefined && updateDto.preco <= 0) {
        this.sendError(res, 'Preço deve ser maior que zero', 400);
        return;
      }

      const updatedProduct = await this.productService.update(id, updateDto);
      
      const response: ProductResponse = this.formatProductResponse(updatedProduct);
      
      this.sendSuccess(res, response, 'Produto atualizado com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar produto';
      
      if (message === 'Produto não encontrado') {
        this.sendError(res, message, 404);
      } else {
        this.sendError(res, message, 400);
      }
    }
  };

  /**
   * Desativar produto (soft delete)
   * DELETE /products/:id
   * Acesso: Admin apenas
   */
  softDelete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        this.sendError(res, 'ID inválido', 400);
        return;
      }

      await this.productService.softDelete(id);
      
      this.sendSuccess(res, null, 'Produto desativado com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao desativar produto';
      
      if (message === 'Produto não encontrado') {
        this.sendError(res, message, 404);
      } else {
        this.sendError(res, message, 400);
      }
    }
  };

  /**
   * Reativar produto
   * POST /products/:id/activate
   * Acesso: Admin apenas
   */
  activate = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        this.sendError(res, 'ID inválido', 400);
        return;
      }

      const reactivatedProduct = await this.productService.activate(id);
      
      const response: ProductResponse = this.formatProductResponse(reactivatedProduct);
      
      this.sendSuccess(res, response, 'Produto reativado com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao reativar produto';
      
      if (message === 'Produto não encontrado') {
        this.sendError(res, message, 404);
      } else {
        this.sendError(res, message, 400);
      }
    }
  };

  /**
   * Atualizar estoque
   * POST /products/:id/stock
   * Acesso: Admin apenas
   */
  updateStock = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const stockDto: UpdateStockDto = req.body;

      if (isNaN(id)) {
        this.sendError(res, 'ID inválido', 400);
        return;
      }

      // Validações
      if (!stockDto.quantidade || stockDto.quantidade <= 0) {
        this.sendError(res, 'Quantidade deve ser maior que zero', 400);
        return;
      }

      if (!['entrada', 'saida'].includes(stockDto.tipo)) {
        this.sendError(res, 'Tipo deve ser "entrada" ou "saida"', 400);
        return;
      }

      const updatedProduct = await this.productService.updateStock(id, stockDto);
      
      const response: ProductResponse = this.formatProductResponse(updatedProduct);
      
      const message = stockDto.tipo === 'entrada' 
        ? 'Estoque adicionado com sucesso' 
        : 'Estoque reduzido com sucesso';
      
      this.sendSuccess(res, response, message);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar estoque';
      
      if (message === 'Produto não encontrado') {
        this.sendError(res, message, 404);
      } else if (message.includes('Estoque insuficiente')) {
        this.sendError(res, message, 400);
      } else {
        this.sendError(res, message, 400);
      }
    }
  };

  /**
   * Listar produtos em falta
   * GET /products/out-of-stock
   * Acesso: Público
   */
  findOutOfStock = async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await this.productService.findOutOfStock();
      
      const response = products.map((product: any) => this.formatProductResponse(product));
      
      this.sendSuccess(res, response, 'Produtos em falta recuperados com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar produtos em falta';
      this.sendError(res, message, 500);
    }
  };

  /**
   * Obter estatísticas de produtos
   * GET /products/stats
   * Acesso: Público
   */
  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.productService.getStats();
      
      // Formatar produtos nas estatísticas
      const formattedStats = {
        ...stats,
        produtoMaisCaro: stats.produtoMaisCaro ? this.formatProductResponse(stats.produtoMaisCaro) : null,
        produtoMaisBarato: stats.produtoMaisBarato ? this.formatProductResponse(stats.produtoMaisBarato) : null
      };

      this.sendSuccess(res, formattedStats, 'Estatísticas recuperadas com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar estatísticas';
      this.sendError(res, message, 500);
    }
  };

  /**
   * Formatar resposta do produto
   */
  private formatProductResponse(product: any): ProductResponse {
    return {
      id: product.id,
      nome: product.nome,
      descricao: product.descricao,
      preco: product.preco.toString(),
      categoriaId: product.categoriaId,
      categoria: product.categoria ? {
        id: product.categoria.id,
        nome: product.categoria.nome,
        descricao: product.categoria.descricao
      } : undefined,
      estoqueAtual: product.estoqueAtual,
      estoqueMinimo: product.estoqueMinimo,
      ativo: product.ativo,
      emFalta: product.estoqueAtual <= product.estoqueMinimo,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    };
  }
}