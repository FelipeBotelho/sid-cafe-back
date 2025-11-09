import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Registrar novo usuário
 *     description: Cria uma nova conta de usuário no sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AuthResponse'
 *         headers:
 *           Set-Cookie:
 *             description: Refresh token em httpOnly cookie
 *             schema:
 *               type: string
 *               example: refreshToken=eyJhbGc...; HttpOnly; Secure; SameSite=Lax
 *       400:
 *         description: Dados inválidos ou email já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login de usuário
 *     description: Autentica usuário e retorna tokens de acesso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AuthResponse'
 *         headers:
 *           Set-Cookie:
 *             description: Refresh token em httpOnly cookie
 *             schema:
 *               type: string
 *               example: refreshToken=eyJhbGc...; HttpOnly; Secure; SameSite=Lax
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Renovar access token
 *     description: Gera novo access token usando refresh token do cookie
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Token renovado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                         expiresIn:
 *                           type: integer
 *                           example: 86400
 *         headers:
 *           Set-Cookie:
 *             description: Novo refresh token em httpOnly cookie
 *             schema:
 *               type: string
 *       401:
 *         description: Refresh token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/refresh', authController.refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout do usuário
 *     description: Invalida refresh token e limpa cookie
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       nullable: true
 *         headers:
 *           Set-Cookie:
 *             description: Cookie removido
 *             schema:
 *               type: string
 *               example: refreshToken=; HttpOnly; Secure; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT
 *       400:
 *         description: Refresh token não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout de todos os dispositivos
 *     description: Invalida todos os refresh tokens do usuário em todos os dispositivos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout de todos os dispositivos realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         tokensRevoked:
 *                           type: integer
 *                           description: Número de tokens invalidados
 *                           example: 3
 *       401:
 *         description: Access token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/logout-all', authenticateToken, authController.logoutAll);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Obter perfil do usuário logado
 *     description: Retorna informações do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Access token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/me', authenticateToken, authController.getProfile);

export { router as authRoutes };
