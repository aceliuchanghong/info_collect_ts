import { AmazonCollector } from './amazon.js';
import { Product } from '../types/index.js';

export { BaseCollector } from './base.js';
export { AmazonCollector } from './amazon.js';

// 注册的采集器列表
const collectors = [new AmazonCollector()];

// 获取所有采集器
export function getCollectors() {
  return collectors;
}

// 从所有平台采集数据
export async function collectFromAll(
  category?: string,
  limit?: number
): Promise<Product[]> {
  const results = await Promise.all(
    collectors.map(c => c.collect(category, limit))
  );
  return results.flat();
}

// 从指定平台采集数据
export async function collectFromPlatform(
  platform: string,
  category?: string,
  limit?: number
): Promise<Product[]> {
  const collector = collectors.find(
    c => c.getPlatform().toLowerCase() === platform.toLowerCase()
  );

  if (!collector) {
    throw new Error(`未找到平台: ${platform}`);
  }

  return collector.collect(category, limit);
}