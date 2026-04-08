/**
 * Stripe 支付模块类型定义
 */

/** 支付配置接口 */
export interface PaymentConfig {
  /** Stripe Secret Key */
  secretKey: string;
  /** Webhook 签名密钥 */
  webhookSecret?: string;
  /** Stripe API 版本 */
  apiVersion?: string;
}

/** 创建支付意图参数 */
export interface CreatePaymentIntentParams {
  /** 金额（最小单位，如分） */
  amount: number;
  /** 货币代码，如 'usd', 'cny' */
  currency: string;
  /** 自定义元数据 */
  metadata?: Record<string, string>;
  /** 收据邮箱 */
  receiptEmail?: string;
  /** 关联的客户 ID */
  customer?: string;
  /** 描述 */
  description?: string;
}

/** 支付意图结果 */
export interface PaymentIntentResult {
  /** PaymentIntent ID */
  id: string;
  /** 客户端密钥（用于前端确认支付） */
  clientSecret: string;
  /** 金额 */
  amount: number;
  /** 货币 */
  currency: string;
  /** 状态 */
  status: string;
  /** 元数据 */
  metadata?: Record<string, string>;
}

/** 创建客户参数 */
export interface CreateCustomerParams {
  /** 邮箱 */
  email: string;
  /** 姓名 */
  name?: string;
  /** 自定义元数据 */
  metadata?: Record<string, string>;
  /** 支付方式 */
  paymentMethod?: string;
}

/** 客户结果 */
export interface CustomerResult {
  id: string;
  email: string;
  name?: string;
}

/** Webhook 事件结果 */
export interface WebhookResult {
  /** 事件 ID */
  id: string;
  /** 事件类型 */
  type: string;
  /** 事件数据 */
  data: unknown;
}

/** 支付意图事件数据 */
export interface PaymentIntentEventData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  metadata?: Record<string, string>;
  customer?: string;
  receipt_email?: string;
}

/** 获取支付意图参数 */
export interface GetPaymentIntentParams {
  /** PaymentIntent ID */
  id: string;
}

/** 取消支付意图参数 */
export interface CancelPaymentIntentParams {
  /** PaymentIntent ID */
  id: string;
  /** 取消原因 */
  cancellationReason?: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'abandoned';
}

/** 退款参数 */
export interface CreateRefundParams {
  /** PaymentIntent ID */
  paymentIntentId: string;
  /** 退款金额（可选，不填则全额退款） */
  amount?: number;
  /** 退款原因 */
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'expired_unclaimed_funds';
}

/** 退款结果 */
export interface RefundResult {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentIntentId: string;
}