// 产品信息类型
export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  salesCount?: number;
  rating?: number;
  reviewCount?: number;
  category: string;
  platform: string;
  url: string;
  imageUrl?: string;
  collectedAt: Date;
}

// 排名数据类型
export interface RankingData {
  title: string;
  description?: string;
  platform: string;
  category: string;
  updatedAt: Date;
  products: Product[];
}

// 采集器配置类型
export interface CollectorConfig {
  platform: string;
  baseUrl: string;
  timeout?: number;
  retries?: number;
}

// 大模型生成配置
export interface LLMConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}