import express from 'express';
import { config } from './config';
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

// Middleware de segurança
app.use(securityHeaders);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// API Routes
app.use('/api/v1', routes);

// Health check direto (sem versionamento)
app.use('/', routes);

// Middleware para rotas não encontradas
app.use(notFound);

// Middleware de tratamento de erros (sempre por último)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`📊 Detailed Health: http://localhost:${PORT}/health/detailed`);
  console.log(`🌍 Ambiente: ${config.nodeEnv}`);
  
  if (config.nodeEnv === 'development') {
    console.log('🔧 Modo desenvolvimento ativo');
  }
});