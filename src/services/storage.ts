import * as fs from 'fs';
import * as path from 'path';
import { RankingData } from '../types/index.js';

const OUTPUT_DIR = path.join(process.cwd(), 'output');

// 确保输出目录存在
function ensureOutputDir(): void {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

// 保存 MD 文件
export function saveMarkdown(filename: string, content: string): string {
  ensureOutputDir();
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, content, 'utf-8');
  return filepath;
}

// 保存 JSON 文件
export function saveJson(filename: string, data: RankingData): string {
  ensureOutputDir();
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  return filepath;
}

// 读取最近的数据
export function loadLatestJson(): RankingData | null {
  ensureOutputDir();
  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    return null;
  }

  const latestFile = files.sort().pop()!;
  const filepath = path.join(OUTPUT_DIR, latestFile);
  const content = fs.readFileSync(filepath, 'utf-8');

  return JSON.parse(content) as RankingData;
}