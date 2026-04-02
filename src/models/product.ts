import { Product, RankingData } from '../types/index.js';

// 创建产品实例
export function createProduct(data: Omit<Product, 'id' | 'collectedAt'>): Product {
  return {
    ...data,
    id: generateId(),
    collectedAt: new Date(),
  };
}

// 生成唯一 ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 产品格式化输出
export function formatProduct(product: Product): string {
  const lines = [
    `### ${product.name}`,
    `- 平台: ${product.platform}`,
    `- 价格: ${product.currency} ${product.price}`,
  ];

  if (product.salesCount) {
    lines.push(`- 销量: ${formatNumber(product.salesCount)}`);
  }
  if (product.rating) {
    lines.push(`- 评分: ${product.rating}/5`);
  }
  if (product.reviewCount) {
    lines.push(`- 评论数: ${formatNumber(product.reviewCount)}`);
  }

  lines.push(`- 分类: ${product.category}`);
  lines.push(`- [查看详情](${product.url})`);

  return lines.join('\n');
}

// 数字格式化
function formatNumber(num: number): string {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  return num.toLocaleString();
}

// 创建排名数据实例
export function createRankingData(
  title: string,
  platform: string,
  category: string,
  products: Product[]
): RankingData {
  return {
    title,
    platform,
    category,
    updatedAt: new Date(),
    products,
  };
}