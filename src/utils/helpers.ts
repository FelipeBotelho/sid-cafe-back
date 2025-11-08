import { ApiResponse } from '../types';

/**
 * Utility para criar responses padronizadas de sucesso
 */
export const createSuccessResponse = <T>(
  data: T, 
  message: string = 'Operação realizada com sucesso'
): ApiResponse<T> => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString()
});

/**
 * Utility para criar responses padronizadas de erro
 */
export const createErrorResponse = (
  message: string = 'Erro interno do servidor',
  error?: string
): ApiResponse => ({
  success: false,
  message,
  error,
  timestamp: new Date().toISOString()
});

/**
 * Utility para delay (útil para testes)
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Utility para validar se um objeto está vazio
 */
export const isEmpty = (obj: any): boolean => {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

/**
 * Utility para sanitizar string (remover caracteres especiais)
 */
export const sanitizeString = (str: string): string => {
  return str.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
};