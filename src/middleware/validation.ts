import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de validação básica
 */
export const validateRequest = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Campos obrigatórios ausentes: ${missingFields.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

/**
 * Middleware para validar formato de email
 */
export const validateEmail = (field: string = 'email') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const email = req.body[field];
    
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: `Formato de email inválido no campo: ${field}`,
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};