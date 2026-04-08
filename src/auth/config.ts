import { z } from 'zod';
import type { AuthConfig } from './types.js';

const authConfigSchema = z.object({
  jwtSecret: z.string().min(16, 'JWT secret must be at least 16 characters'),
  jwtExpiresIn: z.string().default('7d'),
  jwtIssuer: z.string().optional(),
  bcryptRounds: z.number().int().min(10).max(15).default(12),
});

/**
 * 从环境变量创建认证配置
 * @param env - 环境变量对象，默认使用 process.env
 * @returns 验证后的认证配置
 */
export function createAuthConfig(env?: NodeJS.ProcessEnv): AuthConfig {
  const config = {
    jwtSecret: env?.JWT_SECRET || '',
    jwtExpiresIn: env?.JWT_EXPIRES_IN || '7d',
    jwtIssuer: env?.JWT_ISSUER,
    bcryptRounds: env?.BCRYPT_ROUNDS ? parseInt(env.BCRYPT_ROUNDS, 10) : 12,
  };
  return authConfigSchema.parse(config);
}

export { authConfigSchema };