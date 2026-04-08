import Stripe from 'stripe';
import type {
  PaymentConfig,
  CreatePaymentIntentParams,
  PaymentIntentResult,
  CreateCustomerParams,
  CustomerResult,
  WebhookResult,
  CancelPaymentIntentParams,
  CreateRefundParams,
  RefundResult,
} from './types.js';
import { createPaymentConfig } from './config.js';

// Stripe 实例类型
type StripeClient = ReturnType<typeof Stripe>;

/**
 * Stripe 支付服务类
 * 提供支付意图创建、确认、取消、退款及 Webhook 验证等功能
 */
export class StripePayment {
  private stripe: StripeClient;
  private config: PaymentConfig;

  /**
   * 创建 StripePayment 实例
   * @param config - 支付配置，不传则从环境变量读取
   */
  constructor(config?: PaymentConfig) {
    this.config = config || createPaymentConfig(process.env);
    // 使用类型断言解决 Stripe ESM 类型的兼容性问题
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const StripeConstructor = Stripe as any;
    this.stripe = new StripeConstructor(this.config.secretKey, {
      apiVersion: '2024-11-20.Acacia',
    }) as StripeClient;
  }

  /**
   * 创建支付意图
   * @param params - 支付意图参数
   * @returns 支付意图结果
   */
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    const intent = await this.stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency,
      metadata: params.metadata,
      receipt_email: params.receiptEmail,
      customer: params.customer,
      description: params.description,
    });

    return {
      id: intent.id,
      clientSecret: intent.client_secret!,
      amount: intent.amount,
      currency: intent.currency,
      status: intent.status,
      metadata: intent.metadata ?? undefined,
    };
  }

  /**
   * 获取支付意图
   * @param id - PaymentIntent ID
   * @returns 支付意图结果
   */
  async getPaymentIntent(id: string): Promise<PaymentIntentResult> {
    const intent = await this.stripe.paymentIntents.retrieve(id);

    return {
      id: intent.id,
      clientSecret: intent.client_secret!,
      amount: intent.amount,
      currency: intent.currency,
      status: intent.status,
      metadata: intent.metadata ?? undefined,
    };
  }

  /**
   * 确认支付意图（用于服务端确认）
   * @param id - PaymentIntent ID
   * @param paymentMethod - 支付方式 ID（可选）
   * @returns 支付意图结果
   */
  async confirmPaymentIntent(
    id: string,
    paymentMethod?: string
  ): Promise<PaymentIntentResult> {
    const intent = await this.stripe.paymentIntents.confirm(id, {
      payment_method: paymentMethod,
    });

    return {
      id: intent.id,
      clientSecret: intent.client_secret!,
      amount: intent.amount,
      currency: intent.currency,
      status: intent.status,
      metadata: intent.metadata ?? undefined,
    };
  }

  /**
   * 取消支付意图
   * @param params - 取消参数
   * @returns 支付意图结果
   */
  async cancelPaymentIntent(params: CancelPaymentIntentParams): Promise<PaymentIntentResult> {
    const intent = await this.stripe.paymentIntents.cancel(params.id, {
      cancellation_reason: params.cancellationReason,
    });

    return {
      id: intent.id,
      clientSecret: intent.client_secret!,
      amount: intent.amount,
      currency: intent.currency,
      status: intent.status,
      metadata: intent.metadata ?? undefined,
    };
  }

  /**
   * 创建退款
   * @param params - 退款参数
   * @returns 退款结果
   */
  async createRefund(params: CreateRefundParams): Promise<RefundResult> {
    const refund = await this.stripe.refunds.create({
      payment_intent: params.paymentIntentId,
      amount: params.amount,
      reason: params.reason as 'duplicate' | 'fraudulent' | 'requested_by_customer' | undefined,
    });

    return {
      id: refund.id,
      amount: refund.amount,
      currency: refund.currency,
      status: refund.status ?? 'unknown',
      paymentIntentId: params.paymentIntentId,
    };
  }

  /**
   * 创建客户
   * @param params - 客户参数
   * @returns 客户结果
   */
  async createCustomer(params: CreateCustomerParams): Promise<CustomerResult> {
    const customer = await this.stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: params.metadata,
      payment_method: params.paymentMethod,
    });

    return {
      id: customer.id,
      email: customer.email || params.email,
      name: customer.name ?? undefined,
    };
  }

  /**
   * 获取客户
   * @param id - Customer ID
   * @returns 客户结果
   */
  async getCustomer(id: string): Promise<CustomerResult> {
    const customer = await this.stripe.customers.retrieve(id);

    if (customer.deleted) {
      throw new Error(`Customer ${id} has been deleted`);
    }

    return {
      id: customer.id,
      email: customer.email || '',
      name: customer.name ?? undefined,
    };
  }

  /**
   * 验证 Webhook 签名并解析事件
   * @param payload - 原始请求体（字符串或 Buffer）
   * @param signature - Stripe-Signature 头
   * @returns Webhook 事件结果
   * @throws 如果签名验证失败
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string): WebhookResult {
    if (!this.config.webhookSecret) {
      throw new Error('Webhook secret is not configured');
    }

    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.config.webhookSecret
    );

    return {
      id: event.id,
      type: event.type,
      data: event.data.object,
    };
  }

  /**
   * 解析支付意图事件数据
   * @param data - Webhook 事件的 data.object
   * @returns 支付意图事件数据
   */
  parsePaymentIntentData(data: unknown): PaymentIntentResult {
    const intent = data as {
      id: string;
      client_secret: string | null;
      amount: number;
      currency: string;
      status: string;
      metadata: Record<string, string> | null;
    };
    return {
      id: intent.id,
      clientSecret: intent.client_secret!,
      amount: intent.amount,
      currency: intent.currency,
      status: intent.status,
      metadata: intent.metadata ?? undefined,
    };
  }
}