import { Request } from 'express';

// Dados do usuário autenticado (sem senha)
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  isActive: boolean;
}

// Payload do JWT
export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Request com usuário autenticado
export interface AuthRequest extends Request {
  user?: JwtPayload;
  requestId?: string;
}

// DTOs para autenticação
export interface RegisterDto {
  email: string;
  name: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}