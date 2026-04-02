import { Product, CollectorConfig } from '../types/index.js';

// 采集器基类
export abstract class BaseCollector {
  protected config: CollectorConfig;

  constructor(config: CollectorConfig) {
    this.config = config;
  }

  // 采集方法（子类实现）
  abstract collect(category?: string, limit?: number): Promise<Product[]>;

  // 获取平台名称
  getPlatform(): string {
    return this.config.platform;
  }

  // 验证采集结果
  protected validateProducts(products: Product[]): Product[] {
    return products.filter(p => {
      if (!p.name || !p.price || !p.url) {
        return false;
      }
      return true;
    });
  }
}

// 采集器接口
export interface ICollector {
  collect(category?: string, limit?: number): Promise<Product[]>;
  getPlatform(): string;
}