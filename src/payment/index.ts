/**
 * Stripe 支付模块
 * 独立、可复用的 Stripe 支付组件
 */

// 导出主服务类
export { StripePayment } from './stripe-payment.js';

// 导出配置工厂
export { createPaymentConfig, paymentConfigSchema } from './config.js';

// 导出类型
export type {
  PaymentConfig,
  CreatePaymentIntentParams,
  PaymentIntentResult,
  CreateCustomerParams,
  CustomerResult,
  WebhookResult,
  PaymentIntentEventData,
  GetPaymentIntentParams,
  CancelPaymentIntentParams,
  CreateRefundParams,
  RefundResult,
} from './types.js';