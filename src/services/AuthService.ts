import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../database';
import { config } from '../config';
import { RegisterDto, LoginDto, AuthResponse, AuthUser, JwtPayload, AuthTokens } from '../types/auth';

/**
 * Service para autenticação e gerenciamento de usuários
 */
export class AuthService {

  /**
   * Registrar novo usuário
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword
      }
    });

    // Gerar tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: this.sanitizeUser(user),
      tokens
    };
  }

  /**
   * Login de usuário
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Verificar se usuário está ativo
    if (!user.isActive) {
      throw new Error('Usuário inativo');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: this.sanitizeUser(user),
      tokens
    };
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    // Verificar se refresh token existe e não está revogado
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!tokenRecord || tokenRecord.isRevoked) {
      throw new Error('Refresh token inválido');
    }

    // Verificar se token expirou
    if (new Date() > tokenRecord.expiresAt) {
      throw new Error('Refresh token expirado');
    }

    // Verificar se usuário está ativo
    if (!tokenRecord.user.isActive) {
      throw new Error('Usuário inativo');
    }

    // Revogar token antigo
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { isRevoked: true }
    });

    // Gerar novos tokens
    return this.generateTokens(
      tokenRecord.user.id,
      tokenRecord.user.email,
      tokenRecord.user.role
    );
  }

  /**
   * Logout (revogar refresh token)
   */
  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true }
    });
  }

  /**
   * Logout de todos os dispositivos (revogar todos os tokens do usuário)
   */
  async logoutAll(userId: number): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true }
    });
  }

  /**
   * Buscar usuário por ID
   */
  async getUserById(userId: number): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return null;
    }

    return this.sanitizeUser(user);
  }

  /**
   * Verificar JWT token
   */
  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  /**
   * Gerar access token e refresh token
   */
  private async generateTokens(userId: number, email: string, role: string): Promise<AuthTokens> {
    // Gerar access token (curta duração)
    const accessToken = jwt.sign(
      { userId, email, role } as JwtPayload,
      config.jwt.secret,
      { expiresIn: '24h' }
    );

    // Gerar refresh token (longa duração)
    const refreshToken = jwt.sign(
      { userId, email, type: 'refresh' },
      config.jwt.secret,
      { expiresIn: '7d' }
    );

    // Salvar refresh token no banco
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt
      }
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 86400 // 24 horas em segundos
    };
  }

  /**
   * Remover dados sensíveis do usuário
   */
  private sanitizeUser(user: any): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive
    };
  }
}