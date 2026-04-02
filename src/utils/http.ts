import axios, { AxiosInstance } from 'axios';

// 创建 HTTP 客户端
export function createHttpClient(baseUrl: string, timeout: number = 30000): AxiosInstance {
  return axios.create({
    baseURL: baseUrl,
    timeout,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });
}

// 带重试的请求
export async function fetchWithRetry(
  client: AxiosInstance,
  url: string,
  retries: number = 3
): Promise<string> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await client.get(url);
      return response.data;
    } catch (error) {
      lastError = error as Error;
      console.warn(`请求失败，第 ${i + 1} 次重试...`);
      await sleep(1000 * (i + 1));
    }
  }

  throw lastError || new Error('请求失败');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}