import jwt from 'jsonwebtoken';
import type { JwtPayload, VerifyTokenResult } from './types.js';

/**
 * JWT 令牌工具类
 * 处理 JWT 的签名、验证和解析
 */
export class JwtService {
  private secret: string;
  private expiresIn: string;
  private issuer?: string;

  /**
   * 创建 JWT 服务实例
   * @param secret - JWT 密钥
   * @param expiresIn - 过期时间，默认 '7d'
   * @param issuer - 签发者（可选）
   */
  constructor(secret: string, expiresIn: string = '7d', issuer?: string) {
    this.secret = secret;
    this.expiresIn = expiresIn;
    this.issuer = issuer;
  }

  /**
   * 生成 JWT 令牌
   * @param payload - 令牌载荷
   * @returns JWT 字符串
   */
  sign(payload: Omit<JwtPayload, 'iat' | 'exp' | 'iss'>): string {
    const signOptions: jwt.SignOptions = {
      expiresIn: this.expiresIn,
    };

    if (this.issuer) {
      signOptions.issuer = this.issuer;
    }

    return jwt.sign(payload, this.secret, signOptions);
  }

  /**
   * 验证并解析 JWT 令牌
   * @param token - JWT 字符串
   * @returns 验证结果
   */
  verify(token: string): VerifyTokenResult {
    try {
      const payload = jwt.verify(token, this.secret, {
        issuer: this.issuer,
      }) as JwtPayload;

      return {
        valid: true,
        payload,
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid token',
      };
    }
  }

  /**
   * 解析 JWT 令牌（不验证签名）
   * @param token - JWT 字符串
   * @returns 载荷对象
   */
  decode(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload | null;
    } catch {
      return null;
    }
  }

  /**
   * 从 Authorization 头提取令牌
   * @param authHeader - Authorization 头值
   * @returns JWT 令牌或 null
   */
  extractFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return null;
    }

    return parts[1];
  }
}