import { PrismaClient } from '@prisma/client';

/**
 * Classe para gerenciar conexões com PostgreSQL usando Prisma ORM
 */
class DatabaseConnection {
  private prisma: PrismaClient;
  private static instance: DatabaseConnection;

  constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    });

    // Event listeners para monitoramento
    console.log('🔌 Prisma Client inicializado');
  }

  /**
   * Singleton pattern para garantir uma única instância
   */
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Obter o Prisma Client
   */
  public getClient(): PrismaClient {
    return this.prisma;
  }

  /**
   * Testar conexão com o banco
   */
  public async testConnection(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT NOW() as current_time, version() as db_version`;
      console.log('✅ Conexão com PostgreSQL testada com sucesso via Prisma');
      return true;
    } catch (error) {
      console.error('❌ Falha no teste de conexão com PostgreSQL:', error);
      return false;
    }
  }

  /**
   * Obter informações do banco
   */
  public async getDatabaseInfo(): Promise<any> {
    try {
      const result = await this.prisma.$queryRaw`
        SELECT 
          current_database()::text as database_name,
          version()::text as version,
          pg_database_size(current_database())::text as size_bytes
      ` as any[];
      
      return result[0];
    } catch (error) {
      console.error('❌ Erro ao obter informações do banco:', error);
      return null;
    }
  }

  /**
   * Executar uma query raw (use com cuidado)
   */
  public async query(sql: string): Promise<any> {
    try {
      return await this.prisma.$queryRawUnsafe(sql);
    } catch (error) {
      console.error('❌ Erro ao executar query:', error);
      throw error;
    }
  }

  /**
   * Fechar conexão com o banco
   */
  public async close(): Promise<void> {
    console.log('🔌 Fechando conexão Prisma...');
    await this.prisma.$disconnect();
    console.log('✅ Conexão Prisma fechada');
  }
}

// Exportar instância singleton
const dbConnection = DatabaseConnection.getInstance();

// Exportar o Prisma Client diretamente para facilitar o uso
export const prisma = dbConnection.getClient();
export const db = dbConnection;