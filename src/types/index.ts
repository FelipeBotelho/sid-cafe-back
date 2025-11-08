import { Request, Response } from 'express';

// Interface para Response padronizada da API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// Interface para Request customizada
export interface CustomRequest extends Request {
  user?: any; // Para futura implementação de autenticação
  requestId?: string;
}

// Interface para Response customizada
export interface CustomResponse extends Response {
  json(body: ApiResponse): this;
}

// Tipo para Controller Methods
export type ControllerMethod = (
  req: CustomRequest, 
  res: CustomResponse
) => Promise<void> | void;

// Interface para Error customizado
export interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Tipos para Health Check
export interface HealthStatus {
  status: 'OK' | 'ERROR';
  uptime: number;
  timestamp: string;
  version: string;
  environment: string;
}