/**
 * 认证模块类型定义
 */

/** 认证配置接口 */
export interface AuthConfig {
  /** JWT 密钥 */
  jwtSecret: string;
  /** JWT 过期时间（如 '1h', '7d', '30d'） */
  jwtExpiresIn?: string;
  /** JWT 签发者 */
  jwtIssuer?: string;
  /** 密码哈希轮数（bcrypt cost factor，默认 12） */
  bcryptRounds?: number;
}

/** 用户数据接口（用于存储和返回） */
export interface User {
  /** 用户 ID */
  id: string;
  /** 邮箱 */
  email: string;
  /** 用户名（可选） */
  username?: string;
  /** 哈希后的密码 */
  passwordHash: string;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}

/** 用户信息接口（不含敏感信息） */
export interface UserInfo {
  id: string;
  email: string;
  username?: string;
  createdAt: Date;
}

/** 注册参数 */
export interface RegisterParams {
  /** 邮箱 */
  email: string;
  /** 密码 */
  password: string;
  /** 用户名（可选） */
  username?: string;
}

/** 注册结果 */
export interface RegisterResult {
  /** 用户信息 */
  user: UserInfo;
  /** JWT 令牌 */
  token: string;
}

/** 登录参数 */
export interface LoginParams {
  /** 邮箱 */
  email: string;
  /** 密码 */
  password: string;
}

/** 登录结果 */
export interface LoginResult {
  /** 用户信息 */
  user: UserInfo;
  /** JWT 令牌 */
  token: string;
}

/** JWT 载荷 */
export interface JwtPayload {
  /** 用户 ID */
  sub: string;
  /** 邮箱 */
  email: string;
  /** 签发时间 */
  iat: number;
  /** 过期时间 */
  exp: number;
  /** 签发者 */
  iss?: string;
}

/** 密码重置请求参数 */
export interface RequestPasswordResetParams {
  /** 邮箱 */
  email: string;
}

/** 密码重置请求结果 */
export interface RequestPasswordResetResult {
  /** 重置令牌（实际项目中应发送邮件而非返回令牌） */
  resetToken: string;
}

/** 重置密码参数 */
export interface ResetPasswordParams {
  /** 重置令牌 */
  resetToken: string;
  /** 新密码 */
  newPassword: string;
}

/** 用户存储接口（供使用者实现） */
export interface UserStorage {
  /** 根据邮箱查找用户 */
  findByEmail(email: string): Promise<User | null>;
  /** 根据 ID 查找用户 */
  findById(id: string): Promise<User | null>;
  /** 创建用户 */
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  /** 更新用户 */
  update(id: string, updates: Partial<User>): Promise<User>;
  /** 检查邮箱是否已存在 */
  existsByEmail(email: string): Promise<boolean>;
}

/** 验证结果 */
export interface VerifyResult {
  /** 是否有效 */
  valid: boolean;
  /** 用户信息（验证通过时） */
  user?: UserInfo;
  /** 错误信息（验证失败时） */
  error?: string;
}

/** JWT 验证结果 */
export interface VerifyTokenResult {
  /** 是否有效 */
  valid: boolean;
  /** 载荷（验证通过时） */
  payload?: JwtPayload;
  /** 错误信息（验证失败时） */
  error?: string;
}