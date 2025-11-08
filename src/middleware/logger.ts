import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de logging de requisições
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();

  // Adiciona o ID da requisição ao request
  (req as any).requestId = requestId;

  // Log da requisição
  console.log(`[REQUEST] ${new Date().toISOString()} - ${requestId} - ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method !== 'GET' ? req.body : undefined,
    params: req.params,
    query: req.query
  });

  // Log da resposta quando a requisição terminar
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[RESPONSE] ${new Date().toISOString()} - ${requestId} - ${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
};

/**
 * Middleware para adicionar headers de segurança básicos
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};