# Stripe 支付模块

独立、可复用的 Stripe 支付组件，支持快速集成到任意 TypeScript 项目。

## 特性

- 自包含，不依赖项目其他模块
- 支持环境变量和手动配置两种方式
- 完整类型定义
- Zod 配置验证

## 安装依赖

```bash
npm install stripe zod
```

## 环境变量

```env
STRIPE_SECRET_KEY=sk_test_xxx        # 必填：Stripe Secret Key
STRIPE_WEBHOOK_SECRET=whsec_xxx      # 可选：Webhook 签名密钥
STRIPE_API_VERSION=2024-11-20.Acacia # 可选：API 版本
```

## 快速开始

### 使用环境变量配置

```typescript
import { StripePayment } from './payment/index.js';

// 自动从 process.env 读取配置
const payment = new StripePayment();
```

### 手动配置

```typescript
import { StripePayment, createPaymentConfig } from './payment/index.js';

const config = createPaymentConfig({
  STRIPE_SECRET_KEY: 'sk_test_xxx',
  STRIPE_WEBHOOK_SECRET: 'whsec_xxx',
});

const payment = new StripePayment(config);

// 或直接传入
const payment = new StripePayment({
  secretKey: 'sk_test_xxx',
  webhookSecret: 'whsec_xxx',
});
```

## API

### 创建支付意图

```typescript
const result = await payment.createPaymentIntent({
  amount: 2000,        // $20.00 (单位：分)
  currency: 'usd',     // 货币
  metadata: { orderId: '123' },  // 可选元数据
  receiptEmail: 'user@example.com', // 可选收据邮箱
});

console.log(result.clientSecret); // 发送给前端使用
```

### 获取支付意图

```typescript
const result = await payment.getPaymentIntent('pi_xxx');
console.log(result.status); // requires_payment_method, succeeded, etc.
```

### 取消支付意图

```typescript
await payment.cancelPaymentIntent({
  id: 'pi_xxx',
  cancellationReason: 'requested_by_customer',
});
```

### 创建退款

```typescript
// 全额退款
const refund = await payment.createRefund({
  paymentIntentId: 'pi_xxx',
});

// 部分退款
const refund = await payment.createRefund({
  paymentIntentId: 'pi_xxx',
  amount: 1000, // 退款 $10.00
  reason: 'requested_by_customer',
});
```

### 客户管理

```typescript
// 创建客户
const customer = await payment.createCustomer({
  email: 'user@example.com',
  name: 'John Doe',
  metadata: { userId: '123' },
});

// 获取客户
const customer = await payment.getCustomer('cus_xxx');
```

### Webhook 验证

```typescript
import express from 'express';
import { StripePayment } from './payment/index.js';

const app = express();
const payment = new StripePayment();

// 必须使用 raw body 解析
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const event = payment.verifyWebhookSignature(
      req.body,
      req.headers['stripe-signature'] as string
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = payment.parsePaymentIntentData(event.data);
        console.log('Payment succeeded:', paymentIntent.id);
        // 更新订单状态...
        break;

      case 'payment_intent.payment_failed':
        console.log('Payment failed');
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).json({ error: 'Invalid signature' });
  }
});
```

## 复制到其他项目

1. 复制整个 `src/payment/` 目录
2. 安装依赖：`npm install stripe zod`
3. 配置环境变量或手动传入配置
4. 开始使用

## 类型导出

```typescript
import type {
  PaymentConfig,
  CreatePaymentIntentParams,
  PaymentIntentResult,
  WebhookResult,
  CreateCustomerParams,
  CustomerResult,
  CancelPaymentIntentParams,
  CreateRefundParams,
  RefundResult,
} from './payment/index.js';
```