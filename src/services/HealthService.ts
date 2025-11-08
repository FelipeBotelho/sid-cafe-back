import { HealthStatus } from '../types';
import { config } from '../config';
import { db } from '../database';

/**
 * Service para health checks do sistema
 */
export class HealthService {

  /**
   * Retorna o status básico de saúde do sistema
   */
  async getHealthStatus(): Promise<HealthStatus> {
    return {
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: config.nodeEnv
    };
  }

  /**
   * Retorna status detalhado de saúde do sistema
   */
  async getDetailedHealthStatus(): Promise<any> {
    const basicStatus = await this.getHealthStatus();

    return {
      ...basicStatus,
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        architecture: process.arch,
        pid: process.pid
      },
      memory: {
        ...process.memoryUsage(),
        // Converter bytes para MB para melhor legibilidade
        rss_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapUsed_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal_mb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      config: {
        port: config.port,
        nodeEnv: config.nodeEnv,
        apiVersion: config.apiVersion
      },
      // Para futuro uso - checks de dependências externas
      dependencies: {
        database: await this.checkDatabase(),
        // redis: await this.checkRedis(),
        // externalAPI: await this.checkExternalAPI()
      }
    };
  }

  /**
   * Check de conexão com banco de dados PostgreSQL (via Prisma)
   */
  private async checkDatabase(): Promise<{ status: string; message: string; details?: any }> {
    try {
      const isConnected = await db.testConnection();
      
      if (isConnected) {
        const dbInfo = await db.getDatabaseInfo();
        return {
          status: 'OK',
          message: 'PostgreSQL connected successfully via Prisma ORM',
          details: {
            database: dbInfo?.database_name || 'sidcafe',
            version: dbInfo?.version?.split(' ')[0] || 'Unknown',
            size_mb: dbInfo?.size_bytes ? Math.round(Number(dbInfo.size_bytes) / 1024 / 1024) : 'Unknown'
          }
        };
      } else {
        return {
          status: 'ERROR',
          message: 'Failed to connect to PostgreSQL'
        };
      }
    } catch (error) {
      return {
        status: 'ERROR',
        message: 'Database connection error',
        details: error instanceof Error ? error.message : 'Unknown database error'
      };
    }
  }

  /**
   * Check de memória do sistema
   */
  private checkMemoryUsage(): { status: string; usage: any } {
    const memUsage = process.memoryUsage();
    const isHealthy = memUsage.heapUsed < (memUsage.heapTotal * 0.9); // 90% threshold

    return {
      status: isHealthy ? 'OK' : 'WARNING',
      usage: memUsage
    };
  }
}