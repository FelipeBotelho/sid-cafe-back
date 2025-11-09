import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { SaleService } from '../services/SaleService';
import {
  CreateSaleDto,
  UpdateSaleDto,
  SaleListQuery,
  SaleResponse,
  SaleItemResponse,
  SaleStatus
} from '../types/sale';
import { Decimal } from '@prisma/client/runtime/library';

export class SaleController extends BaseController {
  private saleService: SaleService;

  constructor() {
    super();
    this.saleService = new SaleService();
  }

  /**
   * Criar nova venda
   * POST /sales
   * Acesso: Admin apenas
   */
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const saleDto: CreateSaleDto = req.body;

      // Validações básicas
      if (!saleDto.clienteId) {
        this.sendError(res, 'ID do cliente é obrigatório', 400);
        return;
      }

      if (!saleDto.itens || saleDto.itens.length === 0) {
        this.sendError(res, 'É necessário informar pelo menos um item', 400);
        return;
      }

      // Validar itens
      for (const item of saleDto.itens) {
        if (!item.produtoId) {
          this.sendError(res, 'ID do produto é obrigatório em todos os itens', 400);
          return;
        }

        if (!item.quantidade || item.quantidade <= 0) {
          this.sendError(res, 'Quantidade deve ser maior que zero', 400);
          return;
        }

        if (item.precoUnitario !== undefined && item.precoUnitario <= 0) {
          this.sendError(res, 'Preço unitário deve ser maior que zero', 400);
          return;
        }
      }

      // Validar desconto
      if (saleDto.desconto !== undefined && saleDto.desconto < 0) {
        this.sendError(res, 'Desconto não pode ser negativo', 400);
        return;
      }

      const sale = await this.saleService.create(saleDto);
      const response: SaleResponse = this.formatSaleResponse(sale);

      this.sendSuccess(res, response, 'Venda criada com sucesso', 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar venda';
      this.sendError(res, message, 400);
    }
  };

  /**
   * Listar vendas com filtros
   * GET /sales
   * Acesso: Admin apenas
   */
  findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const query: SaleListQuery = req.query;
      const result = await this.saleService.findAll(query);

      const response = {
        sales: result.sales.map((sale: any) => this.formatSaleResponse(sale)),
        pagination: result.pagination,
        filters: result.filters
      };

      this.sendSuccess(res, response, 'Vendas recuperadas com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar vendas';
      this.sendError(res, message, 500);
    }
  };

  /**
   * Buscar venda por ID
   * GET /sales/:id
   * Acesso: Admin apenas
   */
  findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        this.sendError(res, 'ID inválido', 400);
        return;
      }

      const sale = await this.saleService.findById(id);

      if (!sale) {
        this.sendError(res, 'Venda não encontrada', 404);
        return;
      }

      const response: SaleResponse = this.formatSaleResponse(sale);
      this.sendSuccess(res, response, 'Venda encontrada');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar venda';
      this.sendError(res, message, 500);
    }
  };

  /**
   * Atualizar status da venda
   * PATCH /sales/:id/status
   * Acesso: Admin apenas
   */
  updateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const updateDto: UpdateSaleDto = req.body;

      if (isNaN(id)) {
        this.sendError(res, 'ID inválido', 400);
        return;
      }

      // Validações
      if (updateDto.status && !Object.values(SaleStatus).includes(updateDto.status)) {
        this.sendError(res, 'Status inválido', 400);
        return;
      }

      if (updateDto.desconto !== undefined && updateDto.desconto < 0) {
        this.sendError(res, 'Desconto não pode ser negativo', 400);
        return;
      }

      const sale = await this.saleService.updateStatus(id, updateDto);
      const response: SaleResponse = this.formatSaleResponse(sale);

      this.sendSuccess(res, response, 'Venda atualizada com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar venda';
      
      if (message.includes('não encontrada')) {
        this.sendError(res, message, 404);
      } else if (message.includes('transição') || message.includes('inválida')) {
        this.sendError(res, message, 400);
      } else {
        this.sendError(res, message, 500);
      }
    }
  };

  /**
   * Obter estatísticas de vendas
   * GET /sales/stats
   * Acesso: Admin apenas
   */
  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.saleService.getStats();
      this.sendSuccess(res, stats, 'Estatísticas recuperadas com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao obter estatísticas';
      this.sendError(res, message, 500);
    }
  };

  /**
   * Buscar vendas por cliente
   * GET /sales/cliente/:clienteId
   * Acesso: Admin apenas
   */
  findByCliente = async (req: Request, res: Response): Promise<void> => {
    try {
      const clienteId = parseInt(req.params.clienteId);

      if (isNaN(clienteId)) {
        this.sendError(res, 'ID do cliente inválido', 400);
        return;
      }

      const query: SaleListQuery = req.query;
      const result = await this.saleService.findByCliente(clienteId, query);

      const response = {
        sales: result.sales.map((sale: any) => this.formatSaleResponse(sale)),
        pagination: result.pagination,
        filters: result.filters
      };

      this.sendSuccess(res, response, 'Vendas do cliente recuperadas com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar vendas do cliente';
      this.sendError(res, message, 500);
    }
  };

  /**
   * Cancelar venda
   * DELETE /sales/:id
   * Acesso: Admin apenas
   */
  cancel = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        this.sendError(res, 'ID inválido', 400);
        return;
      }

      const sale = await this.saleService.updateStatus(id, { status: SaleStatus.CANCELLED });
      const response: SaleResponse = this.formatSaleResponse(sale);

      this.sendSuccess(res, response, 'Venda cancelada com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao cancelar venda';
      
      if (message.includes('não encontrada')) {
        this.sendError(res, message, 404);
      } else if (message.includes('transição') || message.includes('inválida')) {
        this.sendError(res, message, 400);
      } else {
        this.sendError(res, message, 500);
      }
    }
  };

  /**
   * Formatar resposta de venda para o cliente
   */
  private formatSaleResponse(sale: any): SaleResponse {
    return {
      id: sale.id,
      clienteId: sale.clienteId,
      cliente: {
        id: sale.cliente.id,
        name: sale.cliente.name,
        email: sale.cliente.email
      },
      itens: sale.itens.map((item: any) => this.formatSaleItemResponse(item)),
      valorTotal: sale.valorTotal.toString(),
      desconto: (sale.desconto || new Decimal(0)).toString(),
      valorFinal: sale.valorFinal.toString(),
      status: sale.status,
      observacoes: sale.observacoes,
      dataVenda: sale.dataVenda.toISOString(),
      createdAt: sale.createdAt.toISOString(),
      updatedAt: sale.updatedAt.toISOString()
    };
  }

  /**
   * Formatar resposta de item de venda
   */
  private formatSaleItemResponse(item: any): SaleItemResponse {
    return {
      id: item.id,
      produtoId: item.produtoId,
      produto: {
        id: item.produto.id,
        nome: item.produto.nome,
        descricao: item.produto.descricao,
        precoAtual: item.produto.preco.toString()
      },
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario.toString(),
      valorTotal: item.valorTotal.toString()
    };
  }
}