import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { AuthService } from '../services/AuthService';
import { RegisterDto, LoginDto, AuthRequest } from '../types/auth';

export class AuthController extends BaseController {
  private authService: AuthService;

  constructor() {
    super();
    this.authService = new AuthService();
  }

  /**
   * Registrar novo usuário
   * POST /auth/register
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const registerDto: RegisterDto = req.body;
      
      const result = await this.authService.register(registerDto);
      
      // Armazenar refresh token em httpOnly cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS em produção
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
      });

      // Retornar apenas access token e dados do usuário
      this.sendSuccess(res, {
        user: result.user,
        accessToken: result.tokens.accessToken,
        expiresIn: result.tokens.expiresIn
      }, 'Usuário registrado com sucesso', 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao registrar usuário';
      this.sendError(res, message, 400);
    }
  };

  /**
   * Login de usuário
   * POST /auth/login
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const loginDto: LoginDto = req.body;
      
      const result = await this.authService.login(loginDto);
      
      // Armazenar refresh token em httpOnly cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      // Retornar apenas access token e dados do usuário
      this.sendSuccess(res, {
        user: result.user,
        accessToken: result.tokens.accessToken,
        expiresIn: result.tokens.expiresIn
      }, 'Login realizado com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao realizar login';
      this.sendError(res, message, 401);
    }
  };

  /**
   * Atualizar access token usando refresh token
   * POST /auth/refresh
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      // Tentar pegar refresh token do cookie primeiro, senão do body
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      
      if (!refreshToken) {
        this.sendError(res, 'Refresh token não fornecido', 400);
        return;
      }
      
      const result = await this.authService.refreshToken(refreshToken);
      
      // Atualizar cookie com novo refresh token
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      // Retornar apenas novo access token
      this.sendSuccess(res, {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn
      }, 'Token atualizado com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar token';
      this.sendError(res, message, 401);
    }
  };

  /**
   * Logout de usuário (invalidar refresh token atual)
   * POST /auth/logout
   */
  logout = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Tentar pegar refresh token do cookie primeiro, senão do body
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      
      if (!refreshToken) {
        this.sendError(res, 'Refresh token não fornecido', 400);
        return;
      }
      
      await this.authService.logout(refreshToken);
      
      // Limpar cookie
      res.clearCookie('refreshToken');
      
      this.sendSuccess(res, null, 'Logout realizado com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao realizar logout';
      this.sendError(res, message, 400);
    }
  };

  /**
   * Logout de todas as sessões (invalidar todos os refresh tokens)
   * POST /auth/logout-all
   */
  logoutAll = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        this.sendError(res, 'Usuário não autenticado', 401);
        return;
      }
      
      await this.authService.logoutAll(userId);
      
      this.sendSuccess(res, null, 'Logout de todas as sessões realizado com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao realizar logout';
      this.sendError(res, message, 400);
    }
  };

  /**
   * Obter perfil do usuário autenticado
   * GET /auth/me
   */
  getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        this.sendError(res, 'Usuário não autenticado', 401);
        return;
      }
      
      const user = await this.authService.getUserById(userId);
      
      if (!user) {
        this.sendError(res, 'Usuário não encontrado', 404);
        return;
      }
      
      this.sendSuccess(res, user, 'Perfil recuperado com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar perfil';
      this.sendError(res, message, 400);
    }
  };
}
