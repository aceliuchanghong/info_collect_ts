import { RankingData } from '../types/index.js';
import { formatProduct } from '../models/product.js';

// 大模型服务配置
interface LLMServiceConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

// 大模型服务（用于生成 MD 文档）
export class LLMService {
  private config: LLMServiceConfig;

  constructor(config: LLMServiceConfig) {
    this.config = config;
  }

  // 生成 Markdown 文档
  async generateMarkdown(data: RankingData): Promise<string> {
    const header = this.generateHeader(data);
    const productsMd = data.products.map(p => formatProduct(p)).join('\n\n');
    const footer = this.generateFooter(data);

    return `${header}\n\n${productsMd}\n\n${footer}`;
  }

  // 使用大模型增强文档（可选）
  async enhanceWithLLM(content: string): Promise<string> {
    // TODO: 实际调用大模型 API 进行内容增强
    // 目前先返回原内容，后续可接入真实的大模型 API
    // 示例：调用 Claude API 进行摘要生成、趋势分析等

    return content;
  }

  // 生成文档头部
  private generateHeader(data: RankingData): string {
    const date = data.updatedAt.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return [
      `# ${data.title}`,
      '',
      `> 平台: ${data.platform} | 分类: ${data.category} | 更新时间: ${date}`,
      '',
      data.description || '',
      '',
      '---',
      '',
      '## 畅销产品列表',
      '',
    ].join('\n');
  }

  // 生成文档尾部
  private generateFooter(data: RankingData): string {
    return [
      '---',
      '',
      '### 数据说明',
      `- 数据来源: ${data.platform}`,
      `- 采集时间: ${data.updatedAt.toISOString()}`,
      `- 产品数量: ${data.products.length}`,
      '',
      '> 本文档由自动采集程序生成，仅供参考。',
    ].join('\n');
  }
}