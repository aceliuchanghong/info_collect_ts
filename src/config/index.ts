import * as dotenv from 'dotenv';
import { z } from 'zod';

// 加载环境变量
dotenv.config();

// 配置 Schema
const configSchema = z.object({
  llmApiKey: z.string().optional(),
  llmBaseUrl: z.string().url().optional(),
  requestTimeout: z.coerce.number().default(30000),
});

// 配置类型
export type Config = z.infer<typeof configSchema>;

// 获取配置
export function getConfig(): Config {
  return configSchema.parse({
    llmApiKey: process.env.LLM_API_KEY,
    llmBaseUrl: process.env.LLM_BASE_URL,
    requestTimeout: process.env.REQUEST_TIMEOUT,
  });
}

// 导出配置实例
export const config = getConfig();