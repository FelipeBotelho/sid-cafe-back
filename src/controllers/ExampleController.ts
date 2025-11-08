/**
 * Exemplo de como criar um novo controller
 * Copie este arquivo e modifique conforme necessário
 */

import { CustomRequest, CustomResponse } from '../types';
import { BaseController } from './BaseController';
import { asyncHandler } from '../middleware';
// import { ExampleService } from '../services/ExampleService';

export class ExampleController extends BaseController {
  // private exampleService: ExampleService;

  constructor() {
    super();
    // this.exampleService = new ExampleService();
  }

  /**
   * GET /example - Listar todos os items
   */
  getAll = asyncHandler(async (req: CustomRequest, res: CustomResponse): Promise<void> => {
    try {
      // const items = await this.exampleService.getAll();
      const items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];
      
      this.sendSuccess(res, items, 'Items listados com sucesso');
    } catch (error) {
      this.sendError(res, 'Erro ao listar items', 500, error instanceof Error ? error.message : 'Erro desconhecido');
    }
  });

  /**
   * GET /example/:id - Buscar item por ID
   */
  getById = asyncHandler(async (req: CustomRequest, res: CustomResponse): Promise<void> => {
    try {
      const { id } = this.getParams(req);
      
      if (!id) {
        return this.sendError(res, 'ID é obrigatório', 400);
      }

      // const item = await this.exampleService.getById(id);
      const item = { id, name: `Item ${id}` };
      
      this.sendSuccess(res, item, 'Item encontrado com sucesso');
    } catch (error) {
      this.sendError(res, 'Erro ao buscar item', 500, error instanceof Error ? error.message : 'Erro desconhecido');
    }
  });

  /**
   * POST /example - Criar novo item
   */
  create = asyncHandler(async (req: CustomRequest, res: CustomResponse): Promise<void> => {
    try {
      const data = this.getBodyData<any>(req, ['name']); // 'name' é obrigatório
      
      // const newItem = await this.exampleService.create(data);
      const newItem = { id: Date.now(), ...data };
      
      this.sendSuccess(res, newItem, 'Item criado com sucesso', 201);
    } catch (error) {
      this.sendError(res, 'Erro ao criar item', 400, error instanceof Error ? error.message : 'Erro desconhecido');
    }
  });

  /**
   * PUT /example/:id - Atualizar item
   */
  update = asyncHandler(async (req: CustomRequest, res: CustomResponse): Promise<void> => {
    try {
      const { id } = this.getParams(req);
      const data = this.getBodyData<any>(req);
      
      if (!id) {
        return this.sendError(res, 'ID é obrigatório', 400);
      }

      // const updatedItem = await this.exampleService.update(id, data);
      const updatedItem = { id, ...data };
      
      this.sendSuccess(res, updatedItem, 'Item atualizado com sucesso');
    } catch (error) {
      this.sendError(res, 'Erro ao atualizar item', 500, error instanceof Error ? error.message : 'Erro desconhecido');
    }
  });

  /**
   * DELETE /example/:id - Deletar item
   */
  delete = asyncHandler(async (req: CustomRequest, res: CustomResponse): Promise<void> => {
    try {
      const { id } = this.getParams(req);
      
      if (!id) {
        return this.sendError(res, 'ID é obrigatório', 400);
      }

      // await this.exampleService.delete(id);
      
      this.sendSuccess(res, null, 'Item deletado com sucesso');
    } catch (error) {
      this.sendError(res, 'Erro ao deletar item', 500, error instanceof Error ? error.message : 'Erro desconhecido');
    }
  });
}