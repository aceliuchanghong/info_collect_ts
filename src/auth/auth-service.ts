import { v4 as uuidv4 } from 'uuid';
import type {
  AuthConfig,
  RegisterParams,
  RegisterResult,
  LoginParams,
  LoginResult,
  UserInfo,
  User,
  UserStorage,
  VerifyResult,
  RequestPasswordResetParams,
  RequestPasswordResetResult,
  ResetPasswordParams,
} from './types.js';
import { createAuthConfig } from './config.js';
import { PasswordHasher } from './password.js';
import { JwtService } from './jwt.js';

/**
 * 认证服务类
 * 提供用户注册、登录、密码重置等核心认证功能
 *
 * 设计原则：
 * - 不依赖特定数据库，通过 UserStorage 接口解耦
 * - 支持环境变量或手动配置
 * - 完整类型定义
 */
export class AuthService {
  private config: AuthConfig;
  private passwordHasher: PasswordHasher;
  private jwtService: JwtService;
  private userStorage: UserStorage;
  private resetTokens: Map<string, { email: string; expiresAt: Date }>;

  /**
   * 创建认证服务实例
   * @param storage - 用户存储实现
   * @param config - 认证配置，不传则从环境变量读取
   */
  constructor(storage: UserStorage, config?: AuthConfig) {
    this.config = config || createAuthConfig(process.env);
    this.passwordHasher = new PasswordHasher(this.config.bcryptRounds);
    this.jwtService = new JwtService(
      this.config.jwtSecret,
      this.config.jwtExpiresIn,
      this.config.jwtIssuer
    );
    this.userStorage = storage;
    this.resetTokens = new Map();
  }

  /**
   * 用户注册
   * @param params - 注册参数
   * @returns 注册结果（用户信息 + JWT 令牌）
   * @throws 如果邮箱已存在
   */
  async register(params: RegisterParams): Promise<RegisterResult> {
    // 检查邮箱是否已存在
    const existingUser = await this.userStorage.findByEmail(params.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // 哈希密码
    const passwordHash = await this.passwordHasher.hash(params.password);

    // 创建用户
    const user = await this.userStorage.create({
      email: params.email,
      username: params.username,
      passwordHash,
    });

    // 生成 JWT
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      user: this.toUserInfo(user),
      token,
    };
  }

  /**
   * 用户登录
   * @param params - 登录参数
   * @returns 登录结果（用户信息 + JWT 令牌）
   * @throws 如果凭证无效
   */
  async login(params: LoginParams): Promise<LoginResult> {
    // 查找用户
    const user = await this.userStorage.findByEmail(params.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // 验证密码
    const isValid = await this.passwordHasher.verify(params.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // 检查是否需要重新哈希（轮数变更时）
    if (this.passwordHasher.needsRehash(user.passwordHash)) {
      const newHash = await this.passwordHasher.hash(params.password);
      await this.userStorage.update(user.id, { passwordHash: newHash });
    }

    // 生成 JWT
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      user: this.toUserInfo(user),
      token,
    };
  }

  /**
   * 验证 JWT 令牌并获取用户信息
   * @param token - JWT 令牌
   * @returns 验证结果
   */
  async verifyToken(token: string): Promise<VerifyResult> {
    const result = this.jwtService.verify(token);

    if (!result.valid || !result.payload) {
      return {
        valid: false,
        error: result.error,
      };
    }

    // 获取最新用户信息
    const user = await this.userStorage.findById(result.payload.sub);
    if (!user) {
      return {
        valid: false,
        error: 'User not found',
      };
    }

    return {
      valid: true,
      user: this.toUserInfo(user),
    };
  }

  /**
   * 请求密码重置
   * 注意：实际项目中应发送邮件，这里返回令牌仅用于演示
   * @param params - 重置请求参数
   * @returns 重置令牌
   */
  async requestPasswordReset(params: RequestPasswordResetParams): Promise<RequestPasswordResetResult> {
    // 检查用户是否存在
    const user = await this.userStorage.findByEmail(params.email);
    if (!user) {
      // 安全考虑：不暴露用户是否存在
      return {
        resetToken: '',
      };
    }

    // 生成重置令牌
    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 3600000); // 1小时后过期

    this.resetTokens.set(resetToken, {
      email: params.email,
      expiresAt,
    });

    return {
      resetToken,
    };
  }

  /**
   * 重置密码
   * @param params - 重置密码参数
   * @throws 如果令牌无效或已过期
   */
  async resetPassword(params: ResetPasswordParams): Promise<void> {
    const tokenData = this.resetTokens.get(params.resetToken);

    if (!tokenData) {
      throw new Error('Invalid reset token');
    }

    if (tokenData.expiresAt < new Date()) {
      this.resetTokens.delete(params.resetToken);
      throw new Error('Reset token has expired');
    }

    // 哈希新密码
    const passwordHash = await this.passwordHasher.hash(params.newPassword);

    // 查找并更新用户
    const user = await this.userStorage.findByEmail(tokenData.email);
    if (!user) {
      throw new Error('User not found');
    }

    await this.userStorage.update(user.id, { passwordHash });

    // 删除已使用的令牌
    this.resetTokens.delete(params.resetToken);
  }

  /**
   * 从请求头验证令牌
   * @param authHeader - Authorization 头
   * @returns 验证结果
   */
  async verifyFromHeader(authHeader: string | undefined): Promise<VerifyResult> {
    const token = this.jwtService.extractFromHeader(authHeader);
    if (!token) {
      return {
        valid: false,
        error: 'No token provided',
      };
    }

    return this.verifyToken(token);
  }

  /**
   * 将用户实体转换为用户信息（去除敏感信息）
   */
  private toUserInfo(user: User): UserInfo {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    };
  }
}