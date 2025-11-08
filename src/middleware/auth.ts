import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JwtPayload } from '../types/auth';
import { config } from '../config';
import { createErrorResponse } from '../utils';

/**
 * Middleware para verificar JWT token
 */
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    // Pegar token do header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json(createErrorResponse('Token de acesso não fornecido'));
      return;
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    // Adicionar dados do usuário ao request
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json(createErrorResponse('Token inválido'));
      return;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json(createErrorResponse('Token expirado'));
      return;
    }

    res.status(500).json(createErrorResponse('Erro ao verificar token'));
  }
};

/**
 * Middleware para verificar se o usuário tem permissão de admin
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json(createErrorResponse('Usuário não autenticado'));
    return;
  }

  if (req.user.role !== 'ADMIN') {
    res.status(403).json(createErrorResponse('Acesso negado. Requer permissão de administrador'));
    return;
  }

  next();
};

/**
 * Middleware para verificar se o usuário tem uma das roles permitidas
 */
export const requireRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(createErrorResponse('Usuário não autenticado'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json(createErrorResponse('Acesso negado. Permissão insuficiente'));
      return;
    }

    next();
  };
};

/**
 * Middleware opcional de autenticação (não retorna erro se token não existir)
 * Útil para rotas que podem ser acessadas com ou sem autenticação
 */
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Ignora erros e continua sem autenticação
    next();
  }
};
