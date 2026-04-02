import { collectFromAll } from './collectors/index.js';
import { createRankingData } from './models/product.js';
import { LLMService } from './services/llm.js';
import { saveMarkdown, saveJson } from './services/storage.js';
import { config } from './config/index.js';

async function main() {
  console.log('🚀 开始采集畅销产品信息...\n');

  try {
    // 1. 采集数据
    const products = await collectFromAll('Electronics', 10);
    console.log(`✅ 采集到 ${products.length} 个产品\n`);

    // 2. 创建排名数据
    const rankingData = createRankingData(
      'Amazon 电子类畅销产品',
      'Amazon',
      'Electronics',
      products
    );

    // 3. 生成 Markdown
    const llmService = new LLMService({
      apiKey: config.llmApiKey || '',
      baseUrl: config.llmBaseUrl,
    });

    const markdown = await llmService.generateMarkdown(rankingData);

    // 4. 保存文件
    const timestamp = new Date().toISOString().split('T')[0];
    const mdFile = saveMarkdown(`ranking-${timestamp}.md`, markdown);
    const jsonFile = saveJson(`ranking-${timestamp}.json`, rankingData);

    console.log('📄 文件已生成:');
    console.log(`   - ${mdFile}`);
    console.log(`   - ${jsonFile}`);

  } catch (error) {
    console.error('❌ 执行出错:', error);
    process.exit(1);
  }
}

main();