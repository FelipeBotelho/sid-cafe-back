import { Request, Response } from 'express';
import { CustomRequest, CustomResponse, ControllerMethod } from '../types';
import { createSuccessResponse, createErrorResponse } from '../utils';

/**
 * Classe base para todos os controllers
 */
export abstract class BaseController {
  
  /**
   * Método helper para enviar response de sucesso
   */
  protected sendSuccess<T>(
    res: CustomResponse, 
    data: T, 
    message: string = 'Operação realizada com sucesso',
    statusCode: number = 200
  ): void {
    res.status(statusCode).json(createSuccessResponse(data, message));
  }

  /**
   * Método helper para enviar response de erro
   */
  protected sendError(
    res: CustomResponse, 
    message: string = 'Erro interno do servidor',
    statusCode: number = 500,
    error?: string
  ): void {
    res.status(statusCode).json(createErrorResponse(message, error));
  }

  /**
   * Método helper para extrair dados do body com validação
   */
  protected getBodyData<T>(req: CustomRequest, requiredFields: string[] = []): T {
    const data = req.body;
    
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      throw new Error(`Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
    }

    return data;
  }

  /**
   * Método helper para extrair parâmetros da URL
   */
  protected getParams(req: CustomRequest): any {
    return req.params;
  }

  /**
   * Método helper para extrair query parameters
   */
  protected getQuery(req: CustomRequest): any {
    return req.query;
  }
}