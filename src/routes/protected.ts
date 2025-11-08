import { Router } from 'express';
import { Response } from 'express';
import { AuthRequest } from '../types/auth';
import { authenticateToken, requireAdmin, requireRoles } from '../middleware/auth';
import { createSuccessResponse } from '../utils';

const router = Router();

/**
 * @route GET /protected/profile
 * @desc Rota protegida - requer autenticação
 * @access Private
 */
router.get('/profile', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json(createSuccessResponse(
    {
      userId: req.user?.userId,
      email: req.user?.email,
      role: req.user?.role
    },
    'Dados do usuário autenticado'
  ));
});

/**
 * @route GET /protected/admin
 * @desc Rota protegida apenas para admins
 * @access Private (Admin only)
 */
router.get('/admin', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  res.json(createSuccessResponse(
    { message: 'Você tem acesso de administrador!' },
    'Acesso administrativo concedido'
  ));
});

/**
 * @route GET /protected/moderator
 * @desc Rota protegida para admins e moderadores
 * @access Private (Admin/Moderator)
 */
router.get(
  '/moderator',
  authenticateToken,
  requireRoles('ADMIN', 'MODERATOR'),
  (req: AuthRequest, res: Response) => {
    res.json(createSuccessResponse(
      { message: 'Você tem acesso de moderador!' },
      'Acesso de moderação concedido'
    ));
  }
);

export { router as protectedRoutes };
