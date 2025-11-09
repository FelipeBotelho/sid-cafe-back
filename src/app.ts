import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { db } from './database';
import { swaggerSpec, swaggerUi, swaggerUiOptions } from './config/swagger';
import { 
  requestLogger, 
  securityHeaders, 
  errorHandler, 
  notFound 
} from './middleware';
import routes from './routes';

const app = express();
const PORT = config.port;

// Trust proxy (para deployment em produção)
app.set('trust proxy', 1);

// CORS - IMPORTANTE: Deve vir ANTES dos outros middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true, // Permite envio de cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));

// Middleware de segurança
app.use(securityHeaders);

// Cookie parser (antes do body parsing)
app.use(cookieParser());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// API Routes
app.use('/api/v1', routes);

// Health check direto (sem versionamento)
app.use('/', routes);

// Middleware para rotas não encontradas
app.use(notFound);

// Middleware de tratamento de erros (sempre por último)
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`📊 Detailed Health: http://localhost:${PORT}/health/detailed`);
  console.log(`🌍 Ambiente: ${config.nodeEnv}`);
  
  if (config.nodeEnv === 'development') {
    console.log('🔧 Modo desenvolvimento ativo');
  }

  // Testar conexão com banco de dados
  console.log('🔌 Testando conexão com PostgreSQL...');
  try {
    const isConnected = await db.testConnection();
    if (isConnected) {
      console.log('✅ Conexão com PostgreSQL estabelecida com sucesso');
    } else {
      console.log('⚠️  Falha na conexão com PostgreSQL - Verifique se o banco está rodando');
    }
  } catch (error) {
    console.log('❌ Erro ao conectar com PostgreSQL:', error instanceof Error ? error.message : 'Erro desconhecido');
    console.log('💡 Execute "npm run db:start" para iniciar o banco de dados');
  }
});