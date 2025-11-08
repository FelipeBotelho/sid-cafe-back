import { CustomRequest, CustomResponse, HealthStatus } from '../types';
import { BaseController } from './BaseController';
import { HealthService } from '../services/HealthService';
import { asyncHandler } from '../middleware';

/**
 * Controller para endpoints de health check
 */
export class HealthController extends BaseController {
  private healthService: HealthService;

  constructor() {
    super();
    this.healthService = new HealthService();
  }

  /**
   * GET /health - Health check básico
   */
  checkHealth = asyncHandler(async (req: CustomRequest, res: CustomResponse): Promise<void> => {
    try {
      const healthStatus = await this.healthService.getHealthStatus();
      this.sendSuccess(res, healthStatus, 'Sistema funcionando normalmente');
    } catch (error) {
      this.sendError(res, 'Erro no health check', 503, error instanceof Error ? error.message : 'Erro desconhecido');
    }
  });

  /**
   * GET /health/detailed - Health check detalhado
   */
  checkDetailedHealth = asyncHandler(async (req: CustomRequest, res: CustomResponse): Promise<void> => {
    try {
      const detailedStatus = await this.healthService.getDetailedHealthStatus();
      this.sendSuccess(res, detailedStatus, 'Status detalhado do sistema');
    } catch (error) {
      this.sendError(res, 'Erro no health check detalhado', 503, error instanceof Error ? error.message : 'Erro desconhecido');
    }
  });

  /**
   * GET / - Endpoint raiz da API
   */
  welcome = asyncHandler(async (req: CustomRequest, res: CustomResponse): Promise<void> => {
    const welcomeMessage = {
      message: 'API Node.js TypeScript Express está rodando!',
      version: '1.0.0',
      documentation: '/docs', // Para futuro uso
      endpoints: {
        health: '/health',
        detailedHealth: '/health/detailed'
      }
    };

    this.sendSuccess(res, welcomeMessage, 'Bem-vindo à API!');
  });
}