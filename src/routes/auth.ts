import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

/**
 * @route POST /auth/register
 * @desc Registrar novo usuário
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route POST /auth/login
 * @desc Login de usuário
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route POST /auth/refresh
 * @desc Atualizar access token usando refresh token
 * @access Public
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route POST /auth/logout
 * @desc Logout do usuário (invalidar refresh token)
 * @access Private
 */
router.post('/logout', authController.logout);

/**
 * @route POST /auth/logout-all
 * @desc Logout de todas as sessões
 * @access Private
 */
router.post('/logout-all', authenticateToken, authController.logoutAll);

/**
 * @route GET /auth/me
 * @desc Obter perfil do usuário autenticado
 * @access Private
 */
router.get('/me', authenticateToken, authController.getProfile);

export { router as authRoutes };
