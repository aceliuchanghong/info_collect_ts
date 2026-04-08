/**
 * 认证模块
 * 独立、可复用的登录注册组件
 */

// 导出主服务类
export { AuthService } from './auth-service.js';

// 导出工具类
export { PasswordHasher } from './password.js';
export { JwtService } from './jwt.js';

// 导出配置工厂
export { createAuthConfig, authConfigSchema } from './config.js';

// 导出类型
export type {
  AuthConfig,
  User,
  UserInfo,
  RegisterParams,
  RegisterResult,
  LoginParams,
  LoginResult,
  JwtPayload,
  UserStorage,
  VerifyResult,
  VerifyTokenResult,
  RequestPasswordResetParams,
  RequestPasswordResetResult,
  ResetPasswordParams,
} from './types.js';