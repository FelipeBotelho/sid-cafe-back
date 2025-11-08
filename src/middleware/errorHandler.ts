import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../types';

/**
 * Middleware de tratamento de erros global
 */
export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Erro interno do servidor';

  // Log do erro (em produção, usar um logger como Winston)
  console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.path}:`, {
    error: message,
    statusCode,
    stack: error.stack,
    body: req.body,
    params: req.params,
    query: req.query
  });

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    timestamp: new Date().toISOString()
  });
};

/**
 * Middleware para capturar erros assíncronos
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware para rotas não encontradas
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Rota não encontrada: ${req.originalUrl}`) as CustomError;
  error.statusCode = 404;
  next(error);
};