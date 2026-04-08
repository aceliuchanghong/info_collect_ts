import { z } from 'zod';
import type { PaymentConfig } from './types.js';

const paymentConfigSchema = z.object({
  secretKey: z.string().min(1, 'Stripe secret key is required'),
  webhookSecret: z.string().optional(),
  apiVersion: z.string().optional(),
});

/**
 * 从环境变量创建支付配置
 * @param env - 环境变量对象，默认使用 process.env
 * @returns 验证后的支付配置
 */
export function createPaymentConfig(env?: NodeJS.ProcessEnv): PaymentConfig {
  const config = {
    secretKey: env?.STRIPE_SECRET_KEY || '',
    webhookSecret: env?.STRIPE_WEBHOOK_SECRET,
    apiVersion: env?.STRIPE_API_VERSION,
  };
  return paymentConfigSchema.parse(config);
}

export { paymentConfigSchema };